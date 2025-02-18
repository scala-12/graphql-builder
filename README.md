# Apollo GraphQL Builder

This library is designed to make writing easier when using Apollo.
With this lib you can to quickly edit scripts and get typed responses.

You can see the instructions for creating the schemas in [`graphql-light-builder`](https://github.com/scala-12/ts-graphql-light-builder).

## Functions

- `createMutation(scriptName, mutationInfo, resultSchema, refetchScripts, ...paramsMapping)` apollo mutation, is syntactic sugar for useMutation(gql(script), options)
- `createQuery(scriptName, { callback, options }, resultSchema, ...paramsMapping)` apollo query, is syntactic sugar for useQuery(gql(script), options) and useLazyQuery(gql(script), options) (depends on callback)

## Examples

With this library you can create prepared queries and mutations.
Details you can find in [examples/index.ts](https://github.com/scala-12/ts-apollo-graphql-builder/tree/main/examples)

Base code:

    enum AuthorField {
        ID = "id",
        NAME = "name",
        HEADSHOT_IMAGE = "headshotImage",
        LOCATION = "location",
        AUDIENCE_FOCUS = "focus",
    }

    class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
        constructor(
            entryName?: string | null | undefined, ...initFields: AuthorField[]
        ) {
            super(AuthorField, entryName, initFields);
        }
    }

    class AuthorGql {
        static create = <TResult extends Partial<IAuthor>>(
            mutationInfo: MutationInfo<Record<"authorCreate", TResult>>,
            resultSchema?: AuthorSchemaBuilder,
        ) =>
            createMutation(
            "authorCreate",
            mutationInfo,
            resultSchema,
            ["currentProfileAuthors"],
            [AuthorField.NAME, "String"],
            [AuthorField.HEADSHOT_IMAGE, "String"],
            [AuthorField.LOCATION, "String"],
            [AuthorField.AUDIENCE_FOCUS, "[String]"],
        );

        static getCurrentProfileAuthors = <
            TResult extends Partial<IAuthor>,
            TData extends Record<"currentProfileAuthors", TResult[]>,
            TCallback extends QueryCallback<TData>,
        >(
            queryInfo: QueryInfo<TCallback, TData>,
            resultSchema?: AuthorSchemaBuilder,
        ) =>
            createQuery(
            "currentProfileAuthors",
            queryInfo,
            resultSchema || new AuthorSchemaBuilder(),
        );

        static initSchema = (
            initFields: AuthorField[],
            entryName?: string | null | undefined
        ) => new AuthorSchemaBuilder(entryName, ...initFields);
    }

With this code we can do mutation and query with typed answer:

    const { data, loading } = AuthorGql.getAuthor(
        {
            callback: useQuery,
            options: {
                variables: {
                    [AuthorField.ID]: "testId000",
                },
                fetchPolicy: "no-cache",
            },
        },
        AuthorGql.initSchema([AuthorField.ID, AuthorField.NAME]),
    );
    let id = data?.author[AuthorField.ID];

    const [createAuthor, { data: creationData, loading: creationLoading }] =
    AuthorGql.create({ callback: useMutation });
    
    id = creationData?.[AuthorScript.CREATE][AuthorField.ID];
