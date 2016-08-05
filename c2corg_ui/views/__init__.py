import logging

from pyramid.httpexceptions import HTTPNotModified
from pyramid.renderers import render

from c2corg_ui.caching import CACHE_VERSION, cache_static_pages

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
        cache_static_pages.get_or_create(
            cache_key, render_page, expiration_time=-1))


def get_page_cache_key(page_key):
    return '{0}-{1}'.format(page_key, CACHE_VERSION)
