export const camelToSnakeCase = (str: string, upper = false) => {
  const text = str.replace(/([a-z0-9])([A-Z])/g, "$1_$2");
  return upper ? text.toUpperCase() : text.toLowerCase();
};
