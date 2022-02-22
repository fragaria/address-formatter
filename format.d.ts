type Format=FormatToArray|FormatToString

type FormatToArray=(input: object, options?: {
    abbreviate?: boolean;
    appendCountry?: boolean;
    cleanupPostcode?: boolean;
    countryCode?: string;
    fallbackCountryCode?: string;
    output?: 'array';
})=>  string[];

type FormatToString=(input: object, options?: {
    abbreviate?: boolean;
    appendCountry?: boolean;
    cleanupPostcode?: boolean;
    countryCode?: string;
    fallbackCountryCode?: string;
    output?: 'string';
})=>  string;


declare let format: Format;

export default format;
