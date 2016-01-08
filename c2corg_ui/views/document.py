from c2corg_ui.diff.differ import diff_documents
from shapely.geometry import asShape
from shapely.ops import transform
from functools import partial
from urllib.parse import urlencode
import httplib2
import pyproj
import json

from pyramid.httpexceptions import (
    HTTPBadRequest, HTTPNotFound, HTTPInternalServerError)

from c2corg_common.attributes import default_cultures


class Document(object):

    # FIXME Is a "documents" route available/relevant in the API?
    _API_ROUTE = 'documents'

    # FIXME sync with API => use a CONSTANT in c2corg_common?
    _DEFAULT_FILTERS = {
        'limit': 30
    }

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings
        self.template_input = {
            'debug': 'debug' in self.request.params,
            'api_url': self.settings['api_url']
        }

    def _call_api(self, url, method='GET', body=None, headers=None):
        http = httplib2.Http()
        try:
            resp, content = http.request(
                url, method=method, body=body, headers=headers
            )
            return resp, json.loads(content.decode('utf-8'))
        except Exception:
            # TODO: return error message as the second item
            return {'status': '500'}, {}

    def _validate_id_culture(self):
        if 'id' not in self.request.matchdict:
            # eg. creating a new document
            return None, None

        id = self._validate_int('id')
        culture = self._validate_culture()

        return id, culture

    def _validate_culture(self):
        culture = str(self.request.matchdict['culture'])
        if culture not in default_cultures:
            raise HTTPBadRequest("Incorrect culture")
        return culture

    def _validate_int(self, field):
        try:
            return int(self.request.matchdict[field])
        except Exception:
            raise HTTPBadRequest("Incorrect " + field)

    def _get_document(self, id, culture):
        url = '%s/%s/%d?l=%s' % (
            self.settings['api_url'], self._API_ROUTE, id, culture
        )
        resp, document = self._call_api(url)
        # TODO: better error handling
        if resp['status'] == '404':
            raise HTTPNotFound()
        elif resp['status'] != '200':
            raise HTTPInternalServerError(
                "An error occured while loading the document")
        # When requesting a culture that does not exist yet, the API sends
        # back an empty list as 'locales'
        if not document['locales']:
            raise HTTPNotFound('Requested culture does not exist')
        # We need to pass locale data to Mako as a dedicated object to make it
        # available to the parent templates:
        locale = document['locales'][0]
        return document, locale

    def _get_archived_document(self, id, culture, version_id):
        url = '%s/%s/%d/%s/%d' % (
            self.settings['api_url'], self._API_ROUTE, id, culture, version_id
        )
        resp, content = self._call_api(url)
        # TODO: better error handling
        if resp['status'] == '404':
            raise HTTPNotFound()
        elif resp['status'] != '200':
            raise HTTPInternalServerError(
                "An error occured while loading the document")
        document = content['document']
        version = content['version']
        # We need to pass locale data to Mako as a dedicated object to make it
        # available to the parent templates:
        locale = document['locales'][0]
        return document, locale, version

    def _get_documents(self):
        params = self._get_filter_params()
        lang = self.request.cookies.get('interface_lang', 'fr')
        params.append(('pl', lang))

        # query_string contains filter params using the standard URL format
        # (eg. ?offset=50&limit=20&elevation=>2000).
        query_string = '?' + urlencode(params) if params else ''
        url = '%s/%s%s' % (
            self.settings['api_url'], self._API_ROUTE, query_string
        )

        resp, content = self._call_api(url)
        # Inject default list filters params:
        filters = dict(self._DEFAULT_FILTERS, **{k: v for k, v in params})
        # TODO: better error handling
        if resp['status'] == '200':
            documents = content['documents']
            total = content['total']
        else:
            documents = []
            total = 0
        return documents, total, filters, lang

    def _get_filter_params(self):
        """This function is used to parse the filters provided in URLs such as
        https://www.camptocamp.org/waypoints/offset/50/limit/20/elevation/>2000
        Index page routes such as '/waypoints*filters' store the "filters"
        params in a tuple like for instance:
        ('offset', '50', 'limit', '20', 'elevation', '>2000')
        To make params easier to manipulate, for instance to create the
        matching API URL with urllib.urlencode, tuple items are grouped in
        a list of (key, value) tuples.
        """
        params = []
        if 'filters' in self.request.matchdict:
            filters = self.request.matchdict['filters']
            # If number of filters is odd, add an empty string at the end:
            filters = filters + ('',) if len(filters) % 2 != 0 else filters
            # Group filters as a list of (key, value) tuples
            for i in range(0, len(filters)):
                # Skip odd indices since grouping filters 2 by 2
                if i % 2 == 0:
                    params.append(filters[i:i+2])
        return params

    def _get_history(self):
        id, culture = self._validate_id_culture()
        url = '%s/document/%d/history/%s' % (
            self.settings['api_url'], id, culture)
        resp, content = self._call_api(url)
        # TODO: better error handling
        if resp['status'] == '200':
            versions = content['versions']
            title = content['title']
            self.template_input.update({
                'module': self._API_ROUTE,
                'document_versions': versions,
                'culture': culture,
                'title': title,
                'document_id': id
            })
            return self.template_input
        else:
            raise HTTPNotFound()

    def _get_geometry(self, data):
        return asShape(json.loads(data))

    def _transform(self, geometry, source_epsg, dest_epsg):
        source_proj = pyproj.Proj(init=source_epsg)
        dest_proj = pyproj.Proj(init=dest_epsg)
        project = partial(pyproj.transform, source_proj, dest_proj)
        return transform(project, geometry)

    def _diff(self):
        id = self._validate_int('id')
        culture = self._validate_culture()
        v1 = self._validate_int('v1')
        v2 = self._validate_int('v2')

        url = '%s/%s/%d/%s/%d' % (
            self.settings['api_url'], self._API_ROUTE, id, culture, v1)
        resp_v1, content_v1 = self._call_api(url)

        url = '%s/%s/%d/%s/%d' % (
            self.settings['api_url'], self._API_ROUTE, id, culture, v2)
        resp_v2, content_v2 = self._call_api(url)

        # TODO: better error handling
        if resp_v1['status'] == '200' and resp_v2['status'] == '200':
            version1 = content_v1['version']
            doc_v1 = content_v1['document']
            version2 = content_v2['version']
            doc_v2 = content_v2['document']
            field_diffs = diff_documents(doc_v1, doc_v2)

            self.template_input.update({
                'module': self._API_ROUTE,
                'culture': culture,
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
