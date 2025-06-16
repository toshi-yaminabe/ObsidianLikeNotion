const { extractPageId } = require('../extension/pageUtils');

test('extract page id from notion url', () => {
  const url = 'https://www.notion.so/My-Title-9c3014d857aa452aa10d6bdfe58c3a12';
  expect(extractPageId(url)).toBe('MyTitle9c3014d857aa452aa10d6bdfe58c3a12');
});

test('ignore query and fragments', () => {
  const url = 'https://www.notion.so/Some-Page-1234567890abcdef12345678?foo=1#section';
  expect(extractPageId(url)).toBe('SomePage1234567890abcdef12345678');
});
