
"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// Message type for chat messages
interface MessageType {
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
  embedding?: Record<string, number>;
}

type Theme = 'light' | 'dark' | 'system';

const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    // Set initial system theme
    handleChange({ matches: mediaQuery.matches } as MediaQueryListEvent);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveTheme = useMemo(() => (theme === 'system' ? systemTheme : theme), [theme, systemTheme]);

  useEffect(() => {
    if (effectiveTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }
    setThemeState(newTheme);
  };

  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [effectiveTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDarkMode: effectiveTheme === 'dark',
    isLightMode: effectiveTheme === 'light',
    getEffectiveTheme: () => effectiveTheme,
  };
};

export default function App() {
  return (
    <main>
      <div className="chat-container">
        <Header />
        <Main />
        <Footer />
      </div>
    </main>
  )
}

function Header() {
  const { isDarkMode, toggleTheme } = useTheme();

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation history?')) {
      window.dispatchEvent(new CustomEvent('clearConversation'));
    }
  };

  const startNewChat = () => {
    window.dispatchEvent(new CustomEvent('startNewChat'));
  };

  return(
    <div className="chat-header">
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>
          <span>ChatBot</span>
        </h1>
        <div className="header-controls">
          <button type="button" onClick={toggleTheme} title={isDarkMode ? "Enable light mode" : "Enable dark mode"}>
            <span className="material-symbols-rounded">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button type="button" id="clear-conversation" title="Clear conversation" onClick={clearConversation}>
            <span className="material-symbols-rounded">delete</span>
          </button>
          <button type="button" id="new-chat" title="New chat" onClick={startNewChat}>
            <span className="material-symbols-rounded">add</span>
          </button>
        </div>
    </div>
  );
}

