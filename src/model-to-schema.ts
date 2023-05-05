import * as R from 'ramda';
import mongoose from 'mongoose';

import type { ModelItem } from './types';

export type ModelSchemaItem = {
  key: string;
  value: string;
};

export type ModelSchemaField = {
  _gql?: string;
  _hidden?: boolean;
  _omit?: string[];
  _override?: boolean;
  required?: boolean;
  default?: any;
  select?: any;
  validate?: any;
  get?: any;
  set?: any;
  alias?: any;
  immutable?: any;
  transform?: any;
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: any;
  match?: any;
  enum?: any;
  minLength?: any;
  maxLength?: any;
  populate?: any;
  index?: any;
  unique?: any;
  min?: any;
  max?: any;
  expires?: any;
  [k: string]: any;
};

const modelSchemaDefaultFields = [
  '_gql',
  '_hidden',
  // '_isObject',
  '_omit',
  '_override',
];
const mongooseSchemaFields = [
  'alias',
  'default',
  'get',
  'immutable',
  'lowercase',
  'uppercase',
  'trim',
  'match',
  'enum',
  'minLength',
  'maxLength',
  'populate',
  'index',
  'unique',
  'min',
  'max',
  'expires',
  'required',
  'select',
  'set',
  'transform',
  'type',
  'validate',
];

const isObject = (item: { [k: string]: any }) => {
  return Boolean(Object.entries(item).length);
};

const transformSchemaType = (fieldType: unknown) => {
  if (R.equals(String, fieldType)) {
    return 'String';
  }
  if (R.equals(Number, fieldType)) {
    return 'Int';
  }
  if (R.equals(Boolean, fieldType) || fieldType === 'Bool') {
    return 'Boolean';
  }
  if (
    R.equals(mongoose.Schema.Types.ObjectId, fieldType) ||
    fieldType === 'Oid'
  ) {
    return 'ID';
  }
  if (R.equals(mongoose.Schema.Types.Decimal128, fieldType)) {
    return 'Float';
  }
  if (R.equals(Date, fieldType)) {
    return 'String';
  }
  return 'String';
};

const getPureSchemaFields = (fields: ModelSchemaField) => {
  const omit = R.defaultTo([], fields._omit);

  const omitFields = [
    ...modelSchemaDefaultFields,
    ...mongooseSchemaFields,
    ...omit,
  ];
  const obj = R.omit(omitFields, fields);
  return obj;
};

const shouldAdd = (
  name: string,
  item: ModelSchemaField,
  items: ModelSchemaItem[],
) => {
  const isExisting = items.find((d) => d.key === name);
  if (['String', 'Int', 'ID', 'Boolean'].includes(name)) {
    return false;
  }
  if (!item._override && isExisting) {
    return false;
  }
  if (item._override && isExisting) {
    return true;
  }
  return true;
};

const removeArrSymbol = (name: string) =>
  name ? name.replace('[', '').replace(']', '') : null;

const handler = (name: string, fields: any, data: ModelSchemaItem[] = []) => {
  if (!name) {
    return data;
  }
  const fieldValue = Object.entries(fields).reduce((c: string, n: any) => {
    const [k, v] = n;
    const pureSchemaObj = getPureSchemaFields(v);

    if (v._hidden === true) {
      return c;
    }

    if (Array.isArray(v)) {
      const arrayItem = v[0];
      handler(
        removeArrSymbol(arrayItem._gql),
        getPureSchemaFields(arrayItem),
        data,
      );
      return `${c}
${k}: ${arrayItem._gql || transformSchemaType(arrayItem.type || arrayItem)}`;
    }
    if (v._gql && isObject(pureSchemaObj)) {
      shouldAdd(v._gql, v, data) && handler(v._gql, pureSchemaObj, data);
      return `${c}
${k}: ${v._gql}`;
    }
    if (v._gql) {
      return `${c}
${k}: ${v._gql}`;
    }
    const schemaType = transformSchemaType(v.type || v);

    return `${c}
${k}: ${schemaType}`;
  }, '');

  data.push({ key: name, value: fieldValue });

  return data;
};
const addDefaults = (model: ModelItem) => {
  if (((model.mongooseSchemaOptions as any) || {}).timestamps) {
    return {
      ...model.fields,
      createdAt: mongoose.Schema.Types.Decimal128,
      updatedAt: mongoose.Schema.Types.Decimal128,
      deletedAt: mongoose.Schema.Types.Decimal128,
      isDeleted: Boolean,
    };
  }
  return model.fields;
};

const createSchemaFromModelItem = (
  model: ModelItem,
  models: ModelSchemaItem[],
) => {
  const fields = addDefaults(model);
  handler(model.name, getPureSchemaFields(fields), models);
};

export const toTypeDefs = (items: { key: string; value: string }[]) => {
  const data = items.reduce(
    (prev, curr) => ({ ...prev, [curr.key]: curr.value }),
    {},
  );
  return Object.entries(data).reduce(
    (prev, curr) => `${prev}
type ${curr[0]} {${curr[1]}
  id: ID
}`,
    '',
  );
};

export const modelsToSchema = (models: ModelItem[]) => {
  const schema: ModelSchemaItem[] = [];

  models.forEach((item) => {
    if (!item.disableGql) {
      createSchemaFromModelItem(item, schema);
    }
  });

  return schema;
};

export const toSchema = (models: ModelItem[]) => {
  const data = modelsToSchema(models);
  return toTypeDefs(data);
};
