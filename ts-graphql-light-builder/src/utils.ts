export const camelToSnakeCase = (text: string, toUpper = false) => {
  const result = text.split(/(?=[A-Z])/).join("_");

  return toUpper ? result.toUpperCase() : result.toLowerCase();
};
