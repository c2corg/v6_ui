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

    def _call_api(self, url, method='GET', body=None, headers=None):
        http = httplib2.Http()
        try:
            resp, content = http.request(
                url, method=method, body=body, headers=headers
            )
        except Exception:
            # TODO
            pass
        return resp, json.loads(content)

    def _validate_id_culture(self):
        try:
            id = int(self.request.matchdict['id'])
        except Exception:
            raise HTTPBadRequest("Incorrect id")

        culture = str(self.request.matchdict['culture'])
        if culture not in available_cultures:
            raise HTTPBadRequest("Incorrect culture")

        return id, culture
