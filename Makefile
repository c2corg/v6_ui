SITE_PACKAGES = $(shell .build/venv/bin/python -c "import distutils; print(distutils.sysconfig.get_python_lib())" 2> /dev/null)
TEMPLATE_FILES_IN = $(filter-out ./.build/%, $(shell find . -type f -name '*.in'))
TEMPLATE_FILES = $(TEMPLATE_FILES_IN:.in=)
CONFIG_MAKEFILE = $(shell find config -type f)
CLOSURE_UTIL_PATH := openlayers/node_modules/closure-util
CLOSURE_LIBRARY_PATH = $(shell node -e 'process.stdout.write(require("$(CLOSURE_UTIL_PATH)").getLibraryPath())' 2> /dev/null)
CLOSURE_COMPILER_PATH = $(shell node -e 'process.stdout.write(require("$(CLOSURE_UTIL_PATH)").getCompilerPath())' 2> /dev/null)
OL_JS_FILES = $(shell find node_modules/openlayers/src/ol -type f -name '*.js' 2> /dev/null)
NGEO_JS_FILES = $(shell find node_modules/ngeo/src -type f -name '*.js' 2> /dev/null)
APP_JS_FILES = $(shell find c2corg_ui/static/js -type f -name '*.js')
APP_HTML_FILES = $(shell find c2corg_ui/templates -type f -name '*.html')
APP_PARTIAL_FILES = $(shell find c2corg_ui/static/partials -type f -name '*.html')
LESS_FILES = $(shell find less -type f -name '*.less')

EXTERNS_ANGULAR = .build/externs/angular-1.4.js
EXTERNS_ANGULAR_Q = .build/externs/angular-1.4-q_templated.js
EXTERNS_ANGULAR_HTTP_PROMISE = .build/externs/angular-1.4-http-promise_templated.js
EXTERNS_FILES = $(EXTERNS_ANGULAR) $(EXTERNS_ANGULAR_Q) $(EXTERNS_ANGULAR_HTTP_PROMISE)

# variables used in config files (*.in)
export base_dir = $(abspath .)
export site_packages = $(SITE_PACKAGES)

include config/default

.PHONY: help
help:
	@echo "Usage: make <target>"
	@echo
	@echo "Main targets:"
	@echo
	@echo "- check			Perform a number of checks on the code (runs flake 8 and test)"
	@echo "- test			Run the unit tests"
	@echo "- clean			Remove generated files"
	@echo "- cleanall		Remove all the build artefacts"
	@echo "- compile-catalog	Compile the translation catalog"
	@echo "- flake8		Run flake8 checker on the Python code"
	@echo "- lint			Check the JavaScript code with linters"
	@echo "- build			Build the project"
	@echo "- install		Install and build the project"
	@echo "- serve			Run the development server (pserve)"
	@echo "- template		Replace the config vars in the .in templates"
	@echo "- update-node-modules	Update node modules (using --force)"
	@echo "- upgrade		Upgrade the Python dependencies."
	@echo "- upgrade-dev		Upgrade the Python dev. dependencies."
	@echo "- less			Rebuild CSS files."
	@echo

.PHONY: check
check: flake8 lint build test

.PHONY: build
build: c2corg_ui/static/build/build.js less compile-catalog

