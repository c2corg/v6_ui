import bbcode
import markdown


def parse_code(text):
    text = markdown.markdown(text)
    bbcode_parser = bbcode.Parser(escape_html=False, newline='\n')
    text = bbcode_parser.format(text)
    return text
