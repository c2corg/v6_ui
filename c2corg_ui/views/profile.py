import logging

from pyramid.view import view_config
from pyramid.httpexceptions import HTTPInternalServerError

from c2corg_ui.views.document import Document

log = logging.getLogger(__name__)


class Profile(Document):

    _API_ROUTE = 'profiles'

    @view_config(route_name='profiles_index')
    def index(self):
        pass

    @view_config(route_name='profiles_view',
                 renderer='c2corg_ui:templates/profile/view.html')
    def detail(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'user_id': id,
            'lang': lang
        })
        return self.template_input

    @view_config(route_name='profiles_view_id')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='profiles_data',
                 renderer='c2corg_ui:templates/profile/data.html')
    def data(self):
        id, lang = self._validate_id_lang()
        headers = None
        if 'Authorization' in self.request.headers:
            headers = {
                'Authorization': self.request.headers.get('Authorization')
            }
        url = '%s/%d' % (self._API_ROUTE, id)
        resp, data = self._call_api(url, headers)

        if resp.status_code != 200 and resp.status_code != 404:
            raise HTTPInternalServerError(
                "An error occurred while loading the document")

        if resp.status_code == 404:
            self.template_input.update({
                'not_found': True
            })
        elif data.get('not_authorized', False):
            self.template_input.update({
                'not_authorized': True,
                'profile': {'name': data['name']}
            })
        else:
            # get the locale in the desired lang if available
            locales = data['locales']
            locales = [l for l in locales if l['lang'] == lang] or locales
            self.template_input.update({
                'lang': locales[0]['lang'],
                'profile': data,
                'locale': locales[0],
                'geometry': self._get_geometry(data['geometry']['geom']),
                'version': None
            })
        return self.template_input
