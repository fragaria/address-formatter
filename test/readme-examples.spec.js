/* eslint-disable camelcase */
import addressFormatter from '../src/index';

describe('Examples from README.md', () => {
  describe('Basic examples', () => {
    it('first', () => {
      const formatted = addressFormatter.format({
        "houseNumber": 301,
        "road": "Hamilton Avenue",
        "neighbourhood": "Crescent Park",
        "city": "Palo Alto",
        "postcode": 94303,
        "county": "Santa Clara County",
        "state": "California",
        "country": "United States of America",
        "countryCode": "US",
      });

      expect(formatted).toBe(
`301 Hamilton Avenue
Palo Alto, CA 94303
United States of America
`);
    });

    it('second', () => {
      const format = addressFormatter.format({
        "houseNumber": 301,
        "road": "Hamilton Avenue",
        "neighbourhood": "Crescent Park",
        "city": "Palo Alto",
        "postcode": 94303,
        "county": "Santa Clara County",
        "state": "California",
        "countryCode": "US",
      }, {
        appendCountry: true
      });
      expect(format).toBe(
`301 Hamilton Avenue
Palo Alto, CA 94303
United States of America
`
      );
    });
  })

  it('You can overwrite the country code incoming from the map service', () => {
    const format = addressFormatter.format({
      "houseNumber": 301,
      "road": "Hamilton Avenue",
      "neighbourhood": "Crescent Park",
      "city": "Palo Alto",
      "postcode": 94303,
      "county": "Santa Clara County",
      "state": "California",
      "country": "United States of America",
      "countryCode": "US",
    }, {
      abbreviate: true,
      countryCode: 'UK'
    });

    expect(format).toBe(
`301 Hamilton Ave
Palo Alto 94303
USA
`
    );
  });

  it('You can use a fallback to keep the library working when the country code is wrong', () => {
    const format = addressFormatter.format({
      "houseNumber": 301,
      "road": "Hamilton Avenue",
      "neighbourhood": "Crescent Park",
      "city": "Palo Alto",
      "postcode": 94303,
      "county": "Santa Clara County",
      "state": "California",
      "country": "United States of America",
      "countryCode": "yu",
    }, {
      abbreviate: true,
      fallbackCountryCode: 'UK'
    });
    expect(format).toBe(
`301 Hamilton Ave
Palo Alto 94303
USA
`
    );
  });

  it('You can get the address as a list of lines to make your formatting easier', () => {
    const format = addressFormatter.format({
      "houseNumber": 301,
      "road": "Hamilton Avenue",
      "neighbourhood": "Crescent Park",
      "city": "Palo Alto",
      "postcode": 94303,
      "county": "Santa Clara County",
      "state": "California",
      "country": "United States of America",
      "countryCode": "US",
    }, {
      output: 'array'
    });

    expect(format).toEqual([
      '301 Hamilton Avenue',
      'Palo Alto, CA 94303',
      'United States of America'
    ]);
  });
});