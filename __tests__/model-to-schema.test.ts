import mongoose from 'mongoose';

import { modelsToSchema, toTypeDefs, toSchema } from '../src/model-to-schema';

const defaultTypeDefs = `createdAt: Float
updatedAt: Float
deletedAt: Float
isDeleted: Boolean`;

const addDefaults = (data: string) => `${data}
${defaultTypeDefs}`;

const models = [
  {
    name: null,
    fields: {
      name: String,
    },
  },
  {
    disableGql: true,
    name: 'Todo',
    fields: {
      title: String,
    },
    mongooseSchemaOptions: {
      timestamps: true,
    },
  },
  {
    name: 'Editor',
    fields: {
      name: String,
    },
    mongooseSchemaOptions: {
      timestamps: true,
    },
  },
  {
    name: 'Author',
    fields: {
      _omit: ['version'],
      name: String,
      birthday: Date,
      version: Number,
    },
  },
  {
    name: 'Book',
    fields: {
      title: {
        type: String,
        required: true,
      },
      version: Number,
      cannotSee: {
        type: Boolean,
        _hidden: true,
      },
      publisher: {
        _gql: 'Publisher',
        name: String,
        id: mongoose.Schema.Types.ObjectId,
      },
      editor: {
        _gql: 'Editor',
        _override: true,
        name: String,
        position: {
          _gql: 'String',
        },
      },
      author: {
        _gql: 'Author',
        name: String,
        id: mongoose.Schema.Types.ObjectId,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      price: mongoose.Schema.Types.Decimal128,
      comments: [
        {
          _gql: '[Comment]',
          body: String,
          date: Date,
          user: {
            _gql: 'User',
            name: String,
            id: mongoose.Schema.Types.ObjectId,
          },
        },
      ],
    },
  },
];
describe('model-to-schema function', () => {
  it('should generate gql schema', () => {
    const res = modelsToSchema(models);
    expect(res.find((d) => d.key === 'User')).toBeTruthy();
    expect(res.length).toEqual(7);

    expect(res[0].key).toEqual('Editor');
    expect(res[0].value).toEqual(
      addDefaults(`
name: String`),
    );

    expect(res[1].key).toEqual('Author');
    expect(res[1].value).toEqual(
      addDefaults(`
name: String
birthday: String`),
    );

    expect(res[2].key).toEqual('Publisher');
    expect(res[2].value).toEqual(
      addDefaults(`
name: String
id: ID`),
    );

    expect(res[3].key).toEqual('Editor');
    expect(res[3].value).toEqual(
      addDefaults(`
name: String
position: String`),
    );

    expect(res[4].key).toEqual('User');
    expect(res[4].value).toEqual(
      addDefaults(`
name: String
id: ID`),
    );

    expect(res[5].key).toEqual('Comment');
    expect(res[5].value).toEqual(
      addDefaults(`
body: String
date: String
user: User`),
    );

    expect(res[6].key).toEqual('Book');
    expect(res[6].value).toEqual(
      addDefaults(`
title: String
version: Int
publisher: Publisher
editor: Editor
author: Author
isActive: Boolean
price: Float
comments: [Comment]`),
    );
  });

  it('should convert to typedefs', () => {
    const val = [
      {
        key: 'foo',
        value: 'name: String',
      },
      {
        key: 'bar',
        value: 'name: String',
      },
      {
        key: 'foo',
        value: 'position: String',
      },
    ];
    const res = toTypeDefs(val);

    expect(res).toEqual(`
type foo {position: String
  id: ID
}
type bar {name: String
  id: ID
}`);
  });

  it('should transform from models to schema', () => {
    const models = [
      {
        name: 'User',
        fields: {
          name: String,
        },
      },
    ];

    const res = toSchema(models);
    expect(res).toEqual(`
type User {
name: String${addDefaults('')}
  id: ID
}`);
  });
});
