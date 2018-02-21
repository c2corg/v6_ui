# coding: utf-8

"""
LTag Extension for Python-Markdown
====================================

See https://regex101.com/r/bVjbkp/6
"""

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from markdown.blockprocessors import BlockProcessor
from markdown.util import etree
import re
import logging

log = logging.getLogger(__name__)


class LTagNumbering(object):
    """
    The aim of this class is to store and handle everything about numbering.
    It's a private global singleton called _numbering own by this module,
    accessible from anywhere, and reseted on each parsing. This class
    replaces markdown L# values by numeric values, and changes it's state
    if necessary.

    This class owns a one way switch called "supported", initially set to
    True.    If it sees an unsupported pattern, it toggles it to False and
    don't work anymore

    It's the renderer responsability to render raw code if supported toogle
    is set to false. It means that rendering must be done at the very end.
    """

    @staticmethod
    def get_pattern():
        """
        Build the big ugly fat regexp for L# numbering
        It's fully based on named patterns : (P?<pattern_name>pattern)
        and decomposed part by part.

        Please have a look on
        https://forum.camptocamp.org/t/question-l/207148/69
        """
        p = "(?P<{}>{})".format

        # small patterns used more than once
        raw_label = r"[a-zA-Z'\"][a-zA-Z'\"\d_]*|_"
        raw_offset = r"[+\-]?\d*"

        # let's build multi pitch pattern, like L#-+3 or L#12-+4ter
        multi_pitch_label = p("multi_pitch_label", raw_label)
        first_offset = p("first_offset", raw_offset)
        last_offset = p("last_offset", raw_offset)
        first_pitch = p("first_pitch", first_offset + multi_pitch_label + "?")
        last_pitch = p("last_pitch", last_offset)
        multi_pitch = p("multi_pitch", first_pitch + "?-" + last_pitch)

        # mono pitch
        mono_pitch_label = p("mono_pitch_label", raw_label)
        mono_pitch_value = p("mono_pitch_value", "\+?\d*")
        mono_pitch = p("mono_pitch", mono_pitch_value + mono_pitch_label + "?")

        local_ref = p("local_ref", r"!")

        pitch = "(" + multi_pitch + "|" + mono_pitch + ")"
        numbering = p("numbering", pitch + local_ref + "?")

        text_in_the_middle = p("text_in_the_middle", "~")
        header = p("header", "=")

        typ = p("type", "[LR]")

        text = "(" + header + "|" + text_in_the_middle + "|" + numbering + ")"

        return p("ltag", typ + "#" + text)

    def __init__(self):

        # helper for final formatting
        self.format = ('<span class="pitch">'
                       '<span translate>{type}</span>'
                       '{text}</span>').format

        # regular expression used to do the lexical analysis
        self.reg_expr = re.compile(LTagNumbering.get_pattern())

        # And here is values that must be persistants for a markdown text.
        # There are set to None by __init__() method, and then set to there
        # initial values by reset() method.

        # Values for relative patterns
        self.value = None

        # One way switch
        self.supported = None

        # If no relative pattern is present, then label are allowed
        # As now, the only relative pattern handled is a simple L#
        self.allow_labels = None

        # if numbering contains a label, then relatives patterns
        # are no more allowed
        self.contains_label = None

        self.reset()

    def reset(self, ):
        self.value = {"R": 0, "L": 0}
        self.supported = True
        self.allow_labels = True
        self.contains_label = False

    def get_value(self, typ):
        return self.value[typ]

    def set_value(self, typ, value):
        self.value[typ] = value

        return self.value[typ]

    def compute(self, markdown, row_type, is_first_cell):
        """
        This function will test that first cell perfectly match
        And will replace pattern by good value
        In case of error, or unsupported pattern, it will returns
        raw pattern inside a <code/> block
        """

        def handle_match(match):
            return self.handle_match(match, row_type, is_first_cell)

        try:
            assert self.supported, "A previous pattern is not supported"

            if is_first_cell:
                # Way to test that markdown perfectly match self.reg_expr
                assert len(self.reg_expr.sub("", markdown)) == 0

            result = self.reg_expr.sub(handle_match, markdown)
        except (NotImplementedError, AssertionError):
            self.supported = False
            result = self.reg_expr.sub(r'`\1`', markdown)

        return result

    def handle_match(self, match, row_type, is_first_cell):
        """
        Handle three use cases :

        * header
        * mono pitch
        * multi pitch

        L#~ (text in the middle) is handled by
        LtagRow and LTagCellTextInTheMiddle
        """

        assert match.group("local_ref") is None, "Not yet supported"

        if match.group("header") is not None:
            # L#=
            return "" if is_first_cell else match.group(0)

        elif match.group("text_in_the_middle") is not None:
            return match.group(0)

        elif match.group("multi_pitch") is not None:
            return self.handle_multipitch(match, is_first_cell)

        elif match.group("mono_pitch") is not None:
            return self.handle_monopitch(match, row_type, is_first_cell)

        else:
            raise NotImplementedError("Should not happen!?")

    def compute_label(self, raw_label):
        """
        Get L# label, and check supported use case
        """

        if raw_label is not None:
            assert self.allow_labels, "Can't handle label"
            assert raw_label != "_", "Not yet supported"

            self.contains_label = True
        else:
            raw_label = ""

        return raw_label

    def handle_multipitch(self, match, is_first_cell):
        """
        Can be :

            L#1-4
            L#1bis-4
        """
        label = self.compute_label(match.group("multi_pitch_label"))

        typ = match.group("type")
        first_offset = match.group("first_offset")
        last_offset = match.group("last_offset")
        assert first_offset.isdigit(), "Not yet supported"
        assert last_offset.isdigit(), "Not yet supported"

        if is_first_cell:  # first cell impacts numbering
            self.set_value(typ, int(last_offset))

        text = "".join((first_offset, label, "-", last_offset, label))

        return self.format(type=typ, text=text)

    def handle_monopitch(self, match, row_type, is_first_cell):
        """
        Can be :

            L#
            L#12
            L#13bis
        """

        label = self.compute_label(match.group("mono_pitch_label"))

        typ = match.group("type")
        value = match.group("mono_pitch_value")

        if value.isdigit():
            return self.handle_monopitch_value(typ, is_first_cell,
                                               value, label)

        elif value == "":
            old_value = self.get_value(typ if is_first_cell else row_type)

            return self.handle_monopitch_offset(typ, is_first_cell,
                                                old_value)

        else:
            # may be
            # L#+12  (offset)
            # L#+12bis (offset with label)
            raise NotImplementedError("Not yet supported")

    def handle_monopitch_value(self, typ, is_first_cell, value, label):
        # Fixed number : L#12
        # and label :    L#12bis

        if is_first_cell:  # first cell impacts numbering
            self.set_value(typ, int(value))

        return self.format(type=typ, text=value + label)

    def handle_monopitch_offset(self, typ, is_first_cell, old_value):
        # Simple use case : L#
        self.allow_labels = False
        assert not self.contains_label, "Not yet supported"

        value = old_value

        if is_first_cell:  # first cell impacts numbering
            value += 1
            self.set_value(typ, value)

        return self.format(type=typ, text=str(value))


