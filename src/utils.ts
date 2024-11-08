import type {
    ApolloCache,
    DefaultContext,
    DocumentNode,
    LazyQueryHookOptions,
    LazyQueryResultTuple,
    MutationHookOptions,
    MutationTuple,
    NoInfer,
    OperationVariables,
    QueryHookOptions,
    QueryResult,
    TypedDocumentNode
} from "@apollo/client";
import { gql } from "@apollo/client";
import { EntrySchemaBuilder } from "./builder";

export type GqlArgsInfo = Map<string, Array<Array<string>>>;

export enum GqlFieldType {
    STRING = "String",
    STRONG_STRING = "String!",
    FLOAT = "Float",
    INTEGER = "Int",
}

const camelToSnakeCase = (text: string, toUpper = false) => {
    const result = text.split(/(?=[A-Z])/).join('_');

    return toUpper ? result.toUpperCase() : result.toLowerCase();
}

export const getGqlOperationName = (scriptName: string) => camelToSnakeCase(scriptName, true);

const buildGqlScript = (
    isQuery: boolean,
    scriptName: string,
    mapping?: GqlArgsInfo,
    resultBuilder?: EntrySchemaBuilder<object>
) => {
    let params = mapping?.get(scriptName)
        ?.map(([fName, fType]) =>
            `$${fName}: ${fType || GqlFieldType.STRONG_STRING}`
        ).join('\n');
    params = params != null && params.length > 0 ? `(${params})` : '';

    const args = mapping?.get(scriptName)?.map(([fName]) => `${fName}: $${fName}`).join(', ');
    const schema = (args?.length
        ? `(${args})`
        : '') + (resultBuilder?.build(false) || '');

    const operationName = `${isQuery ? "query" : "mutation"} ${camelToSnakeCase(scriptName, true)}`;

    return `${operationName} ${params} { ${scriptName} ${schema} }`;
};

export const buildGqlQueryScript = (
    scriptName: string,
    mapping?: GqlArgsInfo,
    resultBuilder?: EntrySchemaBuilder<object>
) => buildGqlScript(true, scriptName, mapping, resultBuilder);

export const buildGqlMutationScript = (
    scriptName: string,
    mapping?: GqlArgsInfo,
    resultBuilder?: EntrySchemaBuilder<object>
) => buildGqlScript(false, scriptName, mapping, resultBuilder);

export type MutationOptions<
    TData = any,
    TVariables = OperationVariables,
    TContext = DefaultContext,
    TCache extends ApolloCache<any> = ApolloCache<any>
> = MutationHookOptions<NoInfer<TData>, NoInfer<TVariables>, TContext, TCache>;

export type MutationCallback<
    TData = any,
    TVariables = OperationVariables,
    TContext = DefaultContext,
    TCache extends ApolloCache<any> = ApolloCache<any>
> = (
    mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
    options?: MutationOptions<TData, TVariables, TContext, TCache>
) => MutationTuple<TData, TVariables, TContext, TCache>;

export interface MutationInfo<TData = any> {
    callback: MutationCallback<TData>;
    options?: MutationOptions<TData>;
}

type LazyQueryOptions<
    TData = any,
    TVariables extends OperationVariables = OperationVariables
> = LazyQueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>;

type SimpleQueryOptions<
    TData = any,
    TVariables extends OperationVariables = OperationVariables
> = QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>;

export type LazyQueryCallback<
    TData = any,
    TVariables extends OperationVariables = OperationVariables
> = (
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    options?: LazyQueryOptions<TData, TVariables>
) => LazyQueryResultTuple<TData, TVariables>;

type SimpleQueryCallback<
    TData = any,
    TVariables extends OperationVariables = OperationVariables
> = (
    query: DocumentNode | TypedDocumentNode<TData, TVariables>,
    options?: SimpleQueryOptions<TData, TVariables>
) => QueryResult<TData, TVariables>;

export type QueryCallback<TData> = LazyQueryCallback<TData> | SimpleQueryCallback<TData>;
export interface QueryInfo<TCallback extends (QueryCallback<TData>), TData = any> {
    callback: TCallback;
    options?: TCallback extends LazyQueryCallback ? LazyQueryOptions<TData> : SimpleQueryOptions<TData>;
}

export const createMutation = <
    TData = any
>(
    scriptName: string,
    mutationInfo: MutationInfo<TData>,
    resultBuilder?: EntrySchemaBuilder<object> | null,
    argsInfo?: GqlArgsInfo,
) => {
    const script = buildGqlMutationScript(scriptName, argsInfo, resultBuilder || undefined);

    const options = Object.assign({}, mutationInfo.options || {})
    if (options.onError == null) {
        options.onError = (err) => console.error(err.message);
    }

    return mutationInfo.callback(
        gql(script),
        options
    );
};

export const createQuery = <
    TData,
    TCallback extends (QueryCallback<TData>)
>(
    scriptName: string,
    queryInfo: QueryInfo<TCallback, TData>,
    resultBuilder?: EntrySchemaBuilder<object> | null,
    argsInfo?: GqlArgsInfo
) => {
    type ResultType = (
        TCallback extends LazyQueryCallback ?
        LazyQueryResultTuple<TData, OperationVariables>
        : QueryResult<TData>
    );

    const script = buildGqlQueryScript(scriptName, argsInfo, resultBuilder || undefined);

    const options = Object.assign({}, queryInfo.options || {})
    if (options.onError == null) {
        options.onError = (err) => console.error(err.message);
    }

    return queryInfo.callback(
        gql(script),
        options
    ) as ResultType;
};
