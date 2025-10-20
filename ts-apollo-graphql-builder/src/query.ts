import type { LazyQueryResultTuple, OperationVariables, QueryResult } from "@apollo/client";
import { gql } from "@apollo/client";
import { ParamTypeMapping, SchemaBuilder } from "graphql-light-builder";
import { LazyQueryCallback, QueryCallback, QueryInfo } from "./types";

/**
 * Create useQuery or useLazyQuery with typed response
 * @param scriptName Query name on server side
 * @param queryInfo {callback: useQuery | useLazyQuery, options}
 * @param resultSchema Result schema as builder, string or nothing
 * @param paramsMapping Ordered query params with types as [param_name, param_type_as_string]
 * @returns Result as useQuery | useLazyQuery with typed data
 */
export const createQuery = <
  TResult,
  TScript extends string,
  TData extends Record<TScript, TResult>,
  TCallback extends QueryCallback<TData, TResult>,
>(
  scriptName: TScript,
  { callback, options }: QueryInfo<TCallback, TData, TResult>,
  resultSchema?: SchemaBuilder<string> | string | null | undefined,
  ...paramsMapping: readonly ParamTypeMapping[]
) => {
  type ResultType = TCallback extends LazyQueryCallback
    ? LazyQueryResultTuple<TData, OperationVariables>
    : QueryResult<TData>;

  const script = SchemaBuilder.createScript("query", scriptName, resultSchema, ...paramsMapping);

  // TODO fix onError deprecation
  const customOptions = Object.assign({}, options || {});
  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return callback(gql(script), options) as ResultType;
};
