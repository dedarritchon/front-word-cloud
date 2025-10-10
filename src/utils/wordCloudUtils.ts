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
  maxWords: 150,
  rotationAngles: [0, 90, -90],
  colors: ['#1a365d', '#2c5282', '#2b6cb0', '#3182ce', '#4299e1', '#63b3ed', '#4c51bf', '#553c9a', '#6b46c1', '#805ad5'],
  backgroundColor: '#ffffff',
  spiral: 'archimedean',
};

export function generateWordCloudData(text: string, maxWords: number = 100, stopWords: Set<string> = new Set(), colors: string[] = defaultWordCloudConfig.colors): WordCloudData[] {
  // Improved text processing with stopwords removal
  const words = text
    .split(/[\s.]+/g)
    .map(w => w.replace(/^["'"\-—()\[\]{}]+/g, ""))
    .map(w => w.replace(/[;:.!?()\[\]{},"''"\-—]+$/g, ""))
    .map(w => w.replace(/['']s$/g, ""))
    .map(w => w.substring(0, 30))
    .map(w => w.toLowerCase())
    .filter(w => w && !stopWords.has(w) && w.length > 2); // Filter out very short words

  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .map(([text, count], index) => ({
      text,
      weight: count * 10, // Scale up for better visualization
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxWords); // Configurable limit for word cloud
}

export function validateWordCloudData(data: WordCloudData[]): boolean {
  return Array.isArray(data) && data.every(item => 
    typeof item.text === 'string' && 
    typeof item.weight === 'number' && 
    item.weight > 0
  );
}
