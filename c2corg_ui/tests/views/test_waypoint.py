import os
from unittest.mock import patch

from dogpile.cache.api import NO_VALUE
from httmock import HTTMock, all_requests

from c2corg_ui.caching import cache_document_detail, CachedPage
from c2corg_ui import caching
from c2corg_ui.tests.views import BaseTestUi, handle_mock_request
from c2corg_ui.views.waypoint import Waypoint

base_path = os.path.dirname(os.path.abspath(__file__))


class TestWaypointUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("waypoints")
        BaseTestUi.setUp(self)
        self.view = Waypoint(request=self.request)

    def test_pages(self):
        self._test_pages()

    def test_index_cache_down(self):
        page_cache_mock = patch(
            'c2corg_ui.views.cache_static_pages.get_or_create',
            side_effect=Exception('Redis down'))

        with page_cache_mock:
            self.app.get('/{}'.format(self._prefix), status=200)

    def test_api_call(self):
        self._test_api_call()

    def test_get_documents(self):
        self._test_get_documents()

    def test_slug(self):
        with HTTMock(waypoint_detail_mock):
            url = '/{0}/117982'.format(self._prefix)
            self.app.get(url, status=302)

            url = '/{0}/117982/fr'.format(self._prefix)
            resp = self.app.get(url, status=301)

            redir = resp.headers.get('Location')
            self.assertEqual(
                redir, 'http://localhost/waypoints/117982/fr/vallorbe')

    def test_merged(self):
        with HTTMock(waypoint_detail_merged_mock):
            url = '/{0}/123456/fr/foo'.format(self._prefix)
            resp = self.app.get(url, status=301)

            redir = resp.headers.get('Location')
            self.assertEqual(
                redir, 'http://localhost/waypoints/733992/fr')

    def test_detail_etag(self):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(waypoint_detail_mock):
            url = '/{0}/117982/fr/foo'.format(self._prefix)
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertEqual(
                etag,
                'W/"117982-fr-1-{0}"'.format(caching.CACHE_VERSION))

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
        url = '/{0}/117982/fr/foo'.format(self._prefix)
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
        url = '/{0}/117982/fr/foo?debug'.format(self._prefix)
        cache_key = self.view._get_cache_key(117982, 'fr')
        cache_document_detail.delete(cache_key)

        with HTTMock(waypoint_detail_mock):
            response = self.app.get(url, status=200)

            cache_value = cache_document_detail.get(cache_key)
            self.assertEqual(cache_value, NO_VALUE)
            self.assertIsNone(response.headers.get('ETag'))

    def test_detail_redis_down(self):
        """ Check that the request does not fail even if Redis errors.
        """
        url = '/{0}/117982/fr/foo'.format(self._prefix)

        document_cache_mock = patch(
            'c2corg_ui.views.document.cache_document_detail',
            **{'get.side_effect': Exception('Redis down'),
               'set.side_effect': Exception('Redis down')})

        with document_cache_mock, HTTMock(waypoint_detail_mock):
            self.app.get(url, status=200)

    def test_archive(self):
        url = '/{0}/117982/fr/131565'.format(self._prefix)
        self._test_page(url, waypoint_archive_mock, '117982-fr-1-131565')

    def test_history(self):
        url = '/{0}/history/735553/fr'.format(self._prefix)
        self._test_page(url, waypoint_history_mock, '735553-fr-1')

    def test_diff(self):
        url = '/{0}/diff/117982/fr/131565/292856'.format(self._prefix)
        self._test_page(
            url,
            waypoint_diff_mock,
            '117982-fr-1-131565-117982-fr-1-292856')


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


@all_requests
def waypoint_diff_mock(url, request):
    if '292856' in url.path:
        return handle_mock_request(
            request,
            os.path.join(base_path, 'data', 'waypoint_archive2.json'),
            'W/"117982-fr-1-292856"')
    else:
        return handle_mock_request(
            request,
            os.path.join(base_path, 'data', 'waypoint_archive.json'),
            'W/"117982-fr-1-131565"')


@all_requests
def waypoint_detail_merged_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'waypoint_merged.json'),
        'W/"123456-fr-1"')
