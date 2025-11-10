import { SchemaBuilder } from "./schema-builder";

const camelToSnakeCase = (str: string, upper = false) => {
  const text = str.replace(/([a-z0-9])([A-Z])/g, "$1_$2");
  return upper ? text.toUpperCase() : text.toLowerCase();
};

/** Create name of operation based on script name */
export const createOperationName = (name: string): string => {
  return camelToSnakeCase(name, true);
};

/**
 * Create script as query or mutation
 * @param type Script type: mutation or query
 * @param name Script name
 * @param schema (Optional) Used for building schema script result. May be builder or string
 * @param argsTyping (Optional) Mapping schema args to GraphQL type
 */
export const createScript = (
  type: "query" | "mutation",
  name: string,
  schema?: SchemaBuilder<string> | string | null,
  argsTyping: Record<string, string> = {},
): string => {
  const argsEntries = Object.entries(argsTyping);
  const args = argsEntries.map(([key]) => `${key}: $${key}`).join(", ");

  const argSection = args ? `(${args})` : "";
  const resultSection = !schema ? "" : typeof schema === "string" ? schema : schema.build(false);

  const paramDefs = argsEntries.map(([key, type]) => `$${key}: ${type ?? "String!"}`).join(", ");

  const opName = createOperationName(name);

  return `${type} ${opName}${paramDefs ? `(${paramDefs})` : ""} {${name}${argSection} ${resultSection}}`;
};
