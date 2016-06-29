from pyramid.view import view_config

from c2corg_ui.views.document import Document


class Outing(Document):

    _API_ROUTE = 'outings'

    @view_config(route_name='outings_index',
                 renderer='c2corg_ui:templates/outing/index.html')
    def index(self):
        return self.template_input

    @view_config(route_name='outings_sitemap',
                 renderer='c2corg_ui:templates/outing/sitemap.html')
    @view_config(route_name='outings_sitemap_default',
                 renderer='c2corg_ui:templates/outing/sitemap.html')
    def sitemap(self):
        outings, total, filter_params, lang = self._get_documents()
        self.template_input.update({
            'outings': outings,
            'filter_params': filter_params,
            'total': total,
            'lang': lang
        })
        return self.template_input

    @view_config(route_name='outings_view',
                 renderer='c2corg_ui:templates/outing/view.html')
    @view_config(route_name='outings_archive',
                 renderer='c2corg_ui:templates/outing/view.html')
    def view(self):
        id, lang = self._validate_id_lang()
        if 'version' in self.request.matchdict:
            version_id = int(self.request.matchdict['version'])
            outing, locale, version = self._get_archived_document(
                id, lang, version_id)
        else:
            outing, locale = self._get_document(id, lang)
        self.template_input.update({
            'lang': lang,
            'outing': outing,
            'locale': locale,
        })
        return self.template_input

    @view_config(route_name='outings_add',
                 renderer='c2corg_ui:templates/outing/edit.html')
    @view_config(route_name='outings_edit',
                 renderer='c2corg_ui:templates/outing/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'outing_lang': lang,
            'outing_id': id
        })
        return self.template_input

    @view_config(route_name='outings_history',
                 renderer='c2corg_ui:templates/document/history.html')
    def history(self):
        return self._get_history()

    @view_config(route_name='outings_diff',
                 renderer='c2corg_ui:templates/document/diff.html')
    def diff(self):
        return self._diff()
