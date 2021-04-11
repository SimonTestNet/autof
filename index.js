const path = require("path");
const fs = require("fs");

function autof(config, options = {}) {
  if (!(options.sourceRoot || options.testFile)) {
    const angularJsonFile = path.resolve(__dirname, "..", "..", "angular.json");
    if (fs.existsSync(angularJsonFile)) {
      const angularJson = JSON.parse(fs.readFileSync(angularJsonFile));
      const project = Object.keys(angularJson.projects).find(
        project => angularJson.projects[project].sourceRoot
      );
      if (!options.sourceRoot) {
        options.sourceRoot = angularJson.projects[project].sourceRoot;
      }
      if (!options.testFile) {
        const angularTestFile = angularJson.projects[project].architect.test.options.main;
        options.testFile = path.resolve(__dirname, "..", "..", angularTestFile);
      }
    }
  }

  if (!options.sourceRoot) {
    options.sourceRoot = "src";
  }

  if (!options.testFile) {
    options.testFile = path.resolve(__dirname, "..", "..", "src", "test.ts");
  }

  if (!options.loader) {
    options.loader = path.resolve(__dirname, "..", "@ngtools/webpack/src/ivy/index.js");
  }

  if (!options.webpackConfig) {
    options.webpackConfig = config.buildWebpack.webpackConfig;
  }

  if (Array.isArray(options.webpackConfig)) {
    throw new Error(
      "autof - webpackConfig option is an array. Use the webpack config that loads the initial test file."
    );
  }

  options.webpackConfig.module.rules.unshift({
    include: [options.testFile],
    use: [
      {
        loader: path.resolve(__dirname, "loader.js"),
        options: {
          limit: options.limit,
          sourceRoot: options.sourceRoot,
          disabled: options.disabled,
          silent: options.silent
        }
      }
    ].concat(Array.isArray(options.loader) ? options.loader : [options.loader])
  });
}

module.exports = autof;
