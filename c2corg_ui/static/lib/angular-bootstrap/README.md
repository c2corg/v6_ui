1) go to https://angular-ui.github.io/bootstrap/ and click on "create a custom build"

2) select the necessary modules, in our case those are : 
	- datepicker
	- dateparser
	- datepicker popup
	- modal
	- dropdown
	- popover
	- tabs
	- tooltip
	- rating

3) extract files to v6_ui/c2corg_ui/static/lib/angular-bootstrap (current directory)

4) update the scripts in base.html

	not debug :

    `<script src="${request.static_url('c2corg_ui:static/lib/angular-bootstrap/ui-bootstrap-custom-1.3.1.min.js')}"></script>`
    `<script src="${request.static_url('c2corg_ui:static/lib/angular-bootstrap/ui-bootstrap-custom-tpls-1.3.1.min.js')}"></script>`

	debug:
    `<script src="${request.static_url('c2corg_ui:static/lib/angular-bootstrap/ui-bootstrap-custom-1.3.1.js')}"></script>`
    `<script src="${request.static_url('c2corg_ui:static/lib/angular-bootstrap/ui-bootstrap-custom-tpls-1.3.1.js')}"></script>`
