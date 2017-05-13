import os
import unittest
import markdown
import json

from c2corg_ui.format import _get_bbcode_parser
from c2corg_ui.format.wikilinks import C2CWikiLinkExtension
from c2corg_ui.tests import read_file

base_path = os.path.dirname(os.path.abspath(__file__))


class TestFormat(unittest.TestCase):
    def setUp(self):  # noqa
        extensions = [
            C2CWikiLinkExtension(),
        ]
        self.markdown_parser = markdown.Markdown(output_format='xhtml5',
                                                 extensions=extensions)
        self.bbcode_parser = _get_bbcode_parser()

    def test_all(self):
        def do_test(id, markdown, expected):
            result = self.markdown_parser.convert(markdown)
            result = self.bbcode_parser.format(result)
            self.assertEqual(result, expected, id)

        test_path = os.path.join(base_path, 'test')

        for file in os.listdir(test_path):
            file_path = os.path.join(test_path, file)
            if os.path.isfile(file_path):
                if file.endswith(".md"):
                    markdown = read_file(file_path)
                    expected = read_file(file_path.replace(".md", ".html"))
                    do_test(file, markdown, expected)

                elif file.endswith(".json"):
                    tests = json.loads(read_file(file_path))

                    for test in tests:
                        do_test(**test)
