# Mongoose + Graphql + Apollo all in one

## Getting Started

### Installation

install dependencies

```bash
npm install @mavvy/mgql @apollo/server mongoose graphql
```

### Example
see examples directory [examples](/examples)

### Usage

```javascript
import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as mgql from '@mavvy/mgql';

const uri = process.env.MONGO_URI;
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
    handler: () => {},
    returnType: '[Book]',
  },
  {
    name: 'addBook',
    model: 'Book',
    resolverType: 'Mutation',
    handler: () => {},
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

```

### API

#### Models

|key|type|description|
|---|-------|----|
|name|string|name of the mongoose schema|
|fields|object|properties of the schema. The shape of the documents within that collection|


#### Resolvers

A resolver item is a configuration to create a Query or Mutation (Subscriptions soon).


|key|type|description|
|---|-------|----|
|name|string|name of the resolver|
|model|string?|name of the mongoose model to use inside the handler|
|resolverType|Query \| Mutation|type of the resolver|
|returnType|string|Schema name of the return data|
|inputVariable|string?|Schema name of the input|
|disabled|boolean?|disables the resolver|
|roles|string[]?|array of roles that is authorized to use the resolver|
|handler|Function|the main resolver function|

##### handler args object
|key|description|
|---|-----------|
|parentContext||
|variables||
|context||
|options||
|input||
|model||
|actions||
