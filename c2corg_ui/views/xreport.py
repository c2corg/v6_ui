from c2corg_common.document_types import XREPORT_TYPE
# from c2corg_ui.caching import cache_document_detail
from c2corg_ui.caching import cache_document_detail
from c2corg_ui.views import call_api, get_with_etag
from pyramid.httpexceptions import HTTPInternalServerError
from pyramid.renderers import render
from pyramid.view import view_config

from c2corg_ui.views.document import Document, ROUTE_NAMES


class Xreport(Document):

    _API_ROUTE = ROUTE_NAMES[XREPORT_TYPE]

    @view_config(route_name='xreports_index')
    def index(self):
        return self._index('c2corg_ui:templates/xreport/index.html')

    @view_config(route_name='xreports_view_id')
    @view_config(route_name='xreports_view_id_lang')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='xreports_view')
    def detail(self):
        """
        Xreports are a bit special (similar to user profiles), because users
        share non-public data inside the report so that the part of xreport
        data has to be requested with an authentication header.
        The request to get a profile page is made by
        the browser, so that the authentication header can not be set.
        That's why the profile page is constructed as follows:

        - The browser makes a request `/xreports/123` to the UI server-side
          (without authentication header).
        - The UI server sides makes an unauthenticated request to the API to
          get the available locales of the xreport
          (`api.camptocamp.org/xreports/123/info`)
        - The UI server-side returns a page containing only the public data.
        - On the UI client-side a request is made to the UI server-side to get
          the private data as rendered HTML (e.g. `/xreports/data/123/fr`).
          If the user is logged-in, the request is made authenticated.
        - The UI server-side makes a request to the API to get the private
          data (e.g. (`api.camptocamp.org/xreports/123/fr`)). If the request
          to the UI server-side was authenticated, the request to the API is
          also made authenticated.
        - On the UI client-side the rendered HTML is inserted into the page.
        """
        id, lang = self._validate_id_lang()

        def render_page(xreport, locale):
            self.template_input.update({
                'lang': lang,
                'xreport': xreport,
                'locale': locale,
                'geometry': self._get_geometry(xreport['geometry']['geom']),
                'version': None
            })

            return render(
                'c2corg_ui:templates/xreport/view.html',
                self.template_input,
                self.request
            )

        # def load_data(old_api_cache_key=None):
        #     not_modified, api_cache_key, document_and_locale = \
        #         self._get_xreport_info(id, lang, old_api_cache_key)
        #     return not_modified, api_cache_key, document_and_locale

        # render page vytvari stranku pomoci xreportu BEZ privatnich dat
        # return self._get_or_create(
        #     (id, lang), cache_document_detail, load_data, render_page,
        #     self._get_cache_key)
        return self._get_or_create_detail(id, lang, render_page)

    # /%s/info .. , lang
    def _get_xreport_info(self, id, lang, old_api_cache_key=None):
        url = '%s/%d' % (self._API_ROUTE, id)
        not_modified, api_cache_key, document = get_with_etag(
            self.settings, url, old_api_cache_key)

        if not_modified:
            return not_modified, api_cache_key, None

        return False, api_cache_key, (document, document['locales'])

    @view_config(route_name='xreports_data',
                 renderer='c2corg_ui:templates/xreport/data.html')
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
                'locale': locales[0],
                'xreport': data,
                'geometry': self._get_geometry(data['geometry']['geom'])
                if data['geometry'] else None
            })
        return self.template_input

    @view_config(route_name='xreports_archive')
    def archive(self):
        id, lang = self._validate_id_lang()
        version_id = int(self.request.matchdict['version'])

        def render_page(xreport, locale, version):
            self.template_input.update({
                'lang': lang,
                'xreport': xreport,
                'locale': locale,
                'geometry': self._get_geometry(xreport['geometry']['geom']),
                'version': version
            })

            return render(
                'c2corg_ui:templates/xreport/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_archive(id, lang, version_id, render_page)

    @view_config(route_name='xreports_history')
    def history(self):
        return self._get_history()

    @view_config(route_name='xreports_diff')
    def diff(self):
        return self._diff()

    @view_config(route_name='xreports_add')
    def add(self):
        self.template_input.update({
            'xreport_lang': None,
            'xreport_id': None
        })
        return self._add('c2corg_ui:templates/xreport/edit.html')

    @view_config(route_name='xreports_edit',
                 renderer='c2corg_ui:templates/xreport/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'xreport_lang': lang,
            'xreport_id': id
        })
        return self.template_input

    @view_config(route_name='xreports_preview',
                 renderer='c2corg_ui:templates/xreport/preview.html')
    def preview(self):
        return self._preview()
