export function extractTweetId(string) {
  if (string === null) { return null; }
  if (string.match(/^[0-9]+$/)) { return string; }
  const testUrl = string.match(/^((?:http:\/\/)?|(?:https:\/\/)?)?(?:www\.)?(?:mobile\.)?twitter\.com\/\w+\/status\/(\d+)(?:\?.*)?$/i);
  if (testUrl) { return testUrl[2]; }
  return null;
}