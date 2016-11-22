from c2corg_common.attributes import default_langs
from c2corg_ui.format import parse_code, sanitize


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


def is_collaborative(doc):
    type = doc['type']

    if type == 'r' or type == 'w' or type == 'a' or type == 'b':
        return True
    elif type == 'c':
        return doc['article_type'] == 'collab'
    elif type == 'i':
        return doc['image_type'] == 'collaborative'

    return False


def is_personal(doc):
    doctype = doc['type']

    if doctype == 'o' or doctype == 'u' or doctype == 'x':
        return True
    elif doctype == 'c':
        return doc['article_type'] == 'personal'
    elif doctype == 'i':
        return doc['image_type'] == 'personal'

    return False


def get_doc_type(type):
    if type == 'w':
        return 'waypoints'
    if type == 'r':
        return 'routes'
    if type == 'o':
        return 'outings'
    if type == 'u':
        return 'users'
    if type == 'c':
        return 'articles'
    if type == 'i':
        return 'images'
    if type == 'a':
        return 'areas'
    if type == 'b':
        return 'books'
    if type == 'x':
        return 'xreports'


def check_if_any_associations(doc):
    a = doc['associations']

    if a.get('xreports') or a.get('books') or a.get('routes') or \
       a.get('all_routes') or a.get('waypoints') or a.get('recent_outings') \
       or a.get('outings') or a.get('articles') or a.get('waypoints_children'):
            return True
