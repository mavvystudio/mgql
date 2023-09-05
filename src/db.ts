import * as R from 'ramda';
import mongoose from 'mongoose';

import type { ModelItem, InitDbConfig } from './types';

export const dbConnect = async (uri: string) => {
  if (!uri) {
    throw new Error('DB ERROR: uri_empty');
  }
  const opts = {
    bufferCommands: false,
  };

  const conn = await mongoose.connect(uri, opts);

  return conn;
};

/**
 * Remove keys prefixed with "_". Those fields are considered to be
 * used only on graphql schema creation.
 */
export const cleanSchema = (data: ModelItem[]) => {
  const handler = (obj: unknown) => {
    const omits = (Object.keys(obj) || []).filter((d) => d[0] === '_');
    const filtered = R.omit(omits, obj);

    return Object.entries(filtered).reduce((c, n) => {
      const [k, v] = n;

      /**
       * If the value is an Object or an Array, internal
       * values should be checked.
       */
      if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length) {
        return {
          ...c,
          [k]: handler(v),
        };
      }
      if (Array.isArray(v)) {
        return {
          ...c,
          [k]: [handler(v[0])],
        };
      }
      return {
        ...c,
        [k]: v,
      };
    }, {});
  };
  data.map((item) => {
    if (item.fields) {
      const fields = handler(item.fields);
      item.fields = fields;
    }
    return item;
  });

  return data;
};

export const initModels = (models: ModelItem[]) => {
  const data = cleanSchema(models);
  data.forEach((d) => {
    try {
      const schema = new mongoose.Schema(
        {
          deletedAt: Date,
          createdAt: Date,
          updatedAt: Date,
          isDeleted: Boolean,
          ...(d.fields as any),
        },
        {
          timestamps: true,
          ...(d.mongooseSchemaOptions || {}),
        },
      );

      if (d.runOptions) {
        d.runOptions({ schema });
      }

      mongoose.model(d.name, schema);
    } catch (e) {}
  });
};

export const initDb = async (options: InitDbConfig) => {
  const conn = await dbConnect(options.uri);

  initModels(options.models);

  return conn;
};
