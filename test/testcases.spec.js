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

function runSuite (suite, options = {
  abbreviate: false,
  appendCountry: false,
  cleanupPostcode: true,
  countryCode: undefined,
  fallbackCountryCode: undefined,
  output: 'string'
}) {
  return describe(`/${suite}`, () => {
    fs.readdirSync(path.resolve(SRC_PATH, suite)).map((filename) => {
      describe(filename, () => {
        loadYaml(`${suite}/${filename}`).map((testCase) => {
          if (testCase?.components && testCase?.expected) {
            it(testCase.description || 'non-specific test case', () => {
              expect(addressFormatter.format(testCase.components, options)).toBe(testCase.expected);
            });
          }
          return true;
        });
      });
      return true;
    });
  });
}

describe('testcases - abbreviations', () => {
  runSuite('abbreviations', {
    abbreviate: true,
    appendCountry: false,
    cleanupPostcode: false,
    countryCode: undefined,
    fallbackCountryCode: undefined
  });
});

describe('testcases - countries', () => {
  runSuite('countries');
});

describe('testcases - other', () => {
  runSuite('other');
});
