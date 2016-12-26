import logging

from c2corg_common.document_types import USERPROFILE_TYPE
from c2corg_ui.views import call_api, get_with_etag
from pyramid.renderers import render
from pyramid.view import view_config
from pyramid.httpexceptions import (
    HTTPNotFound, HTTPInternalServerError)

from c2corg_ui.views.document import Document, ROUTE_NAMES
from c2corg_ui.caching import cache_document_detail

log = logging.getLogger(__name__)


class Profile(Document):

    _API_ROUTE = ROUTE_NAMES[USERPROFILE_TYPE]

    @view_config(route_name='profiles_view')
    def profile(self):
        """
        User profiles are a bit special, because users can mark their profile
        as non-public so that the profile data has to be requested with an
        authentication header. The request to get a profile page is made by
        the browser, so that the authentication header can not be set.
        That's why the profile page is constructed as follows:

        - The browser makes a request `/profiles/123` to the UI server-side
          (without authentication header).
        - The UI server sides makes an unauthenticated request to the API to
          get the available locales of the profile
          (`api.camptocamp.org/profiles/123/info`)
        - The UI server-side returns a page containing only the user name.
        - On the UI client-side a request is made to the UI server-side to get
          the profile data as rendered HTML (e.g. `/profiles/data/123/fr`).
          If the user is logged-in, the request is made authenticated.
        - The UI server-side makes a request to the API to get the profile
          data (e.g. (`api.camptocamp.org/profiles/123/fr`)). If the request
          to the UI server-side was authenticated, the request to the API is
          also made authenticated.
        - On the UI client-side the rendered HTML is inserted into the page.
        """
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
                self._get_profile_info(id, lang, old_api_cache_key)
            return not_modified, api_cache_key, document_and_locale

        return self._get_or_create(
            (id, lang), cache_document_detail, load_data, render_page,
            self._get_cache_key)

    def _get_profile_info(self, id, lang, old_api_cache_key=None):
        url = '%s/%d/%s/info' % (self._API_ROUTE, id, lang)
        not_modified, api_cache_key, document = get_with_etag(
            self.settings, url, old_api_cache_key)

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
        resp, data = call_api(self.settings, url, headers)

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
                if data['geometry'] else None
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
