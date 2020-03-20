/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const lockfile = require('@yarnpkg/lockfile');

const pkgName = 'soundredux';

const yarnLock = lockfile.parse(fs.readFileSync(`yarn-lock/${pkgName}-yarn.lock`, 'utf8'));
// const packageJson = JSON.parse(fs.readFileSync(`package-json/${pkgName}.json`, 'utf8'));

if (yarnLock.type !== 'success') process.exit(-1);

const dependencies = {};
for (const [key, value] of Object.entries(yarnLock.object)) {
  const name = key.substring(0, key.indexOf('@', 1));
  const { version } = yarnLock.object[key];
  dependencies[`${name}@${version}`] = {
    name,
    version,
    declared: key,
    dependencies: Object.entries(value.dependencies || {}).map(([depName, declaredVersion]) => {
      const resolved = yarnLock.object[`${depName}@${declaredVersion}`];
      // try {
      //   const tmp = `${depName}@${resolved.version}`;
      //   return tmp;
      // } catch (e) {
      //   console.error(e);
      //   console.log('depName', depName);
      //   console.log('declaredVersion', declaredVersion);
      //   console.log('resolved', resolved);
      //   console.log('------------');
      // }
      return `${depName}@${resolved.version}`;
    }),
    // get full() {
    //   return `${this.name}@${this.version}`;
    // },
    dependedBy: [],
  };
}
for (const [full, pkg] of Object.entries(dependencies)) {
  if (pkg.dependencies) {
    for (const depFull of pkg.dependencies) {
      dependencies[depFull].dependedBy.push(full);
    }
  }
}

// const declaredDepedencies = packageJson.dependencies;
// const declaredDevDependencies = packageJson.devDependencies;

// console.log('# direct runtime dependencies:', Object.keys(declaredDepedencies).length);
// console.log('# direct dev dependencies:', Object.keys(declaredDevDependencies).length);
// console.log('# all dependencies:', Object.keys(dependencies).length);
// console.log(JSON.stringify(dependencies));

for (const [key, value] of Object.entries(dependencies)) {
  console.log(`${key},${value.dependencies.length},${value.dependedBy.length}`);
}
