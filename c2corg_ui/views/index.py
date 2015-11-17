import os
from pyramid.view import view_config
from pyramid.response import FileResponse


@view_config(route_name='index',
             renderer='c2corg_ui:templates/index.html')
def index(request):
    return {
        'debug': 'debug' in request.params,
        'api_url': request.registry.settings['api_url']
    }

@view_config(name="favicon.ico")
def favicon_view(request):
    here = os.path.dirname(__file__)
    icon = os.path.join(here, '..', 'static', 'img', 'favicons', 'favicon.ico')
    return FileResponse(icon, request=request)
