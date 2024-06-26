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

const buildGqlScript = (
    isQuery: boolean,
    scriptName: string,
    mapping?: GqlArgsInfo,
    resultBuilder?: EntrySchemaBuilder<any>
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
    resultBuilder?: EntrySchemaBuilder<any>
) => buildGqlScript(true, scriptName, mapping, resultBuilder);

export const buildGqlMutationScript = (
    scriptName: string,
    mapping?: GqlArgsInfo,
    resultBuilder?: EntrySchemaBuilder<any>
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
    FieldEnum extends string = string,
    SchemaBuilder extends EntrySchemaBuilder<FieldEnum> = EntrySchemaBuilder<FieldEnum>,
    TData = any
>(
    scriptName: string,
    mutationInfo: MutationInfo<TData>,
    defaultBuilder: (() => SchemaBuilder) | undefined,
    resultBuilder?: SchemaBuilder | null,
    argsInfo?: GqlArgsInfo,
) => {
    let builder: SchemaBuilder | undefined = undefined;
    if (resultBuilder !== null) {
        if (resultBuilder != null) {
            builder = resultBuilder;
        } else if (defaultBuilder != null) {
            builder = defaultBuilder();
        }
    }

    const script = buildGqlMutationScript(scriptName, argsInfo, builder);

    return mutationInfo.callback(
        gql(script),
        mutationInfo.options
    );
};

export const createQuery = <
    TData,
    TCallback extends (QueryCallback<TData>),
    FieldEnum extends string = string,
    SchemaBuilder extends EntrySchemaBuilder<FieldEnum> = EntrySchemaBuilder<FieldEnum>,
>(
    scriptName: string,
    queryInfo: QueryInfo<TCallback, TData>,
    defaultBuilder: (() => SchemaBuilder) | undefined,
    resultBuilder?: SchemaBuilder | null,
    argsInfo?: GqlArgsInfo
) => {
    type ResultType = (
        TCallback extends LazyQueryCallback ?
        LazyQueryResultTuple<TData, OperationVariables>
        : QueryResult<TData>
    );

    let builder: SchemaBuilder | undefined = undefined;
    if (resultBuilder !== null) {
        if (resultBuilder != null) {
            builder = resultBuilder;
        } else if (defaultBuilder != null) {
            builder = defaultBuilder();
        }
    }

    const script = buildGqlQueryScript(scriptName, argsInfo, builder);

    return queryInfo.callback(
        gql(script),
        queryInfo.options
    ) as ResultType;
};
