import { EnumValue, ParamTypeMapping } from "./types";
import { camelToSnakeCase } from "./utils";

type ComplexBuilderInit = (name: string) => SchemaBuilder<string>;

/**
 * Abstract class for building GraphQL schemas.
 * Supports simple and complex (nested) fields.
 */
export abstract class SchemaBuilder<EntryField extends string> {
  /** Set of simple fields used to build schema */
  protected _simple = new Set<EnumValue<EntryField>>();

  /** Map[name, subfields] of complex fields used to build schema */
  protected _complex = new Map<EnumValue<EntryField>, string>();

  /** Set of available simple field names that exist in the source schema */
  readonly #originSimple: ReadonlySet<EnumValue<EntryField>>;

  /** Map[name, info] of available complex fields that exist in the source schema */
  readonly #originComplex: ReadonlyMap<EnumValue<EntryField>, ComplexBuilderInit>;

  protected constructor(
    simpleFields: EnumValue<EntryField>[] | Record<string, EnumValue<EntryField>>,
    readonly name: string | null = "",
    initFields?: EntryField[] | null,
    ...complexInfo: [EntryField, ComplexBuilderInit][]
  ) {
    const simpleSet = new Set(Array.isArray(simpleFields) ? simpleFields : Object.values(simpleFields));
    const complexMap = new Map(complexInfo);

    // remove simple fields from  complex
    for (const field of complexMap.keys()) {
      simpleSet.delete(field);
    }

    if (simpleSet.size === 0 && complexMap.size === 0) {
      throw new Error(`SchemaBuilder${name ? `(${name})` : ""} has no defined fields`);
    }

    this.#originSimple = simpleSet;
    this.#originComplex = complexMap;

    if (initFields?.length) {
      this.add(...initFields);
    } else {
      this.useSimpleOnly(false);
    }
  }

  /** Remove a field from builder if it exists in the origin schema */
  remove(field: EnumValue<EntryField>): this {
    this._complex.delete(field);
    this._simple.delete(field);

    return this;
  }

  /** Remove all fields from builder */
  clear(): this {
    this._complex.clear();
    this._simple.clear();

    return this;
  }

  /**
   * Add complex field builder
   * If complex field used before, it will be replaced.
   */
  addComplex(builder?: SchemaBuilder<string> | null): this {
    if (!builder?.name) {
      return this;
    }

    const field = builder.name as EntryField;
    const init = this.#originComplex.get(field);
    if (init && builder instanceof init(field).constructor) {
      this._complex.set(field, builder.build());
    }

    return this;
  }

  /** Set nested subfields for complex field */
  setSubfields(name: EnumValue<EntryField>, ...subfields: string[]): this {
    const init = this.#originComplex.get(name);
    if (init) {
      this.addComplex(init(name).set(...subfields));
    }
    return this;
  }

  /** Copy fields from another builder */
  copyFields(from?: this | null): this {
    if (!from) {
      return this.clear();
    }

    this.clear();

    for (const [field, schema] of from._complex) {
      if (this.#originComplex.has(field)) {
        this._complex.set(field, schema);
      }
    }
    for (const field of from._simple) {
      if (this.#originSimple.has(field)) {
        this._simple.add(field);
      }
    }

    return this;
  }

  getComplex<T extends SchemaBuilder<string>>(field: EnumValue<EntryField>): T;
  getComplex<T extends SchemaBuilder<string>>(field: string): T | undefined;
  /** Get complex field builder */
  getComplex<T extends SchemaBuilder<string>>(field: string): T | undefined {
    const init = this.#originComplex.get(field as EntryField);
    if (init) {
      return init(field) as T;
    }

    return undefined;
  }

  /**
   * Use only simple fields
   * @param includeSimpleForComplex use simple subfields for complex
   */
  useSimpleOnly(includeSimpleForComplex = false): this {
    this._simple = new Set(this.#originSimple);
    this._complex.clear();
    if (includeSimpleForComplex) {
      for (const [field, init] of this.#originComplex) {
        this.addComplex(init(field));
      }
    }

    return this;
  }

  /** Add fields (simple or complex) */
  add(...fields: EnumValue<EntryField>[]): this {
    for (const field of fields) {
      const init = this.#originComplex.get(field);
      if (init) {
        this.addComplex(init(field));
      } else if (this.#originSimple.has(field)) {
        this._simple.add(field);
      }
    }

    return this;
  }

  /** Replace current fields */
  set(...fields: EnumValue<EntryField>[]): this {
    return this.clear().add(...fields);
  }

  hasField(field: string): boolean {
    return this.#originSimple.has(field as EntryField) || this.#originComplex.has(field as EntryField);
  }

  /**
   * Build GraphQL schema string
   * @param withName if false then don't add prefix with entry name
   */
  build(withName = true): string {
    const parts = [...this._simple, ...this._complex.values()];
    if (parts.length === 0) {
      if (!(withName && this.name)) {
        return "";
      }
      return this.name;
    }

    const content = `{ ${parts.join(" ")} }`;

    return (withName && this.name ? `${this.name} ` : "") + content;
  }

  /** Create name of operation based on script name */
  static createOperationName(name: string): string {
    return camelToSnakeCase(name, true);
  }

  /**
   * Create script as query or mutation
   * @param result Used for building schema result of script. May be builder or string
   * @param params Mapping schema field to GraphQL type
   */
  static createScript(
    type: "query" | "mutation",
    name: string,
    result?: SchemaBuilder<string> | string | null,
    ...params: ParamTypeMapping[]
  ): string {
    const args = params.map(([key]) => `${key}: $${key}`).join(", ");

    const argSection = args ? `(${args})` : "";
    const resultSection = !result ? "" : typeof result === "string" ? result : result.build(false);

    const paramDefs = params.map(([key, type]) => `$${key}: ${type ?? "String!"}`).join(", ");

    const opName = SchemaBuilder.createOperationName(name);

    return `${type} ${opName}${paramDefs ? `(${paramDefs})` : ""} {${name}${argSection} ${resultSection}}`;
  }
}
