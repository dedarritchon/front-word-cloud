import React from 'react';
import styled from 'styled-components';
import {
  Button,
  VisualSizesEnum,
  Checkbox,
  Accordion,
  AccordionSection,
} from '@frontapp/ui-kit';
import { useConversationContext } from '../context/ConversationContext';
import StopWordsPills from './StopWordsPills';
import ColorPicker from './ColorPicker';
import SpiralSelector from './SpiralSelector';
import RotationSelector from './RotationSelector';
import { WordCloudData } from '../types/wordCloud';

interface SettingsPanelProps {
  className?: string;
  wordCloudData?: WordCloudData[];
}

const SettingsContainer = styled.div`
  padding: 1rem;
  background-color: var(--surface);
  border-radius: 8px;
  overflow-x: hidden;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  background-color: var(--background);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--surface-hover);
  }
`;

const ConversationInfo = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const ConversationActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 1rem;
`;

const ClearAllButton = styled(Button)`
  margin: 0.2rem;
`;


const StatisticsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color:rgba(234, 234, 234, 0.54);
  border-radius: 6px;
  overflow: hidden;
`;

const StatItem = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

`;

const StatValue = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ConversationTitle = styled.p`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  color: var(--text-primary);
  flex: 1;
`;

const ConversationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;


const Scrollable = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;


const SettingsPanel: React.FC<SettingsPanelProps> = ({
  className,
  wordCloudData = [],
}) => {
  const conversationContext = useConversationContext();

  const handleToggleConversation = (conversationId: string) => {
    conversationContext.toggleConversation(conversationId);
  };

  const clearAllConversations = () => {
    conversationContext.clearAll();
  };

  const activeConversations = conversationContext.getActiveConversations();
  const totalConversations = activeConversations.length;
  const totalMessages = activeConversations.reduce((acc, conv) => acc + conv.messages.length, 0);
  
  const totalWords = wordCloudData.length;

  return (
    <SettingsContainer className={className}>
      <Section>
        <StatisticsContainer>
          <StatItem>
            <StatValue>{totalConversations}</StatValue>
            <StatLabel>Conversations</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{totalMessages}</StatValue>
            <StatLabel>Messages</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{totalWords.toLocaleString()}</StatValue>
            <StatLabel>Unique Words</StatLabel>
          </StatItem>
        </StatisticsContainer>
      </Section>

      <Section>
        <Accordion>
          <AccordionSection
            id="conversations"
            title="Included Conversations"
          >
            {conversationContext.state.conversations.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                No conversations loaded yet. Select a conversation in Front and it will load automatically.
              </p>
            ) : (
              <>
                <ClearAllButton
                    size={VisualSizesEnum.SMALL}
                    onClick={clearAllConversations}
                >
                    Clear All Conversations
                </ClearAllButton>
                <Scrollable>
                {conversationContext.state.conversations.map((conversation) => (
                  <ConversationItem key={conversation.conversation_id}>
                    <ConversationInfo>
                      <ConversationHeader>
                        <ConversationTitle>
                          {conversation.title || conversation.conversation_id}
                        </ConversationTitle>
                      </ConversationHeader>
                      <ConversationDetails>
                        <DetailRow>
                          <span>{conversation.messages.length} messages</span>
                        </DetailRow>            
                      </ConversationDetails>
                    </ConversationInfo>
                    <ConversationActions>
                      <Checkbox
                        isChecked={conversation.active}
                        onChange={() => handleToggleConversation(conversation.conversation_id)}
                      />
                    </ConversationActions>
                  </ConversationItem>
                ))}
                </Scrollable>
              </>
            )}
          </AccordionSection>
          <AccordionSection
            id="wordcloud-config"
            title="Word Cloud Configuration"
          >
            <ColorPicker />
            <SpiralSelector />
            <RotationSelector />
          </AccordionSection>
          <AccordionSection
            id="stopwords"
            title="Stop Words Configuration"
          >
            <StopWordsPills />
          </AccordionSection>
        </Accordion>
      </Section>
    </SettingsContainer>
  );
};

export default SettingsPanel;
