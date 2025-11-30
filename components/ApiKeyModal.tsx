import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<Props> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Cấu hình API</h2>
            <p className="text-slate-500 text-sm mt-2">
                Để sử dụng DINHNV LegalAI, bạn cần cung cấp Google Gemini API Key.
            </p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
                <input 
                    type="password" 
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                <strong>Lưu ý:</strong> API Key của bạn được lưu trữ an toàn trong trình duyệt (Local Storage) và chỉ được sử dụng để gọi trực tiếp đến Google API. Không có server trung gian nào lưu key của bạn.
            </div>

            <button 
                onClick={() => onSave(key)}
                disabled={key.length < 10}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Bắt đầu sử dụng
            </button>
            
            <div className="text-center">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                    Chưa có API Key? Lấy tại đây
                 </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;