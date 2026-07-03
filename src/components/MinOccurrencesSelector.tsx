import React from 'react';
import styled from 'styled-components';
import { useMinOccurrencesContext } from '../context/MinOccurrencesContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Description = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
  margin: 0.2rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.2rem;
`;

const Slider = styled.input`
  flex: 1;
  accent-color: var(--text-link);
  cursor: pointer;
`;

const StepButton = styled.button`
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: var(--surface-hover);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ValueBadge = styled.span`
  min-width: 2rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const MIN = 1;
const MAX = 20;

const MinOccurrencesSelector: React.FC = () => {
  const { state, setMinOccurrences } = useMinOccurrencesContext();
  const value = state.minOccurrences;

  return (
    <Container>
      <Description>
        Minimum times a word must appear to be shown in the cloud:
      </Description>
      <Controls>
        <StepButton
          onClick={() => setMinOccurrences(value - 1)}
          disabled={value <= MIN}
          aria-label="Decrease minimum occurrences"
        >
          −
        </StepButton>
        <Slider
          type="range"
          min={MIN}
          max={MAX}
          value={value}
          onChange={(e) => setMinOccurrences(Number(e.target.value))}
        />
        <StepButton
          onClick={() => setMinOccurrences(value + 1)}
          disabled={value >= MAX}
          aria-label="Increase minimum occurrences"
        >
          +
        </StepButton>
        <ValueBadge>{value}×</ValueBadge>
      </Controls>
    </Container>
  );
};

export default MinOccurrencesSelector;
