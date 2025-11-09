# Apollo GraphQL Builder

This library provides a lightweight and type-safe way to build and execute GraphQL queries and mutations using Apollo Client.
It simplifies working with complex GraphQL schemas by allowing you to dynamically generate queries and mutations with full TypeScript typing.

It is built to work in combination with [`graphql-light-builder`](https://github.com/scala-12/graphql-builder/tree/main/ts-graphql-light-builder).

---

## 🚀 Installation

```bash
npm i @apollo/client apollo-graphql-builder graphql-light-builder
```

---

## 📘 Overview

This library wraps Apollo Client hooks (`useQuery`, `useLazyQuery`, `useMutation`) with helper functions that automatically generate queries and mutations based on schema builders.

### Available Hooks

| Hook | Description |
|------|--------------|
| `useApolloQuery` | Replacement for `useQuery`. Supports schema-based query generation. |
| `useApolloLazyQuery` | Replacement for `useLazyQuery`. Allows deferred queries with schema typing. |
| `useApolloMutation` | Replacement for `useMutation`. Simplifies mutations with typed args and affected queries. |

---

## 🧩 Usage Example

You can define your GraphQL schema fields as enums for better type safety:

```ts
enum AuthorField {
  ID = "id",
  NAME = "name",
  HEADSHOT_IMAGE = "headshotImage",
  LOCATION = "location",
  AUDIENCE_FOCUS = "focus",
}
```

Then create a schema builder based on `graphql-light-builder`:

```ts
import { SchemaBuilder } from "graphql-light-builder";

class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
  constructor(entryName?: string | null | undefined, ...initFields: AuthorField[]) {
    super(AuthorField, entryName, initFields);
  }
}
```

---

## 🔍 Queries

To create a typed Apollo query:

```ts
import { useApolloQuery } from "apollo-graphql-builder";
import { GqlFieldType } from "graphql-light-builder";

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
```

Usage example:

```ts
const { data, loading } = useGetAuthor<IAuthor>({
  options: {
    variables: { [AuthorField.ID]: "testId000" },
    fetchPolicy: "no-cache",
  },
  schema: new AuthorSchemaBuilder(null, AuthorField.ID, AuthorField.NAME),
});

console.log(data?.author[AuthorField.ID]);
```

---

## ✏️ Mutations

You can also create reusable and typed mutation hooks:

```ts
import { useApolloMutation } from "apollo-graphql-builder";

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

Example usage:

```ts
const [createAuthor, { data: creationData, loading: creationLoading }] =
  useMutateAuthor(AuthorScript.CREATE);

const newId = creationData?.[AuthorScript.CREATE][AuthorField.ID];
```

---

## ⚙️ Features

✅ Strongly typed queries and mutations  
✅ Dynamic GraphQL generation via schema builders  
✅ Automatic type mapping for arguments  
✅ Supports nested and complex GraphQL structures  
✅ Simplifies integration with Apollo hooks

---

## 📚 Related Projects

- [graphql-light-builder](https://github.com/scala-12/graphql-builder/tree/main/ts-graphql-light-builder) – low-level schema and query builder.
- [apollo-graphql-builder (npm)](https://www.npmjs.com/package/apollo-graphql-builder)

---

## 🧠 License

MIT © 2025 [scala-12](https://github.com/scala-12)
