import json
import os

from c2corg_common.document_types import WAYPOINT_TYPE, ROUTE_TYPE, IMAGE_TYPE
from c2corg_ui import caching
from c2corg_ui.caching import cache_sitemap, CachedPage
from c2corg_ui.tests import read_file
from c2corg_ui.views.sitemap import Sitemap, generate_sitemap_index, \
    generate_sitemap, get_cache_key
from dogpile.cache.api import NO_VALUE
from httmock import all_requests, HTTMock

from c2corg_ui.tests.views import BaseTestUi, handle_mock_request

base_path = os.path.dirname(os.path.abspath(__file__))


class TestSitemapUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix('sitemap')
        BaseTestUi.setUp(self)
        self.view = Sitemap(request=self.request)

    def test_generate_sitemap_index(self):
        sitemap_data = json.loads(read_file(
            os.path.join(base_path, 'data', 'sitemap_index.json')))
        expected_sitemap = read_file(
            os.path.join(base_path, 'data', 'sitemap.xml'))

        sitemap = generate_sitemap_index(
            sitemap_data,
            'https://www.camptocamp.org/sitemaps/-DOC_TYPE-/-I-.xml',
            '2016-01-01T00:00:00+00:00',
            pretty_print=True
        )
        self.assertEqual(sitemap, expected_sitemap)

    def test_sitemap_index(self):
        with HTTMock(sitemap_index_mock):
            url = '/sitemap.xml'
            resp = self.app.get(url, status=200)
            body = str(resp.body)

            self.assertIn(
                '<loc>https://localhost/sitemaps/w/0.xml</loc>', body)

    def test_sitemap_index_etag(self):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(sitemap_index_mock):
            url = '/sitemap.xml'
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertTrue(etag.endswith(caching.CACHE_VERSION + '"'))

            # then request the page again with the etag
            headers = {
                'If-None-Match': etag
            }
            self.app.get(url, status=304, headers=headers)

            # if a wrong/outdated etag is provided, the full page is returned
            headers = {
                'If-None-Match': 'W/"1971-01-01-es123df"'
            }
            self.app.get(url, status=200, headers=headers)

    def test_sitemap_index_caching(self):
        url = '/sitemap.xml'
        cache_key = get_cache_key()

        with HTTMock(sitemap_index_mock):
            cache_sitemap.delete(cache_key)
            cache_value = cache_sitemap.get(cache_key)
            self.assertEqual(cache_value, NO_VALUE)

            # check that the response is cached
            self.app.get(url, status=200)

            cache_value = cache_sitemap.get(cache_key)
            self.assertNotEqual(cache_value, NO_VALUE)

            # check that values are returned from the cache
            fake_cache_value = CachedPage('2016-10-27-6f3efb8', 'fake page')
            cache_sitemap.set(cache_key, fake_cache_value)

            response = self.app.get(url, status=200)
            self.assertEqual(response.text, 'fake page')

        # simulate that the version of the document in the api has changed
        with HTTMock(sitemap_index_mock_new):
            response = self.app.get(url, status=200)
            self.assertNotEqual(response.text, 'fake page')

    def test_generate_sitemap_waypoints(self):
        sitemap_data = json.loads(read_file(
            os.path.join(base_path, 'data', 'sitemaps_w_0.json')))
        expected_sitemap = read_file(
            os.path.join(base_path, 'data', 'sitemaps_w_0.xml'))

        # set the registry so that the routes can be generated
        self.request.registry = self.app.app.registry
        self.request.environ['HTTP_HOST'] = 'example.com'

        sitemap = generate_sitemap(
            sitemap_data,
            WAYPOINT_TYPE,
            self.view.request,
            pretty_print=True
        )
        self.assertEqual(sitemap, expected_sitemap)

    def test_generate_sitemap_routes(self):
        sitemap_data = json.loads(read_file(
            os.path.join(base_path, 'data', 'sitemaps_r_0.json')))
        expected_sitemap = read_file(
            os.path.join(base_path, 'data', 'sitemaps_r_0.xml'))

        # set the registry so that the routes can be generated
        self.request.registry = self.app.app.registry
        self.request.environ['HTTP_HOST'] = 'example.com'

        sitemap = generate_sitemap(
            sitemap_data,
            ROUTE_TYPE,
            self.view.request,
            pretty_print=True
        )
        self.assertEqual(sitemap, expected_sitemap)

    def test_generate_sitemap_images(self):
        sitemap_data = json.loads(read_file(
            os.path.join(base_path, 'data', 'sitemaps_i_0.json')))
        expected_sitemap = read_file(
            os.path.join(base_path, 'data', 'sitemaps_i_0.xml'))

        # set the registry so that the routes can be generated
        self.request.registry = self.app.app.registry
        self.request.environ['HTTP_HOST'] = 'example.com'

        sitemap = generate_sitemap(
            sitemap_data,
            IMAGE_TYPE,
            self.view.request,
            pretty_print=True
        )
        self.assertEqual(sitemap, expected_sitemap)

    def test_sitemap_waypoints(self):
        with HTTMock(sitemap_waypoints_mock):
            url = '/sitemaps/w/0.xml'
            resp = self.app.get(url, status=200)
            body = str(resp.body)

            self.assertIn(
                '<loc>https://localhost/waypoints/37191/fr/patraflon</loc>',
                body)

    def test_sitemap_waypoints_etag(self):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(sitemap_waypoints_mock):
            url = '/sitemaps/w/0.xml'
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertTrue(etag.endswith(caching.CACHE_VERSION + '"'))
            self.assertTrue(etag.startswith('W/"w-0-'))

            # then request the page again with the etag
            headers = {
                'If-None-Match': etag
            }
            self.app.get(url, status=304, headers=headers)

            # if a wrong/outdated etag is provided, the full page is returned
            headers = {
                'If-None-Match': 'W/"w-0-1971-01-01-es123df"'
            }
            self.app.get(url, status=200, headers=headers)

    def test_sitemap_waypoints_caching(self):
        url = '/sitemaps/w/0.xml'
        cache_key = get_cache_key(WAYPOINT_TYPE, 0)

        with HTTMock(sitemap_waypoints_mock):
            cache_sitemap.delete(cache_key)
            cache_value = cache_sitemap.get(cache_key)
            self.assertEqual(cache_value, NO_VALUE)

            # check that the response is cached
            self.app.get(url, status=200)

            cache_value = cache_sitemap.get(cache_key)
            self.assertNotEqual(cache_value, NO_VALUE)

            # check that values are returned from the cache
            fake_cache_value = CachedPage(
                'w-0-2016-10-27-6f3efb8', 'fake page')
            cache_sitemap.set(cache_key, fake_cache_value)

            response = self.app.get(url, status=200)
            self.assertEqual(response.text, 'fake page')

        # simulate that the version of the document in the api has changed
        with HTTMock(sitemap_waypoints_mock_new):
            response = self.app.get(url, status=200)
            self.assertNotEqual(response.text, 'fake page')


@all_requests
def sitemap_index_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'sitemap_index.json'),
        'W/"2016-10-27-6f3efb8"'
    )


@all_requests
def sitemap_index_mock_new(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'sitemap_index.json'),
        'W/"2016-10-27-6f3efb9"'
    )


@all_requests
def sitemap_waypoints_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'sitemaps_w_0.json'),
        'W/"w-0-2016-10-27-6f3efb8"'
    )


@all_requests
def sitemap_waypoints_mock_new(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'sitemaps_w_0.json'),
        'W/"w-0-2016-10-27-6f3efb9"'
    )
