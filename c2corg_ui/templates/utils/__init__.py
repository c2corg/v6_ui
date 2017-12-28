from c2corg_common.attributes import default_langs
from c2corg_ui.format import parse_code


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


def get_title(locale):
    title = ''
    if 'title_prefix' in locale and locale['title_prefix']:
        title = locale['title_prefix'] + ' : '
    title += locale['title']
    return title


def get_attr(obj, key, parse):
    """Get attribute from passed object if exists.
    md and bb are optional params that may be used to finetune
    the text formating.
    """
    attr = obj[key] if key in obj else None
    if attr and isinstance(attr, str):
        attr = parse_code(attr) if parse else attr
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


def has_associations(doc):
    a = doc['associations']

    return a.get('waypoints') or a.get('waypoints_children') or \
        a.get('all_routes') or a.get('routes') or \
        a.get('recent_outings') or a.get('outings') or \
        a.get('articles') or a.get('xreports') or a.get('books')


def get_route_gear_articles(route):
    articles = []
    activities = route.get('activities')
    if activities:
        if 'snowshoeing' in activities or 'skitouring' in activities:
            articles.append(('183333', 'skitouring gear'))
        if 'snow_ice_mixed' in activities and \
                route.get('global_rating') in ['F', 'F+', 'PD-', 'PD', 'PD+']:
            articles.append(('185750', 'easy snow ice mixed gear'))
        if 'mountain_climbing' in activities and \
            route.get('global_rating') in [
                    'F',
                    'F+',
                    'PD-',
                    'PD',
                    'PD+',
                    'AD-',
                    'AD'
                ]:
            articles.append(('185384', 'easy mountain climbing gear'))
        if 'rock_climbing' in activities:
            if route.get('equipment_rating') in ['P1', 'P1+']:
                articles.append(('183332', 'bolted rock climbing gear'))
            elif 'mountain_climbing' not in activities and \
                route.get('global_rating') in [
                        'F',
                        'F+',
                        'PD-',
                        'PD',
                        'PD+',
                        'AD-',
                        'AD'
                    ] and \
                route.get('equipment_rating') in [
                        'P2',
                        'P2+',
                        'P3',
                        'P3+',
                        'P4'
                    ]:
                articles.append(('185384', 'easy mountain climbing gear'))
        if 'ice_climbing' in activities:
            articles.append(('194479', 'ice and dry climbing gear'))
        if 'hiking' in activities:
            articles.append(('185207', 'hiking gear'))
        if any(activity in activities for activity in [
            'mountain_climbing',
            'skitouring',
            'snow_ice_mixed',
            'snowshoeing'
        ]) and \
                route.get('glacier_gear') and \
                route.get('glacier_gear') != 'no':
            # we should use an anchor for glacier gear, but it's not possible
            articles.append(('185750', 'easy snow ice mixed gear'))
    return dict(articles)


def format_length(length_in_m):
    if length_in_m < 1000:
        length = length_in_m
        unit = 'm'
    else:
        length = length_in_m / 1000
        unit = 'km'

    return '{}&nbsp;{}'.format(length, unit)
