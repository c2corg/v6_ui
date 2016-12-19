import logging

from c2corg_ui.caching import cache_document_detail
from c2corg_ui.views import call_api
from pyramid.view import view_config
from os.path import isfile

log = logging.getLogger(__name__)


class Health(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='health', renderer='json')
    def get(self):
        """ Returns information about the version of the UI and the status
        of its components:

            - Git revision
            - API status
            - Redis status
            - Number of keys in Redis

        """
        status = {
            'version': self.request.registry.settings.get('cache_version')
        }

        self._add_redis_status(status)
        self._add_api_status(status)
        self._add_maintenance_mode_status(status)

        return status

    def _add_redis_status(self, status):
        redis_keys = None
        success = False

        try:
            client = cache_document_detail.backend.client
            redis_keys = client.dbsize()
            success = True
        except:
            log.exception('Getting redis keys failed')
            self.request.response.status_code = 500

        status['redis'] = 'ok' if success else 'error'
        status['redis_keys'] = redis_keys

    def _add_api_status(self, status):
        api_status = None
        success = False

        try:
            resp, api_status = call_api(
                self.request.registry.settings, 'health')
            if resp.status_code == 200:
                success = True
        except:
            log.exception('Getting api status failed')

        if not success:
            self.request.response.status_code = 500

        status['api'] = 'ok' if success else 'error'
        status['api_status'] = api_status

    def _add_maintenance_mode_status(self, status):
        maintenance_mode = False
        maintenance_file = 'maintenance_mode.txt'

        if isfile(maintenance_file):
            maintenance_mode = True
            log.warn('service is in maintenance mode, remove %s to reenable.' %
                    maintenance_file)
            self.request.response.status_code = 503

        status['maintenance_mode'] = maintenance_mode
