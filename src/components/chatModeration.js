// Edit these patterns to change what the chat blocks before sending.
const restrictedContent = [
  /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/u,
  /@[\p{L}\p{N}_]+/u,
  /(?:^|[^\p{L}\p{N}])\+?[0-9](?:[\s().-]*[0-9]){9,14}(?![\p{L}\p{N}])/u,
  /(?:^|[^\p{L}\p{N}_-])(?:(?:whatsapp\.com|wa\.me|instagram\.com|instagr\.am|ig\.me)\.?(?![\p{L}\p{N}_.-])|(?:whatsapp|instagram):\/\/)/u,
];

export function hasRestrictedChatContent(message) {
  const normalizedMessage = message.normalize('NFKC').toLowerCase();
  return restrictedContent.some((pattern) => pattern.test(normalizedMessage));
}
