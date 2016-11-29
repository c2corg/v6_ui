SITE_PACKAGES = $(shell .build/venv/bin/python -c "import distutils; print(distutils.sysconfig.get_python_lib())" 2> /dev/null)
TEMPLATE_FILES_IN = $(filter-out ./.build/% ./node_modules/% ./v6_api/%, $(shell find . -type f -name '*.in'))
TEMPLATE_FILES = $(TEMPLATE_FILES_IN:.in=)
CLOSURE_LIBRARY_PATH = $(shell node -e 'process.stdout.write(require("closure-util").getLibraryPath())' 2> /dev/null)
CLOSURE_COMPILER_PATH = $(shell node -e 'process.stdout.write(require("closure-util").getCompilerPath())' 2> /dev/null)
OL_JS_FILES = $(shell find node_modules/openlayers/src/ol -type f -name '*.js' 2> /dev/null)
NGEO_JS_FILES = $(shell find node_modules/ngeo/src -type f -name '*.js' 2> /dev/null)
APP_JS_FILES = $(shell find c2corg_ui/static/js -type f -name '*.js')
APP_HTML_FILES = $(shell find c2corg_ui/templates -type f -name '*.html')
APP_PARTIAL_FILES = $(shell find c2corg_ui/static/partials -type f -name '*.html')
LESS_FILES = $(shell find less -type f -name '*.less')
LESS_PRINT_FILES = $(shell find less-print -type f -name '*.less')
LESS_DISCOURSE_FILES = $(shell find less-discourse -type f -name '*.less')

# i18n
L10N_LANGUAGES = ca de en es eu fr it
L10N_PO_FILES = $(addprefix .build/locale/,$(addsuffix /LC_MESSAGES/c2corg_ui-client.po, $(L10N_LANGUAGES)))
TOUCH_DATE = touch --date
STAT_LAST_MODIFIED = stat -c '%y'
ifeq (,$(wildcard $(HOME)/.transifexrc))
TOUCHBACK_TXRC = $(TOUCH_DATE) "$(shell date --iso-8601=seconds)" $(HOME)/.transifexrc
else
TOUCHBACK_TXRC = $(TOUCH_DATE) "$(shell $(STAT_LAST_MODIFIED) $(HOME)/.transifexrc)" $(HOME)/.transifexrc
endif

# JavaScript dependencies that are concatenated into a single file
LIBS_JS_FILES += \
    node_modules/jquery/dist/jquery.min.js \
    node_modules/bootstrap-slider/dist/bootstrap-slider.min.js \
    node_modules/angular/angular.min.js \
    node_modules/bootstrap/dist/js/bootstrap.min.js \
    c2corg_ui/static/lib/angular-bootstrap/ui-bootstrap-custom-1.3.2.min.js \
    c2corg_ui/static/lib/angular-bootstrap/ui-bootstrap-custom-tpls-1.3.2.min.js \
    node_modules/angular-gettext/dist/angular-gettext.min.js \
    node_modules/angular-debounce/angular-debounce.js \
    node_modules/angular-messages/angular-messages.min.js \
    node_modules/angular-cookies/angular-cookies.min.js \
    node_modules/typeahead.js/dist/typeahead.bundle.min.js \
    node_modules/moment/min/moment.min.js \
    node_modules/moment-timezone/builds/moment-timezone-with-data.min.js \
    node_modules/angular-moment/angular-moment.min.js \
    node_modules/slick-carousel/slick/slick.min.js \
    node_modules/angular-recaptcha/release/angular-recaptcha.min.js \
    node_modules/ng-file-upload/dist/ng-file-upload.min.js \
    node_modules/blueimp-load-image/js/load-image.all.min.js \
    node_modules/photoswipe/dist/photoswipe.min.js \
    node_modules/photoswipe/dist/photoswipe-ui-default.min.js \
    node_modules/angular-slug/angular-slug.js \
    node_modules/ng-infinite-scroll/build/ng-infinite-scroll.min.js \
    node_modules/slug/slug.js

