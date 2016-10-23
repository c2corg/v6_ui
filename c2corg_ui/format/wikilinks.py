'''
c2corg wikiLinks Extension for Python-Markdown
==============================================

Converts tags such as [[document_type/document_id|label]]
to <a href="/document_type/document_id">label</a>

Inspired from https://github.com/waylan/Python-Markdown/blob/master
/markdown/extensions/wikilinks.py
'''

from markdown.extensions import Extension
from markdown.inlinepatterns import Pattern
from markdown.util import etree


class C2CWikiLinkExtension(Extension):

    def extendMarkdown(self, md, md_globals):  # noqa
        self.md = md

        wikilink_re = r'\[\[([^|]+)\|([^\]]+)\]\]'
        pattern = C2CWikiLinks(wikilink_re)
        pattern.md = md
        # append to end of inline patterns
        md.inlinePatterns.add('c2cwikilink', pattern, "<not_strong")


class C2CWikiLinks(Pattern):

    def handleMatch(self, m):  # noqa
        url = m.group(2).strip()
        if url:
            url = '/' + url if url[0] != '/' else url

            if url.startswith('/users/'):
                # '/users' was renamed to '/profiles' (v5 -> v6)
                url = url.replace('/users/', '/profiles/')

            label = m.group(3).strip()
            a = etree.Element('a')
            a.text = label
            a.set('href', url)
        else:
            a = ''
        return a


def makeExtension(*args, **kwargs):  # noqa
    return C2CWikiLinkExtension(*args, **kwargs)
