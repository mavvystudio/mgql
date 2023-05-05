import type { MgqlResolvers, ModelItem } from './types';
export declare const createResolvers: (resolvers: MgqlResolvers[], models: ModelItem[]) => {
    Query: {};
    Mutation: {};
};
export declare const createResolverSchema: (gqlName: string, inputVariable: string, returnType: string) => string;
export declare const createTypeDefs: ({ typeDefs, resolvers, }: {
    typeDefs: string[];
    resolvers: MgqlResolvers[];
}) => string;
export declare const createSchema: (typeDefs: string[], resolvers: MgqlResolvers[], models: ModelItem[]) => {
    typeDefs: string;
    resolvers: {
        Query: {};
        Mutation: {};
    };
};
