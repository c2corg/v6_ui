from pyramid.view import view_config


# TODO: factorize in a parent Document class?
class Waypoint(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='waypoints',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    def index(self):
        return {'debug': 'debug' in self.request.params}
