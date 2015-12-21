from pyramid.config import Configurator
from pyramid_mako import add_mako_renderer


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    add_mako_renderer(config, '.html')
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_static_view('node_modules', settings.get('node_modules_path'),
                           cache_max_age=3600)
    config.add_static_view('closure', settings.get('closure_library_path'),
                           cache_max_age=3600)

    config.add_route('index', '/')

    config.add_route('waypoints_view', '/waypoints/{id}/{culture}')
    config.add_route('waypoints_index_default', '/waypoints')
    config.add_route('waypoints_index', '/waypoints/list*filters')
    config.add_route('waypoints_add', '/waypoints/add')
    config.add_route('waypoints_edit', '/waypoints/edit/{id}/{culture}')
    config.add_route('waypoints_history', '/waypoints/history/{id}/{culture}')
    config.add_route('waypoints_archive',
                     '/waypoints/{id}/{culture}/{version:\d+}')
    config.add_route(
        'waypoints_diff', '/waypoints/diff/{id}/{culture}/{v1}/{v2}')

    config.add_route('routes_view', '/routes/{id}/{culture}')
    config.add_route('routes_index_default', '/routes')
    config.add_route('routes_index', '/routes/list*filters')
    config.add_route('routes_add', '/routes/add')
    config.add_route('routes_edit', '/routes/edit/{id}/{culture}')
    config.add_route('routes_history', '/routes/history/{id}/{culture}')
    config.add_route('routes_archive', '/routes/{id}/{culture}/{version:\d+}')
    config.add_route(
        'routes_diff', '/routes/diff/{id}/{culture}/{v1}/{v2}')

    config.add_route('auth', '/auth')

    config.scan(ignore='c2corg_ui.tests')
    return config.make_wsgi_app()
