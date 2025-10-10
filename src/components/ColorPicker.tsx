import React from 'react';
import styled from 'styled-components';
import { Button, VisualSizesEnum } from '@frontapp/ui-kit';
import { useColorContext } from '../context/ColorContext';

const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const GradientPreview = styled.div`
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e1e5e9;
  background-color: #ffffff;
`;

const GradientColor = styled.div<{ color: string }>`
  flex: 1;
  background-color: ${props => props.color};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scaleY(1.1);
    z-index: 1;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SliderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e1e5e9;
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3182ce;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3182ce;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ModeButton = styled(Button)<{ active: boolean }>`
  flex: 1;
  min-width: 60px;
  font-size: 0.8rem;
  background-color: ${props => props.active ? '#3182ce' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#6c757d'};
  border: 1px solid ${props => props.active ? '#3182ce' : '#e1e5e9'};
  
  &:hover {
    background-color: ${props => props.active ? '#2c5282' : '#f8f9fa'};
  }
`;

const PresetColors = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PresetColor = styled.button<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #e1e5e9;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.1);
    border-color: #3182ce;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const EditablePresetColor = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #e1e5e9;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: scale(1.1);
    border-color: #3182ce;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const EditIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  opacity: 1;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '✏️';
    font-size: 8px;
  }
`;

const HiddenColorInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
`;

const ResetButton = styled(Button)`
  align-self: flex-start;
  font-size: 0.8rem;
`;

const ColorPicker: React.FC = () => {
  const { state, setBaseColor, setBaseColorImmediate, setBaseColorPreview, setGradientSteps, setColorMode, resetToDefault, generateGradient } = useColorContext();

  const presetColors = [
    '#584def', // Purple
    '#3182ce', // Blue
    '#e53e3e', // Red
    '#38a169', // Green
    '#d69e2e', // Yellow
    '#dd6b20', // Orange
    '#319795', // Teal
    '#e53e3e', // Pink
  ];

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Use preview for immediate UI feedback during dragging
    setBaseColorPreview(event.target.value);
  };

  const handleColorInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Use preview for immediate UI feedback during dragging
    setBaseColorPreview(event.target.value);
  };

  const handleColorBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Use debounced function when user stops interacting
    setBaseColor(event.target.value);
  };

  const handleColorMouseUp = (event: React.MouseEvent<HTMLInputElement>) => {
    // Apply color when user releases mouse button
    setBaseColor(event.currentTarget.value);
  };

  const handleStepsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGradientSteps(parseInt(event.target.value, 10));
  };

  const handleModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setColorMode(mode);
  };

  const handlePresetClick = (color: string) => {
    setBaseColorImmediate(color);
  };

  return (
    <ColorPickerContainer>
      <div>
        <Label>Gradient Preview</Label>
        <GradientPreview>
          {(state.isUpdating ? generateGradient(state.previewBaseColor, state.gradientSteps, state.colorMode) : state.colors).map((color, index) => (
            <GradientColor key={`${color}-${index}-${state.previewBaseColor}`} color={color} />
          ))}
        </GradientPreview>
      </div>

      <ControlsSection>
        <SliderWrapper>
          <SliderLabel>
            <span>Gradient Steps</span>
            <span>{state.gradientSteps}</span>
          </SliderLabel>
          <Slider
            type="range"
            min="3"
            max="20"
            value={state.gradientSteps}
            onChange={handleStepsChange}
          />
        </SliderWrapper>

        <div>
          <Label>Color Mode</Label>
          <ModeSelector>
            <ModeButton
              size={VisualSizesEnum.SMALL}
              active={state.colorMode === 'light'}
              onClick={() => handleModeChange('light')}
            >
              Light
            </ModeButton>
            <ModeButton
              size={VisualSizesEnum.SMALL}
              active={state.colorMode === 'dark'}
              onClick={() => handleModeChange('dark')}
            >
              Dark
            </ModeButton>
            <ModeButton
              size={VisualSizesEnum.SMALL}
              active={state.colorMode === 'auto'}
              onClick={() => handleModeChange('auto')}
            >
              Auto
            </ModeButton>
          </ModeSelector>
        </div>

        <div>
          <Label>Preset Colors</Label>
          <PresetColors>
            {presetColors.map((color, index) => (
              <PresetColor
                key={index}
                color={color}
                onClick={() => handlePresetClick(color)}
                title={`Use ${color}`}
              />
            ))}
            <EditablePresetColor
              color={state.previewBaseColor}
              title="Click to edit color"
            >
              <EditIcon className="edit-icon" />
              <HiddenColorInput
                type="color"
                value={state.previewBaseColor}
                onChange={handleColorChange}
                onInput={handleColorInput}
                onBlur={handleColorBlur}
                onMouseUp={handleColorMouseUp}
                title="Choose base color"
              />
            </EditablePresetColor>
          </PresetColors>
        </div>

        <ResetButton
          size={VisualSizesEnum.SMALL}
          onClick={resetToDefault}
        >
          Reset to Default
        </ResetButton>
      </ControlsSection>
    </ColorPickerContainer>
  );
};

export default ColorPicker;
