from pyramid.view import view_config
from c2corg_common.attributes import default_cultures


@view_config(route_name='index',
             renderer='c2corg_ui:templates/index.html')
def index(request):
    return {
        'debug': 'debug' in request.params,
        'default_cultures': default_cultures,
        'api_url': request.registry.settings['api_url']
    }
