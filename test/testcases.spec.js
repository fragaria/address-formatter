const path = require('path'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  addressFormatter = require('../src/index');

const SRC_PATH = path.resolve(__dirname, '../address-formatting/testcases/');

if (!fs.existsSync(SRC_PATH)) {
  console.error('address-formatting data not found. Maybe the submodule is not initalized?');
  process.exit(1);
}

function loadYaml (src) {
  return yaml.safeLoadAll(fs.readFileSync(path.resolve(SRC_PATH, src), 'utf8'));
}

describe('testcases', () => {
  ['countries', 'other'].map((suite) => {
    describe(`/${suite}`, () => {
      fs.readdirSync(path.resolve(SRC_PATH, suite)).map((filename) => {
        describe(filename, () => {
          /* if (filename !== 'fr.yaml') {
            return;
          } */
          loadYaml(`${suite}/${filename}`).map((testCase) => {
            it(testCase.description || 'non-specific test case', () => {
              expect(addressFormatter.format(testCase.components)).toBe(testCase.expected);
            });
          });
        });
      });
    });
  });
});
