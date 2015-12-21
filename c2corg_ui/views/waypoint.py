from pyramid.view import view_config

from c2corg_ui.views.document import Document
from c2corg_common.attributes import waypoint_types


class Waypoint(Document):

    _API_ROUTE = 'waypoints'

    @view_config(route_name='waypoints_index',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    @view_config(route_name='waypoints_index_default',
                 renderer='c2corg_ui:templates/waypoint/index.html')
    def index(self):
        waypoints, total, filter_params = self._get_documents()
        self.template_input.update({
            'waypoints': waypoints,
            'total': total,
            'filter_params': filter_params
        })
        return self.template_input

    @view_config(route_name='waypoints_view',
                 renderer='c2corg_ui:templates/waypoint/view.html')
    @view_config(route_name='waypoints_archive',
                 renderer='c2corg_ui:templates/waypoint/view.html')
    def view(self):
        id, culture = self._validate_id_culture()
        if 'version' in self.request.matchdict:
            version_id = int(self.request.matchdict['version'])
            waypoint, locale, version = self._get_archived_document(
                id, culture, version_id)
        else:
            waypoint, locale = self._get_document(id, culture)
            version = None
        self.template_input.update({
            'culture': culture,
            'waypoint': waypoint,
            'locale': locale,
            'geometry': self._get_geometry(waypoint['geometry']['geom']),
            'transform': self._transform,
            'version': version
        })
        return self.template_input

    @view_config(route_name='waypoints_add',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    @view_config(route_name='waypoints_edit',
                 renderer='c2corg_ui:templates/waypoint/edit.html')
    def edit(self):
        id, culture = self._validate_id_culture()
        self.template_input.update({
            'waypoint_types': waypoint_types,
            'waypoint_culture': culture,
            'waypoint_id': id
        })
        return self.template_input

    @view_config(route_name='waypoints_history',
                 renderer='c2corg_ui:templates/document/history.html')
    def history(self):
        return self._get_history()

    @view_config(route_name='waypoints_diff',
                 renderer='c2corg_ui:templates/document/diff.html')
    def diff(self):
        return self._diff()
