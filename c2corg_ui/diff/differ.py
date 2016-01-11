from difflib import HtmlDiff
import re

TABLE_CLEANUP_REGEX = re.compile('<td class="diff_next"[^>]*?>.*?<\/td>')


def diff_text(text1, text2):
    """Generates a HTML diff table.
    """
    text1 = text1 if text1 is not None else ''
    text2 = text2 if text2 is not None else ''

    if text1 == text2:
        return None

    lines1 = text1.split('\n')
    lines2 = text2.split('\n')

    # create a diff table with 3 lines of context
    table = HtmlDiff().make_table(lines1, lines2, context=True, numlines=3)

    # clean the table a bit (remove unneeded columns, fix styling, etc.)
    table = table. \
        replace('&nbsp;', ' '). \
        replace(' nowrap="nowrap"', ''). \
        replace('rules="groups"', ''). \
        replace(
            '<colgroup></colgroup> <colgroup></colgroup> ' +
            '<colgroup></colgroup>', '<colgroup></colgroup> <colgroup>')
    table = TABLE_CLEANUP_REGEX.sub('', table)

    return table


def diff_documents(doc1, doc2):
    """Return a list of fields with a HTML diff table for the fields
    that are different between `doc1` and `doc2`.
    """
    return _get_field_diffs(doc1, doc2)


def _get_field_diffs(obj1, obj2):
    field_diffs = []
    for field in obj1:
        if field in ['version', 'document_id', 'available_cultures']:
            # skip these fields
            continue

        val1 = obj1.get(field)
        val2 = obj2.get(field)

        if field == 'locales':
            locale1 = val1[0]
            locale2 = val2[0]
            field_diffs += _get_field_diffs(locale1, locale2)
        elif field == 'geometry':
            if val1.get('version') != val2.get('version') and not (
                    val1.get('geom') is None and val2.get('geom') is None):
                field_diffs.append(FieldDiff('geometry', ''))
        else:
            val1 = _stringify(val1)
            val2 = _stringify(val2)

            html_diff = diff_text(val1, val2)
            if html_diff is not None:
                field_diffs.append(FieldDiff(field, html_diff))
    return field_diffs


def _stringify(val):
    """Turns a value into a string.
    """
    if val is None:
        return None
    elif type(val) is list:
        return ', '.join([_stringify(e) for e in val])
    elif isinstance(val, str):
        return val
    else:
        return str(val)


class FieldDiff(object):
    """A class containing a HTML diff table for a field.
    """

    def __init__(self, field, html_diff):
        self.field = field
        self.html_diff = html_diff

    def __str__(self):
        return self.field
