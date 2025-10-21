# Apollo GraphQL Builder

This library is designed to make writing easier when using Apollo.
With this lib you can to quickly edit complex Graphql schemes and scripts and get typed responses.

You can see the instructions for creating the schemas in `graphql-light-builder`: [GitHub](https://github.com/scala-12/graphql-builder/tree/main/ts-graphql-light-builder), [npmjs](https://www.npmjs.com/package/graphql-light-builder).

## Installation

```sh
npm i @apollo/client apollo-graphql-builder graphql-light-builder
```

## Hooks

- `useApolloMutation(scriptName, { options, schema, argsTypesMap, affectedQueries })` for use instead `useMutation`
- `useApolloQuery(scriptName, { options, schema, argsTypesMap = [] }` for use instead useQuery
- `useApolloLazyQuery(scriptName, { options, schema, argsTypesMap = [] }` for use instead useLazyQuery

## Examples

With this library you can create prepared queries and mutations.
Details you can find in [examples/index.ts](https://github.com/scala-12/graphql-builder/tree/main/ts-apollo-graphql-builder/examples/index.ts)

Base code:

```ts
enum AuthorField {
  ID = "id",
  NAME = "name",
  HEADSHOT_IMAGE = "headshotImage",
  LOCATION = "location",
  AUDIENCE_FOCUS = "focus",
}

class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
  constructor(entryName?: string | null | undefined, ...initFields: AuthorField[]) {
    super(AuthorField, entryName, initFields);
  }
}

export const useGetAuthor = <TResult extends Partial<IAuthor>>({
  options,
  schema = new AuthorSchemaBuilder(),
}: {
  options?: ImmediateQueryOptions<Record<AuthorScript.AUTHOR, TResult>>;
  schema?: AuthorSchemaBuilder;
}) => {
  return useApolloQuery(AuthorScript.AUTHOR, {
    options,
    schema,
    argsTypesMap: [[AuthorField.ID, GqlFieldType.STRING]],
  });
};

export const useMutateAuthor = <
  TResult extends Partial<IAuthor>,
  TScript extends AuthorScript.CREATE | AuthorScript.UPDATE
>(
  script: TScript,
  {
    options,
    schema: resultSchema = new AuthorSchemaBuilder(),
  }: ApolloMutationParams<TScript, TResult, AuthorSchemaBuilder> = {}
) => {
  return useApolloMutation(script, {
    options,
    schema: resultSchema,
    argsTypesMap:
      script === AuthorScript.CREATE
        ? MAIN_FIELDS
        : [...MAIN_FIELDS, [AuthorScriptField.AUTHOR_ID, GqlFieldType.STRING]],
    affectedQueries: [
      AuthorScript.CURRENT_PROFILE_AUTHORS,
      ...(script === AuthorScript.CREATE ? [] : [AuthorScript.AUTHOR]),
    ],
  });
};
```

With this code we can do mutation and query with typed answer:

```ts
const { data, loading } = useGetAuthor<IAuthor>({
  options: {
    variables: {
      [AuthorField.ID]: "testId000",
    },
    fetchPolicy: "no-cache",
  },
  schema: new AuthorSchemaBuilder(null, AuthorField.ID, AuthorField.NAME),
});

let id = data?.author[AuthorField.ID];

const [createAuthor, { data: creationData, loading: creationLoading }] = useMutateAuthor(AuthorScript.CREATE);

id = creationData?.[AuthorScript.CREATE][AuthorField.ID];
```
