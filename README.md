# Mongoose + Graphql + Apollo all in one

Creating graphql server just got easier

## Getting Started

### Installation

install dependencies

```bash
npm install @mavvy/mgql @apollo/server mongoose graphql
```

### Example
see examples directory [examples](/examples)

### What is MGql?
Basically it generates mongoose schema and graphql schema at the same time from a model array data. Also, it helps create resolvers with additional helpers that has automatic integration to the database.


#### Object model to mongoose and graphql schema
This will be transformed into a mongoose and graphql schema
```javascript
[
  {
    name: 'Comment',
    fields: {
      body: String,
      date: Date,
    },
  },
  {
    name: 'Blog',
    fields: {
      title: String, // String is shorthand for {type: String}
      author: String,
      body: String,
      comments: [
        {
          _gql: '[Comment]',
          body: String,
          date: Date,
        },
      ],
      hidden: Boolean,
      meta: {
        _gql: 'Meta',
        votes: Number,
        favs: Number,
      },
    },
  },
]

```
the above code will create this gql schema below:
```bash
type Comment {
  body: String
  date: String
  createdAt: Float
  updatedAt: Float
  deletedAt: Float
  isDeleted: Boolean
  id: ID
}

type Meta {
  votes: Int
  favs: Int
  createdAt: Float
  updatedAt: Float
  deletedAt: Float
  isDeleted: Boolean
  id: ID
}

type Blog {
  title: String
  author: String
  body: String
  comments: [Comment]
  hidden: Boolean
  meta: Meta
  createdAt: Float
  updatedAt: Float
  deletedAt: Float
  isDeleted: Boolean
  id: ID
}

```
And then will create mongoose schema for ***Comment*** and  ***Blog***
### Usage

```javascript
import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as mgql from '@mavvy/mgql';

const uri = process.env.MONGO_URI as string;
const models = [
  {
    name: 'Comment',
    fields: {
      body: String,
      date: Date,
    },
  },
  {
    name: 'Blog',
    fields: {
      title: String, // String is shorthand for {type: String}
      author: String,
      body: String,
      comments: [
        {
          _gql: '[Comment]',
          body: String,
          date: Date,
        },
      ],
      hidden: Boolean,
      meta: {
        _gql: 'Meta',
        votes: Number,
        favs: Number,
      },
    },
  },
];
const resolvers = [
  {
    name: 'blogs',
    model: 'Blog',
    resolverType: 'Query',
    handler: async ({ model }) => model().find(),
    returnType: '[Blog]',
  },
  {
    name: 'addBlog',
    model: 'Blog',
    resolverType: 'Mutation',
    handler: ({ actions, input }) => actions.create(input),
    inputVariable: 'CreateBlogInput!',
    returnType: 'Blog',
  },
  {
    name: 'addComment',
    model: 'Comment',
    resolverType: 'Mutation',
    inputVariable: 'AddCommentInput!',
    handler: async ({ model, actions, input }) => {
      const blogModel = model('Blog');
      const blog = await blogModel.findById(input.blogId);
      const comment = await actions.create({ body: input.body });

      blog.comments.push(comment);

      await blog.save();

      return comment;
    },
    returnType: 'Comment',
  },
] as mgql.MgqlResolvers[];

const appSchema = `input CreateBlogInput {
  title: String!
  author: String!
  body: String!
}

input AddCommentInput {
  blogId: ID!
  body: String!
}`;

const main = async () => {
  const modelSchema = mgql.toSchema(models);
  await mgql.initDb({ uri, models });

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
|handler|(handlerArgs) => any|the main resolver function|

##### handlerArgs object
|key|description|
|---|-----------|
|parentContext|resolver.parentContext param from apolo|
|variables|resolver.variables param from apollo|
|context|resolver.context param from apollo|
|options|resolver options such as model name, returnType, etc.|
|input|shorthand to return the value from variables.input|
|model|(name?: string) => mongoose.Model . the default name is the model name value from the resolver|
|actions|actions.create is use to add data to db. actions.search is use to find data from the db|
