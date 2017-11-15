import markdown
import bleach
import binascii
import os

from c2corg_ui.format.autolink import AutoLinkExtension
from c2corg_ui.format.wikilinks import C2CWikiLinkExtension
from c2corg_ui.format.img import C2CImageExtension
from c2corg_ui.format.video import C2CVideoExtension
from c2corg_ui.format.important import C2CImportantExtension
from c2corg_ui.format.warning import C2CWarningExtension
from c2corg_ui.format.ltag import C2CLTagExtension
from markdown.extensions.nl2br import Nl2BrExtension
from markdown.extensions.toc import TocExtension


def _get_secret():
    return binascii.hexlify(os.urandom(32)).decode('ascii')


_markdown_parser = None
_parsers_settings = None
_cleaner = None
_iframe_secret_tag = "iframe_" + _get_secret()
_ngclick_secret_tag = "ngclick_" + _get_secret()

"""
_***_secret_tag is used as a private key to remplace critical HTML node and
attributes. The key point is this : the parser will use them. bleach will
remove all critical nodes. Then, a very end parser replace secret_tag by good
HTML node/attribute

PEP 506 :
os.urandom is the safe way to generate private data, where random module only
generate random data without entropy. Hexlify() and ascii() convert it to
lower case string. Once V6_ui will be into python 3.6 or higher, we will use
secrets module.

How to hack C2C ? if you want to inject an iframe, you will need to know the
value of _iframe_secret_tag present into server memory.
"""


def configure_parsers(settings):
    global _parsers_settings
    _parsers_settings = {
        'api_url': settings.get('api_url')
    }


def _get_cleaner():
    global _cleaner

    if not _cleaner:
        allowed_tags = bleach.ALLOWED_TAGS + [
            "div", "p", "h1", "h2", "h3", "h4", "h5", "pre", "hr",  # blocks
            "span", "br", "sub", "sup", "s", "del", "ins",  # inline
            "figure", "img", "figcaption",  # images
            _iframe_secret_tag,
            "table", "tr", "td", "th", "tbody"  # tables
        ]

        allowed_attributes = dict(bleach.ALLOWED_ATTRIBUTES)
        allowed_extra_attributes = {
            "h1": ["id"],
            "h2": ["id"],
            "h3": ["id"],
            "h4": ["id"],
            "h5": ["id"],
            "table": ["class"],
            "span": ["class", "translate"],
            _iframe_secret_tag: ["class", "src"],
            "figure": ["class", _ngclick_secret_tag],
            "img": ["src", "class", "alt", "img-id"],
        }

        for key in allowed_extra_attributes:
            if key not in allowed_attributes:
                allowed_attributes[key] = []

            allowed_attributes[key] += allowed_extra_attributes[key]

        _cleaner = bleach.Cleaner(tags=allowed_tags,
                                  attributes=allowed_attributes,
                                  styles=bleach.ALLOWED_STYLES,
                                  protocols=bleach.ALLOWED_PROTOCOLS,
                                  strip=False,
                                  strip_comments=True)

    return _cleaner


def _get_markdown_parser():
    global _markdown_parser
    if not _markdown_parser:
        extensions = [
            C2CWikiLinkExtension(),
            C2CImageExtension(api_url=_parsers_settings['api_url'],
                              ngclick_secret_tag=_ngclick_secret_tag),
            C2CImportantExtension(),
            C2CWarningExtension(),
            Nl2BrExtension(),
            TocExtension(marker='[toc]', baselevel=2),
            AutoLinkExtension(),
            C2CVideoExtension(iframe_secret_tag=_iframe_secret_tag),
            C2CLTagExtension(),
        ]
        _markdown_parser = markdown.Markdown(output_format='xhtml5',
                                             extensions=extensions)
    return _markdown_parser


def parse_code(text):
    text = _get_markdown_parser().convert(text)
    text = _get_cleaner().clean(text=text)
    text = text.replace(_iframe_secret_tag, "iframe")
    text = text.replace(_ngclick_secret_tag, "ng-click")

    return text
