
import React, { forwardRef } from 'react';
import { CoverLetterData, TemplateType } from '../types';

interface Props {
  data: CoverLetterData;
  template: TemplateType;
}

const CoverLetterPreview = forwardRef<HTMLDivElement, Props>(({ data, template }, ref) => {
    
    // --- Styles Mapping based on Template ---
    
    // 1. Classic Serif (Classic, Executive, LeftBorder)
    if (['classic', 'executive', 'leftborder', 'timeline'].includes(template)) {
         return (
            <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-900 font-serif text-[11pt] leading-relaxed shadow-sm relative">
                <header className="border-b-2 border-slate-800 pb-6 mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-wider">{data.personalInfo.fullName}</h1>
                        <p className="text-sm italic text-slate-600 mt-2">
                             {data.personalInfo.address} • {data.personalInfo.email} • {data.personalInfo.phone}
                        </p>
                    </div>
                </header>
                
                <LetterBody data={data} align="justify" />
            </div>
         );
    }

    // 2. Minimalist / Clean (Minimalist, Compact, Swiss)
    if (['minimalist', 'compact', 'swiss'].includes(template)) {
         return (
            <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-800 font-sans text-[10.5pt] leading-relaxed shadow-sm relative">
                <header className="mb-12">
                    <h1 className="text-5xl font-light text-indigo-900 mb-4">{data.personalInfo.fullName}</h1>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {data.personalInfo.email} | {data.personalInfo.phone}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{data.personalInfo.address}</div>
                </header>
                
                <LetterBody data={data} align="left" />
            </div>
         );
    }

    // 3. Creative / Bold (Creative, Glitch, Tech, Double)
    if (['creative', 'glitch', 'tech', 'double'].includes(template)) {
         return (
            <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans text-[11pt] leading-relaxed shadow-sm relative flex flex-col">
                <div className="bg-slate-900 text-white p-10">
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
        <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[25mm] text-slate-800 font-sans text-[11pt] leading-relaxed shadow-sm relative border-t-8 border-slate-800">
            {/* Header / Contact Info */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-3xl font-bold uppercase text-slate-900">{data.personalInfo.fullName}</h1>
                    <div className="w-12 h-1 bg-primary-500 mt-2"></div>
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
});

// Shared Body Component to reduce duplication
const LetterBody = ({ data, align }: { data: CoverLetterData, align: 'left' | 'justify' }) => {
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return (
        <>
            {/* Recipient Block */}
            <div className="flex justify-between mb-12">
                <div className="text-sm text-slate-500 italic mt-auto">
                    {today}
                </div>
                <div className="text-right w-1/3">
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
            <div className="mt-12">
                <div className="mb-4">Cordialement,</div>
                
                <div className="h-24 mb-2">
                    {data.signature.type === 'image' && data.signature.imageUrl && (
                        <img src={data.signature.imageUrl} alt="Signature" className="h-full object-contain" />
                    )}
                    {data.signature.type === 'draw' && data.signature.imageUrl && (
                        <img src={data.signature.imageUrl} alt="Signature" className="h-full object-contain" />
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
