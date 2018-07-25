import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, 'README.md')) as f:
    README = f.read()
with open(os.path.join(here, 'CHANGES.txt')) as f:
    CHANGES = f.read()

setup(name='c2corg_ui',
      version='0.0',
      description='c2corg_ui',
      long_description=README + '\n\n' + CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='',
      author_email='',
      url='',
      keywords='web pyramid pylon',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=[],
      tests_require=[],
      test_suite="c2corg_ui",
      entry_points="""\
      [paste.app_factory]
      main = c2corg_ui:main
      """,
      )