class LTagRow(object):
    """
    This class represent a LTag row. It splits cells, and handles
    cell rendering
    """
    RE_PIPE_SELECTION = re.compile(r'(\|)(?![^|]*\]\])')
    CELL_SEPARATOR = '__--|--__'

    def __init__(self, markdown):
        self.markdown = markdown.strip()
        self.row_type = self.markdown[0]
        self.cells = []

        marker = markdown[2:3]

        self.is_text_in_the_middle = marker == "~"  # the pattern L#~
        self.is_header_row = marker == "="  # the pattern L#=

    @property
    def column_count(self):
        return len(self.cells)

    def append_markdown(self, markdown):
        """
        Consider this markdown :

            L# | hello
            World

        It must gives for second cell :

            hello<br>world

        To perform this, parser must append new line "World".

        It's the reason of this function.
        """
        self.markdown = "<br>".join((self.markdown, markdown.strip()))

    def compute(self):
        """
        This function will split row's cells into a list of
        LTagCell objects. It's done before rendering because
        L#~ needs to know the column count of the table.
        """

        if self.is_text_in_the_middle:
            # L#~ has a separated process, much simplier
            self.cells.append(LTagCellTextInTheMiddle(self.markdown[3:]))

        else:
            # replace separator by cell_separator to protect links
            markdown = self.RE_PIPE_SELECTION.sub(self.CELL_SEPARATOR,
                                                  self.markdown)

            # and split markdown
            cell_markdowns = markdown.split(self.CELL_SEPARATOR)

            for cell_markdown in cell_markdowns:
                self.cells.append(LTagCell(cell_markdown,
                                           is_first_cell=len(self.cells) == 0))

    def render(self, parent, column_count):
        """
        This function render the row in HTML nodes.
        """
        row = etree.SubElement(parent, 'tr')
        cell_node_name = "th" if self.is_header_row else "td"

        for cell in self.cells:
            cell.render(row, self.row_type, cell_node_name, column_count)


