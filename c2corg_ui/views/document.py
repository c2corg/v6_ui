import re

from dogpile.cache.api import NO_VALUE

from c2corg_ui import http_requests
from c2corg_ui.caching import cache_document_detail, CachedPage, \
    cache_document_archive, CACHE_VERSION
from c2corg_ui.diff.differ import diff_documents
from shapely.geometry import asShape
from shapely.ops import transform
from functools import partial
from urllib.parse import urlencode
import pyproj
import json
import logging
from c2corg_common.attributes import default_langs

from pyramid.httpexceptions import (
    HTTPBadRequest, HTTPNotFound, HTTPInternalServerError)

from c2corg_ui.views import etag_cache

log = logging.getLogger(__name__)

IF_NONE_MATCH = re.compile('(?:W/)?(?:"([^"]*)",?\s*)')


class Document(object):

    # set in inheriting classes
    _API_ROUTE = None

    # FIXME sync with API => use a CONSTANT in c2corg_common?
    _DEFAULT_FILTERS = {
        'limit': 30
    }

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings
        self.debug = 'debug' in self.request.params
        self.template_input = {
            'debug': self.debug,
            'api_url': self.settings['api_url'],
            'ign_api_key': self.settings['ign_api_key'],
            'bing_api_key': self.settings['bing_api_key'],
            'image_backend_url': self.settings['image_backend_url'],
            'image_url': self.settings['image_url']
        }

    def _get_or_create_detail(self, id, lang, render_page):
        """ Returns a detail page for a document

         If the document page is currently in the cache, and the version in
         the API and the code version has not changed, the page is served
         from the cache. Otherwise the page is rendered and cached.

         If the request includes an ETag and the provided ETag equals the
         current version, "304 Not Modified" is returned.
        """
        def load_data(old_api_cache_key=None):
            not_modified, api_cache_key, document_and_locale = \
                self._get_document(id, lang, old_api_cache_key)
            return not_modified, api_cache_key, document_and_locale

        return self._get_or_create(
            (id, lang), cache_document_detail, load_data, render_page,
            self._get_cache_key)

    def _get_or_create_archive(self, id, lang, version_id, render_page):
        """ Returns an archived version of a document.
         The response is cached and ETags are handled.
        """
        def load_data(old_api_cache_key=None):
            not_modified, api_cache_key, document_locale_version = \
                self._get_archived_document(
                    id, lang, version_id, old_api_cache_key)
            return not_modified, api_cache_key, document_locale_version

        return self._get_or_create(
            (id, lang, version_id), cache_document_archive, load_data,
            render_page, self._get_cache_key_archive)

    def _get_or_create(
            self, request_data, cache, load_data, render_page, get_cache_key):
        if self.debug:
            # do not cache when in debug mode
            _, _, loaded_data = load_data()
            return self._get_response(render_page(*loaded_data))

        cache_key = get_cache_key(*request_data)

        # try to get a rendered page from the cache
        cached_page = cache.get(cache_key, ignore_expiration=True)

        old_api_cache_key = cached_page.api_cache_key \
            if cached_page != NO_VALUE else None

        # request the document from the api. if there was an entry in the
        # cache, set the `If-None-Match` header with the last ETag. if the
        # document version on the api has not changed, `not modified` will
        # be returned.
        not_modified, api_cache_key, loaded_data = load_data(old_api_cache_key)

        ui_etag_key = self._get_etag_key(api_cache_key)
        if not_modified:
            # the cached page is still valid
            log.debug('Serving from cache {0}'.format(cache_key))
            etag_cache(self.request, ui_etag_key)
            return self._get_response(cached_page.page_html)
        else:
            # there is a new version from the api, render the page
            page_html = render_page(*loaded_data)

            cache.set(cache_key, CachedPage(api_cache_key, page_html))

            etag_cache(self.request, ui_etag_key)

            return self._get_response(page_html)

    def _call_api(self, url, headers=None):
        settings = self.settings
        if 'api_url_internal' in settings and settings['api_url_internal']:
            api_url = settings['api_url_internal']
            if 'api_url_host' in settings and settings['api_url_host']:
                headers = {} if headers is None else headers
                headers['Host'] = settings['api_url_host']
        else:
            api_url = settings['api_url']
        url = '%s/%s' % (api_url, url)
        if log.isEnabledFor(logging.DEBUG):
            log.debug('API: %s %s', 'GET', url)
        try:
            resp = http_requests.session.get(url, headers=headers)

            if resp.status_code == 304:
                # no content for 'not modified'
                return resp, {}
            else:
                return resp, resp.json()
        except Exception:
            log.error('Request failed: {0}'.format(url), exc_info=1)
            return resp, {}

    def _validate_id_lang(self):
        if 'id' not in self.request.matchdict:
            # eg. creating a new document
            return None, None

        id = self._validate_int('id')
        lang = self._validate_lang()

        return id, lang

    def _validate_lang(self):
        lang = str(self.request.matchdict['lang'])
        if lang not in default_langs:
            raise HTTPBadRequest("Incorrect lang")
        return lang

    def _validate_int(self, field):
        try:
            return int(self.request.matchdict[field])
        except Exception:
            raise HTTPBadRequest("Incorrect " + field)

    def _get_document(self, id, lang, old_api_cache_key=None):
        url = '%s/%d?l=%s' % (self._API_ROUTE, id, lang)
        not_modified, api_cache_key, document = self._get_with_etag(
            url, old_api_cache_key)

        if not_modified:
            return not_modified, api_cache_key, None

        # When requesting a lang that does not exist yet, the API sends
        # back an empty list as 'locales'
        if not document['locales']:
            raise HTTPNotFound('Requested lang does not exist')

        # We need to pass locale data to Mako as a dedicated object to make it
        # available to the parent templates:
        locale = document['locales'][0]

        return False, api_cache_key, (document, locale)

    def _get_archived_document(
            self, id, lang, version_id, old_api_cache_key=None):
        url = '%s/%d/%s/%d' % (self._API_ROUTE, id, lang, version_id)
        not_modified, api_cache_key, content = self._get_with_etag(
            url, old_api_cache_key)

        if not_modified:
            return not_modified, api_cache_key, None

        document = content['document']
        version = content['version']
        locale = document['locales'][0]

        return False, api_cache_key, (document, locale, version)

    def _get_with_etag(self, url, old_api_cache_key=None):
        headers = None
        if old_api_cache_key:
            headers = {'If-None-Match': 'W/"{0}"'.format(old_api_cache_key)}

        resp, document = self._call_api(url, headers)

        api_cache_key = None
        if resp.headers.get('ETag'):
            api_cache_key = self._get_api_cache_key_from_etag(
                resp.headers.get('ETag'))

        if resp.status_code in [200, 304] and not api_cache_key:
            log.warn('no etag found for {0}'.format(url))

        if resp.status_code == 404:
            raise HTTPNotFound()
        elif resp.status_code == 304:
            return True, api_cache_key, None
        elif resp.status_code != 200:
            raise HTTPInternalServerError(
                "An error occurred while loading the document")

        return False, api_cache_key, document

    def _get_documents(self):
        params = []
        lang = self.request.cookies.get('interface_lang', 'fr')
        params.append(('pl', lang))
        # Inject default list filters params:
        filters = dict(self._DEFAULT_FILTERS, **{k: v for k, v in params})

        # query_string contains filter params using the standard URL format
        # (eg. ?offset=50&limit=20&elevation=>2000).
        query_string = '?' + urlencode(params) if params else ''
        url = '%s%s' % (self._API_ROUTE, query_string)
        resp, content = self._call_api(url)

        if resp.status_code == 200:
            documents = content['documents']
            total = content['total']
        else:
            raise HTTPInternalServerError(
                "An error occured while loading the results")
        return documents, total, filters, lang

    def _get_history(self):
        id, lang = self._validate_id_lang()
        url = 'document/%d/history/%s' % (id, lang)
        resp, content = self._call_api(url)
        # TODO: better error handling
        if resp.status_code == 200:
            versions = content['versions']
            title = content['title']
            self.template_input.update({
                'module': self._API_ROUTE,
                'document_versions': versions,
                'lang': lang,
                'title': title,
                'document_id': id
            })
            return self.template_input
        else:
            raise HTTPNotFound()

    def _get_geometry(self, data):
        return asShape(json.loads(data)) if data else None

    def _transform(self, geometry, source_epsg, dest_epsg):
        source_proj = pyproj.Proj(init=source_epsg)
        dest_proj = pyproj.Proj(init=dest_epsg)
        project = partial(pyproj.transform, source_proj, dest_proj)
        return transform(project, geometry)

    def _diff(self):
        id = self._validate_int('id')
        lang = self._validate_lang()
        v1 = self._validate_int('v1')
        v2 = self._validate_int('v2')

        url = '%s/%d/%s/%d' % (self._API_ROUTE, id, lang, v1)
        resp_v1, content_v1 = self._call_api(url)

        url = '%s/%d/%s/%d' % (self._API_ROUTE, id, lang, v2)
        resp_v2, content_v2 = self._call_api(url)

        # TODO: better error handling
        if resp_v1.status_code == 200 and resp_v2.status_code == 200:
            version1 = content_v1['version']
            doc_v1 = content_v1['document']
            version2 = content_v2['version']
            doc_v2 = content_v2['document']
            field_diffs = diff_documents(doc_v1, doc_v2)

            self.template_input.update({
                'module': self._API_ROUTE,
                'lang': lang,
                'title': doc_v1['locales'][0]['title'],
                'document_id': id,
                'v1_id': v1,
                'v2_id': v2,
                'diffs': field_diffs,
                'version1': version1,
                'version2': version2,
                'geometry1': doc_v1['geometry']['geom']
                if doc_v1['geometry'] else None,
                'geometry2': doc_v2['geometry']['geom']
                if doc_v2['geometry'] else None,
                'previous_version_id': content_v1['previous_version_id'],
                'next_version_id': content_v2['next_version_id']
            })
            return self.template_input

        raise HTTPNotFound()

    def _get_cache_key(self, id, lang):
        return '{0}-{1}-{2}'.format(id, lang, CACHE_VERSION)

    def _get_cache_key_archive(self, id, lang, version_id):
        return '{0}-{1}-{2}-{3}'.format(id, lang, version_id, CACHE_VERSION)

    def _get_etag_key(self, api_cache_key):
        return '{0}-{1}'.format(api_cache_key, CACHE_VERSION)

    def _get_api_cache_key_from_etag(self, etag):
        if_none_matches = IF_NONE_MATCH.findall(etag)

        if if_none_matches:
            return if_none_matches[0]

    def _get_response(self, page_html):
        self.request.response.text = page_html
        return self.request.response
