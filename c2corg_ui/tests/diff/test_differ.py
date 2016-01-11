import os
import unittest

from c2corg_ui.diff.differ import diff_text, diff_documents
from c2corg_ui.tests import read_file


base_path = os.path.dirname(os.path.abspath(__file__))


class TestDiffer(unittest.TestCase):

    def test_diff_text(self):
        file1 = read_file(os.path.join(base_path, '1.txt'))
        file2 = read_file(os.path.join(base_path, '2.txt'))

        table = diff_text(file1, file2)
        # create_debug_file(table)

        self.assertIsNotNone(table)
        self.assertTrue('<span class="diff_chg">1</span>' in table)
        self.assertTrue('<span class="diff_chg">2</span>' in table)
        self.assertTrue(
            '<span class="diff_add">Some text here.</span>' in table)

    def test_diff_text_equal(self):
        table = diff_text('', None)
        self.assertIsNone(table)

    def test_diff_single_line(self):
        table = diff_text('', 'added')
        # create_debug_file(table)

        self.assertIsNotNone(table)
        self.assertTrue('<span class="diff_sub"> </span>' in table)
        self.assertTrue('<span class="diff_add">added</span>' in table)

    def test_diff_documents(self):
        doc1 = {
            'version': 1,
            'document_id': 642184,
            'available_cultures': ['fr'],
            'parking_fee': None,
            'lift_access': None,
            'elevation': 400,
            'activities': ['skitouring', 'hiking'],
            'elevation_min': None,
            'geometry': {
                'version': 1,
                'geom': '{"type": "Point", '
                        '"coordinates": [647832.459591738, 5735074.612643753]}'
            },
            'maps_info': None,
            'locales': [
                {
                    'version': 1,
                    'culture': 'fr',
                    'description': 'The first line.\nThe second line.',
                    'title': 'Gerbaz',
                    'summary': None,
                    'access': None,
                    'access_period': None
                }
            ],
            'snow_clearance_rating': None,
            'waypoint_type': 'access'
        }
        doc2 = {
            'version': 2,
            'document_id': 642184,
            'available_cultures': ['fr', 'en'],
            'parking_fee': 'seasonal',
            'lift_access': True,
            'elevation': 400,
            'activities': ['skitouring', 'hiking'],
            'elevation_min': None,
            'geometry': {
                'version': 2,
                'geom': '{"type": "Point", '
                        '"coordinates": [647835, 5735080]}'
            },
            'maps_info': None,
            'locales': [
                {
                    'version': 1,
                    'culture': 'fr',
                    'description': 'The first line.\n\nThe third line.',
                    'title': 'Gerbaz',
                    'summary': None,
                    'access': None,
                    'access_period': None
                }
            ],
            'snow_clearance_rating': 'closed_in_winter',
            'waypoint_type': 'access'
        }
        diff_fields = diff_documents(doc1, doc2)
        self.assertEqual(len(diff_fields), 5)
        self.assertContainsField(diff_fields, 'lift_access')
        self.assertContainsField(diff_fields, 'parking_fee')
        self.assertContainsField(diff_fields, 'snow_clearance_rating')
        self.assertContainsField(diff_fields, 'description')
        self.assertContainsField(diff_fields, 'geometry')

    def assertContainsField(self, fields, name):  # noqa
        self.assertTrue(
            any(e.field == name for e in fields),
            '{0} not in list'.format(name)
        )


def create_debug_file(table):
    template = read_file(os.path.join(base_path, 'debug-template.html'))
    template = template.replace('{{table}}', table)
    with open('/tmp/diff-table.html', 'w') as f:
        f.write(template)
