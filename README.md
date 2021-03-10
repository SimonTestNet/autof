# autof

Compile and run Angular tests affected by git changes.

## What it does

Using this module will make your `npm test` compile and execute only the tests affected by your git changes. If you have pending changes on a spec file, that file and its dependencies will be compiled. If you have pending changes on a component, its associated spec file will be compiled too.

If there are no pending changes then all tests are run.

## Why the name 'autof'

It's kind of like automatically using `fdescribe` on the tests relevant to your changes, but better because other test files aren't compiled.

## How to use it

`npm i -D autof`

On your `karma.config.js` file import autof and call it with the configuration:

```js
const autof = require("autof");

module.exports = function (config) {
  autof(config); // That's it.

  config.set({
    // ...
  });
};
```

Now you can run `npm test` and only the files relevant to your changes will be compiled.

## Configuration

The `autof` function receives two parameters, the karma configuration and an options object. The options object isn't necessary if using the Angular CLI.

```js
autof(config, options);
```

Options default values:

```js
autof(config, {
  limit: 50, // More modified files in git than this and all test will be run
  disabled: false, // Turn off autof
  silent: false, // Don't display to the console
  sourceRoot: "src", // Root folder of your application
  testFile: path.resolve(__dirname, "src/test.ts"), // Starting point for building the test bundle
  loader: path.resolve(__dirname, "node_modules/@ngtools/webpack/src/ivy/index.js"), // Webpack loader for the test file
  webpackConfig: config.buildWebpack.webpackConfig // Webpack configuration to use
});
```

## Running all tests

The option `disabled` is there so you can configure your environment to run all tests even when there are pending changes in git. To do it you can check for a parameter (`process.argv`) or with an environment variable (`process.env`). For example if you decide to go with a parameter called `--all` you could do the following:

```js
const autof = require("autof");
const runAllTests = process.argv.indexOf("--all") >= 0;

module.exports = function (config) {
  autof(config, {
    disabled: runAllTests
  });

  config.set({
    // ...
  });
};
```

# SimonTest

If you like this tool then check out [SimonTest](https://marketplace.visualstudio.com/items?itemName=SimonTest.simontest). It takes care of the most tedious part of testing components and services: stubbing dependencies. This extension analyzes your code and creates the necessary stubs, configures the TestBed, and it even generates basic tests.
