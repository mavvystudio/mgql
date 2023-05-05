import * as apollo from '../src/graphql';

const typeDefs = [
  `type User {
  name: String
}`,
  `input SignInInput {
  name: String!
}`,
];

const resolvers = [
  {
    resolverType: 'Query',
    name: 'users',
    returnType: '[User]',
    handler: () => 1,
    returnGqlFields: 'email',
  },
  {
    resolverType: 'Mutation',
    name: 'signIn',
    inputVariable: 'SignInInput!',
    returnType: 'User',
    handler: () => 2,
    returnGqlFields: 'email',
  },
];

describe('apollo', () => {
  it('should create resolvers', () => {
    const res = apollo.createResolvers(resolvers, [
      { fields: { name: String } },
    ]);

    expect(res.Query).toHaveProperty('users');
    expect(res.Mutation).toHaveProperty('signIn');
    expect(typeof (res.Mutation as any).signIn).toEqual('function');
    expect(res.Query['users']).toEqual(expect.any(Function));
  });

  it('should create typeDefs', () => {
    const res = apollo.createTypeDefs({ typeDefs, resolvers });
    expect(res).toEqual(`
type User {
  name: String
}
input SignInInput {
  name: String!
}
type Query {
  users: [User]
}

type Mutation {
  signIn(input: SignInInput!): User
}
`);
  });
});
