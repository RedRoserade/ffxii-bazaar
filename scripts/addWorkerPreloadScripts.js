const fs = require("fs");
const glob = require("glob");

module.exports = function addWorkerPreloadScripts() {
  const workerScripts = glob.sync("build/**/*.worker.js");

  const preloadTags = workerScripts
    .map(
      s => `<link rel="prefetch" href="${s.replace(/^build/, "")}" as="script">`
    )
    .join("");

  const contents = fs.readFileSync("build/index.html", { encoding: "utf8" });

  fs.writeFileSync(
    "build/index.html",
    contents.replace("</head>", preloadTags + "</head>"),
    { encoding: "utf8" }
  );
};
