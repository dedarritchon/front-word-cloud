import React from 'react';
import styled from 'styled-components';
import { Select, SelectItem } from '@frontapp/ui-kit';
import { useRotationContext, RotationPattern } from '../context/RotationContext';

const RotationSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Description = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
`;

const RotationSelector: React.FC = () => {
  const { state, setPattern } = useRotationContext();

  const rotationOptions: { value: RotationPattern; label: string; description: string }[] = [
    {
      value: 'none',
      label: 'No Rotation',
      description: 'All words will be displayed horizontally (0° rotation)'
    },
    {
      value: 'mixed',
      label: 'Mixed Rotation',
      description: 'Words will be displayed in all four orientations (0°, 90°, 180°, 270°)'
    },
    {
      value: 'random',
      label: 'Random Rotation',
      description: 'Words will be rotated to random angles for a more dynamic look'
    }
  ];

  return (
    <RotationSelectorContainer>
      <Description>
        Choose the rotation pattern for words in the cloud:
      </Description>
      <Select
        selectedValues={rotationOptions.find(option => option.value === state.pattern)?.label}
        layerRootId="rotation-selector"
      >
        {rotationOptions.map((option) => (
          <SelectItem
            key={option.value}
            onClick={() => setPattern(option.value)}
            isSelected={option.value === state.pattern}
            description={option.description}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </RotationSelectorContainer>
  );
};

export default RotationSelector;
