from pyramid.view import view_config
from c2corg_common.attributes import default_cultures


class Pages(object):

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings
        self.template_input = {
            'debug': 'debug' in self.request.params,
            'default_cultures': default_cultures,
            'api_url': self.settings['api_url']
        }

    @view_config(route_name='index', renderer='c2corg_ui:templates/index.html')
    @view_config(route_name='auth', renderer='c2corg_ui:templates/auth.html')
    def index(self):
        return self.template_input
