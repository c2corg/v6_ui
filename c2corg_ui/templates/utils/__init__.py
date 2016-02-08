from c2corg_common.attributes import default_langs
from c2corg_ui.templates.utils.format import parse_code, sanitize


def get_lang_lists(document, lang):
    if 'available_langs' in document:
        available_langs = document['available_langs']
        other_langs = [l for l in available_langs if l != lang]
        missing_langs = list(
          set(default_langs) - set(available_langs)
        )
    else:
        other_langs = None
        missing_langs = list(set(default_langs) - set(lang))
    missing_langs.reverse()
    return other_langs, missing_langs


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
