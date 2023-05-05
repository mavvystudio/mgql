import mongoose from 'mongoose';
import { dbConnect, cleanSchema } from '../src/db';

const uri = 'my_uri';

describe('db', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to connect to db', async () => {
    const spy = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce(mongoose);
    const res = await dbConnect(uri);

    expect(spy).toHaveBeenCalledWith(uri, { bufferCommands: false });
    expect(res).not.toBeNull();
    await dbConnect(uri);
    expect(spy).toHaveBeenCalledTimes(1);
    await expect(async () => {
      await dbConnect(null);
    }).rejects.toThrowError();
  });

  it('should handle invalid connection', async () => {
    jest.spyOn(mongoose, 'connect').mockRejectedValueOnce('conn_error');

    await expect(async () => {
      await dbConnect(uri);
    }).rejects.toEqual('conn_error');
  });

  it('should clean model to use in mongoose schema', () => {
    const models = [
      {
        name: 'foo',
        fields: {
          _gql: 'Foo',
          name: {
            _gql: 'PersonName',
            firstName: String,
            middleName: String,
            lastName: String,
          },
        },
      },
      {
        name: 'bar',
        fields: {
          _override: true,
          _gql: 'Bar',
          address: {
            _gql: 'Address',
            line1: String,
          },
        },
      },
      {
        name: 'baz',
      },
    ];
    const res = cleanSchema(models as any);

    expect(res.length).toEqual(3);

    expect(res[0]).toEqual({
      name: 'foo',
      fields: {
        name: {
          firstName: String,
          middleName: String,
          lastName: String,
        },
      },
    });

    expect(res[1]).toEqual({
      name: 'bar',
      fields: {
        address: {
          line1: String,
        },
      },
    });
  });
});
