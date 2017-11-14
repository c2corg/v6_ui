from c2corg_ui.tests.views import BaseTestUi


class TestPagesUi(BaseTestUi):

    def test_sso_login(self):
        self.app.get('/sso-login?debug&token=nono&no_redirect',
                     status=200)