.PHONY: clean
clean:
	rm -f .build/node_modules.timestamp
	rm -f .build/dev-requirements.timestamp
	rm -f $(TEMPLATE_FILES)
	rm -f c2corg_ui/locale/*.pot
	rm -rf c2corg_ui/static/build

.PHONY: cleanall
cleanall: clean
	rm -rf .build
	rm -rf node_modules

.PHONY: compile-catalog
compile-catalog: c2corg_ui/static/build/locale/fr/c2corg_ui.json c2corg_ui/static/build/locale/de/c2corg_ui.json c2corg_ui/static/build/locale/it/c2corg_ui.json c2corg_ui/static/build/locale/en/c2corg_ui.json c2corg_ui/static/build/locale/es/c2corg_ui.json c2corg_ui/static/build/locale/eu/c2corg_ui.json c2corg_ui/static/build/locale/ca/c2corg_ui.json

.PHONY: test
test: .build/venv/bin/nosetests
	.build/venv/bin/nosetests

.PHONY: flake8
flake8: .build/venv/bin/flake8
	.build/venv/bin/flake8 c2corg_ui

.PHONY: lint
lint: .build/venv/bin/gjslint .build/node_modules.timestamp .build/gjslint.timestamp .build/jshint.timestamp

.PHONY: install
install: build install-dev-egg template .build/node_modules.timestamp

.PHONY: template
template: $(TEMPLATE_FILES)

.PHONY: less
less: c2corg_ui/static/build/build.min.css c2corg_ui/static/build/build.css

.PHONY: install-dev-egg
install-dev-egg: $(SITE_PACKAGES)/c2corg_ui.egg-link

.PHONY: serve
serve: install build development.ini
	.build/venv/bin/pserve --reload development.ini

.PHONY: update-node-modules
update-node-modules:
	npm install --force

.PHONY: upgrade
upgrade:
	.build/venv/bin/pip install --upgrade -r requirements.txt

.PHONY: upgrade-dev
upgrade-dev:
	.build/venv/bin/pip install --upgrade -r dev-requirements.txt

c2corg_ui/closure/%.py: $(CLOSURE_LIBRARY_PATH)/closure/bin/build/%.py
	cp $< $@

c2corg_ui/locale/c2corg_ui-client.pot: $(APP_HTML_FILES) $(APP_PARTIAL_FILES)
	node tools/extract-messages.js $^ > $@

c2corg_ui/locale/%/LC_MESSAGES/c2corg_ui-client.po: c2corg_ui/locale/c2corg_ui-client.pot
	msgmerge --update $@ $<

c2corg_ui/static/build/build.js: build.json c2corg_ui/static/build/templatecache.js $(OL_JS_FILES) $(NGEO_JS_FILES) $(APP_JS_FILES) $(EXTERNS_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/openlayers/node_modules/.bin/closure-util build $< $@

c2corg_ui/static/build/build.min.css: $(LESS_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc --clean-css less/c2corg_ui.less > $@

c2corg_ui/static/build/build.css: $(LESS_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc less/c2corg_ui.less > $@

c2corg_ui/static/build/locale/%/c2corg_ui.json: c2corg_ui/locale/%/LC_MESSAGES/c2corg_ui-client.po
	mkdir -p $(dir $@)
	node tools/compile-catalog $< > $@

c2corg_ui/static/build/templatecache.js: c2corg_ui/templates/templatecache.js .build/venv/bin/mako-render $(APP_PARTIAL_FILES)
	mkdir -p $(dir $@)
	.build/venv/bin/mako-render --var "partials=$(APP_PARTIAL_FILES)" $< > $@

$(EXTERNS_ANGULAR):
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.4.js
	touch $@

$(EXTERNS_ANGULAR_Q):
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.4-q_templated.js
	touch $@

$(EXTERNS_ANGULAR_HTTP_PROMISE):
	mkdir -p $(dir $@)
	wget -O $@ https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/angular-1.4-http-promise_templated.js
	touch $@

.build/node_modules.timestamp: package.json
	mkdir -p $(dir $@)
	npm install
	touch $@

.build/gjslint.timestamp: $(APP_JS_FILES)
	.build/venv/bin/gjslint --jslint_error=all --strict --custom_jsdoc_tags=event,fires,function,classdesc,api,observable,example,ngdoc,ngname $?
	touch $@

.build/jshint.timestamp: $(APP_JS_FILES)
	./node_modules/.bin/jshint --verbose $?
	touch $@

.build/venv/bin/gjslint: .build/dev-requirements.timestamp

.build/venv/bin/flake8: .build/dev-requirements.timestamp

.build/venv/bin/nosetests: .build/dev-requirements.timestamp

.build/venv/bin/mako-render: $(SITE_PACKAGES)/c2corg_ui.egg-link

.build/dev-requirements.timestamp: .build/venv dev-requirements.txt
	.build/venv/bin/pip install -r dev-requirements.txt
	touch $@

.build/venv:
	mkdir -p $(dir $@)
	virtualenv --no-site-packages -p python3 $@

$(SITE_PACKAGES)/c2corg_ui.egg-link: .build/venv requirements.txt setup.py
	.build/venv/bin/pip install -r requirements.txt

development.ini production.ini: common.ini

apache/app-c2corg_ui.wsgi: production.ini

apache/wsgi.conf: apache/app-c2corg_ui.wsgi

%: %.in $(CONFIG_MAKEFILE)
	scripts/env_replace < $< > $@
	chmod --reference $< $@
	sed -i 's|__CLOSURE_LIBRARY_PATH__|$(CLOSURE_LIBRARY_PATH)|g' $@
