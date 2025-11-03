# GraphQL Builder Monorepo

A collection of libraries designed to simplify the creation and usage of complex **GraphQL schemas**, **queries**, and **mutations**.

This monorepo provides tools for both **schema generation** and **Apollo Client integration** with full TypeScript support and flexible configuration.

---

## 📦 Packages

### [`graphql-light-builder`](https://github.com/scala-12/graphql-builder/tree/main/ts-graphql-light-builder)

> 🧱 A lightweight, dependency-free builder for constructing GraphQL schemas and scripts.

- Build complex, nested GraphQL queries programmatically.
- Supports type-safe enums for schema fields.
- Generate query/mutation strings dynamically.
- Ideal for reusable GraphQL definitions across projects.

📘 **Documentation:**  
[GitHub → ts-graphql-light-builder](https://github.com/scala-12/graphql-builder/tree/main/ts-graphql-light-builder)  
[npm → graphql-light-builder](https://www.npmjs.com/package/graphql-light-builder)

---

### [`apollo-graphql-builder`](https://github.com/scala-12/graphql-builder/tree/main/ts-apollo-graphql-builder)

> ⚡ A higher-level utility for **Apollo Client** that automatically generates typed queries and mutations from `graphql-light-builder` schemas.

- Replaces `useQuery`, `useLazyQuery`, and `useMutation` with typed equivalents.
- Automatically creates scripts and variable mappings.
- Greatly reduces boilerplate for GraphQL operations.

📘 **Documentation:**  
[GitHub → ts-apollo-graphql-builder](https://github.com/scala-12/graphql-builder/tree/main/ts-apollo-graphql-builder)  
[npm → apollo-graphql-builder](https://www.npmjs.com/package/apollo-graphql-builder)

---

## 🧠 Why Use GraphQL Builder?

✅ **Type-safe GraphQL generation** – build queries without hardcoding strings  
✅ **Easy maintenance** – update nested fields or arguments in one place  
✅ **Full Apollo compatibility** – seamlessly integrate into React or Next.js apps  
✅ **Lightweight & modular** – use one or both libraries independently

---

## 🚀 Quick Example

```ts
// Define schema
enum AuthorField {
  ID = "id",
  NAME = "name",
}

class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
  constructor() {
    super(AuthorField, "author", [AuthorField.ID, AuthorField.NAME]);
  }
}

// Generate query
const query = SchemaBuilder.createScript(
  "query",
  "getAuthor",
  new AuthorSchemaBuilder()
);

console.log(query);
// query GET_AUTHOR { author { id name } }
```

Use it directly in Apollo:

```ts
const { data } = useApolloQuery("getAuthor", {
  schema: new AuthorSchemaBuilder(),
});
```

---

## 🧩 Monorepo Structure

```
graphql-builder/
├── ts-graphql-light-builder/   # Core schema and query builder
├── ts-apollo-graphql-builder/  # Apollo Client integration
└── examples/                   # Usage examples and demos
```

---

## 📄 License

MIT © 2025 [scala-12](https://github.com/scala-12)
