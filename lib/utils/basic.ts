const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const appendSchema = (s: string) => s.endsWith('Schema') ? s : `${s}Schema`;
const normalizeTitle = (s: string) => s.replace(/ /g, "");

export { capitalize, appendSchema , normalizeTitle }