
import React, { forwardRef } from 'react';
import { ResumeData, TemplateType } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, User } from 'lucide-react';
import { DEFAULT_DESIGN } from '../constants';

interface Props {
  data: ResumeData;
  template: TemplateType;
}

const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data, template }, ref) => {
  const design = data.design || DEFAULT_DESIGN;
  
  // Dynamic Styles Wrapper
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

  const radiusMap = {
      none: '0px',
      medium: '8px',
      full: '9999px'
  };

  const containerStyle = {
      '--primary-color': design.color,
      '--border-radius': radiusMap[design.borderRadius || 'medium'],
      fontFamily: fontMap[design.font],
      fontSize: sizeMap[design.fontSize],
      lineHeight: 1.4 * Number(spacingMap[design.spacing]),
  } as React.CSSProperties;

  const renderTemplate = () => {
    switch (template) {
        case 'modern': return <ModernTemplate data={data} />;
        case 'classic': return <ClassicTemplate data={data} />;
        case 'minimalist': return <MinimalistTemplate data={data} />;
        case 'executive': return <ExecutiveTemplate data={data} />;
        case 'creative': return <CreativeTemplate data={data} />;
        case 'tech': return <TechTemplate data={data} />;
        case 'compact': return <CompactTemplate data={data} />;
        case 'timeline': return <TimelineTemplate data={data} />;
        case 'leftborder': return <LeftBorderTemplate data={data} />;
        case 'glitch': return <GlitchTemplate data={data} />;
        case 'swiss': return <SwissTemplate data={data} />;
        case 'double': return <DoubleTemplate data={data} />;
        case 'neo': return <NeoTemplate data={data} />;
        case 'bold': return <BoldTemplate data={data} />;
        case 'symmetry': return <SymmetryTemplate data={data} />;
        case 'elegant': return <ElegantTemplate data={data} />;
        default: return <ModernTemplate data={data} />;
    }
  };

  return (
      <div ref={ref} style={containerStyle} className="resume-preview-container h-full">
          {renderTemplate()}
      </div>
  );
});

// Helper for photo
const ProfilePhoto = ({ url, className = "", style = {} }: { url?: string, className?: string, style?: React.CSSProperties }) => {
    if (!url) return null;
    return (
        <div className={`overflow-hidden shrink-0 ${className}`} style={{ ...style, borderRadius: 'var(--border-radius)' }}>
            <img 
                src={url} 
                alt="Profile" 
                crossOrigin="anonymous" 
                className="w-full h-full object-cover" 
            />
        </div>
    );
};

// Helper CSS classes for safety
const SAFE_TEXT = "break-words whitespace-pre-wrap overflow-wrap-anywhere w-full min-w-0";
const SAFE_LINK = "break-all overflow-wrap-anywhere min-w-0";
const CONTAINER_BASE = "w-[210mm] min-h-[297mm] bg-white overflow-hidden"; 

// --- Templates ---

// 1. Neo - Brutalist
const NeoTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-white text-black p-8 border-8 border-black font-sans`}>
        <header className="border-b-8 border-black pb-8 mb-8 flex gap-6 items-start">
             <div className="flex-1">
                 <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 break-words" style={{ textShadow: `4px 4px 0 var(--primary-color)` }}>
                     {data.personalInfo.fullName}
                 </h1>
                 <p className="text-2xl font-bold bg-black text-white inline-block px-4 py-1 break-words transform -rotate-1">
                     {data.personalInfo.jobTitle}
                 </p>
             </div>
             <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] shrink-0" style={{ borderRadius: 0 }} />
        </header>

        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-4 border-r-4 border-black pr-6 min-w-0 flex flex-col gap-8">
                <section>
                    <h3 className="text-xl font-black uppercase bg-black text-white px-2 py-1 mb-4 inline-block transform rotate-1">Contact</h3>
                    <div className="space-y-2 font-bold text-sm">
                        <div className={SAFE_LINK}>{data.personalInfo.email}</div>
                        <div>{data.personalInfo.phone}</div>
                        <div>{data.personalInfo.address}</div>
                    </div>
                </section>

                <section>
                     <h3 className="text-xl font-black uppercase bg-black text-white px-2 py-1 mb-4 inline-block transform -rotate-1">Skills</h3>
                     <div className="flex flex-wrap gap-2">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="border-2 border-black px-2 py-1 font-bold text-xs hover:bg-black hover:text-white transition-colors">{skill}</span>
                         ))}
                     </div>
                </section>

                <section>
                     <h3 className="text-xl font-black uppercase bg-black text-white px-2 py-1 mb-4 inline-block transform rotate-1">Education</h3>
                     {data.education.map(edu => (
                         <div key={edu.id} className="mb-4 border-b-2 border-black pb-2 last:border-0">
                             <div className="font-black text-sm">{edu.degree}</div>
                             <div className="text-xs font-bold" style={{ color: 'var(--primary-color)' }}>{edu.institution}</div>
                             <div className="text-xs">{edu.startDate} - {edu.endDate}</div>
                         </div>
                     ))}
                </section>
            </div>

            <div className="col-span-8 min-w-0">
                 <section className="mb-8 border-4 border-black p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                     <p className={`font-bold text-justify ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                 </section>

                 <section>
                     <h3 className="text-3xl font-black uppercase mb-6 underline decoration-4 underline-offset-4 decoration-black">Experience</h3>
                     <div className="space-y-8">
                         {data.experience.map(exp => (
                             <div key={exp.id}>
                                 <div className="flex justify-between items-start mb-2 border-b-4 border-black pb-1">
                                     <h4 className="text-xl font-black uppercase">{exp.position}</h4>
                                     <span className="font-bold bg-black text-white px-2 text-xs py-1 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                 </div>
                                 <div className="font-bold mb-2 text-lg" style={{ color: 'var(--primary-color)' }}>{exp.company}</div>
                                 <p className={`font-medium text-sm ${SAFE_TEXT}`}>{exp.description}</p>
                             </div>
                         ))}
                     </div>
                 </section>
            </div>
        </div>
    </div>
);

