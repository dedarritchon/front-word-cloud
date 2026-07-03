import React, { useContext, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  PluginLayout,
} from '@frontapp/ui-kit';
import { ApplicationMessage, ApplicationPaginationToken } from '@frontapp/ui-bridge';
import WordCloud from './WordCloud';
import SettingsPanel from './SettingsPanel';
import { ConversationMessage } from '../types/wordCloud';
import { defaultWordCloudConfig, generateWordCloudData } from '../utils/wordCloudUtils';
import { FrontContext } from '../context/FrontContext';
import { useConversationContext } from '../context/ConversationContext';
import { useStopWordsContext } from '../context/StopWordsContext';
import { useColorContext } from '../context/ColorContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--background);
  color: var(--text-primary);
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
`;

const WordCloudSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 0; /* Allow flex item to shrink */
`;

const SettingsSection = styled.div`
  flex-shrink: 0;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: var(--text-secondary);
`;

const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border);
  border-top-color: var(--text-link);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.p`
  font-size: 0.95rem;
  margin: 0;
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: color-mix(in srgb, var(--error) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--error) 40%, transparent);
  border-radius: 6px;
  color: var(--error);
  font-size: 0.9rem;
  width: 100%;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const ErrorTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  margin: 0;
  max-width: 300px;
  line-height: 1.5;
`;

const Footer = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  margin-top: auto;
  position: fixed;
  bottom: 0;
  justify-self: end;
`;

const CoffeeButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CoffeeButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  text-decoration: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  color: var(--text-primary);
  overflow: hidden;

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const CoffeeIcon = styled.span`
  font-size: 0.875rem;
`;

const CoffeeText = styled.span`
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease;
  white-space: nowrap;
  color: var(--text-secondary);

  ${CoffeeButton}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;


const WordCloudApp: React.FC = () => {
  const frontContext = useContext(FrontContext);
  const conversationContext = useConversationContext();
  const stopWordsContext = useStopWordsContext();
  const colorContext = useColorContext();
  const config = defaultWordCloudConfig;

  // Fetch conversation messages and add to global state
  const fetchMessagesAndAddToState = async () => {
    if (!frontContext || frontContext.type !== 'singleConversation') {
      return;
    }

    const conversationId = frontContext.conversation?.id;
    if (!conversationId) {
      return;
    }

    conversationContext.setLoading(true);
    conversationContext.setError(null);

    try {
      const allMessages: ApplicationMessage[] = [];
      let nextPaginationToken: ApplicationPaginationToken | undefined = undefined;

      // Paginate through all messages in the conversation
      do {
        const messageList = await frontContext.listMessages(nextPaginationToken);
        allMessages.push(...messageList.results);
        nextPaginationToken = messageList.nextPageToken;
      } while (nextPaginationToken);

      // Convert messages to our format, stripping HTML when content type is 'html'
      const conversationMessages: ConversationMessage[] = allMessages
        .map((message, index) => {
          let textContent = '';

          if (message.content?.body) {
            if (message.content.type === 'html') {
              // Replace block-level boundaries with a space BEFORE stripping tags
              // so that "word.</p><p>next" doesn't collapse into "word.next"
              const spaced = message.content.body
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/<\/?(p|div|li|ul|ol|h[1-6]|blockquote|pre|tr|td|th|section|article|header|footer)[^>]*>/gi, ' ');
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = spaced;
              textContent = tempDiv.textContent || tempDiv.innerText || '';
            } else {
              textContent = message.content.body;
            }
          }

          return {
            id: String(message.id) || `msg-${index}`,
            content: textContent,
            timestamp: message.date?.toISOString(),
            author: message.from?.name || message.from?.handle,
          };
        })
        .filter(message => message.content.trim().length > 0);

      // Add or update conversation in global state
      conversationContext.addConversation({
        conversation_id: conversationId,
        active: true,
        messages: conversationMessages,
        title: `Conversation ${conversationId}`,
      });

    } catch (err) {
      console.error('Error fetching messages:', err);
      conversationContext.setError('Failed to fetch conversation messages');
    } finally {
      conversationContext.setLoading(false);
    }
  };

  // Calculate final messages for word cloud using useMemo
  const finalMessages = useMemo(() => {
    return conversationContext.getAllMessages();
  }, [conversationContext.state.conversations]);

  // Generate word cloud data from final messages
  const wordCloudData = useMemo(() => {
    if (finalMessages.length === 0) {
      return []; // Return empty array instead of sample data
    }

    const allText = finalMessages
      .map(message => message.content)
      .join(' ');

    if (allText.trim()) {
      return generateWordCloudData(allText, config.maxWords, stopWordsContext.state.stopWords, colorContext.state.colors);
    } else {
      return []; // Return empty array instead of sample data
    }
  }, [finalMessages, config.maxWords, stopWordsContext.state.stopWords, colorContext.state.colors]);

  useEffect(() => {
    fetchMessagesAndAddToState();
  }, [frontContext]);


  // Check if no conversation is selected
  const hasNoConversation = !frontContext || 
    frontContext.type !== 'singleConversation' || 
    !frontContext.conversation?.id;

  const renderCloudSection = () => {
    if (conversationContext.state.isLoading) {
      return (
        <LoadingState>
          <Spinner />
          <LoadingText>Loading conversation messages…</LoadingText>
        </LoadingState>
      );
    }
    if (hasNoConversation && wordCloudData.length === 0) {
      return (
        <ErrorState>
          <ErrorIcon>💬</ErrorIcon>
          <ErrorTitle>No Conversation Selected</ErrorTitle>
          <ErrorMessage>
            Please select a conversation to generate a word cloud from its messages.
          </ErrorMessage>
        </ErrorState>
      );
    }
    return <WordCloud data={wordCloudData} config={config} />;
  };

  return (
    <AppContainer>
      <PluginLayout>
        <MainContent>
          <WordCloudSection>
            {conversationContext.state.error && (
              <ErrorBanner>⚠️ {conversationContext.state.error}</ErrorBanner>
            )}
            {renderCloudSection()}
          </WordCloudSection>
          <SettingsSection>
            <SettingsPanel wordCloudData={wordCloudData} />
          </SettingsSection>
        </MainContent>
        <Footer>
          <CoffeeButtonContainer>
            <CoffeeButton 
              href="https://buymeacoffee.com/dedarritchon" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <CoffeeText>Buy me a coffee</CoffeeText>
              <CoffeeIcon>☕</CoffeeIcon>
            </CoffeeButton>
          </CoffeeButtonContainer>
        </Footer>
      </PluginLayout>
    </AppContainer>
  );
};

export default WordCloudApp;
