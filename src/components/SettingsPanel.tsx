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

interface SettingsPanelProps {
  className?: string;
}

const SettingsContainer = styled.div`
  padding: 1rem;
  background-color: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
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
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
  background-color: #ffffff;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
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
  margin-top: 0.5rem;
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
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${props => props.active ? '#d4edda' : '#fff3cd'};
  color: ${props => props.active ? '#155724' : '#856404'};
  border: 1px solid ${props => props.active ? '#c3e6cb' : '#ffeaa7'};
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
  color: #2c3e50;
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
  color: #6c757d;
`;


const Scrollable = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;


const SettingsPanel: React.FC<SettingsPanelProps> = ({
  className,
}) => {
  const conversationContext = useConversationContext();

  const handleToggleConversation = (conversationId: string) => {
    conversationContext.toggleConversation(conversationId);
  };

  const clearAllConversations = () => {
    conversationContext.clearAll();
  };

  const totalConversations = conversationContext.state.conversations.length;
  const totalMessages = conversationContext.state.conversations.reduce((acc, conv) => acc + conv.messages.length, 0);
  
  // Calculate word counts
  const totalWords = conversationContext.state.conversations.reduce((acc, conv) => 
    acc + conv.messages.reduce((msgAcc, msg) => msgAcc + (msg.content?.split(' ').length || 0), 0), 0);

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
            <StatLabel>Words</StatLabel>
          </StatItem>
        </StatisticsContainer>
      </Section>

      <Section>
        <Accordion>
          <AccordionSection
            id="conversations"
            title="Conversations"
          >
            {conversationContext.state.conversations.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                No conversations loaded yet. Use the "Load Current Conversation" button to add conversations.
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
                        <StatusBadge active={conversation.active}>
                          {conversation.active ? 'Active' : 'Inactive'}
                        </StatusBadge>
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
            id="colors"
            title="Color Configuration"
          >
            <ColorPicker />
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
