from pyramid.config import Configurator
from pyramid_mako import add_mako_renderer
from c2corg_ui.lib.cacheversion import version_cache_buster, CACHE_PATH


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    add_mako_renderer(config, '.html')

    # Register a tween to get back the cache buster path.
    config.add_tween("c2corg_ui.lib.cacheversion.CachebusterTween")

    _add_static_view(config, 'static', 'c2corg_ui:static')
    config.add_static_view('node_modules', settings.get('node_modules_path'),
                           cache_max_age=3600)
    config.add_static_view('closure', settings.get('closure_library_path'),
                           cache_max_age=3600)

    config.add_route('index', '/')

    config.add_route('waypoints_view', '/waypoints/{id}/{lang}')
    config.add_route('waypoints_index_default', '/waypoints')
    config.add_route('waypoints_index', '/waypoints/list*filters')
    config.add_route('waypoints_add', '/waypoints/add')
    config.add_route('waypoints_edit', '/waypoints/edit/{id}/{lang}')
    config.add_route('waypoints_history', '/waypoints/history/{id}/{lang}')
    config.add_route('waypoints_archive',
                     '/waypoints/{id}/{lang}/{version:\d+}')
    config.add_route(
        'waypoints_diff', '/waypoints/diff/{id}/{lang}/{v1}/{v2}')

    config.add_route('routes_view', '/routes/{id}/{lang}')
    config.add_route('routes_index_default', '/routes')
    config.add_route('routes_index', '/routes/list*filters')
    config.add_route('routes_add', '/routes/add')
    config.add_route('routes_edit', '/routes/edit/{id}/{lang}')
    config.add_route('routes_history', '/routes/history/{id}/{lang}')
    config.add_route('routes_archive', '/routes/{id}/{lang}/{version:\d+}')
    config.add_route(
        'routes_diff', '/routes/diff/{id}/{lang}/{v1}/{v2}')

    config.add_route('auth', '/auth')

    config.scan(ignore='c2corg_ui.tests')
    return config.make_wsgi_app()


def _add_static_view(config, name, path):
    config.add_static_view(
        name=name,
        path=path,
        cache_max_age=int(config.get_settings()['cache_max_age']),
    )
    config.add_cache_buster(path, version_cache_buster)
    CACHE_PATH.append(name)
