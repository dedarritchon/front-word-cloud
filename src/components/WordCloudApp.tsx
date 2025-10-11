import React, { useState, useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  PluginLayout,
} from '@frontapp/ui-kit';
import WordCloud from './WordCloud';
import SettingsPanel from './SettingsPanel';
import { WordCloudConfig, ConversationMessage } from '../types/wordCloud';
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
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  flex-direction: row;
  padding: 1rem;
  flex-direction: column;
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

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background-color: #fafbfc;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  color: #6c757d;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const ErrorTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  margin: 0;
  max-width: 300px;
  line-height: 1.5;
`;


const WordCloudApp: React.FC = () => {
  const frontContext = useContext(FrontContext);
  const conversationContext = useConversationContext();
  const stopWordsContext = useStopWordsContext();
  const colorContext = useColorContext();
  const [config] = useState<WordCloudConfig>(defaultWordCloudConfig);

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
      const allMessages: any[] = [];
      let nextPaginationToken: any = undefined;

      // Paginate through all messages in the conversation
      do {
        const messageList = await frontContext.listMessages(nextPaginationToken);
        allMessages.push(...messageList.results);
        nextPaginationToken = messageList.nextPageToken;
      } while (nextPaginationToken);

      // Convert messages to our format
      const conversationMessages: ConversationMessage[] = allMessages
        .map((message, index) => {
          // Handle different message types and extract text from HTML
          let textContent = '';
          
          if (message.content?.body && typeof message.content.body === 'string') {
            textContent = message.content.body;
          } else if (message.body && typeof message.body === 'string') {
            textContent = message.body;
          } else if (message.text && typeof message.text === 'string') {
            textContent = message.text;
          }
          
          // Strip HTML tags and extract plain text
          if (textContent) {
            // Create a temporary DOM element to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = textContent;
            textContent = tempDiv.textContent || tempDiv.innerText || '';
          }
          
          return {
            id: message.id || `msg-${index}`,
            content: textContent,
            timestamp: message.created_at || message.timestamp,
            author: message.author?.name || message.author?.email,
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

  return (
    <AppContainer>
      <PluginLayout>
        <MainContent>
          <WordCloudSection>
            {hasNoConversation && wordCloudData.length === 0 ? (
              <ErrorState>
                <ErrorIcon>💬</ErrorIcon>
                <ErrorTitle>No Conversation Selected</ErrorTitle>
                <ErrorMessage>
                  Please select a conversation to generate a word cloud from its messages.
                </ErrorMessage>
              </ErrorState>
            ) : (
              <WordCloud data={wordCloudData} config={config} />
            )}
          </WordCloudSection>
          <SettingsSection>
            <SettingsPanel wordCloudData={wordCloudData} />
          </SettingsSection>
        </MainContent>
      </PluginLayout>
    </AppContainer>
  );
};

export default WordCloudApp;
