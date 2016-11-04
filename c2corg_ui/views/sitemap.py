import datetime
import logging

from c2corg_common.document_types import ROUTE_TYPE
from c2corg_ui import caching
from c2corg_ui.caching import cache_sitemap
from c2corg_ui.views import get_with_etag
from c2corg_ui.views.document import get_slug, ROUTE_NAMES, get_or_create, \
    get_etag_key_default
from pyramid.view import view_config

log = logging.getLogger(__name__)


class Sitemap(object):

    _API_ROUTE = 'sitemaps'

    def __init__(self, request):
        self.request = request
        self.settings = request.registry.settings
        self.prefix = ''

    @view_config(route_name='sitemap_index')
    def index(self):
        """ Returns a sitemap index.
        See http://www.sitemaps.org/protocol.html#index
        """
        def load_data(old_api_cache_key=None):
            not_modified, api_cache_key, body = get_with_etag(
                self.settings, Sitemap._API_ROUTE, old_api_cache_key)
            return not_modified, api_cache_key, (body, )

        def render_page(sitemap_data):
            base_url = self.request.route_url(
                'sitemap', doc_type='-DOC_TYPE-', i='-I-')
            lastmod = datetime.datetime.utcnow().isoformat()
            return generate_sitemap_index(sitemap_data, base_url, lastmod)

        return get_or_create(
            (None, ), cache_sitemap, load_data, render_page, get_cache_key,
            get_etag_key_default, self._return_xml, debug=False,
            request=self.request)

    @view_config(route_name='sitemap')
    def sitemap(self):
        """ Returns a sitemap for the given document type (paginated).
        """
        doc_type = self.request.matchdict['doc_type']
        i = self.request.matchdict['i']

        def load_data(old_api_cache_key=None):
            url = '{}/{}/{}'.format(Sitemap._API_ROUTE, doc_type, i)
            not_modified, api_cache_key, body = get_with_etag(
                self.settings, url, old_api_cache_key)
            return not_modified, api_cache_key, (body, )

        def render_page(sitemap_data):
            return generate_sitemap(sitemap_data, doc_type, self.request)

        return get_or_create(
            (doc_type, i), cache_sitemap, load_data, render_page,
            get_cache_key, get_etag_key_default, self._return_xml, debug=False,
            request=self.request)

    def _return_xml(self, content):
        response = self.request.response
        response.text = content
        response.charset = 'utf-8'
        response.content_disposition = 'attachment; filename=sitemap.xml'
        response.content_type = 'text/xml'

        return response


def generate_sitemap_index(
        sitemap_index_data, base_url, lastmod, pretty_print=False):
    lines = list(['<?xml version="1.0" encoding="UTF-8"?>'])
    lines.append('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')  # noqa

    for sitemap in sitemap_index_data['sitemaps']:
        loc = base_url. \
                  replace('-DOC_TYPE-', sitemap['doc_type']). \
                  replace('-I-', str(sitemap['i']))
        lines.append(
            '<sitemap><loc>{}</loc><lastmod>{}</lastmod></sitemap>'.format(
                loc, lastmod))

    lines.append('</sitemapindex>')
    lines.append('')

    if pretty_print:
        return '\n'.join(lines)
    else:
        return ''.join(lines)


def generate_sitemap(sitemap_data, doc_type, request, pretty_print=False):
    lines = list(['<?xml version="1.0" encoding="UTF-8"?>'])
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')  # noqa

    route_name = ROUTE_NAMES.get(doc_type)
    if not route_name:
        log.warn('Sitemap requested for document type without route: {}'.
                 format(doc_type))
        return None
    is_route = doc_type == ROUTE_TYPE

    for page in sitemap_data['pages']:
        url = request.route_url(
            route_name + '_view',
            id=page['document_id'],
            lang=page['lang'],
            slug=get_slug(page, is_route))

        lines.append(
            '<url>'
            '<loc>{}</loc>'
            '<lastmod>{}</lastmod>'
            '<changefreq>{}</changefreq>'
            '</url>'.format(
                url, page['lastmod'], 'weekly'
            ))

    lines.append('</urlset>')
    lines.append('')

    if pretty_print:
        return '\n'.join(lines)
    else:
        return ''.join(lines)


def get_cache_key(doc_type=None, i=None):
    if doc_type:
        return '{}-{}-{}-{}'.format(
            doc_type, i, datetime.date.today().isoformat(),
            caching.CACHE_VERSION)
    else:
        return '{}-{}'.format(
            datetime.date.today().isoformat(), caching.CACHE_VERSION)
