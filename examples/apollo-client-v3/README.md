# Work with Apollo client

This examples provides a type-safe way to build and execute GraphQL queries and mutations using Apollo Client v3 in combination with [`graphql-light-builder`](https://github.com/scala-12/graphql-builder/tree/main/ts-graphql-light-builder)..
It simplifies working with complex GraphQL schemas by allowing you to dynamically generate queries and mutations with full TypeScript typing.

---

## 📘 Overview

This library wraps Apollo Client hooks (`useQuery`, `useLazyQuery`, `useMutation`) with helper functions that automatically generate queries and mutations based on schema builders.

---

### Custom Hooks

| Hook                 | Description                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `useApolloQuery`     | Replacement for `useQuery`. Supports schema-based query generation.                       |
| `useApolloLazyQuery` | Replacement for `useLazyQuery`. Allows deferred queries with schema typing.               |
| `useApolloMutation`  | Replacement for `useMutation`. Simplifies mutations with typed args and affected queries. |

---

## ⚙️ Features

✅ Dynamic GraphQL generation via schema builders  
✅ Automatic type mapping for arguments  
✅ Supports nested and complex GraphQL structures  
✅ Simplifies integration with Apollo hooks

---
