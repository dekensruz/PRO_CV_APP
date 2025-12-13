
import React, { forwardRef } from 'react';
import { ResumeData, TemplateType } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, User } from 'lucide-react';

interface Props {
  data: ResumeData;
  template: TemplateType;
}

const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data, template }, ref) => {
  switch (template) {
    case 'modern': return <ModernTemplate data={data} ref={ref} />;
    case 'classic': return <ClassicTemplate data={data} ref={ref} />;
    case 'minimalist': return <MinimalistTemplate data={data} ref={ref} />;
    case 'executive': return <ExecutiveTemplate data={data} ref={ref} />;
    case 'creative': return <CreativeTemplate data={data} ref={ref} />;
    case 'tech': return <TechTemplate data={data} ref={ref} />;
    case 'compact': return <CompactTemplate data={data} ref={ref} />;
    case 'timeline': return <TimelineTemplate data={data} ref={ref} />;
    case 'leftborder': return <LeftBorderTemplate data={data} ref={ref} />;
    case 'glitch': return <GlitchTemplate data={data} ref={ref} />;
    case 'swiss': return <SwissTemplate data={data} ref={ref} />;
    case 'double': return <DoubleTemplate data={data} ref={ref} />;
    default: return <ModernTemplate data={data} ref={ref} />;
  }
});

