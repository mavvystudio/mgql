import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as mgql from '@mavvy/mgql';

const uri = process.env.MONGO_URI as string;
const models = [
  {
    name: 'Book',
    fields: {
      name: String,
    },
  },
];
const resolvers = [
  {
    name: 'books',
    model: 'Book',
    resolverType: 'Query',
    handler: async ({ model }) => model().find(),
    returnType: '[Book]',
  },
  {
    name: 'addBook',
    model: 'Book',
    resolverType: 'Mutation',
    handler: ({ actions, input }) => actions.create(input),
    inputVariable: 'NameInput',
    returnType: 'Book',
  },
] as mgql.MgqlResolvers[];

const appSchema = `input NameInput {
  name: String!
}`;

const main = async () => {
  await mgql.initDb({ uri, models });

  const modelSchema = mgql.toSchema(models);
  const schema = mgql.createSchema(
    [appSchema].concat(modelSchema),
    resolvers,
    models,
  );

  const server = new ApolloServer({
    typeDefs: schema.typeDefs,
    resolvers: schema.resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

main();
