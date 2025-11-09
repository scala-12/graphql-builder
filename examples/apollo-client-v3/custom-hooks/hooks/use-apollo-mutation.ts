import { gql, useMutation } from "@apollo/client";
import { SchemaBuilder } from "graphql-light-builder";
import { ApolloMutationParams, SchemaBuilderType } from "../types";

/**
 * Create mutation by apollo with typed response and query refetching
 * @param {TScript} scriptName Mutation name on server side
 * @param {ApolloMutationParams<TScript, TResult, TBuilder, TVariables, TVariablesMap>} params Mutation params
 * @returns useMutation result with typed data
 */
export const useApolloMutation = <
  TResult,
  TBuilder extends SchemaBuilderType,
  TVariables extends string,
  TVariablesMap extends Record<TVariables, unknown>,
  TScript extends string = string,
>(
  scriptName: TScript,
  { options, schema, argsTyping }: ApolloMutationParams<TScript, TResult, TBuilder, TVariables, TVariablesMap>,
  affectedQueries: string[] = [],
) => {
  const script = SchemaBuilder.createScript("mutation", scriptName, schema, argsTyping);

  const customOptions = Object.assign({}, options ?? {});
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  if (affectedQueries.length) {
    if (!customOptions.refetchQueries || Array.isArray(customOptions.refetchQueries)) {
      customOptions.refetchQueries = [
        ...(customOptions.refetchQueries ?? []),
        ...affectedQueries.map(SchemaBuilder.createOperationName),
      ];
    }
  }

  return useMutation(gql(script), customOptions);
};
