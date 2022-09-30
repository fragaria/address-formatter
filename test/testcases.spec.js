import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import addressFormatter from '../src/index';

const SRC_PATH = path.resolve(__dirname, '../address-formatting/testcases/');

if (!fs.existsSync(SRC_PATH)) {
  console.error('address-formatting data not found. Maybe the submodule is not initalized?');
  process.exit(1);
}

function loadYaml (src) {
  return yaml.loadAll(fs.readFileSync(path.resolve(SRC_PATH, src), 'utf8'));
}

describe('testcases', () => {
  ['countries', 'other'].map((suite) => {
    describe(`/${suite}`, () => {
      fs.readdirSync(path.resolve(SRC_PATH, suite)).map((filename) => {
        describe(filename, () => {
          loadYaml(`${suite}/${filename}`).map((testCase) => {
            it(testCase.description || 'non-specific test case', () => {
              expect(addressFormatter.format(testCase.components)).toBe(testCase.expected);
            });
            return true;
          });
        });
        return true;
      });
    });
    return true;
  });
});
