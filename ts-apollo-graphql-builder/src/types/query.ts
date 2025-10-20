import type { LazyQueryHookOptions, NoInfer, OperationVariables, QueryHookOptions } from "@apollo/client";

export type LazyQueryOptions<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = LazyQueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>;

export type SimpleQueryOptions<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>;
