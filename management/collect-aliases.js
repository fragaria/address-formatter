const path = require('path'),
  fs = require('fs'),
  yaml = require('js-yaml');

const SRC_PATH = path.resolve(__dirname, '../address-formatting/conf/');

if (!fs.existsSync(SRC_PATH)) {
  console.error('address-formatting data not found. Maybe the submodule is not initalized?')
  process.exit(1);
}

try {
  const doc = yaml.loadAll(fs.readFileSync(path.resolve(SRC_PATH, 'components.yaml'), 'utf8'));
  const result = doc.reduce((agg, curr) => {
      const aliases = curr.aliases ? curr.aliases.map((c) => {
        return c;
      }, []) : [];
      return agg.concat(aliases).concat(curr.name);
    }, []);
  console.log(result.sort().map(v => `| '${v}'`).join("\n"));
} catch (e) {
  console.error(e);
  process.exit(1);
}
