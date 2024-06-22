import { EntrySchemaBuilder } from "../src";

export enum RoleField {
    ID = 'id',
    NAME = 'name',
    DESCRIPTION = 'description'
}

export interface IRole {
    [RoleField.ID]: string;
    [RoleField.NAME]: string;
    [RoleField.DESCRIPTION]: string;
}

export class RoleSchemaBuilder extends EntrySchemaBuilder<RoleField> {
    constructor(entryName?: string) {
        super("UserRole", RoleField, entryName);
    }
}

export enum UserField {
    ID = 'id',
    FIRST_NAME = 'firstName',
    LAST_NAME = 'lastName',
    MIDDLE_NAME = 'middleName',
    EMAIL = 'email',
    ROLES = 'roles',
    PHONE_NUMBER = 'phoneNumber',
}

export interface IUser {
    [UserField.ID]: string;
    [UserField.FIRST_NAME]: string;
    [UserField.LAST_NAME]: string;
    [UserField.MIDDLE_NAME]?: string;
    [UserField.EMAIL]: string;
    [UserField.PHONE_NUMBER]: string;

    [UserField.ROLES]: IRole[];
}

export class UserSchemaBuilder extends EntrySchemaBuilder<UserField> {
    constructor(entryName?: string) {
        super(
            "User",
            UserField,
            entryName,
            [UserField.ROLES, name => new RoleSchemaBuilder(name)]
        );
    }
}

const userSchemaBuilder = new UserSchemaBuilder().setFields(
    UserField.ID,
    UserField.LAST_NAME,
    UserField.FIRST_NAME
);
userSchemaBuilder.addComplex(
    userSchemaBuilder.getComplexBuilder(UserField.ROLES)
);
// User {id lastName firstName roles { id name description }}
console.log(userSchemaBuilder.build());

userSchemaBuilder.useSimpleFields(true);
// User {id lastName firstName middleName email phoneNumber roles { id name description }}
console.log(userSchemaBuilder.build());

// {id lastName firstName middleName email phoneNumber roles { id name description }}
console.log(userSchemaBuilder.build(false));