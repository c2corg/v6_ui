import os

from httmock import HTTMock, all_requests

from c2corg_ui.caching import CACHE_VERSION
from c2corg_ui.tests.views import BaseTestUi, handle_mock_request
from c2corg_ui.views.route import Route

base_path = os.path.dirname(os.path.abspath(__file__))


class TestOutingUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("outings")
        BaseTestUi.setUp(self)
        self.view = Route(request=self.request)

    def test_pages(self):
        self._test_pages()

    def test_api_call(self):
        self._test_api_call()

    def test_get_documents(self):
        self._test_get_documents()

    def test_detail(self):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(outing_detail_mock):
            url = '/{0}/735574/fr'.format(self._prefix)
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertEqual(
                etag,
                'W/"735574-fr-1-{0}"'.format(CACHE_VERSION))

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

    def test_archive(self):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(outing_archive_mock):
            url = '/{0}/735574/fr/1163060'.format(self._prefix)
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertEqual(
                etag,
                'W/"735574-fr-1-1163060-{0}"'.format(CACHE_VERSION))

            # then request the page again with the etag
            headers = {
                'If-None-Match': etag
            }
            self.app.get(url, status=304, headers=headers)

            # if a wrong/outdated etag is provided, the full page is returned
            headers = {
                'If-None-Match': 'W/"123456-xy-0-1234-c796286-123456"'
            }
            self.app.get(url, status=200, headers=headers)


@all_requests
def outing_detail_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'outing.json'),
        'W/"735574-fr-1"')


@all_requests
def outing_archive_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'outing_archive.json'),
        'W/"735574-fr-1-1163060"')
