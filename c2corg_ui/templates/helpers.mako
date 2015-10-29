<%def name="get_attr(obj, key)">\
${obj[key] if obj and key in obj and obj[key] is not None else ''}\
</%def>
