# Steps to create a karma-jasmine-typescript-jspm stack

Building a testing stack can be hard if you are not familiar
with the ins and outs of the technologies involved. I had stepped
into a project that used typescript, jspm, and karma, and something
was broken and I had to figure out how things worked. Although
I knew Typescript, I didn't know how it worked in the context of a
karma testing, and as it turns out, it relies on browser transpilation
rather than building and bundling on the server rather than shipping
built/bundled js files.

Here are my notes, as well as detailed steps that you might
find helpful if you wish to set one up in the future.

Note:

there is a known issue with sourcemaps when using the production workflow. See https://github.com/jspm/jspm-cli/issues/1642. This is pretty much a showstopper
for most teams.

# Quick start

    git clone https://github.com/teyc/karma-typescript-jspm.git
    npm install -g jspm
    jspm install
    karma start

At this point you should be able to apply changes to calculator.ts
and calculatorSpec.ts and see that the test runner continuously
running on the command line.



# Overview in a picture

Although each component in the stack performs a specific function, the configuration
files for each component tend to leak into one another. For example Karma needs to know
about the jspm system, and the jspm system needs to know how to configure Typescript. Then,
`SystemJS` has to understand that Karma serves all the files from a virtual
directory called `/base`. It gets confusing very quickly!

    +----------------------+
    | Chrome               |
    |  +--------------+    |
    |  | Karma        |    |   (we provide karma with a list of js modules               )
    |  |  karma-jspm --- + |   (karma calls karma-jspm, which  loads them using SystemJS )
    |  |  karma-jasmine  | |   (and executes test in the browser using karma-jasmine     )
    |  +--------------+  | |
    |    |               | |
    +----|---------------|-+
         |               |
         |               v
         |         config.js (karma-jspm loads `config.js` and uses that     )
         |               |   (to load the other modules asynchronously with  )
         |               |   (the SystemJS loader API                        )
         |               |   (SystemJS loader needs to know when running     )
         |               |   (with karma, all files are served under /base   )
         |               |
         |               v   (config.js specifies `typescript` as the transpiler )
         |   typescript.js   (this is carried out in the browser on any .ts files)
         |
         v
     karma.conf.js (lists the files that need to be loaded and executed, in our case
                    Typescript files. In our case, files are not loaded by the standard
                    karma loader, but relies on the SystemJS loader. Hence, the `files`
                    section is empty, and its contents moved to `karma.conf.js` where
                    in the `{ jspm { loadFiles: ... } }` configuration                  )


# Production workflow

Generating the production packages looks like this:

    jspm bundle src/calculator dist/bundle.js

You can preview the results on http://localhost:8080/ if you have
`http-server` installed.

    npm install -g http-server
    http-server

Note: there is a known issue with sourcemaps. https://github.com/jspm/jspm-cli/issues/1642
      this is pretty much a show stopper for most teams.

Terminology
======================

jspm
--------

`jspm` is used to download all the required libraries, and it generates a
manifest file `config.js` that is required by SystemJS. The manifest
file ties module names with the location of the module.

e.g. map `jasmine` module to `jspm_packages\npm\jasmine@2.5.3\`

    System.config({
        map: {
            ...
            "jasmine": "npm:jasmine@2.5.3",
            ...
        }
    })

This `config.js` is used by SystemJS module loader to load javascript
modules in the correct order.

karma
---------

karma is a browser-based test runner. Although I find browser based javascript
testing to be a bit silly compared to how straightforward testing on a command-line
can be, it has some value especially if you want to know how your code is going to
behave with different javascript engines, especially older versions of internet explorer.

karma will load all the files listed in the karma.conf.js. If these are test files,
then they will get executed as they are loaded.

In our specific stack, we leave the `files` section blank, because we cannot load
modules serially in the browser. Instead we defer module-loading to the `SystemJS` loader,
which loads modules asynchronously.

Implementation-wise, we use a karma plugin called `karma-jspm`. It hooks into karma's
runtime, and given a list of module files, it calls SystemJS module loader APIs to load
them into the browser.

jasmine
-------------

jasmine is a test framework, and it similar to `NUnit`.

typescript
---------------

Typescript is a strongly typed language that transpiles into javascript.

# How to set up this stack from scratch

In a new directory,

1. jspm install npm:karma npm:karma-chrome-launcher npm:karma-jasmine npm:jasmine -d

2. karma init (specify the chrome launcher)

3. jspm install -d npm:karma-jspm

4. update `karma.conf.js` and `config.js`

   In `config.js` change

        System.config({
            baseURL: "",

   to

        System.config({
            baseURL: "base",

   this causes the test files like `/test/calculator.ts`
   to be loaded from `/base/test/calculator.ts`, as
   karma maps `/base` to the document root.

5. With `karma.conf.js` you have to add a `jspm` section,
   and add `jspm` as the first element in the list of frameworks,
   so that it looks like this:

        frameworks: ['jspm', 'jasmine'],

Troubleshooting notes
---------------------

The `Debug` button is somewhat useful, as it renders in a single window
what would otherwise be rendered in an IFRAME. You can then try to make
sense of what it is doing.

Unfortunately, the `karma-jspm` plugin does not generate the standard
SystemJS loader that we usually see in the browser. i.e.

    <script src=jspm_packages/system.js
    <script src=config.js
    <script
    SystemJS.load('foo', 'bar', 'baz', (foo, bar, baz) => {
        //... use foo, bar, baz
    })
    </script

It would take time to tweak the various parameters to make things
work. Hence this repository.

