import os

from httmock import all_requests

from c2corg_ui.tests.views import BaseTestUi, handle_mock_request
from c2corg_ui.views.xreport import Xreport

base_path = os.path.dirname(os.path.abspath(__file__))


class TestXreportUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("xreports")
        BaseTestUi.setUp(self)
        self.view = Xreport(request=self.request)

    def test_pages(self):
        route = '/%s' % self._prefix
        response = self.app.get(route, status=200)
        self.assertEqual(response.content_type, 'text/html')

        # creation page for xreports
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
        self._test_page(url, xreport_detail_mock, '735574-fr-1')


@all_requests
def xreport_detail_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'xreport.json'),
        'W/"735574-fr-1"')

#
# @all_requests
# def xreport_info_mock(url, request):
#     return handle_mock_request(
#         request,
#         os.path.join(base_path, 'data', 'xreport_private.json'),
#         'W/"123-fr-2"')
#
#
# @all_requests
# def xreport_info_new_mock(url, request):
#     return handle_mock_request(
#         request,
#         os.path.join(base_path, 'data', 'xreport_private.json'),
#         'W/"123-fr-3"')