import logging

from c2corg_common.document_types import WAYPOINT_TYPE
from pyramid.renderers import render
from pyramid.view import view_config

from c2corg_ui.views.document import Document, ROUTE_NAMES
from c2corg_common.attributes import waypoint_types

log = logging.getLogger(__name__)


class Waypoint(Document):

    _API_ROUTE = ROUTE_NAMES[WAYPOINT_TYPE]

    @view_config(route_name='waypoints_index')
    def index(self):
        return self._index('c2corg_ui:templates/waypoint/index.html')

    @view_config(route_name='waypoints_view_id')
    @view_config(route_name='waypoints_view_id_lang')
    def redirect_to_full_url(self):
        self._redirect_to_full_url()

    @view_config(route_name='waypoints_view')
    def detail(self):
        id, lang = self._validate_id_lang()

        def render_page(waypoint, locale):
            self.template_input.update({
                'lang': lang,
                'waypoint': waypoint,
                'locale': locale,
                'geometry': self._get_geometry(waypoint['geometry']['geom']),
                'version': None
            })

            return render(
                'c2corg_ui:templates/waypoint/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_detail(id, lang, render_page)

    @view_config(route_name='waypoints_archive')
    def archive(self):
        id, lang = self._validate_id_lang()
        version_id = int(self.request.matchdict['version'])

        def render_page(waypoint, locale, version):
            self.template_input.update({
                'lang': lang,
                'waypoint': waypoint,
                'locale': locale,
                'geometry': self._get_geometry(waypoint['geometry']['geom']),
                'version': version
            })

            return render(
                'c2corg_ui:templates/waypoint/view.html',
                self.template_input,
                self.request
            )

        return self._get_or_create_archive(id, lang, version_id, render_page)

    @view_config(route_name='waypoints_history')
    def history(self):
        return self._get_history()

    @view_config(route_name='waypoints_diff')
    def diff(self):
        return self._diff()

    @view_config(route_name='waypoints_add')
    def add(self):
        self.template_input.update({
            'waypoint_types': waypoint_types,
            'waypoint_lang': None,
            'waypoint_id': None
        })
        return self._add('c2corg_ui:templates/waypoint/edit.html')

    @view_config(route_name='waypoints_edit',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    def edit(self):
        id, lang = self._validate_id_lang()
        self.template_input.update({
            'waypoint_types': waypoint_types,
            'waypoint_lang': lang,
            'waypoint_id': id
        })
        return self.template_input

    @view_config(route_name='waypoints_edit_archive',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    def edit_archive(self):
        id, lang = self._validate_id_lang()
        version = int(self.request.matchdict['version'])
        self.template_input.update({
            'waypoint_types': waypoint_types,
            'waypoint_lang': lang,
            'waypoint_id': id,
            'version': version
        })
        return self.template_input

    @view_config(route_name='waypoints_preview',
                 renderer='c2corg_ui:templates/waypoint/preview.html')
    def preview(self):
        return self._preview()
