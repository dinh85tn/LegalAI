import React, { useState, useRef } from 'react';
import { UploadIcon, XIcon, CheckCircleIcon, TrashIcon } from './Icon';
import { parseFile } from '../services/fileParsing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docs: {title: string, content: string}[]) => void;
}

const DocumentUploadModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  
  // Single mode state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Bulk mode state
  const [bulkDocs, setBulkDocs] = useState<{title: string, content: string, fileName: string}[]>([]);
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsProcessing(true);
    setBulkDocs([]);
    setTitle('');
    setContent('');

    try {
      if (files.length === 1) {
        setUploadMode('single');
        const file = files[0];
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
        const text = await parseFile(file);
        setContent(text);
      } else {
        setUploadMode('bulk');
        const results = await Promise.all(files.map(async (file) => {
           try {
               const text = await parseFile(file);
               return {
                   title: file.name.replace(/\.[^/.]+$/, ""),
                   content: text,
                   fileName: file.name
               };
           } catch (err: any) {
               console.error(`Failed to parse ${file.name}`, err);
               // Hiển thị lỗi nhưng không chặn toàn bộ quá trình bulk upload
               alert(`Lỗi file ${file.name}: ${err.message}`);
               return null; 
           }
        }));
        setBulkDocs(results.filter(d => d !== null) as any);
      }
    } catch (error: any) {
      alert("Lỗi xử lý file: " + error.message);
    } finally {
      setIsProcessing(false);
      // Reset input value to allow re-selecting same files if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (activeTab === 'paste' || (activeTab === 'upload' && uploadMode === 'single')) {
        if (!title.trim() || !content.trim()) {
            alert("Vui lòng nhập tiêu đề và nội dung.");
            return;
        }
        onSave([{ title, content }]);
    } else {
        // Bulk save
        if (bulkDocs.length === 0) {
            alert("Chưa có văn bản nào được tải lên thành công.");
            return;
        }
        onSave(bulkDocs);
    }

    // Reset fields
    setTitle('');
    setContent('');
    setBulkDocs([]);
    setUploadMode('single');
    setActiveTab('upload');
    onClose();
  };

  const removeBulkDoc = (index: number) => {
      const newDocs = [...bulkDocs];
      newDocs.splice(index, 1);
      setBulkDocs(newDocs);
      if (newDocs.length === 0) {
          setUploadMode('single');
      }
  };

  const isSaveDisabled = () => {
      if (isProcessing) return true;
      if (activeTab === 'paste' || (activeTab === 'upload' && uploadMode === 'single')) {
          return !title || !content;
      }
      return bulkDocs.length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800">Thêm Văn Bản Mới</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XIcon />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Tải lên File
            </button>
            <button 
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'paste' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                Nhập/Dán văn bản
            </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
            
            {/* Title Input - Only show in Single Mode */}
            {(activeTab === 'paste' || (activeTab === 'upload' && uploadMode === 'single')) && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề văn bản</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Luật Lao động 2019"
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
            )}

            {activeTab === 'upload' ? (
                <>
                    <div 
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group relative
                            ${isProcessing ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}
                        `}
                        onClick={() => !isProcessing && fileInputRef.current?.click()}
                    >
                        {isProcessing ? (
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-sm font-medium text-blue-700">Đang trích xuất nội dung ({uploadMode === 'bulk' ? 'Nhiều file' : '1 file'})...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors mb-3">
                                    <UploadIcon />
                                </div>
                                <p className="text-sm font-medium text-slate-700">Nhấn để tải lên file</p>
                                <p className="text-xs text-slate-400 mt-1">Hỗ trợ: PDF, Word (docx, doc), Excel, Text</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    multiple
                                    accept=".txt,.md,.pdf,.docx,.doc,.xlsx,.xls,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    onChange={handleFileChange}
                                />
                            </>
                        )}
                    </div>

                    {/* Single Mode Success Message */}
                    {uploadMode === 'single' && content && !isProcessing && (
                        <div className="w-full bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 border border-green-200">
                            <CheckCircleIcon />
                            <span className="text-sm">Đã tải nội dung thành công ({content.length} ký tự)</span>
                        </div>
                    )}

                    {/* Bulk Mode List */}
                    {uploadMode === 'bulk' && bulkDocs.length > 0 && !isProcessing && (
                        <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">Danh sách file ({bulkDocs.length})</span>
                                <span className="text-xs text-slate-400">Tự động đặt tiêu đề theo tên file</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {bulkDocs.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="text-green-500 shrink-0"><CheckCircleIcon /></div>
                                            <span className="text-sm text-slate-700 truncate font-medium">{doc.fileName}</span>
                                            <span className="text-xs text-slate-400 shrink-0">({doc.content.length} ký tự)</span>
                                        </div>
                                        <button 
                                            onClick={() => removeBulkDoc(idx)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                            title="Xóa"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col h-64">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung văn bản</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Dán nội dung văn bản pháp luật vào đây..."
                        className="flex-1 w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
                    ></textarea>
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
                disabled={isSaveDisabled()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all text-sm font-medium"
            >
                {uploadMode === 'bulk' && activeTab === 'upload' 
                    ? `Lưu ${bulkDocs.length} Văn Bản` 
                    : 'Lưu vào Kho Dữ liệu'
                }
            </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;