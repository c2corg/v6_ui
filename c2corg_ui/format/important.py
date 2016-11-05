'''
c2corg "important" Extension for Python-Markdown
==============================================

Converts tags such as [important]Some important text[/important]
'''

from markdown.extensions import Extension
from markdown.inlinepatterns import Pattern
from markdown.util import etree

IMPORTANT_RE = r'\[important\](.*)\[/important\]'


class C2CImportantExtension(Extension):

    def extendMarkdown(self, md, md_globals):  # noqa
        self.md = md

        pattern = C2CImportant(IMPORTANT_RE)
        pattern.md = md
        # append to end of inline patterns
        md.inlinePatterns.add('c2cimportant', pattern, "<not_strong")


class C2CImportant(Pattern):

    def handleMatch(self, m):  # noqa
        content = m.group(2).strip()
        if content:
            div = etree.Element('div')
            div.set('class', 'important_message')
            icon = etree.Element('span')
            icon.set('class', 'glyphicon glyphicon-exclamation-sign')
            icon.tail = '&nbsp;' + content
            div.append(icon)
        else:
            div = ''
        return div


def makeExtension(*args, **kwargs):  # noqa
    return C2CImportantExtension(*args, **kwargs)
