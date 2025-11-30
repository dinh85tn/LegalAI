import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import DocumentUploadModal from './components/DocumentUploadModal';
import DocumentViewerModal from './components/DocumentViewerModal';
import { LegalDocument, ChatMessage, MessageRole } from './types';
import * as StorageService from './services/storage';
import { analyzeLegalQuery } from './services/geminiService';
import { DEFAULT_DOCUMENTS } from './services/defaultDocuments';

function App() {
  // State
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // New State for Viewing Document
  const [viewingDocument, setViewingDocument] = useState<LegalDocument | null>(null);

  // Hidden input for restore
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Initial Load
  useEffect(() => {
    const loadDocs = async () => {
        try {
            // Thử nạp dữ liệu mẫu nếu DB trống
            await StorageService.seedDatabase(DEFAULT_DOCUMENTS);
            
            // Sau đó tải danh sách
            const docs = await StorageService.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents", error);
        }
    };
    loadDocs();
  }, []);

  const handleAddDocuments = async (newDocs: {title: string, content: string}[]) => {
    const docsToAdd: LegalDocument[] = newDocs.map((d, index) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5) + index,
      title: d.title,
      content: d.content,
      category: 'general',
      createdAt: Date.now()
    }));
    
    await StorageService.saveDocuments(docsToAdd);
    // Reload from DB to ensure sort order
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
          // Nạp lại dữ liệu mẫu nếu muốn, hoặc để trống. Ở đây để trống cho sạch.
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
      const answer = await analyzeLegalQuery(userMsg.text, documents, messages);
      
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
        {/* Overlay for mobile sidebar */}
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