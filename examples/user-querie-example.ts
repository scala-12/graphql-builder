import { useQuery } from "@apollo/client";
import { GqlArgsInfo, GqlFieldType, QueryCallback, QueryInfo, createQuery } from "../src/utils";
import { IRole, IUser, RoleSchemaBuilder, UserField, UserSchemaBuilder } from "./user-schema-example";

export enum UserGqlQuery {
    CURRENT_USER = 'currentUser',
    USER = 'user',
    USERS = 'users',
    ROLES = 'roles',
}

interface UserQueryResponse {
    [UserGqlQuery.CURRENT_USER]: IUser;
    [UserGqlQuery.USER]: IUser;
    [UserGqlQuery.USERS]: IUser[];
    [UserGqlQuery.ROLES]: IRole[];
}

export enum UserQueryExtraField {
    OWNER_ORGANIZATION_ID = 'ownerOrganizationId',
}

const GQL_QUERY_ARGS: GqlArgsInfo = new Map();
GQL_QUERY_ARGS.set(UserGqlQuery.USER, [
    [UserField.ID, GqlFieldType.STRING],
]);
GQL_QUERY_ARGS.set(UserGqlQuery.USERS, [
    [UserQueryExtraField.OWNER_ORGANIZATION_ID, GqlFieldType.STRING],
]);

export const createUserQuery = <TCallback extends QueryCallback<UserQueryResponse>>(
    scriptName: UserGqlQuery,
    queryInfo: QueryInfo<TCallback, UserQueryResponse>,
    resultBuilder?: UserSchemaBuilder
) => createQuery<UserQueryResponse, TCallback>(
    scriptName,
    queryInfo,
    () => new UserSchemaBuilder(),
    scriptName === UserGqlQuery.ROLES ?
        new RoleSchemaBuilder()
        : resultBuilder
);

const { loading, data } = createUserQuery(
    UserGqlQuery.CURRENT_USER,
    { callback: useQuery },
    new UserSchemaBuilder()
        .setFields(UserField.LAST_NAME, UserField.FIRST_NAME)
);
const user = data?.[UserGqlQuery.CURRENT_USER];
