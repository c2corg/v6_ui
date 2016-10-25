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

    def __init__(self, *args, **kwargs):
        self.config = {
            "api_url": ['', 'Base URL of the API. Defaults to ""']
        }

        super(C2CImageExtension, self).__init__(*args, **kwargs)

    def extendMarkdown(self, md, md_globals):  # noqa
        self.md = md

        IMG_RE = r'\[img=(\d+) /\]'
        pattern = C2CImage(IMG_RE, self.getConfigs())
        pattern.md = md
        # append to end of inline patterns
        md.inlinePatterns.add('c2cimg', pattern, "<not_strong")


class C2CImage(Pattern):

    def __init__(self, pattern, config):
        super(C2CImage, self).__init__(pattern)
        self.config = config

    def handleMatch(self, m):  # noqa
        img = etree.Element('img')
        img_url = '%s/images/proxy/%s' % (
            self.config['api_url'],  m.group(2).strip())
        img.set('src', img_url)
        return img


def makeExtension(*args, **kwargs):  # noqa
    return C2CImageExtension(*args, **kwargs)
