import os
from pyramid.paster import get_appsettings
from pyramid import testing
import unittest
from webtest import TestApp

from c2corg_ui import main, caching


curdir = os.path.dirname(os.path.abspath(__file__))
configfile = os.path.realpath(os.path.join(curdir, '../../test.ini'))
settings = get_appsettings(configfile)


class BaseTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):  # noqa
        cls.app = main({}, **settings)

    def setUp(self):  # noqa
        self.app = TestApp(self.app)
        self.config = testing.setUp()
        caching.cache_status = caching.CacheStatus()

    def tearDown(self):  # noqa
        testing.tearDown()


def read_file(path):
    with open(path, 'r') as f:
        return f.read()
