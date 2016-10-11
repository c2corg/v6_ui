import requests
from pyramid.config import Configurator
from pyramid.httpexceptions import (
    HTTPBadRequest, HTTPInternalServerError)
from pyramid.view import notfound_view_config
from pyramid.view import view_config
from pyramid_mako import add_mako_renderer

from c2corg_ui.caching import configure_caches
from c2corg_ui.caching.cacheversion import version_cache_buster, CACHE_PATH


def main(global_config, **settings):

    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    add_mako_renderer(config, '.html')

    # set up redis cache
    configure_caches(settings)

    # configure connection pool for http requests
    max_connections = int(settings.get('http_request_connection_pool_size'))
    http_requests.session = requests.Session()
    # see: http://docs.python-requests.org/en/master/api/#requests.adapters.HTTPAdapter  # noqa
    # and: http://urllib3.readthedocs.io/en/1.2.1/managers.html
    adapter = requests.adapters.HTTPAdapter(
        pool_connections=1,  # number of pools (one pool per host)
        pool_maxsize=max_connections  # connections per pool
    )
    http_requests.session.mount('http://', adapter)

    # Register a tween to get back the cache buster path.
    config.add_tween("c2corg_ui.caching.cacheversion.CachebusterTween")

    # view for assets with cache buster
    _add_static_view(config, 'static', 'c2corg_ui:static')

    # static views only used in debug mode
    config.add_static_view('node_modules', settings.get('node_modules_path'),
                           cache_max_age=3600)
    config.add_static_view('closure', settings.get('closure_library_path'),
                           cache_max_age=3600)

    # page views
    config.add_route('index', '/')

    config.add_route('waypoints_index', '/waypoints')
    config.add_route('waypoints_sitemap_default', '/waypoints/sitemap')
    config.add_route('waypoints_sitemap', '/waypoints/sitemap*filters')
    config.add_route('waypoints_add', '/waypoints/add')
    config.add_route('waypoints_edit', '/waypoints/edit/{id:\d+}/{lang}')
    config.add_route('waypoints_history', '/waypoints/history/{id:\d+}/{lang}')
    config.add_route('waypoints_archive',
                     '/waypoints/{id:\d+}/{lang}/{version:\d+}')
    config.add_route('waypoints_view', '/waypoints/{id:\d+}/{lang}/{slug}')
    config.add_route('waypoints_view_id_lang', '/waypoints/{id:\d+}/{lang}')
    config.add_route('waypoints_view_id', '/waypoints/{id:\d+}')
    config.add_route(
        'waypoints_diff', '/waypoints/diff/{id:\d+}/{lang}/{v1}/{v2}')
    config.add_route('waypoints_preview', '/waypoints/preview')

    config.add_route('routes_index', '/routes')
    config.add_route('routes_sitemap_default', '/routes/sitemap')
    config.add_route('routes_sitemap', '/routes/sitemap*filters')
    config.add_route('routes_add', '/routes/add')
    config.add_route('routes_edit', '/routes/edit/{id:\d+}/{lang}')
    config.add_route('routes_history', '/routes/history/{id:\d+}/{lang}')
    config.add_route('routes_archive', '/routes/{id:\d+}/{lang}/{version:\d+}')
    config.add_route('routes_view', '/routes/{id:\d+}/{lang}/{slug}')
    config.add_route('routes_view_id_lang', '/routes/{id:\d+}/{lang}')
    config.add_route('routes_view_id', '/routes/{id:\d+}')
    config.add_route(
        'routes_diff', '/routes/diff/{id:\d+}/{lang}/{v1}/{v2}')
    config.add_route('routes_preview', '/routes/preview')

    config.add_route('outings_index', '/outings')
    config.add_route('outings_sitemap_default', '/outings/sitemap')
    config.add_route('outings_sitemap', '/outings/sitemap*filters')
    config.add_route('outings_add', '/outings/add')
    config.add_route('outings_edit', '/outings/edit/{id:\d+}/{lang}')
    config.add_route('outings_history', '/outings/history/{id:\d+}/{lang}')
    config.add_route('outings_archive',
                     '/outings/{id:\d+}/{lang}/{version:\d+}')
    config.add_route('outings_view', '/outings/{id:\d+}/{lang}/{slug}')
    config.add_route('outings_view_id_lang', '/outings/{id:\d+}/{lang}')
    config.add_route('outings_view_id', '/outings/{id:\d+}')
    config.add_route(
        'outings_diff', '/outings/diff/{id:\d+}/{lang}/{v1}/{v2}')
    config.add_route('outings_preview', '/outings/preview')

    config.add_route('images_index', '/images')
    config.add_route('images_sitemap_default', '/images/sitemap')
    config.add_route('images_sitemap', '/images/sitemap*filters')
    config.add_route('images_edit', '/images/edit/{id:\d+}/{lang}')
    config.add_route('images_history', '/images/history/{id:\d+}/{lang}')
    config.add_route('images_archive',
                     '/images/{id:\d+}/{lang}/{version:\d+}')
    config.add_route('images_view', '/images/{id:\d+}/{lang}/{slug}')
    config.add_route('images_view_id_lang', '/images/{id:\d+}/{lang}')
    config.add_route('images_view_id', '/images/{id:\d+}')
    config.add_route(
        'images_diff', '/images/diff/{id:\d+}/{lang}/{v1}/{v2}')
    config.add_route('images_preview', '/images/preview')

    config.add_route('areas_index', '/areas')
    config.add_route('areas_sitemap_default', '/areas/sitemap')
    config.add_route('areas_sitemap', '/areas/sitemap*filters')
    config.add_route('areas_edit', '/areas/edit/{id:\d+}/{lang}')
    config.add_route('areas_history', '/areas/history/{id:\d+}/{lang}')
    config.add_route('areas_archive',
                     '/areas/{id:\d+}/{lang}/{version:\d+}')
    config.add_route('areas_view', '/areas/{id:\d+}/{lang}/{slug}')
    config.add_route('areas_view_id_lang', '/areas/{id:\d+}/{lang}')
    config.add_route('areas_view_id', '/areas/{id:\d+}')
    config.add_route(
        'areas_diff', '/areas/diff/{id:\d+}/{lang}/{v1}/{v2}')
    config.add_route('areas_preview', '/areas/preview')

    config.add_route('auth', '/auth')
    config.add_route('auth-sso', '/auth-sso')

    config.add_route('account', '/account')

    config.scan(ignore='c2corg_ui.tests')
    return config.make_wsgi_app()


def _add_static_view(config, name, path):
    # assets with a cache buster use a far-in-the-future "max-age" of 1 year
    config.add_static_view(
        name=name,
        path=path,
        cache_max_age=60*60*24*365,  # 1 year
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
          'ign_api_key': self.settings['ign_api_key'],
          'bing_api_key': self.settings['bing_api_key'],
          'ganalytics_key': self.settings['ganalytics_key'],
          'image_backend_url': self.settings['image_backend_url'],
          'image_url': self.settings['image_url'],
          'discourse_url': self.settings['discourse_url'],
          'error_msg': self.context.detail if self.context.detail else ''
        }


class HTTPRequests():
    # a `requests` session object initialized in `main()`
    session = None
http_requests = HTTPRequests()
