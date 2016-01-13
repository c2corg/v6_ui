from c2corg_ui.tests.views import BaseTestUi
from c2corg_ui.views.waypoint import Waypoint
from shapely.geometry import Point


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
