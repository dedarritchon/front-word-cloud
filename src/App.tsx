import styled from 'styled-components';
import WordCloudApp from './components/WordCloudApp';
import { FrontContextProvider } from './context/FrontContextProvider';
import { ConversationProvider } from './context/ConversationContext';
import { StopWordsProvider } from './context/StopWordsContext';
import { ColorContextProvider } from './context/ColorContext';
import { SpiralProvider } from './context/SpiralContext';
import { RotationContextProvider } from './context/RotationContext';
import { MinOccurrencesProvider } from './context/MinOccurrencesContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  color: var(--text-primary);
`;

function App() {
  return (
    <FrontContextProvider>
      <ConversationProvider>
        <StopWordsProvider>
          <ColorContextProvider>
            <SpiralProvider>
              <RotationContextProvider>
                <MinOccurrencesProvider>
                  <AppContainer>
                    <WordCloudApp />
                  </AppContainer>
                </MinOccurrencesProvider>
              </RotationContextProvider>
            </SpiralProvider>
          </ColorContextProvider>
        </StopWordsProvider>
      </ConversationProvider>
    </FrontContextProvider>
  );
}

export default App;
