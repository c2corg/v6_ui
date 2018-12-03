import logging
import re

from pyramid.httpexceptions import HTTPNotModified, HTTPNotFound, \
    HTTPInternalServerError
from pyramid.renderers import render

from c2corg_ui.caching import CACHE_VERSION, cache_static_pages
from c2corg_common.utils.caching import get_or_create
from c2corg_ui import http_requests

log = logging.getLogger(__name__)


def etag_cache(request, etag_key):
    """Use the HTTP Entity Tag cache for Browser side caching
    If a "If-None-Match" header is found, and equivalent to ``key``,
    then a ``304`` HTTP message will be returned with the ETag to tell
    the browser that it should use its current cache of the page.
    Otherwise, the ETag header will be added to the response headers.
    Suggested use is within a view like so:
    .. code-block:: python
        def view(request):
            etag_cache(request, key=1)
            return render('/splash.mako')
    .. note::
        This works because etag_cache will raise an HTTPNotModified
        exception if the ETag received matches the key provided.

    Implementation adapted from:
    https://github.com/Pylons/pylons/blob/799c310/pylons/controllers/util.py#L148  # noqa
    """
    # we are always using a weak ETag validator
    etag = 'W/"%s"' % etag_key
    etag_matcher = request.if_none_match

    if str(etag_key) in etag_matcher:
        headers = [
            ('ETag', etag)
        ]
        log.debug("ETag match, returning 304 HTTP Not Modified Response")
        raise HTTPNotModified(headers=headers)
    else:
        request.response.headers['ETag'] = etag
        log.debug("ETag didn't match, returning response object")


def get_response(request, page_html):
    request.response.text = page_html
    return request.response


def get_or_create_page(
        page_key, template, template_input, request, debug, no_etag=False):
    """ Get a page from the cache using the given `page_key`, if not render
     the page and update the cache.
    """
    def render_page():
        return render(template, template_input, request)

    if debug:
        return get_response(request, render_page())

    if not no_etag:
        etag_cache(request, CACHE_VERSION)

    cache_key = get_page_cache_key(page_key)

    return get_response(
        request,
        get_or_create(cache_static_pages, cache_key, render_page))


def get_page_cache_key(page_key):
    return '{0}-{1}'.format(page_key, CACHE_VERSION)


def call_api(settings, url, headers=None):
    if 'api_url_internal' in settings and settings['api_url_internal']:
        api_url = settings['api_url_internal']
        if 'api_url_host' in settings and settings['api_url_host']:
            headers = {} if headers is None else headers
            headers['Host'] = settings['api_url_host']
    else:
        api_url = settings['api_url']
    url = '%s/%s' % (api_url, url)
    if log.isEnabledFor(logging.DEBUG):
        log.debug('API: %s %s', 'GET', url)

    try:
        resp = http_requests.session.get(url, headers=headers)
    except:  # noqa
        log.error('Request failed: {0}'.format(url), exc_info=1)
        raise

    if resp.status_code == 304:
        # no content for 'not modified'
        return resp, {}
    else:
        return resp, resp.json()


def get_with_etag(settings, url, old_api_cache_key=None):
    headers = None
    if old_api_cache_key:
        headers = {'If-None-Match': 'W/"{0}"'.format(old_api_cache_key)}

    resp, document = call_api(settings, url, headers)

    api_cache_key = None
    if resp.headers.get('ETag'):
        api_cache_key = _get_api_cache_key_from_etag(
            resp.headers.get('ETag'))

    if resp.status_code in [200, 304] and not api_cache_key:
        log.warn('no etag found for {0}'.format(url))

    if resp.status_code == 404:
        raise HTTPNotFound()
    elif resp.status_code == 304:
        return True, api_cache_key, None
    elif resp.status_code != 200:
        raise HTTPInternalServerError(
            "An error occurred while loading the document")

    return False, api_cache_key, document


IF_NONE_MATCH = re.compile(r'(?:W/)?(?:"([^"]*)",?\s*)')


def _get_api_cache_key_from_etag(etag):
    if_none_matches = IF_NONE_MATCH.findall(etag)

    if if_none_matches:
        return if_none_matches[0]
