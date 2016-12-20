import logging

import time
from dogpile.cache import make_region
from dogpile.cache.api import NO_VALUE
from redis.connection import BlockingConnectionPool

log = logging.getLogger(__name__)

# prefix for all cache keys
KEY_PREFIX = 'c2corg_ui'

# cache version (for production the current git revisions, for development
# the git revision and a timestamp).
CACHE_VERSION = None

# the current status (up/down) of the cache
cache_status = None


def create_region(name):
    return make_region(
        # prefix all keys (e.g. returns 'c2corg_ui_main:detail:3575-1-c796286')
        key_mangler=lambda key: '{0}:{1}:{2}'.format(KEY_PREFIX, name, key)
    )

cache_document_detail = create_region('detail')
cache_document_archive = create_region('archive')
cache_document_history = create_region('history')
cache_document_diff = create_region('diff')
cache_static_pages = create_region('pages')
cache_sitemap = create_region('sitemap')

caches = [
    cache_document_detail,
    cache_document_archive,
    cache_document_history,
    cache_document_diff,
    cache_static_pages,
    cache_sitemap
]


def configure_caches(settings):
    global KEY_PREFIX
    global CACHE_VERSION
    global cache_status
    KEY_PREFIX = settings['redis.cache_key_prefix']

    # append a timestamp to the cache key when running in dev. mode
    # (to make sure that the cache values are invalidated when the dev.
    # server reloads when the code changes)
    cache_version = settings['cache_version']
    if settings['cache_version_timestamp'] == 'True':
        cache_version = '{0}-{1}'.format(cache_version, int(time.time()))
    CACHE_VERSION = cache_version

    log.debug('Cache version {0}'.format(CACHE_VERSION))
    log.debug('Cache Redis: {0}'.format(settings['redis.url']))

    redis_pool = BlockingConnectionPool.from_url(
        settings['redis.url'],
        max_connections=int(settings['redis.cache_pool']),
        socket_connect_timeout=float(settings['redis.socket_connect_timeout']),
        socket_timeout=float(settings['redis.socket_timeout']),
        timeout=float(settings['redis.pool_timeout'])
    )

    for cache in caches:
        cache.configure(
            'dogpile.cache.redis',
            arguments={
                'connection_pool': redis_pool,
                'distributed_lock': True,
                'lock_timeout': 15,  # 15 seconds (dogpile lock)
                'redis_expiration_time': int(settings['redis.expiration_time'])
            },
            replace_existing_backend=True
        )

    if settings.get('redis.cache_status_refresh_period'):
        refresh_period = int(settings['redis.cache_status_refresh_period'])
    else:
        refresh_period = 30
    cache_status = CacheStatus(refresh_period)


class CachedPage(object):
    def __init__(self, api_cache_key, page_html):
        self.api_cache_key = api_cache_key
        self.page_html = page_html


def get_or_create(cache, key, creator):
    """ Try to get the value for the given key from the cache. In case of
    errors fallback to the creator function (e.g. get the data from the API).
    """
    if cache_status.is_down():
        log.warn('Not getting value from cache because it seems to be down')
        return creator()

    try:
        value = cache.get_or_create(key, creator, expiration_time=-1)
        cache_status.request_success()
        return value
    except:
        log.error('Getting value from cache failed', exc_info=True)
        cache_status.request_failure()
        return creator()


def get(cache, key):
    """ Try to get the value for the given key from the cache. In case of
    errors, return NO_VALUE.
    """
    if cache_status.is_down():
        log.warn('Not getting value from cache because it seems to be down')
        return NO_VALUE

    try:
        value = cache.get(key, ignore_expiration=True)
        cache_status.request_success()
        return value
    except:
        log.error('Getting value from cache failed', exc_info=True)
        cache_status.request_failure()
        return NO_VALUE


def set(cache, key, value):
    """ Try to set the value with the given key in the cache. In case of
    errors, log the error and continue.
    """
    if cache_status.is_down():
        log.warn('Not setting value in cache because it seems to be down')
        return

    try:
        cache.set(key, value)
        cache_status.request_success()
    except:
        log.error('Setting value in cache failed', exc_info=True)
        cache_status.request_failure()


class CacheStatus(object):
    """ To avoid that requests are made to the cache if it is down, the status
    of the last requests is stored. If a request in the 30 seconds failed,
    no new request will be made.
    """

    def __init__(self, refresh_period=30):
        self.up = True
        self.status_time = time.time()
        self.refresh_period = refresh_period

    def is_down(self):
        if self.up:
            return False

        # no request is made to the cache if it is down. but if the cache
        # status should be refreshed, a request is made even though it was
        # down before.
        should_refresh = time.time() - self.status_time > self.refresh_period
        return not should_refresh

    def request_failure(self):
        self.up = False
        self.status_time = time.time()

    def request_success(self):
        self.up = True
        self.status_time = time.time()
