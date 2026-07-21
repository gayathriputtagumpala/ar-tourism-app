import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const TouristGuideChatbot = ({ locationName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm your AI Tour Guide. Do you have any questions about ${locationName}?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Reset chat when location changes
    setMessages([
      { role: 'assistant', content: `Hello! I'm your AI Tour Guide. Do you have any questions about ${locationName}?` }
    ]);
  }, [locationName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for Gemini
      const contents = messages.concat(userMessage).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      // Add system prompt context as first user message
      contents.unshift({
        role: 'user',
        parts: [{ text: `You are an expert AI tour guide for ${locationName}. Answer the user's questions about this location enthusiastically, concisely, and accurately. Do not use formatting like bold or asterisks.` }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't find an answer to that right now.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my knowledge base right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>AI Tour Guide</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Ask me about {locationName}</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--surface-2)'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? 'var(--violet)' : 'var(--surface)',
                color: msg.role === 'user' ? 'white' : 'var(--text)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--line)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--surface)', border: '1px solid var(--line)', padding: '12px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center' }}>
                <Loader2 size={18} color="var(--cyan)" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} style={{
            padding: '16px',
            background: 'var(--surface)',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            gap: '10px'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              style={{
                flex: 1,
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                background: 'var(--cyan)',
                border: 'none',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !input.trim() ? 0.5 : 1
              }}
            >
              <Send size={18} color="black" style={{ marginLeft: '4px' }} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={30} color="white" />
        </button>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default TouristGuideChatbot;
