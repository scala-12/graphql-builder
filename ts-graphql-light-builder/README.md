# GraphQL Light Builder

A lightweight TypeScript library for building **GraphQL schemas and scripts** with support for **nested (complex) fields** and quick modifications.  

---

## Features

- Build **simple and nested GraphQL schemas** with ease.
- Add, remove, and set fields dynamically.
- Copy fields from other builders.
- Generate **GraphQL queries or mutations** with typed arguments.
- Fully supports string enums for field names.

---

## Methods

| Method | Description |
|--------|-------------|
| `remove(fieldName)` | Removes a field from the builder. |
| `clear()` | Clears all currently added fields. |
| `addComplex(complex)` | Adds a nested field (complex schema). |
| `getComplex<T>(field)` | Returns a nested field builder, typed with `T`. |
| `useSimpleOnly(includeComplex = false)` | Sets only simple fields; optionally adds default complex fields with their simple subfields. |
| `add(...fields)` | Adds one or more fields (simple or complex). |
| `set(...fields)` | Replaces current fields with the specified ones. |
| `setSubfields(name, ...subfields)` | Sets specific subfields for a nested (complex) field. |
| `build(withName = true)` | Builds the GraphQL schema string. Includes schema name if `withName === true`. |
| `static createScript(type, name, result, ...params)` | Generates a GraphQL query or mutation string using a schema or string result and optional typed parameters. |

---

## Example: Nested Schemas

Suppose we have three entities: **Publisher, Book, Author**, with their fields as enums:

```ts
enum PublisherField {
  NAME = 'name',
  ADDRESS = 'address',
}

enum BookField {
  TITLE = 'title',
  PUBLISHER = 'publisher',
}

enum AuthorField {
  ID = 'id',
  NAME = 'name',
  BOOKS = 'books',
}
```

### Builders with nested schemas:

```ts
class PublisherSchemaBuilder extends SchemaBuilder<PublisherField> {
  constructor(entryName?: string, ...initFields: PublisherField[]) {
    super(PublisherField, entryName, initFields);
  }
}

class BookSchemaBuilder extends SchemaBuilder<BookField> {
  constructor(entryName?: string, ...initFields: BookField[]) {
    super(
      BookField,
      entryName,
      initFields,
      [BookField.PUBLISHER, e => new PublisherSchemaBuilder(e)]
    );
  }
}

class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
  constructor(entryName?: string, ...initFields: AuthorField[]) {
    super(
      AuthorField,
      entryName,
      initFields,
      [AuthorField.BOOKS, e => new BookSchemaBuilder(e)]
    );
  }
}
```

---

### Example 1: Simple Author Schema

```ts
const authorSchema = new AuthorSchemaBuilder("author").build();
console.log(authorSchema);
```

**Output:**

```graphql
author {
  id
  name
}
```

---

### Example 2: Author Schema with Nested Books and Publishers

```ts
const authorWithPublishers = (
  builder => builder.addComplex(
    builder.getComplex<BookSchemaBuilder>(AuthorField.BOOKS)?.set(BookField.PUBLISHER)
  )
)(new AuthorSchemaBuilder("author").clear()).build();

console.log(authorWithPublishers);
```

**Explanation:**

- `clear()` — clears all previously added fields.  
- `getComplex<BookSchemaBuilder>(AuthorField.BOOKS)` — gets a typed nested builder for books.  
- `set(BookField.PUBLISHER)` — sets only the publisher field in the book builder.  
- `addComplex()` — adds the nested book schema to the author.  

**Output:**

```graphql
author {
  books {
    publisher {
      name
      address
    }
  }
}
```

---

### Example 3: Creating a GraphQL Query

```ts
useQuery(
  gql(
    SchemaBuilder.createScript(
      "query",
      "getAuthor",
      new AuthorSchemaBuilder("author").build()
    )
  )
);
```

Generates a query like:

```graphql
query GET_AUTHOR {
  author {
    id
    name
  }
}
```

---

### Notes

- The library works best with **string enums** to ensure type safety.  
- Nested schemas allow flexible control over **which fields to include** dynamically.  
- `createScript()` helps integrate directly with **Apollo Client** or any GraphQL client.  
