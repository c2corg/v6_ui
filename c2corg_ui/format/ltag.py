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

    """ Supported tags are L#, R#, L#~, L#= """
    RE_LTAG_UNSUPPORTED = re.compile(r'[L|R]#[^\s|~|=]+')

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
                log.info(
                    "[LTag] Skip all because of unsupported LTAG : \"{}\""
                    .format(line)
                )
                self.processor.skip()

            # Are current & next lines LTags ?
            is_line_ltag_line = self.processor.is_line_globally_ltag(line)
            if i < last_line:
                is_line_ltag_next_line \
                    = self.processor.is_line_globally_ltag(lines[i+1])
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
    RE_LTAG = re.compile(r'(?P<pitch_type>[L|R])#(?P<modifier>~|=|_|[0-9]*)')
    RE_LTAG_FOR_TEXT_IN_THE_MIDDLE = re.compile(r'[L|R]#~\s*')
    RE_RTAG_ROW_DISTINCTION = re.compile(r'^\s*R#.*$')
    RE_PIPE_SELECTION = re.compile(r'(\|)(?![^|]*\]\])')

    ltag_template = '<span class="pitch"><span translate>{0}</span>{1}</span>'
    pipe_replacement = '__--|--__'
    pitch_number = 1
    abseil_number = 1
    shouldSkip = False
    text_in_the_middle = False

    def __init__(self, parser):
        super(LTagProcessor, self).__init__(parser)

    def skip(self):
        self.shouldSkip = True

    def reset_for_new_document(self):
        self.pitch_number = 1
        self.abseil_number = 1
        self.shouldSkip = False

    def increment_row_number(self, row):
        if self.RE_RTAG_ROW_DISTINCTION.search(row) is not None:
            self.abseil_number += 1
            return

        self.pitch_number += 1

    def get_row_number(self, col_number, pitch_type):
        if col_number == 1 and pitch_type == "R":
            return self.abseil_number

        return self.pitch_number

    def is_line_globally_ltag(self, text):
        is_line_ltag = self.is_line_ltag(text)

        if is_line_ltag:
            self.text_in_the_middle = False

        # There is some text lines that should be consider as ltag
        if self.text_in_the_middle:
            return True

        # There is a text in the middle LTAG "L#~"
        # so we'll include the following lines until next LTAG
        if self.is_line_ltag_for_text_in_the_middle(text):
            self.text_in_the_middle = True
            return True

        return is_line_ltag

    def is_line_ltag(self, text):
        return self.RE_LTAG_BLOCK.search(text) is not None

    def is_line_ltag_for_text_in_the_middle(self, text):
        return self.RE_LTAG_FOR_TEXT_IN_THE_MIDDLE_BLOCK.search(text) \
            is not None

    def test(self, parent, block):
        # Early return if we have to skip the whole block because of an
        # unsupported Ltag
        if self.shouldSkip:
            return False

        # Split block in lines
        rows = block.split('\n')
        is_block_ltag = True
        for row in rows:
            if not self.is_line_globally_ltag(row):
                is_block_ltag = False
                break

        return is_block_ltag

    def run(self, parent, blocks):
        raw_block = blocks.pop(0)

        # Replace relevant pipes to protect wikilinks
        block = self.RE_PIPE_SELECTION.sub(self.pipe_replacement, raw_block)

        rows = block.split('\n')

        try:
            ltag_rows = self.parse(rows)

            self.render(parent, ltag_rows)
        except Exception as e:
            log.info(
                "[LTag] Do not render due to parse/render Exception : \"{}\""
                .format(e)
            )
            div = etree.SubElement(parent, 'div')
            div.text = raw_block
            return

    def parse(self, rows):
        ltag_rows = []
        ltag_row = None
        for raw_row in rows:
            raw_cells = raw_row.split(self.pipe_replacement)

            if len(raw_cells) == 0:
                raise Exception(
                    "There's is no cells in this LTag : \"{}\""
                    .format(raw_row)
                )

            if ltag_row is not None \
                and ltag_row.is_text_in_the_middle() \
                    and not self.is_line_ltag(raw_row):
                ltag_row.append_text_to_first_cell(raw_row)
                continue

            ltag_row = LTagRow(raw_row)
            ltag_row.parse_first_cell(raw_cells[0])
            if ltag_row.has_position():
                ltag_row.set_row_position(
                    self.get_row_number(1, ltag_row.get_pitch_type())
                )
                self.increment_row_number(ltag_row.get_raw_text())

            for raw_cell in raw_cells:
                ltag_cell = LTagCell(raw_cell)

                ltag_row.append(ltag_cell)

            ltag_rows.append(ltag_row)

        return ltag_rows

    def render(self, parent, ltag_rows):
        table = etree.SubElement(parent, 'table')
        table.set('class', 'ltag')
        tbody = etree.SubElement(table, 'tbody')
        max_col_number = 0
        for _, ltag_row in enumerate(ltag_rows):

            tr = etree.SubElement(tbody, 'tr')
            col_number = 1

            # Others cells
            for cell in ltag_row.get_ltag_cells():

                # Header
                if ltag_row.get_row_modifier() == "=":
                    thd = etree.SubElement(tr, 'th')
                else:
                    thd = etree.SubElement(tr, 'td')

                # Text in the middle
                if ltag_row.get_row_modifier() == "~":
                    thd.text = self.RE_LTAG_FOR_TEXT_IN_THE_MIDDLE.sub(
                        '', cell.get_raw_text().replace("\n", "<br/>")
                    )
                    thd.set('colspan', str(max_col_number - 1))
                else:
                    thd.text, _ = self.process_ltag(
                        cell.get_raw_text(), ltag_row.get_row_position()
                    )
                col_number += 1

            max_col_number = max(col_number, max_col_number)

    def process_ltag(self, text, row_position):
        text = text.strip()
        matches = self.RE_LTAG.finditer(text)
        main_modifier = ""

        for match in matches:
            pitch_type = match.group('pitch_type')
            modifier = match.group('modifier')

            if str(modifier) == "=":
                text = ""
                main_modifier = str(modifier)
                continue

            text = text.replace(
                match.group(0),
                self.ltag_template.format(
                    pitch_type,
                    row_position
                )
            )

        return text, main_modifier


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


