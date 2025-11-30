import React, { useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { SendIcon, BotIcon } from './Icon';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatAreaProps {
  messages: ChatMessage[];
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onMenuClick: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
    messages, input, setInput, onSend, isLoading, onMenuClick 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center px-6 justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
             <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
                <h2 className="text-lg font-bold text-slate-800">Tra cứu & Tư vấn</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Đang sử dụng kho dữ liệu cá nhân của bạn
                </p>
            </div>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm">
                    <BotIcon />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">DINHNV LegalAI xin chào!</h3>
                <p className="max-w-md text-sm leading-relaxed mb-6">
                    Tôi là trợ lý AI chuyên biệt, chỉ làm việc dựa trên <strong>kho dữ liệu pháp lý</strong> mà bạn cung cấp.
                    <br/><br/>
                    Dữ liệu của bạn được lưu trữ an toàn và vĩnh viễn trên trình duyệt này. Hãy tải lên các văn bản cần thiết và bắt đầu tra cứu.
                </p>
            </div>
        ) : (
            messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
                >
                    {msg.role === MessageRole.MODEL && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2 shrink-0 mt-2">
                            <BotIcon />
                        </div>
                    )}
                    <div className={`
                        max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm
                        ${msg.role === MessageRole.USER 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                        }
                    `}>
                        {msg.role === MessageRole.MODEL ? (
                           <MarkdownRenderer content={msg.text} />
                        ) : (
                            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}
                    </div>
                </div>
            ))
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
            <div className="flex justify-start items-center ml-10">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-3">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Đang tra cứu trong kho dữ liệu...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Đặt câu hỏi dựa trên tài liệu của bạn..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-5 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                disabled={isLoading}
            />
            <button
                onClick={onSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
            >
                <SendIcon />
            </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
                AI chỉ trả lời dựa trên nội dung văn bản bạn đã lưu.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;