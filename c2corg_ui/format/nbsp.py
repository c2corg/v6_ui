from markdown import Extension
from markdown.inlinepatterns import Pattern


class NbspPattern(Pattern):
    def handleMatch(self, m):  # noqa
        placeholder = self.markdown.htmlStash.store("&nbsp;")
        return "".join((m.group(2), placeholder, m.group(3)))


class C2CNbspExtension(Extension):
    def extendMarkdown(self, md, md_globals):  # noqa
        md.inlinePatterns.add('c2c_nbsp',
                              NbspPattern(r'(\d) +([a-z])', md),
                              '<strong')


def makeExtension(*args, **kwargs):  # noqa
    return C2CNbspExtension(*args, **kwargs)
