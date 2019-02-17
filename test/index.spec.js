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
      expect(converted).toHaveProperty('state', 'Marsall Islands'); // sic
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

  xdescribe('cleanupInput', () => {});

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

  xdescribe('cleanupRender', () => {});
  xdescribe('renderTemplate', () => {});
});
