import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, VisualSizesEnum } from '@frontapp/ui-kit';
import { useStopWordsContext } from '../context/StopWordsContext';
import { DEFAULT_STOP_WORDS } from '../constants/stopWords';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AddWordContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background-color: #fafbfc;
`;

const Pill = styled.div<{ isDefault?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: ${props => props.isDefault ? '#e3f2fd' : '#fff3e0'};
  border: 1px solid ${props => props.isDefault ? '#bbdefb' : '#ffcc02'};
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.isDefault ? '#1976d2' : '#f57c00'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isDefault ? '#bbdefb' : '#ffe0b2'};
    transform: translateY(-1px);
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  font-size: 0.875rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const WordInput = styled(Input)`
  flex: 1;
  min-width: 120px;
`;

const AddButton = styled(Button)`
  flex-shrink: 0;
`;

const ResetButton = styled(Button)`
  margin-top: 0.2rem;
  align-self: flex-start;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  font-size: 0.875rem;
  padding: 1rem;
  font-style: italic;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StopWordsPills: React.FC = () => {
  const { state, addStopWord, removeStopWord, resetToDefault, getStopWordsArray } = useStopWordsContext();
  const [newWord, setNewWord] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddWord = async () => {
    const trimmedWord = newWord.trim().toLowerCase();
    if (trimmedWord && !state.stopWords.has(trimmedWord)) {
      setIsAdding(true);
      try {
        addStopWord(trimmedWord);
        setNewWord('');
      } finally {
        setIsAdding(false);
      }
    }
  };


  const handleRemoveWord = (word: string) => {
    removeStopWord(word);
  };

  const stopWordsArray = getStopWordsArray();

  return (
    <Container>
      <StatsContainer>
        <span>{stopWordsArray.length} stop words configured</span>
        <ButtonGroup>
          <ResetButton
            size={VisualSizesEnum.SMALL}
            onClick={resetToDefault}
            isDisabled={state.isLoading}
          >
            Reset to Default
          </ResetButton>
        </ButtonGroup>
      </StatsContainer>

      <AddWordContainer>
        <WordInput
          placeholder="Add stop word..."
          value={newWord}
          onChange={(value: unknown) => setNewWord(String(value))}
          isDisabled={state.isLoading}
        />
        <AddButton
          size={VisualSizesEnum.SMALL}
          onClick={handleAddWord}
          isDisabled={!newWord.trim() || state.stopWords.has(newWord.trim().toLowerCase()) || state.isLoading || isAdding}
        >
          Add
        </AddButton>
      </AddWordContainer>

      <PillsContainer>
        {stopWordsArray.length === 0 ? (
          <EmptyState>No stop words configured</EmptyState>
        ) : (
          stopWordsArray.map((word) => (
            <Pill
              key={word}
              isDefault={DEFAULT_STOP_WORDS.has(word)}
              onClick={() => handleRemoveWord(word)}
              title={DEFAULT_STOP_WORDS.has(word) ? 'Default stop word' : 'Custom stop word'}
            >
              {word}
              <RemoveButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveWord(word);
                }}
                title="Remove stop word"
              >
                ×
              </RemoveButton>
            </Pill>
          ))
        )}
      </PillsContainer>
    </Container>
  );
};

export default StopWordsPills;
