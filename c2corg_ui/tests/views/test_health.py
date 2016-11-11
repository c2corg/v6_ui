import os
from c2corg_ui.tests.views import BaseTestUi, handle_mock_request
from c2corg_ui.views.health import Health
from httmock import all_requests, HTTMock

base_path = os.path.dirname(os.path.abspath(__file__))


class TestHealthUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix('health')
        BaseTestUi.setUp(self)
        self.view = Health(request=self.request)

    def test_get(self):
        with HTTMock(health_mock):
            resp = self.app.get('/health', status=200)
            status = resp.json
            self.assertIsNotNone(status.get('api_status'))
            self.assertEqual(status['api_status']['version'], 'ffa9e7a')


@all_requests
def health_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'health.json'),
        'no-etag'
    )
