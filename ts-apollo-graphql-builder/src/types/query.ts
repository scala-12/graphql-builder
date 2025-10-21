import type { LazyQueryHookOptions, NoInfer, OperationVariables, QueryHookOptions } from "@apollo/client";

export type LazyQueryOptions<
  TScript extends string = string,
  TResult extends unknown = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = LazyQueryHookOptions<NoInfer<Record<TScript, TResult>>, NoInfer<TVariables>>;

export type ImmediateQueryOptions<
  TScript extends string = string,
  TResult extends unknown = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = QueryHookOptions<NoInfer<Record<TScript, TResult>>, NoInfer<TVariables>>;
