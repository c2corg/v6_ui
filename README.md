UI Application for camptocamp.org v6
====================================

Requirements
------------

 * Python 3.4 (3.5 seems OK as well)
 * Node (0.10.x or higher, there are known issues with 0.10.29)
 * Java (1.7 or higher)
 * gettext (0.18 or higher)
 * virtualenv (1.7 or higher)
 * Redis 2.8
 * GEOS (3.4 or higher)

On Debian/Ubuntu systems the required components may be installed using

    sudo apt-get install virtualenv python3-dev nodejs-legacy npm openjdk-7-jdk gettext libgeos-dev redis-server

Checkout
--------

    git clone https://github.com/c2corg/v6_ui.git

Build
-----

    cd v6_ui
    make -f config/{user} install

Run the application
-------------------

    make -f config/{user} serve

Open your browser at http://localhost:6543/ or http://localhost:6543/?debug (debug mode). Make sure you are
using the port that is set in `config/{user}`.

Available actions may be listed using:

    make help

Run the tests
--------------

    make -f config/{user} test
    
Or with the `check` target, which runs `flake8` and `test`:

    make -f config/{user} check

To run a specific test:

    .build/venv/bin/nosetests c2corg_ui/tests/views/test_summit.py

To see the debug output:

    .build/venv/bin/nosetests -s


Captcha
-------

Captcha configuration is done through https://www.google.com/recaptcha/admin .
The public key is used in the UI. The corresponding secret key is used in the API.


Developer Tips
--------------

The UI is mainly built using the following components:
* Pyramid (Python framework) http://docs.pylonsproject.org/en/latest/
* AngularJS (Javascript framework) https://angularjs.org/
* Maps:
 * OpenLayers 3 http://openlayers.org/
 * ngeo https://github.com/camptocamp/ngeo
