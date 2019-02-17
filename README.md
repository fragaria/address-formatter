# JS Address formatter

[![Greenkeeper badge](https://badges.greenkeeper.io/fragaria/address-formatter.svg)](https://greenkeeper.io/)
[![Coverage Status](https://coveralls.io/repos/github/fragaria/address-formatter/badge.svg?branch=master)](https://coveralls.io/github/fragaria/address-formatter?branch=master)
[![Build Status](https://travis-ci.org/fragaria/address-formatter.svg?branch=master)](https://travis-ci.org/fragaria/address-formatter)

Based on an amazing work of [OpenCage Data](https://github.com/OpenCageData/address-formatting/)
who collected so many international formats of postal addresses, this is a Javascript implementation
of that formatter.

## Installation

TBD

## Usage

TBD

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

All pull requests are definitely welcome. If an address
is badly formatted, submit PRs directly to the 
[original repository](https://github.com/OpenCageData/address-formatting/)
with a minimal localized test-case.

# Acknowledgments

Grat many thanks to these implementations:

- [Perl](https://github.com/OpenCageData/perl-Geo-Address-Formatter)
- [PHP](https://github.com/predicthq/address-formatter-php)
