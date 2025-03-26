const { src, dest, task } = require("gulp");

// This task is used to copy icons to the dist folder
task("build:icons", () => {
  // If you have icons in your project, uncomment and modify the following line
  // return src('./src/nodes/**/icons/*.svg').pipe(dest('./dist/nodes'));

  // If you don't have icons yet, just return a completed task
  return Promise.resolve();
});
