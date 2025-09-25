import React, { useState, useEffect, useRef, useContext } from 'react';
import { Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, Modal, RefreshControl } from 'react-native';
import { supabase } from '../services/supabase';
import { AuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import useHaptics from './useHaptics';
import BounceView from './BounceView';
import useSoundEffect from './useSoundEffect';
import CustomAlert from '../components/atoms/CustomAlert';
import LoadingSpinner from '../components/atoms/LoadingSpinner';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Markdown from 'react-native-markdown-display';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';

import Constants from 'expo-constants';

const OPENROUTER_API_KEY = Constants.expoConfig?.extra?.OPENROUTER_API_KEY || Constants.manifest?.extra?.OPENROUTER_API_KEY;
const OPENROUTER_API_BASE = Constants.expoConfig?.extra?.OPENROUTER_API_BASE || Constants.manifest?.extra?.OPENROUTER_API_BASE || 'https://openrouter.ai/v1';

if (!OPENROUTER_API_KEY || !OPENROUTER_API_BASE) {
  console.warn('[AIChatScreen] Missing OpenRouter API key or base URL in environment variables.');
}


function TypingDots() {
  const [dotCount, setDotCount] = React.useState(1);
  React.useEffect(() => {
    const interval = setInterval(() => setDotCount(d => (d % 3) + 1), 400);
    return () => clearInterval(interval);
  }, []);
  return <Text style={{ fontSize: 18, color: '#FF6F61', fontWeight: 'bold' }}>{'.'.repeat(dotCount)}</Text>;
}

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😱', label: 'Surprised' },
  { emoji: '🥳', label: 'Excited' },
  { emoji: '😐', label: 'Neutral' },
];

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export default function AIChatScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });
  
  const showAlert = (title, message, type = 'error') => {
    setAlert({ visible: true, title, message, type });
  };
  
  const hideAlert = () => {
    setAlert({ visible: false, title: '', message: '', type: 'info' });
  };
  const [mood, setMood] = useState(MOODS[0]);
  const [restaurants, setRestaurants] = useState([]);
  const flatListRef = useRef();
  const triggerHaptic = useHaptics();
  const playSound = useSoundEffect();
  const typingFadeAnim = useRef(new Animated.Value(0)).current;

  // Keyboard state
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Fetch restaurant list for matching clickable mentions
  useEffect(() => {
    (async () => {
      // Try to fetch all restaurants from your backend or Supabase
      let { data, error } = await supabase.from('restaurants').select('id, name');
      if (!error && data) setRestaurants(data);
    })();
  }, []);

  // Persist mood across sessions
  useEffect(() => {
    (async () => {
      const savedMood = await AsyncStorage.getItem('ai_chat_mood');
      if (savedMood) {
        const found = MOODS.find(m => m.label === savedMood);
        if (found) setMood(found);
      }
    })();
  }, []);
  const handleSetMood = async (m) => {
    setMood(m);
    triggerHaptic('medium');
    await AsyncStorage.setItem('ai_chat_mood', m.label);
  };

  // Only fetch chat history on initial mount or user change, not after every message
  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchChatHistory().finally(() => setRefreshing(false));
  }, []);

  // Do NOT call fetchChatHistory after sending messages or AI replies!


  const fetchChatHistory = async () => {
    if (!user) return;
    // Only fetch if user.id is a valid UUID (Supabase expects UUID, Clerk uses 'user_xxx')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      setInitialLoading(false);
      setMessages([]);
      showAlert('AI Chat Disabled', 'AI chat history is not available for this account.');
      return;
    }
    setInitialLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        showAlert('Error Loading Chat', 'Could not load chat history. Please try again.');
        console.error('Error fetching chat history:', error);
      } else if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Exception in fetchChatHistory:', err);
      showAlert('Connection Error', 'Could not connect to the server. Please check your connection and try again.');
    } finally {
      setInitialLoading(false);
    }
  };


  const lastMessageCount = useRef(0);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    triggerHaptic('heavy');
    playSound('send');
    setLoading(true);
    setInput('');
    const userMsg = {
      user_id: user.id,
      sender: 'user',
      message: input,
      created_at: new Date().toISOString(),
      mood: mood.label
    };
    let aiMsgObj;
    let aiThinkMsgObj;
    let aiText = '';
    let aiThinking = null;
    let aiTruncated = false;
    // Add user message to state immediately for instant feedback
    setMessages(prev => [...prev, userMsg]);
    try {
      await supabase.from('ai_chats').insert([userMsg]);
      // Gather context for AI
      const lastMsgs = [...messages.slice(-8), userMsg];
      const contextText = lastMsgs.map(m => `${m.sender === 'user' ? 'User' : 'AI'}${m.mood ? ` (${m.mood})` : ''}: ${m.message}`).join('\n');
      // Restaurant context
      const restaurantNames = restaurants?.map(r => r.name).join(', ');
      // Time context
      const now = new Date();
      const hour = now.getHours();
      let timeOfDay = 'day';
      if (hour < 11) timeOfDay = 'morning';
      else if (hour < 16) timeOfDay = 'afternoon';
      else if (hour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      // --- USER PROFILE MEMORY ---
      // Try to load user profile, stats, and favorites from AsyncStorage or backend
      let userProfile = { name: user?.name || '', email: user?.email || '', stats: {}, favorites: [] };
      try {
        const profileStr = await AsyncStorage.getItem('ai_user_profile');
        if (profileStr) userProfile = { ...userProfile, ...JSON.parse(profileStr) };
      } catch (err) {
        console.error('[sendMessage] Error loading user profile from AsyncStorage:', err);
      }

      // Compose personalized stats summary
      const statsSummary = userProfile.stats ?
        `Bookings: ${userProfile.stats.bookings || 0}, Reviews: ${userProfile.stats.reviews || 0}, Favorites: ${userProfile.stats.favorites || 0}` : '';
      const favoritesSummary = userProfile.favorites && userProfile.favorites.length > 0
        ? `Favorite restaurants: ${userProfile.favorites.map(f => f.name).join(', ')}` : '';

      // Improved system prompt with personalization
      const systemPrompt = `You are a world-class AI assistant for a restaurant chat app.\n
- Always be friendly, concise, and helpful.\n- Format your replies using rich Markdown: bold, italic, lists, code, links, and emoji.\n- Use relevant emojis to make the chat lively.\n- Personalize your suggestions using the user's profile, history, and favorites.\n- If the user asks about restaurants, recommend from this list: ${restaurantNames || 'none available'}.\n- If you mention a restaurant, use its exact name from the list.\n- If the user's request is unclear, ask a clarifying question.\n- If the user is in a certain mood, match your tone.\n- The user's current mood is: ${mood.label} ${mood.emoji}.\n- The current time of day is: ${timeOfDay}.\n- User profile: Name: ${userProfile.name}, Email: ${userProfile.email}.\n- User stats: ${statsSummary}.\n- ${favoritesSummary}\n- If you don't know the answer, say so honestly.\n- Always try to make your answer unique, not generic.\n- If you suggest a restaurant, include a short reason and relate it to user's tastes if possible.\n- If the user has favorites, prioritize those for recommendations.\n- Remember previous topics for multi-turn context.\n\nEXAMPLES:\nQ: Can you suggest a place for dinner?\nA: **How about _Sate Khas Senayan_?** 🍢 It's great for dinner!\nQ: I'm feeling sad.\nA: I hope a cozy meal at _Bakmi GM_ can cheer you up! 😊\nQ: Recommend something like my favorites.\nA: Based on your favorites (_Bakmi GM_, _Sate Khas Senayan_), you might enjoy _Nasi Uduk Kebon Kacang_ for delicious local flavors!\n\nChat history:\n${contextText}\nAI:`;

      // OpenAI API call
      let aiText = '';
      let lastAiData = null;
      let lastError = null;
      try {
        // Mock AI response to prevent network errors during development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        const mockResponse = {
          choices: [{
            message: {
              content: "This is a mock AI response. The actual OpenRouter API integration has been temporarily disabled to prevent network errors during development."
            }
          }]
        };

        let aiData = null;
        let rawText = '';
        try {
          console.log("DeepSeek API full response:", mockResponse.choices[0].message.content);
          rawText = mockResponse.choices[0].message.content;
          console.log("Raw Text: ", rawText);
          aiData = rawText;
        } catch (jsonErr) {
          // Not JSON, likely an HTML error page
          aiText = 'AI server error: Received invalid response from OpenRouter. Check your API key and endpoint.';
          lastAiData = rawText;
          lastError = jsonErr;
          console.log('DeepSeek API raw error response:', rawText);
        }
        lastAiData = aiData;
        let aiThinking = null;
        let aiTruncated = false;
        if (aiData && aiData.choices && aiData.choices.length > 0 && aiData.choices[0].message) {
          const msg = aiData.choices[0].message;
          console.log('DeepSeek raw message object:', msg);
          let content = '';
          if (typeof msg === 'string') {
            content = msg.trim();
          } else if (msg.content && typeof msg.content === 'string' && msg.content.trim()) {
            content = msg.content.trim();
          } else if (msg.reasoning && typeof msg.reasoning === 'string' && msg.reasoning.trim()) {
            content = msg.reasoning.trim();
          } else if (msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0) {
            content = msg.parts.map(p => (typeof p === 'string' ? p : JSON.stringify(p))).join('\n').trim();
          } else {
            content = '';
          }
          // Debug: log raw AI content
          console.log('[AIChatScreen] Raw AI content:', content);
          // Fallback for empty, nonsense, or very short responses
          if (!content || content.length < 10 || /^rat/i.test(content)) {
            content = 'AI is having trouble responding. Please try again later.';
          }
          // Extract <think>...</think>
          let aiThinkMessageObj = null;
          const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
          if (thinkMatch) {
            aiThinking = thinkMatch[1].trim();
            // Add a "thinking" message to the chat
            aiThinkMessageObj = {
              user_id: user.id,
              sender: 'ai',
              message: '[thinking]',
              created_at: new Date().toISOString(),
              thinking: aiThinking,
              isThinking: true
            };
            content = content.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
          }
          aiText = typeof content === 'string' ? content : String(content || '');
          console.log('[AIChatScreen] aiText after extraction:', aiText);
          // Check for truncation
          if (aiData.choices[0].finish_reason === 'length' || aiData.choices[0].native_finish_reason === 'length') {
            aiTruncated = true;
          }
          // Add both thinking and final answer messages to chat
          aiMsgObj = {
            user_id: user.id,
            sender: 'ai',
            message: aiText,
            created_at: new Date().toISOString(),
            thinking: aiThinking,
            truncated: aiTruncated
          };
          if (aiThinking) {
            aiThinkMsgObj = {
              user_id: user.id,
              sender: 'ai',
              message: '[thinking]',
              created_at: new Date().toISOString(),
              thinking: aiThinking,
              isThinking: true
            };
          }
        } else if (aiData && aiData.error && aiData.error.message) {
          aiText = `AI error: ${aiData.error.message}`;
          showAlert('AI Response Error', aiData.error.message, 'error');
          aiMsgObj = {
            user_id: user.id,
            sender: 'ai',
            message: aiText,
            created_at: new Date().toISOString(),
          };
        } else if (aiData && aiData.error && aiData.error.code === 500) {
          aiText = 'AI server error: Internal error from OpenRouter. Please try again later.';
          showAlert('Server Error', 'The AI service is currently experiencing issues. Please try again later.', 'error');
          aiMsgObj = {
            user_id: user.id,
            sender: 'ai',
            message: aiText,
            created_at: new Date().toISOString(),
          };
        }
      } catch (err) {
        aiText = '';
        lastError = err;
        console.error('[sendMessage] Error during OpenRouter fetch or parsing:', err);
        showAlert('Connection Error', 'Could not connect to the AI service. Please check your connection and try again.', 'error');
        aiMsgObj = {
          user_id: user.id,
          sender: 'ai',
          message: 'AI server error: Internal error from OpenRouter. Please try again later.',
          created_at: new Date().toISOString(),
        };
      }
      // Debug: log full DeepSeek response
      console.log('DeepSeek API full response:', lastAiData);
      if (lastError) console.log('DeepSeek API error:', lastError);
      // Friendly reply for greetings
      if (["hi","hello","hey","hai","halo","yo","greetings","good morning","good afternoon","good evening"].some(greet => input.toLowerCase().includes(greet))) {
        aiText = `Hello! ${mood.emoji} How can I help you today?`;
      }

      // Show error bubble if AI is totally blank or error
      if (!aiText || aiText.trim() === '' || aiText.trim().toLowerCase() === 'null' || aiText.trim().toLowerCase() === 'undefined') {
        aiText = 'AI is having trouble responding. Please try again later.';
      }
       // Use the outer let aiMsgObj declared at the top
       console.log('[setMessages] Adding AI message:', aiMsgObj);
       // Add both user, thinking (if present), and AI messages in a single functional update
       setMessages(prev => {
         const newMsgs = [...prev];
         if (aiThinkMsgObj) newMsgs.push(aiThinkMsgObj);
         if (aiMsgObj) newMsgs.push(aiMsgObj);
         return newMsgs;
       });
       // Play sound for AI reply
       playSound('receive');
       lastMessageCount.current += aiThinkMsgObj ? 2 : 1;
       try {
         await supabase.from('ai_chats').insert([aiMsgObj]);
       } catch (err) {
         console.error('[sendMessage] Error inserting aiMsgObj into supabase:', err);
       }
    } finally {
      setLoading(false);
    }
  };


  // Helper: Find and link restaurant mentions
  function renderRichAIMessage(text) {
    // Find all restaurant names in text
    let chunks = [];
    let lastIdx = 0;
    let matches = [];
    if (restaurants.length > 0) {
      for (const r of restaurants) {
        const regex = new RegExp(`\\b${r.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          matches.push({ start: match.index, end: regex.lastIndex, name: r.name, id: r.id });
        }
      }
      matches = matches.sort((a, b) => a.start - b.start);
    }
    if (matches.length === 0) {
      return <Markdown style={{ body: styles.bubbleText }} rules={markdownRules}>{text}</Markdown>;
    }
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      if (lastIdx < m.start) {
        chunks.push(<Markdown key={lastIdx} style={{ body: styles.bubbleText }} rules={markdownRules}>{text.slice(lastIdx, m.start)}</Markdown>);
      }
      chunks.push(
        <Text
          key={m.start}
          style={{ color: '#FFB300', textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 16 }}
          onPress={() => navigation.navigate('RestaurantDetail', { id: m.id })}
        >
          {m.name}
        </Text>
      );
      lastIdx = m.end;
    }
    if (lastIdx < text.length) {
      chunks.push(<Markdown key={lastIdx} style={{ body: styles.bubbleText }} rules={markdownRules}>{text.slice(lastIdx)}</Markdown>);
    }
    // FIX: Use View instead of Text to wrap chunks to prevent word/char wrapping issue
    return <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>{chunks}</View>;
  }

  // Markdown rules for code blocks with syntax highlighting
  const markdownRules = {
    code_inline: (node, children, parent, styles) => (
      <Text key={node.key} style={{ backgroundColor: '#eee', borderRadius: 4, fontFamily: 'monospace', padding: 2 }}>{node.content}</Text>
    ),
    code_block: (node, children, parent, styles) => (
      <SyntaxHighlighter
        key={node.key}
        language={node.language || 'javascript'}
        style={atomOneDark}
        highlighter="hljs"
        customStyle={{ borderRadius: 8, padding: 8, fontSize: 13 }}
      >
        {node.content}
      </SyntaxHighlighter>
    ),
    fence: (node, children, parent, styles) => (
      <SyntaxHighlighter
        key={node.key}
        language={node.language || 'javascript'}
        style={atomOneDark}
        highlighter="hljs"
        customStyle={{ borderRadius: 8, padding: 8, fontSize: 13 }}
      >
        {node.content}
      </SyntaxHighlighter>
    ),
    link: (node, children, parent, styles) => (
      <Text
        key={node.key}
        style={{ color: '#1976D2', textDecorationLine: 'underline' }}
        onPress={() => Linking.openURL(node.attributes.href)}
      >
        {children}
      </Text>
    ),
  };

  // Animated chat bubble with slide and pop for new messages
  // Only animate new messages (not every render)
  const lastAnimatedIndex = useRef(-1);
  const AnimatedBubble = React.memo(({ item, index, children }) => {
    const shouldAnimate = index > lastAnimatedIndex.current;
    const slideAnim = useRef(new Animated.Value(shouldAnimate ? (item.sender === 'user' ? 60 : -60) : 0)).current;
    const scaleAnim = useRef(new Animated.Value(shouldAnimate ? 0.7 : 1)).current;
    useEffect(() => {
      if (shouldAnimate) {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 340,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          })
        ]).start();
        playSound('pop');
        lastAnimatedIndex.current = index;
      }
    }, []);
    return (
      <Animated.View style={{
        transform: [
          { translateX: slideAnim },
          { scale: scaleAnim }
        ],
        marginVertical: 2,
      }}>
        {children}
      </Animated.View>
    );
  });

  const [thinkingModal, setThinkingModal] = useState({ visible: false, content: '' });
  const handleContinue = (aiMsgIndex) => {
    // For now, just resend last chat + 'continue' (stub)
    setInput('continue');
  };

  const renderItem = ({ item, index }) => (
    <AnimatedBubble item={item} index={index}>
      <View style={[
        styles.bubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble,
        // Remove maxWidth override here to use styles.bubble's maxWidth
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          {item.mood && item.sender === 'user' && (
          <Text style={{ fontSize: 18, marginRight: 8, alignSelf: 'center' }}>
            {MOODS.find(m => m.label === item.mood)?.emoji}
          </Text>
        )}
          {item.sender === 'ai' ? (
            <View style={{ flex: 1 }}>
              {(() => {console.log('[renderItem] AI message:', item.message); return renderRichAIMessage(item.message); })()}
              {item.thinking && (
                <TouchableOpacity
                  style={{ marginTop: 6, alignSelf: 'flex-start', padding: 4, backgroundColor: '#e3f2fd', borderRadius: 6 }}
                  onPress={() => setThinkingModal({ visible: true, content: item.thinking })}>
                  <Text style={{ color: '#1976D2', fontSize: 13 }}>💡 DeepSeek is thinking...</Text>
                </TouchableOpacity>
              )}
              {item.truncated && (
                <TouchableOpacity
                  style={{ marginTop: 6, alignSelf: 'flex-start', padding: 4, backgroundColor: '#fff3e0', borderRadius: 6 }}
                  onPress={() => handleContinue(index)}>
                  <Text style={{ color: '#FF9800', fontSize: 13 }}>Continue...</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.bubbleText}>{item.message}</Text>
          )}
        </View>
        <Text style={{ fontSize: 11, color: '#888', alignSelf: 'flex-end', marginTop: 2 }}>{formatTime(item.created_at)}</Text>
      </View>
    </AnimatedBubble>
  );

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (loading) {
      Animated.timing(typingFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(typingFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const SkeletonMessageLoader = () => {
    return (
      <View style={{padding: 10}}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[
            styles.bubble,
            i % 2 === 0 ? styles.aiBubble : styles.userBubble,
            {height: 60 + Math.random() * 40, width: `${50 + Math.random() * 30}%`, marginVertical: 8,
             backgroundColor: i % 2 === 0 ? '#EBF5FB' : '#F9F9F9'}
          ]}/>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={[styles.innerContainer, { paddingBottom: isKeyboardVisible ? keyboardHeight : 0 }]}> 
        <Text style={styles.header}>AI Chat</Text>

        {/* DeepSeek Thinking Modal */}
        <Modal
          visible={thinkingModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setThinkingModal({ visible: false, content: '' })}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressOut={() => setThinkingModal({ visible: false, content: '' })}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.33)', justifyContent: 'center', alignItems: 'center' }}
          >
            <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, maxWidth: '85%' }}>
              <Text style={{ fontWeight: 'bold', color: '#1976D2', fontSize: 16, marginBottom: 8 }}>💡 DeepSeek is thinking...</Text>
              <Text style={{ fontSize: 15, color: '#222' }}>{thinkingModal.content}</Text>
              <TouchableOpacity onPress={() => setThinkingModal({ visible: false, content: '' })} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
                <Text style={{ color: '#1976D2', fontWeight: 'bold', fontSize: 15 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {initialLoading ? <SkeletonMessageLoader /> : (
        <FlatList
          ref={flatListRef}
          data={loading ? [...messages, { sender: 'ai-typing', id: 'ai-typing' }] : messages}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6F61']}
              tintColor={'#FF6F61'}
            />
          }
          renderItem={({ item, index }) => {
            if (index === 0) {
              // Only log once per render
              console.log('[FlatList] messages array at render:', loading ? [...messages, { sender: 'ai-typing', id: 'ai-typing' }] : messages);
            }
            if (item.sender === 'ai-typing') {
              return (
                <View style={[
                  styles.bubble,
                  styles.aiBubble,
                  { flexDirection: 'row', alignItems: 'center', minWidth: 60, backgroundColor: '#E3F2FD', borderRadius: 16, marginVertical: 2 }
                ]}>
                  <TypingDots size={11} color={'#888'} />
                </View>
              );
            }
            return renderItem({ item, index });
          }}
          keyExtractor={(item, i) => (item.created_at ? item.created_at + '-' + item.sender + '-' + i : i.toString())}
          contentContainerStyle={styles.chatContainer}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={!initialLoading && (
            <View style={{alignItems: 'center', justifyContent: 'center', padding: 20}}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ddd" />
              <Text style={{color: '#888', marginTop: 10, textAlign: 'center'}}>No messages yet.\nStart chatting with AI!</Text>
            </View>
          )}
        />)}
        {/* Mood Selector */}
        <View style={styles.moodSelector}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m.label}
              style={{ marginHorizontal: 6, padding: 2, borderRadius: 16, borderWidth: m.label === mood.label ? 2 : 0, borderColor: '#FFB300' }}
              onPress={() => handleSetMood(m)}
              accessibilityLabel={m.label}
            >
              <Text style={{ fontSize: 26 }}>{m.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          style={styles.kbAvoid}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              editable={!loading}
              onFocus={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              style={[styles.sendBtn, {backgroundColor: loading || !input.trim() ? '#ccc' : '#FFB300'}]}
              activeOpacity={0.85}
            >
              {loading ? (
                <LoadingSpinner size={24} color="#fff" />
              ) : (
                <BounceView duration={180}>
                  <Ionicons name="send" size={24} color="#fff" style={{ marginLeft: 2 }} />
                </BounceView>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = {
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#FFF7F0',
    borderTopWidth: 1,
    borderColor: '#f3f3f3',
  },
  kbAvoid: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.1,
  },
  chatContainer: {
    padding: 14,
    paddingBottom: 24,
    paddingTop: 8,
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 4,
    maxWidth: '85%',
    flexShrink: 1,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  aiBubble: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 16,
    color: '#222',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderTopWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#FFB300',
    borderRadius: 8,
    padding: 10,
  },
};
