from c2corg_ui.views import call_api
from httmock import HTTMock

from c2corg_ui.caching import CACHE_VERSION
from c2corg_ui.tests import BaseTestCase, settings, read_file
from pyramid import testing


class BaseTestUi(BaseTestCase):

    def set_prefix(self, prefix):
        self._prefix = prefix

    def setUp(self):  # noqa
        BaseTestCase.setUp(self)
        self.request = testing.DummyRequest()
        self.request.registry.settings = settings
        self.settings = settings

    def _test_pages(self):
        route = '/%s' % self._prefix
        response = self.app.get(route, status=200)
        self.assertEqual(response.content_type, 'text/html')

        route = '/%s/add' % self._prefix
        response = self.app.get(route, status=200)
        self.assertEqual(response.content_type, 'text/html')

        # ask for a non existing lang foo
        route = '/%s/1/foo/bar' % self._prefix
        response = self.app.get(route, status=400)

        # ask for a non existing document
        route = '/%s/9999999999/fr/bar' % self._prefix
        response = self.app.get(route, status=404)

    def _test_api_call(self):
        resp, content = call_api(self.view.settings, self._prefix)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('total' in content)
        self.assertTrue('documents' in content)
        total = content['total']
        documents = content['documents']
        self.assertEqual(isinstance(total, int), True)
        self.assertEqual(isinstance(documents, list), True)

    def _test_get_documents(self):
        documents, total, params, lang = self.view._get_documents()
        self.assertEqual(isinstance(total, int), True)
        self.assertEqual(isinstance(documents, list), True)
        self.assertEqual(isinstance(params, dict), True)

    def _test_page(self, url, request_mock, cache_key):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(request_mock):
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertEqual(
                etag,
                'W/"{0}-{1}"'.format(cache_key, CACHE_VERSION))

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


def handle_mock_request(request, file, etag):
    if request.headers.get('If-None-Match') == etag:
        return {
            'status_code': 304,
            'headers': {
                'ETag': etag
            }
        }
    else:
        return {
            'status_code': 200,
            'headers': {
                'Content-Type': 'application/json; charset = UTF-8',
                'ETag': etag
            },
            'content': read_file(file)
        }
