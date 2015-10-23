from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_ui.attributes import available_cultures, waypoint_types


class Waypoint(Document):

    _API_ROUTE = 'waypoints'

    @view_config(route_name='waypoints_index',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    def index(self):
        self.template_input.update({
            'waypoints': self._get_documents()
        })
        return self.template_input

    @view_config(route_name='waypoints_view',
                 renderer='c2corg_ui:templates/waypoint/view.html')
    def view(self):
        id, culture = self._validate_id_culture()
        waypoint, locale, other_cultures = self._get_document(id, culture)
        self.template_input.update({
            'culture': culture,
            'waypoint': waypoint,
            'locale': locale,
            'other_cultures': other_cultures
        })
        return self.template_input

    @view_config(route_name='waypoints_add',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    @view_config(route_name='waypoints_edit',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    def edit(self):
        try:
            id, culture = self._validate_id_culture()
        except Exception:
            id = None
            culture = None
        self.template_input.update({
            'available_cultures': available_cultures,
            'waypoint_types': waypoint_types,
            'waypoint_culture': culture,
            'waypoint_id': id
        })
        return self.template_input
