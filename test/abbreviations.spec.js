/* eslint-disable camelcase */
import addressFormatter from '../src/index';

describe('abbreviations', () => {
  it('should abbrev US avenue', () => {
    expect(addressFormatter.format({
      country_code: 'US',
      house_number: '301',
      road: 'Hamilton Avenue',
      neighbourhood: 'Crescent Park',
      city: 'Palo Alto',
      postcode: '94303',
      county: 'Santa Clara County',
      state: 'California',
      country: 'United States'
    }, { abbreviate: true })).toBe(`301 Hamilton Ave
Palo Alto, CA 94303
United States of America
`);
  });

  it('should abbreviate US road', () => {
    expect(addressFormatter.format({
      country_code: 'US',
      house_number: '301',
      road: 'Northwestern University Road',
      neighbourhood: 'Crescent Park',
      city: 'Palo Alto',
      postcode: '94303',
      county: 'Santa Clara County',
      state: 'California',
      country: 'United States'
    }, { abbreviate: true })).toBe(`301 Northwestern University Rd
Palo Alto, CA 94303
United States of America
`);
  });

  it('should not panic when abbreviated component is not present', () => {
    expect(addressFormatter.format({
      country_code: 'US',
      house_number: '301',
      neighbourhood: 'Crescent Park',
      city: 'Palo Alto',
      postcode: '94303',
      county: 'Santa Clara County',
      state: 'California',
      country: 'United States'
    }, { abbreviate: true })).toBe(`301
Palo Alto, CA 94303
United States of America
`);
  });

  it('should not panic when abbreviation for a language is not present', () => {
    expect(addressFormatter.format({
      country_code: 'CH',
      house_number: '95',
      road: 'Jungfraustrasse',
      town: 'Interlaken',
      country: 'Switzerland'
    }, { abbreviate: true })).toBe(`Jungfraustrasse 95
Interlaken
Switzerland
`);
  });

  it('should abbreviate CA avenue', () => {
    expect(addressFormatter.format({
      city: 'Vancouver',
      country: 'Canada',
      country_code: 'ca',
      county: 'Greater Vancouver Regional District',
      postcode: 'V6K',
      road: 'Cornwall Avenue',
      state: 'British Columbia',
      suburb: 'Kitsilano'
    }, { abbreviate: true })).toBe(`Cornwall Ave
Vancouver, BC V6K
Canada
`);
  });

  it('should abbreviate ES carrer', () => {
    expect(addressFormatter.format({
      city: 'Barcelona',
      city_district: 'Sarrià - Sant Gervasi',
      country: 'Spain',
      country_code: 'es',
      county: 'BCN',
      house_number: '68',
      neighbourhood: 'Sant Gervasi',
      postcode: '08017',
      road: 'Carrer de Calatrava',
      state: 'Catalonia',
      suburb: 'les Tres Torres'
    }, { abbreviate: true })).toBe(`C Calatrava, 68
08017 Barcelona
Spain
`);
  });
});
