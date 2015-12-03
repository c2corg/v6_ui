from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_common.attributes import activities, route_types


class Route(Document):

    _API_ROUTE = 'routes'

    @view_config(route_name='routes_index',
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
    def view(self):
        id, culture = self._validate_id_culture()
        route, locale = self._get_document(id, culture)
        self.template_input.update({
            'culture': culture,
            'route': route,
            'locale': locale
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
