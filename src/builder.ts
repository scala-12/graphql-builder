export class CustomSchemaBuilder {
    /** Set of simple fields names in schema */
    protected _simple: Set<string>;
    /** Map[name, subfields] of complex fields in schema */
    protected _complex: Map<string, string>;

    constructor(
        readonly entryName = ''
    ) {
        this._simple = new Set();
        this._complex = new Map();
    }

    /** Delete simple or complex field from schema if exists */
    deleteField(field: string): this {
        this._complex.delete(field);
        this._simple.delete(field);

        return this;
    }

    clearFields(): this {
        this._complex = new Map();
        this._simple = new Set();

        return this;
    }

    /**
     * Set complex field builder for schema
     * @param builder Prepared builder
     */
    addComplex(builder?: CustomSchemaBuilder): this {
        if (builder != null) {
            this._complex.set(
                builder.entryName,
                builder.build());
        }

        return this;
    };

    /** Add fields to schema */
    addFields(...fields: string[]): this {
        fields.forEach(e => this._simple.add(e));
        return this;
    };

    /**
     * build schema with setted fields
     * @param withEntryName if false then dont add prefix with entry name
     * @returns gql script string
     */
    build(withEntryName = true): string {
        const simpleFields = Array.from(this._simple.values());
        const complexFields = Array.from(this._complex.values());
        const fields = simpleFields.concat(complexFields);

        const fieldsSchema = fields.length ? `{${simpleFields.concat(complexFields).join(' ')}}` : '';

        return (withEntryName ? (this.entryName + ' ') : '') + fieldsSchema;
    }
}

export type BuilderInit = (name: string) => EntrySchemaBuilder<any>;

export abstract class EntrySchemaBuilder<FieldEnum extends string> extends CustomSchemaBuilder {
    /** set of available simple fields names */
    private _availableSimple?: ReadonlySet<FieldEnum>;
    /** map[name, info] of available complex fields */
    private _availableComplex?: ReadonlyMap<FieldEnum, BuilderInit>;

    /**
     * @param fields Object or array of available fields. complex fields not required here
     */
    protected constructor(
        readonly schemaName: string,

        fields: object,
        entryName?: string,
        ...complex: [FieldEnum, BuilderInit][]
    ) {
        super(entryName);
        const availableSimple = new Set(
            Array.isArray(fields) ?
                fields
                : Object.values(fields));
        if (availableSimple.size === 0) {
            throw new Error("Schema does not include fields");
        }

        if (complex != null && complex.length !== 0) {
            this._availableComplex = new Map(
                complex.map(([field, builderInit]) => [field, builderInit]));
        }

        this._availableComplex?.forEach((_, field) => {
            availableSimple.delete(field);
        });

        this._availableSimple = availableSimple;

        this.useSimpleFields(false);
    }

    override addComplex(builder?: EntrySchemaBuilder<any>): this {
        if (builder != null) {
            if (this._availableComplex?.has(builder.entryName as FieldEnum)) {
                // TODO check types before setting
                return super.addComplex(builder);
            }
        }

        return this;
    };

    /** get copy of complex field without settings */
    getComplexBuilder<TComplex extends EntrySchemaBuilder<any>>(field: FieldEnum) {
        const builderInit = this._availableComplex?.get(field);
        if (builderInit != null) {
            return (builderInit(field) as TComplex);
        }
    }

    /**
     * all available fields will be used in the schema
     * @param withComplex use simple fields for each complex child
     */
    useSimpleFields(withComplex = false): this {
        if (this._availableSimple != null) {
            this._simple.clear();
            this._availableSimple.forEach(e => this._simple.add(e));
        }
        if (this._availableComplex != null) {
            this._complex.clear();
            if (withComplex) {
                this._availableComplex.forEach((builderInit, field) =>
                    this.addComplex(
                        builderInit(field)
                    )
                );
            }
        }

        return this;
    }

    /**
     * Add fields to schema.
     * If added complex field, then all subfields will be added
     * @param fields added fields
     */
    override addFields(...fields: FieldEnum[]): this {
        enum FieldType {
            COMPLEX,
            SIMPLE,
            UNDEFINED
        }
        const groupedFields = fields.reduce(
            (acc, field) => {
                let key: FieldType | undefined;
                if (this._availableComplex?.has(field)) {
                    if (!this._complex.has(field)) {
                        key = FieldType.COMPLEX;
                    }
                } else if (this._availableSimple?.has(field)) {
                    key = FieldType.SIMPLE;
                }
                if (key == null) {
                    key = FieldType.UNDEFINED;
                }
                acc[key].push(field);

                return acc;
            },
            {
                [FieldType.COMPLEX]: [] as FieldEnum[],
                [FieldType.SIMPLE]: [] as FieldEnum[],
                [FieldType.UNDEFINED]: [] as FieldEnum[]
            }
        );

        groupedFields[FieldType.COMPLEX].forEach(e => {
            const builderInit = this._availableComplex?.get(e);
            if (builderInit != null) {
                this.addComplex(builderInit(e));
            }
        });

        return super.addFields(...groupedFields[FieldType.SIMPLE]);
    };

    /**
     * clear old fields and add new to schema.
     * If added complex field, then all subfields will be added
     * @param fields added fields
     */
    setFields(...fields: FieldEnum[]): this {
        this.clearFields()
        return this.addFields(...fields);
    };
}
