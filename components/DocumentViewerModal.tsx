import React from 'react';
import { LegalDocument } from '../types';
import { XIcon, FileTextIcon, TrashIcon } from './Icon';
import MarkdownRenderer from './MarkdownRenderer';

interface Props {
  document: LegalDocument | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const DocumentViewerModal: React.FC<Props> = ({ document, onClose, onDelete }) => {
  if (!document) return null;

  const handleDelete = () => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa văn bản "${document.title}" không? Hành động này không thể hoàn tác.`)) {
          onDelete(document.id);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur">
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="text-blue-600 bg-blue-100 p-2 rounded-lg shrink-0">
                    <FileTextIcon />
                </div>
                <div className="overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 truncate pr-4">{document.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                        Ngày lưu: {new Date(document.createdAt).toLocaleDateString('vi-VN')} • ID: {document.id.slice(0, 8)}...
                    </p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all shrink-0"
            >
                <XIcon />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800 flex flex-col gap-1">
                    <strong>Thông tin văn bản:</strong>
                    <p>Hệ thống sẽ dựa vào nội dung dưới đây để trả lời câu hỏi. Nếu văn bản này đã hết hiệu lực, vui lòng xóa để tránh nhầm lẫn.</p>
                </div>
                <article className="prose prose-slate prose-sm md:prose-base max-w-none">
                    <MarkdownRenderer content={document.content} />
                </article>
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors border border-red-200"
            >
                <TrashIcon />
                Xóa văn bản này
            </button>
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;