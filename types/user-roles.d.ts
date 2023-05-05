import type { role } from './types';
export declare const data: {
    Admin: string;
    Customer: string;
    Agent: string;
    Manager: string;
};
export declare const toArray: () => string[];
export declare const verifyOne: (r: role) => string;
export declare const verifyAll: (r: role[]) => role;
export default data;
