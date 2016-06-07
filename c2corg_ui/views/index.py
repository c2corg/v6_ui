from pyramid.view import view_config


class Pages(object):

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings
        self.template_input = {
            'debug': 'debug' in self.request.params,
            'api_url': self.settings['api_url'],
            'ign_api_key': self.settings['ign_api_key']
        }

    @view_config(route_name='index', renderer='c2corg_ui:templates/index.html')
    @view_config(route_name='auth', renderer='c2corg_ui:templates/auth.html')
    @view_config(
            route_name='account',
            renderer='c2corg_ui:templates/account.html')
    def index(self):
        return self.template_input
