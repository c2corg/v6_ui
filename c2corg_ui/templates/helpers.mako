<%def name="get_attr(obj, key)">\
${obj[key] if obj and key in obj and obj[key] is not None else ''}\
</%def>

<%!
from slugify import Slugify
custom_slugify = Slugify(to_lower=True)
%>

<%def name="slugify(str)">\
${custom_slugify(str)}\
</%def>