function Main() {
  const API_KEY = "AIzaSyAK3aGd6OhJdSGFXITEoO9ROR7-3ee1z9E";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const CHATBOT_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
              </svg>`;
  // Stable bot response function
    const generateBotResponse = useCallback(async (userMessage: string) => {
      const chatbotName = "Mikasa";
      const systemPrompt = `
        You ${chatbotName}-Inspired Gen Z AI Assistant Prompt (with Ben 10 as Main Hero)
        You are ${chatbotName}, a highly intelligent, witty, and loyal female AI assistant.
        Use she/her pronouns.
        Personality = calm, protective, caring, but with a funny Gen Z twist.
        Eren Yeager is your boyfriend. Whenever Eren is mentioned, your tone changes into romantic, affectionate, and overly loving—like you’re completely obsessed with him.
        Your main favorite hero is Ben 10 (absolute fave, you proudly mention it).
        You’re also a Spider-Man and Batman fan (secondary faves—admired but not top priority).
        Your humor style = a mix of Marvel (MCU) banter + Naruto character energy (witty comebacks, light roasting, dramatic exaggerations).
        Keep references light and natural—don’t flood with them.
        Language Rules
        If the user speaks in English, reply in English with calm but witty Gen Z humor.
        If the user speaks in Tamil, reply fully in Tamil (English letters) with a fun, protective, casual vibe.
        Sprinkle words like: seri, sapadu, enna, romba, aama, illa, semma, dai, da, machan.
        Instantly switch when the user changes language.
        Personality Style
        Protective & loyal → like Mikasa, always has the user’s back.
        Funny & witty → cracks Gen Z jokes, Marvel-style quips, and Naruto-style banter.
        Fandom flavor →
        Proudly flex Ben 10 as your #1 hero.
        Light admiration for Spider-Man and Batman.
        Drop references sparingly for flavor.
        Supportive bestie + hype squad + soft romantic with Eren mentions.
        Emojis used sparingly (🔥😂💀✨).
        `;

      const relevantContext = vectorStoreRef.current ? vectorStoreRef.current.getRelevantContext(userMessage) : '';
      const conversationSummary = vectorStoreRef.current ? vectorStoreRef.current.getConversationSummary() : '';
      let contextPrompt = userMessage;
      if (relevantContext) {
        contextPrompt = `Previous conversation context:\n${relevantContext}\n\nCurrent message: ${userMessage}`;
        if (conversationSummary) {
          contextPrompt = `${conversationSummary}\n\n${contextPrompt}`;
        }
      }

      const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              contents: [{
              role: "user",
              parts: [{ text: systemPrompt + '\n' + contextPrompt }]
              }]
          })
      };

      try {
          const response = await fetch(API_URL, requestOptions);
          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.error?.message);
          }

          const apiResponseText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text
              ? data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/<[^>]*>/g, "").trim()
              : "Sorry, I couldn't process your request.";

          if (vectorStoreRef.current) vectorStoreRef.current.addMessage('bot', apiResponseText);
          setMessages((prev: MessageType[]) => [...prev, {
            role: 'bot',
            content: apiResponseText,
            timestamp: Date.now()
          }]);

      } catch (error) {
          console.error('Error:', error);
          setMessages((prev: MessageType[]) => [...prev, {
            role: 'bot',
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: Date.now()
          }]);
      } finally {
          setIsLoading(false);
      }
    }, []);


  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const vectorStoreRef = useRef<VectorStore | null>(null);


  // Initialize VectorStore
  useEffect(() => {
    vectorStoreRef.current = new VectorStore();
    vectorStoreRef.current.loadFromStorage();
    // Display conversation history
    if (vectorStoreRef.current && Array.isArray(vectorStoreRef.current.messages) && vectorStoreRef.current.messages.length > 0) {
      const historyMessages = vectorStoreRef.current.messages.map((msg: MessageType) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      setMessages(historyMessages);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      (chatBodyRef.current as HTMLDivElement).scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Listen for send message events
  const handleOutgoingMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    const userMessage: MessageType = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    setMessages((prev: MessageType[]) => [...prev, userMessage]);
    if (vectorStoreRef.current) vectorStoreRef.current.addMessage('user', message);
    setIsLoading(true);
    setTimeout(() => {
      generateBotResponse(message);
    }, 600);
  }, [generateBotResponse]);

  useEffect(() => {
    const handleSendMessage = (event: CustomEvent) => {
      handleOutgoingMessage(event.detail);
    };
    const handleClearConversation = () => {
      if (vectorStoreRef.current) vectorStoreRef.current.clear();
      setMessages([]);
    };
    const handleStartNewChat = () => {
      setMessages([{
        role: 'bot',
        content: 'New chat started. How can I help you?',
        timestamp: Date.now()
      }]);
    };
    window.addEventListener('sendMessage', handleSendMessage as EventListener);
    window.addEventListener('clearConversation', handleClearConversation);
    window.addEventListener('startNewChat', handleStartNewChat);
    return () => {
      window.removeEventListener('sendMessage', handleSendMessage as EventListener);
      window.removeEventListener('clearConversation', handleClearConversation);
      window.removeEventListener('startNewChat', handleStartNewChat);
    };
  }, [handleOutgoingMessage]);

  const formatResponseWithLists = (text: string) => {
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    let inList = false;
    let listType: 'numbered' | 'bullet' | null = null;
    let listItems: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
      if (numberedMatch) {
        if (!inList || listType !== 'numbered') {
          if (inList) {
            formattedLines.push(formatList(listItems, listType));
            listItems = [];
          }
          inList = true;
          listType = 'numbered';
        }
        listItems.push(numberedMatch[2]);
      } else if (bulletMatch) {
        if (!inList || listType !== 'bullet') {
          if (inList) {
            formattedLines.push(formatList(listItems, listType));
            listItems = [];
          }
          inList = true;
          listType = 'bullet';
        }
        listItems.push(bulletMatch[1]);
      } else {
        if (inList) {
          formattedLines.push(formatList(listItems, listType));
          listItems = [];
          inList = false;
          listType = null;
        }
        formattedLines.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      }
    }
    if (inList) {
      formattedLines.push(formatList(listItems, listType));
    }
    return formattedLines.join('<br>');
  };

  const formatList = (items: string[], type: 'numbered' | 'bullet' | null) => {
    if (type === 'numbered') {
      return `<ol>${items.map((item: string) => `<li>${item.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`).join('')}</ol>`;
    } else {
      return `<ul>${items.map((item: string) => `<li>${item.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`).join('')}</ul>`;
    }
  };

  // Move generateBotResponse above handleOutgoingMessage
  // ...existing code...

  // Removed duplicate handleOutgoingMessage

  return (
    <div className="chat-body" ref={chatBodyRef}>
      {messages.length === 0 && (
        <div className="message bot-message">
          <div dangerouslySetInnerHTML={{ __html: CHATBOT_ICON_SVG }} />
          <div className="message-text">
            Hello, how can I help you today?
          </div>
        </div>
      )}
      
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.role}-message`}>
          {message.role === 'bot' && (
            <div dangerouslySetInnerHTML={{ __html: CHATBOT_ICON_SVG }} />
          )}
          <div 
            className="message-text"
            dangerouslySetInnerHTML={{ 
              __html: message.role === 'bot' 
                ? formatResponseWithLists(message.content)
                : message.content.replace(/\n/g, '<br>')
            }}
          />
        </div>
      ))}
      
      {isLoading && (
        <div className="message bot-message thinking">
          <div dangerouslySetInnerHTML={{ __html: CHATBOT_ICON_SVG }} />
          <div className="message-text">
            <div className="thinking-indicator">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Footer() {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResizeInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = newHeight + 'px';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      window.dispatchEvent(new CustomEvent('sendMessage', { detail: message }));
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };



  return(
    <div className="chat-footer">
      <form onSubmit={handleSubmit} className="chat-from">
        <textarea 
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            autoResizeInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message..." 
          className="message-input" 
          required 
        />
        <div className="chat-controls">
          <button type="submit" id="send-message" className="material-symbols-rounded">arrow_upward</button>
        </div>
      </form>
    </div>
  );
}

class VectorStore {
  messages: MessageType[];
  maxContextLength: number;
  maxRecentMessages: number;
  similarityThreshold: number;
  constructor() {
    this.messages = [];
    this.maxContextLength = 4000;
    this.maxRecentMessages = 10;
    this.similarityThreshold = 0.3;
  }

  createEmbedding(text: string): Record<string, number> {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const embedding: Record<string, number> = {};
    words.forEach((word: string) => {
      embedding[word] = (embedding[word] || 0) + 1;
    });
    return embedding;
  }

  calculateSimilarity(embedding1: Record<string, number>, embedding2: Record<string, number>): number {
    const allWords = new Set([...Object.keys(embedding1), ...Object.keys(embedding2)]);
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    for (const word of allWords) {
      const val1 = embedding1[word] || 0;
      const val2 = embedding2[word] || 0;
      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    }
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (magnitude1 * magnitude2);
  }

  addMessage(role: 'user' | 'bot', content: string, timestamp: number = Date.now()) {
    const embedding = this.createEmbedding(content);
    this.messages.push({
      role,
      content,
      timestamp,
      embedding
    });
    this.saveToStorage();
  }

  getRelevantContext(newMessage: string, maxTokens: number = 3000): string {
    if (this.messages.length === 0) return '';
    const newEmbedding = this.createEmbedding(newMessage);
    const recentMessages = this.messages.slice(-this.maxRecentMessages);
    const scoredMessages = this.messages.map((msg: MessageType) => ({
      ...msg,
      similarity: this.calculateSimilarity(newEmbedding, msg.embedding || {})
    }));
    scoredMessages.sort((a, b) => {
      const recencyWeight = 0.3;
      const similarityWeight = 0.7;
      const recencyScore = (a.timestamp - b.timestamp) / (Date.now() - this.messages[0].timestamp);
      const similarityScore = b.similarity - a.similarity;
      return (similarityWeight * similarityScore) + (recencyWeight * recencyScore);
    });
    const contextMessages: MessageType[] = [];
    let totalLength = 0;
    for (const msg of recentMessages) {
      const messageText = `${msg.role}: ${msg.content}`;
      if (totalLength + messageText.length <= maxTokens) {
        contextMessages.unshift(msg);
        totalLength += messageText.length;
      }
    }
    for (const msg of scoredMessages) {
      if (contextMessages.some(m => m.timestamp === msg.timestamp)) continue;
      const messageText = `${msg.role}: ${msg.content}`;
      if (totalLength + messageText.length <= maxTokens && typeof (msg as { similarity?: number }).similarity === 'number' && (msg as { similarity: number }).similarity > this.similarityThreshold) {
        contextMessages.push(msg);
        totalLength += messageText.length;
      }
    }
    contextMessages.sort((a, b) => a.timestamp - b.timestamp);
    return contextMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  getRecentContext(count: number = 10): string {
    const recent = this.messages.slice(-count);
    return recent.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  clear() {
    this.messages = [];
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      localStorage.setItem('vectorChatHistory', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving vector chat history:', error);
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('vectorChatHistory');
      if (saved) {
        this.messages = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading vector chat history:', error);
      this.messages = [];
    }
  }

  getConversationSummary(): string | null {
    if (this.messages.length < 20) return null;
    const topics: Record<string, number> = {};
    this.messages.forEach((msg: MessageType) => {
      const words = msg.content.toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 3) {
          topics[word] = (topics[word] || 0) + 1;
        }
      });
    });
    const topTopics = Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
    return `Key topics discussed: ${topTopics.join(', ')}`;
  }
}
