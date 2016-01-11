from c2corg_ui.tests.views import BaseTestUi
from c2corg_ui.views.route import Route


class TestRouteUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("routes")
        BaseTestUi.setUp(self)
        self.view = Route(request=self.request)

    def test_pages(self):
        self._test_pages()

    def test_api_call(self):
        self._test_api_call()

    def test_get_documents(self):
        self._test_get_documents()
