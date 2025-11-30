
import React, { useState, useEffect } from 'react';
import { DEFAULT_SYSTEM_INSTRUCTION, RECOMMENDED_MODELS, fetchOpenAIModels, fetchHuggingFaceModels } from '../services/geminiService';
import { KeyIcon, BotIcon, XIcon, CheckCircleIcon, GoogleIcon, OpenAIIcon, HuggingFaceIcon, ClaudeIcon, RefreshIcon } from './Icon';
import { AIProvider } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedGeminiKey: string;
  savedOpenAIKey: string;
  savedHuggingFaceKey: string;
  savedClaudeKey: string;
  
  savedGeminiModel: string;
  savedOpenAIModel: string;
  savedHfModel: string;
  savedClaudeModel: string;

  savedInstruction: string;
  savedProvider: AIProvider;
  onSave: (
      geminiKey: string, openAIKey: string, hfKey: string, claudeKey: string, 
      geminiModel: string, openAIModel: string, hfModel: string, claudeModel: string,
      instruction: string, provider: AIProvider
  ) => void;
}

const SettingsModal: React.FC<Props> = ({ 
    isOpen, onClose, 
    savedGeminiKey, savedOpenAIKey, savedHuggingFaceKey, savedClaudeKey, 
    savedGeminiModel, savedOpenAIModel, savedHfModel, savedClaudeModel,
    savedInstruction, savedProvider, onSave 
}) => {
  const [activeTab, setActiveTab] = useState<'api' | 'instruction'>('api');
  
  // Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [hfKey, setHfKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  
  // Models
  const [geminiModel, setGeminiModel] = useState('');
  const [openAIModel, setOpenAIModel] = useState('');
  const [hfModel, setHfModel] = useState('');
  const [claudeModel, setClaudeModel] = useState('');

  // Dynamic Models Lists
  const [openAIModelList, setOpenAIModelList] = useState<{id: string, name: string}[]>([]);
  const [hfModelList, setHfModelList] = useState<{id: string, name: string}[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [instruction, setInstruction] = useState('');

  useEffect(() => {
    if (isOpen) {
        setGeminiKey(savedGeminiKey);
        setOpenAIKey(savedOpenAIKey);
        setHfKey(savedHuggingFaceKey);
        setClaudeKey(savedClaudeKey);
        
        setGeminiModel(savedGeminiModel);
        setOpenAIModel(savedOpenAIModel);
        setHfModel(savedHfModel);
        setClaudeModel(savedClaudeModel);

        setProvider(savedProvider);
        setInstruction(savedInstruction || DEFAULT_SYSTEM_INSTRUCTION);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(
        geminiKey, openAIKey, hfKey, claudeKey, 
        geminiModel, openAIModel, hfModel, claudeModel,
        instruction, provider
    );
    onClose();
  };

  const handleResetInstruction = () => {
      if (window.confirm("Bạn có chắc chắn muốn khôi phục Chỉ dẫn gốc?")) {
          setInstruction(DEFAULT_SYSTEM_INSTRUCTION);
      }
  };

  const handleFetchModels = async (targetProvider: 'openai' | 'huggingface') => {
      setIsFetchingModels(true);
      try {
          if (targetProvider === 'openai') {
              if (!openAIKey) { alert("Vui lòng nhập OpenAI API Key trước."); return; }
              const models = await fetchOpenAIModels(openAIKey);
              setOpenAIModelList(models);
              if (models.length > 0) alert(`Đã tìm thấy ${models.length} models từ OpenAI.`);
          } else if (targetProvider === 'huggingface') {
              if (!hfKey) { alert("Vui lòng nhập Hugging Face Token trước."); return; }
              const models = await fetchHuggingFaceModels(hfKey);
              setHfModelList(models);
              if (models.length > 0) alert(`Đã tải top ${models.length} models phổ biến.`);
          }
      } catch (e) {
          alert("Lỗi khi tải danh sách models. Kiểm tra lại Key của bạn.");
      } finally {
          setIsFetchingModels(false);
      }
  };

  const isGeminiValid = geminiKey.startsWith('AIzaSy') && geminiKey.length >= 39;
  const isOpenAIValid = openAIKey.startsWith('sk-') && openAIKey.length > 20;
  const isHfValid = hfKey.startsWith('hf_') && hfKey.length > 20;
  const isClaudeValid = claudeKey.startsWith('sk-ant') && claudeKey.length > 20;

  const isCurrentProviderValid = () => {
      switch(provider) {
          case 'gemini': return isGeminiValid;
          case 'openai': return isOpenAIValid;
          case 'huggingface': return isHfValid;
          case 'claude': return isClaudeValid;
          default: return false;
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
                Nhà cung cấp & Mô hình
            </button>
            <button 
                onClick={() => setActiveTab('instruction')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'instruction' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <BotIcon />
                Chỉ dẫn AI
            </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'api' ? (
                <div className="space-y-6">
                    {/* Provider Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Chọn AI hoạt động chính</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setProvider('gemini')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm
                                    ${provider === 'gemini' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                                `}
                            >
                                <GoogleIcon /> Gemini
                            </button>
                            <button 
                                onClick={() => setProvider('openai')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm
                                    ${provider === 'openai' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                                `}
                            >
                                <OpenAIIcon /> OpenAI
                            </button>
                            <button 
                                onClick={() => setProvider('huggingface')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm
                                    ${provider === 'huggingface' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                                `}
                            >
                                <HuggingFaceIcon /> Hugging Face
                            </button>
                            <button 
                                onClick={() => setProvider('claude')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm
                                    ${provider === 'claude' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                                `}
                            >
                                <ClaudeIcon /> Claude
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        {provider === 'gemini' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Gemini API Key</label>
                                    <div className="relative">
                                        <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIzaSy..."
                                            className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 outline-none ${geminiKey && !isGeminiValid ? 'border-red-300' : 'border-slate-300 focus:ring-blue-500'}`}/>
                                        {geminiKey && isGeminiValid && <div className="absolute right-3 top-3.5 text-green-500"><CheckCircleIcon /></div>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Model Name</label>
                                    <input 
                                        type="text" 
                                        list="gemini-models" 
                                        value={geminiModel} 
                                        onChange={(e) => setGeminiModel(e.target.value)} 
                                        placeholder="Chọn hoặc nhập tên model..."
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                    <datalist id="gemini-models">
                                        {RECOMMENDED_MODELS.gemini.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </datalist>
                                    <p className="text-xs text-slate-400">Chọn từ danh sách hoặc tự nhập (VD: gemini-1.5-flash-latest)</p>
                                </div>
                            </div>
                        )}
                        {provider === 'openai' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">OpenAI API Key</label>
                                    <div className="relative">
                                        <input type="password" value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} placeholder="sk-..."
                                            className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 outline-none ${openAIKey && !isOpenAIValid ? 'border-red-300' : 'border-slate-300 focus:ring-green-500'}`}/>
                                        {openAIKey && isOpenAIValid && <div className="absolute right-3 top-3.5 text-green-500"><CheckCircleIcon /></div>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-slate-700">Model ID</label>
                                        <button onClick={() => handleFetchModels('openai')} disabled={isFetchingModels} className="text-xs flex items-center gap-1 text-green-600 hover:underline">
                                            <RefreshIcon /> {isFetchingModels ? 'Đang tải...' : 'Tải danh sách'}
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        list="openai-models"
                                        value={openAIModel} 
                                        onChange={(e) => setOpenAIModel(e.target.value)} 
                                        placeholder="Chọn hoặc nhập tên model..."
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                                    />
                                    <datalist id="openai-models">
                                        {RECOMMENDED_MODELS.openai.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        {openAIModelList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </datalist>
                                </div>
                            </div>
                        )}
                        {provider === 'huggingface' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Hugging Face Access Token</label>
                                    <div className="relative">
                                        <input type="password" value={hfKey} onChange={(e) => setHfKey(e.target.value)} placeholder="hf_..."
                                            className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 outline-none ${hfKey && !isHfValid ? 'border-red-300' : 'border-slate-300 focus:ring-yellow-500'}`}/>
                                        {hfKey && isHfValid && <div className="absolute right-3 top-3.5 text-green-500"><CheckCircleIcon /></div>}
                                    </div>
                                    <p className="text-xs text-slate-500">Cần Token có quyền 'Read'.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-slate-700">Model Path (Repo ID)</label>
                                        <button onClick={() => handleFetchModels('huggingface')} disabled={isFetchingModels} className="text-xs flex items-center gap-1 text-yellow-600 hover:underline">
                                            <RefreshIcon /> {isFetchingModels ? 'Đang tải...' : 'Tải top models'}
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        list="hf-models"
                                        value={hfModel} 
                                        onChange={(e) => setHfModel(e.target.value)} 
                                        placeholder="Chọn hoặc nhập tên model..."
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
                                    />
                                    <datalist id="hf-models">
                                        {RECOMMENDED_MODELS.huggingface.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        {hfModelList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </datalist>
                                    <p className="text-xs text-slate-400">Định dạng: organization/model-name</p>
                                </div>
                            </div>
                        )}
                        {provider === 'claude' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Anthropic API Key</label>
                                    <div className="relative">
                                        <input type="password" value={claudeKey} onChange={(e) => setClaudeKey(e.target.value)} placeholder="sk-ant-..."
                                            className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 outline-none ${claudeKey && !isClaudeValid ? 'border-red-300' : 'border-slate-300 focus:ring-purple-500'}`}/>
                                        {claudeKey && isClaudeValid && <div className="absolute right-3 top-3.5 text-green-500"><CheckCircleIcon /></div>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Model Name</label>
                                    <input 
                                        type="text" 
                                        list="claude-models"
                                        value={claudeModel} 
                                        onChange={(e) => setClaudeModel(e.target.value)} 
                                        placeholder="Chọn hoặc nhập tên model..."
                                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                    />
                                    <datalist id="claude-models">
                                        {RECOMMENDED_MODELS.claude.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-start">
                        <div>
                             <h4 className="text-lg font-bold text-slate-800">Tùy chỉnh hành vi AI</h4>
                             <p className="text-sm text-slate-500">Cấu hình dùng chung cho tất cả nhà cung cấp.</p>
                        </div>
                        <button onClick={handleResetInstruction} className="text-xs text-slate-400 hover:text-red-500 underline">Khôi phục mặc định</button>
                    </div>
                    <textarea 
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="flex-1 w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed resize-none"
                    ></textarea>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm">Hủy</button>
            <button 
                onClick={handleSave}
                disabled={!isCurrentProviderValid()}
                className={`px-6 py-2 text-white rounded-lg shadow-md transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800 hover:bg-slate-900`}
            >
                Lưu Cài Đặt
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
