'''
c2corg video Extension for Python-Markdown
==============================================

Converts video tags to advanced HTML video tags.
'''

from markdown.extensions import Extension
from markdown.inlinepatterns import Pattern
from markdown.util import etree
import re

VIDEO_RE = r'\[video\](.*?)\[/video\]'


class C2CVideoExtension(Extension):
    def __init__(self, *args, **kwargs):
        self._iframe_secret_tag = kwargs.pop("iframe_secret_tag")
        super(C2CVideoExtension, self).__init__(*args, **kwargs)

    def extendMarkdown(self, md, md_globals):  # noqa
        self.md = md

        pattern = C2CVideo(VIDEO_RE, markdown_instance=md,
                           iframe_secret_tag=self._iframe_secret_tag)
        pattern.md = md
        # append to end of inline patterns
        md.inlinePatterns.add('c2cvideo', pattern, "<extra_autolink")


class C2CVideo(Pattern):
    def __init__(self, *args, **kwargs):
        self._iframe_secret_tag = kwargs.pop("iframe_secret_tag")
        super(C2CVideo, self).__init__(*args, **kwargs)

    def handleMatch(self, m):  # noqa
        link = m.group(2).strip()

        # youtube http://www.youtube.com/watch?v=3xMk3RNSbcc(&something)
        domain = r"https?:\/\/(?:www\.)?youtube\.com"
        url = r"/watch\?(?:[=&\w]+&)?v=([-\w]+)(?:&.+)?(?:\#.*)?"
        match = re.search(domain + url, link)  # noqa
        if match:
            return self._embed('//www.youtube.com/embed/' + match.group(1))

        # youtube short links http://youtu.be/3xMk3RNSbcc
        match = re.search(r'https?:\/\/(?:www\.)?youtu\.be/([-\w]+)(?:\#.*)?',
                          link)  # noqa
        if match:
            return self._embed('//player.vimeo.com/video/' +
                               match.group(1) +
                               '?title=0&amp;byline=0&amp;' +
                               'portrait=0&amp;color=ff9933')  # noqa

        # dailymotion http://www.dailymotion.com/video/x28z33_chinese-man
        domain = r"https?://www\.dailymotion\.com"
        url = r"/video/([\da-zA-Z]+)_[-&;\w]+(?:\#.*)?"
        match = re.search(domain + url, link)  # noqa
        if match:
            return self._embed('//www.dailymotion.com/embed/video/' +
                               match.group(1) +
                               '?theme=none&amp;wmode=transparent')

        # dailymotion short links http://dai.ly/x5b5r49
        match = re.search(r"https?://www\.dai\.ly/([\da-zA-Z]+)", link)
        if match:
            return self._embed('//www.dailymotion.com/embed/video/' +
                               match.group(1) +
                               '?theme=none&amp;wmode=transparent')

        # vimeo http://vimeo.com/8654134
        match = re.search(r'https?://(?:www\.)?vimeo\.com/(\d+)(?:\#.*)?',
                          link)
        if match:

            return self._embed('//player.vimeo.com/video/' +
                               match.group(1) +
                               '?title=0&amp;byline=0&amp;' +
                               'portrait=0&amp;color=ff9933')  # noqa

        return self.unescape(m.group(0))

    def _embed(self, link):
        iframe = etree.Element(self._iframe_secret_tag)
        iframe.set('class', 'embed-reponsive-item')
        iframe.set('src', link)
        embed = etree.Element('div')
        embed.set('class', 'embed-responsive embed-responsive-4by3 video')
        embed.append(iframe)
        return embed


def makeExtension(*args, **kwargs):  # noqa
    return C2CVideoExtension(*args, **kwargs)
