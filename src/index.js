const Mustache = require('mustache');

const templates = require('./templates/templates');
const aliases = require('./templates/aliases');

const knownComponents = aliases.map((a) => a.alias);

const determineCountryCode = (input) => {
  let countryCode = input.country_code.toUpperCase();
  if (countryCode.length !== 2) {
    return input;
  }
  if (countryCode === 'UK') {
    countryCode = 'GB';
  }
  // TODO add fallback
  // TODO handle NL
  // eslint-disable-next-line camelcase
  input.country_code = countryCode;
  return input;
};

const applyAliases = (input) => {
  for (let i = 0; i < aliases.length; i++) {
    const item = aliases[i];
    if (!input[item.name] && input[item.alias]) {
      input[item.name] = input[item.alias];
    }
  }
  return input;
};

const cleanupInput = (input, replacements) => {
  // If the country is a number, use the state as country
  const inputKeys = Object.keys(input);
  if (input.country && input.state && Number.isInteger(input.country)) {
    input.country = input.state;
    delete input.state;
  }
  if (replacements) {
    for (let i = 0; i < inputKeys.length; i++) {
      for (let j = 0; j < replacements.length; j++) {
        if (false) {
          // todo
        } else if (input[inputKeys[i]] && input[inputKeys[i]].replace) {
          input[inputKeys[i]] = input[inputKeys[i]].replace(new RegExp(replacements[j][0]), replacements[j][1]);
        }
      }
    }
  }
  // TODO add state code
  // TODO add county code
  const unknownComponents = [];
  for (let i = 0; i < inputKeys.length; i++) {
    if (knownComponents.indexOf(inputKeys[i]) === -1) {
      unknownComponents.push(inputKeys[i]);
    }
  }
  if (unknownComponents.length) {
    input.attention = unknownComponents.map((c) => input[c]).join(', ');
  }
  return input;
};

const findTemplate = (input) => {
  return templates[input.country_code] ? templates[input.country_code] : templates.default;
};

const chooseTemplateText = (template, input) => {
  // TODO fallback_template if we cannot use address_template due to missing data
  if (template.address_template) {
    return template.address_template;
  }
  return template.fallback_template;
};

// TODO unit test properly
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
  const dedupe = (inputChunks, glue, modifier = (s) => s) => {
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

// TODO unit test properly
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
    // TODO detect fallback/normalize countries from templates
    realInput = determineCountryCode(realInput);
    realInput = applyAliases(realInput);
    // TODO sanitize - multi post-codes, drop urls
    const template = findTemplate(realInput);
    realInput = cleanupInput(realInput, template.replace);
    return renderTemplate(chooseTemplateText(template, realInput), realInput);
  },
};
