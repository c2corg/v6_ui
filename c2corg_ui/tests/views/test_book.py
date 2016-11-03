import os

from httmock import all_requests

from c2corg_ui.tests.views import BaseTestUi, handle_mock_request
from c2corg_ui.views.book import Book

base_path = os.path.dirname(os.path.abspath(__file__))


class TestBookUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("books")
        BaseTestUi.setUp(self)
        self.view = Book(request=self.request)

    def test_pages(self):
        route = '/%s' % self._prefix
        response = self.app.get(route, status=200)
        self.assertEqual(response.content_type, 'text/html')

        # creation page for books
        route = '/%s/add' % self._prefix
        response = self.app.get(route, status=200)
        self.assertEqual(response.content_type, 'text/html')

        # ask for a non existing lang foo
        route = '/%s/1/foo/bar' % self._prefix
        response = self.app.get(route, status=400)

        # ask for a non existing document
        route = '/%s/9999999999/fr/bar' % self._prefix
        response = self.app.get(route, status=404)

    def test_api_call(self):
        self._test_api_call()

    def test_get_documents(self):
        self._test_get_documents()

    def test_detail(self):
        url = '/{0}/735574/fr/foo'.format(self._prefix)
        self._test_page(url, book_detail_mock, '735574-fr-1')


@all_requests
def book_detail_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'book.json'),
        'W/"735574-fr-1"')
