import { ParamTypeMapping } from "./types";
import { camelToSnakeCase } from "./utils";

type ComplexBuilderInit = (name: string) => SchemaBuilder<string>;

/** Abstract class for creating a schema. The entry must have only string keys */
export abstract class SchemaBuilder<EntryField extends string> {
  /** Set of simple fields used to build schema */
  protected _simple = new Set<EntryField>();

  /** Map[name, subfields] of complex fields used to build schema */
  protected _complex = new Map<EntryField, string>();

  /** Set of available simple field names that exist in the source schema */
  private readonly _originSimple: ReadonlySet<string>;

  /** Map[name, info] of available complex fields that exist in the source schema */
  private readonly _originComplex: ReadonlyMap<string, ComplexBuilderInit>;

  protected constructor(
    simpleFields: EntryField[] | Record<string, string>,
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

    this._originSimple = simpleSet;
    this._originComplex = complexMap;

    if (initFields?.length) {
      this.add(...initFields);
    } else {
      this.useSimpleOnly(false);
    }
  }

  /** Remove a field from builder if it exists in the origin schema */
  remove(field: EntryField): this {
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
   * Add complex field for schema builder if it available.
   * If complex field used before, it will be replaced.
   * @param builder Builder of complex field with a given set of subfields
   */
  addComplex(builder?: SchemaBuilder<string> | null): this {
    if (!builder?.name) {
      return this;
    }

    const init = this._originComplex.get(builder.name);
    if (init && builder.constructor === init(builder.name).constructor) {
      this._complex.set(builder.name as EntryField, builder.build());
    }

    return this;
  }

  /**
   * Set subfields to complex field
   * @param name Name of nested field
   * @param subfields Subfield of nested field
   */
  setSubfields(name: EntryField, ...subfields: string[]): this {
    const init = this._originComplex.get(name);
    if (init) {
      this.addComplex(init(name).set(...subfields));
    }
    return this;
  }

  /**
   * Set the same fields as in another builder
   * @param from Builder with same type
   * @returns builder with setted fields
   */
  copyFields(from?: this | null): this {
    if (!from) {
      return this.clear();
    }

    this.clear();

    for (const [field, schema] of from._complex) {
      if (this._originComplex.has(field)) {
        this._complex.set(field, schema);
      }
    }
    for (const field of from._simple) {
      if (this._originSimple.has(field)) {
        this._simple.add(field);
      }
    }

    return this;
  }

  /**
   * Get copy of complex field without settings
   * @param field The name of the complex field that must be in the source schema
   */
  getComplex<T extends SchemaBuilder<string>>(field: string) {
    const init = this._originComplex.get(field);
    if (init) {
      return init(field) as T;
    }

    return undefined;
  }

  /**
   * Set all available simple fields for use in the schema
   * @param includeSimpleForComplex For each complex field use simple subfields
   */
  useSimpleOnly(includeSimpleForComplex = false): this {
    this._simple = new Set(Array.from(this._originSimple as Set<EntryField>));
    this._complex.clear();
    if (includeSimpleForComplex) {
      for (const [field, init] of this._originComplex) {
        this.addComplex(init(field));
      }
    }

    return this;
  }

  /**
   * Add fields to schema.
   * If the field is complex, default fields will be setted.
   * @param fields added fields
   */
  add(...fields: EntryField[]): this {
    for (const field of fields) {
      const init = this._originComplex.get(field);
      if (init) {
        this.addComplex(init(field));
      } else if (this._originSimple.has(field)) {
        this._simple.add(field);
      }
    }

    return this;
  }

  /**
   * Use only the specified fields.
   * If the field is complex, default fields will be added.
   * @param fields added fields
   */
  set(...fields: EntryField[]): this {
    return this.clear().add(...fields);
  }

  /**
   * Build a schema with the provided fields and with or without the schema name
   * @param withName if false then dont add prefix with entry name
   * @returns GraphQL schema string with name or not
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
   * @param result Used for building schema result of script. May be as builder or string
   * @param params Mapping a schema field to a GraphQL type with ordering
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
