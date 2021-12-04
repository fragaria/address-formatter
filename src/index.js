const internal = require('./internal.js');
const countryNames = require('./templates/country-names.json');

module.exports = {
  format: (input, options = {
    abbreviate: false,
    appendCountry: false,
    cleanupPostcode: true,
    countryCode: undefined,
    fallbackCountryCode: undefined,
    output: 'string',
  }) => {
    let realInput = Object.assign({}, input);
    realInput = internal.normalizeComponentKeys(realInput);
    if (options.countryCode) {
      // eslint-disable-next-line camelcase
      realInput.country_code = options.countryCode;
    }
    realInput = internal.determineCountryCode(realInput, options.fallbackCountryCode);
    if (options.appendCountry && countryNames[realInput.country_code] && !realInput.country) {
      realInput.country = countryNames[realInput.country_code];
    }
    realInput = internal.applyAliases(realInput);
    const template = internal.findTemplate(realInput);
    realInput = internal.cleanupInput(realInput, template.replace, options);
    const result = internal.renderTemplate(template, realInput);
    if (options.output === 'array') {
      return result.split('\n').filter((f) => !!f);
    }
    return result;
  },
};