// Helper for photo
// CRITICAL: Added crossOrigin="anonymous" to prevent 'Tainted Canvas' errors during PDF export
const ProfilePhoto = ({ url, className = "" }: { url?: string, className?: string }) => {
    if (!url) return null;
    return (
        <div className={`overflow-hidden shrink-0 ${className}`}>
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
const CONTAINER_BASE = "w-[210mm] min-h-[297mm] bg-white overflow-hidden text-sm"; // Added text-sm base to prevent scaling issues

// --- Templates ---

const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} className={`${CONTAINER_BASE} text-slate-800 shadow-sm flex font-sans`}>
    {/* Left Column */}
    <div className="w-1/3 bg-slate-900 text-white p-6 flex flex-col shrink-0 min-w-0">
        <div className="mb-8 text-center">
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-700" />
            <h1 className="text-xl font-bold leading-tight mb-2 break-words">{data.personalInfo.fullName}</h1>
            <p className="text-primary-400 font-medium uppercase tracking-widest text-xs break-words">{data.personalInfo.jobTitle}</p>
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
                    <span key={i} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 break-words max-w-full">{skill}</span>
                ))}
            </div>
        </div>
    </div>

    {/* Right Column */}
    <div className="w-2/3 p-8 flex flex-col min-w-0">
        <div className="mb-8">
            <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b-2 border-primary-500 w-16 pb-1 mb-4">Profile</h3>
            <p className={`text-slate-600 text-sm leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
        </div>

        <div className="flex-1">
             <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b-2 border-primary-500 w-16 pb-1 mb-6">Experience</h3>
             <div className="space-y-6">
                {data.experience.map(exp => (
                    <div key={exp.id} className="w-full">
                        <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                            <h4 className="font-bold text-slate-900 break-words max-w-[70%]">{exp.position}</h4>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="text-primary-600 font-medium text-sm mb-2 break-words">{exp.company}</p>
                        <p className={`text-sm text-slate-600 ${SAFE_TEXT}`}>{exp.description}</p>
                    </div>
                ))}
             </div>
        </div>
    </div>
  </div>
));

const ClassicTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} className={`${CONTAINER_BASE} text-slate-900 p-12 font-serif`}>
    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex items-center justify-between gap-6">
         <div className="flex-1 min-w-0">
             <h1 className="text-4xl font-bold mb-2 break-words">{data.personalInfo.fullName}</h1>
             <p className="text-lg text-slate-600 italic mb-4 break-words">{data.personalInfo.jobTitle}</p>
             <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className={SAFE_LINK}>{data.personalInfo.email}</span>
                <span>•</span>
                <span>{data.personalInfo.phone}</span>
                <span>•</span>
                <span className="break-words">{data.personalInfo.address}</span>
             </div>
         </div>
         <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 object-cover border border-slate-200 shadow-sm shrink-0" />
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
                <div className="text-slate-700 font-medium mb-2 break-words">{exp.company}</div>
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
));

const MinimalistTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} text-slate-800 p-10 font-sans`}>
        <header className="mb-10 flex justify-between items-start gap-8">
            <div className="flex-1 min-w-0">
                <h1 className="text-5xl font-light tracking-tight mb-2 text-indigo-600 break-words">{data.personalInfo.fullName}</h1>
                <p className="text-xl text-slate-400 font-light mb-6 break-words">{data.personalInfo.jobTitle}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <ContactItem icon={<Mail size={14} className="shrink-0" />} text={data.personalInfo.email} className={SAFE_LINK} />
                    <ContactItem icon={<Phone size={14} className="shrink-0" />} text={data.personalInfo.phone} />
                    <ContactItem icon={<MapPin size={14} className="shrink-0" />} text={data.personalInfo.address} className="break-words" />
                </div>
            </div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 rounded-full object-cover grayscale shrink-0" />
        </header>

        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 min-w-0">
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Work Experience</h2>
                     <div className="space-y-8 border-l border-indigo-100 pl-6 ml-1">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="relative">
                                <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                                <h3 className="font-bold text-slate-800 break-words">{exp.position}</h3>
                                <div className="flex justify-between items-center text-sm mb-2 flex-wrap gap-2">
                                    <span className="font-semibold text-indigo-400 break-words">{exp.company}</span>
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
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Summary</h2>
                    <p className={`text-sm text-slate-600 leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                </section>

                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Education</h2>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-4">
                            <h3 className="font-bold text-sm break-words">{edu.degree}</h3>
                            <p className="text-xs text-indigo-400 mb-1 break-words">{edu.institution}</p>
                            <p className="text-xs text-slate-400">{edu.startDate} - {edu.endDate}</p>
                        </div>
                    ))}
                </section>

                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-100 text-xs font-medium text-slate-600 rounded break-words max-w-full">{skill}</span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
));

const ExecutiveTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} text-slate-900 p-12 font-serif`}>
        <header className="border-b-4 border-slate-900 pb-6 mb-10 flex justify-between items-center gap-6">
            <div className="flex items-center gap-6 flex-1 min-w-0">
                 <ProfilePhoto url={data.personalInfo.photoUrl} className="w-20 h-20 object-cover shadow-sm border border-slate-300 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-black uppercase tracking-wider mb-2 break-words">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-slate-600 tracking-wide break-words">{data.personalInfo.jobTitle}</p>
                 </div>
            </div>
            <div className="text-right text-sm space-y-1 text-slate-600 font-sans shrink-0 max-w-[30%] min-w-0">
                <div className={`flex items-center justify-end gap-2 ${SAFE_LINK}`}><Mail size={12} className="shrink-0"/> <span className="truncate">{data.personalInfo.email}</span></div>
                <div className="flex items-center justify-end gap-2"><Phone size={12} className="shrink-0"/> {data.personalInfo.phone}</div>
                <div className="flex items-center justify-end gap-2 text-right"><MapPin size={12} className="shrink-0"/> <span className="break-words">{data.personalInfo.address}</span></div>
            </div>
        </header>

        <section className="mb-10">
            <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Professional Profile</h2>
            <p className={`text-slate-700 leading-relaxed text-justify ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
        </section>

        <section className="mb-10">
            <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-6 pb-1">Professional Experience</h2>
            <div className="space-y-8">
                {data.experience.map(exp => (
                    <div key={exp.id}>
                        <div className="flex justify-between items-center mb-1 font-sans flex-wrap gap-2">
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
                 <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Education</h2>
                 {data.education.map(edu => (
                    <div key={edu.id} className="mb-4">
                        <div className="font-bold break-words">{edu.institution}</div>
                        <div className="text-sm text-slate-600 break-words">{edu.degree} - {edu.field}</div>
                        <div className="text-xs text-slate-400 font-sans mt-1">{edu.startDate} - {edu.endDate}</div>
                    </div>
                ))}
            </section>
            <section className="min-w-0">
                 <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Expertise</h2>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-sans text-sm">
                    {data.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 break-words">
                             <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 shrink-0"></div>
                             {skill}
                        </div>
                    ))}
                 </div>
            </section>
        </div>
    </div>
));

const CreativeTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} text-slate-800 flex flex-col font-sans`}>
        <header className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-10 text-white relative overflow-hidden flex items-center gap-8 shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 rounded-full border-4 border-white/30 z-10 shadow-lg shrink-0" />
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
                        <span className="w-8 h-1 bg-pink-500 block"></span> Contact
                    </h3>
                    <div className="space-y-3 text-sm text-slate-600">
                         <div className="flex gap-3"><MapPin size={18} className="text-pink-500 shrink-0"/> <span className="break-words">{data.personalInfo.address}</span></div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <span className="w-8 h-1 bg-pink-500 block"></span> Education
                    </h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-6 last:mb-0">
                            <div className="font-bold text-slate-800 break-words">{edu.degree}</div>
                            <div className="text-sm text-pink-500 font-medium break-words">{edu.institution}</div>
                            <div className="text-xs text-slate-400 mt-1">{edu.startDate} - {edu.endDate}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <span className="w-8 h-1 bg-pink-500 block"></span> Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="bg-white border border-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm break-words">{skill}</span>
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
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 border-pink-500 rounded-full"></div>
                                <div className="mb-2">
                                    <h4 className="font-bold text-lg text-slate-800 break-words">{exp.position}</h4>
                                    <div className="flex justify-between items-center text-sm flex-wrap gap-2">
                                        <span className="font-bold text-pink-500 break-words">{exp.company}</span>
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
));

const TechTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} bg-slate-900 text-slate-300 p-8 font-mono`}>
        <div className="border border-slate-700 h-full p-8 relative flex flex-col">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>

            <header className="mb-10 border-b border-slate-800 pb-8 flex items-center justify-between gap-6 shrink-0">
                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl text-emerald-400 font-bold mb-2 break-words">
                        <span className="text-slate-600 mr-2">&lt;</span>
                        {data.personalInfo.fullName}
                        <span className="text-slate-600 ml-2">/&gt;</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-6 pl-6 border-l-2 border-slate-800 break-words">{data.personalInfo.jobTitle}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-sans">
                        <div className={`flex items-center gap-2 ${SAFE_LINK}`}><Mail size={14} className="text-emerald-500 shrink-0"/> {data.personalInfo.email}</div>
                        <div className="flex items-center gap-2"><Phone size={14} className="text-emerald-500 shrink-0"/> {data.personalInfo.phone}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500 shrink-0"/> {data.personalInfo.address}</div>
                    </div>
                </div>
                <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 rounded border border-emerald-500/50 shrink-0" />
            </header>

            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 space-y-8 min-w-0">
                    <section>
                        <h2 className="text-emerald-500 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                            <span className="text-slate-600">01.</span> Profile
                        </h2>
                        <p className={`text-slate-400 text-sm leading-relaxed font-sans ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                    </section>

                    <section>
                        <h2 className="text-emerald-500 text-sm font-bold uppercase mb-6 flex items-center gap-2">
                            <span className="text-slate-600">02.</span> Experience
                        </h2>
                        <div className="space-y-8">
                            {data.experience.map((exp, idx) => (
                                <div key={exp.id} className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 text-xs text-slate-600">0{idx+1}</div>
                                    <h3 className="text-slate-200 font-bold break-words">{exp.position}</h3>
                                    <div className="flex gap-4 text-xs mb-2 flex-wrap">
                                        <span className="text-emerald-400 break-words">@{exp.company}</span>
                                        <span className="text-slate-500 font-sans whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className={`text-sm text-slate-400 font-sans ${SAFE_TEXT}`}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8 min-w-0">
                    <section>
                        <h2 className="text-emerald-500 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                            <span className="text-slate-600">03.</span> Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 text-emerald-300 text-xs rounded border border-slate-700 break-words">{skill}</span>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-emerald-500 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                            <span className="text-slate-600">04.</span> Education
                        </h2>
                        <div className="space-y-4">
                            {data.education.map(edu => (
                                <div key={edu.id} className="bg-slate-800/50 p-3 rounded border border-slate-800">
                                    <div className="font-bold text-sm text-slate-300 break-words">{edu.degree}</div>
                                    <div className="text-xs text-slate-500 mb-1 break-words">{edu.institution}</div>
                                    <div className="text-[10px] text-slate-600 font-sans">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
));

const CompactTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} bg-white text-slate-900 p-8 font-sans`}>
        <header className="flex items-center gap-6 border-b-2 border-blue-900 pb-4 mb-4">
             <ProfilePhoto url={data.personalInfo.photoUrl} className="w-20 h-20 rounded-lg object-cover shrink-0" />
             <div className="flex-1 min-w-0">
                 <h1 className="text-3xl font-bold text-blue-900 uppercase break-words">{data.personalInfo.fullName}</h1>
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
                     <h2 className="text-sm font-bold bg-blue-100 text-blue-900 px-2 py-1 mb-2 uppercase">Profil</h2>
                     <p className={`text-xs text-justify leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                 </div>
                 
                 <div>
                     <h2 className="text-sm font-bold bg-blue-100 text-blue-900 px-2 py-1 mb-2 uppercase">Expérience</h2>
                     {data.experience.map(exp => (
                         <div key={exp.id} className="mb-3">
                             <div className="flex justify-between font-bold text-sm flex-wrap gap-2">
                                 <span className="break-words pr-2 max-w-[70%]">{exp.position}</span>
                                 <span className="text-blue-600 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                             </div>
                             <div className="text-xs font-semibold text-slate-500 mb-1 break-words">{exp.company}</div>
                             <p className={`text-xs text-slate-700 leading-snug ${SAFE_TEXT}`}>{exp.description}</p>
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="col-span-1 bg-slate-50 p-2 rounded h-fit min-w-0">
                 <div className="mb-4">
                     <h2 className="text-xs font-bold text-blue-900 border-b border-blue-200 mb-2 pb-1 uppercase">Compétences</h2>
                     <div className="flex flex-wrap gap-1">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="text-xs bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-700 break-words w-full text-center">{skill}</span>
                         ))}
                     </div>
                 </div>
                 
                 <div>
                     <h2 className="text-xs font-bold text-blue-900 border-b border-blue-200 mb-2 pb-1 uppercase">Formation</h2>
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
));

const TimelineTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} bg-white text-slate-800 font-sans flex flex-col`}>
        <header className="bg-slate-800 text-white p-8 flex items-center justify-between gap-6 shrink-0">
            <div className="flex-1 min-w-0">
                 <h1 className="text-3xl font-bold break-words">{data.personalInfo.fullName}</h1>
                 <p className="text-blue-300 font-medium break-words">{data.personalInfo.jobTitle}</p>
            </div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-16 h-16 rounded-full border-2 border-blue-400 shrink-0" />
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
                             <div className="text-xs text-blue-600 break-words">{edu.institution}</div>
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
                     <div className="space-y-0 relative border-l-2 border-blue-200 ml-3">
                         {data.experience.map(exp => (
                             <div key={exp.id} className="relative pl-8 pb-8 last:pb-0">
                                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>
                                 <h3 className="font-bold text-lg text-slate-800 break-words">{exp.position}</h3>
                                 <div className="text-sm font-medium text-blue-600 mb-1 break-words">{exp.company} | {exp.startDate} - {exp.endDate}</div>
                                 <p className={`text-sm text-slate-600 ${SAFE_TEXT}`}>{exp.description}</p>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    </div>
));

const LeftBorderTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} bg-white text-slate-800 font-serif p-10 relative`}>
        <div className="absolute top-0 left-0 bottom-0 w-16 bg-slate-800"></div>
        
        <div className="ml-12 h-full flex flex-col">
            <header className="flex gap-8 mb-10 items-end border-b border-slate-300 pb-8 shrink-0">
                <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 shadow-lg shrink-0" />
                <div className="flex-1 min-w-0">
                    <h1 className="text-5xl font-bold text-slate-800 break-words">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-slate-500 italic mt-2 break-words">{data.personalInfo.jobTitle}</p>
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
));

const GlitchTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} bg-black text-green-500 font-mono p-10 relative`}>
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#00ff00 1px, transparent 1px), linear-gradient(90deg, #00ff00 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <header className="relative z-10 border-b-2 border-green-500 pb-6 mb-8 flex gap-6 items-center shrink-0">
             <div className="relative shrink-0">
                 <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 border-2 border-green-500 filter sepia brightness-50 contrast-125" />
                 <div className="absolute inset-0 bg-green-500/20 mix-blend-overlay pointer-events-none"></div>
             </div>
             <div className="flex-1 min-w-0">
                 <h1 className="text-4xl font-bold uppercase tracking-tighter mb-1 text-green-400 break-words" style={{ textShadow: '2px 2px 0px rgba(255,0,0,0.5), -2px -2px 0px rgba(0,0,255,0.5)' }}>
                     {data.personalInfo.fullName}
                 </h1>
                 <p className="text-xl text-green-700 uppercase tracking-widest break-words">{data.personalInfo.jobTitle}</p>
             </div>
        </header>

        <div className="relative z-10 grid grid-cols-12 gap-8 flex-1">
            <div className="col-span-8 flex flex-col min-w-0">
                 <section className="mb-8 border border-green-900 p-4 bg-green-900/10">
                     <h2 className="text-green-400 font-bold uppercase mb-2 border-b border-green-800 pb-1 flex items-center gap-2">
                         <span className="animate-pulse">_</span> SYSTEM.LOG(PROFILE)
                     </h2>
                     <p className={`text-sm text-green-600 ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                 </section>

                 <section className="flex-1">
                     <h2 className="text-green-400 font-bold uppercase mb-4 border-b border-green-800 pb-1">
                         RUN_PROCESS(EXPERIENCE)
                     </h2>
                     <div className="space-y-6">
                         {data.experience.map((exp, i) => (
                             <div key={exp.id} className="relative pl-4 border-l border-green-800">
                                 <div className="text-lg font-bold text-green-300 break-words">{exp.position}</div>
                                 <div className="text-xs text-green-800 mb-2 flex justify-between flex-wrap gap-2">
                                     <span className="break-words">@{exp.company}</span>
                                     <span>[{exp.startDate} :: {exp.endDate}]</span>
                                 </div>
                                 <p className={`text-sm text-green-600/90 ${SAFE_TEXT}`}>{exp.description}</p>
                             </div>
                         ))}
                     </div>
                 </section>
            </div>

            <div className="col-span-4 space-y-6 min-w-0">
                 <section className="border border-green-900 p-4">
                     <h2 className="text-xs font-bold text-green-800 uppercase mb-2">NETWORK.DATA</h2>
                     <ul className="text-xs space-y-2 text-green-600">
                         <li className={SAFE_LINK}>{data.personalInfo.email}</li>
                         <li>{data.personalInfo.phone}</li>
                         <li className="break-words">{data.personalInfo.address}</li>
                     </ul>
                 </section>

                 <section>
                     <h2 className="text-xs font-bold text-green-800 uppercase mb-2">MODULES(SKILLS)</h2>
                     <div className="flex flex-wrap gap-2">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="text-xs border border-green-700 px-2 py-0.5 text-green-500 break-words">{skill}</span>
                         ))}
                     </div>
                 </section>

                 <section>
                     <h2 className="text-xs font-bold text-green-800 uppercase mb-2">KERNEL(EDU)</h2>
                     {data.education.map(edu => (
                         <div key={edu.id} className="mb-4 text-xs">
                             <div className="font-bold text-green-500 break-words">{edu.degree}</div>
                             <div className="text-green-700 break-words">{edu.institution}</div>
                             <div className="text-green-900">{edu.startDate} - {edu.endDate}</div>
                         </div>
                     ))}
                 </section>
            </div>
        </div>
    </div>
));

const SwissTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} bg-[#f0f0f0] text-black font-sans p-0 relative`}>
        {/* Red Header Bar */}
        <div className="h-4 bg-[#ff0000] w-full absolute top-0 left-0"></div>
        
        <div className="p-16 pt-20 h-full flex flex-col">
            <div className="shrink-0">
                <h1 className="text-7xl font-bold leading-none tracking-tighter mb-4 break-words">{data.personalInfo.fullName}</h1>
                <p className="text-2xl font-medium mb-12 border-b-4 border-black pb-8 break-words">{data.personalInfo.jobTitle}</p>
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
            <div className="absolute top-20 right-16 w-32 h-32 border-4 border-black bg-white">
                <img src={data.personalInfo.photoUrl} alt="" crossOrigin="anonymous" className="w-full h-full object-cover grayscale contrast-125" />
            </div>
        )}
    </div>
));

const DoubleTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className={`${CONTAINER_BASE} bg-white text-slate-800 font-sans p-10`}>
        <header className="flex gap-8 mb-10 border-b-2 border-indigo-900 pb-8 shrink-0">
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-28 h-28 rounded-lg object-cover shadow-lg shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h1 className="text-4xl font-extrabold text-indigo-900 uppercase tracking-wide break-words">{data.personalInfo.fullName}</h1>
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
                    <div className="bg-indigo-900 text-white px-4 py-2 font-bold uppercase tracking-wider mb-4">Profile</div>
                    <p className={`text-sm text-justify leading-relaxed ${SAFE_TEXT}`}>{data.personalInfo.summary}</p>
                </section>

                <section>
                    <div className="bg-indigo-900 text-white px-4 py-2 font-bold uppercase tracking-wider mb-4">Education</div>
                    <div className="space-y-4">
                        {data.education.map(edu => (
                            <div key={edu.id} className="border-l-4 border-indigo-100 pl-4">
                                <div className="font-bold text-indigo-900 break-words">{edu.degree}</div>
                                <div className="font-semibold text-sm break-words">{edu.institution}</div>
                                <div className="text-xs text-slate-500 mt-1">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="bg-indigo-900 text-white px-4 py-2 font-bold uppercase tracking-wider mb-4">Skills</div>
                    <div className="grid grid-cols-2 gap-2">
                        {data.skills.map((skill, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm font-medium">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0"></div>
                                <span className="break-words">{skill}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="space-y-8 min-w-0">
                 <section>
                    <div className="bg-indigo-900 text-white px-4 py-2 font-bold uppercase tracking-wider mb-4">Experience</div>
                    <div className="space-y-6">
                        {data.experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1 flex-wrap gap-2">
                                    <h3 className="font-bold text-lg text-indigo-900 break-words">{exp.position}</h3>
                                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
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
));

// Helpers
const ContactItem = ({ icon, text, light, className = "" }: { icon: React.ReactNode, text: string, light?: boolean, className?: string }) => (
    <div className={`flex items-center gap-2 ${light ? 'text-slate-300' : 'text-slate-500'} ${className}`}>
        {icon}
        <span className={className}>{text}</span>
    </div>
);

const SectionTitleClassic = ({ title }: { title: string }) => (
    <h2 className="text-xl font-serif font-bold uppercase border-b border-slate-300 mb-4 pb-1">{title}</h2>
);

export default ResumePreview;
