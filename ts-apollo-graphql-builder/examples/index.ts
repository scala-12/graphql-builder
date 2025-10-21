import {
  ApolloMutationParams,
  ImmediateQueryOptions,
  LazyQueryOptions,
  useApolloLazyQuery,
  useApolloMutation,
  useApolloQuery,
} from "apollo-graphql-builder";
import { ParamTypeMapping, SchemaBuilder } from "graphql-light-builder";

enum AuthorField {
  ID = "id",
  NAME = "name",
  HEADSHOT_IMAGE = "headshotImage",
  LOCATION = "location",
  AUDIENCE_FOCUS = "focus",
}

type Author = {
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

enum AuthorScriptField {
  AUTHOR_ID = "authorId",
}

class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
  constructor(entryName?: string | null | undefined, ...initFields: AuthorField[]) {
    super(AuthorField, entryName, initFields);
  }
}

const GQL_STRING_TYPE = "String";

// query with typed answer
const useGetProfileAuthors = <TResult extends Partial<Author>>({
  options,
  schema = new AuthorSchemaBuilder(),
}: {
  options?: ImmediateQueryOptions<AuthorScript.PROFILE_AUTHORS, TResult[]>;
  schema?: AuthorSchemaBuilder;
}) => {
  return useApolloQuery(AuthorScript.PROFILE_AUTHORS, {
    options,
    schema,
    argsTypesMap: [[AuthorField.ID, GQL_STRING_TYPE]],
  });
};

// answer with typed data
type TAuthor = Pick<Author, AuthorField.ID | AuthorField.NAME>;

const schema = new AuthorSchemaBuilder(null, AuthorField.ID, AuthorField.NAME);

const { data: { [AuthorScript.PROFILE_AUTHORS]: authors } = {}, loading } = useGetProfileAuthors<TAuthor>({
  options: {
    variables: {
      [AuthorField.ID]: "testId000",
    },
    fetchPolicy: "no-cache",
  },
  schema,
});

authors?.reduce((acc: Record<string, string>, author) => {
  acc[author.id] = author.name;
  return acc;
}, {});

// lazy query with typed answer
const useLazyGetProfileAuthor = <TResult extends Partial<Author>>({
  options,
  schema = new AuthorSchemaBuilder(),
}: {
  options?: LazyQueryOptions<AuthorScript.AUTHOR, TResult>;
  schema?: AuthorSchemaBuilder;
}) => {
  return useApolloLazyQuery(AuthorScript.AUTHOR, {
    options,
    schema,
    argsTypesMap: [[AuthorField.ID, GQL_STRING_TYPE]],
  });
};

// typed answer
const [getAuthor] = useLazyGetProfileAuthor<TAuthor>({
  options: {
    variables: { [AuthorScriptField.AUTHOR_ID]: "id-007" },
    onError(e) {
      alert(`Error: ${e.message}`);
    },
  },
  schema,
});

const author = await getAuthor().then(({ data: { [AuthorScript.AUTHOR]: author } = {} }) => author);

// mutation
const useMutateAuthor = <TResult extends Partial<Author>, TScript extends AuthorScript.CREATE | AuthorScript.UPDATE>(
  script: TScript,
  {
    options,
    schema: resultSchema = new AuthorSchemaBuilder(),
  }: ApolloMutationParams<TScript, TResult, AuthorSchemaBuilder> = {},
) => {
  return useApolloMutation(script, {
    options,
    schema: resultSchema,
    argsTypesMap:
      script === AuthorScript.CREATE ? MAIN_FIELDS : [...MAIN_FIELDS, [AuthorScriptField.AUTHOR_ID, GQL_STRING_TYPE]],
    affectedQueries: [AuthorScript.PROFILE_AUTHORS, ...(script === AuthorScript.CREATE ? [] : [AuthorScript.AUTHOR])],
  });
};

const MAIN_FIELDS: ParamTypeMapping[] = [
  [AuthorField.NAME, GQL_STRING_TYPE],
  [AuthorField.HEADSHOT_IMAGE, GQL_STRING_TYPE],
  [AuthorField.LOCATION, GQL_STRING_TYPE],
  [AuthorField.AUDIENCE_FOCUS, `[${GQL_STRING_TYPE}]`],
];

// mutation with typed answer
const [createAuthor, { data: creationData, loading: creationLoading }] = useMutateAuthor<TAuthor, AuthorScript.CREATE>(
  AuthorScript.CREATE,
);

createAuthor({
  variables: {
    [AuthorField.NAME]: "AuthorName",
    [AuthorField.HEADSHOT_IMAGE]: "AuthorHeadshotUrl",
    [AuthorField.LOCATION]: "AuthorLocation",
    [AuthorField.AUDIENCE_FOCUS]: ["audience1", "audience2"],
  },
  onCompleted({ [AuthorScript.CREATE]: author }) {
    alert("Completed author creation: " + author.name);
  },
});
