import type {
  ApolloCache,
  DefaultContext,
  DocumentNode,
  LazyQueryHookOptions,
  LazyQueryResultTuple,
  MutationHookOptions,
  MutationTuple,
  NoInfer,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
} from "@apollo/client";
import { gql } from "@apollo/client";
import { ParamTypeMapping, SchemaBuilder } from "graphql-light-builder";

export type MutationOptions<
  TData = unknown,
  TVariables = OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<unknown> = ApolloCache<unknown>,
> = MutationHookOptions<NoInfer<TData>, NoInfer<TVariables>, TContext, TCache>;

export type MutationCallback<
  TData = unknown,
  TVariables = OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<unknown> = ApolloCache<unknown>,
> = (
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationOptions<TData, TVariables, TContext, TCache>,
) => MutationTuple<TData, TVariables, TContext, TCache>;

export interface MutationInfo<TData = unknown> {
  callback: MutationCallback<TData>;
  options?: MutationOptions<TData>;
}

type LazyQueryOptions<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = LazyQueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>;

type SimpleQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = QueryHookOptions<
  NoInfer<TData>,
  NoInfer<TVariables>
>;

export type LazyQueryCallback<TData = unknown, TVariables extends OperationVariables = OperationVariables> = (
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: LazyQueryOptions<TData, TVariables>,
) => LazyQueryResultTuple<TData, TVariables>;

type SimpleQueryCallback<TData = unknown, TVariables extends OperationVariables = OperationVariables> = (
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: SimpleQueryOptions<TData, TVariables>,
) => QueryResult<TData, TVariables>;

export type QueryCallback<TData extends Record<string, TResult>, TResult = unknown> =
  | LazyQueryCallback<TData>
  | SimpleQueryCallback<TData>;
export interface QueryInfo<
  TCallback extends QueryCallback<TData, TResult>,
  TData extends Record<string, TResult>,
  TResult = unknown,
> {
  callback: TCallback;
  options?: TCallback extends LazyQueryCallback ? LazyQueryOptions<TData> : SimpleQueryOptions<TData>;
}

/**
 * Create useQuery or useLazyQuery with typed response
 * @param scriptName Query name on server side
 * @param queryInfo {callback: useQuery | useLazyQuery, options}
 * @param resultSchema Result schema as builder, string or nothing
 * @param paramsMapping Ordered query params with types as [param_name, param_type_as_string]
 * @returns Result as useQuery | useLazyQuery with typed data
 */
export const createQuery = <
  TResult,
  TScript extends string,
  TData extends Record<TScript, TResult>,
  TCallback extends QueryCallback<TData, TResult>,
>(
  scriptName: TScript,
  { callback, options }: QueryInfo<TCallback, TData, TResult>,
  resultSchema?: SchemaBuilder<string> | string | null | undefined,
  ...paramsMapping: readonly ParamTypeMapping[]
) => {
  type ResultType = TCallback extends LazyQueryCallback
    ? LazyQueryResultTuple<TData, OperationVariables>
    : QueryResult<TData>;

  const script = SchemaBuilder.createScript("query", scriptName, resultSchema, ...paramsMapping);

  const customOptions = Object.assign({}, options || {});
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return callback(gql(script), options) as ResultType;
};

const setObjectField = <T extends object>(obj: T, value: unknown, ...namePath: string[]) => {
  if (namePath.length < 1) {
    throw new Error("Name path not valid");
  }
  const result = { ...obj };
  let subvalue = result as { [k: string]: unknown };

  if (namePath.length > 1) {
    for (const name of namePath.slice(0, -1)) {
      let newSubvalue;
      if (name.includes("[")) {
        const [arrName, idx] = name.replace(new RegExp(/^(\w+)\[(\d+)\]$/g), "$1 $2").split(" ");
        const arrIdx = Number(idx);
        const arr = (subvalue[arrName] || Array(arrIdx + 1)) as {
          [k: string]: unknown;
        }[];
        newSubvalue = subvalue[arrName] != null ? { ...arr[arrIdx] } : {};
        Object.assign(subvalue, {
          [arrName]: [...arr.slice(0, arrIdx), newSubvalue, ...arr.slice(arrIdx + 1)],
        });
      } else {
        newSubvalue = {
          ...((subvalue[name] || {}) as { [k: string]: unknown }),
        };
        Object.assign(subvalue, { [name]: newSubvalue });
      }
      subvalue = newSubvalue;
    }
  }
  subvalue[namePath.slice(-1)[0]] = value;

  return result;
};

// TODO TResult must be settable
/**
 * Create mutation by apollo with typed response and query refetching
 * @param scriptName Mutation name on server side
 * @param mutationInfo {callback: useMutation, options}
 * @param resultSchema Result schema as builder, string or nothing
 * @param paramsMapping Ordered mutation params with types as [param_name, param_type_as_string]
 * @param refetchScripts Array of queries for refetch
 * @returns useMutation result with typed data
 */
export const createMutation = <
  TResult,
  Script extends string = string,
  TData extends Record<Script, TResult> = Record<Script, TResult>,
>(
  scriptName: Script,
  { callback, options }: MutationInfo<TData>,
  resultSchema?: SchemaBuilder<string> | string | null | undefined,
  paramsMapping?: readonly ParamTypeMapping[] | null | undefined,
  refetchScripts?: readonly string[] | null | undefined,
) => {
  const script = SchemaBuilder.createScript("mutation", scriptName, resultSchema, ...(paramsMapping || []));

  const customOptions = Object.assign({}, Object.assign({}, options || {}));
  if (refetchScripts?.length) {
    setObjectField(customOptions, refetchScripts.map(SchemaBuilder.createOperationName), "refetchQueries");
  }

  // TODO deprecated - make it optional or find other way
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return callback(gql(script), customOptions);
};
