import { gql, useMutation } from "@apollo/client";
import { ParamTypeMapping, SchemaBuilder } from "graphql-light-builder";
import { ApolloMutationOptions, ApolloMutationParams, SchemaBuilderType } from "../types";

/**
 * Create mutation by apollo with typed response and query refetching
 * @param {TScript} scriptName Mutation name on server side
 * @param {RequiredMutationParams<TScript, TResult, TBuilder>} params Mutation params
 * @param {ApolloMutationOptions<Record<TScript, TResult>>} params.options Apollo mutation options
 * @param {TBuilder} params.schema Result schema as builder, string or nothing
 * @param {readonly ParamTypeMapping[] | null} params.argsTypesMap  Ordered mutation params with types as [param_name, param_type_as_string]
 * @param {readonly string[] | null} params.affectedQueries Array of queries for refetch
 * @returns useMutation result with typed data
 */
export const useApolloMutation = <TResult, TBuilder extends SchemaBuilderType, TScript extends string = string>(
  scriptName: TScript,
  { options, schema, argsTypesMap, affectedQueries }: RequiredMutationParams<TScript, TResult, TBuilder>,
) => {
  const script = SchemaBuilder.createScript("mutation", scriptName, schema, ...(argsTypesMap || []));

  const customOptions = Object.assign({}, options ?? {});
  if (affectedQueries?.length) {
    setObjectField(customOptions, affectedQueries.map(SchemaBuilder.createOperationName), "refetchQueries");
  }

  if (customOptions.onError == null) {
    customOptions.onError = (err) => console.error(err.message);
  }

  return useMutation(gql(script), customOptions);
};

const setObjectField = <TData>(obj: ApolloMutationOptions<TData>, value: unknown, ...namePath: string[]) => {
  if (namePath.length < 1) {
    throw new Error("Name path not valid");
  }
  const result: SpecialObject = { ...obj };
  let subvalue = result;

  if (namePath.length > 1) {
    const arrNameWithIdxRegexp = new RegExp(/^(\w+)\[(\d+)\]$/g);
    for (const name of namePath.slice(0, -1)) {
      let newSubvalue: SpecialObject;
      if (name.includes("[")) {
        const [arrName, idx] = name.replace(arrNameWithIdxRegexp, "$1 $2").split(" ");
        const arrIdx = Number(idx);
        const arr: SpecialObject[] = (subvalue[arrName] as SpecialObject[]) || Array(arrIdx + 1);
        newSubvalue = subvalue[arrName] != null ? { ...arr[arrIdx] } : {};
        Object.assign(subvalue, {
          [arrName]: [...arr.slice(0, arrIdx), newSubvalue, ...arr.slice(arrIdx + 1)],
        });
      } else {
        newSubvalue = {
          ...(subvalue[name] || {}),
        };
        Object.assign(subvalue, { [name]: newSubvalue });
      }
      subvalue = newSubvalue;
    }
  }
  subvalue[namePath.slice(-1)[0]] = value;

  return result;
};

type SpecialObject = Record<string, unknown>;

type RequiredMutationParams<Script extends string, TResult, TBuilder extends SchemaBuilderType> = {
  argsTypesMap: readonly ParamTypeMapping[] | null;
  affectedQueries: readonly string[] | null;
} & Required<Pick<ApolloMutationParams<Script, TResult, TBuilder>, "schema">> &
  Pick<ApolloMutationParams<Script, TResult, TBuilder>, "options">;
