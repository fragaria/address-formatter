const Mustache = require('mustache');

const templates = require('./templates/templates');
const aliases = require('./templates/aliases');
const stateCodes = require('./templates/state-codes');
const countyCodes = require('./templates/county-codes');

const knownComponents = aliases.map((a) => a.alias);
const VALID_REPLACEMENT_COMPONENTS = ['state'];

const determineCountryCode = (input) => {
  let countryCode = input.country_code && input.country_code.toUpperCase();
  if (!countryCode || countryCode.length !== 2 || !templates[countryCode]) {
    // TODO change this to exceptions
    return input;
  }
  if (countryCode === 'UK') {
    countryCode = 'GB';
  }
  if (templates[countryCode].use_country) {
    const oldCountryCode = countryCode;
    countryCode = templates[countryCode].use_country.toUpperCase();
    if (templates[oldCountryCode].change_country) {
      let newCountry = templates[oldCountryCode].change_country;
      input.country = newCountry;
    }
    if (templates[oldCountryCode].add_component && templates[oldCountryCode].add_component.indexOf('=') > -1) {
      const splitted = templates[oldCountryCode].add_component.split('=');
      if (VALID_REPLACEMENT_COMPONENTS.indexOf(splitted[0]) > -1) {
        input[splitted[0]] = splitted[1];
      }
    }
  }
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

const getStateCode = (state, countryCode) => {
  if (!stateCodes[countryCode]) {
    return '';
  }
  const found = stateCodes[countryCode].find((e) => e.name.toUpperCase() === state.toUpperCase());
  return (found && found.key) || '';
};

const getCountyCode = (county, countryCode) => {
  if (!countyCodes[countryCode]) {
    return '';
  }
  const found = countyCodes[countryCode].find((e) => e.name.toUpperCase() === county.toUpperCase());
  return (found && found.key) || '';
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
  if (!input.state_code && input.state) {
    // eslint-disable-next-line camelcase
    input.state_code = getStateCode(input.state, input.country_code);
  }
  if (!input.county_code && input.county) {
    // eslint-disable-next-line camelcase
    input.county_code = getCountyCode(input.county, input.country_code);
  }
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
  const templateText = chooseTemplateText(template, input);
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
  let render = cleanupRender(Mustache.render(templateText, templateInput));
  if (template.postformat_replace) {
    for (let i = 0; i < template.postformat_replace.length; i++) {
      const replacement = template.postformat_replace[i];
      render = render.replace(new RegExp(replacement[0]), replacement[1]);
    }
  }
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
    return renderTemplate(template, realInput);
  },
};
