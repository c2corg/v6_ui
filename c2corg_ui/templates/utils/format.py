import bbcode
import markdown
import html

from c2corg_ui.format.wikilinks import C2CWikiLinkExtension


def sanitize(text):
    return html.escape(text)


def parse_code(text, md=True, bb=True):
    if md:
        wikilink = C2CWikiLinkExtension()
        text = markdown.markdown(text, output_format='xhtml5',
            extensions=[wikilink])
    if bb:
        bbcode_parser = bbcode.Parser(escape_html=False, newline='\n')
        text = bbcode_parser.format(text)
    return text
