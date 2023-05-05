import { omit, defaultTo } from 'ramda';
import mongoose from 'mongoose';

import type { MgqlResolvers, ModelItem } from './types';
import * as resolverUtils from './resolver-utils';
import * as resolverActions from './resolver-actions';

const verifyRequiredPassword = (
  user: any,
  options: Omit<MgqlResolvers, 'handler'>,
) => {
  if (options.bypassRequiresPassword) {
    return undefined;
  }
  const noRoleDefined = !options.roles || !options.roles.length;
  if (noRoleDefined) {
    return undefined;
  }
  if (process.env.REQUIRES_PASSWORD !== 'true') {
    return undefined;
  }
  if (!user.password) {
    throw new Error('registration_not_done');
  }
};

const verifyRole = (context: any, roles?: string[]) => {
  if (!roles || !roles.length) {
    return undefined;
  }

  if (!context.user) {
    throw new Error('not_authorized');
  }

  if (!roles.includes(context.user.role)) {
    throw new Error('user_not_authorized');
  }

  return undefined;
};

const getModelFromReturnType = (returnType: string) => {
  return returnType.replace('[', '').replace(']', '');
};

const initResolverFunction =
  (
    options: Omit<MgqlResolvers, 'handler'>,
    handler: any,
    models: ModelItem[],
  ) =>
  (parentContext: any, variables: any, context: any) => {
    verifyRole(context, options.roles);
    verifyRequiredPassword(context.user, options);

    const modelName = defaultTo(
      getModelFromReturnType(options.returnType),
      options.model,
    );

    const o = {
      data: options,
      mongoose,
    };

    const modelFn = (name: string) => mongoose.model(name || modelName);
    const actions = resolverActions.init({ options, models, modelName });
    const input = variables?.input;
    const props = {
      parentContext,
      input,
      variables,
      context,
      options: o,
      actions,
      model: modelFn,
      utils: resolverUtils,
    };

    return handler(props);
  };

export const createResolvers = (
  resolvers: MgqlResolvers[],
  models: ModelItem[],
) => {
  const obj = {
    Query: {},
    Mutation: {},
  };
  resolvers.forEach((d) => {
    if (d.disabled) {
      return undefined;
    }
    const options = omit(['handler'], d);
    obj[d.resolverType][d.name] = initResolverFunction(
      options,
      d.handler,
      models,
    );
  });

  return obj;
};

export const createResolverSchema = (
  gqlName: string,
  inputVariable: string,
  returnType: string,
) => {
  if (!inputVariable) {
    return `${gqlName}: ${returnType}`;
  }
  return `${gqlName}(input: ${inputVariable}): ${returnType}`;
};

export const createTypeDefs = ({
  typeDefs,
  resolvers,
}: {
  typeDefs: string[];
  resolvers: MgqlResolvers[];
}) => {
  const obj = {
    Query: [],
    Mutation: [],
  };
  resolvers.forEach((d) => {
    if (d.disabled) {
      return undefined;
    }
    const gqlName = createResolverSchema(d.name, d.inputVariable, d.returnType);
    obj[d.resolverType].push(gqlName);
  });
  return `
${typeDefs.join('\n')}
type Query {
  ${obj.Query.join('\n')}
}

type Mutation {
  ${obj.Mutation.join('\n')}
}
`;
};

export const createSchema = (
  typeDefs: string[],
  resolvers: MgqlResolvers[],
  models: ModelItem[],
) => {
  return {
    typeDefs: createTypeDefs({ typeDefs, resolvers }),
    resolvers: createResolvers(resolvers, models),
  };
};

// export const autoGenerateResolver = (data: MgqlResolvers[]) => {};
