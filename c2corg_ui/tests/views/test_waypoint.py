from c2corg_ui.tests.views import BaseTestUi
from c2corg_ui.views.waypoint import Waypoint


class TestWaypointUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("/waypoints")
        BaseTestUi.setUp(self)
        self.view = Waypoint(request=self.request)

    def test_pages(self):
        self._test_pages()

    def test_api_call(self):
        self._test_api_call()

    def test_get_documents(self):
        self._test_get_documents()
