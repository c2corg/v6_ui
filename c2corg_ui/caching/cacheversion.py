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
        self.expected_cache_version = registry.settings.get('cache_version')

    @staticmethod
    def is_hexa(str):
        try:
            int(str, 16)
            return True
        except:  # noqa
            return False

    @staticmethod
    def is_git_hash(str):
        # 592d5db = git rev-parse --short HEAD
        if '-' in str:
            # when in dev. mode, the cache key is appended
            # with a timestamp, e.g. "592d5db-123456789"
            str = str.split('-')[0]
        return len(str) == 7 and CachebusterTween.is_hexa(str)

    def __call__(self, request):
        path = request.path_info.split('/')
        if not path[1] in CACHE_PATH:
            # Simply forward the request unmodified.
            return self.handler(request)

        received_hash = path[2]
        if CachebusterTween.is_git_hash(received_hash):
            # Remove the cache buster only if it looks like a git hash. This
            # distinction is necessary to get debug mode work.
            path.pop(2)
            request.path_info = '/' .join(path)

        # Prepare a response
        response = self.handler(request)

        headers = response.headers
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Headers'] = \
            'X-Requested-With, Content-Type'

        # Prevent caching if the requested version does not match the
        # one we are configured to serve. This is intended to prevent
        # cache poisoning.
        # noqa See http://stackoverflow.com/questions/49547/making-sure-a-web-page-is-not-cached-across-all-browsers
        if received_hash != self.expected_cache_version:
                headers['Cache-Control'] = \
                        'no-cache, no-store, must-revalidate'
                headers['Pragma'] = 'no-cache'
                headers['Expires'] = '0'

        return response
