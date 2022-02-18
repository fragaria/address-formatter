const internal = require('./internal.js');
const countryNames = require('./templates/country-names.json');

module.exports = {
  format: (input, options) => {
    const {
      appendCountry= false,
      countryCode= undefined,
      fallbackCountryCode= undefined,
      output= 'string'
    } = options ||{}
    let realInput = Object.assign({}, input);
    realInput = internal.normalizeComponentKeys(realInput);
    if (countryCode) {
      // eslint-disable-next-line camelcase
      realInput.country_code = countryCode;
    }
    realInput = internal.determineCountryCode(realInput, fallbackCountryCode);
    if (appendCountry && countryNames[realInput.country_code] && !realInput.country) {
      realInput.country = countryNames[realInput.country_code];
    }
    realInput = internal.applyAliases(realInput);
    const template = internal.findTemplate(realInput);
    realInput = internal.cleanupInput(realInput, template.replace, options);
    const result = internal.renderTemplate(template, realInput);
    if (output === 'array') {
      return result.split('\n').filter((f) => !!f);
    }
    return result;
  }
};
