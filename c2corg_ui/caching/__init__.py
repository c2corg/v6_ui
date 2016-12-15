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
        timeout=3,  # 3 seconds (waiting for connection)
        socket_timeout=3  # 3 seconds (timeout on open socket)
    )

    for cache in caches:
        cache.configure(
            'dogpile.cache.redis',
            arguments={
                'connection_pool': redis_pool,
                'distributed_lock': True,
                'lock_timeout': 15  # 15 seconds (dogpile lock)
            },
            replace_existing_backend=True
        )


class CachedPage(object):
    def __init__(self, api_cache_key, page_html):
        self.api_cache_key = api_cache_key
        self.page_html = page_html


def get_or_create(cache, key, creator):
    """ Try to get the value for the given key from the cache. In case of
    errors fallback to the creator function (e.g. load from the database).
    """
    try:
        return cache.get_or_create(key, creator, expiration_time=-1)
    except:
        log.error('Getting value from cache failed', exc_info=True)
        return creator()


def get(cache, key):
    """ Try to get the value for the given key from the cache. In case of
    errors, return NO_VALUE.
    """
    try:
        return cache.get(key, ignore_expiration=True)
    except:
        log.error('Getting value from cache failed', exc_info=True)
        return NO_VALUE


def set(cache, key, value):
    """ Try to set the value with the given key in the cache. In case of
    errors, log the error and continue.
    """
    try:
        cache.set(key, value)
    except:
        log.error('Setting value in cache failed', exc_info=True)
