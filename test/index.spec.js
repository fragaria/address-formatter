/* eslint-disable camelcase */
const addressFormatter = require('../src/index');

describe('address-formatter', () => {
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
        state: 'Flanders'
      });
      expect(formatted).toBe(`Meat & Eat
Vrijheidstraat 63
2000 Antwerp
Belgium
`);
    });

    it('should work for a minimal example', () => {
      const formatted = addressFormatter.format({
        road: 'Vrijheidstraat'
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
        state: 'Flanders'
      }, {
        countryCode: 'US'
      }
      );
      expect(formatted).toBe(`Meat & Eat
63 Vrijheidstraat
Antwerp, Flanders 2000
Belgium
`);
    });

    it('should not crash on invalid country_code', () => {
      const formatted = addressFormatter.format({
        city: 'Antwerp',
        city_district: 'Antwerpen',
        country: 'Belgium',
        country_code: 'yu',
        county: 'Antwerp',
        house_number: 63,
        neighbourhood: 'Sint-Andries',
        postcode: 2000,
        restaurant: 'Meat & Eat',
        road: 'Vrijheidstraat',
        state: 'Flanders'
      });
      expect(formatted).toBe(`Meat & Eat
Vrijheidstraat 63
2000 Antwerp
Belgium
`);
    });

    it('should use a fallbackCountryCode when necessary', () => {
      const formattedWithFallback = addressFormatter.format({
        city: 'Antwerp',
        city_district: 'Antwerpen',
        country: 'Belgium',
        country_code: 'yu',
        county: 'Antwerp',
        house_number: 63,
        neighbourhood: 'Sint-Andries',
        postcode: 2000,
        restaurant: 'Meat & Eat',
        road: 'Vrijheidstraat',
        state: 'Flanders'
      }, {
        fallbackCountryCode: 'US'
      });
      expect(formattedWithFallback).toBe(`Meat & Eat
63 Vrijheidstraat
Antwerp, Flanders 2000
Belgium
`);
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
        state: 'Flanders'
      }, {
        fallbackCountryCode: 'US'
      });
      expect(formatted).toBe(`Meat & Eat
Vrijheidstraat 63
2000 Antwerp
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
        state: 'Flanders'
      }, {
        countryCode: 'US',
        output: 'array'
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
        state: 'Flanders'
      }, {
        output: 'array',
        appendCountry: true
      }
      );
      expect(formatted.length).toBe(4);
      expect(formatted[0]).toBe('Meat & Eat');
      expect(formatted[1]).toBe('Vrijheidstraat 63');
      expect(formatted[2]).toBe('2000 Antwerp');
      expect(formatted[3]).toBe('Belgium');
    });

    it('should should not replace the country if append is requested', () => {
      const formatted = addressFormatter.format({
        city: 'Antwerp',
        city_district: 'Antwerpen',
        countryCode: 'be',
        county: 'Antwerp',
        country: 'belgium',
        house_number: 63,
        neighbourhood: 'Sint-Andries',
        postcode: 2000,
        restaurant: 'Meat & Eat',
        road: 'Vrijheidstraat',
        state: 'Flanders'
      }, {
        output: 'array',
        appendCountry: true
      }
      );
      expect(formatted.length).toBe(4);
      expect(formatted[0]).toBe('Meat & Eat');
      expect(formatted[1]).toBe('Vrijheidstraat 63');
      expect(formatted[2]).toBe('2000 Antwerp');
      expect(formatted[3]).toBe('belgium');
    });

    it('should remove falsy values from input', () => {
      const formatted = addressFormatter.format({
        city: 'Berlin',
        countryCode: 'de',
        country: 'Germany',
        houseNumber: undefined,
        postcode: 10999,
        road: 'Glogauer Straße'
      }, {
        output: 'array'
      }
      );
      expect(formatted.length).toBe(3);
      expect(formatted[0]).toBe('Glogauer Straße');
      expect(formatted[1]).toBe('10999 Berlin');
      expect(formatted[2]).toBe('Germany');
    });

    it('should not clean postcode if option is set', () => {
      const formatted = addressFormatter.format({
        city: 'Berlin',
        countryCode: 'de',
        country: 'Germany',
        houseNumber: undefined,
        postcode: '10999,10999',
        road: 'Glogauer Straße'
      }, {
        output: 'array',
        cleanupPostcode: false
      }
      );
      expect(formatted.length).toBe(3);
      expect(formatted[0]).toBe('Glogauer Straße');
      expect(formatted[1]).toBe('10999,10999 Berlin');
      expect(formatted[2]).toBe('Germany');
    });
  });
});
