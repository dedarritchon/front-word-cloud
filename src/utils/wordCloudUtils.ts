import { WordCloudData, WordCloudConfig } from '../types/wordCloud';

export const defaultWordCloudConfig: WordCloudConfig = {
  width: 800,
  height: 600,
  padding: 5,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontSize: 2000,
  minFontSize: 100,
  maxFontSize: 2000,
  maxWords: 500,
  rotationAngles: [0, 90, -90],
  colors: ['#1a365d', '#2c5282', '#2b6cb0', '#3182ce', '#4299e1', '#63b3ed', '#4c51bf', '#553c9a', '#6b46c1', '#805ad5'],
  backgroundColor: '#ffffff',
  spiral: 'archimedean',
};

const LEADING_PUNCT = /^["'"\-—()\[\]{}!?]+/g;
const TRAILING_PUNCT = /[;:.!?()\[\]{},"''"\-—]+$/g;
const POSSESSIVE = /['']s$/;
const WHITESPACE_OR_PERIOD = /[\s.!?]+/;

export function generateWordCloudData(
  text: string,
  maxWords: number = 100,
  stopWords: Set<string> = new Set(),
  colors: string[] = defaultWordCloudConfig.colors,
): WordCloudData[] {
  const tokens = text.split(WHITESPACE_OR_PERIOD);
  const wordCount: Record<string, number> = {};

  for (let i = 0; i < tokens.length; i++) {
    let w = tokens[i]
      .replace(LEADING_PUNCT, '')
      .replace(TRAILING_PUNCT, '');

    if (POSSESSIVE.test(w)) {
      w = w.slice(0, -2);
    }

    if (w.length > 30) {
      w = w.substring(0, 30);
    }

    w = w.toLowerCase();

    if (w.length > 1 && !stopWords.has(w)) {
      wordCount[w] = (wordCount[w] || 0) + 1;
    }
  }

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords)
    .map(([text, count], index) => ({
      text,
      weight: count,
      color: colors[index % colors.length],
    }));
}
