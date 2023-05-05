import mongoose from 'mongoose';

export type role = 'ADMIN' | 'CUSTOMER' | 'AGENT' | 'MANAGER';

export type ActionOptions = {
  modelName?: string;
};

export type SearchOptions = {
  searchString?: string;
  searchQuery?: any;
  sort?: [string, any];
  skip?: number;
  limit?: number;
};

export type ResolverOptions = {
  mongoose: typeof mongoose;
  data: Omit<MgqlResolvers, 'handler'>;
};

export type ResolverHandler = (props: {
  parentContext: any;
  variables: any;
  context: any;
  options: ResolverOptions;
  input: any;
  utils: any;
  model: (name?: string) => typeof mongoose.Model;
  actions: {
    create: (input: any, options?: ActionOptions) => Promise<any>;
    search: (input: any, options?: ActionOptions) => Promise<any>;
  };
}) => any;

export type ModelField = {
  _gql?: string;
  _hidden?: boolean;
  _omit?: string[];
  [k: string]: ModelField | ModelField[] | unknown;
};

export type ModelItemOptions = {
  keywords?: {
    enabled: boolean;
    value: string[];
  };
};

export type ModelItem = {
  disableGql?: boolean;
  name?: string;
  fields: ModelField;
  mongooseSchemaOptions?: Object;
  runOptions?: ({ schema }: { schema: mongoose.Schema }) => void;

  // TODO: Not sure if this feature is needed.
  // feat: add this value to the schema eg: displayName: String.
  gqlSchema?: string;
  options?: ModelItemOptions;
};

export type MgqlResolvers = {
  disabled?: boolean;
  resolverType: 'Mutation' | 'Query' | string;
  name?: string;
  returnType: string;
  inputVariable?: string;
  handler: ResolverHandler;
  returnGqlFields?: string;
  model?: string;
  roles?: role[];
  bypassRequiresPassword?: boolean;
};

export type CreateServerOptions = {
  resolvers: MgqlResolvers[];
  typeDefs: string[];
  serverOptions?: any;
};

export type InitDbConfig = {
  uri: string;
  models: ModelItem[];
};

export type InitServerOptions = {
  mongooseConfig: InitDbConfig;
  apolloConfig: CreateServerOptions;
};
