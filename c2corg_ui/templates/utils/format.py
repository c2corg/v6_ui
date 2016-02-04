import bbcode
import markdown
import html


def sanitize(text):
    return html.escape(text)


def parse_code(text, md=True, bb=True):
    if md:
        text = markdown.markdown(text, output_format='xhtml5')
    if bb:
        bbcode_parser = bbcode.Parser(escape_html=False, newline='\n')
        text = bbcode_parser.format(text)
    return text
