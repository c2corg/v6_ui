from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_common.attributes import activities, route_types


class Route(Document):

    _API_ROUTE = 'routes'

    @view_config(route_name='routes_index',
                 renderer='c2corg_ui:templates/route/index.html')
    def index(self):
        return self._get_index()

    @view_config(route_name='routes_sitemap',
                 renderer='c2corg_ui:templates/route/sitemap.html')
    @view_config(route_name='routes_sitemap_default',
                 renderer='c2corg_ui:templates/route/sitemap.html')
    def sitemap(self):
        routes, total, filter_params, lang = self._get_documents()
        self.template_input.update({
            'routes': routes,
            'total': total,
            'filter_params': filter_params,
            'lang': lang
        })
        return self.template_input

    @view_config(route_name='routes_view',
                 renderer='c2corg_ui:templates/route/view.html')
    @view_config(route_name='routes_archive',
                 renderer='c2corg_ui:templates/route/view.html')
    def view(self):
        id, lang = self._validate_id_lang()
        if 'version' in self.request.matchdict:
            version_id = int(self.request.matchdict['version'])
            route, locale, version = self._get_archived_document(
                id, lang, version_id)
        else:
            route, locale = self._get_document(id, lang)
            version = None
        self.template_input.update({
            'lang': lang,
            'route': route,
            'locale': locale,
            'version': version
        })
        return self.template_input

    @view_config(route_name='routes_add',
                 renderer='c2corg_ui:templates/route/edit.html')
    @view_config(route_name='routes_edit',
                 renderer='c2corg_ui:templates/route/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'activities': activities,
            'route_types': route_types,
            'route_lang': lang,
            'route_id': id
        })
        return self.template_input

    @view_config(route_name='routes_history',
                 renderer='c2corg_ui:templates/document/history.html')
    def history(self):
        return self._get_history()

    @view_config(route_name='routes_diff',
                 renderer='c2corg_ui:templates/document/diff.html')
    def diff(self):
        return self._diff()
