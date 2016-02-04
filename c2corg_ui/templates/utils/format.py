import bbcode
import markdown
import html


def sanitize(text):
    return html.escape(text)


def parse_code(text):
    text = markdown.markdown(text)
    bbcode_parser = bbcode.Parser(escape_html=False, newline='\n')
    return bbcode_parser.format(text)
