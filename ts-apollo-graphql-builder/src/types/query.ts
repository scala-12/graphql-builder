import type {
  DocumentNode,
  LazyQueryHookOptions,
  LazyQueryResultTuple,
  NoInfer,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
} from "@apollo/client";

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
