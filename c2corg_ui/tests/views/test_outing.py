import os

from httmock import all_requests

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
        url = '/{0}/735574/fr/foo'.format(self._prefix)
        self._test_page(url, outing_detail_mock, '735574-fr-1')

    def test_archive(self):
        url = '/{0}/version/735574/fr/1163060'.format(self._prefix)
        self._test_page(url, outing_archive_mock, '735574-fr-1-1163060')

    def test_history(self):
        url = '/{0}/history/735553/fr'.format(self._prefix)
        self._test_page(url, outing_history_mock, '735553-fr-1')


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


@all_requests
def outing_history_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'route_history.json'),
        'W/"735553-fr-1"')
