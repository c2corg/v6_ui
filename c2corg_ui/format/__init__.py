import bbcode
import markdown
import html

from c2corg_ui.format.autolink import AutoLinkExtension
from c2corg_ui.format.wikilinks import C2CWikiLinkExtension
from c2corg_ui.format.img import C2CImageExtension
from c2corg_ui.format.video import C2CVideoExtension
from c2corg_ui.format.important import C2CImportantExtension
from c2corg_ui.format.warning import C2CWarningExtension
from c2corg_ui.format.ltag import C2CLTagExtension
from c2corg_ui.format.header_emphasis import HeaderEmphasisExtension
from markdown.extensions.nl2br import Nl2BrExtension
from markdown.extensions.toc import TocExtension

_markdown_parser = None
_bbcode_parser = None
_parsers_settings = None


def configure_parsers(settings):
    global _parsers_settings
    _parsers_settings = {
        'api_url': settings.get('api_url')
    }


def _get_markdown_parser():
    global _markdown_parser
    if not _markdown_parser:
        extensions = [
            C2CWikiLinkExtension(),
            C2CImageExtension(api_url=_parsers_settings['api_url']),
            C2CImportantExtension(),
            C2CWarningExtension(),
            Nl2BrExtension(),
            TocExtension(marker='[toc]', baselevel=2),
            AutoLinkExtension(),
            C2CVideoExtension(),
            C2CLTagExtension(),
            HeaderEmphasisExtension(),
        ]
        _markdown_parser = markdown.Markdown(output_format='xhtml5',
                                             extensions=extensions)
    return _markdown_parser


def _get_bbcode_parser():
    global _bbcode_parser
    if not _bbcode_parser:
        # prevent that BBCode parser escapes again (the Markdown parser does
        # this already)
        bbcode.Parser.REPLACE_ESCAPE = ()
        _bbcode_parser = bbcode.Parser(
            escape_html=False, newline='\n', replace_links=False)
    return _bbcode_parser


def parse_code(text, md=True, bb=True):
    if bb:
        text = _get_bbcode_parser().format(text)
    if md:
        text = _get_markdown_parser().convert(text)
    return text


def sanitize(text):
    return html.escape(text)
