
import React, { forwardRef } from 'react';
import { CoverLetterData, TemplateType } from '../types';
import { DEFAULT_DESIGN } from '../constants';

interface Props {
  data: CoverLetterData;
  template: TemplateType;
}

const CoverLetterPreview = forwardRef<HTMLDivElement, Props>(({ data, template }, ref) => {
    const design = data.design || DEFAULT_DESIGN;

    // Dynamic Styles
    const fontMap = {
      sans: 'Inter, sans-serif',
      serif: 'Georgia, serif',
      mono: 'monospace'
    };
    
    const sizeMap = {
      small: '0.85rem',
      medium: '0.95rem',
      large: '1.05rem'
    };

    const spacingMap = {
      compact: '0.8',
      normal: '1',
      spacious: '1.2'
    };

    const containerStyle = {
      '--primary-color': design.color,
      fontFamily: fontMap[design.font],
      fontSize: sizeMap[design.fontSize],
      lineHeight: 1.5 * Number(spacingMap[design.spacing]),
    } as React.CSSProperties;
    
    // Render
    return (
        <div ref={ref} style={containerStyle} className="h-full">
            <TemplateRenderer data={data} template={template} />
        </div>
    );
});

const TemplateRenderer = ({ data, template }: { data: CoverLetterData, template: TemplateType }) => {
    // 1. Classic Serif / Formal
    if (['classic', 'executive', 'leftborder', 'timeline', 'elegant'].includes(template)) {
         return (
            <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-900 shadow-sm relative">
                <header className="border-b-2 border-slate-800 pb-6 mb-10 flex justify-between items-end" style={{ borderColor: 'var(--primary-color)' }}>
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-wider" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                        <p className="text-sm italic text-slate-600 mt-2">
                             {data.personalInfo.address} • {data.personalInfo.email} • {data.personalInfo.phone}
                        </p>
                    </div>
                </header>
                
                <LetterBody data={data} align="justify" />
            </div>
         );
    }

    // 2. Minimalist / Clean / Centered
    if (['minimalist', 'compact', 'swiss', 'symmetry'].includes(template)) {
         return (
            <div className={`w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-800 shadow-sm relative ${template === 'symmetry' ? 'text-center' : ''}`}>
                <header className="mb-12">
                    <h1 className="text-5xl font-light mb-4" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {data.personalInfo.email} | {data.personalInfo.phone}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{data.personalInfo.address}</div>
                </header>
                
                <LetterBody data={data} align={template === 'symmetry' ? 'center' : 'left'} />
            </div>
         );
    }

    // 3. Brutalist / Bold
    if (['neo', 'bold'].includes(template)) {
        return (
             <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-black shadow-sm relative border-8 border-black">
                 <header className="mb-12 border-b-8 border-black pb-8">
                     <h1 className="text-6xl font-black uppercase tracking-tighter mb-4" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                     <div className="font-bold text-lg">
                         {data.personalInfo.email} • {data.personalInfo.phone}
                     </div>
                 </header>
                 
                 <LetterBody data={data} align="justify" />
             </div>
        );
    }

    // 4. Creative / Bold Color Blocks
    if (['creative', 'glitch', 'tech', 'double'].includes(template)) {
         return (
            <div className="w-[210mm] min-h-[297mm] bg-white text-slate-800 shadow-sm relative flex flex-col">
                <div className="text-white p-10" style={{ backgroundColor: 'var(--primary-color)' }}>
                    <h1 className="text-3xl font-bold">{data.personalInfo.fullName}</h1>
                    <div className="text-sm opacity-80 mt-2 flex gap-4">
                        <span>{data.personalInfo.email}</span>
                        <span>{data.personalInfo.phone}</span>
                    </div>
                </div>
                <div className="p-[25mm] pt-10 flex-1">
                    <LetterBody data={data} align="justify" />
                </div>
            </div>
         );
    }

    // Default (Modern)
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-800 shadow-sm relative border-t-8" style={{ borderColor: 'var(--primary-color)' }}>
            {/* Header / Contact Info */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-3xl font-bold uppercase text-slate-900" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                    <div className="w-12 h-1 mt-2" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                </div>
                <div className="text-right text-sm text-slate-500">
                    <div>{data.personalInfo.address}</div>
                    <div>{data.personalInfo.email}</div>
                    <div>{data.personalInfo.phone}</div>
                </div>
            </div>

            <LetterBody data={data} align="justify" />
        </div>
    );
};

// Shared Body Component
const LetterBody = ({ data, align }: { data: CoverLetterData, align: 'left' | 'justify' | 'center' }) => {
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return (
        <>
            {/* Recipient Block */}
            <div className={`flex justify-between mb-12 ${align === 'center' ? 'flex-col items-center text-center gap-6' : ''}`}>
                <div className="text-sm text-slate-500 italic mt-auto">
                    {today}
                </div>
                <div className={`${align === 'center' ? 'text-center w-full' : 'text-right w-1/3'}`}>
                    <div className="font-bold">{data.recipientInfo.managerName}</div>
                    <div className="font-bold text-lg">{data.recipientInfo.company}</div>
                    <div className="whitespace-pre-wrap text-slate-600">{data.recipientInfo.address}</div>
                </div>
            </div>

            {/* Subject */}
            <div className="font-bold mb-6 underline">
                Objet : {data.content.subject}
            </div>

            {/* Body */}
            <div className={`space-y-4 mb-8 text-${align} whitespace-pre-wrap`}>
                <p>{data.content.opening}</p>
                {data.content.body.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                ))}
                <p>{data.content.closing}</p>
            </div>

            {/* Signature */}
            <div className={`mt-12 ${align === 'center' ? 'flex flex-col items-center' : ''}`}>
                <div className="mb-4">Cordialement,</div>
                
                <div className="h-24 mb-2">
                    {data.signature.type === 'image' && data.signature.imageUrl && (
                        <img 
                            src={data.signature.imageUrl} 
                            alt="Signature" 
                            crossOrigin="anonymous"
                            className="h-full object-contain" 
                        />
                    )}
                    {data.signature.type === 'draw' && data.signature.imageUrl && (
                        <img 
                            src={data.signature.imageUrl} 
                            alt="Signature" 
                            crossOrigin="anonymous"
                            className="h-full object-contain" 
                        />
                    )}
                    {data.signature.type === 'text' && (
                        <div className="font-cursive text-3xl text-slate-800 italic" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                            {data.signature.text || data.personalInfo.fullName}
                        </div>
                    )}
                </div>
                
                <div className="font-bold">{data.personalInfo.fullName}</div>
            </div>
        </>
    );
};

export default CoverLetterPreview;
