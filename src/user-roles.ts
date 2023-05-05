import type { role } from './types';

export const data = {
  Admin: 'ADMIN',
  Customer: 'CUSTOMER',
  Agent: 'AGENT',
  Manager: 'MANAGER',
};

export const toArray = () => Object.values(data);

export const verifyOne = (r: role) => toArray().find((d) => d === r);

export const verifyAll = (r: role[]) =>
  r.find((d) => toArray().find((dd) => dd === d));

export default data;