// 2. Bold - Typography focused
const BoldTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-white text-slate-900 p-12`}>
        <header className="mb-12">
            <h1 className="text-[5rem] leading-[0.85] font-black tracking-tighter text-slate-900 mb-4 break-words">
                {data.personalInfo.fullName.split(' ').map((n,i) => <span key={i} className="block">{n}</span>)}
            </h1>
            <div className="flex items-center gap-6 border-y-2 border-black py-4">
                 <p className="text-xl font-bold uppercase tracking-widest flex-1">{data.personalInfo.jobTitle}</p>
                 <div className="text-right text-xs font-bold uppercase tracking-wider space-y-1">
                     <div className={SAFE_LINK}>{data.personalInfo.email}</div>
                     <div>{data.personalInfo.phone}</div>
                 </div>
            </div>
        </header>

        <div className="grid grid-cols-12 gap-12">
            <div className="col-span-8 min-w-0">
                <section className="mb-12">
                    <p className={`text-xl font-medium leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                </section>

                <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-8 border-b-2 border-slate-200 pb-2">Experience</h2>
                    <div className="space-y-10">
                        {data.experience.map(exp => (
                            <div key={exp.id}>
                                <div className="text-3xl font-bold mb-1 break-words">{exp.position}</div>
                                <div className="flex justify-between items-center mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                                    <span style={{ color: 'var(--primary-color)' }}>{exp.company}</span>
                                    <span>{exp.startDate} — {exp.endDate}</span>
                                </div>
                                <p className={`text-slate-700 leading-relaxed ${SAFE_TEXT}`}>{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="col-span-4 min-w-0 space-y-12">
                {data.personalInfo.photoUrl && (
                     <ProfilePhoto url={data.personalInfo.photoUrl} className="w-full aspect-square object-cover grayscale contrast-125 mb-8" />
                )}

                <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6 border-b-2 border-slate-200 pb-2">Skills</h2>
                    <div className="flex flex-col gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="text-lg font-bold border-b border-slate-100 pb-1">{skill}</span>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6 border-b-2 border-slate-200 pb-2">Education</h2>
                    <div className="space-y-6">
                        {data.education.map(edu => (
                            <div key={edu.id}>
                                <div className="font-bold text-lg leading-tight mb-1">{edu.degree}</div>
                                <div className="text-sm font-medium opacity-70 mb-1">{edu.institution}</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
);

// 3. Symmetry - Centered
const SymmetryTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-[#fffaf0] text-slate-800 p-12 text-center`}>
        <header className="mb-12 flex flex-col items-center">
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 mb-6 border-4 border-white shadow-md" style={{ borderRadius: 'var(--border-radius)' }} />
            <h1 className="text-4xl font-serif italic mb-2 break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">{data.personalInfo.jobTitle}</p>
            <div className="flex justify-center gap-6 text-xs text-slate-500 border-t border-b border-slate-300 py-3 w-full max-w-lg">
                <span className={SAFE_LINK}>{data.personalInfo.email}</span>
                <span>•</span>
                <span>{data.personalInfo.phone}</span>
                <span>•</span>
                <span>{data.personalInfo.address}</span>
            </div>
        </header>

        <section className="mb-10 max-w-2xl mx-auto">
             <p className={`text-slate-600 leading-loose italic ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
        </section>

        <div className="grid grid-cols-2 gap-12 text-left">
             <div className="min-w-0">
                 <h2 className="text-center text-lg font-serif italic mb-8 border-b border-slate-300 pb-2" style={{ color: 'var(--primary-color)' }}>Experience</h2>
                 <div className="space-y-8">
                     {data.experience.map(exp => (
                         <div key={exp.id} className="text-center">
                             <h3 className="font-bold text-slate-800 mb-1">{exp.position}</h3>
                             <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">{exp.company} | {exp.startDate} - {exp.endDate}</div>
                             <p className={`text-sm text-slate-600 ${SAFE_TEXT}`}>{exp.description}</p>
                         </div>
                     ))}
                 </div>
             </div>

             <div className="min-w-0 flex flex-col gap-10">
                 <div>
                     <h2 className="text-center text-lg font-serif italic mb-8 border-b border-slate-300 pb-2" style={{ color: 'var(--primary-color)' }}>Education</h2>
                     <div className="space-y-6">
                         {data.education.map(edu => (
                             <div key={edu.id} className="text-center">
                                 <div className="font-bold">{edu.degree}</div>
                                 <div className="text-sm italic text-slate-500">{edu.institution}</div>
                                 <div className="text-xs text-slate-400 mt-1">{edu.startDate} - {edu.endDate}</div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div>
                     <h2 className="text-center text-lg font-serif italic mb-8 border-b border-slate-300 pb-2" style={{ color: 'var(--primary-color)' }}>Skills</h2>
                     <div className="flex flex-wrap justify-center gap-2">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs shadow-sm">{skill}</span>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    </div>
);

// 4. Elegant - Sophisticated
const ElegantTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-white text-slate-700 p-0 flex flex-col`}>
        <header className="px-12 py-10 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-8">
             <div className="flex-1">
                 <h1 className="text-4xl font-serif text-slate-900 mb-2 tracking-wide break-words">{data.personalInfo.fullName}</h1>
                 <p className="text-sm uppercase tracking-[0.15em] font-medium" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.jobTitle}</p>
             </div>
             <div className="text-right text-xs space-y-1 text-slate-500 font-medium">
                 <div className={SAFE_LINK}>{data.personalInfo.email}</div>
                 <div>{data.personalInfo.phone}</div>
                 <div>{data.personalInfo.address}</div>
             </div>
        </header>

        <div className="flex flex-1">
             <div className="w-1/3 bg-slate-50 p-10 border-r border-slate-200 min-w-0 flex flex-col gap-10">
                 {data.personalInfo.photoUrl && (
                     <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 mx-auto shadow-md" style={{ borderRadius: 'var(--border-radius)' }} />
                 )}
                 
                 <section>
                     <h3 className="font-serif text-lg italic border-b border-slate-300 pb-2 mb-4 text-slate-900">Education</h3>
                     <div className="space-y-6">
                         {data.education.map(edu => (
                             <div key={edu.id}>
                                 <div className="font-bold text-sm text-slate-800">{edu.degree}</div>
                                 <div className="text-xs italic text-slate-600 mb-1">{edu.institution}</div>
                                 <div className="text-xs text-slate-400">{edu.startDate} - {edu.endDate}</div>
                             </div>
                         ))}
                     </div>
                 </section>

                 <section>
                     <h3 className="font-serif text-lg italic border-b border-slate-300 pb-2 mb-4 text-slate-900">Expertise</h3>
                     <div className="flex flex-col gap-2">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="text-sm border-l-2 pl-3" style={{ borderColor: 'var(--primary-color)' }}>{skill}</span>
                         ))}
                     </div>
                 </section>
             </div>

             <div className="w-2/3 p-10 min-w-0">
                 <section className="mb-10">
                     <h3 className="font-serif text-lg italic border-b border-slate-200 pb-2 mb-4 text-slate-900" style={{ color: 'var(--primary-color)' }}>Profile</h3>
                     <p className={`text-sm leading-relaxed text-justify ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                 </section>

                 <section>
                     <h3 className="font-serif text-lg italic border-b border-slate-200 pb-2 mb-6 text-slate-900" style={{ color: 'var(--primary-color)' }}>Experience</h3>
                     <div className="space-y-8 relative">
                         <div className="absolute left-[7px] top-2 bottom-0 w-px bg-slate-200"></div>
                         {data.experience.map(exp => (
                             <div key={exp.id} className="relative pl-8">
                                 <div className="absolute left-0 top-1.5 w-4 h-4 bg-white border-2 rounded-full z-10" style={{ borderColor: 'var(--primary-color)' }}></div>
                                 <div className="flex justify-between items-baseline mb-1">
                                     <h4 className="font-bold text-slate-800 text-lg">{exp.position}</h4>
                                     <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                 </div>
                                 <div className="text-sm font-medium uppercase tracking-wider mb-3 text-slate-500">{exp.company}</div>
                                 <p className={`text-sm text-slate-600 leading-relaxed ${SAFE_TEXT}`}>{exp.description}</p>
                             </div>
                         ))}
                     </div>
                 </section>
             </div>
        </div>
    </div>
);

// Existing templates (Modern, Classic, etc.) remain below...
const ModernTemplate = ({ data }: { data: ResumeData }) => (
  <div className={`${CONTAINER_BASE} text-slate-800 shadow-sm flex`}>
    <div className="w-1/3 text-white p-6 flex flex-col shrink-0 min-w-0" style={{ backgroundColor: '#1e293b' }}> {/* Dark slate fixed bg for readability */}
        <div className="mb-8 text-center">
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 mx-auto mb-4 border-4 border-slate-700" style={{ borderRadius: 'var(--border-radius)' }} />
            <h1 className="text-xl font-bold leading-tight mb-2 break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
            <p className="font-medium uppercase tracking-widest text-xs break-words opacity-80">{data.personalInfo.jobTitle}</p>
        </div>

        <div className="space-y-4 text-sm mb-8 w-full">
            <ContactItem icon={<Mail size={14} className="shrink-0" />} text={data.personalInfo.email} light className={SAFE_LINK} />
            <ContactItem icon={<Phone size={14} className="shrink-0" />} text={data.personalInfo.phone} light className="break-words" />
            <ContactItem icon={<MapPin size={14} className="shrink-0" />} text={data.personalInfo.address} light className="break-words" />
        </div>

        <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-4 text-slate-400">Education</h3>
            {data.education.map(edu => (
                <div key={edu.id} className="mb-4">
                    <p className="font-bold text-sm break-words">{edu.degree}</p>
                    <p className="text-slate-400 text-xs break-words">{edu.institution}</p>
                    <p className="text-slate-500 text-xs italic">{edu.startDate} - {edu.endDate}</p>
                </div>
            ))}
        </div>

        <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-4 text-slate-400">Skills</h3>
            <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                    <span key={i} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 break-words max-w-full" style={{ borderColor: 'var(--primary-color)', borderRadius: 'calc(var(--border-radius) / 2)' }}>{skill}</span>
                ))}
            </div>
        </div>
    </div>

    <div className="w-2/3 p-8 flex flex-col min-w-0">
        <div className="mb-8">
            <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b-2 w-16 pb-1 mb-4" style={{ borderColor: 'var(--primary-color)' }}>Profile</h3>
            <p className={`text-slate-600 leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
        </div>

        <div className="flex-1">
             <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b-2 w-16 pb-1 mb-6" style={{ borderColor: 'var(--primary-color)' }}>Experience</h3>
             <div className="space-y-6">
                {data.experience.map(exp => (
                    <div key={exp.id} className="w-full">
                        <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                            <h4 className="font-bold text-slate-900 break-words max-w-[70%]">{exp.position}</h4>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="font-medium text-sm mb-2 break-words" style={{ color: 'var(--primary-color)' }}>{exp.company}</p>
                        <p className={`text-sm text-slate-600 ${SAFE_TEXT}`}>{exp.description}</p>
                    </div>
                ))}
             </div>
        </div>
    </div>
  </div>
);

const ClassicTemplate = ({ data }: { data: ResumeData }) => (
  <div className={`${CONTAINER_BASE} text-slate-900 p-12`}>
    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex items-center justify-between gap-6">
         <div className="flex-1 min-w-0">
             <h1 className="text-4xl font-bold mb-2 break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
             <p className="text-lg text-slate-600 italic mb-4 break-words">{data.personalInfo.jobTitle}</p>
             <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className={SAFE_LINK}>{data.personalInfo.email}</span>
                <span>•</span>
                <span>{data.personalInfo.phone}</span>
                <span>•</span>
                <span className="break-words">{data.personalInfo.address}</span>
             </div>
         </div>
         <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 object-cover border border-slate-200 shadow-sm shrink-0" style={{ borderRadius: 'var(--border-radius)' }} />
    </div>

    <SectionTitleClassic title="Summary" />
    <p className={`text-sm leading-relaxed mb-8 text-justify ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>

    <SectionTitleClassic title="Experience" />
    <div className="space-y-6 mb-8">
        {data.experience.map(exp => (
            <div key={exp.id}>
                <div className="flex justify-between mb-1 flex-wrap gap-2">
                    <h3 className="font-bold break-words pr-2">{exp.position}</h3>
                    <span className="text-sm italic whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="font-medium mb-2 break-words" style={{ color: 'var(--primary-color)' }}>{exp.company}</div>
                <p className={`text-sm text-slate-600 ${SAFE_TEXT}`}>{exp.description}</p>
            </div>
        ))}
    </div>

    <div className="grid grid-cols-2 gap-8">
        <div className="min-w-0">
            <SectionTitleClassic title="Education" />
             {data.education.map(edu => (
                <div key={edu.id} className="mb-4">
                    <h3 className="font-bold break-words">{edu.institution}</h3>
                    <p className="text-sm break-words">{edu.degree} in {edu.field}</p>
                    <p className="text-xs text-slate-500 italic">{edu.startDate} - {edu.endDate}</p>
                </div>
            ))}
        </div>
        <div className="min-w-0">
            <SectionTitleClassic title="Skills" />
            <ul className="list-disc list-inside text-sm grid grid-cols-2 gap-x-2">
                {data.skills.map((skill, i) => (
                    <li key={i} className="mb-1 break-words">{skill}</li>
                ))}
            </ul>
        </div>
    </div>
  </div>
);

const MinimalistTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} text-slate-800 p-10`}>
        <header className="mb-10 flex justify-between items-start gap-8">
            <div className="flex-1 min-w-0">
                <h1 className="text-5xl font-light tracking-tight mb-2 break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                <p className="text-xl text-slate-400 font-light mb-6 break-words">{data.personalInfo.jobTitle}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <ContactItem icon={<Mail size={14} className="shrink-0" />} text={data.personalInfo.email} className={SAFE_LINK} />
                    <ContactItem icon={<Phone size={14} className="shrink-0" />} text={data.personalInfo.phone} />
                    <ContactItem icon={<MapPin size={14} className="shrink-0" />} text={data.personalInfo.address} className="break-words" />
                </div>
            </div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 object-cover grayscale shrink-0" style={{ borderRadius: 'var(--border-radius)' }} />
        </header>

        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 min-w-0">
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>Work Experience</h2>
                     <div className="space-y-8 pl-6 ml-1" style={{ borderLeftColor: 'var(--primary-color)', borderLeftWidth: '1px', borderLeftStyle: 'solid' }}>
                        {data.experience.map(exp => (
                            <div key={exp.id} className="relative">
                                <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                                <h3 className="font-bold text-slate-800 break-words">{exp.position}</h3>
                                <div className="flex justify-between items-center text-sm mb-2 flex-wrap gap-2">
                                    <span className="font-semibold opacity-70 break-words" style={{ color: 'var(--primary-color)' }}>{exp.company}</span>
                                    <span className="text-slate-400 whitespace-nowrap">{exp.startDate} — {exp.endDate}</span>
                                </div>
                                <p className={`text-sm text-slate-600 leading-relaxed ${SAFE_TEXT}`}>{exp.description}</p>
                            </div>
                        ))}
                     </div>
                </section>
            </div>

            <div className="col-span-4 space-y-8 min-w-0">
                 <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>Summary</h2>
                    <p className={`text-sm text-slate-600 leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                </section>

                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>Education</h2>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-4">
                            <h3 className="font-bold text-sm break-words">{edu.degree}</h3>
                            <p className="text-xs opacity-70 mb-1 break-words" style={{ color: 'var(--primary-color)' }}>{edu.institution}</p>
                            <p className="text-xs text-slate-400">{edu.startDate} - {edu.endDate}</p>
                        </div>
                    ))}
                </section>

                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-100 text-xs font-medium text-slate-600 rounded break-words max-w-full">{skill}</span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
);

const ExecutiveTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} text-slate-900 p-12`}>
        <header className="border-b-4 border-slate-900 pb-6 mb-10 flex justify-between items-center gap-6">
            <div className="flex items-center gap-6 flex-1 min-w-0">
                 <ProfilePhoto url={data.personalInfo.photoUrl} className="w-20 h-20 object-cover shadow-sm border border-slate-300 shrink-0" style={{ borderRadius: 'var(--border-radius)' }} />
                 <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-black uppercase tracking-wider mb-2 break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-slate-600 tracking-wide break-words">{data.personalInfo.jobTitle}</p>
                 </div>
            </div>
            <div className="text-right text-sm space-y-1 text-slate-600 shrink-0 max-w-[30%] min-w-0">
                <div className={`flex items-center justify-end gap-2 ${SAFE_LINK}`}><Mail size={12} className="shrink-0"/> <span className="truncate">{data.personalInfo.email}</span></div>
                <div className="flex items-center justify-end gap-2"><Phone size={12} className="shrink-0"/> {data.personalInfo.phone}</div>
                <div className="flex items-center justify-end gap-2 text-right"><MapPin size={12} className="shrink-0"/> <span className="break-words">{data.personalInfo.address}</span></div>
            </div>
        </header>

        <section className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1" style={{ color: 'var(--primary-color)' }}>Professional Profile</h2>
            <p className={`text-slate-700 leading-relaxed text-justify ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
        </section>

        <section className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-6 pb-1" style={{ color: 'var(--primary-color)' }}>Professional Experience</h2>
            <div className="space-y-8">
                {data.experience.map(exp => (
                    <div key={exp.id}>
                        <div className="flex justify-between items-center mb-1 flex-wrap gap-2">
                            <h3 className="font-bold text-lg break-words">{exp.company}</h3>
                            <span className="text-sm font-medium bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div className="text-slate-600 italic mb-3 font-medium break-words">{exp.position}</div>
                        <p className={`text-sm text-slate-700 leading-relaxed ${SAFE_TEXT}`}>{exp.description}</p>
                    </div>
                ))}
            </div>
        </section>

        <div className="grid grid-cols-2 gap-12">
            <section className="min-w-0">
                 <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1" style={{ color: 'var(--primary-color)' }}>Education</h2>
                 {data.education.map(edu => (
                    <div key={edu.id} className="mb-4">
                        <div className="font-bold break-words">{edu.institution}</div>
                        <div className="text-sm text-slate-600 break-words">{edu.degree} - {edu.field}</div>
                        <div className="text-xs text-slate-400 mt-1">{edu.startDate} - {edu.endDate}</div>
                    </div>
                ))}
            </section>
            <section className="min-w-0">
                 <h2 className="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1" style={{ color: 'var(--primary-color)' }}>Expertise</h2>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {data.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 break-words">
                             <div className="w-1.5 h-1.5 rotate-45 shrink-0" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                             {skill}
                        </div>
                    ))}
                 </div>
            </section>
        </div>
    </div>
);

const CreativeTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} text-slate-800 flex flex-col`}>
        <header className="p-10 text-white relative overflow-hidden flex items-center gap-8 shrink-0" style={{ backgroundColor: 'var(--primary-color)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 border-4 border-white/30 z-10 shadow-lg shrink-0" style={{ borderRadius: 'var(--border-radius)' }} />
            <div className="relative z-10 flex-1 min-w-0">
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight break-words">{data.personalInfo.fullName}</h1>
                <p className="text-xl font-medium opacity-90 mb-6 break-words">{data.personalInfo.jobTitle}</p>
                <div className="flex flex-wrap gap-6 text-sm font-medium opacity-80">
                    <span className={`flex items-center gap-2 ${SAFE_LINK}`}><Mail size={16} className="shrink-0"/> {data.personalInfo.email}</span>
                    <span className="flex items-center gap-2"><Phone size={16} className="shrink-0"/> {data.personalInfo.phone}</span>
                </div>
            </div>
        </header>

        <div className="flex-1 flex">
            <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-100 shrink-0 min-w-0">
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-1 block" style={{ backgroundColor: 'var(--primary-color)' }}></span> Contact
                    </h3>
                    <div className="space-y-3 text-sm text-slate-600">
                         <div className="flex gap-3"><MapPin size={18} className="shrink-0" style={{ color: 'var(--primary-color)' }}/> <span className="break-words">{data.personalInfo.address}</span></div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <span className="w-8 h-1 block" style={{ backgroundColor: 'var(--primary-color)' }}></span> Education
                    </h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-6 last:mb-0">
                            <div className="font-bold text-slate-800 break-words">{edu.degree}</div>
                            <div className="text-sm font-medium break-words" style={{ color: 'var(--primary-color)' }}>{edu.institution}</div>
                            <div className="text-xs text-slate-400 mt-1">{edu.startDate} - {edu.endDate}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <span className="w-8 h-1 block" style={{ backgroundColor: 'var(--primary-color)' }}></span> Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="bg-white border px-3 py-1 text-xs font-bold shadow-sm break-words" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)', borderRadius: 'calc(var(--border-radius) / 2)' }}>{skill}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-2/3 p-10 flex flex-col min-w-0">
                <div className="mb-10">
                     <h3 className="text-2xl font-bold text-slate-900 mb-6">About Me</h3>
                     <p className={`text-slate-600 leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                </div>

                <div className="flex-1">
                     <h3 className="text-2xl font-bold text-slate-900 mb-8">Work Experience</h3>
                     <div className="space-y-8">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="relative pl-8 border-l-2 border-slate-100">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 rounded-full" style={{ borderColor: 'var(--primary-color)' }}></div>
                                <div className="mb-2">
                                    <h4 className="font-bold text-lg text-slate-800 break-words">{exp.position}</h4>
                                    <div className="flex justify-between items-center text-sm flex-wrap gap-2">
                                        <span className="font-bold break-words" style={{ color: 'var(--primary-color)' }}>{exp.company}</span>
                                        <span className="text-slate-400 font-medium whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                </div>
                                <p className={`text-slate-600 text-sm ${SAFE_TEXT}`}>{exp.description}</p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    </div>
);

const TechTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-slate-900 text-slate-300 p-8 font-mono`}>
        <div className="border border-slate-700 h-full p-8 relative flex flex-col">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: 'var(--primary-color)' }}></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: 'var(--primary-color)' }}></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: 'var(--primary-color)' }}></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: 'var(--primary-color)' }}></div>

            <header className="mb-10 border-b border-slate-800 pb-8 flex items-center justify-between gap-6 shrink-0">
                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold mb-2 break-words" style={{ color: 'var(--primary-color)' }}>
                        <span className="text-slate-600 mr-2">&lt;</span>
                        {data.personalInfo.fullName}
                        <span className="text-slate-600 ml-2">/&gt;</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-6 pl-6 border-l-2 border-slate-800 break-words">{data.personalInfo.jobTitle}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-sans">
                        <div className={`flex items-center gap-2 ${SAFE_LINK}`}><Mail size={14} className="shrink-0" style={{ color: 'var(--primary-color)' }}/> {data.personalInfo.email}</div>
                        <div className="flex items-center gap-2"><Phone size={14} className="shrink-0" style={{ color: 'var(--primary-color)' }}/> {data.personalInfo.phone}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="shrink-0" style={{ color: 'var(--primary-color)' }}/> {data.personalInfo.address}</div>
                    </div>
                </div>
                <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 border shrink-0" style={{ borderColor: 'var(--primary-color)', borderRadius: 'var(--border-radius)' }} />
            </header>

            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 space-y-8 min-w-0">
                    <section>
                        <h2 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                            <span className="text-slate-600">01.</span> Profile
                        </h2>
                        <p className={`text-slate-400 text-sm leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                            <span className="text-slate-600">02.</span> Experience
                        </h2>
                        <div className="space-y-8">
                            {data.experience.map((exp, idx) => (
                                <div key={exp.id} className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 text-xs text-slate-600">0{idx+1}</div>
                                    <h3 className="text-slate-200 font-bold break-words">{exp.position}</h3>
                                    <div className="flex gap-4 text-xs mb-2 flex-wrap">
                                        <span className="break-words" style={{ color: 'var(--primary-color)' }}>@{exp.company}</span>
                                        <span className="text-slate-500 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className={`text-sm text-slate-400 ${SAFE_TEXT}`}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8 min-w-0">
                    <section>
                        <h2 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                            <span className="text-slate-600">03.</span> Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 text-xs rounded border border-slate-700 break-words" style={{ color: 'var(--primary-color)' }}>{skill}</span>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                            <span className="text-slate-600">04.</span> Education
                        </h2>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="bg-slate-800/50 p-3 rounded border border-slate-800">
                                    <div className="font-bold text-sm text-slate-300 break-words">{edu.degree}</div>
                                    <div className="text-xs text-slate-500 mb-1 break-words">{edu.institution}</div>
                                    <div className="text-[10px] text-slate-600">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
);

const CompactTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-white text-slate-900 p-8`}>
        <header className="flex items-center gap-6 border-b-2 pb-4 mb-4" style={{ borderColor: 'var(--primary-color)' }}>
             <ProfilePhoto url={data.personalInfo.photoUrl} className="w-20 h-20 object-cover shrink-0" style={{ borderRadius: 'var(--border-radius)' }} />
             <div className="flex-1 min-w-0">
                 <h1 className="text-3xl font-bold uppercase break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                 <p className="text-lg font-medium text-slate-600 break-words">{data.personalInfo.jobTitle}</p>
             </div>
             <div className="text-xs text-right text-slate-500 space-y-1 max-w-[200px] min-w-0">
                 <div className={SAFE_LINK}>{data.personalInfo.email}</div>
                 <div>{data.personalInfo.phone}</div>
                 <div className="break-words">{data.personalInfo.address}</div>
             </div>
        </header>
        
        <div className="grid grid-cols-4 gap-4">
             <div className="col-span-3 min-w-0">
                 <div className="mb-4">
                     <h2 className="text-sm font-bold px-2 py-1 mb-2 uppercase" style={{ color: 'var(--primary-color)', backgroundColor: '#f1f5f9' }}>Profil</h2>
                     <p className={`text-xs text-justify leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                 </div>
                 
                 <div>
                     <h2 className="text-sm font-bold px-2 py-1 mb-2 uppercase" style={{ color: 'var(--primary-color)', backgroundColor: '#f1f5f9' }}>Expérience</h2>
                     {data.experience.map(exp => (
                         <div key={exp.id} className="mb-3">
                             <div className="flex justify-between font-bold text-sm flex-wrap gap-2">
                                 <span className="break-words pr-2 max-w-[70%]">{exp.position}</span>
                                 <span className="whitespace-nowrap" style={{ color: 'var(--primary-color)' }}>{exp.startDate} - {exp.endDate}</span>
                             </div>
                             <div className="text-xs font-semibold text-slate-500 mb-1 break-words">{exp.company}</div>
                             <p className={`text-xs text-slate-700 leading-snug ${SAFE_TEXT}`}>{exp.description}</p>
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="col-span-1 bg-slate-50 p-2 rounded h-fit min-w-0">
                 <div className="mb-4">
                     <h2 className="text-xs font-bold border-b border-blue-200 mb-2 pb-1 uppercase" style={{ color: 'var(--primary-color)' }}>Compétences</h2>
                     <div className="flex flex-wrap gap-1">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="text-xs bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-700 break-words w-full text-center">{skill}</span>
                         ))}
                     </div>
                 </div>
                 
                 <div>
                     <h2 className="text-xs font-bold border-b border-blue-200 mb-2 pb-1 uppercase" style={{ color: 'var(--primary-color)' }}>Formation</h2>
                     {data.education.map(edu => (
                         <div key={edu.id} className="mb-2">
                             <div className="font-bold text-xs break-words">{edu.degree}</div>
                             <div className="text-[10px] text-slate-500 break-words">{edu.institution}</div>
                             <div className="text-[10px] text-slate-400 italic">{edu.startDate} - {edu.endDate}</div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    </div>
);

const TimelineTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-white text-slate-800 flex flex-col`}>
        <header className="p-8 flex items-center justify-between gap-6 shrink-0" style={{ backgroundColor: '#1e293b' }}>
            <div className="flex-1 min-w-0">
                 <h1 className="text-3xl font-bold text-white break-words">{data.personalInfo.fullName}</h1>
                 <p className="font-medium break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.jobTitle}</p>
            </div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-16 h-16 border-2 shrink-0" style={{ borderColor: 'var(--primary-color)', borderRadius: 'var(--border-radius)' }} />
        </header>
        
        <div className="flex-1 grid grid-cols-12">
            <div className="col-span-4 bg-slate-100 p-6 border-r border-slate-200 text-sm shrink-0 min-w-0">
                <div className="mb-6">
                    <h3 className="font-bold text-slate-700 uppercase mb-2">Contact</h3>
                    <div className="space-y-1 text-slate-600 text-xs">
                        <div className={`flex items-center gap-2 ${SAFE_LINK}`}><Mail size={12} className="shrink-0"/> {data.personalInfo.email}</div>
                        <div className="flex items-center gap-2"><Phone size={12} className="shrink-0"/> {data.personalInfo.phone}</div>
                        <div className="flex items-center gap-2"><MapPin size={12} className="shrink-0"/> <span className="break-words">{data.personalInfo.address}</span></div>
                    </div>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-bold text-slate-700 uppercase mb-2">Compétences</h3>
                    <div className="flex flex-wrap gap-1">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="bg-white border border-slate-300 px-2 py-1 rounded text-xs break-words">{skill}</span>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h3 className="font-bold text-slate-700 uppercase mb-2">Éducation</h3>
                    {data.education.map(edu => (
                         <div key={edu.id} className="mb-3">
                             <div className="font-bold text-xs break-words">{edu.degree}</div>
                             <div className="text-xs break-words" style={{ color: 'var(--primary-color)' }}>{edu.institution}</div>
                             <div className="text-[10px] text-slate-400">{edu.startDate} - {edu.endDate}</div>
                         </div>
                     ))}
                </div>
            </div>
            
            <div className="col-span-8 p-8 flex flex-col min-w-0">
                 <div className="mb-8">
                     <h2 className="text-xl font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">Profil Professionnel</h2>
                     <p className={`text-sm text-slate-600 leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                 </div>
                 
                 <div className="flex-1">
                     <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">Expérience</h2>
                     <div className="space-y-0 relative border-l-2 ml-3" style={{ borderColor: 'var(--primary-color)', opacity: 0.5 }}>
                         {data.experience.map(exp => (
                             <div key={exp.id} className="relative pl-8 pb-8 last:pb-0">
                                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                                 <h3 className="font-bold text-lg text-slate-800 break-words">{exp.position}</h3>
                                 <div className="text-sm font-medium mb-1 break-words" style={{ color: 'var(--primary-color)' }}>{exp.company} | {exp.startDate} - {exp.endDate}</div>
                                 <p className={`text-sm text-slate-600 ${SAFE_TEXT}`}>{exp.description}</p>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    </div>
);

const LeftBorderTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-white text-slate-800 p-10 relative`}>
        <div className="absolute top-0 left-0 bottom-0 w-16" style={{ backgroundColor: '#1e293b' }}></div>
        
        <div className="ml-12 h-full flex flex-col">
            <header className="flex gap-8 mb-10 items-end border-b border-slate-300 pb-8 shrink-0">
                <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 shadow-lg shrink-0" style={{ borderRadius: 'var(--border-radius)' }} />
                <div className="flex-1 min-w-0">
                    <h1 className="text-5xl font-bold text-slate-800 break-words">{data.personalInfo.fullName}</h1>
                    <p className="text-xl italic mt-2 break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.jobTitle}</p>
                </div>
            </header>
            
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-1 space-y-8 min-w-0">
                    <section>
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Contact</h3>
                        <div className="text-sm space-y-2">
                             <div className={SAFE_LINK}>{data.personalInfo.email}</div>
                             <div>{data.personalInfo.phone}</div>
                             <div className="break-words">{data.personalInfo.address}</div>
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Education</h3>
                        {data.education.map(edu => (
                            <div key={edu.id} className="mb-4">
                                <div className="font-bold text-sm break-words">{edu.degree}</div>
                                <div className="text-xs italic text-slate-500 break-words">{edu.institution}</div>
                                <div className="text-xs text-slate-400">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </section>
                    
                    <section>
                         <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Skills</h3>
                         <ul className="text-sm space-y-1 list-disc list-inside">
                             {data.skills.map((skill, i) => (
                                 <li key={i} className="break-words">{skill}</li>
                             ))}
                         </ul>
                    </section>
                </div>
                
                <div className="col-span-2 flex flex-col min-w-0">
                    <section className="mb-8">
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Profile</h3>
                        <p className={`text-sm leading-relaxed text-justify ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                    </section>
                    
                    <section className="flex-1">
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-6">Experience</h3>
                        <div className="space-y-6">
                            {data.experience.map(exp => (
                                <div key={exp.id}>
                                    <h4 className="font-bold text-lg break-words">{exp.position}</h4>
                                    <div className="flex justify-between text-sm text-slate-500 italic mb-2 border-b border-slate-100 pb-1 flex-wrap gap-2">
                                        <span className="break-words">{exp.company}</span>
                                        <span className="whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${SAFE_TEXT}`}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
);

const GlitchTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-black font-mono p-10 relative`} style={{ color: 'var(--primary-color)' }}>
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <header className="relative z-10 border-b-2 pb-6 mb-8 flex gap-6 items-center shrink-0" style={{ borderColor: 'var(--primary-color)' }}>
             <div className="relative shrink-0">
                 <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 border-2 filter sepia brightness-50 contrast-125" style={{ borderColor: 'var(--primary-color)', borderRadius: 'var(--border-radius)' }} />
             </div>
             <div className="flex-1 min-w-0">
                 <h1 className="text-4xl font-bold uppercase tracking-tighter mb-1 break-words">
                     {data.personalInfo.fullName}
                 </h1>
                 <p className="text-xl uppercase tracking-widest break-words opacity-80">{data.personalInfo.jobTitle}</p>
             </div>
        </header>

        <div className="relative z-10 grid grid-cols-12 gap-8 flex-1">
            <div className="col-span-8 flex flex-col min-w-0">
                 <section className="mb-8 border p-4 bg-white/5" style={{ borderColor: 'var(--primary-color)' }}>
                     <h2 className="font-bold uppercase mb-2 border-b pb-1 flex items-center gap-2" style={{ borderColor: 'var(--primary-color)' }}>
                         <span className="animate-pulse">_</span> SYSTEM.LOG(PROFILE)
                     </h2>
                     <p className={`text-sm opacity-90 ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                 </section>

                 <section className="flex-1">
                     <h2 className="font-bold uppercase mb-4 border-b pb-1" style={{ borderColor: 'var(--primary-color)' }}>
                         RUN_PROCESS(EXPERIENCE)
                     </h2>
                     <div className="space-y-6">
                         {data.experience.map((exp, i) => (
                             <div key={exp.id} className="relative pl-4 border-l" style={{ borderColor: 'var(--primary-color)' }}>
                                 <div className="text-lg font-bold break-words opacity-90">{exp.position}</div>
                                 <div className="text-xs mb-2 flex justify-between flex-wrap gap-2 opacity-70">
                                     <span className="break-words">@{exp.company}</span>
                                     <span>[{exp.startDate} :: {exp.endDate}]</span>
                                 </div>
                                 <p className={`text-sm opacity-80 ${SAFE_TEXT}`}>{exp.description}</p>
                             </div>
                         ))}
                     </div>
                 </section>
            </div>

            <div className="col-span-4 space-y-6 min-w-0">
                 <section className="border p-4" style={{ borderColor: 'var(--primary-color)' }}>
                     <h2 className="text-xs font-bold uppercase mb-2 opacity-70">NETWORK.DATA</h2>
                     <ul className="text-xs space-y-2 opacity-90">
                         <li className={SAFE_LINK}>{data.personalInfo.email}</li>
                         <li>{data.personalInfo.phone}</li>
                         <li className="break-words">{data.personalInfo.address}</li>
                     </ul>
                 </section>

                 <section>
                     <h2 className="text-xs font-bold uppercase mb-2 opacity-70">MODULES(SKILLS)</h2>
                     <div className="flex flex-wrap gap-2">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="text-xs border px-2 py-0.5 break-words" style={{ borderColor: 'var(--primary-color)' }}>{skill}</span>
                         ))}
                     </div>
                 </section>

                 <section>
                     <h2 className="text-xs font-bold uppercase mb-2 opacity-70">KERNEL(EDU)</h2>
                     {data.education.map(edu => (
                         <div key={edu.id} className="mb-4 text-xs">
                             <div className="font-bold break-words">{edu.degree}</div>
                             <div className="opacity-80 break-words">{edu.institution}</div>
                             <div className="opacity-60">{edu.startDate} - {edu.endDate}</div>
                         </div>
                     ))}
                 </section>
            </div>
        </div>
    </div>
);

const SwissTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-[#f0f0f0] text-black font-sans p-0 relative`}>
        {/* Header Bar */}
        <div className="h-4 w-full absolute top-0 left-0" style={{ backgroundColor: 'var(--primary-color)' }}></div>
        
        <div className="p-16 pt-20 h-full flex flex-col">
            <div className="shrink-0">
                <h1 className="text-7xl font-bold leading-none tracking-tighter mb-4 break-words">{data.personalInfo.fullName}</h1>
                <p className="text-2xl font-medium mb-12 border-b-4 border-black pb-8 break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.jobTitle}</p>
            </div>

            <div className="grid grid-cols-12 gap-12 flex-1">
                <div className="col-span-4 space-y-12 min-w-0">
                     <div>
                        <h3 className="text-xl font-bold mb-4 uppercase">Contact</h3>
                        <div className="text-sm font-medium space-y-1">
                            <div className={SAFE_LINK}>{data.personalInfo.email}</div>
                            <div>{data.personalInfo.phone}</div>
                            <div className="break-words">{data.personalInfo.address}</div>
                        </div>
                     </div>

                     <div>
                        <h3 className="text-xl font-bold mb-4 uppercase">Education</h3>
                        <div className="space-y-6">
                            {data.education.map(edu => (
                                <div key={edu.id}>
                                    <div className="font-bold text-sm leading-tight break-words">{edu.degree}</div>
                                    <div className="text-sm break-words">{edu.institution}</div>
                                    <div className="text-xs mt-1 opacity-60">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-xl font-bold mb-4 uppercase">Skills</h3>
                        <ul className="text-sm font-medium space-y-2">
                            {data.skills.map((skill, i) => (
                                <li key={i} className="border-b border-black pb-1 break-words">{skill}</li>
                            ))}
                        </ul>
                     </div>
                </div>

                <div className="col-span-8 flex flex-col min-w-0">
                     <div className="mb-12">
                         <h3 className="text-xl font-bold mb-4 uppercase">Profile</h3>
                         <p className={`text-lg leading-tight font-medium ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                     </div>

                     <div className="flex-1">
                         <h3 className="text-xl font-bold mb-6 uppercase">Experience</h3>
                         <div className="space-y-8">
                             {data.experience.map(exp => (
                                 <div key={exp.id}>
                                     <div className="flex justify-between items-baseline mb-2 border-b border-black pb-1 flex-wrap gap-2">
                                         <h4 className="text-xl font-bold break-words">{exp.position}</h4>
                                         <span className="font-bold text-sm whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                     </div>
                                     <div className="font-bold text-sm mb-2 opacity-70 break-words">{exp.company}</div>
                                     <p className={`text-sm font-medium leading-normal ${SAFE_TEXT}`}>{exp.description}</p>
                                 </div>
                             ))}
                         </div>
                     </div>
                </div>
            </div>
        </div>
        
        {/* Photo Absolute */}
        {data.personalInfo.photoUrl && (
            <div className="absolute top-20 right-16 w-32 h-32 border-4 border-black bg-white" style={{ borderRadius: 'var(--border-radius)' }}>
                <img src={data.personalInfo.photoUrl} alt="" crossOrigin="anonymous" className="w-full h-full object-cover grayscale contrast-125" />
            </div>
        )}
    </div>
);

const DoubleTemplate = ({ data }: { data: ResumeData }) => (
    <div className={`${CONTAINER_BASE} bg-white text-slate-800 p-10`}>
        <header className="flex gap-8 mb-10 border-b-2 pb-8 shrink-0" style={{ borderColor: 'var(--primary-color)' }}>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-28 h-28 object-cover shadow-lg shrink-0" style={{ borderRadius: 'var(--border-radius)' }} />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h1 className="text-4xl font-extrabold uppercase tracking-wide break-words" style={{ color: 'var(--primary-color)' }}>{data.personalInfo.fullName}</h1>
                <p className="text-xl font-semibold text-slate-500 mb-4 break-words">{data.personalInfo.jobTitle}</p>
                <div className="flex gap-6 text-sm font-medium text-slate-600 flex-wrap">
                    <span className={SAFE_LINK}>{data.personalInfo.email}</span>
                    <span>|</span>
                    <span>{data.personalInfo.phone}</span>
                    <span>|</span>
                    <span className="break-words">{data.personalInfo.address}</span>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-2 gap-10 flex-1">
            <div className="space-y-8 min-w-0">
                <section>
                    <div className="text-white px-4 py-2 font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--primary-color)' }}>Profile</div>
                    <p className={`text-sm text-justify leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                </section>

                <section>
                    <div className="text-white px-4 py-2 font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--primary-color)' }}>Education</div>
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id} className="border-l-4 pl-4" style={{ borderColor: 'var(--primary-color)', opacity: 0.8 }}>
                                <div className="font-bold break-words" style={{ color: 'var(--primary-color)' }}>{edu.degree}</div>
                                <div className="font-semibold text-sm break-words">{edu.institution}</div>
                                <div className="text-xs text-slate-500 mt-1">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="text-white px-4 py-2 font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--primary-color)' }}>Skills</div>
                    <div className="grid grid-cols-2 gap-2">
                        {data.skills.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm font-medium">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                                <span className="break-words">{skill}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="space-y-8 min-w-0">
                 <section>
                    <div className="text-white px-4 py-2 font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--primary-color)' }}>Experience</div>
                    <div className="space-y-6">
                        {data.experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                                    <h3 className="font-bold text-lg break-words" style={{ color: 'var(--primary-color)' }}>{exp.position}</h3>
                                    <span className="text-xs font-bold bg-indigo-50 px-2 py-1 rounded whitespace-nowrap" style={{ color: 'var(--primary-color)' }}>{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="text-sm font-bold text-slate-500 mb-2 break-words">{exp.company}</div>
                                <p className={`text-sm leading-relaxed text-slate-700 ${SAFE_TEXT}`}>{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
);

// Helpers
const ContactItem = ({ icon, text, light, className = "" }: { icon: React.ReactNode, text: string, light?: boolean, className?: string }) => (
    <div className={`flex items-center gap-2 ${light ? 'text-slate-300' : 'text-slate-500'} ${className}`}>
        {icon}
        <span className={className}>{text}</span>
    </div>
);

const SectionTitleClassic = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold uppercase border-b border-slate-300 mb-4 pb-1" style={{ color: 'var(--primary-color)' }}>{title}</h2>
);

export default ResumePreview;
