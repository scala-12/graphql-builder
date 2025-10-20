import type {
  ApolloCache,
  DefaultContext,
  DocumentNode,
  MutationHookOptions,
  MutationTuple,
  NoInfer,
  OperationVariables,
  TypedDocumentNode,
} from "@apollo/client";

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
