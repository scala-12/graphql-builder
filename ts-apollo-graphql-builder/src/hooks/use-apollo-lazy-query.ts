import { gql, useLazyQuery } from "@apollo/client";
import { ParamTypeMapping, SchemaBuilder } from "graphql-light-builder";
import { LazyQueryOptions, SchemaBuilderType } from "../types";

type Params<TScript extends string, TResult, TBuilder> = {
  options?: LazyQueryOptions<TScript, TResult>;
  schema?: TBuilder;
  argsTypesMap?: readonly ParamTypeMapping[];
};

export const useApolloLazyQuery = <TResult, TBuilder extends SchemaBuilderType, TScript extends string = string>(
  scriptName: TScript,
  { options, schema, argsTypesMap = [] }: Params<TScript, TResult, TBuilder> = {},
) => {
  const script = SchemaBuilder.createScript("query", scriptName, schema, ...argsTypesMap);

  // TODO fix deprecation warning
  const customOptions = Object.assign({}, options || {});
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return useLazyQuery(gql(script), options);
};
