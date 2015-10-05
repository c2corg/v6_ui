from pyramid.view import view_config

from c2corg_ui.views.document import Document


class Waypoint(Document):

    _API_ROUTE = 'waypoints'

    @view_config(route_name='waypoints_index',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    def index(self):
        url = '%s/%s' % (self.settings['api_url'], self._API_ROUTE)
        resp, content = self._call_api(url)
        # TODO: error handling
        return {
            'debug': 'debug' in self.request.params,
            'waypoints': content if resp.status == 200 else {}
        }

    @view_config(route_name='waypoints_view',
                 renderer='c2corg_ui:templates/waypoint/view.html')
    def view(self):
        url = '%s/%s/%d' % (
            self.settings['api_url'],
            self._API_ROUTE,
            int(self.request.matchdict['id'])
        )
        resp, content = self._call_api(url)
        # TODO: error handling
        return {
            'debug': 'debug' in self.request.params,
            'waypoint': content if resp.status == 200 else {}
        }
