from c2corg_common.document_types import ARTICLE_TYPE
from pyramid.renderers import render
from pyramid.view import view_config

from c2corg_ui.views.document import Document, ROUTE_NAMES


class Article(Document):

    _API_ROUTE = ROUTE_NAMES[ARTICLE_TYPE]

    @view_config(route_name='articles_index')
    def index(self):
        return self._index('c2corg_ui:templates/article/index.html')

    @view_config(route_name='articles_sitemap',
                 renderer='c2corg_ui:templates/article/sitemap.html')
    @view_config(route_name='articles_sitemap_default',
                 renderer='c2corg_ui:templates/article/sitemap.html')
    def sitemap(self):
        articles, total, filter_params, lang = self._get_documents()
        self.template_input.update({
            'articles': articles,
            'filter_params': filter_params,
            'total': total,
            'lang': lang
        })
        return self.template_input

    @view_config(route_name='articles_view_id')
    @view_config(route_name='articles_view_id_lang')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='articles_view')
    def detail(self):
        id, lang = self._validate_id_lang()

        def render_page(article, locale):
            self.template_input.update({
                'lang': lang,
                'article': article,
                'locale': locale,
                'version': None
            })

            return render(
                'c2corg_ui:templates/article/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_detail(id, lang, render_page)

    @view_config(route_name='articles_archive')
    def archive(self):
        id, lang = self._validate_id_lang()
        version_id = int(self.request.matchdict['version'])

        def render_page(article, locale, version):
            self.template_input.update({
                'lang': lang,
                'article': article,
                'locale': locale,
                'version': version
            })

            return render(
                'c2corg_ui:templates/article/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_archive(id, lang, version_id, render_page)

    @view_config(route_name='articles_history')
    def history(self):
        return self._get_history()

    @view_config(route_name='articles_diff')
    def diff(self):
        return self._diff()

    @view_config(route_name='articles_add')
    def add(self):
        self.template_input.update({
            'article_lang': None,
            'article_id': None
        })
        return self._add('c2corg_ui:templates/article/edit.html')

    @view_config(route_name='articles_edit',
                 renderer='c2corg_ui:templates/article/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'article_lang': lang,
            'article_id': id
        })
        return self.template_input

    @view_config(route_name='articles_preview',
                 renderer='c2corg_ui:templates/article/preview.html')
    def preview(self):
        return self._preview()
