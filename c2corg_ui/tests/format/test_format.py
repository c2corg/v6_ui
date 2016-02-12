import os
import unittest
import bbcode
import markdown

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
        self.bbcode_parser = bbcode.Parser(escape_html=False, newline='\n')

    def test_wikilinks(self):
        input1 = (
            'Some text and a [[waypoints/12345/fr/some-slug|wiki link]] '
            'before [[/whatever|another one]] that follows.'
        )
        output1 = (
            '<p>Some text and a '
            '<a href="/waypoints/12345/fr/some-slug">wiki link</a> '
            'before <a href="/whatever">another one</a> that follows.</p>'
        )
        md_output1 = self.markdown_parser.convert(input1)
        self.assertEqual(md_output1, output1)
        # Make sure the bbcode parser does not impact the wikilink conversion:
        bb_output1 = self.bbcode_parser.format(md_output1)
        self.assertEqual(bb_output1, output1)

    def test_full_conversion(self):
        input_txt = read_file(os.path.join(base_path, 'input.txt'))
        output_txt = read_file(os.path.join(base_path, 'output.txt'))
        txt = self.markdown_parser.convert(input_txt)
        txt = self.bbcode_parser.format(txt)
        self.assertEqual(txt, output_txt)
