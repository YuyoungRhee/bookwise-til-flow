export function normalizeChapterText(input: string): string {
  return input
    .replace(/\s+/g, '') // 모든 공백 제거
    .toLowerCase(); // 대소문자 구분 안함
}

export function generateChapterHash(normalizedText: string): string {
  // crypto is not available in browser, use simple hash
  let hash = 0;
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}


export function parseChapterList(input: string): string[] {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

export function formatChapterList(chapters: string[]): string {
  return chapters.join('\n');
}