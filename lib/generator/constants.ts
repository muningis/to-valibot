export const customRules = ['uniqueItems', 'not', 'contains', 'minContains', 'maxContains', 'propertyNames', 'patternProperties'] as const;
export type CustomRules = (typeof customRules)[number];
