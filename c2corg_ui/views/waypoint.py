from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_common.attributes import default_cultures, waypoint_types


class Waypoint(Document):

    _API_ROUTE = 'waypoints'

    @view_config(route_name='waypoints_index',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    def index(self):
        waypoints, total = self._get_documents()
        self.template_input.update({
            'waypoints': waypoints,
            'total': total
        })
        return self.template_input

    @view_config(route_name='waypoints_view',
                 renderer='c2corg_ui:templates/waypoint/view.html')
    def view(self):
        id, culture = self._validate_id_culture()
        waypoint, locale = self._get_document(id, culture)
        self.template_input.update({
            'culture': culture,
            'waypoint': waypoint,
            'locale': locale,
            'geometry': self._get_geometry(waypoint['geometry']['geom']),
            'transform': self._transform
        })
        return self.template_input

    @view_config(route_name='waypoints_add',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    @view_config(route_name='waypoints_edit',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    def edit(self):
        id, culture = self._validate_id_culture()
        self.template_input.update({
            'default_cultures': default_cultures,
            'waypoint_types': waypoint_types,
            'waypoint_culture': culture,
            'waypoint_id': id
        })
        return self.template_input
