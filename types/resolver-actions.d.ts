import { ModelItem, ActionOptions } from './types';
type Props = {
    options: any;
    models: ModelItem[];
    modelName: string;
};
export declare const init: (props: Props) => {
    create: (input: any, options?: ActionOptions) => Promise<any>;
    search: (input: any, options?: ActionOptions) => Promise<{
        nodes: any[];
        count: number;
    }>;
};
export {};
