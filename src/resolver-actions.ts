import { flatten, assoc, pick, values } from 'ramda';
import mongoose from 'mongoose';

import { ModelItem, ActionOptions, SearchOptions } from './types';
import { generateKeywords } from './utils';

type Props = {
  options: any;
  models: ModelItem[];
  modelName: string;
};

const createKeyWords = (
  data: any,
  keywordOption?: { enabled: boolean; value: string[] },
) => {
  if (!keywordOption) {
    return data;
  }
  if (!keywordOption.enabled) {
    return data;
  }
  const keywords = generateKeywords(values(pick(keywordOption.value, data)));
  return assoc('keywords', keywords, data);
};

const createActionData = (options: ActionOptions, props: Props) => {
  const modelName = options.modelName || props.modelName;
  const mgqlModel = props.models.find((item) => item.name === modelName);
  const model = mongoose.model(modelName);

  return {
    modelName,
    mgqlModel,
    model,
  };
};

const createSearchQuery = (search: string, query: any) => {
  if (!search) {
    return query;
  }
  const str = search.split(',').map((item) => item.toLowerCase().trim());
  const searchValue = flatten(str.map((item) => item.split(' ')));

  return {
    ...(query || {}),
    isDeleted: false,
    keywords: {
      $in: searchValue,
    },
  };
};

const search = async (
  input: SearchOptions,
  options: ActionOptions,
  props: Props,
) => {
  const actionData = createActionData(options, props);
  const query = createSearchQuery(input.searchString, input.searchQuery);
  console.log('query', query);

  const find = actionData.model
    .find(query)
    .sort(input.sort)
    .skip(input.skip)
    .limit(input.limit);

  const count = await find.estimatedDocumentCount();
  const nodes = await find;

  const data = {
    nodes,
    count,
  };

  return data;
};

const create = (input: any, options: ActionOptions, props: Props) => {
  const actionData = createActionData(options, props);

  const inputData = {
    ...input,
    isDeleted: false,
  };
  const data = createKeyWords(
    inputData,
    actionData.mgqlModel.options?.keywords,
  );

  return actionData.model.create(data);
};

export const init = (props: Props) => {
  return {
    create: (input: any, options?: ActionOptions) =>
      create(input, options || {}, props),
    search: (input: any, options?: ActionOptions) =>
      search(input, options || {}, props),
  };
};

/*
 await actions.create(input)

 await actions.create(input, {modelName: 'Clinic'})

 await actions.search(input)

 await actions.search(input, {modelName: 'Clinic'})
 
 */
