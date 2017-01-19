from c2corg_common.document_types import IMAGE_TYPE
from pyramid.renderers import render
from pyramid.view import view_config

from c2corg_ui.views.document import Document, ROUTE_NAMES


class Image(Document):

    _API_ROUTE = ROUTE_NAMES[IMAGE_TYPE]

    @view_config(route_name='images_index')
    def index(self):
        return self._index('c2corg_ui:templates/image/index.html')

    @view_config(route_name='images_view_id')
    @view_config(route_name='images_view_id_lang')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='images_view')
    def detail(self):
        id, lang = self._validate_id_lang()

        def render_page(image, locale):
            self.template_input.update({
                'lang': lang,
                'image': image,
                'locale': locale,
                'geometry':
                    self._get_geometry(image['geometry']['geom']) if
                    image.get('geometry') else None,
                'version': None
            })

            return render(
                'c2corg_ui:templates/image/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_detail(id, lang, render_page)

    @view_config(route_name='images_archive')
    def archive(self):
        id, lang = self._validate_id_lang()
        version_id = int(self.request.matchdict['version'])

        def render_page(image, locale, version):
            self.template_input.update({
                'lang': lang,
                'image': image,
                'locale': locale,
                'geometry':
                    self._get_geometry(image['geometry']['geom']) if
                    image.get('geometry') else None,
                'version': version
            })

            return render(
                'c2corg_ui:templates/image/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_archive(id, lang, version_id, render_page)

    @view_config(route_name='images_history')
    def history(self):
        return self._get_history()

    @view_config(route_name='images_diff')
    def diff(self):
        return self._diff()

    @view_config(route_name='images_edit',
                 renderer='c2corg_ui:templates/image/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'image_lang': lang,
            'image_id': id,
            'image_backend': self.settings.image_backend_url
        })
        return self.template_input

    @view_config(route_name='images_preview',
                 renderer='c2corg_ui:templates/image/preview.html')
    def preview(self):
        return self._preview()
