import React from 'react';

interface Props {
  content: string;
}

// A simple parser for demo purposes. In production, use 'react-markdown'
const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold text-slate-900 mt-4">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold text-slate-900 mt-6 border-b pb-1">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={idx} className="text-2xl font-bold text-slate-900 mt-6">{line.replace('# ', '')}</h1>;
        
        // Bold
        const boldRegex = /\*\*(.*?)\*\*/g;
        const hasBold = boldRegex.test(line);

        // List items
        if (line.trim().startsWith('- ')) {
             const cleanLine = line.trim().substring(2);
             return (
                 <div key={idx} className="flex gap-2 ml-4">
                     <span className="text-slate-400">•</span>
                     <span>{
                        hasBold ? cleanLine.split(boldRegex).map((part, i) => 
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        ) : cleanLine
                     }</span>
                 </div>
             )
        }
        
        // Empty lines
        if (line.trim() === '') return <div key={idx} className="h-2"></div>;
        
        // Regular paragraph with potential bold
        return (
            <p key={idx}>
                {hasBold ? line.split(boldRegex).map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900">{part}</strong> : part
                ) : line}
            </p>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;