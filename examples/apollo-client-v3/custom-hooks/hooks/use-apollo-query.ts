import { gql, useQuery } from "@apollo/client";
import { createScript } from "graphql-light-builder";
import { ApolloQueryParams, SchemaBuilderType } from "../types";

export const useApolloQuery = <
  TResult,
  TBuilder extends SchemaBuilderType,
  TVariables extends string,
  TVariablesMap extends Record<TVariables, unknown>,
  TScript extends string = string
>(
  scriptName: TScript,
  {
    options,
    schema,
    argsTyping,
  }: ApolloQueryParams<
    false,
    TScript,
    TResult,
    TBuilder,
    TVariables,
    TVariablesMap
  > = {}
) => {
  const script = createScript("query", scriptName, schema, argsTyping);

  // TODO fix deprecation warning
  const customOptions = Object.assign({}, options ?? {});
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return useQuery(gql(script), options);
};
