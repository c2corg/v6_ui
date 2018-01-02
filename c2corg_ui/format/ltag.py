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
                log.info("Skip all because of unsupported LTAG : \""+line+"\"")
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

    def parse(self, rows):
        ltagRows = []
        ltagRow = None
        for rawRow in rows:
            rawCells = rawRow.split(self.pipe_replacement)

            if len(rawCells) == 0:
                raise Exception("There's is no cells in this LTag : \""+rawRow+"\"")

            if ltagRow is not None \
                and ltagRow.isTextInTheMiddle() \
                and not self.is_line_ltag(rawRow):
                ltagRow.appendTextToFirstCell(rawRow)
                continue

            ltagRow = LTagRow(rawRow)
            ltagRow.parseFirstCell(rawCells[0])
            ltagRow.setRowPosition(self.get_row_number(ltagRow.getPitchType(), 0))

            for rawCell in rawCells:
                ltagCell = LTagCell(rawCell)

                ltagRow.append(ltagCell)


            ltagRows.append(ltagRow)

        return ltagRows

    def render(self, parent, ltagRows):
        table = etree.SubElement(parent, 'table')
        table.set('class', 'ltag')
        tbody = etree.SubElement(table, 'tbody')
        max_col_number = 0
        text_in_the_middle_td = None
        for _, ltagRow in enumerate(ltagRows):
           
            tr = etree.SubElement(tbody, 'tr')
            col_number = 1

            # Others cells
            for cell in ltagRow.getLTagCells():
                if ltagRow.getRowModifier() == "=":
                    thd = etree.SubElement(tr, 'th')
                else:
                    thd = etree.SubElement(tr, 'td')

                if ltagRow.getRowModifier() == "~":
                    thd.text = self.RE_LTAG_FOR_TEXT_IN_THE_MIDDLE.sub('', cell.getRawText().replace("\n", "<br/>"))
                    thd.set('colspan', str(max_col_number - 1))
                else:
                    thd.text, _ = self.process_ltag(cell.getRawText(), col_number)
                col_number += 1

            max_col_number = max(col_number, max_col_number)

            if ltagRow.getRowModifier() != "=":
                self.increment_row_number(ltagRow.getRawText())


    def run(self, parent, blocks):
        block = blocks.pop(0)

        # Replace relevant pipes to protect wikilinks
        block = self.RE_PIPE_SELECTION.sub(self.pipe_replacement, block)

        rows = block.split('\n')
        
        ltagRows = self.parse(rows)

        self.render(parent, ltagRows)

        
    def process_ltag(self, text, col_number):
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

            pitch_number = self.get_row_number(col_number, pitch_type)

            text = text.replace(
                match.group(0),
                self.ltag_template.format(
                    pitch_type,
                    str(pitch_number)
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

    def __init__(self, rawText):
        self.rawText = rawText
        self.ltagCells = []
        self.rowPosition = None
        self.rowModifier = ""
        self.pitchType = "L"

    def getPitchType(self):
        return self.pitchType

    def getRowModifier(self):
        return self.rowModifier

    def getRawText(self):
        return self.rawText

    def getLTagCells(self):
        return self.ltagCells

    def isTextInTheMiddle(self):
        return self.rowModifier == "~"

    def setRowPosition(self, rowPosition):
        self.rowPosition = rowPosition

    def append(self, ltagCell):
        self.ltagCells.append(ltagCell)

    def appendTextToFirstCell(self, text):
        self.ltagCells[0].appendText(text)

    def parseFirstCell(self, firstCell):
        firstCell = firstCell.strip()

        # count matches
        if sum(1 for _ in LTagProcessor.RE_LTAG.finditer(firstCell)) != 1:
            raise Exception("First row cell shouldn't have more or less than one LTag : \""+firstCell+"\"")

        matches = LTagProcessor.RE_LTAG.finditer(firstCell)
        for match in matches:
            self.pitchType = match.group("pitch_type")
            self.rowModifier = match.group("modifier")



class LTagCell(object):

    def __init__(self, rawText):
        self.rawText = rawText

    def getRawText(self):
        return self.rawText

    def appendText(self, text):
        self.rawText = self.rawText + "\n" + text




def makeExtension(*args, **kwargs):  # noqa
    return C2CLTagExtension(*args, **kwargs)


