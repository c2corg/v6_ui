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
    RE_LTAG_UNSUPPORTED = re.compile(r'[L|R]#[^\s|~]+')

    def __init__(self, processor):
        self.processor = processor

    def is_line_ltag_supported(self, text):
        return self.RE_LTAG_UNSUPPORTED.search(text) is not None

    def run(self, lines):
        # Reset ltag processor
        self.processor.reset_for_new_document()

        new_lines = []
        is_block_ltag = False
        last_line = len(lines) - 1
        for i, line in enumerate(lines):

            # If there is an unsupported tag, skip the entire block
            if self.is_line_ltag_supported(line):
                log.info("Skip all because of unsupported LTAG : \""+line+"\"")
                self.processor.set_skip(True)

            # Are current & next lines LTags ?
            is_line_ltag_line = self.processor.is_line_globally_ltag(line)
            if i < last_line:
                is_line_ltag_next_line = self.processor.is_line_globally_ltag(lines[i+1])
            else:
                is_line_ltag_next_line = False

            # Strip empty lines inside ltag blocks
            if is_block_ltag and is_line_ltag_next_line and not line.strip():
                continue

            # Make sure LTag block is preceded by a blank line
            if not is_block_ltag and is_line_ltag_line and lines[i-1].strip():
                new_lines.append("\n")

            # Make sure LTag block is followed by a blank line
            if is_block_ltag and not is_line_ltag_line and line.strip():
                new_lines.append("\n")

            new_lines.append(line)
            is_block_ltag = is_line_ltag_line

        return new_lines


class LTagProcessor(BlockProcessor):
    """ Process LTags. """

    RE_LTAG_BLOCK = re.compile(r'^\s*(?:[L|R]#(?:[^|\n]*(?:\|[^|\n]*)+))+$')
    RE_LTAG_FOR_TEXT_IN_THE_MIDDLE_BLOCK = re.compile(r'^\s*[L|R]#~.*$')
    RE_LTAG = re.compile(r'(?P<pitch_type>[L|R])#(?P<modifier>_|[0-9]*)')
    RE_LTAG_FOR_TEXT_IN_THE_MIDDLE = re.compile(r'[L|R]#~\s*')
    RE_RTAG_ROW_DISTINCTION = re.compile(r'^\s*R#.*$')
    RE_PIPE_SELECTION = re.compile(r'(\|)(?![^|]*\]\])')

    ltag_template = '<span class="pitch"><span translate>{0}</span>{1}</span>'
    pipe_replacement = '__--|--__'
    pitch_count = 1
    abseil_count = 1
    skip = False
    text_in_the_middle = False

    def __init__(self, parser):
        super(LTagProcessor, self).__init__(parser)

    def set_skip(self, skip):
        self.skip = skip

    def reset_for_new_document(self):
        self.pitch_count = 1
        self.abseil_count = 1
        self.skip = False

    def increment_row_count(self, row):
        if self.RE_RTAG_ROW_DISTINCTION.search(row) is not None:
            self.abseil_count += 1
            return

        self.pitch_count += 1

    def get_row_count(self, col_number, pitch_type):
        if col_number == 1 and pitch_type == "R":
            return self.abseil_count

        return self.pitch_count

    def is_line_ltag(self, text):
        return self.RE_LTAG_BLOCK.search(text) is not None

    def is_line_globally_ltag(self, text):
        is_line_ltag = self.is_line_ltag(text)

        if is_line_ltag:
            self.text_in_the_middle = False

        # There is some text lines that should be consider as ltag
        if self.text_in_the_middle:
            return True

        # There is a text in the middle LTAG "L#~" so we'll include the following lines until next LTAG
        if self.is_line_ltag_for_text_in_the_middle(text):
            self.text_in_the_middle = True
            return True

        return is_line_ltag

    def is_line_ltag_for_text_in_the_middle(self, text):
        return self.RE_LTAG_FOR_TEXT_IN_THE_MIDDLE_BLOCK.search(text) is not None

    def test(self, parent, block):
        # Split block in lines
        rows = block.split('\n')
        is_block_ltag = True
        for row in rows:
            if not self.is_line_globally_ltag(row):
                is_block_ltag = False
                break

        return is_block_ltag

    def run(self, parent, blocks):
        block = blocks.pop(0)

        # Replace relevant pipes to protect wikilinks
        block = self.RE_PIPE_SELECTION.sub(self.pipe_replacement, block)

        rows = block.split('\n')
        table = etree.SubElement(parent, 'table')
        table.set('class', 'ltag')
        tbody = etree.SubElement(table, 'tbody')
        max_col_number = 0
        text_in_the_middle_td = None
        for row in rows:
            # Text in the middle case
            if self.is_line_ltag(row):
                text_in_the_middle_td = None

            if text_in_the_middle_td is not None:
                text_in_the_middle_td.text = text_in_the_middle_td.text + "<br/>" + row
                continue

            if self.is_line_ltag_for_text_in_the_middle(row):
                tr = etree.SubElement(tbody, 'tr')
                text_in_the_middle_td = etree.SubElement(tr, 'td')
                text_in_the_middle_td.set('colspan', str(max_col_number))
                text_in_the_middle_td.text = self.RE_LTAG_FOR_TEXT_IN_THE_MIDDLE.sub('', row)
                continue
                
            tr = etree.SubElement(tbody, 'tr')
            cols = row.split(self.pipe_replacement)
            col_number = 1

            # Pitch / Relay cell
            td = etree.SubElement(tr, 'td')

            td.text = self.process_ltag(cols[0], col_number)
            col_number += 1

            # Others cells
            for col in cols[1:]:
                td = etree.SubElement(tr, 'td')
                td.text = self.process_ltag(col, col_number)
                col_number += 1

            max_col_number = max(col_number, max_col_number)

            self.increment_row_count(row)

    def process_ltag(self, text, col_number):
        text = text.strip()
        matches = self.RE_LTAG.finditer(text)

        for match in matches:
            pitch_type = match.group('pitch_type')
            modifier = match.group('modifier')
            pitch_number = self.get_row_count(col_number, pitch_type)

            # Text in the middle
            #if modifier == "~":


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
