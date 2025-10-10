import React, { useRef, useState, useMemo, memo } from 'react';
import styled from 'styled-components';
import { Word, WordCloud, WordCloudProps, AnimatedWordRenderer } from '@isoterik/react-word-cloud';
import { WordCloudData, WordCloudConfig } from '../types/wordCloud';
import { Button, VisualSizesEnum } from '@frontapp/ui-kit';
import { FaDownload } from 'react-icons/fa';
import { useColorContext } from '../context/ColorContext';

interface WordCloudComponentProps {
  data: WordCloudData[];
  config: WordCloudConfig;
  className?: string;
}

const WordCloudContainer = styled.div<{ config: WordCloudConfig }>`
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: ${props => props.config.backgroundColor};
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DownloadButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
`;


const WordCloudWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const WordCloudComponent: React.FC<WordCloudComponentProps> = ({ data, config, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const colorContext = useColorContext();
  const [downloadOptions] = useState({
    transparent: true,
    highQuality: true
  });

  // Memoize the words array to prevent unnecessary re-renders
  const words: Word[] = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return data.map(item => ({
      text: item.text,
      value: item.weight,
    }));
  }, [data]);

  // Memoize the fill function to prevent unnecessary re-renders
  const fillFunction = useMemo(() => {
    return (_: Word, index: number) => colorContext.state.colors[index % colorContext.state.colors.length];
  }, [colorContext.state.colors]);

  // Memoize the fontSize function
  const fontSizeFunction = useMemo(() => {
    const wordCount = words.length;
    
    // Calculate scaling factor based on word count
    // Fewer words = larger scaling factor to use more space
    let scaleFactor: number;
    let maxSize: number;
    let minSize: number;
    
    if (wordCount <= 30) {
      // Very few words - use most of the space
      scaleFactor = 1.2;
      maxSize = 120;
      minSize = 24;
    } else if (wordCount <= 60) {
      // Few words - use more space
      scaleFactor = 0.8;
      maxSize = 80;
      minSize = 18;
    } else if (wordCount <= 100) {
      // Moderate number of words
      scaleFactor = 0.5;
      maxSize = 60;
      minSize = 14;
    } else {
      // Many words - use less space per word
      scaleFactor = 0.3;
      maxSize = 45;
      minSize = 12;
    }
    
    return (word: Word) => Math.max(
      minSize,
      Math.min(maxSize, word.value * scaleFactor + minSize)
    );
  }, [words.length]);

  // Create animated word renderer with staggered animation delays
  const animatedWordRenderer: WordCloudProps["renderWord"] = useMemo(() => {
    return (data, ref) => (
      <AnimatedWordRenderer 
        ref={ref} 
        data={data} 
        animationDelay={(_word, index) => index * 10} 
      />
    );
  }, []);

  // Memoize the entire WordCloud component to prevent unnecessary re-renders
  const memoizedWordCloud = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    
    return (
      <WordCloud
        key={`wordcloud-${colorContext.state.colors.join(',')}-${colorContext.state.gradientSteps}-${colorContext.state.colorMode}`}
        ref={svgRef}
        words={words}
        width={config.width}
        height={config.height}
        fontSize={fontSizeFunction}
        padding={2} // Smaller padding for more words
        fill={fillFunction}
        enableTooltip
        spiral="archimedean" // Better spiral for more words
        renderWord={animatedWordRenderer}
      />
    );
  }, [words, fillFunction, fontSizeFunction, animatedWordRenderer, colorContext.state.colors, colorContext.state.gradientSteps, colorContext.state.colorMode, config.width, config.height, data]);

  // Download PNG functionality
  const downloadPNG = async () => {
    if (!svgRef.current) return;

    try {
      // Get SVG element
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      
      // Create high-resolution canvas
      const scale = downloadOptions.highQuality ? 3 : 1; // 3x for high quality, 1x for normal
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size with higher resolution
      canvas.width = config.width * scale;
      canvas.height = config.height * scale;

      // Scale the context for high DPI
      ctx.scale(scale, scale);

      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, config.width, config.height);
        
        // Add background if not transparent
        if (!downloadOptions.transparent) {
          ctx.fillStyle = config.backgroundColor;
          ctx.fillRect(0, 0, config.width, config.height);
        }
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, config.width, config.height);

        // Convert to PNG with transparency and download
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.download = `word-cloud-${new Date().toISOString().split('T')[0]}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
          }
        }, 'image/png');

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Error downloading PNG:', error);
    }
  };

  return (
    <WordCloudContainer ref={containerRef} config={config} className={className}>
      <WordCloudWrapper>
        <DownloadButtonContainer>
          <Button
            size={VisualSizesEnum.SMALL}
            onClick={downloadPNG}
          >
            <FaDownload style={{ marginRight: '0.5rem' }} />
            Download PNG
          </Button>
        </DownloadButtonContainer>
        {memoizedWordCloud || (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            textAlign: 'center',
            padding: '2rem'
          }}>
            No conversations selected.<br />
            Load conversations to see the word cloud.
          </div>
        )}
      </WordCloudWrapper>
    </WordCloudContainer>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(WordCloudComponent);
