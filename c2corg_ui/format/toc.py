"""
Table of Contents Extension for Python-Markdown
===============================================

See <https://pythonhosted.org/Markdown/extensions/toc.html>
for documentation.

Oringinal code Copyright 2008 [Jack Miller](http://codezen.org)

All changes Copyright 2008-2014 The Python Markdown Project

License: [BSD](http://www.opensource.org/licenses/bsd-license.php)

Modified for C2C : remove title emphasis, and only include <4 levels
"""

from markdown.extensions.toc import (TocExtension, TocTreeprocessor,
                                     string_type, stashedHTML2text,
                                     unique, nest_toc_tokens)


class C2CTocTreeprocessor(TocTreeprocessor):
    def run(self, doc):

        def not_emphasis(elt):
            return elt.attrib.get("class") != "header-emphasis"

        # Get a list of id attributes
        used_ids = set()
        for el in doc.iter():
            if "id" in el.attrib:
                used_ids.add(el.attrib["id"])

        toc_tokens = []
        for el in doc.iter():
            if isinstance(el.tag, string_type) and \
                    self.header_rgx.match(el.tag):
                self.set_level(el)

                # modification for camptocamp
                # orginal line was :
                # text = ''.join(el.itertext()).strip()

                text = ''.join([elt.text for elt in el.iter()
                                if not_emphasis(elt)])

                # Do not override pre-existing ids
                if "id" not in el.attrib:
                    innertext = stashedHTML2text(text, self.markdown)
                    el.attrib["id"] = unique(self.slugify(innertext, self.sep),
                                             used_ids)

                level = int(el.tag[-1])
                if level < 5:  # test for camptocamp
                    toc_tokens.append({
                        'level': level,
                        'id': el.attrib["id"],
                        'name': text
                    })

                if self.use_anchors:
                    self.add_anchor(el, el.attrib["id"])
                if self.use_permalinks:
                    self.add_permalink(el, el.attrib["id"])

        div = self.build_toc_div(nest_toc_tokens(toc_tokens))
        if self.marker:
            self.replace_marker(doc, div)

        # serialize and attach to markdown instance.
        toc = self.markdown.serializer(div)
        for pp in self.markdown.postprocessors.values():
            toc = pp.run(toc)
        self.markdown.toc = toc


class C2CTocExtension(TocExtension):
    TreeProcessorClass = C2CTocTreeprocessor


def makeExtension(*args, **kwargs):  # noqa
    return C2CTocExtension(*args, **kwargs)
