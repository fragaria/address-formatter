export function format(input: object, options?: {
    abbreviate?: boolean;
    appendCountry?: boolean;
    cleanupPostcode?: boolean;
    countryCode?: string;
    fallbackCountryCode?: string;
    output?: 'string' | 'array';
}): string | string[];
