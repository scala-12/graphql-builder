import { SchemaBuilder } from "graphql-light-builder";

export type SchemaBuilderType = SchemaBuilder<string> | string | null;

export type NonEmpty<T> = keyof T extends never ? never : T;