class LTagCell(object):
    """
    This class represent a default cell
    is_first_cell property is here because first cell markdown parser
    is different:

    * It impacts numbering
    * And cell content must perfectly match pattern
    """

    def __init__(self, markdown, is_first_cell):
        self.markdown = markdown.strip(" \n")
        self.is_first_cell = is_first_cell

    def render(self, parent, row_type, node_name, column_count):
        parsed = _numbering.compute(self.markdown, row_type,
                                    is_first_cell=self.is_first_cell)

        cell = etree.SubElement(parent, node_name)
        cell.text = parsed.strip()

        return cell


class LTagCellTextInTheMiddle(LTagCell):
    """
    Represent a L#~ cell. Big colspan!
    """

    def __init__(self, markdown):
        super().__init__(markdown, is_first_cell=False)

    def render(self, parent, row_type, node_name, column_count):
        cell = super().render(parent, row_type, node_name, column_count)
        cell.set('colspan', str(column_count))


class LTagPreProcessor(Preprocessor):
    """
    The only purpose of this class is to reset numbering
    """

    def run(self, lines):
        # Reset ltag processor
        _numbering.reset()
        return lines


class LTagProcessor(BlockProcessor):
    """
    The processor. Warning, each successive call to run will produce a table
    where numbering depends on previous table into the same markdown test
    but previously parsed. For instance :

        L#

        L#

        L#

    There is three identical blocks, but they are rendered differently
    """
    RE_TESTER = re.compile(r"(^|\n) {0,3}[LR]#")

    def test(self, parent, block):
        return bool(self.RE_TESTER.search(block))

    def run(self, parent, blocks):

        lines = self.isolate_block(parent, blocks)
        rows = self.compute(lines)

        # we need to get the column count of the table
        # for L#~ colspan
        column_count = max([row.column_count for row in rows])

        # and here is the rendering
        table = etree.SubElement(parent, 'table', {'class': 'ltag'})
        tbody = etree.SubElement(table, 'tbody')

        for row in rows:
            row.render(tbody, column_count)

    def isolate_block(self, parent, blocks):
        """
        Will extract lines that must be parsed as a L# block
        First lines without L# are sent back to parser
        """
        block = blocks.pop(0)
        m = self.RE_TESTER.search(block)

        before = block[:m.start()]  # Lines before L#
        # Send back lines before L#, they are not concerned
        self.parser.parseBlocks(parent, [before])

        result = block[m.start():].split('\n')

        return result

    def compute(self, lines):
        """
        Build as list of LTagRow classes.
        Handle the use cas where a new line is inserted into a call
        """
        rows = []
        for line in lines:

            if len(line) == 0:  # first row can be a single empty line
                pass
            elif self.test(None, line):
                rows.append(LTagRow(line))
            else:
                # if this line is not a LTag one, it means that it
                # must be attached to the precedent line
                rows[-1].append_markdown(line)

        # compute() functions will compute column counts
        for row in rows:
            row.compute()

        return rows


class C2CLTagExtension(Extension):
    """ Add tables to Markdown. """

    def extendMarkdown(self, md, md_globals):  # noqa
        """ Add an instance of TableProcessor to BlockParser. """
        if '|' not in md.ESCAPED_CHARS:
            md.ESCAPED_CHARS.append('|')

        md.preprocessors.add('ltag', LTagPreProcessor(), '_end')
        md.parser.blockprocessors.add('ltag',
                                      LTagProcessor(md.parser),
                                      '<hashheader')


_numbering = LTagNumbering()
