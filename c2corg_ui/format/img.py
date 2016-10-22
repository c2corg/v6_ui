'''
c2corg img Extension for Python-Markdown
==============================================

Converts tags like
[img=<id>( <position>)?( big)?(/)?](<caption>)?([/img])?
to
<figure class="embedded_[position]">
  <a [action-open-slideshow] title="[caption]">
    <img src="[api_url]/images/proxy/[id][?size=BI]" alt="[caption]" />
  </a>
  <a href="/images/[id]" translate>See image details</a>
  <figcaption>[caption]</figcaption>
</figure>
'''

from markdown.extensions import Extension
from markdown.inlinepatterns import Pattern
from markdown.util import etree


class C2CImageExtension(Extension):

    def extendMarkdown(self, md, md_globals):  # noqa
        self.md = md

        img_re = r'\[img=(\d+) /\]'
        pattern = C2CImage(img_re)
        pattern.md = md
        # append to end of inline patterns
        md.inlinePatterns.add('c2cimg', pattern, "<not_strong")


class C2CImage(Pattern):

    def handleMatch(self, m):  # noqa
        img = etree.Element('img')
        img.set('src', '/images/proxy/' + m.group(2).strip())
        return img


def makeExtension(*args, **kwargs):  # noqa
    return C2CImageExtension(*args, **kwargs)
