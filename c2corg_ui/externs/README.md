This directory contains externs for the closure compiler.
They allow to add type information and prevent renaming of object properties.

Application externs are stored in appx.js.
External libraries externs are stored in the other files.

We maintain some of the externs but others are taken from an upstream,
which is the case for Angular externs. These upstream externs should be
taken as-is from upstream and never modified locally.

These externs are referenced from the build.json file.

Updating Angular externs:
- get the commit hash you want from https://github.com/google/closure-compiler/commits/master/contrib/externs;
- Run the following script;
```
HASH="04bdb72"
for f in angular-1.4.js angular-1.4-q_templated.js angular-1.4-http-promise_templated.js
do
  wget -O $f https://raw.githubusercontent.com/google/closure-compiler/$HASH/contrib/externs/$f
done
```
- Create a PR and mention the hash you used in the comment.
