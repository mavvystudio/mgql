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
