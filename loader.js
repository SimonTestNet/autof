const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const entrySeparator = " -> ";

const isString = obj => typeof obj === "string" || obj instanceof String;

function autofLoader(source) {
  const options = this.query;
  function log(msg) {
    if (!options.silent) {
      console.log("autof - " + msg);
    }
  }
  const autofLimit = options.limit || 50;
  const ls = cp.spawnSync("git", ["status", "-s"], { encoding: "utf8" });
  if (!isString(ls.stdout)) {
    log(
      "Couldn't get list of changes with 'git status -s'. Maybe you can't run git on this terminal."
    );
  }
  const gitOutput = ls.stdout || "";

  const changedFiles = gitOutput
    .split("\n")
    .filter(l => !!l && !l.trimLeft().startsWith("D") && l.includes(` ${options.sourceRoot}/`))
    .map(l => {
      const entry = l.substring(3);
      return entry.includes(entrySeparator) ? entry.split(" -> ")[1] : entry;
    });

  const specFiles = [];

  if (changedFiles.length <= autofLimit && !options.disabled) {
    function findSpecFiles(dir) {
      fs.readdirSync(dir).forEach(file => {
        const absolute = path.join(dir, file);
        if (fs.statSync(absolute).isDirectory()) {
          findSpecFiles(absolute);
        } else if (absolute.endsWith(".spec.ts")) {
          specFiles.push(path.basename(absolute));
        }
      });
    }
    changedFiles.forEach(filePath => {
      if (filePath.endsWith(".spec.ts")) {
        specFiles.push(path.basename(filePath));
      } else {
        if (fs.statSync(filePath).isDirectory()) {
          findSpecFiles(filePath);
        } else {
          const fileExtension = path.extname(filePath);

          const dirPath = path.dirname(filePath);
          const fileBareName = path.basename(filePath, fileExtension);
          const possibleSpecFile = path.join(dirPath, fileBareName + ".spec.ts");
          if (fs.existsSync(possibleSpecFile)) {
            specFiles.push(path.basename(possibleSpecFile));
          }
        }
      }
    });
  }

  log(`Building and executing ${specFiles.length ? specFiles.length : "all"} spec files.`);

  const regexString = specFiles.length
    ? "/(" +
      specFiles
        .map(f => f.replace(/\./g, "\\."))
        .map(f => "\\/" + f)
        .join("|") +
      ")$/"
    : "/\\.spec\\.ts$/";

  const newContext = `$1 $2 = require.context($3, $4, ${regexString});`;
  const newSource = source.replace(
    /(const|let|var)\s+(.*)\s+=\s+require\.context\((.*),\s*(true|false)\s*,\s*\/.*\/\s*\);?/,
    newContext
  );

  return newSource;
}

module.exports = autofLoader;
