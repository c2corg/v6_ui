from pyramid.renderers import render
from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_common.attributes import activities, route_types


class Route(Document):

    _API_ROUTE = 'routes'

    @view_config(route_name='routes_index')
    def index(self):
        return self._index('c2corg_ui:templates/route/index.html')

    @view_config(route_name='routes_sitemap',
                 renderer='c2corg_ui:templates/route/sitemap.html')
    @view_config(route_name='routes_sitemap_default',
                 renderer='c2corg_ui:templates/route/sitemap.html')
    def sitemap(self):
        routes, total, filter_params, lang = self._get_documents()
        self.template_input.update({
            'routes': routes,
            'total': total,
            'filter_params': filter_params,
            'lang': lang
        })
        return self.template_input

    @view_config(route_name='routes_view_id')
    @view_config(route_name='routes_view_id_lang')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='routes_view',
                 renderer='c2corg_ui:templates/route/view.html')
    def detail(self):
        id, lang = self._validate_id_lang()

        def render_page(route, locale):
            self.template_input.update({
                'lang': lang,
                'route': route,
                'locale': locale,
                'version': None
            })

            return render(
                'c2corg_ui:templates/route/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_detail(id, lang, render_page)

    @view_config(route_name='routes_archive')
    def archive(self):
        id, lang = self._validate_id_lang()
        version_id = int(self.request.matchdict['version'])

        def render_page(route, locale, version):
            self.template_input.update({
                'lang': lang,
                'route': route,
                'locale': locale,
                'version': version
            })

            return render(
                'c2corg_ui:templates/route/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_archive(id, lang, version_id, render_page)

    @view_config(route_name='routes_history')
    def history(self):
        return self._get_history()

    @view_config(route_name='routes_diff')
    def diff(self):
        return self._diff()

    @view_config(route_name='routes_add')
    def add(self):
        self.template_input.update({
            'activities': activities,
            'route_types': route_types,
            'route_lang': None,
            'route_id': None
        })
        return self._add('c2corg_ui:templates/route/edit.html')

    @view_config(route_name='routes_edit',
                 renderer='c2corg_ui:templates/route/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'activities': activities,
            'route_types': route_types,
            'route_lang': lang,
            'route_id': id
        })
        return self.template_input
