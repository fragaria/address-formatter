const Mustache = require('mustache');
const templates = require('./templates/templates.json');
const aliases = require('./templates/aliases.json');
const stateCodes = require('./templates/state-codes.json');
const countyCodes = require('./templates/county-codes.json');
const country2lang = require('./templates/country-to-lang.json');
const abbreviations = require('./templates/abbreviations.json');
const countryNames = require('./templates/country-names.json');

const knownComponents = aliases.map((a) => a.alias);
const VALID_REPLACEMENT_COMPONENTS = ['state'];

const determineCountryCode = (input, fallbackCountryCode = null) => {
  let countryCode = input.country_code && input.country_code.toUpperCase();
  if (!templates[countryCode] && fallbackCountryCode) {
    countryCode = fallbackCountryCode.toUpperCase();
  }
  if (!countryCode || countryCode.length !== 2) {
    // TODO change this to exceptions
    return input;
  }
  if (countryCode === 'UK') {
    countryCode = 'GB';
  }

  if (templates[countryCode] && templates[countryCode].use_country) {
    const oldCountryCode = countryCode;
    countryCode = templates[countryCode].use_country.toUpperCase();
    if (templates[oldCountryCode].change_country) {
      let newCountry = templates[oldCountryCode].change_country;
      const componentRegex = /\$(\w*)/;
      const componentMatch = componentRegex.exec(newCountry);
      if (componentMatch) {
        if (input[componentMatch[1]]) {
          newCountry = newCountry.replace(new RegExp(`\\$${componentMatch[1]}`), input[componentMatch[1]]);
        } else {
          newCountry = newCountry.replace(new RegExp(`\\$${componentMatch[1]}`), '');
        }
      }
      input.country = newCountry;
    }
    if (templates[oldCountryCode].add_component && templates[oldCountryCode].add_component.indexOf('=') > -1) {
      const splitted = templates[oldCountryCode].add_component.split('=');
      if (VALID_REPLACEMENT_COMPONENTS.indexOf(splitted[0]) > -1) {
        input[splitted[0]] = splitted[1];
      }
    }
  }
  
  if (countryCode === 'NL' && input.state) {
    if (input.state === 'Curaçao') {
      countryCode = 'CW';
      input.country = 'Curaçao';
    } else if (input.state.match(/sint maarten/i)) {
      countryCode = 'SX';
      input.country = 'Sint Maarten';
    } else if (input.state.match(/aruba/i)) {
      countryCode = 'AW';
      input.country = 'Aruba';
    }
  }

  // eslint-disable-next-line camelcase
  input.country_code = countryCode;
  return input;
};

const normalizeComponentKeys = (input) => {
  const inputKeys = Object.keys(input);
  for (let i = 0; i < inputKeys.length; i++) {
    const snaked = inputKeys[i].replace(/([A-Z])/g, '_$1').toLowerCase();
    if (knownComponents.indexOf(snaked) > -1 && !input[snaked]) {
      if (input[inputKeys[i]]) {
        input[snaked] = input[inputKeys[i]];
      }
      delete input[inputKeys[i]];
    }
  }
  return input;
};

const applyAliases = (input) => {
  const inputKeys = Object.keys(input);
  for (let i = 0; i < inputKeys.length; i++) {
    const alias = aliases.find((a) => a.alias === inputKeys[i]);
    if (alias && !input[alias.name]) {
      input[alias.name] = input[alias.alias];
    }
  }
  return input;
};

const getStateCode = (state, countryCode) => {
  if (!stateCodes[countryCode]) {
    return;
  }
  // TODO what if state is actually the stateCode?
  // https://github.com/OpenCageData/perl-Geo-Address-Formatter/blob/master/lib/Geo/Address/Formatter.pm#L526
  const found = stateCodes[countryCode].find((e) => {
    if (typeof e.name == 'string' && e.name.toUpperCase() === state.toUpperCase()) {
      return e;
    }
    const variants = Object.values(e.name);
    const foundVariant = variants.find((e) => e.toUpperCase() === state.toUpperCase());
    if (foundVariant) {
      return {
        key: e.key,
      };
    }
    return false;
  });
  return found && found.key;
};

const getCountyCode = (county, countryCode) => {
  if (!countyCodes[countryCode]) {
    return;
  }
  // TODO what if county is actually the countyCode?
  const found = countyCodes[countryCode].find((e) => {
    if (typeof e.name == 'string' && e.name.toUpperCase() === county.toUpperCase()) {
      return e;
    }
    const variants = Object.values(e.name);
    const foundVariant = variants.find((e) => e.toUpperCase() === county.toUpperCase());
    if (foundVariant) {
      return {
        key: e.key,
      };
    }
    return false;
  });
  return found && found.key;
};

