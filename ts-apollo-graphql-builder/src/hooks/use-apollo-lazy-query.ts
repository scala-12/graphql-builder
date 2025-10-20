import { gql, useLazyQuery } from "@apollo/client";
import { ParamTypeMapping, SchemaBuilder } from "graphql-light-builder";
import { LazyQueryOptions, SchemaBuilderType } from "../types";

type Params<TData, TBuilder> = {
  options?: LazyQueryOptions<TData>;
  schema?: TBuilder;
  argsTypesMap?: readonly ParamTypeMapping[];
};

export const useApolloLazyQuery = <
  TResult,
  TBuilder extends SchemaBuilderType,
  TScript extends string = string,
  TData extends Record<TScript, TResult> = Record<TScript, TResult>,
>(
  scriptName: TScript,
  { options, schema, argsTypesMap = [] }: Params<TData, TBuilder> = {},
) => {
  const script = SchemaBuilder.createScript("query", scriptName, schema, ...argsTypesMap);

  const customOptions = Object.assign({}, options || {});
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return useLazyQuery(gql(script), options);
};
