import os

from c2corg_ui.views.profile import Profile
from dogpile.cache.api import NO_VALUE
from httmock import HTTMock, all_requests

from c2corg_ui.caching import cache_document_detail, CachedPage
from c2corg_ui import caching
from c2corg_ui.tests.views import BaseTestUi, handle_mock_request

base_path = os.path.dirname(os.path.abspath(__file__))


class TestProfileUi(BaseTestUi):

    def setUp(self):  # noqa
        self.set_prefix("profiles")
        BaseTestUi.setUp(self)
        self.view = Profile(request=self.request)

    def test_detail_etag(self):
        """ An ETag header is set, using the ETag of the API response.
        """
        with HTTMock(profile_info_mock):
            url = '/{0}/123/fr'.format(self._prefix)
            resp = self.app.get(url, status=200)

            etag = resp.headers.get('ETag')
            self.assertIsNotNone(etag)
            self.assertEqual(
                etag,
                'W/"123-fr-2-{0}"'.format(caching.CACHE_VERSION))

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

    def test_detail_caching(self):
        url = '/{0}/123/fr'.format(self._prefix)
        cache_key = self.view._get_cache_key(123, 'fr')

        with HTTMock(profile_info_mock):
            cache_document_detail.delete(cache_key)
            cache_value = cache_document_detail.get(cache_key)
            self.assertEqual(cache_value, NO_VALUE)

            # check that the response is cached
            self.app.get(url, status=200)

            cache_value = cache_document_detail.get(cache_key)
            self.assertNotEqual(cache_value, NO_VALUE)

            # check that values are returned from the cache
            fake_cache_value = CachedPage('123-fr-2', 'fake page')
            cache_document_detail.set(cache_key, fake_cache_value)

            response = self.app.get(url, status=200)
            self.assertEqual(response.text, 'fake page')

        # simulate that the version of the document in the api has changed
        with HTTMock(profile_info_new_mock):
            response = self.app.get(url, status=200)
            self.assertNotEqual(response.text, 'fake page')


@all_requests
def profile_info_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'profile_info.json'),
        'W/"123-fr-2"')


@all_requests
def profile_info_new_mock(url, request):
    return handle_mock_request(
        request,
        os.path.join(base_path, 'data', 'profile_info.json'),
        'W/"123-fr-3"')
