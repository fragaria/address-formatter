type Format=FormatToArray|FormatToString

type  options={
    abbreviate?: boolean;
    appendCountry?: boolean;
    cleanupPostcode?: boolean;
    countryCode?: string;
    fallbackCountryCode?: string;
}
type FormatToArray=(input: object, options?: options &{
    output?: 'array'
})=>  string[];

type FormatToString=(input: object, options?: options & {
    output?: 'string';
})=>  string;


declare let format: Format;

export default format;
