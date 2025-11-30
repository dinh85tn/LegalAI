import React, { useState } from 'react';
import { LegalDocument } from '../types';
import { FileTextIcon, PlusIcon, TrashIcon, EyeIcon, DownloadIcon, UploadCloudIcon, KeyIcon } from './Icon';

interface SidebarProps {
  documents: LegalDocument[];
  onAddDocument: () => void;
  onSelectDocument: (doc: LegalDocument) => void;
  onDeleteDocument: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onBackup: () => void;
  onRestore: () => void;
  onClearAll: () => void;
  onConfigKey: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    documents, onAddDocument, onSelectDocument, onDeleteDocument, isOpen, onClose, onBackup, onRestore, onClearAll, onConfigKey
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col shadow-xl flex-shrink-0 border-r border-slate-800
    `}>
      <div className="p-4 border-b border-slate-700 bg-slate-900">
        <h1 className="text-xl font-serif font-bold tracking-wide flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-lg shadow-lg shadow-blue-500/30">DINHNV</span> 
            <span className="text-slate-200">LegalAI</span>
        </h1>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider pl-1">Hệ thống tra cứu pháp lý riêng</p>
        <button onClick={onClose} className="md:hidden absolute right-4 top-5 text-slate-400 hover:text-white">
            ✕
        </button>
      </div>

      <div className="p-4 space-y-3">
        <button 
            onClick={onAddDocument}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/50 active:scale-[0.98] text-sm"
        >
            <PlusIcon />
            Nhập Dữ Liệu Mới
        </button>

        {/* Search Box */}
        <div className="relative">
            <input 
                type="text" 
                placeholder="Tìm trong kho dữ liệu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-2 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Kho lưu trữ ({documents.length})</span>
        </h3>
        
        {documents.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8 px-4 border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
                <p className="mb-2">📂 Kho trống</p>
                <p className="text-[10px] opacity-70">Dữ liệu bạn tải lên sẽ được lưu trữ vĩnh viễn tại đây.</p>
            </div>
        ) : (
            <div className="space-y-1.5">
                {filteredDocs.map(doc => (
                    <div 
                        key={doc.id} 
                        onClick={() => onSelectDocument(doc)}
                        className="group relative flex items-start justify-between bg-slate-800/40 hover:bg-slate-800 p-2.5 rounded border border-transparent hover:border-slate-600 cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden w-full">
                            <div className="text-blue-500 shrink-0 opacity-70 group-hover:opacity-100">
                                <FileTextIcon />
                            </div>
                            <div className="overflow-hidden flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-300 truncate group-hover:text-white transition-colors" title={doc.title}>
                                    {doc.title}
                                </p>
                                <p className="text-[9px] text-slate-500 truncate mt-0.5">
                                    {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="hidden group-hover:flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 shadow-[-8px_0_8px_rgba(30,41,59,1)] pl-2">
                             <button 
                                className="text-slate-400 hover:text-blue-400 p-1 rounded hover:bg-slate-700"
                                title="Xem nội dung"
                            >
                                <EyeIcon />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm(`Xóa vĩnh viễn văn bản: "${doc.title}" khỏi kho dữ liệu?`)) {
                                        onDeleteDocument(doc.id);
                                    }
                                }}
                                className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-700"
                                title="Xóa văn bản này"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredDocs.length === 0 && searchTerm && (
                    <p className="text-xs text-center text-slate-500 mt-4">Không tìm thấy tài liệu nào.</p>
                )}
            </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
         <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quản lý hệ thống</h4>
         <div className="grid grid-cols-2 gap-2 mb-2">
             <button 
                onClick={onBackup}
                className="flex items-center justify-center gap-1.5 p-2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors border border-slate-700"
                title="Tải toàn bộ dữ liệu về máy để dự phòng"
             >
                 <DownloadIcon />
                 <span>Sao lưu</span>
             </button>
             <button 
                onClick={onRestore}
                className="flex items-center justify-center gap-1.5 p-2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors border border-slate-700"
                title="Khôi phục dữ liệu từ file backup"
             >
                 <UploadCloudIcon />
                 <span>Khôi phục</span>
             </button>
         </div>
         <button 
            onClick={onConfigKey}
            className="w-full flex items-center justify-center gap-1.5 p-2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors border border-slate-700 mb-2"
            title="Cập nhật hoặc xóa API Key"
         >
             <KeyIcon />
             <span>Cấu hình API Key</span>
         </button>
         {documents.length > 0 && (
             <button 
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded bg-red-900/20 hover:bg-red-900/40 text-[10px] text-red-300 hover:text-red-200 transition-colors border border-red-900/30"
             >
                 <TrashIcon />
                 <span>Xóa toàn bộ dữ liệu</span>
             </button>
         )}
      </div>
    </div>
  );
};

export default Sidebar;