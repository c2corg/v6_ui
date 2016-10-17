import re

from dogpile.cache.api import NO_VALUE
from pyramid.renderers import render

from c2corg_ui import http_requests
from c2corg_ui.caching import cache_document_detail, CachedPage, \
    cache_document_archive, CACHE_VERSION, cache_document_history, \
    cache_document_diff
from c2corg_ui.diff.differ import diff_documents
from shapely.geometry import asShape
from shapely.ops import transform
from functools import partial
from urllib.parse import urlencode
from slugify import slugify
import pyproj
import json
import logging
from c2corg_common.attributes import default_langs, langs_priority

from pyramid.httpexceptions import (
    HTTPBadRequest, HTTPNotFound, HTTPInternalServerError,
    HTTPMovedPermanently, HTTPFound)

from c2corg_ui.views import etag_cache, get_response, get_or_create_page

log = logging.getLogger(__name__)

IF_NONE_MATCH = re.compile('(?:W/)?(?:"([^"]*)",?\s*)')


class Document(object):

    # set in inheriting classes
    _API_ROUTE = None

    # FIXME sync with API => use a CONSTANT in c2corg_common?
    _DEFAULT_FILTERS = {
        'limit': 30
    }

    _DEFAULT_LANG = 'fr'

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings
        self.debug = 'debug' in self.request.params
        self.template_input = {
            'debug': self.debug,
            'api_url': self.settings['api_url'],
            'ign_api_key': self.settings['ign_api_key'],
            'bing_api_key': self.settings['bing_api_key'],
            'ganalytics_key': self.settings['ganalytics_key'],
            'image_backend_url': self.settings['image_backend_url'],
            'image_url': self.settings['image_url'],
            'discourse_url': self.settings['discourse_url']
        }

    def _index(self, template):
        return get_or_create_page(
            self._API_ROUTE,
            template,
            self.template_input,
            self.request,
            self.debug
        )

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
            self, request_data, cache, load_data, render_page, get_cache_key,
            get_etag_key=None):
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

        ui_etag_key = get_etag_key(api_cache_key) if get_etag_key else \
            self._get_etag_key(api_cache_key)
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
        resp = None
        try:
            resp = http_requests.session.get(url, headers=headers)
        except:
            log.error('Request failed: {0}'.format(url), exc_info=1)
            raise

        if resp.status_code == 304:
            # no content for 'not modified'
            return resp, {}
        else:
            return resp, resp.json()

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

    def _get_document(self, id, lang=None, old_api_cache_key=None):
        url = '%s/%d' % (self._API_ROUTE, id)
        if lang:
            url += '?l=%s' % lang
        not_modified, api_cache_key, document = self._get_with_etag(
            url, old_api_cache_key)

        if not_modified:
            return not_modified, api_cache_key, None

        # Manage merged documents (redirecting to another document)
        if 'redirects_to' in document:
            is_lang_set = lang is not None and \
                          lang in document['available_langs']
            if not is_lang_set:
                lang = self._get_best_lang(document['available_langs'])
            self._redirect(document['redirects_to'], lang, None, is_lang_set)

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
        lang = self._get_interface_lang()
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
                "An error occurred while loading the results")
        return documents, total, filters, lang

    def _get_history(self):
        """ Return a history page for a document.
        """
        id, lang = self._validate_id_lang()

        def load_data(old_api_cache_key=None):
            url = 'document/%d/history/%s' % (id, lang)
            not_modified, api_cache_key, content = self._get_with_etag(
                url, old_api_cache_key)

            if not_modified:
                return not_modified, api_cache_key, None

            return False, api_cache_key, (content, )

        def render_page(content):
            versions = content['versions']
            title = content['title']

            self.template_input.update({
                'module': self._API_ROUTE,
                'document_versions': versions,
                'lang': lang,
                'title': title,
                'document_id': id
            })

            return render(
                'c2corg_ui:templates/document/history.html',
                self.template_input,
                self.request)

        return self._get_or_create(
            (id, lang), cache_document_history, load_data, render_page,
            self._get_cache_key)

    def _diff(self):
        """ Return a diff page for two versions of a document.
        """
        id = self._validate_int('id')
        lang = self._validate_lang()
        v1 = self._validate_int('v1')
        v2 = self._validate_int('v2')

        def load_data(old_api_cache_key=None):
            if old_api_cache_key:
                (old_api_cache_key1, old_api_cache_key2) = old_api_cache_key
            else:
                old_api_cache_key1 = None
                old_api_cache_key2 = None

            url1 = '%s/%d/%s/%d' % (self._API_ROUTE, id, lang, v1)
            not_modified1, api_cache_key1, content1 = self._get_with_etag(
                url1, old_api_cache_key1)

            url2 = '%s/%d/%s/%d' % (self._API_ROUTE, id, lang, v2)
            not_modified2, api_cache_key2, content2 = self._get_with_etag(
                url2, old_api_cache_key2)

            if not_modified1 and not_modified2:
                return True, (api_cache_key1, api_cache_key2), None

            # if only one of the versions has changed, and the other not,
            # a 2nd request has to be made to get the content for that
            # version again, so that the page can be rendered
            if not_modified1 and not content1:
                _, api_cache_key1, content1 = self._get_with_etag(
                    url1, old_api_cache_key=None)
            if not_modified2 and not content2:
                _, api_cache_key2, content2 = self._get_with_etag(
                    url2, old_api_cache_key=None)

            return False, (api_cache_key1, api_cache_key2), (content1, content2)  # noqa

        def render_page(content1, content2):
            version1 = content1['version']
            doc_v1 = content1['document']
            version2 = content2['version']
            doc_v2 = content2['document']
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
                if 'geometry' in doc_v1 and doc_v1['geometry'] else None,
                'geometry2': doc_v2['geometry']['geom']
                if 'geometry' in doc_v2 and doc_v2['geometry'] else None,
                'previous_version_id': content1['previous_version_id'],
                'next_version_id': content2['next_version_id']
            })

            return render(
                'c2corg_ui:templates/document/diff.html',
                self.template_input,
                self.request)

        return self._get_or_create(
            (id, lang, v1, v2), cache_document_diff, load_data, render_page,
            self._get_cache_key_diff, get_etag_key=self._get_etag_key_diff)

    def _add(self, template):
        return get_or_create_page(
            '{0}-add'.format(self._API_ROUTE),
            template,
            self.template_input,
            self.request,
            self.debug
        )

    def _get_geometry(self, data):
        return asShape(json.loads(data)) if data else None

    def _transform(self, geometry, source_epsg, dest_epsg):
        source_proj = pyproj.Proj(init=source_epsg)
        dest_proj = pyproj.Proj(init=dest_epsg)
        project = partial(pyproj.transform, source_proj, dest_proj)
        return transform(project, geometry)

    def _get_cache_key(self, id, lang):
        return '{0}-{1}-{2}'.format(id, lang, CACHE_VERSION)

    def _get_cache_key_archive(self, id, lang, version_id):
        return '{0}-{1}-{2}-{3}'.format(id, lang, version_id, CACHE_VERSION)

    def _get_cache_key_diff(self, id, lang, v1, v2):
        return '{0}-{1}-{2}-{3}-{4}'.format(id, lang, v1, v2, CACHE_VERSION)

    def _get_etag_key(self, api_cache_key):
        return '{0}-{1}'.format(api_cache_key, CACHE_VERSION)

    def _get_etag_key_diff(self, api_cache_key):
        (key_v1, key_v2) = api_cache_key
        return '{0}-{1}-{2}'.format(key_v1, key_v2, CACHE_VERSION)

    def _get_api_cache_key_from_etag(self, etag):
        if_none_matches = IF_NONE_MATCH.findall(etag)

        if if_none_matches:
            return if_none_matches[0]

    def _get_response(self, page_html):
        return get_response(self.request, page_html)

    def _redirect(self, id, lang, slug=None, is_lang_set=False):
        if slug is None:
            location = self.request.route_url(
                self._API_ROUTE + '_view_id_lang', id=id, lang=lang)
        else:
            location = self.request.route_url(
                self._API_ROUTE + '_view', id=id, lang=lang, slug=slug)
        if is_lang_set:
            raise HTTPMovedPermanently(location=location)
        else:
            # The original URL had no lang param, which means it had to be
            # figured out according to the user's interface and available
            # langs => the redirection cannot be permanent since it may differ
            # from one user to another.
            raise HTTPFound(location=location)

    def _redirect_to_full_url(self):
        id = self._validate_int('id')
        is_lang_set = 'lang' in self.request.matchdict
        lang = self._validate_lang() if is_lang_set \
            else self._get_interface_lang()

        url = '%s/%d/%s/info' % (self._API_ROUTE, id, lang)
        if log.isEnabledFor(logging.DEBUG):
            log.debug('API: %s %s', 'GET', url)
        resp, data = self._call_api(url)

        if resp.status_code == 404:
            raise HTTPNotFound()
        elif resp.status_code == 400:
            raise HTTPBadRequest("Incorrect document id or lang")
        elif resp.status_code != 200:
            raise HTTPInternalServerError(
                "An error occurred while loading the document")

        if 'redirects_to' in data:
            if lang not in data['available_langs']:
                lang = self._get_best_lang(data['available_langs'])
            self._redirect(data['redirects_to'], lang, None, is_lang_set)
        else:
            locale = data['locales'][0]
            title = ''
            if self._API_ROUTE == 'routes' and locale['title_prefix']:
                title += locale['title_prefix'] + ' '
            title += locale['title']
            self._redirect(data['document_id'], locale['lang'],
                           slugify(title), is_lang_set)

    def _get_interface_lang(self):
        return self.request.cookies.get('interface_lang', self._DEFAULT_LANG)

    def _get_best_lang(self, available_langs):
        interface_lang = self._get_interface_lang()
        if interface_lang in available_langs:
            return interface_lang
        return next(
            (lang for lang in langs_priority if lang in available_langs),
            None)

    def _preview(self):
        document = self.request.json_body.get('document')
        self.template_input.update({
            'document': document
        })
        return self.template_input
