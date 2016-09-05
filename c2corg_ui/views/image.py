from pyramid.view import view_config

from c2corg_ui.views.document import Document


class Image(Document):

    _API_ROUTE = 'images'

    @view_config(route_name='images_index',
                 renderer='c2corg_ui:templates/image/index.html')
    def index(self):
        return self.template_input

    @view_config(route_name='images_sitemap',
                 renderer='c2corg_ui:templates/image/sitemap.html')
    @view_config(route_name='images_sitemap_default',
                 renderer='c2corg_ui:templates/image/sitemap.html')
    def sitemap(self):
        images, total, filter_params, lang = self._get_documents()
        self.template_input.update({
            'images': images,
            'filter_params': filter_params,
            'total': total,
            'lang': lang
        })
        return self.template_input

    @view_config(route_name='images_view',
                 renderer='c2corg_ui:templates/image/view.html')
    @view_config(route_name='images_archive',
                 renderer='c2corg_ui:templates/image/view.html')
    def view(self):
        id, lang = self._validate_id_lang()
        version = False
        if 'version' in self.request.matchdict:
            version_id = int(self.request.matchdict['version'])
            image, locale, version = self._get_archived_document(
                id, lang, version_id)
        else:
            image, locale = self._get_document(id, lang)
        self.template_input.update({
            'lang': lang,
            'image': image,
            'locale': locale,
            'version': version
        })
        return self.template_input

    @view_config(route_name='images_add',
                 renderer='c2corg_ui:templates/image/edit.html')
    @view_config(route_name='images_edit',
                 renderer='c2corg_ui:templates/image/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'image_lang': lang,
            'image_id': id
        })
        return self.template_input

    @view_config(route_name='images_history',
                 renderer='c2corg_ui:templates/document/history.html')
    def history(self):
        return self._get_history()

    @view_config(route_name='images_diff',
                 renderer='c2corg_ui:templates/document/diff.html')
    def diff(self):
        return self._diff()
