import React, { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../services/geminiService';
import { KeyIcon, BotIcon, XIcon } from './Icon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedApiKey: string;
  savedInstruction: string;
  onSave: (key: string, instruction: string) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, savedApiKey, savedInstruction, onSave }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'instruction'>('api');
  const [apiKey, setApiKey] = useState('');
  const [instruction, setInstruction] = useState('');

  // Load saved values when modal opens
  useEffect(() => {
    if (isOpen) {
        setApiKey(savedApiKey);
        setInstruction(savedInstruction || DEFAULT_SYSTEM_INSTRUCTION);
        // If api key exists but user opened settings, default to instructions tab as it's more likely what they want to change
        if (savedApiKey && !savedInstruction) {
             setActiveTab('instruction');
        }
    }
  }, [isOpen, savedApiKey, savedInstruction]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey, instruction);
    onClose();
  };

  const handleResetInstruction = () => {
      if (window.confirm("Bạn có chắc chắn muốn khôi phục Chỉ dẫn gốc? Mọi định nghĩa tùy chỉnh sẽ bị mất.")) {
          setInstruction(DEFAULT_SYSTEM_INSTRUCTION);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800">Cài đặt Hệ thống</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
            <button 
                onClick={() => setActiveTab('api')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'api' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <KeyIcon />
                API Key
            </button>
            <button 
                onClick={() => setActiveTab('instruction')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'instruction' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <BotIcon />
                Định nghĩa & Chỉ dẫn AI
            </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'api' ? (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                         <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                             <KeyIcon />
                         </div>
                         <h4 className="text-lg font-bold text-slate-800">Cấu hình Google Gemini API</h4>
                         <p className="text-sm text-slate-500">Kết nối ứng dụng với bộ não AI của Google.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                        <strong>Lưu ý:</strong> API Key được lưu an toàn trong trình duyệt của bạn. Ứng dụng kết nối trực tiếp đến Google, không qua server trung gian.
                    </div>
                     <div className="text-center pt-2">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                            Lấy API Key miễn phí tại đây
                        </a>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-start">
                        <div>
                             <h4 className="text-lg font-bold text-slate-800">Tùy chỉnh hành vi AI</h4>
                             <p className="text-sm text-slate-500">Định nghĩa các thuật ngữ viết tắt (SXBT, CQHC...) hoặc quy tắc trả lời.</p>
                        </div>
                        <button 
                            onClick={handleResetInstruction}
                            className="text-xs text-slate-400 hover:text-red-500 underline"
                        >
                            Khôi phục mặc định
                        </button>
                    </div>

                    <div className="flex-1">
                        <textarea 
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            className="w-full h-64 md:h-80 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed resize-none"
                            placeholder="Nhập chỉ dẫn hệ thống..."
                        ></textarea>
                    </div>
                    <div className="text-xs text-slate-400">
                        * Mẹo: Bạn có thể thêm các dòng như "6. ABC: Định nghĩa mới" vào phần Định nghĩa.
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm"
            >
                Hủy
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all text-sm font-medium"
            >
                Lưu Cài Đặt
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;