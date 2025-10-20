import type { ApolloCache, DefaultContext, MutationHookOptions, NoInfer, OperationVariables } from "@apollo/client";
import { SchemaBuilderType } from ".";

export type ApolloMutationParams<Script extends string, TResult, TBuilder extends SchemaBuilderType> = {
  schema?: TBuilder;
  options?: ApolloMutationOptions<Record<Script, TResult>>;
};

export type ApolloMutationOptions<
  TData = unknown,
  TVariables = OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<unknown> = ApolloCache<unknown>,
> = MutationHookOptions<NoInfer<TData>, NoInfer<TVariables>, TContext, TCache>;
