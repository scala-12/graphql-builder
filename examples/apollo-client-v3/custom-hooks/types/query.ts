import type { LazyQueryHookOptions, NoInfer, OperationVariables, QueryHookOptions } from "@apollo/client";
import { NonEmpty, SchemaBuilderType } from "./common";

export type LazyQueryOptions<
  TScript extends string,
  TResult extends unknown,
  TVariablesMap extends OperationVariables = OperationVariables,
> = LazyQueryHookOptions<NoInfer<Record<TScript, TResult>>, NoInfer<TVariablesMap>>;

export type ImmediateQueryOptions<
  TScript extends string,
  TResult extends unknown,
  TVariablesMap extends OperationVariables = OperationVariables,
> = QueryHookOptions<NoInfer<Record<TScript, TResult>>, NoInfer<TVariablesMap>>;

export type ApolloQueryParams<
  IsLazy extends boolean,
  TScript extends string,
  TResult,
  TBuilder extends SchemaBuilderType,
  TVariables extends string,
  TVariablesMap extends Record<TVariables, unknown>,
> = {
  options?: IsLazy extends true
    ? LazyQueryOptions<TScript, TResult, TVariablesMap>
    : ImmediateQueryOptions<TScript, TResult, TVariablesMap>;
  schema?: TBuilder;
  argsTyping?: NonEmpty<Record<TVariables, string>>;
};
