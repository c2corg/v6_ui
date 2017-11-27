import markdown
from markdown.blockprocessors import BlockProcessor
from markdown import util
import re
import logging

logger = logging.getLogger('MARKDOWN')


# copied from class markdown.blockprocessors.HashHeaderProcessor
class HeaderEmphasisProcessor(BlockProcessor):
    """ Process Hash Headers. """

    # Detect a header at start of any line in block
    RE = re.compile(r'(^|\n)(?P<level>#{1,6})' +
                    '(?P<header>[^#].*?)#+(?P<emphasis>[^#]+?)(\n|$)')

    def test(self, parent, block):
        return bool(self.RE.search(block))

    def run(self, parent, blocks):
        block = blocks.pop(0)
        m = self.RE.search(block)
        if m:
            before = block[:m.start()]  # All lines before header
            after = block[m.end():]  # All lines after header
            if before:
                # As the header was not the first line of the block and the
                # lines before the header must be parsed first,
                # recursively parse this lines as a block.
                self.parser.parseBlocks(parent, [before])
            # Create header using named groups from RE
            h = util.etree.SubElement(parent, 'h%d' % len(m.group('level')))
            h.text = m.group('header').strip() + ' '
            emphasis = util.etree.SubElement(h, 'span')
            emphasis.set('class', 'HeaderEmphasis')
            emphasis.text = m.group('emphasis').strip()

            if after:
                # Insert remaining lines as first block for future parsing.
                blocks.insert(0, after)
        else:  # pragma: no cover
            # This should never happen, but just in case...
            logger.warn("We've got a problem header: %r" % block)


class HeaderEmphasisExtension(markdown.Extension):
    def extendMarkdown(self, md, md_globals):  # noqa
        md.parser.blockprocessors.add(
            'header_emphasis',
            HeaderEmphasisProcessor(md.parser),
            "<hashheader")


def makeExtension(configs=[]):  # noqa
    return HeaderEmphasisExtension(configs=configs)
