import os
import unittest
import json

from c2corg_ui.format import parse_code, configure_parsers
from c2corg_ui.tests import read_file

base_path = os.path.dirname(os.path.abspath(__file__))


class TestFormat(unittest.TestCase):

    maxDiff = None

    def setUp(self):  # noqa
        configure_parsers({'api_url': 'https://api.camptocamp.org/'})

    def test_all(self):
        def do_test(id, text, expected):
            result = parse_code(text)
            self.assertEqual(result.rstrip(), expected.rstrip(), id)

        test_path = os.path.join(base_path, 'test')

        for file in os.listdir(test_path):
            file_path = os.path.join(test_path, file)
            if os.path.isfile(file_path):
                if file.endswith(".md"):
                    text = read_file(file_path)
                    expected = read_file(file_path.replace(".md", ".html"))
                    do_test(file, text, expected)

                elif file.endswith(".json"):
                    tests = json.loads(read_file(file_path))

                    for test in tests:
                        do_test(**test)
