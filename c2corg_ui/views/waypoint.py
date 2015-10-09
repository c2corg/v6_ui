from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_ui.attributes import available_cultures, waypoint_types


class Waypoint(Document):

    _API_ROUTE = 'waypoints'

    @view_config(route_name='waypoints_index',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    def index(self):
        url = '%s/%s' % (self.settings['api_url'], self._API_ROUTE)
        resp, content = self._call_api(url)
        # TODO: error handling (not found, etc.)
        return {
            'debug': 'debug' in self.request.params,
            'waypoints': content if resp.status == 200 else {}
        }

    @view_config(route_name='waypoints_view',
                 renderer='c2corg_ui:templates/waypoint/view.html')
    @view_config(route_name='waypoints_edit',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    def get_document(self):
        id, culture = self._validate_id_culture()
        # TODO: get only the current culture
        url = '%s/%s/%d' % (
            self.settings['api_url'],
            self._API_ROUTE,
            id
        )
        resp, content = self._call_api(url)
        # TODO: error handling
        return {
            'debug': 'debug' in self.request.params,
            'culture': culture,
            'waypoint': content if resp.status == 200 else {}
        }

    @view_config(route_name='waypoints_add',
                 renderer='c2corg_ui:templates/waypoint/add.html')
    def add(self):
        return {
            'debug': 'debug' in self.request.params,
            'available_cultures': available_cultures,
            'waypoint_types': waypoint_types
        }
