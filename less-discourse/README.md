
# Menu on the Discourse Forum

If you make any changes to the `c2corg_ui/templates/sidemenu.html` or `less/sidemenu.less`, make sure you update the Discourse's menu too.

The HTML changes will have to be adapted manually.

The less file (`less/sidemenu.less`) was written to suit both the UI and Discourse, even though we won't use the exact same lines in both cases, but the code stays mostly the same.

The files in Discourse should be changed under **the hamburger button** -> **admin** -> **customize (personnaliser)** -> **CSS/HTML** -> and choose from the left list **discourse menu** or create a new style.


## LESS -> CSS
In order to compile the usual sidemenu.less file into pure CSS, use the command:

`make less`

Now open `c2corg_ui/static/build/build-discourse.css` (or `build-discourse.min.css`) and copy the content of the file into the **CSS** tab.

## HTML
HTML should be added into the **Header (en-tete)**. A few lines of Javascript code take care of hiding/showing the appropriate locale and of creating the links in the menu.

## Translations
If you add any new translations or menu entries, the system that translates the locales on Discourse is 'home-made' because the UI translation system is not available in the forum. Simply add a `<span class="lang {lang-abbreviation} menu-text">Text</span>` where needed.

## Links
The `<a>` links also work differently: `<a href="#" url="routes" class="menu-link">` where `url` is the the endpoint of a link. The base-url is defined in the JS below the HTML and should be changed accordingly (if demo, if production...).

