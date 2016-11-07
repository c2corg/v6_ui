'''
c2corg "warning" Extension for Python-Markdown
==============================================

Converts tags such as [warning]Some warning text[/warning]
'''

from markdown.extensions import Extension
from markdown.inlinepatterns import Pattern
from markdown.util import etree

WARNING_RE = r'\[warning\](.*)\[/warning\]'


class C2CWarningExtension(Extension):

    def extendMarkdown(self, md, md_globals):  # noqa
        self.md = md

        pattern = C2CWarning(WARNING_RE)
        pattern.md = md
        # append to end of inline patterns
        md.inlinePatterns.add('c2cwarning', pattern, "<not_strong")


class C2CWarning(Pattern):

    def handleMatch(self, m):  # noqa
        content = m.group(2).strip()
        if content:
            div = etree.Element('div')
            div.set('class', 'warning_message')
            icon = etree.Element('span')
            icon.set('class', 'glyphicon glyphicon-exclamation-sign')
            icon.tail = content
            div.append(icon)
        else:
            div = ''
        return div


def makeExtension(*args, **kwargs):  # noqa
    return C2CWarningExtension(*args, **kwargs)
