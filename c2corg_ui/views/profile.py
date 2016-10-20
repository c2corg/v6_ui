import logging

from pyramid.renderers import render
from pyramid.view import view_config
from pyramid.httpexceptions import (
    HTTPNotFound, HTTPInternalServerError)

from c2corg_ui.views.document import Document
from c2corg_ui.caching import cache_document_detail

log = logging.getLogger(__name__)


class Profile(Document):

    _API_ROUTE = 'profiles'

    @view_config(route_name='profiles_view')
    def profile(self):
        id, lang = self._validate_id_lang()

        def render_page(profile, locales):
            locale = list(filter(lambda l: l['lang'] == lang, locales))
            if not locale:
                raise HTTPNotFound('Requested lang does not exist')

            self.template_input.update({
                'lang': lang,
                'profile': profile,
                'locale': locale[0],
                'locales': locales
            })

            return render(
                'c2corg_ui:templates/profile/view.html',
                self.template_input,
                self.request
            )

        def load_data(old_api_cache_key=None):
            not_modified, api_cache_key, document_and_locale = \
                self._get_profile(id, lang, old_api_cache_key)
            return not_modified, api_cache_key, document_and_locale

        return self._get_or_create(
            (id, lang), cache_document_detail, load_data, render_page,
            self._get_cache_key)

    def _get_profile(self, id, lang, old_api_cache_key=None):
        url = '%s/%d/%s/info' % (self._API_ROUTE, id, lang)
        not_modified, api_cache_key, document = self._get_with_etag(
            url, old_api_cache_key)

        if not_modified:
            return not_modified, api_cache_key, None

        return False, api_cache_key, (document, document['locales'])

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
        url = '%s/%d?l=%s' % (self._API_ROUTE, id, lang)
        resp, data = self._call_api(url, headers)

        if resp.status_code != 200:
            raise HTTPInternalServerError(
                "An error occurred while loading the document")

        if data.get('not_authorized', False):
            self.template_input.update({
                'not_authorized': True
            })
        else:
            locales = data['locales']
            self.template_input.update({
                'lang': locales[0]['lang'],
                'profile': data,
                'locale': locales[0],
                'geometry': self._get_geometry(data['geometry']['geom'])
            })
        return self.template_input

    @view_config(route_name='profiles_edit',
                 renderer='c2corg_ui:templates/profile/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'profile_lang': lang,
            'user_id': id
        })
        return self.template_input

    @view_config(route_name='profiles_preview',
                 renderer='c2corg_ui:templates/profile/preview.html')
    def preview(self):
        return self._preview()
