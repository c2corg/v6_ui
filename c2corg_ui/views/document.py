import httplib2
import json

from pyramid.httpexceptions import HTTPBadRequest

from c2corg_ui.attributes import available_cultures


class Document(object):

    # FIXME Is a "documents" route available/relevant in the API?
    _API_ROUTE = 'documents'

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
            return resp, json.loads(content)
        except Exception:
            return {'status': 500}, {}

    def _validate_id_culture(self):
        try:
            id = int(self.request.matchdict['id'])
        except Exception:
            raise HTTPBadRequest("Incorrect id")

        culture = str(self.request.matchdict['culture'])
        if culture not in available_cultures:
            raise HTTPBadRequest("Incorrect culture")

        return id, culture

    def _get_document(self, id, culture):
        # TODO: get only the current culture with ?l=fr
        # but we need to know the other available cultures...
        url = '%s/%s/%d' % (
            self.settings['api_url'],
            self._API_ROUTE,
            id
        )
        resp, content = self._call_api(url)
        # TODO: better error handling
        # FIXME: what if desired culture is not available?
        # either return 404 or select another culture (culture = ...)
        document = content if resp.status == 200 else None
        # We need to pass locale data to Mako as a dedicated object to make it
        # available in parent template:
        locale = None
        other_cultures = {}
        if document and 'locales' in document:
            for l in document['locales']:
                if 'culture' not in l:
                    continue
                if l['culture'] == culture:
                    locale = l
                else:
                    other_cultures[l['culture']] = {
                        'title': l['title']
                    }
        return document, locale, other_cultures

    def _get_documents(self):
        url = '%s/%s' % (self.settings['api_url'], self._API_ROUTE)
        resp, content = self._call_api(url)
        # TODO: better error handling
        return content if resp.status == 200 else []
