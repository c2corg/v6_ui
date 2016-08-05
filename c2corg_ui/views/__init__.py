import logging

from pyramid.httpexceptions import HTTPNotModified

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
