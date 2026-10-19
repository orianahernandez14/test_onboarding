
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  options?: Option[];
}

interface Option {
  text: string;
  next: string;
}

interface ConversationTree {
    [key: string]: { text: string; options?: Option[] };
}

interface GenericChatbotProps {
    conversationTree: ConversationTree;
    initialNode: string;
    triggerButtonIcon: React.ReactNode;
    triggerButtonClassName: string;
    chatHeaderTitle: string;
    botMessageClassName: string;
    userMessageClassName: string;
    optionButtonClassName: string;
    triggerPositionClassName: string;
    windowPositionClassName: string;
}

export const GenericChatbot: React.FC<GenericChatbotProps> = ({
    conversationTree,
    initialNode,
    triggerButtonIcon,
    triggerButtonClassName,
    chatHeaderTitle,
    botMessageClassName,
    userMessageClassName,
    optionButtonClassName,
    triggerPositionClassName,
    windowPositionClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', ...conversationTree[initialNode] }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);
  
  const handleOptionClick = (option: Option) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: option.text,
    }]);

    setTimeout(() => {
        const nextNode = conversationTree[option.next];
        if (nextNode) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: nextNode.text,
                options: nextNode.options,
            }]);
        }
    }, 500);
  };

  const windowTransitionClasses = isOpen 
    ? 'opacity-100 translate-y-0 scale-100' 
    : 'opacity-0 translate-y-4 scale-95 pointer-events-none';

  return (
    <>
      <div className={`fixed z-50 transition-all duration-300 ${triggerPositionClassName}`}>
        <button
          data-tour="app-chat"
          onClick={() => setIsOpen(prev => !prev)}
          className={`${triggerButtonClassName} rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform transform hover:scale-105`}
          aria-label="Abrir asistente virtual"
        >
          {triggerButtonIcon}
        </button>
      </div>

      <div className={`fixed w-full max-w-sm h-full max-h-[calc(100vh-140px)] bg-white rounded-lg shadow-2xl flex flex-col z-[70] border border-slate-200 transition-all duration-300 transform-gpu ${windowPositionClassName} ${windowTransitionClasses}`}>
          <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
              <h3 className="text-lg font-bold text-slate-800">{chatHeaderTitle}</h3>
              <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-800"
                  aria-label="Cerrar chat"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-100 custom-scrollbar">
              <div className="space-y-4 pb-4">
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${msg.sender === 'bot' ? botMessageClassName : userMessageClassName}`}>
                              <p className="text-sm">{msg.text}</p>
                          </div>
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
              </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white">
              <div className="space-y-2">
                  {messages[messages.length - 1]?.options?.map((option, index) => (
                       <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className={`w-full text-left text-sm font-medium p-3 rounded-lg transition-colors ${optionButtonClassName}`}
                      >
                          {option.text}
                      </button>
                  ))}
              </div>
          </div>
      </div>
    </>
  );
};
