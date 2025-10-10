import React from 'react';
import styled from 'styled-components';
import { Select, SelectItem } from '@frontapp/ui-kit';
import { useSpiralContext, SpiralType } from '../context/SpiralContext';

const SpiralSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;


const Description = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
`;

const SpiralSelector: React.FC = () => {
  const { state, setSpiral } = useSpiralContext();

  const spiralOptions: { value: SpiralType; label: string; description: string }[] = [
    {
      value: 'archimedean',
      label: 'Archimedean',
      description: 'Spiral pattern that creates a more natural, organic layout. Better for displaying more words.'
    },
    {
      value: 'rectangular',
      label: 'Rectangular',
      description: 'Grid-based pattern that creates a more structured, organized layout. Better for fewer words.'
    }
  ];

  return (
    <SpiralSelectorContainer>
      <Description>
        Choose the spiral pattern for word placement in the cloud:
      </Description>
      <Select
        selectedValues={spiralOptions.find(option => option.value === state.spiral)?.label}
        layerRootId="spiral-selector"
      >
        {spiralOptions.map((option) => (
          <SelectItem
            key={option.value}
            onClick={() => setSpiral(option.value)}
            isSelected={option.value === state.spiral}
            description={option.description}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </SpiralSelectorContainer>
  );
};

export default SpiralSelector;
