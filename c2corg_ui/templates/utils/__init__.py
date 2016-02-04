from c2corg_common.attributes import default_cultures
from c2corg_ui.templates.utils.format import parse_code, sanitize


def get_culture_lists(document, culture):
    if 'available_cultures' in document:
        available_cultures = document['available_cultures']
        other_cultures = [l for l in available_cultures if l != culture]
        missing_cultures = list(
          set(default_cultures) - set(available_cultures)
        )
    else:
        other_cultures = None
        missing_cultures = list(set(default_cultures) - set(culture))
    missing_cultures.reverse()
    return other_cultures, missing_cultures


def get_attr(obj, key, md=True, bb=True):
    """Get attribute from passed object if exists.
    md and bb are optional params that may be used to finetune
    the text formating.
    """
    attr = obj[key] if key in obj else None
    if attr and isinstance(attr, str):
        attr = sanitize(attr)
        attr = parse_code(attr, md, bb) if md or bb else attr
    return attr
