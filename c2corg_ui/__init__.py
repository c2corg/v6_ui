from pyramid.config import Configurator
from pyramid_mako import add_mako_renderer
from c2corg_ui.lib.cacheversion import version_cache_buster, CACHE_PATH
from pyramid.httpexceptions import (
    HTTPBadRequest, HTTPInternalServerError)
from pyramid.view import view_config
from pyramid.view import notfound_view_config


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
    config.add_route('waypoints_index', '/waypoints')
    config.add_route('waypoints_sitemap_default', '/waypoints/sitemap')
    config.add_route('waypoints_sitemap', '/waypoints/sitemap*filters')
    config.add_route('waypoints_add', '/waypoints/add')
    config.add_route('waypoints_edit', '/waypoints/edit/{id}/{lang}')
    config.add_route('waypoints_history', '/waypoints/history/{id}/{lang}')
    config.add_route('waypoints_archive',
                     '/waypoints/{id}/{lang}/{version:\d+}')
    config.add_route(
        'waypoints_diff', '/waypoints/diff/{id}/{lang}/{v1}/{v2}')

    config.add_route('routes_view', '/routes/{id}/{lang}')
    config.add_route('routes_index', '/routes')
    config.add_route('routes_sitemap_default', '/routes/sitemap')
    config.add_route('routes_sitemap', '/routes/sitemap*filters')
    config.add_route('routes_add', '/routes/add')
    config.add_route('routes_edit', '/routes/edit/{id}/{lang}')
    config.add_route('routes_history', '/routes/history/{id}/{lang}')
    config.add_route('routes_archive', '/routes/{id}/{lang}/{version:\d+}')
    config.add_route(
        'routes_diff', '/routes/diff/{id}/{lang}/{v1}/{v2}')

    config.add_route('outings_view', '/outings/{id}/{lang}')
    config.add_route('outings_index', '/outings')
    config.add_route('outings_sitemap_default', '/outings/sitemap')
    config.add_route('outings_sitemap', '/outings/sitemap*filters')
    config.add_route('outings_add', '/outings/add')
    config.add_route('outings_edit', '/outings/edit/{id}/{lang}')
    config.add_route('outings_history', '/outings/history/{id}/{lang}')
    config.add_route('outings_archive',
                     '/outings/{id}/{lang}/{version:\d+}')
    config.add_route(
        'outings_diff', '/outings/diff/{id}/{lang}/{v1}/{v2}')

    config.add_route('auth', '/auth')

    config.add_route('account', '/account')

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


class NotFound():

    notFound = 'c2corg_ui:templates/404.html'

    def __init__(self, context, request):
        self.context = context
        self.request = request
        self.settings = request.registry.settings

    @view_config(context=HTTPInternalServerError, renderer=notFound)
    @view_config(context=HTTPBadRequest, renderer=notFound)
    @notfound_view_config(renderer=notFound)
    def notfound(self):
        self.request.response.status_code = self.context.code
        return {
          'api_url': self.settings['api_url'],
          'error_msg': self.context.detail if self.context.detail else '',
          'ign_api_key': self.settings['ign_api_key']
        }
