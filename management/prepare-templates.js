const path = require('path'),
  fs = require('fs'),
  yaml = require('js-yaml');

const SRC_PATH = path.resolve(__dirname, '../address-formatting/conf/'),
  TARGET_PATH = path.resolve(__dirname, '../src/templates/');

if (!fs.existsSync(SRC_PATH)) {
  console.error('address-formatting data not found. Maybe the submodule is not initalized?')
  process.exit(1);
}

function convert(src, dest, modifier, multiDoc) {
  let doc;
  if (multiDoc) {
    doc = yaml.loadAll(fs.readFileSync(path.resolve(SRC_PATH, src), 'utf8'));
  } else {
    doc = yaml.load(fs.readFileSync(path.resolve(SRC_PATH, src), 'utf8'));
  }
  fs.writeFileSync(path.resolve(TARGET_PATH, dest), JSON.stringify(modifier(doc)));
}

function convertAbbreviations(src, dest) {
  const list = fs.readdirSync(path.resolve(SRC_PATH, src));
  const result = {};
  for (let i = 0; i < list.length; i++) {
    const name = list[i].split('.')[0];
    const loaded = yaml.load(fs.readFileSync(path.resolve(SRC_PATH, src, list[i]), 'utf8'));
    result[name.toUpperCase()] = Object.keys(loaded).map((k) => {
      return {
        component: k,
        replacements: Object.keys(loaded[k]).map((l) => {
          return {
            src: l,
            dest: loaded[k][l],
          };
        })
      };
    });
  }
  fs.writeFileSync(path.resolve(TARGET_PATH, dest), JSON.stringify(result));
}

function convertCountryCodes(src, dest) {
  const contents = fs.readFileSync(path.resolve(SRC_PATH, src), 'utf8');
  doc = yaml.load(contents.replace(/ \# /g, ' '));
  fs.writeFileSync(path.resolve(TARGET_PATH, dest), JSON.stringify(doc));
}

try {
  convert('countries/worldwide.yaml', 'templates.json', (s) => s);
  convert('components.yaml', 'aliases.json', (s) => {
    return s.reduce((agg, curr) => {
      const aliases = curr.aliases ? curr.aliases.map((c) => {
        return {
          alias: c,
          name: curr.name,
        }
      }, []) : [];
      return agg.concat(aliases).concat({alias: curr.name, name: curr.name});
    }, [])
  }, true);
  convert('country2lang.yaml', 'country-to-lang.json', (s) => {
    return Object.keys(s).reduce((agg, curr) => {
      agg[curr] = s[curr].split(',').map((s) => s.toUpperCase());
      return agg;
    }, {});
  });
  convert('county_codes.yaml', 'county-codes.json', (s) => {
    return Object.keys(s).reduce((agg, curr) => {
      agg[curr] = Object.keys(s[curr]).map((k) => {
        return {
          name: s[curr][k],
          key: k,
        }
      });
      return agg;
    }, {});
  });
  convert('state_codes.yaml', 'state-codes.json', (s) => {
    return Object.keys(s).reduce((agg, curr) => {
      agg[curr] = Object.keys(s[curr]).map((k) => {
        return {
          name: s[curr][k],
          key: k,
        }
      });
      return agg;
    }, {});
  });
  convertAbbreviations('abbreviations/', 'abbreviations.json');
  convertCountryCodes('country_codes.yaml', 'country-names.json');
} catch (e) {
  console.error(e);
  process.exit(1);
}
