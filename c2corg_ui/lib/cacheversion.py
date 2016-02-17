# Inspired from GeoMapFish
# noqa https://github.com/camptocamp/c2cgeoportal/blob/master/c2cgeoportal/lib/icacheversion.py

from urllib.parse import urljoin


CACHE_PATH = []


def version_cache_buster(request, subpath, kw):
    # TODO get cache version from server caching?
    cache_version = request.registry.settings.get('cache_version')
    return urljoin(cache_version + '/', subpath), kw


class CachebusterTween:
    ''' Get back the cachebuster URL. '''
    def __init__(self, handler, registry):
        self.handler = handler

    def __call__(self, request):
        path = request.path_info.split('/')
        if path[1] in CACHE_PATH:
            # remove the cache buster
            path.pop(2)
            request.path_info = '/' .join(path)

        response = self.handler(request)

        if path[1] in CACHE_PATH:
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Headers'] = \
                'X-Requested-With, Content-Type'

        return response
