# JS Address formatter

[![Coverage Status](https://coveralls.io/repos/github/fragaria/address-formatter/badge.svg?branch=master)](https://coveralls.io/github/fragaria/address-formatter?branch=master)

Based on an amazing work of [OpenCage Data](https://github.com/OpenCageData/address-formatting/)
who collected so many international formats of postal addresses, this is a Javascript implementation
of that formatter.

This library can format almost anything that comes out of
Open Street Maps' [Nominatim API](https://wiki.openstreetmap.org/wiki/Nominatim)
in the `address` field. Other compatible sources of data 
such as [Photon](https://photon.komoot.de/) might be used as well.

It can automatically detect the country's
formatting customs, but allows you to *pick a specific country
format*. Furthermore, it allows you to abbreviate the common names,
such as `Avenue` or `Road`.

The formatting specification for the whole world is part of
the distribution package, there is currently no plan to prepare
smaller builds with limited area coverage.

## Installation & Usage

### Node

```sh
npm i @fragaria/address-formatter
```

```js
// import addressFormatter from '@fragaria/address-formatter';
const addressFormatter = require('@fragaria/address-formatter');

// Basic examples
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
/*
301 Hamilton Avenue
Palo Alto, CA 94303
United States of America
*/
const formattedWithAppendedCountry = addressFormatter.format({
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
/*
301 Hamilton Avenue
Palo Alto, CA 94303
United States of America
*/

// You can overwrite the country code incoming from the map service
const abbreviatedUkFormat = addressFormatter.format({
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
/*
301 Hamilton Ave
Palo Alto 94303
USA
*/

// You can use a fallback to keep the library working when the country code is wrong
const fallbackCountryCode = addressFormatter.format({
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
/*
301 Hamilton Ave
Palo Alto 94303
USA
*/

// You can get the address as a list of lines to make your formatting easier
const formattedAsLines = addressFormatter.format({
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
/*
[
  '301 Hamilton Avenue',
  'Palo Alto, CA 94303',
  'United States of America'
]
*/
```

### Direct use on webpage

```html
<script type="text/javascript" src="https://unpkg.com/@fragaria/address-formatter@latest"></script>
<script type="text/javascript">
  const formatted = window.addressFormatter.format({
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
  /*
  301 Hamilton Avenue
  Palo Alto, CA 94303
  United States of America
  */
</script>
```

## Development & Tests

```sh
$ git clone git@github.com:fragaria/address-formatter.git
$ cd address-formatter
# Install the proper NodeJS
$ nvm install
# Download the /OpenCageData/address-formatting/ spec
$ npm run pull-submodules
# Install dependencies
$ npm install
# Generate JS-friendly spec
$ npm run prepare-templates
# Run the tests
$ npm test
```

### Making a release

```sh
$ npm version X.Y.Z
$ git push origin master && git push origin vX.Y.Z
```

And the CI server takes care of the rest

# Help needed

All pull requests are definitely welcome. If an address
is badly formatted, submit PRs directly to the 
[original repository](https://github.com/OpenCageData/address-formatting/)
with a minimal localized test-case.

# Acknowledgments

Grat many thanks to these implementations:

- [Perl](https://github.com/OpenCageData/perl-Geo-Address-Formatter)
- [PHP](https://github.com/predicthq/address-formatter-php)
