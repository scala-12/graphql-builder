import { SchemaBuilder } from "graphql-light-builder";
import {
  ApolloMutationOptions,
  ImmediateQueryOptions,
  LazyQueryOptions,
  useApolloLazyQuery,
  useApolloMutation,
  useApolloQuery,
} from "./custom-hooks";

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

class AuthorSchemaBuilder extends SchemaBuilder<AuthorField> {
  constructor(
    entryName?: string | null | undefined,
    ...initFields: AuthorField[]
  ) {
    super(AuthorField, entryName, initFields);
  }
}

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
  });
};

// answer with typed data
const {
  data: { [AuthorScript.PROFILE_AUTHORS]: authors } = {},
  loading,
  error,
} = useGetProfileAuthors<Pick<Author, AuthorField.ID | AuthorField.NAME>>({
  schema: new AuthorSchemaBuilder(null, AuthorField.ID, AuthorField.NAME),
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
  });
};

// typed answer
const [getAuthor] = useLazyGetProfileAuthor<
  Pick<Author, AuthorField.ID | AuthorField.NAME>
>({
  options: {
    variables: { [AuthorField.ID]: "id-007" },
    onError(e) {
      alert(`Error: ${e.message}`);
    },
  },
  schema: new AuthorSchemaBuilder(null, AuthorField.ID, AuthorField.NAME),
});

const author = await getAuthor().then(
  ({ data: { [AuthorScript.AUTHOR]: author } = {} }) => author
);

// mutation
const useMutateAuthor = <
  TScript extends AuthorScript.CREATE | AuthorScript.UPDATE,
  IsUpdate extends boolean = TScript extends AuthorScript.UPDATE ? true : false
>(
  script: TScript,
  options?: ApolloMutationOptions<
    TScript,
    Author,
    AuthorMutationVariables<IsUpdate>
  >,
  schema: AuthorSchemaBuilder = new AuthorSchemaBuilder()
) => {
  const gqlStringTypeName = "String";
  const argsTyping = {
    [AuthorField.NAME]: gqlStringTypeName,
    [AuthorField.HEADSHOT_IMAGE]: gqlStringTypeName,
    [AuthorField.LOCATION]: gqlStringTypeName,
    [AuthorField.AUDIENCE_FOCUS]: `[${gqlStringTypeName}]`,
  } as Record<keyof AuthorMutationVariables<IsUpdate>, string>;
  if (script === AuthorScript.UPDATE) {
    Object.assign(argsTyping, { [AuthorField.ID]: gqlStringTypeName });
  }

  return useApolloMutation(
    script,
    {
      schema,
      options,
      argsTyping,
    },
    [
      AuthorScript.PROFILE_AUTHORS,
      ...(script === AuthorScript.CREATE ? [] : [AuthorScript.AUTHOR]),
    ]
  );
};

type AuthorMutationVariables<IsUpdate extends boolean> = {
  [AuthorField.NAME]: string;
  [AuthorField.LOCATION]: string;
  [AuthorField.AUDIENCE_FOCUS]: string[];
  [AuthorField.HEADSHOT_IMAGE]: string;
} & (IsUpdate extends true
  ? { [AuthorField.ID]: string }
  : { [AuthorField.ID]?: never });

// mutation with typed answer
const [createAuthor, { data, loading: creationLoading }] = useMutateAuthor(
  AuthorScript.CREATE
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
