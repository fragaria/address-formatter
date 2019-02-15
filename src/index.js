const Mustache = require('mustache');

const templates = require('./templates/templates');
const aliases = require('./templates/aliases');

const applyAliases = (input) => {
  for (let i = 0; i < aliases.length; i++) {
    const item = aliases[i];
    if (!input[item.name]) {
      input[item.name] = input[item.alias];
    }
  }
  return input;
};

const pickTemplate = (input) => {
  const tpl = templates[input.country_code] ? templates[input.country_code] : templates.default;
  // TODO fallback_template if we cannot use address_template due to missing data
  if (tpl.address_template) {
    return tpl.address_template;
  }
  return tpl.fallback_template;
};

// TODO test properly
const cleanupRender = (text) => {
  const replacements = [
    { s: /[},\s]+$/u, d: '' },
    { s: /^[,\s]+/u, d: '' },
    { s: /^- /u, d: '' }, // line starting with dash due to a parameter missing
    { s: /,\s*,/u, d: ', ' }, // multiple commas to one
    { s: /[ \t]+,[ \t]+/u, d: ', ' }, // one horiz whitespace behind comma
    { s: /[ \t][ \t]+/u, d: ' ' }, // multiple horiz whitespace to one
    { s: /[ \t]\n/u, d: '\n' }, // horiz whitespace, newline to newline
    { s: /\n,/u, d: '\n' }, // newline comma to just newline
    { s: /,,+/u, d: ',' }, // multiple commas to one
    { s: /,\n/u, d: '\n' }, // comma newline to just newline
    { s: /\n[ \t]+/u, d: '\n' }, // newline plus space to newline
    { s: /\n\n+/u, d: '\n' }, // multiple newline to one
  ];
  const dedupe = function dedupe (inputChunks, glue, modifier = (s) => s) {
    const seen = {};
    const result = [];
    for (let i = 0; i < inputChunks.length; i++) {
      let chunk = inputChunks[i].trim();
      if (!seen[chunk]) {
        seen[chunk] = 1;
        result.push(modifier(chunk));
      }
    }
    return result.join(glue);
  };
  for (let i = 0; i < replacements.length; i++) {
    text = text.replace(replacements[i].s, replacements[i].d);
    text = dedupe(text.split('\n'), '\n', (s) => {
      return dedupe(s.split(', '), ', ');
    });
  }
  return text.trim() + '\n';
};

// TODO test properly
const renderTemplate = (template, input) => {
  const templateInput = Object.assign({}, input, {
    'first': () => {
      return (text, render) => {
        const possibilities = render(text, input)
          .split(/\s*\|\|\s*/)
          .filter((b) => b.length > 0);
        return possibilities.length ? possibilities[0] : '';
      };
    },
  });
  const render = Mustache.render(template, templateInput);
  return cleanupRender(render);
};

module.exports = {
  format: (input, options = {}) => {
    let realInput = Object.assign({}, input);
    // TODO detect fallback countries from templates
    realInput = applyAliases(realInput);
    // TODO sanitize - multi post-codes, drop urls
    const template = pickTemplate(realInput);
    return renderTemplate(template, realInput);
  },
};
