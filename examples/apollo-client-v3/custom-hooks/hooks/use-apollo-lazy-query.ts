import { gql, useLazyQuery } from "@apollo/client";
import { SchemaBuilder } from "graphql-light-builder";
import { ApolloQueryParams, SchemaBuilderType } from "../types";

export const useApolloLazyQuery = <
  TResult,
  TBuilder extends SchemaBuilderType,
  TVariables extends string,
  TVariablesMap extends Record<TVariables, unknown>,
  TScript extends string = string,
>(
  scriptName: TScript,
  { options, schema, argsTyping }: ApolloQueryParams<true, TScript, TResult, TBuilder, TVariables, TVariablesMap> = {},
) => {
  const script = SchemaBuilder.createScript("query", scriptName, schema, argsTyping);

  // TODO fix deprecation warning
  const customOptions = Object.assign({}, options ?? {});
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return useLazyQuery(gql(script), options);
};
