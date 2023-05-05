import * as R from 'ramda';

export const generateKeywords = (items: string[]) => {
  return R.flatten(
    items.map((item: string | Object) => {
      if (item && typeof item === 'string') {
        return item.split(' ');
      }
      if (R.is(Object, item)) {
        return R.values(item as any) as any;
      }

      return [];
    }),
  )
    .filter((d: any) => d)
    .map((item: any) => {
      if (item.toLocaleLowerCase) {
        return item.toLowerCase();
      }
      return item;
    });
};

export const createLocationFromAddress = (address: any) => {
  const data = [
    address.line1,
    address.line2,
    address.city,
    address.province,
    address.state,
  ].filter((d: string) => d);
  const value = data.join(', ');
  if (!address.zipCode) {
    return value;
  }

  return `${value} ${address.zipCode}`;
};
