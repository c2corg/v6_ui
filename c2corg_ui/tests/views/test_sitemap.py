import json
import os

from c2corg_common.document_types import WAYPOINT_TYPE, ROUTE_TYPE, IMAGE_TYPE
from c2corg_ui.tests import read_file
from c2corg_ui.views.sitemap import Sitemap, generate_sitemap_index, \
    generate_sitemap
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
            url = '/sitemap.xml'.format()
            resp = self.app.get(url, status=200)
            body = str(resp.body)

            self.assertIn('<loc>http://localhost/sitemaps/w/0.xml</loc>', body)

    def test_generate_sitemap_waypoints(self):
        sitemap_data = json.loads(read_file(
            os.path.join(base_path, 'data', 'sitemaps_w_0.json')))
        expected_sitemap = read_file(
            os.path.join(base_path, 'data', 'sitemaps_w_0.xml'))

        # set the registry so that the routes can be generated
        self.request.registry = self.app.app.registry

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

        sitemap = generate_sitemap(
            sitemap_data,
            IMAGE_TYPE,
            self.view.request,
            pretty_print=True
        )
        self.assertEqual(sitemap, expected_sitemap)

    def test_sitemap_waypoints(self):
        with HTTMock(sitemap_waypoints_mock):
            url = '/sitemaps/w/0.xml'.format()
            resp = self.app.get(url, status=200)
            body = str(resp.body)

            self.assertIn(
                '<loc>http://localhost/waypoints/37191/fr/patraflon</loc>',
                body)


@all_requests
def sitemap_index_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'sitemap_index.json'),
        'W/"2016-10-27-6f3efb8"'
    )


@all_requests
def sitemap_waypoints_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'sitemaps_w_0.json'),
        'W/"w-0-2016-10-27-6f3efb8"'
    )
