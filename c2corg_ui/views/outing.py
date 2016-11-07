from c2corg_common.document_types import OUTING_TYPE
from pyramid.renderers import render
from pyramid.view import view_config

from c2corg_ui.views.document import Document, ROUTE_NAMES


class Outing(Document):

    _API_ROUTE = ROUTE_NAMES[OUTING_TYPE]

    @view_config(route_name='outings_index')
    def index(self):
        return self._index('c2corg_ui:templates/outing/index.html')

    @view_config(route_name='outings_view_id')
    @view_config(route_name='outings_view_id_lang')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='outings_view')
    def detail(self):
        id, lang = self._validate_id_lang()

        def render_page(outing, locale):
            self.template_input.update({
                'lang': lang,
                'outing': outing,
                'locale': locale,
                'version': None
            })

            return render(
                'c2corg_ui:templates/outing/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_detail(id, lang, render_page)

    @view_config(route_name='outings_archive')
    def archive(self):
        id, lang = self._validate_id_lang()
        version_id = int(self.request.matchdict['version'])

        def render_page(outing, locale, version):
            self.template_input.update({
                'lang': lang,
                'outing': outing,
                'locale': locale,
                'version': version
            })

            return render(
                'c2corg_ui:templates/outing/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_archive(id, lang, version_id, render_page)

    @view_config(route_name='outings_history')
    def history(self):
        return self._get_history()

    @view_config(route_name='outings_diff')
    def diff(self):
        return self._diff()

    @view_config(route_name='outings_add')
    def add(self):
        self.template_input.update({
            'outing_lang': None,
            'outing_id': None
        })
        return self._add('c2corg_ui:templates/outing/edit.html')

    @view_config(route_name='outings_edit',
                 renderer='c2corg_ui:templates/outing/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'outing_lang': lang,
            'outing_id': id
        })
        return self.template_input

    @view_config(route_name='outings_preview',
                 renderer='c2corg_ui:templates/outing/preview.html')
    def preview(self):
        return self._preview()