class LTagRow(object):

    def __init__(self, raw_text):
        self.raw_text = raw_text
        self.ltag_cells = []
        self.row_position = None
        self.row_modifier = ""
        self.pitch_type = "L"

    def get_pitch_type(self):
        return self.pitch_type

    def get_row_modifier(self):
        return self.row_modifier

    def get_raw_text(self):
        return self.raw_text

    def get_ltag_cells(self):
        return self.ltag_cells

    def is_text_in_the_middle(self):
        return self.row_modifier == "~"

    def has_position(self):
        return self.row_modifier not in ['~', '=']

    def set_row_position(self, row_position):
        self.row_position = row_position

    def get_row_position(self):
        return self.row_position

    def append(self, ltag_cell):
        self.ltag_cells.append(ltag_cell)

    def append_text_to_first_cell(self, text):
        self.ltag_cells[0].append_text(text)

    def parse_first_cell(self, first_cell):
        first_cell = first_cell.strip()

        # count matches
        if sum(1 for _ in LTagProcessor.RE_LTAG.finditer(first_cell)) != 1:
            raise Exception(
                "First row cell must have one LTag : \"{}\""
                .format(first_cell)
                )

        matches = LTagProcessor.RE_LTAG.finditer(first_cell)
        for match in matches:
            self.pitch_type = match.group("pitch_type")
            self.row_modifier = match.group("modifier")


class LTagCell(object):

    def __init__(self, raw_text):
        self.raw_text = raw_text

    def get_raw_text(self):
        return self.raw_text

    def append_text(self, text):
        self.raw_text = self.raw_text + "\n" + text


def makeExtension(*args, **kwargs):  # noqa
    return C2CLTagExtension(*args, **kwargs)
