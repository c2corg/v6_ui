from pyramid.view import view_config


@view_config(route_name='index',
             renderer='c2corg_ui:templates/index.html')
def index(request):
    return {'debug': 'debug' in request.params}
