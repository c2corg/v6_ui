from pyramid.view import view_config

from c2corg_ui.views.document import Document


class Route(Document):

    _API_ROUTE = 'routes'

    @view_config(route_name='routes_index',
                 renderer='c2corg_ui:templates/route/index.html')
    def index(self):
        self.template_input.update({
            'routes': self._get_documents()
        })
        return self.template_input

    @view_config(route_name='routes_view',
                 renderer='c2corg_ui:templates/route/view.html')
    def view(self):
        id, culture = self._validate_id_culture()
        route, locale, other_cultures = self._get_document(id, culture)
        self.template_input.update({
            'culture': culture,
            'route': route,
            'locale': locale,
            'other_cultures': other_cultures
        })
        return self.template_input
