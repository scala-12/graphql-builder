import { useMutation, useQuery } from "@apollo/client";
import {
  MutationInfo,
  ParamTypeMapping,
  QueryCallback,
  QueryInfo,
  SchemaBuilder,
  createMutation,
  createQuery,
} from "apollo-graphql-builder";

enum AuthorField {
  ID = "id",
  NAME = "name",
  HEADSHOT_IMAGE = "headshotImage",
  LOCATION = "location",
  AUDIENCE_FOCUS = "focus",
}

type IAuthor = {
  [AuthorField.ID]: string;
  [AuthorField.NAME]: string;
  [AuthorField.HEADSHOT_IMAGE]: string;
  [AuthorField.LOCATION]: string;

  [AuthorField.AUDIENCE_FOCUS]: string[];
};

enum AuthorScript {
  PROFILE_AUTHORS = "currentProfileAuthors",
  AUTHOR = "author",

  CREATE = "authorCreate",
  UPDATE = "authorUpdate",
  DELETE = "authorDelete",
}

enum AuthorMutationExtraField {
  AUTHOR_ID = "authorId",
}

const gqlStringType = "String";
const MAIN_FIELDS: ParamTypeMapping[] = [
  [AuthorField.NAME, gqlStringType],
  [AuthorField.HEADSHOT_IMAGE, gqlStringType],
  [AuthorField.LOCATION, gqlStringType],
  [AuthorField.AUDIENCE_FOCUS, `[${gqlStringType}]`],
];

class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
  constructor(entryName?: string | null | undefined, ...initFields: AuthorField[]) {
    super(AuthorField, entryName, initFields);
  }
}

/**
 * TResult - type of data[query/mutation] result
 */
class AuthorGql {
  static create = <TResult extends Partial<IAuthor>>(
    mutationInfo: MutationInfo<Record<AuthorScript.CREATE, TResult>>,
    resultSchema?: AuthorSchemaBuilder,
  ) => createMutation(AuthorScript.CREATE, mutationInfo, resultSchema, MAIN_FIELDS, [AuthorScript.PROFILE_AUTHORS]);

  static update = <TResult extends Partial<IAuthor>>(
    mutationInfo: MutationInfo<Record<AuthorScript.UPDATE, TResult>>,
    resultSchema?: AuthorSchemaBuilder,
  ) =>
    createMutation(
      AuthorScript.UPDATE,
      mutationInfo,
      resultSchema,
      [[AuthorMutationExtraField.AUTHOR_ID, gqlStringType], ...MAIN_FIELDS],
      [AuthorScript.PROFILE_AUTHORS, AuthorScript.AUTHOR],
    );

  static delete = (mutationInfo: MutationInfo<Record<AuthorScript.DELETE, boolean>>) =>
    createMutation(
      AuthorScript.DELETE,
      mutationInfo,
      null,
      [[AuthorMutationExtraField.AUTHOR_ID, gqlStringType]],
      [AuthorScript.PROFILE_AUTHORS],
    );

  static getCurrentProfileAuthors = <
    TResult extends Partial<IAuthor>,
    TData extends Record<AuthorScript.PROFILE_AUTHORS, TResult[]>,
    TCallback extends QueryCallback<TData>,
  >(
    queryInfo: QueryInfo<TCallback, TData>,
    resultSchema?: AuthorSchemaBuilder,
  ) => createQuery(AuthorScript.PROFILE_AUTHORS, queryInfo, resultSchema || new AuthorSchemaBuilder());

  static getAuthor = <
    TResult extends Partial<IAuthor>,
    TData extends Record<AuthorScript.AUTHOR, TResult>,
    TCallback extends QueryCallback<TData>,
  >(
    queryInfo: QueryInfo<TCallback, TData>,
    resultSchema?: AuthorSchemaBuilder,
  ) =>
    createQuery(AuthorScript.AUTHOR, queryInfo, resultSchema || new AuthorSchemaBuilder(), [
      AuthorField.ID,
      gqlStringType,
    ]);

  static initSchema = (initFields: AuthorField[], entryName?: string | null | undefined) =>
    new AuthorSchemaBuilder(entryName, ...initFields);
}

// answer with typed data
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
// typed answer
data?.author[AuthorField.ID];

// mutation with typed answer
const [createAuthor, { data: creationData, loading: creationLoading }] = AuthorGql.create({ callback: useMutation });

// mutation result
creationData?.[AuthorScript.CREATE][AuthorField.ID]; // equals to creationData?.authorCreate?.id
