import os

from dogpile.cache.api import NO_VALUE
from httmock import HTTMock, all_requests

from c2corg_ui.caching import cache_document_detail, CachedPage, CACHE_VERSION
from c2corg_ui.tests.views import BaseTestUi, handle_mock_request
from c2corg_ui.views.waypoint import Waypoint
from shapely.geometry import Point

base_path = os.path.dirname(os.path.abspath(__file__))


class TestWaypointUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("waypoints")
        BaseTestUi.setUp(self)
        self.view = Waypoint(request=self.request)

    def test_pages(self):
        self._test_pages()

    def test_api_call(self):
        self._test_api_call()

    def test_get_documents(self):
        self._test_get_documents()

    def test_detail_etag(self):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(waypoint_detail_mock):
            url = '/{0}/117982/fr'.format(self._prefix)
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertEqual(
                etag,
                'W/"117982-fr-1-{0}"'.format(CACHE_VERSION))

            # then request the page again with the etag
            headers = {
                'If-None-Match': etag
            }
            self.app.get(url, status=304, headers=headers)

            # if a wrong/outdated etag is provided, the full page is returned
            headers = {
                'If-None-Match': 'W/"123456-xy-0-c796286-123456"'
            }
            self.app.get(url, status=200, headers=headers)

    def test_detail_caching(self):
        url = '/{0}/117982/fr'.format(self._prefix)
        cache_key = self.view._get_cache_key(117982, 'fr')

        with HTTMock(waypoint_detail_mock):
            cache_document_detail.delete(cache_key)
            cache_value = cache_document_detail.get(cache_key)
            self.assertEqual(cache_value, NO_VALUE)

            # check that the response is cached
            self.app.get(url, status=200)

            cache_value = cache_document_detail.get(cache_key)
            self.assertNotEqual(cache_value, NO_VALUE)

            # check that values are returned from the cache
            fake_cache_value = CachedPage('117982-fr-1', 'fake page')
            cache_document_detail.set(cache_key, fake_cache_value)

            response = self.app.get(url, status=200)
            self.assertEqual(response.text, 'fake page')

        # simulate that the version of the document in the api has changed
        with HTTMock(waypoint_detail_new_mock):
            response = self.app.get(url, status=200)
            self.assertNotEqual(response.text, 'fake page')

    def test_detail_caching_debug(self):
        """ Check that the cache is not used when using the debug flag.
        """
        url = '/{0}/117982/fr?debug'.format(self._prefix)
        cache_key = self.view._get_cache_key(117982, 'fr')
        cache_document_detail.delete(cache_key)

        with HTTMock(waypoint_detail_mock):
            response = self.app.get(url, status=200)

            cache_value = cache_document_detail.get(cache_key)
            self.assertEqual(cache_value, NO_VALUE)
            self.assertIsNone(response.headers.get('ETag'))

    def test_archive(self):
        url = '/{0}/117982/fr/131565'.format(self._prefix)
        self._test_page(url, waypoint_archive_mock, '117982-fr-1-131565')

    def test_history(self):
        url = '/{0}/history/735553/fr'.format(self._prefix)
        self._test_page(url, waypoint_history_mock, '735553-fr-1')

    def test_reprojection(self):
        # Testing lon/lat coordinates
        point = Point(6, 46)
        point2 = self.view._transform(point, 'epsg:4326', 'epsg:3857')
        self.assertAlmostEqual(point2.x, 667916, delta=1)
        self.assertAlmostEqual(point2.y, 5780349, delta=1)
        point3 = self.view._transform(point2, 'epsg:3857', 'epsg:4326')
        self.assertAlmostEqual(point3.x, point.x)
        self.assertAlmostEqual(point3.y, point.y)

        # Testing CH1903 coordinates
        point4 = Point(600000, 200000)
        point5 = self.view._transform(point4, 'epsg:21781', 'epsg:3857')
        self.assertAlmostEqual(point5.x, 828064, delta=1)
        self.assertAlmostEqual(point5.y, 5934093, delta=1)
        point6 = self.view._transform(point5, 'epsg:3857', 'epsg:21781')
        self.assertAlmostEqual(point6.x, point4.x, delta=1)
        self.assertAlmostEqual(point6.y, point4.y, delta=1)


@all_requests
def waypoint_detail_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'waypoint.json'),
        'W/"117982-fr-1"')


@all_requests
def waypoint_detail_new_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'waypoint.json'),
        'W/"117982-fr-2"')


@all_requests
def waypoint_archive_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'waypoint_archive.json'),
        'W/"117982-fr-1-131565"')


@all_requests
def waypoint_history_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'route_history.json'),
        'W/"735553-fr-1"')
