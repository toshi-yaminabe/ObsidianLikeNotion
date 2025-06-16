const { getToken } = require('../extension/background.js');

describe('getToken', () => {
  test('returns token from chrome storage', async () => {
    global.chrome = {
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({ token: 'abc123' }),
        },
      },
    };

    const token = await getToken();
    expect(token).toBe('abc123');
  });
});
