import mongoose from 'mongoose';
import type { ModelItem, InitDbConfig } from './types';
export declare const dbConnect: (uri: string) => Promise<typeof mongoose>;
export declare const cleanSchema: (data: ModelItem[]) => ModelItem[];
export declare const initModels: (models: ModelItem[]) => void;
export declare const initDb: (options: InitDbConfig) => Promise<typeof mongoose>;
