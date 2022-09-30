declare namespace addressFormatter {

    type AttentionInputType = 'attention';

    type PrimaryInputTypes =
        | 'archipelago'
        | 'city'
        | 'continent'
        | 'country'
        | 'countryCode'
        | 'county'
        | 'hamlet'
        | 'house'
        | 'houseNumber'
        | 'island'
        | 'municipality'
        | 'neighbourhood'
        | 'postalCity'
        | 'postcode'
        | 'region'
        | 'road'
        | 'state'
        | 'stateDistrict'
        | 'village';

    type AliasInputTypes =
        | 'allotments'
        | 'borough'
        | 'building'
        | 'cityBlock'
        | 'cityDistrict'
        | 'commercial'
        | 'countryName'
        | 'countyCode'
        | 'croft'
        | 'department'
        | 'district'
        | 'farmland'
        | 'footway'
        | 'housenumber'
        | 'houses'
        | 'industrial'
        | 'isolatedDwelling'
        | 'localAdministrativeArea'
        | 'locality'
        | 'partialPostcode'
        | 'path'
        | 'pedestrian'
        | 'place'
        | 'postcode'
        | 'province'
        | 'publicBuilding'
        | 'quarter'
        | 'residential'
        | 'roadReference'
        | 'roadReferenceIntl'
        | 'square'
        | 'stateCode'
        | 'street'
        | 'streetName'
        | 'streetNumber'
        | 'subcounty'
        | 'subdistrict'
        | 'subdivision'
        | 'suburb'
        | 'town'
        | 'township'
        | 'ward';

    type Input = Partial<Record<AttentionInputType | PrimaryInputTypes | AliasInputTypes, string>>;

    interface CommonOptions {
        abbreviate?: boolean;
        appendCountry?: boolean;
        cleanupPostcode?: boolean;
        countryCode?: string;
        fallbackCountryCode?: string;
    }

    export function format(
        input: Input,
        options?: CommonOptions & { output?: 'string' },
    ): string;

    export function format(
        input: Input,
        options: CommonOptions & { output: 'array' },
    ): string[];
}

export = addressFormatter;