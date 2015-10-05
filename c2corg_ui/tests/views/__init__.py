from c2corg_ui.tests import BaseTestCase


class BaseTestUi(BaseTestCase):

    def set_prefix(self, prefix):
        self._prefix = prefix

    def setUp(self):  # noqa
        BaseTestCase.setUp(self)
