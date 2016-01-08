from c2corg_common.attributes import default_cultures


def get_culture_lists(document, culture):
    if 'available_cultures' in document:
        available_cultures = document['available_cultures']
        other_cultures = filter(lambda l: l != culture, available_cultures)
        missing_cultures = list(
          set(default_cultures) - set(available_cultures)
        )
    else:
        other_cultures = None
        missing_cultures = list(set(default_cultures) - set(culture))
    missing_cultures.reverse()
    return other_cultures, missing_cultures