# CSS files of dependencies that are concatenated into a single file
LIBS_CSS_FILES += \
    node_modules/bootstrap/dist/css/bootstrap.min.css \
    node_modules/bootstrap-slider/dist/css/bootstrap-slider.css \
    node_modules/slick-carousel/slick/slick.css \
    node_modules/photoswipe/dist/photoswipe.css \
    node_modules/photoswipe/dist/default-skin/default-skin.css \
    node_modules/slick-carousel/slick/slick-theme.css


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
	@echo "- serve			Run the development server"
	@echo "- template		Replace the config vars in the .in templates"
	@echo "- update-node-modules	Update node modules (using --force)"
	@echo "- upgrade		Upgrade the Python dependencies."
	@echo "- upgrade-dev		Upgrade the Python dev. dependencies."
	@echo "- less			Rebuild CSS files."
	@echo "- publish		Push docker image to dockerhub from travis-ci"
	@echo "- transifex-get		Retrieve the i18n files (POT/PO) from Transifex"
	@echo "- transifex-send	Push the new i18n strings to Transifex"
	@echo "- clear-cache		Reset the server cache container"
	@echo "- clear-cache-prod	Reset the server cache container in prod environment"
	@echo

.PHONY: check
check: flake8 lint build test

.PHONY: build
build: c2corg_ui/static/build/build.js less compile-catalog $(TEMPLATE_FILES) deps

.PHONY: clean
clean:
	rm -f .build/node_modules.timestamp
	rm -f .build/dev-requirements.timestamp
	rm -fr .build/locale
	rm -f $(TEMPLATE_FILES)
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
lint: .build/node_modules.timestamp .build/eslint.timestamp

.PHONY: install
install: build template .build/node_modules.timestamp

.PHONY: template
template: $(TEMPLATE_FILES)

.PHONY: less
less: c2corg_ui/static/build/build.min.css c2corg_ui/static/build/build.css c2corg_ui/static/build/build-print.min.css c2corg_ui/static/build/build-print.css c2corg_ui/static/build/build-discourse.min.css c2corg_ui/static/build/build-discourse.css c2corg_ui/static/build/bootstrap_fonts photoswipe-skins

.PHONY: serve
serve: install build development.ini
	.build/venv/bin/pserve development.ini --reload

.PHONY: update-node-modules
update-node-modules:
	npm install --force
	npm prune

.PHONY: upgrade
upgrade:
	.build/venv/bin/pip install --upgrade -r requirements.txt

.PHONY: upgrade-dev
upgrade-dev:
	.build/venv/bin/pip install --upgrade -r dev-requirements.txt

.PHONY: clear-cache
clear-cache: install development.ini
	.build/venv/bin/python c2corg_ui/scripts/redis-flushdb.py development.ini

.PHONY: clear-cache-prod
clear-cache-prod: install production.ini
	.build/venv/bin/python c2corg_ui/scripts/redis-flushdb.py production.ini

c2corg_ui/closure/%.py: $(CLOSURE_LIBRARY_PATH)/closure/bin/build/%.py
	cp $< $@

# i18n and Transifex tools

# if .transifexrc does not exist yet, create it for read only access (with fake user c2c)
$(HOME)/.transifexrc:
	echo "[https://www.transifex.com]" > $@
	echo "hostname = https://www.transifex.com" >> $@
	echo "username = c2c" >> $@
	echo "password = c2cc2c" >> $@
	echo "token =" >> $@

.build/locale/c2corg_ui-client.pot: .build/node_modules.timestamp $(APP_HTML_FILES) $(APP_PARTIAL_FILES) $(APP_JS_FILES)
	mkdir -p $(dir $@)
	node tools/extract-messages.js $^ > $@

.tx/config: $(HOME)/.transifexrc

.PHONY: transifex-get
transifex-get: $(L10N_PO_FILES) .build/locale/c2corg_ui-client.pot

.PHONY: transifex-send
transifex-send: .tx/config .build/locale/c2corg_ui-client.pot .build/venv/bin/tx
	.build/venv/bin/tx push --source

.PHONY: transifex-init
transifex-init: .tx/config .build/locale/c2corg_ui-client.pot .build/venv/bin/tx
	.build/venv/bin/tx push --source
	.build/venv/bin/tx push --translations --force --no-interactive

.build/locale/%/LC_MESSAGES/c2corg_ui-client.po: .tx/config .build/venv/bin/tx
	mkdir -p $(dir $@)
	.build/venv/bin/tx pull -l $* --force
	test -s $@
	$(TOUCHBACK_TXRC)

c2corg_ui/static/build/locale/%/c2corg_ui.json: .build/locale/%/LC_MESSAGES/c2corg_ui-client.po
	mkdir -p $(dir $@)
	node tools/compile-catalog $< > $@
	test -s $@

# End of i18n and Transifex tools

