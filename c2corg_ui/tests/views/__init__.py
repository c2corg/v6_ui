from c2corg_ui.tests import BaseTestCase, settings
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
        route = '/%s/1/foo' % self._prefix
        response = self.app.get(route, status=400)

        # ask for a non integer document id foo
        route = '/%s/foo/fr' % self._prefix
        response = self.app.get(route, status=400)

        # ask for a non existing document
        route = '/%s/9999999999/fr' % self._prefix
        response = self.app.get(route, status=404)

    def _test_api_call(self):
        resp, content = self.view._call_api(self._prefix)
        self.assertEqual(resp['status'], '200')
        self.assertTrue('total' in content)
        self.assertTrue('documents' in content)
        total = content['total']
        documents = content['documents']
        self.assertEqual(isinstance(total, int), True)
        self.assertEqual(isinstance(documents, list), True)

    def _test_get_documents(self):
        documents, total, params, lang, error = self.view._get_documents()
        self.assertEqual(isinstance(total, int), True)
        self.assertEqual(isinstance(documents, list), True)
        self.assertEqual(isinstance(params, dict), True)
