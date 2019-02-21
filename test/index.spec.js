/* eslint-disable camelcase */
const addressFormatter = require('../src/index');

describe('address-formatter', () => {
  describe('determineCountryCode', () => {
    it('should put country code to uppercase', () => {
      const converted = addressFormatter._determineCountryCode({
        country_code: 'cz',
      });
      expect(converted).toHaveProperty('country_code', 'CZ');
    });

    it('should not modify strange input', () => {
      let converted = addressFormatter._determineCountryCode({
        country_code: 'czx',
      });
      expect(converted).toHaveProperty('country_code', 'czx');
      converted = addressFormatter._determineCountryCode({});
      expect(converted).not.toHaveProperty('country_code');
    });

    it('should convert UK country_code to GB', () => {
      const converted = addressFormatter._determineCountryCode({
        country_code: 'UK',
      });
      expect(converted).toHaveProperty('country_code', 'GB');
    });

    it('should apply use_country', () => {
      const converted = addressFormatter._determineCountryCode({
        country_code: 'LI',
      });
      expect(converted).toHaveProperty('country_code', 'CH');
    });

    it('should apply change_country', () => {
      const converted = addressFormatter._determineCountryCode({
        country_code: 'MF',
        country: 'Collectivité de Saint-Martin',
      });
      expect(converted).toHaveProperty('country_code', 'FR');
      expect(converted).toHaveProperty('country', 'France');
    });

    it('should replace component name if that is present', () => {
      const converted = addressFormatter._determineCountryCode({
        country: 'Saint Helena, Ascension and Tristan da Cunha',
        country_code: 'sh',
        state: 'Saint Helena',
      });
      expect(converted).toHaveProperty('country', 'Saint Helena, United Kingdom');
    });

    it('should replace component name if that is not present', () => {
      const converted = addressFormatter._determineCountryCode({
        country: 'Saint Helena, Ascension and Tristan da Cunha',
        country_code: 'sh',
      });
      expect(converted).toHaveProperty('country', ', United Kingdom');
    });

    it('should add component', () => {
      const converted = addressFormatter._determineCountryCode({
        country_code: 'MH',
      });
      expect(converted).toHaveProperty('country_code', 'US');
      expect(converted).toHaveProperty('state', 'Marshall Islands'); // sic
    });
    it('should convert Sint Maarten to SX country code', () => {
      const converted = addressFormatter._determineCountryCode({
        'country_code': 'NL',
        'state': 'Sint Maarten',
      });
      expect(converted).toHaveProperty('country_code', 'SX');
    });

    it('should convert Curaçao to CW country code', () => {
      const converted = addressFormatter._determineCountryCode({
        'country_code': 'NL',
        'state': 'Curaçao',
      });
      expect(converted).toHaveProperty('country_code', 'CW');
    });

    it('should convert Aruba to AW country code', () => {
      const converted = addressFormatter._determineCountryCode({
        'country_code': 'NL',
        'state': 'Aruba',
      });
      expect(converted).toHaveProperty('country_code', 'AW');
    });

    it('should do nothing for NL if no special case is met', () => {
      const converted = addressFormatter._determineCountryCode({
        'country_code': 'NL',
        'state': 'Not A-ruba',
      });
      expect(converted).toHaveProperty('country_code', 'NL');
    });
  });

  describe('_normalizeComponentKeys', () => {
    it('should normalize camelCase component names', () => {
      const mapping = [
        ['streetNumber', 'street_number'],
        ['houseNumber', 'house_number'],
        ['publicBuilding', 'public_building'],
        ['streetName', 'street_name'],
        ['roadReference', 'road_reference'],
        ['roadReferenceIntl', 'road_reference_intl'],
        ['cityDistrict', 'city_district'],
        ['localAdministrativeArea', 'local_administrative_area'],
        ['countyCode', 'county_code'],
        ['stateDistrict', 'state_district'],
        ['stateCode', 'state_code'],
        ['countryName', 'country_name'],
        ['countryCode', 'country_code'],
      ];

      for (let i = 0; i < mapping.length; i++) {
        const converted = addressFormatter._normalizeComponentKeys({ [mapping[i][0]]: 'string' });
        expect(converted).toHaveProperty(mapping[i][1]);
        expect(converted).not.toHaveProperty(mapping[i][0]);
        expect(converted).not.toHaveProperty('attention');
      }
    });
  });

  describe('applyAliases', () => {
    it('should apply aliases', () => {
      const converted = addressFormatter._applyAliases({
        'street_number': 123,
      });
      expect(converted).toHaveProperty('house_number', 123);
    });

    it('should not overwrite aliases', () => {
      const converted = addressFormatter._applyAliases({
        'street_number': 123,
        house_number: 456,
      });
      expect(converted).toHaveProperty('house_number', 456);
    });
  });

  describe('getStateCode', () => {
    it('should return state code', () => {
      expect(addressFormatter._getStateCode('Alabama', 'US')).toBe('AL');
    });

    it('should return nothing when country has no state codes', () => {
      expect(addressFormatter._getStateCode('Pardubice', 'CZ')).toBe(undefined);
    });

    it('should return nothing when state is not found', () => {
      expect(addressFormatter._getStateCode('Husky', 'US')).toBe(undefined);
    });
  });

  describe('getCountyCode', () => {
    it('should return county code', () => {
      expect(addressFormatter._getCountyCode('Alessandria', 'IT')).toBe('AL');
    });

    it('should return nothing when country has no county codes', () => {
      expect(addressFormatter._getCountyCode('Pardubice', 'CZ')).toBe(undefined);
    });

    it('should return nothing when county is not found', () => {
      expect(addressFormatter._getCountyCode('Calcio', 'IT')).toBe(undefined);
    });
  });

  describe('cleanupInput', () => {
    it('should replace country with state if country is numeric', () => {
      const converted = addressFormatter._cleanupInput({
        country: 123,
        state: 'Slovakia',
      });
      expect(converted).toHaveProperty('country', 'Slovakia');
    });

    it('should determine state code from state if possible', () => {
      const converted = addressFormatter._cleanupInput({
        state: 'Alabama',
        country_code: 'US',
      });
      expect(converted).toHaveProperty('state_code', 'AL');
    });

    it('should cleanup for Washington D.C.', () => {
      const converted = addressFormatter._cleanupInput({
        state: 'Washington D.C.',
        country_code: 'US',
      });
      expect(converted).toHaveProperty('state_code', 'DC');
      expect(converted).toHaveProperty('state', 'District of Columbia');
      expect(converted).toHaveProperty('city', 'Washington');
    });

    it('should determine county code from county if possible', () => {
      const converted = addressFormatter._cleanupInput({
        county: 'Alessandria',
        country_code: 'IT',
      });
      expect(converted).toHaveProperty('county_code', 'AL');
    });

    it('should put together attention from unknown components', () => {
      const converted = addressFormatter._cleanupInput({
        pub: 'Pub',
        name: 'Henry',
        country_code: 'IT',
      });
      expect(converted).toHaveProperty('attention', 'Pub, Henry');
    });

    it('should drop lengthy post codes', () => {
      const converted = addressFormatter._cleanupInput({
        postcode: 'abcdefghijklmnopqrstuvwxyz',
      });
      expect(converted).not.toHaveProperty('postcode');
    });

    it('should drop post codes separated by ;', () => {
      const converted = addressFormatter._cleanupInput({
        postcode: '1234;5678',
      });
      expect(converted).not.toHaveProperty('postcode');
    });

    it('should pick the first from post codes separated by ,', () => {
      const converted = addressFormatter._cleanupInput({
        postcode: '12345,56789',
      });
      expect(converted).toHaveProperty('postcode', '12345');
    });

    it('should convert postcode to a string', () => {
      const converted = addressFormatter._cleanupInput({
        postcode: 123456,
      });
      expect(converted).toHaveProperty('postcode', '123456');
    });

    it('should drop anything that looks like url', () => {
      const converted = addressFormatter._cleanupInput({
        pub: 'http://google.com',
        street: 'https://google.com',
      });
      expect(converted).not.toHaveProperty('pub');
      expect(converted).not.toHaveProperty('street');
    });

    it('should apply replacements', () => {
      const converted = addressFormatter._cleanupInput({
        stadt: 'Stadtteil Hamburg',
        city: 'Alt-Berlin',
        place: 'Alt-Berlin',
        platz: 'Bonn',
      }, [
        ['^Stadtteil ', ''],
        ['city=Alt-Berlin', 'Berlin'],
        ['platz=Alt-Berlin', 'Berlin'],
      ]);
      expect(converted).toHaveProperty('stadt', 'Hamburg');
      expect(converted).toHaveProperty('city', 'Berlin');
      expect(converted).toHaveProperty('place', 'Alt-Berlin');
      expect(converted).toHaveProperty('platz', 'Bonn');
    });

    it('should apply abbreviations', () => {
      const converted = addressFormatter._cleanupInput({
        stadt: 'Stadtteil Hamburg',
        city: 'Alt-Berlin',
        place: 'Alt-Berlin',
        platz: 'Bonn',
      }, [], { abbreviate: true });
      expect(converted).toHaveProperty('platz', 'Bonn');
    });
  });

  describe('findTemplate', () => {
    it('should pick country template', () => {
      expect(addressFormatter._findTemplate({ country_code: 'DO' })).toHaveProperty('postformat_replace.length', 1);
    });
    it('should fallback to default', () => {
      expect(addressFormatter._findTemplate({ country_code: 'XX' })).toHaveProperty('fallback_template', `{{{attention}}}
{{{house}}}
{{{road}}} {{{house_number}}}
{{#first}} {{{suburb}}} || {{{city_district}}} || {{{neighbourhood}}} {{/first}}
{{#first}} {{{city}}} || {{{town}}} || {{{village}}} {{/first}}
{{#first}} {{{county}}} || {{{state_district}}} || {{{state}}} {{/first}}
{{{country}}}
`);
    });
  });

  describe('chooseTemplateText', () => {
    it('should use country address_template', () => {
      expect(addressFormatter._chooseTemplateText(
        { address_template: 'aa' },
        { road: 'aa', postcode: 123 }
      )).toBe('aa');
    });

    it('should use country fallback_template if not enough data is provided', () => {
      expect(addressFormatter._chooseTemplateText(
        { address_template: 'aa', fallback_template: 'fallback' },
        { }
      )).toBe('fallback');
    });

    it('should use default address_template if template does not have address_template', () => {
      expect(addressFormatter._chooseTemplateText(
        { },
        { road: 'aa', postcode: 123 }
      )).toBe(`{{{attention}}}
{{{house}}}
{{{road}}} {{{house_number}}}
{{{postcode}}} {{#first}} {{{town}}} || {{{city}}} || {{{village}}} || || {{{county}}} || {{{state}}} {{/first}}
{{{country}}}
`);
    });

    it('should use default fallback_template if not enough data is provided and template does not have fallback_template', () => {
      expect(addressFormatter._chooseTemplateText(
        { },
        { }
      )).toBe(`{{{attention}}}
{{{house}}}
{{{road}}} {{{house_number}}}
{{#first}} {{{suburb}}} || {{{city_district}}} || {{{neighbourhood}}} {{/first}}
{{#first}} {{{city}}} || {{{town}}} || {{{village}}} {{/first}}
{{#first}} {{{county}}} || {{{state_district}}} || {{{state}}} {{/first}}
{{{country}}}
`);
    });
  });

  describe('renderTemplate', () => {
    it('should render the appropriate template', () => {
      const render = addressFormatter._renderTemplate(
        {},
        { road: 'House' }
      );
      expect(render).toBe(`House
`);
    });

    it('should properly apply first modifier in a template', () => {
      const render = addressFormatter._renderTemplate(
        {},
        { city: 'City', village: 'Village' }
      );
      expect(render).toBe(`City
`);
    });

    it('should apply postformat_replace', () => {
      const render = addressFormatter._renderTemplate(
        { postformat_replace: [
          ['^House', 'Building'],
        ] },
        { road: 'House' }
      );
      expect(render).toBe(`Building
`);
    });

    it('should fallback to concatenation with empty output', () => {
      const render = addressFormatter._renderTemplate(
        { fallback_template: '' },
        { pub: 'House' }
      );
      expect(render).toBe(`House
`);
    });
  });

  describe('format', () => {
    it('should work for a full-fledged example', () => {
      const formatted = addressFormatter.format({
        city: 'Antwerp',
        city_district: 'Antwerpen',
        countryName: 'Belgium',
        countryCode: 'be',
        county: 'Antwerp',
        houseNumber: 63,
        neighbourhood: 'Sint-Andries',
        postcode: 2000,
        restaurant: 'Meat & Eat',
        road: 'Vrijheidstraat',
        state: 'Flanders',
      });
      expect(formatted).toBe(`Meat & Eat
Vrijheidstraat 63
2000 Antwerp
Belgium
`);
    });

    it('should work for a minimal example', () => {
      const formatted = addressFormatter.format({
        road: 'Vrijheidstraat',
      });
      expect(formatted).toBe(`Vrijheidstraat
`);
    });

    it('should allow to pass a country code as an option', () => {
      const formatted = addressFormatter.format({
        city: 'Antwerp',
        city_district: 'Antwerpen',
        country: 'Belgium',
        country_code: 'be',
        county: 'Antwerp',
        house_number: 63,
        neighbourhood: 'Sint-Andries',
        postcode: 2000,
        restaurant: 'Meat & Eat',
        road: 'Vrijheidstraat',
        state: 'Flanders',
      }, {
        countryCode: 'US',
      }
      );
      expect(formatted).toBe(`Meat & Eat
63 Vrijheidstraat
Antwerp, Flanders 2000
Belgium
`);
    });

    it('should return array if requested', () => {
      const formatted = addressFormatter.format({
        city: 'Antwerp',
        city_district: 'Antwerpen',
        country: 'Belgium',
        country_code: 'be',
        county: 'Antwerp',
        house_number: 63,
        neighbourhood: 'Sint-Andries',
        postcode: 2000,
        restaurant: 'Meat & Eat',
        road: 'Vrijheidstraat',
        state: 'Flanders',
      }, {
        countryCode: 'US',
        output: 'array',
      }
      );
      expect(formatted.length).toBe(4);
      expect(formatted[0]).toBe('Meat & Eat');
      expect(formatted[1]).toBe('63 Vrijheidstraat');
      expect(formatted[2]).toBe('Antwerp, Flanders 2000');
      expect(formatted[3]).toBe('Belgium');
    });

    it('should append country if requested', () => {
      const formatted = addressFormatter.format({
        city: 'Antwerp',
        city_district: 'Antwerpen',
        countryCode: 'be',
        county: 'Antwerp',
        house_number: 63,
        neighbourhood: 'Sint-Andries',
        postcode: 2000,
        restaurant: 'Meat & Eat',
        road: 'Vrijheidstraat',
        state: 'Flanders',
      }, {
        output: 'array',
        appendCountry: true,
      }
      );
      expect(formatted.length).toBe(4);
      expect(formatted[0]).toBe('Meat & Eat');
      expect(formatted[1]).toBe('Vrijheidstraat 63');
      expect(formatted[2]).toBe('2000 Antwerp');
      expect(formatted[3]).toBe('Belgium');
    });
  });
});