const cleanupInput = (input, replacements = [], options = {}) => {
  // If the country is a number, use the state as country
  let inputKeys = Object.keys(input);
  if (input.country && input.state && Number.isInteger(input.country)) {
    input.country = input.state;
    delete input.state;
  }
  if (replacements && replacements.length) {
    for (let i = 0; i < inputKeys.length; i++) {
      for (let j = 0; j < replacements.length; j++) {
        const componentRegex = new RegExp(`^${inputKeys[i]}=`);
        if (replacements[j][0].match(componentRegex)) {
          const val = replacements[j][0].replace(componentRegex, '');
          if (input[inputKeys[i]] === val) {
            input[inputKeys[i]] = replacements[j][1];
          }
        } else {
          input[inputKeys[i]] = `${input[inputKeys[i]]}`.replace(new RegExp(replacements[j][0]), replacements[j][1]);
        }
      }
    }
  }
  if (!input.state_code && input.state) {
    // eslint-disable-next-line camelcase
    input.state_code = getStateCode(input.state, input.country_code);
    if (input.state.match(/^washington,? d\.?c\.?/i)) {
      // eslint-disable-next-line camelcase
      input.state_code = 'DC';
      input.state = 'District of Columbia';
      input.city = 'Washington';
    }
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

  if (input.postcode && options.cleanupPostcode !== false) {
    // convert to string
    input.postcode = `${input.postcode}`;
    const multiCodeRegex = /^(\d{5}),\d{5}/;
    const multiCodeMatch = multiCodeRegex.exec(input.postcode);
    if (input.postcode.length > 20) {
      delete input.postcode;
    // OSM may use postcode ranges
    } else if (input.postcode.match(/\d+;\d+/)) {
      delete input.postcode;
    } else if (multiCodeMatch) {
      input.postcode = multiCodeMatch[1];
    }
  }

  if (options.abbreviate && input.country_code && country2lang[input.country_code]) {
    for (let i = 0; i < country2lang[input.country_code].length; i++) {
      const lang = country2lang[input.country_code][i];
      if (abbreviations[lang]) {
        for (let j = 0; j < abbreviations[lang].length; j++) {
          if (input[abbreviations[lang][j].component]) {
            for (let k = 0; k < abbreviations[lang][j].replacements.length; k++) {
              input[abbreviations[lang][j].component] = input[abbreviations[lang][j].component].replace(
                new RegExp(`\\b${abbreviations[lang][j].replacements[k].src}\\b`),
                abbreviations[lang][j].replacements[k].dest,
              );
            }
          }
        }
      }
    }
  }
  
  // naive url cleanup, keys might have changed along the cleanup
  inputKeys = Object.keys(input);
  for (let i = 0; i < inputKeys.length; i++) {
    if (`${input[inputKeys[i]]}`.match(/^https?:\/\//i)) {
      delete input[inputKeys[i]];
    }
  }

  return input;
};

const findTemplate = (input) => {
  return templates[input.country_code] ? templates[input.country_code] : templates.default;
};

const chooseTemplateText = (template, input) => {
  let selected = template.address_template || templates.default.address_template;
  const threshold = 2;
  // Choose fallback only when none of these is present
  const required = ['road', 'postcode'];
  const missingValuesCnt = required
    .map((r) => !!input[r])
    .filter((s) => !s)
    .length;
  if (missingValuesCnt === threshold) {
    selected = template.fallback_template || templates.default.fallback_template;
  }
  return selected;
};

const cleanupRender = (text) => {
  const replacements = [
    // eslint-disable-next-line no-useless-escape
    { s: /[\},\s]+$/u, d: '' },
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
      const chunk = inputChunks[i].trim();
      // Special casing New York here, no dedupe for it
      if (chunk.toLowerCase() === 'new york') {
        seen[chunk] = 1;
        result.push(chunk);
        continue;
      }
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
  return text.trim();
};

const renderTemplate = (template, input) => {
  const templateText = chooseTemplateText(template, input);
  const templateInput = Object.assign({}, input, {
    first: () => {
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
  render = cleanupRender(render);
  if (!render.trim().length) {
    render = cleanupRender(Object.keys(input)
      .map((i) => input[i])
      .filter((s) => !!s)
      .join(', '));
  }

  return render + '\n';
};

module.exports = {
  format: (input, options = {
    countryCode: undefined,
    abbreviate: false,
    output: 'string',
    appendCountry: false,
    cleanupPostcode: true,
  }) => {
    let realInput = Object.assign({}, input);
    realInput = normalizeComponentKeys(realInput);
    if (options.countryCode) {
      // eslint-disable-next-line camelcase
      realInput.country_code = options.countryCode;
    }
    realInput = determineCountryCode(realInput, options.fallbackCountryCode);
    if (options.appendCountry && countryNames[realInput.country_code] && !realInput.country) {
      realInput.country = countryNames[realInput.country_code];
    }
    realInput = applyAliases(realInput);
    const template = findTemplate(realInput);
    realInput = cleanupInput(realInput, template.replace, options);
    const result = renderTemplate(template, realInput);
    if (options.output === 'array') {
      return result.split('\n').filter((f) => !!f);
    }
    return result;
  },
  _determineCountryCode: determineCountryCode,
  _normalizeComponentKeys: normalizeComponentKeys,
  _applyAliases: applyAliases,
  _getStateCode: getStateCode,
  _getCountyCode: getCountyCode,
  _cleanupInput: cleanupInput,
  _findTemplate: findTemplate,
  _chooseTemplateText: chooseTemplateText,
  _cleanupRender: cleanupRender,
  _renderTemplate: renderTemplate,
};
