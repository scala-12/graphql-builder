import type { ApolloCache, DefaultContext, MutationHookOptions, NoInfer, OperationVariables } from "@apollo/client";
import { NonEmpty, SchemaBuilderType } from ".";

export type ApolloMutationOptions<
  TScript extends string,
  TResult extends unknown,
  TVariablesMap extends OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<unknown> = ApolloCache<unknown>,
> = MutationHookOptions<NoInfer<Record<TScript, TResult>>, NoInfer<TVariablesMap>, TContext, TCache>;

export type ApolloMutationParams<
  TScript extends string,
  TResult,
  TBuilder extends SchemaBuilderType,
  TVariables extends string,
  TVariablesMap extends Record<TVariables, unknown>,
> = {
  options?: ApolloMutationOptions<TScript, TResult, TVariablesMap>;
  schema?: TBuilder;
  argsTyping?: NonEmpty<Record<TVariables, string>>;
};
