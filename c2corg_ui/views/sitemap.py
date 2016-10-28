import datetime
import logging

from c2corg_common.document_types import ROUTE_TYPE
from c2corg_ui.views import get_with_etag
from c2corg_ui.views.document import get_slug, ROUTE_NAMES
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
        old_api_cache_key = None

        not_modified, api_cache_key, body = get_with_etag(
            self.settings, Sitemap._API_ROUTE, old_api_cache_key)

        base_url = self.request.route_url(
            'sitemap', doc_type='-DOC_TYPE-', i='-I-')
        lastmod = datetime.datetime.utcnow().isoformat()

        return self._return_xml(
            generate_sitemap_index(body, base_url, lastmod))

    @view_config(route_name='sitemap')
    def sitemap(self):
        doc_type = self.request.matchdict['doc_type']
        i = self.request.matchdict['i']

        old_api_cache_key = None

        url = '{}/{}/{}'.format(Sitemap._API_ROUTE, doc_type, i)
        not_modified, api_cache_key, body = get_with_etag(
            self.settings, url, old_api_cache_key)

        return self._return_xml(generate_sitemap(body, doc_type, self.request))

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
