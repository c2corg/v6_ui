from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_common.attributes import activities, route_types


class Route(Document):

    _API_ROUTE = 'routes'

    @view_config(route_name='routes_index',
                 renderer='c2corg_ui:templates/route/index.html')
    @view_config(route_name='routes_index_default',
                 renderer='c2corg_ui:templates/route/index.html')
    def index(self):
        routes, total, filter_params = self._get_documents()
        self.template_input.update({
            'routes': routes,
            'total': total,
            'filter_params': filter_params
        })
        return self.template_input

    @view_config(route_name='routes_view',
                 renderer='c2corg_ui:templates/route/view.html')
    @view_config(route_name='routes_archive',
                 renderer='c2corg_ui:templates/route/view.html')
    def view(self):
        id, culture = self._validate_id_culture()
        if 'version' in self.request.matchdict:
            version_id = int(self.request.matchdict['version'])
            route, locale, version = self._get_archived_document(
                id, culture, version_id)
        else:
            route, locale = self._get_document(id, culture)
            version = None
        self.template_input.update({
            'culture': culture,
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
        id, culture = self._validate_id_culture()
        self.template_input.update({
            'activities': activities,
            'route_types': route_types,
            'route_culture': culture,
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
