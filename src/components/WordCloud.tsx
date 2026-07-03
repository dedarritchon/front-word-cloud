import React, { useRef, useState, useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';
import { Word, WordCloud, WordCloudProps, AnimatedWordRenderer } from '@isoterik/react-word-cloud';
import { WordCloudData, WordCloudConfig } from '../types/wordCloud';
import { Button, VisualSizesEnum } from '@frontapp/ui-kit';
import { FaExternalLinkAlt, FaClipboard, FaCheck } from 'react-icons/fa';
import { useColorContext } from '../context/ColorContext';
import { useSpiralContext } from '../context/SpiralContext';
import { useRotationContext } from '../context/RotationContext';
import { useStopWordsContext } from '../context/StopWordsContext';

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

const HelpTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HelpText = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
  padding-top: 1rem;
`;


const WordCloudComponent: React.FC<WordCloudComponentProps> = ({ data, config, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const colorContext = useColorContext();
  const spiralContext = useSpiralContext();
  const rotationContext = useRotationContext();
  const stopWordsContext = useStopWordsContext();
  const [isOpening, setIsOpening] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'> ('idle');

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
      scaleFactor = 2.0; // Increased from 1.2
      maxSize = 150; // Increased from 120
      minSize = 32; // Increased from 24
    } else if (wordCount <= 60) {
      // Few words - use more space
      scaleFactor = 1.5; // Increased from 0.8
      maxSize = 100; // Increased from 80
      minSize = 24; // Increased from 18
    } else if (wordCount <= 100) {
      // Moderate number of words
      scaleFactor = 1.0; // Increased from 0.5
      maxSize = 80; // Increased from 60
      minSize = 18; // Increased from 14
    } else {
      // Many words - use less space per word
      scaleFactor = 0.6; // Increased from 0.3
      maxSize = 60; // Increased from 45
      minSize = 16; // Increased from 12
    }
    
    return (word: Word) => Math.max(
      minSize,
      Math.min(maxSize, word.value * scaleFactor + minSize)
    );
  }, [words.length]);

  // Memoize the rotation function based on the selected pattern
  const rotationFunction = useMemo(() => {
    const pattern = rotationContext.state.pattern;
    
    switch (pattern) {
      case 'none':
        return () => 0;
      case 'mixed':
        const mixedAngles = [0, 90, 180, 270];
        return () => mixedAngles[Math.floor(Math.random() * mixedAngles.length)];
      case 'random':
        return () => Math.floor(Math.random() * 360);
      default:
        return () => 0;
    }
  }, [rotationContext.state.pattern]);

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

  // Handle word click to add word to stop words
  const onWordClick = useCallback((word: Word) => {
    stopWordsContext.addStopWord(word.text);
  }, [stopWordsContext.addStopWord]);

  // Memoize the entire WordCloud component to prevent unnecessary re-renders
  const memoizedWordCloud = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    
    return (
      <WordCloud
        key={`wordcloud-${colorContext.state.colors.join(',')}-${colorContext.state.gradientSteps}-${colorContext.state.colorMode}-${spiralContext.state.spiral}-${rotationContext.state.pattern}`}
        ref={svgRef}
        words={words}
        width={config.width}
        height={config.height}
        fontSize={fontSizeFunction}
        padding={2} // Smaller padding for more words
        fill={fillFunction}
        enableTooltip
        spiral={spiralContext.state.spiral}
        rotate={rotationFunction}
        renderWord={animatedWordRenderer}
        onWordClick={onWordClick}
      />
    );
  }, [words, fillFunction, fontSizeFunction, rotationFunction, animatedWordRenderer, onWordClick, colorContext.state.colors, colorContext.state.gradientSteps, colorContext.state.colorMode, spiralContext.state.spiral, rotationContext.state.pattern, config.width, config.height, data]);

  // Render the SVG to a high-res canvas and return a Blob
  const renderToBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!svgRef.current) { reject(new Error('No SVG ref')); return; }

      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const scale = 3; // 3× for high-quality export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }

      canvas.width = config.width * scale;
      canvas.height = config.height * scale;
      ctx.scale(scale, scale);

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        ctx.clearRect(0, 0, config.width, config.height);
        ctx.drawImage(img, 0, 0, config.width, config.height);
        URL.revokeObjectURL(svgUrl);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('toBlob returned null'));
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Image load failed'));
      };

      img.src = svgUrl;
    });
  };

  // Open the PNG as a blob URL in a new tab — works reliably from iframes
  const openInNewTab = async () => {
    if (isOpening) return;
    setIsOpening(true);
    try {
      const blob = await renderToBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Revoke after a short delay to give the new tab time to load
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (error) {
      console.error('Error opening image:', error);
    } finally {
      setIsOpening(false);
    }
  };

  // Copy the PNG directly to the clipboard
  const copyToClipboard = async () => {
    if (copyStatus !== 'idle') return;
    setCopyStatus('copying');
    try {
      const blob = await renderToBlob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setCopyStatus('idle');
    }
  };

  const clipboardSupported = typeof navigator !== 'undefined'
    && !!navigator.clipboard
    && typeof ClipboardItem !== 'undefined';

  return (
    <>
    <WordCloudContainer ref={containerRef} config={config} className={className}>
      <WordCloudWrapper>
        {data && data.length > 0 && (
          <DownloadButtonContainer>
            <Button
              size={VisualSizesEnum.SMALL}
              onClick={openInNewTab}
              isDisabled={isOpening}
            >
              <FaExternalLinkAlt style={{ marginRight: '0.5rem' }} />
              {isOpening ? 'Opening…' : 'Open Image'}
            </Button>
            {clipboardSupported && (
              <Button
                size={VisualSizesEnum.SMALL}
                onClick={copyToClipboard}
                isDisabled={copyStatus !== 'idle'}
              >
                {copyStatus === 'copied'
                  ? <FaCheck style={{ marginRight: '0.5rem' }} />
                  : <FaClipboard style={{ marginRight: '0.5rem' }} />}
                {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'copying' ? 'Copying…' : 'Copy to Clipboard'}
              </Button>
            )}
          </DownloadButtonContainer>
        )}
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
        <HelpTextContainer>
          <HelpText>
            Click on a word to remove (add to stop words).
          </HelpText>
        </HelpTextContainer>
      </WordCloudWrapper>
    </WordCloudContainer>
    </>
  );

};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(WordCloudComponent);
