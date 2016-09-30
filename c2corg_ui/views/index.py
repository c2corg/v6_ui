from pyramid.view import view_config

from c2corg_ui.views import get_or_create_page


class Pages(object):

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings
        self.debug = 'debug' in self.request.params
        self.template_input = {
            'debug': self.debug,
            'api_url': self.settings['api_url'],
            'ign_api_key': self.settings['ign_api_key'],
            'bing_api_key': self.settings['bing_api_key'],
            'ganalytics_key': self.settings['ganalytics_key'],
            'image_backend_url': self.settings['image_backend_url'],
            'image_url': self.settings['image_url'],
            'discourse_url': self.settings['discourse_url']
        }

    @view_config(route_name='index')
    def index(self):
        return self._get_page('index', 'c2corg_ui:templates/index.html')

    @view_config(route_name='auth')
    def auth(self):
        return self._get_page('auth', 'c2corg_ui:templates/auth.html')

    @view_config(route_name='auth-sso')
    def auth_sso(self):
        return self._get_page(
            'auth', 'c2corg_ui:templates/auth.html', no_etag=True)

    @view_config(route_name='account')
    def account(self):
        return self._get_page('account', 'c2corg_ui:templates/account.html')

    @view_config(route_name='preferences')
    def preferences(self):
        return self._get_page(
            'preferences', 'c2corg_ui:templates/preferences.html')

    def _get_page(self, page_key, template, no_etag=False):
        return get_or_create_page(
            page_key,
            template,
            self.template_input,
            self.request,
            self.debug,
            no_etag
        )
