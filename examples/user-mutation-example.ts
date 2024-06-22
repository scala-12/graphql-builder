import { GqlArgsInfo, GqlFieldType, MutationInfo, createMutation } from "../src/utils";
import { IUser, UserField, UserSchemaBuilder } from "./user-schema-example";

export enum UserGqlMutation {
    CREATE_USER = "createUser",

    LOGIN = "login",
    LOGOUT = "logout",
}

interface UserMutationResponse {
    [UserGqlMutation.CREATE_USER]: IUser;

    [UserGqlMutation.LOGIN]: IUser;
    [UserGqlMutation.LOGOUT]: boolean;
}

export enum UserMutationExtraField {
    USER_ID = 'userId',
    ORGANIZATION_ID = 'organizationId',
    ROLE_IDS = 'roleIds',
}

const GQL_QUERY_ARGS: GqlArgsInfo = new Map();
GQL_QUERY_ARGS.set(UserGqlMutation.CREATE_USER, [
    [UserField.EMAIL, GqlFieldType.STRONG_STRING],
    [UserField.FIRST_NAME, GqlFieldType.STRONG_STRING],
    [UserField.LAST_NAME, GqlFieldType.STRONG_STRING],
    [UserField.MIDDLE_NAME, GqlFieldType.STRONG_STRING]]);
GQL_QUERY_ARGS.set(UserGqlMutation.LOGIN, [
    [UserField.EMAIL, GqlFieldType.STRONG_STRING],
    ['password', GqlFieldType.STRONG_STRING]
]);

export const createUserMutation = (
    scriptName: UserGqlMutation,
    mutationInfo: MutationInfo<UserMutationResponse>,
    resultBuilder?: UserSchemaBuilder
) => {
    let builder;
    switch (scriptName) {
        case UserGqlMutation.LOGOUT:
            builder = null;
            break;

        default:
            builder = resultBuilder;
            break;
    }
    return createMutation(
        scriptName,
        mutationInfo,
        () => new UserSchemaBuilder(),
        builder,
        GQL_QUERY_ARGS
    );
};
