export function extractThinkingMessage(text: string): string | null {
  const match = text.match(/<think>(.*?)<\/think>/s);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function extractNonThinkingMessage(text: string): string {
  return text.replace(/<think>(.*?)<\/think>/gs, "").trim();
}