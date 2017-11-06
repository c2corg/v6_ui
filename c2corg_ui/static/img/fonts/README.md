# Creating font from SVG files

You can use an online tool such as Icomoon - https://icomoon.io/app/#/select

1) left top menu -> create empty set
2) drag & drop the SVG icons onto the empty set
3) select the desired icons. You click and hold to select them all.
4) right bottom click on "generate font" 
5) click download
6) the zipped file will contain the style.css file as well as fonts folder
7) put the contents of fonts folder into static/img/fonts and give them a special name (for example "heavy_metal")
8) copy style.css to the less folder and update it renaming 

```src:  url('fonts/icomoon.eot?56tqll');
  src:  url('fonts/icomoon.eot?56tqll#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?56tqll') format('truetype'),
    url('fonts/icomoon.woff?56tqll') format('woff'),
    url('fonts/icomoon.svg?56tqll#icomoon') format('svg');
```

to

```src:  url('fonts/heavy_metal.eot?56tqll');
  src:  url('fonts/heavy_metal.eot?56tqll#iefix') format('embedded-opentype'),
    url('fonts/heavy_metal.ttf?56tqll') format('truetype'),
    url('fonts/heavy_metal.woff?56tqll') format('woff'),
    url('fonts/heavy_metal.svg?56tqll#icomoon') format('svg');
```


9) @import 'heavymetal.less'; in c2corg_ui.less

**beware when updating your CSS: the classes before:'content' generated code (e902, e903...) will
always be the same, so make sure you don't have duplicates elsewhere because it will try
to load 2 icons for the same content.**
