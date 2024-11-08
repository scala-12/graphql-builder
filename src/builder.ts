type BuilderInit = (name: string) => EntrySchemaBuilder<object>;

/** Abstract class for schema creation. Entry should has only string keys */
export abstract class EntrySchemaBuilder<Entry extends object> {
    /** Set of simple fields names in schema */
    protected _simple: Set<keyof Entry>;
    /** Map[name, subfields] of complex fields in schema */
    protected _complex: Map<keyof Entry, string>;
    /** set of available simple fields names */
    private _availableSimple?: ReadonlySet<string>;
    /** map[name, info] of available complex fields */
    private _availableComplex?: ReadonlyMap<string, BuilderInit>;

    /**
     * @param simpleFields array of available simple keys. may includes complex keys when complex setted
     */
    protected constructor(
        readonly schemaName: string,

        simpleFields: (keyof Entry)[],
        readonly entryName?: string,
        ...complex: [keyof Entry, BuilderInit][]
    ) {
        this._simple = new Set();
        this._complex = new Map();

        if (complex != null && complex.length !== 0) {
            this._availableComplex = new Map(
                complex.map(([field, builderInit]) => [field as string, builderInit]));
        }

        const fields = new Set(simpleFields as string[]);
        this._availableComplex?.forEach((_, field) => {
            fields.delete(field);
        });
        this._availableSimple = fields;


        if (this._availableSimple?.size === 0 && this._availableComplex?.size === 0) {
            throw new Error("Schema does not include fields");
        }

        this.useSimpleFields(false);
    }

    /** Delete simple or complex field from schema if exists */
    deleteField(field: keyof Entry): this {
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
    addComplex(builder?: EntrySchemaBuilder<any>): this {
        if (builder != null && builder.entryName) {
            if (this._availableComplex?.has(builder.entryName)) {
                // TODO check types before setting
                this._complex.set(
                    builder.entryName as keyof Entry,
                    builder.build());
            }
        }

        return this;
    };

    /** get copy of complex field without settings */
    getComplexBuilder<TComplex extends EntrySchemaBuilder<any>>(field: string) {
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
            this._availableSimple.forEach(
                e => this._simple.add(e as keyof Entry)
            );
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
    addFields(...fields: (keyof Entry)[]): this {
        enum FieldType {
            COMPLEX,
            SIMPLE,
            UNDEFINED
        }
        const groupedFields = fields.reduce(
            (acc, field) => {
                let key: FieldType | undefined;
                if (this._availableComplex?.has(field as string)) {
                    if (!this._complex.has(field)) {
                        key = FieldType.COMPLEX;
                    }
                } else if (this._availableSimple?.has(field as string)) {
                    key = FieldType.SIMPLE;
                }
                if (key == null) {
                    key = FieldType.UNDEFINED;
                }
                acc[key].push(field);

                return acc;
            },
            {
                [FieldType.COMPLEX]: [] as (keyof Entry)[],
                [FieldType.SIMPLE]: [] as (keyof Entry)[],
                [FieldType.UNDEFINED]: [] as (keyof Entry)[]
            }
        );

        groupedFields[FieldType.COMPLEX].forEach(e => {
            const builderInit = this._availableComplex?.get(e as string);
            if (builderInit != null) {
                this.addComplex(
                    builderInit(e as string)
                );
            }
        });

        groupedFields[FieldType.SIMPLE].forEach(e => this._simple.add(e));

        return this;
    };

    /**
     * clear old fields and add new to schema.
     * If added complex field, then all subfields will be added
     * @param fields added fields
     */
    setFields(...fields: (keyof Entry)[]): this {
        this.clearFields()
        return this.addFields(...fields);
    };

    /**
     * build schema with setted fields
     * @param withEntryName if false then dont add prefix with entry name
     * @returns gql script string
     */
    build(withEntryName = true): string {
        const simpleFields = Array.from(this._simple.values()) as string[];
        const complexFields = Array.from(this._complex.values());
        const fields = simpleFields.concat(complexFields);

        const fieldsSchema = fields.length ? `{${simpleFields.concat(complexFields).join(' ')}}` : '';

        return (withEntryName ? (this.entryName + ' ') : '') + fieldsSchema;
    }
}
