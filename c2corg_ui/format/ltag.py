"""
LTag Extension for Python-Markdown
====================================

See https://regex101.com/r/g2Zjqn/2/ for regex tests

"""

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from markdown.blockprocessors import BlockProcessor
from markdown.util import etree
import re
import logging
log = logging.getLogger(__name__)


class LTagPreprocessor(Preprocessor):
    """ Preprocess lines to clean LTag blocks """

    """ Supported tags are L#, R# """
    RE_LTAG_UNSUPPORTED = re.compile(r'[L|R]#[^\s|]+')

    def __init__(self, processor):
        self.processor = processor

    def is_ltag_supported(self, text):
        return self.RE_LTAG_UNSUPPORTED.search(text) is not None

    def run(self, lines):
        # Reset ltag counter
        self.processor.reset_row_count()
        new_lines = []
        is_ltag_block = False
        nb_lines = len(lines)
        for i, line in enumerate(lines):

            # If there is an unsupported tag, skip the entire block
            if self.is_ltag_supported(line):
                log.debug("There is unsupported LTags in this block => skip it")
                self.processor.set_skip(True)

            is_ltag_line = self.processor.is_ltag(line)
            if i < nb_lines - 1:
                is_ltag_next_line = self.processor.is_ltag(lines[i+1])
            else:
                is_ltag_next_line = False

            # Strip empty lines inside ltag blocks
            if is_ltag_block and is_ltag_next_line and not line.strip():
                continue

            # Make sur LTag block is preceded by a blank line
            if not is_ltag_block and is_ltag_line and lines[i-1].strip():
                new_lines.append("\n")

            # Make sur LTag block is followed by a blank line
            if is_ltag_block and not is_ltag_line and line.strip():
                new_lines.append("\n")

            new_lines.append(line)
            is_ltag_block = is_ltag_line

        return new_lines


class LTagProcessor(BlockProcessor):
    """ Process LTags. """

    RE_LTAG_BLOCK = re.compile(r'^\s*(?:[L|R]#(?:[^|\n]*(?:\|[^|\n]*)+)\n?)+$')
    RE_LTAG = re.compile(r'([L|R])#(_|~|[0-9]*)')
    RE_RTAG_ROW_DISTINCTION = re.compile(r'^\s*R#.*$')
    RE_PIPE_SELECTION = re.compile(r'(\|)(?![^|]*\]\])')
    ltag_template = '<span class="pitch"><span translate>{0}</span>{1}</span>'
    pipe_replacement = '__--|--__'
    pitch_count = 1
    abseil_count = 1
    skip = False

    def __init__(self, parser):
        super(LTagProcessor, self).__init__(parser)

    def set_skip(self, skip):
        self.skip = skip

    def reset_row_count(self):
        self.pitch_count = 1
        self.abseil_count = 1

    def increment_row_count(self, row):
        if self.RE_RTAG_ROW_DISTINCTION.search(row) is not None:
            self.abseil_count += 1
            return

        self.pitch_count += 1

    def get_row_count(self, col_number, pitch_type):
        if col_number == 1 and pitch_type == "R":
            return self.abseil_count

        return self.pitch_count

    def is_ltag(self, text):
        return self.RE_LTAG_BLOCK.search(text) is not None

    def test(self, parent, block):
        is_ltag = self.is_ltag(block)
        rows = block.split('\n')

        log.debug("This block " + ("has ltags " + ("but will be skiped" if self.skip else "and will be processed") if is_ltag else "has no ltags") + " and is starting with \"" + rows[0] + "\"")

        return not self.skip and is_ltag

    def run(self, parent, blocks):
        block = blocks.pop(0)

        # Replace relevant pipes to protect wikilinks
        block = self.RE_PIPE_SELECTION.sub(self.pipe_replacement, block)

        rows = block.split('\n')
        table = etree.SubElement(parent, 'table')
        table.set('class', 'ltag')
        tbody = etree.SubElement(table, 'tbody')
        for row in rows:
            tr = etree.SubElement(tbody, 'tr')
            cols = row.split(self.pipe_replacement)
            col_number = 1

            # Pitch / Abseil cell
            td = etree.SubElement(tr, 'td')
            td.text = self.process_ltag(cols[0], col_number)
            col_number += 1

            # Others cells
            for col in cols[1:]:
                td = etree.SubElement(tr, 'td')
                td.text = self.process_ltag(col, col_number)
                col_number += 1

            self.increment_row_count(row)

    def process_ltag(self, text, col_number):
        text = text.strip()
        matches = self.RE_LTAG.finditer(text)

        for match in matches:
            pitch_type = match.group(1)
            # modifier = match.group(2)
            pitch_number = self.get_row_count(col_number, pitch_type)

            text = text.replace(
                match.group(0),
                self.ltag_template.format(
                    pitch_type,
                    str(pitch_number)
                )
            )

        return text


class C2CLTagExtension(Extension):
    """ Add tables to Markdown. """

    def extendMarkdown(self, md, md_globals):  # noqa
        """ Add an instance of TableProcessor to BlockParser. """
        if '|' not in md.ESCAPED_CHARS:
            md.ESCAPED_CHARS.append('|')
        ltagprocessor = LTagProcessor(md.parser)
        md.preprocessors.add('ltag', LTagPreprocessor(ltagprocessor), '_end')
        md.parser.blockprocessors.add('ltag',
                                      ltagprocessor,
                                      '<hashheader')


def makeExtension(*args, **kwargs):  # noqa
    return C2CLTagExtension(*args, **kwargs)
