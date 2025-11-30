
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import DocumentUploadModal from './components/DocumentUploadModal';
import DocumentViewerModal from './components/DocumentViewerModal';
import SettingsModal from './components/SettingsModal';
import { LegalDocument, ChatMessage, MessageRole, AIProvider } from './types';
import * as StorageService from './services/storage';
import { analyzeLegalQuery, DEFAULT_SYSTEM_INSTRUCTION } from './services/geminiService';

const API_KEY_STORAGE = 'gemini_api_key';
const OPENAI_KEY_STORAGE = 'openai_api_key';
const HF_KEY_STORAGE = 'hf_api_key';
const CLAUDE_KEY_STORAGE = 'claude_api_key';

const GEMINI_MODEL_STORAGE = 'gemini_model';
const OPENAI_MODEL_STORAGE = 'openai_model';
const HF_MODEL_STORAGE = 'hf_model';
const CLAUDE_MODEL_STORAGE = 'claude_model';

const INSTRUCTION_STORAGE = 'legal_ai_instruction';
const PROVIDER_STORAGE = 'selected_ai_provider';

function App() {
  // State
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Settings State - Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [hfKey, setHfKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');

  // Settings State - Models
  const [geminiModel, setGeminiModel] = useState('');
  const [openAIModel, setOpenAIModel] = useState('');
  const [hfModel, setHfModel] = useState('');
  const [claudeModel, setClaudeModel] = useState('');
  
  const [systemInstruction, setSystemInstruction] = useState('');
  const [activeProvider, setActiveProvider] = useState<AIProvider>('gemini');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // New State for Viewing Document
  const [viewingDocument, setViewingDocument] = useState<LegalDocument | null>(null);

  // Hidden input for restore
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Initial Load
  useEffect(() => {
    const loadDocs = async () => {
        try {
            const docs = await StorageService.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents", error);
        }
    };
    loadDocs();

    // Load Settings
    const savedGeminiKey = localStorage.getItem(API_KEY_STORAGE);
    const savedOpenAIKey = localStorage.getItem(OPENAI_KEY_STORAGE);
    const savedHfKey = localStorage.getItem(HF_KEY_STORAGE);
    const savedClaudeKey = localStorage.getItem(CLAUDE_KEY_STORAGE);
    
    const savedGeminiModel = localStorage.getItem(GEMINI_MODEL_STORAGE);
    const savedOpenAIModel = localStorage.getItem(OPENAI_MODEL_STORAGE);
    const savedHfModel = localStorage.getItem(HF_MODEL_STORAGE);
    const savedClaudeModel = localStorage.getItem(CLAUDE_MODEL_STORAGE);

    const savedInstruction = localStorage.getItem(INSTRUCTION_STORAGE);
    const savedProvider = localStorage.getItem(PROVIDER_STORAGE) as AIProvider;
    
    if (savedGeminiKey) setGeminiKey(savedGeminiKey);
    if (savedOpenAIKey) setOpenAIKey(savedOpenAIKey);
    if (savedHfKey) setHfKey(savedHfKey);
    if (savedClaudeKey) setClaudeKey(savedClaudeKey);

    if (savedGeminiModel) setGeminiModel(savedGeminiModel);
    if (savedOpenAIModel) setOpenAIModel(savedOpenAIModel);
    if (savedHfModel) setHfModel(savedHfModel);
    if (savedClaudeModel) setClaudeModel(savedClaudeModel);

    if (savedProvider) setActiveProvider(savedProvider);

    if (savedInstruction) {
        setSystemInstruction(savedInstruction);
    } else {
        setSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION);
    }

    // Force settings open if no keys at all
    if (!savedGeminiKey && !savedOpenAIKey && !savedHfKey && !savedClaudeKey && !process.env.API_KEY) {
        setIsSettingsModalOpen(true);
    }
  }, []);

  const handleSaveSettings = (
      gKey: string, oKey: string, hKey: string, cKey: string, 
      gModel: string, oModel: string, hModel: string, cModel: string,
      instruction: string, provider: AIProvider
  ) => {
      localStorage.setItem(API_KEY_STORAGE, gKey);
      localStorage.setItem(OPENAI_KEY_STORAGE, oKey);
      localStorage.setItem(HF_KEY_STORAGE, hKey);
      localStorage.setItem(CLAUDE_KEY_STORAGE, cKey);

      localStorage.setItem(GEMINI_MODEL_STORAGE, gModel);
      localStorage.setItem(OPENAI_MODEL_STORAGE, oModel);
      localStorage.setItem(HF_MODEL_STORAGE, hModel);
      localStorage.setItem(CLAUDE_MODEL_STORAGE, cModel);

      localStorage.setItem(INSTRUCTION_STORAGE, instruction);
      localStorage.setItem(PROVIDER_STORAGE, provider);
      
      setGeminiKey(gKey);
      setOpenAIKey(oKey);
      setHfKey(hKey);
      setClaudeKey(cKey);

      setGeminiModel(gModel);
      setOpenAIModel(oModel);
      setHfModel(hModel);
      setClaudeModel(cModel);

      setSystemInstruction(instruction);
      setActiveProvider(provider);
  };

  const handleAddDocuments = async (newDocs: {title: string, content: string}[]) => {
    const docsToAdd: LegalDocument[] = newDocs.map((d, index) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5) + index,
      title: d.title,
      content: d.content,
      category: 'general',
      createdAt: Date.now()
    }));
    
    await StorageService.saveDocuments(docsToAdd);
    const updatedDocs = await StorageService.getDocuments();
    setDocuments(updatedDocs);
  };

  const handleDeleteDocument = async (id: string) => {
    await StorageService.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (viewingDocument?.id === id) {
        setViewingDocument(null);
    }
  };

  const handleClearAll = async () => {
      if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn XÓA TOÀN BỘ văn bản trong kho dữ liệu?\n\nHành động này không thể hoàn tác.")) {
          await StorageService.clearAllDocuments();
          setDocuments([]);
          setViewingDocument(null);
      }
  };

  const handleBackup = async () => {
      try {
          await StorageService.exportData();
      } catch (e) {
          alert("Lỗi sao lưu dữ liệu");
      }
  };

  const handleRestoreClick = () => {
      if (window.confirm("Cảnh báo: Khi khôi phục, dữ liệu mới sẽ được thêm vào kho hiện tại. Bạn có muốn tiếp tục?")) {
          restoreInputRef.current?.click();
      }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      try {
          const count = await StorageService.importData(file);
          alert(`Đã khôi phục thành công ${count} văn bản!`);
          const updatedDocs = await StorageService.getDocuments();
          setDocuments(updatedDocs);
      } catch (err) {
          alert("Khôi phục thất bại: File không hợp lệ.");
      } finally {
          if (restoreInputRef.current) restoreInputRef.current.value = '';
      }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Determine current key and model based on provider
    let currentKey = '';
    let currentModel = '';

    switch(activeProvider) {
        case 'gemini': 
            currentKey = geminiKey || process.env.API_KEY || ''; 
            currentModel = geminiModel;
            break;
        case 'openai': 
            currentKey = openAIKey; 
            currentModel = openAIModel;
            break;
        case 'huggingface': 
            currentKey = hfKey; 
            currentModel = hfModel;
            break;
        case 'claude': 
            currentKey = claudeKey; 
            currentModel = claudeModel;
            break;
    }

    if (!currentKey) {
        setIsSettingsModalOpen(true);
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await analyzeLegalQuery(
          userMsg.text, 
          documents, 
          messages, 
          currentKey, // Pass specific key
          systemInstruction,
          activeProvider, // Pass provider
          currentModel // Pass model
      );
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: answer,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: `**Lỗi:** ${error.message}`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        documents={documents}
        onAddDocument={() => setIsModalOpen(true)}
        onSelectDocument={(doc) => setViewingDocument(doc)}
        onDeleteDocument={handleDeleteDocument}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onBackup={handleBackup}
        onRestore={handleRestoreClick}
        onClearAll={handleClearAll}
        onConfigSettings={() => setIsSettingsModalOpen(true)}
      />
      
      {/* Hidden Restore Input */}
      <input 
        type="file" 
        ref={restoreInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleRestoreFile} 
      />
      
      <main className="flex-1 flex flex-col h-full relative w-full">
        {isSidebarOpen && (
            <div 
                className="absolute inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}
        
        <ChatArea 
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          isLoading={isLoading}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
      </main>

      <DocumentUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddDocuments}
      />
      
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        
        savedGeminiKey={geminiKey}
        savedOpenAIKey={openAIKey}
        savedHuggingFaceKey={hfKey}
        savedClaudeKey={claudeKey}

        savedGeminiModel={geminiModel}
        savedOpenAIModel={openAIModel}
        savedHfModel={hfModel}
        savedClaudeModel={claudeModel}

        savedInstruction={systemInstruction}
        savedProvider={activeProvider}
        onSave={handleSaveSettings}
      />

      {/* Viewer Modal */}
      <DocumentViewerModal 
        document={viewingDocument}
        onClose={() => setViewingDocument(null)}
        onDelete={handleDeleteDocument}
      />
    </div>
  );
}

export default App;
