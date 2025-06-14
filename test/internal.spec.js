/* eslint-disable camelcase */
import * as addressFormatterInternals from '../src/internal';

describe('address-formatter', () => {
  describe('determineCountryCode', () => {
    it('should put country code to uppercase', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'cz'
      });
      expect(converted).toHaveProperty('country_code', 'CZ');
    });

    it('should not modify strange input', () => {
      let converted = addressFormatterInternals.determineCountryCode({
        country_code: 'czx'
      });
      expect(converted).toHaveProperty('country_code', 'czx');
      converted = addressFormatterInternals.determineCountryCode({});
      expect(converted).not.toHaveProperty('country_code');
    });

    it('should convert UK country_code to GB', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'UK'
      });
      expect(converted).toHaveProperty('country_code', 'GB');
    });

    it('should apply use_country', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'LI'
      });
      expect(converted).toHaveProperty('country_code', 'CH');
    });

    it('should apply change_country', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'MF',
        country: 'Collectivité de Saint-Martin'
      });
      expect(converted).toHaveProperty('country_code', 'FR');
      expect(converted).toHaveProperty('country', 'France');
    });

    it('should replace component name if that is present', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country: 'Saint Helena, Ascension and Tristan da Cunha',
        country_code: 'sh',
        state: 'Saint Helena'
      });
      expect(converted).toHaveProperty('country', 'Saint Helena, United Kingdom');
    });

    it('should replace component name if that is not present', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country: 'Saint Helena, Ascension and Tristan da Cunha',
        country_code: 'sh'
      });
      expect(converted).toHaveProperty('country', ', United Kingdom');
    });

    it('should convert Sint Maarten to SX country code', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'NL',
        state: 'Sint Maarten'
      });
      expect(converted).toHaveProperty('country_code', 'SX');
    });

    it('should convert Curaçao to CW country code', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'NL',
        state: 'Curaçao'
      });
      expect(converted).toHaveProperty('country_code', 'CW');
    });

    it('should convert Aruba to AW country code', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'NL',
        state: 'Aruba'
      });
      expect(converted).toHaveProperty('country_code', 'AW');
    });

    it('should do nothing for NL if no special case is met', () => {
      const converted = addressFormatterInternals.determineCountryCode({
        country_code: 'NL',
        state: 'Not A-ruba'
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
        ['countryCode', 'country_code']
      ];

      for (let i = 0; i < mapping.length; i++) {
        const converted = addressFormatterInternals.normalizeComponentKeys({ [mapping[i][0]]: 'string' });
        expect(converted).toHaveProperty(mapping[i][1]);
        expect(converted).not.toHaveProperty(mapping[i][0]);
        expect(converted).not.toHaveProperty('attention');
      }
    });
  });

  describe('applyAliases', () => {
    it('should apply aliases', () => {
      const converted = addressFormatterInternals.applyAliases({
        street_number: 123
      });
      expect(converted).toHaveProperty('house_number', 123);
    });

    it('should apply alias for a housenumber', () => {
      const converted = addressFormatterInternals.applyAliases({
        housenumber: '1234'
      }, [], { abbreviate: true });
      expect(converted).toHaveProperty('house_number', '1234');
    });

    it('should not overwrite aliases', () => {
      const converted = addressFormatterInternals.applyAliases({
        street_number: 123,
        house_number: 456
      });
      expect(converted).toHaveProperty('house_number', 456);
    });

    it('should not use special state_district alias for some countries', () => {
      const converted = addressFormatterInternals.applyAliases({
        country_code: 'br',
        neighbourhood: 123
      });
      expect(converted).not.toHaveProperty('district');
      expect(converted).not.toHaveProperty('state_district');
    });

    it('should use special state_district alias for some countries', () => {
      const converted = addressFormatterInternals.applyAliases({
        district: 123
      });
      expect(converted).toHaveProperty('state_district', 123);
      expect(converted).toHaveProperty('district', 123);
    });
  });

  describe('getStateCode', () => {
    it('should return state code', () => {
      expect(addressFormatterInternals.getStateCode('Alabama', 'US')).toBe('AL');
    });

    it('should return nothing when country has no state codes', () => {
      expect(addressFormatterInternals.getStateCode('Pardubice', 'CZ')).toBe(undefined);
    });

    it('should return nothing when state is not found', () => {
      expect(addressFormatterInternals.getStateCode('Husky', 'US')).toBe(undefined);
    });
  });

  describe('getCountyCode', () => {
    it('should return county code', () => {
      expect(addressFormatterInternals.getCountyCode('Alessandria', 'IT')).toBe('AL');
    });

    it('should return nothing when country has no county codes', () => {
      expect(addressFormatterInternals.getCountyCode('Pardubice', 'CZ')).toBe(undefined);
    });

    it('should return nothing when county is not found', () => {
      expect(addressFormatterInternals.getCountyCode('Calcio', 'IT')).toBe(undefined);
    });
  });

  describe('cleanupInput', () => {
    it('should replace country with state if country is numeric', () => {
      const converted = addressFormatterInternals.cleanupInput({
        country: 123,
        state: 'Slovakia'
      });
      expect(converted).toHaveProperty('country', 'Slovakia');
    });

    it('should determine state code from state if possible', () => {
      const converted = addressFormatterInternals.cleanupInput({
        state: 'Alabama',
        country_code: 'US'
      });
      expect(converted).toHaveProperty('state_code', 'AL');
    });

    it('should cleanup for Washington D.C.', () => {
      const converted = addressFormatterInternals.cleanupInput({
        state: 'Washington D.C.',
        country_code: 'US'
      });
      expect(converted).toHaveProperty('state_code', 'DC');
      expect(converted).toHaveProperty('state', 'District of Columbia');
      expect(converted).toHaveProperty('city', 'Washington');
    });

    it('should determine county code from county if possible', () => {
      const converted = addressFormatterInternals.cleanupInput({
        county: 'Alessandria',
        country_code: 'IT'
      });
      expect(converted).toHaveProperty('county_code', 'AL');
    });

    it('should put together attention from unknown components', () => {
      const converted = addressFormatterInternals.cleanupInput({
        pub: 'Pub',
        name: 'Henry',
        country_code: 'IT'
      });
      expect(converted).toHaveProperty('attention', 'Pub, Henry');
    });

    it('should drop lengthy post codes', () => {
      const converted = addressFormatterInternals.cleanupInput({
        postcode: 'abcdefghijklmnopqrstuvwxyz'
      });
      expect(converted).not.toHaveProperty('postcode');
    });

    it('should drop post codes separated by ;', () => {
      const converted = addressFormatterInternals.cleanupInput({
        postcode: '1234;5678'
      });
      expect(converted).not.toHaveProperty('postcode');
    });

    it('should pick the first from post codes separated by ,', () => {
      const converted = addressFormatterInternals.cleanupInput({
        postcode: '12345,56789'
      });
      expect(converted).toHaveProperty('postcode', '12345');
    });

    it('should convert postcode to a string', () => {
      const converted = addressFormatterInternals.cleanupInput({
        postcode: 123456
      });
      expect(converted).toHaveProperty('postcode', '123456');
    });

    it('should drop anything that looks like url', () => {
      const converted = addressFormatterInternals.cleanupInput({
        pub: 'http://google.com',
        street: 'https://google.com'
      });
      expect(converted).not.toHaveProperty('pub');
      expect(converted).not.toHaveProperty('street');
    });

    it('should apply replacements', () => {
      const converted = addressFormatterInternals.cleanupInput({
        stadt: 'Stadtteil Hamburg',
        city: 'Alt-Berlin',
        place: 'Alt-Berlin',
        platz: 'Bonn'
      }, [
        ['^Stadtteil ', ''],
        ['city=Alt-Berlin', 'Berlin'],
        ['platz=Alt-Berlin', 'Berlin']
      ]);
      expect(converted).toHaveProperty('stadt', 'Hamburg');
      expect(converted).toHaveProperty('city', 'Berlin');
      expect(converted).toHaveProperty('place', 'Alt-Berlin');
      expect(converted).toHaveProperty('platz', 'Bonn');
    });

    it('should apply abbreviations', () => {
      const converted = addressFormatterInternals.cleanupInput({
        stadt: 'Stadtteil Hamburg',
        city: 'Alt-Berlin',
        place: 'Alt-Berlin',
        platz: 'Bonn'
      }, [], { abbreviate: true });
      expect(converted).toHaveProperty('platz', 'Bonn');
    });
  });

  describe('findTemplate', () => {
    it('should pick country template', () => {
      expect(addressFormatterInternals.findTemplate({ country_code: 'DO' })).toHaveProperty('postformat_replace.length', 1);
    });
    it('should fallback to default', () => {
      expect(addressFormatterInternals.findTemplate({ country_code: 'XX' })).toHaveProperty('fallback_template', `{{{attention}}}
{{{house}}}
{{{road}}} {{{house_number}}}
{{{place}}}
{{#first}} {{{suburb}}} || {{{city_district}}} || {{{neighbourhood}}} || {{{island}}} {{/first}}
{{#first}} {{{city}}} || {{{town}}} || {{{village}}} || {{{hamlet}}} || {{{municipality}}} {{/first}}
{{#first}} {{{county}}} || {{{state_district}}} || {{{state}}} || {{{region}}} || {{{island}}}, {{{archipelago}}} {{/first}}
{{{country}}}
`);
    });
  });

  describe('chooseTemplateText', () => {
    it('should use country address_template', () => {
      expect(addressFormatterInternals.chooseTemplateText(
        { address_template: 'aa' },
        { road: 'aa', postcode: 123 }
      )).toBe('aa');
    });

    it('should use country fallback_template if not enough data is provided', () => {
      expect(addressFormatterInternals.chooseTemplateText(
        { address_template: 'aa', fallback_template: 'fallback' },
        { }
      )).toBe('fallback');
    });

    it('should use default address_template if template does not have address_template', () => {
      expect(addressFormatterInternals.chooseTemplateText(
        { },
        { road: 'aa', postcode: 123 }
      )).toBe(`{{{attention}}}
{{{house}}}
{{#first}} {{{road}}} || {{{place}}} || {{{hamlet}}} {{/first}} {{{house_number}}}
{{{postcode}}} {{#first}} {{{postal_city}}} || {{{town}}} || {{{city}}} || {{{village}}} || {{{municipality}}} || {{{hamlet}}} || {{{county}}} || {{{state}}} {{/first}}
{{{archipelago}}}
{{{country}}}
`);
    });

    it('should use default fallback_template if not enough data is provided and template does not have fallback_template', () => {
      expect(addressFormatterInternals.chooseTemplateText(
        { },
        { }
      )).toBe(`{{{attention}}}
{{{house}}}
{{{road}}} {{{house_number}}}
{{{place}}}
{{#first}} {{{suburb}}} || {{{city_district}}} || {{{neighbourhood}}} || {{{island}}} {{/first}}
{{#first}} {{{city}}} || {{{town}}} || {{{village}}} || {{{hamlet}}} || {{{municipality}}} {{/first}}
{{#first}} {{{county}}} || {{{state_district}}} || {{{state}}} || {{{region}}} || {{{island}}}, {{{archipelago}}} {{/first}}
{{{country}}}
`);
    });
  });

  describe('renderTemplate', () => {
    it('should render the appropriate template', () => {
      const render = addressFormatterInternals.renderTemplate(
        {},
        { road: 'House' }
      );
      expect(render).toBe(`House
`);
    });

    it('should properly apply first modifier in a template', () => {
      const render = addressFormatterInternals.renderTemplate(
        {},
        { city: 'City', village: 'Village' }
      );
      expect(render).toBe(`City
`);
    });

    it('should apply postformat_replace', () => {
      const render = addressFormatterInternals.renderTemplate(
        {
          postformat_replace: [
            ['^House', 'Building']
          ]
        },
        { road: 'House' }
      );
      expect(render).toBe(`Building
`);
    });

    it('should fallback to concatenation with empty output', () => {
      const render = addressFormatterInternals.renderTemplate(
        { fallback_template: '' },
        { pub: 'House' }
      );
      expect(render).toBe(`House
`);
    });
  });
});