c2corg_ui/static/build/build.js: build.json c2corg_ui/static/build/templatecache.js $(OL_JS_FILES) $(NGEO_JS_FILES) $(APP_JS_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/closure-util build $< $@

c2corg_ui/static/build/build.min.css: $(LESS_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc --clean-css less/c2corg_ui.less > $@

c2corg_ui/static/build/build.css: $(LESS_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc less/c2corg_ui.less > $@

c2corg_ui/static/build/build-print.min.css: $(LESS_PRINT_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc --clean-css less-print/c2corg_ui.less > $@

c2corg_ui/static/build/build-print.css: $(LESS_PRINT_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc less-print/c2corg_ui.less > $@

c2corg_ui/static/build/build-discourse.min.css: $(LESS_DISCOURSE_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc --clean-css less-discourse/discourse.less > $@

c2corg_ui/static/build/build-discourse.css: $(LESS_DISCOURSE_FILES) .build/node_modules.timestamp
	mkdir -p $(dir $@)
	./node_modules/.bin/lessc less-discourse/discourse.less > $@

c2corg_ui/static/build/templatecache.js: c2corg_ui/templates/templatecache.js .build/venv/bin/mako-render $(APP_PARTIAL_FILES)
	mkdir -p $(dir $@)
	.build/venv/bin/mako-render --var "partials=$(APP_PARTIAL_FILES)" $< > $@

.build/node_modules.timestamp: package.json
	mkdir -p $(dir $@)
	npm install
	touch $@

.build/eslint.timestamp: $(APP_JS_FILES)
	./node_modules/.bin/eslint $?
	touch $@

.build/venv/bin/flake8: .build/dev-requirements.timestamp

.build/venv/bin/nosetests: .build/dev-requirements.timestamp

.build/venv/bin/mako-render: .build/requirements.timestamp

.build/venv/bin/tx: .build/requirements.timestamp

.build/dev-requirements.timestamp: .build/venv/bin/pip dev-requirements.txt
	.build/venv/bin/pip install -r dev-requirements.txt
	touch $@

.build/venv/bin/pip:
	mkdir -p $(dir .build/venv)
	virtualenv --no-site-packages -p python3 .build/venv

.build/requirements.timestamp: requirements.txt setup.py .build/venv/bin/pip
	.build/venv/bin/pip install -r requirements.txt
	touch $@

development.ini production.ini: common.ini

apache/app-c2corg_ui.wsgi: production.ini

apache/wsgi.conf: apache/app-c2corg_ui.wsgi

.PHONY: $(TEMPLATE_FILES)
$(TEMPLATE_FILES): %: %.in
	scripts/env_replace < $< > $@
	chmod --reference $< $@
	sed -i 's|__CLOSURE_LIBRARY_PATH__|$(CLOSURE_LIBRARY_PATH)|g' $@

.PHONY: publish
publish: template
	scripts/travis-build.sh
	scripts/travis-publish.sh

deps: c2corg_ui/static/build/deps.js c2corg_ui/static/build/deps.css

# concatenate all JS dependencies into one file
c2corg_ui/static/build/deps.js: $(LIBS_JS_FILES) c2corg_ui/static/build/locale_moment slick-assets
	@echo "Creating deps.js"
	awk 'FNR==1{print ";\n"}1' $(LIBS_JS_FILES) > $@

# copy locales of moment.js
c2corg_ui/static/build/locale_moment: .build/node_modules.timestamp
	cp -r node_modules/moment/locale/ c2corg_ui/static/build/locale_moment

# copy skins of photoswipe.js
photoswipe-skins: .build/node_modules.timestamp
	cp node_modules/photoswipe/dist/default-skin/default-skin.png c2corg_ui/static/build/default-skin.png
	cp node_modules/photoswipe/dist/default-skin/default-skin.svg c2corg_ui/static/build/default-skin.svg

# copy files used by "slick-carousel" (?!)
slick-assets: .build/node_modules.timestamp
	cp node_modules/slick-carousel/slick/ajax-loader.gif c2corg_ui/static/build/ajax-loader.gif
	cp -r node_modules/slick-carousel/slick/fonts c2corg_ui/static/build/fonts

# concatenate all CSS dependencies into one file
c2corg_ui/static/build/deps.css: $(LIBS_CSS_FILES)
	@echo "Creating deps.css"
	awk 'FNR==1{print "\n"}1' $(LIBS_CSS_FILES) > $@

# copy bootstrap fonts
c2corg_ui/static/build/bootstrap_fonts: .build/node_modules.timestamp
	cp -r node_modules/bootstrap/fonts/ c2corg_ui/static/build/bootstrap_fonts
