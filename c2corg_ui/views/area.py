import logging

from c2corg_common.document_types import AREA_TYPE
from pyramid.renderers import render
from pyramid.view import view_config

from c2corg_ui.views.document import Document, ROUTE_NAMES

log = logging.getLogger(__name__)


class Area(Document):

    _API_ROUTE = ROUTE_NAMES[AREA_TYPE]

    @view_config(route_name='areas_index')
    def index(self):
        return self._index('c2corg_ui:templates/area/index.html')

    @view_config(route_name='areas_view_id')
    @view_config(route_name='areas_view_id_lang')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='areas_view')
    def detail(self):
        id, lang = self._validate_id_lang()

        def render_page(area, locale):
            self.template_input.update({
                'lang': lang,
                'area': area,
                'locale': locale,
                'version': None
            })

            return render(
                'c2corg_ui:templates/area/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_detail(id, lang, render_page)

    @view_config(route_name='areas_archive')
    def archive(self):
        id, lang = self._validate_id_lang()
        version_id = int(self.request.matchdict['version'])

        def render_page(area, locale, version):
            self.template_input.update({
                'lang': lang,
                'area': area,
                'locale': locale,
                'version': version
            })

            return render(
                'c2corg_ui:templates/area/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_archive(id, lang, version_id, render_page)

    @view_config(route_name='areas_history')
    def history(self):
        return self._get_history()

    @view_config(route_name='areas_diff')
    def diff(self):
        return self._diff()

    @view_config(route_name='areas_edit',
                 renderer='c2corg_ui:templates/area/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'area_lang': lang,
            'area_id': id
        })
        return self.template_input

    @view_config(route_name='areas_preview',
                 renderer='c2corg_ui:templates/area/preview.html')
    def preview(self):
        return self._preview()
