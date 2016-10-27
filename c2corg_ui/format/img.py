'''
c2corg img Extension for Python-Markdown
==============================================

Converts tags like
[img=<id>(<options>)(/)?](<caption>)?([/img])?
to advanced HTML img tags.
'''

from markdown.extensions import Extension
from markdown.inlinepatterns import Pattern
from markdown.util import etree

IMG_RE = r'\[img=(\d+)([a-z_ ]*)(/\]|\](.*?)\[/img\])'


class C2CImageExtension(Extension):

    def __init__(self, *args, **kwargs):
        self.config = {
            "api_url": ['', 'Base URL of the API. Defaults to ""']
        }

        super(C2CImageExtension, self).__init__(*args, **kwargs)

    def extendMarkdown(self, md, md_globals):  # noqa
        self.md = md

        pattern = C2CImage(IMG_RE, self.getConfigs())
        pattern.md = md
        # append to end of inline patterns
        md.inlinePatterns.add('c2cimg', pattern, "<not_strong")


class C2CImage(Pattern):

    def __init__(self, pattern, config):
        super(C2CImage, self).__init__(pattern)
        self.config = config

    def handleMatch(self, m):  # noqa
        # group(1) is everything before the pattern
        # group(2) is the first group of the pattern
        img_id = m.group(2)
        options = m.group(3).split() if m.group(3) else []
        caption = m.group(5).strip() if m.group(5) else ''

        position = 'inline'
        img_size = 'MI'
        for option in options:
            if option in ['left', 'right', 'center', 'inline']:
                position = option
            elif option == 'big':
                img_size = 'BI'
            elif option == 'small':
                img_size = 'SI'
            elif option == 'orig':
                img_size = ''

        img = etree.Element('img')
        img_url = '%s/images/proxy/%s' % (
            self.config['api_url'], img_id)
        if img_size:
            img_url += '?size=' + img_size
        img.set('src', img_url)
        img.set('alt', caption or img_id)
        # TODO: open slideshow when the image is clicked

        if caption:
            fig = etree.Element('figure')
            fig.set('class', 'embedded_' + position)
            fig.append(img)

            img_link = etree.Element('a')
            img_link.set('href', '/images/%s' % img_id)
            img_link.text = caption

            img_caption = etree.Element('figcaption')
            img_caption.append(img_link)

            fig.append(img_caption)
            return fig

        else:
            img.set('class', 'embedded_' + position)
            return img


def makeExtension(*args, **kwargs):  # noqa
    return C2CImageExtension(*args, **kwargs)
