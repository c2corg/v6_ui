from pyramid.view import view_config

import httplib2
import json


# TODO: factorize in a parent Document class?
class Waypoint(object):

    _API_ROUTE = 'waypoints'

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings

    @view_config(route_name='waypoints_index',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    def index(self):
        url = '%s/%s' % (self.settings['api_url'], self._API_ROUTE)
        http = httplib2.Http()
        resp, content = http.request(url)
        if resp.status == 200:
            waypoints = json.loads(content)
        else:
            waypoints = {}
        # TODO: add message tool for handling errors
        return {
            'debug': 'debug' in self.request.params,
            'waypoints': waypoints
        }

    @view_config(route_name='waypoints_view',
                 renderer='c2corg_ui:templates/waypoint/view.html')
    def view(self):
        url = '%s/%s/%d' % (
            self.settings['api_url'],
            self._API_ROUTE,
            int(self.request.matchdict['id'])
        )
        http = httplib2.Http()
        resp, content = http.request(url)
        if resp.status == 200:
            waypoint = json.loads(content)
        else:
            waypoint = {}
        # TODO: add message tool for handling errors
        return {
            'debug': 'debug' in self.request.params,
            'waypoint': waypoint
        }
