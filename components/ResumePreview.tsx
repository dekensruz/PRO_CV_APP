
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
    default: return <ModernTemplate data={data} ref={ref} />;
  }
});

// Helper for photo
const ProfilePhoto = ({ url, className = "" }: { url?: string, className?: string }) => {
    if (!url) return null;
    return (
        <div className={`overflow-hidden ${className}`}>
            <img src={url} alt="Profile" className="w-full h-full object-cover" />
        </div>
    );
};

// --- Templates ---

const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 shadow-sm flex font-sans">
    {/* Left Column */}
    <div className="w-1/3 bg-slate-900 text-white p-8 flex flex-col">
        <div className="mb-8 text-center">
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-slate-700" />
            <h1 className="text-2xl font-bold leading-tight mb-2">{data.personalInfo.fullName}</h1>
            <p className="text-primary-400 font-medium uppercase tracking-widest text-xs">{data.personalInfo.jobTitle}</p>
        </div>

        <div className="space-y-4 text-sm mb-8">
            <ContactItem icon={<Mail size={14} />} text={data.personalInfo.email} light />
            <ContactItem icon={<Phone size={14} />} text={data.personalInfo.phone} light />
            <ContactItem icon={<MapPin size={14} />} text={data.personalInfo.address} light />
        </div>

        <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-4 text-slate-400">Education</h3>
            {data.education.map(edu => (
                <div key={edu.id} className="mb-4">
                    <p className="font-bold text-sm">{edu.degree}</p>
                    <p className="text-slate-400 text-xs">{edu.institution}</p>
                    <p className="text-slate-500 text-xs italic">{edu.startDate} - {edu.endDate}</p>
                </div>
            ))}
        </div>

        <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-4 text-slate-400">Skills</h3>
            <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, i) => (
                    <span key={i} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">{skill}</span>
                ))}
            </div>
        </div>
    </div>

    {/* Right Column */}
    <div className="w-2/3 p-8">
        <div className="mb-8">
            <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b-2 border-primary-500 w-16 pb-1 mb-4">Profile</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{data.personalInfo.summary}</p>
        </div>

        <div>
             <h3 className="text-lg font-bold uppercase tracking-widest text-slate-900 border-b-2 border-primary-500 w-16 pb-1 mb-6">Experience</h3>
             <div className="space-y-6">
                {data.experience.map(exp => (
                    <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-slate-900">{exp.position}</h4>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="text-primary-600 font-medium text-sm mb-2">{exp.company}</p>
                        <p className="text-sm text-slate-600 whitespace-pre-line">{exp.description}</p>
                    </div>
                ))}
             </div>
        </div>
    </div>
  </div>
));

const ClassicTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 font-serif">
    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex items-center justify-between">
         <div>
             <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName}</h1>
             <p className="text-lg text-slate-600 italic mb-4">{data.personalInfo.jobTitle}</p>
             <div className="flex gap-4 text-sm text-slate-500">
                <span>{data.personalInfo.email}</span>
                <span>•</span>
                <span>{data.personalInfo.phone}</span>
                <span>•</span>
                <span>{data.personalInfo.address}</span>
             </div>
         </div>
         <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 object-cover border border-slate-200 shadow-sm" />
    </div>

    <SectionTitleClassic title="Summary" />
    <p className="text-sm leading-relaxed mb-8 text-justify">{data.personalInfo.summary}</p>

    <SectionTitleClassic title="Experience" />
    <div className="space-y-6 mb-8">
        {data.experience.map(exp => (
            <div key={exp.id}>
                <div className="flex justify-between mb-1">
                    <h3 className="font-bold">{exp.position}</h3>
                    <span className="text-sm italic">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-slate-700 font-medium mb-2">{exp.company}</div>
                <p className="text-sm text-slate-600">{exp.description}</p>
            </div>
        ))}
    </div>

    <div className="grid grid-cols-2 gap-8">
        <div>
            <SectionTitleClassic title="Education" />
             {data.education.map(edu => (
                <div key={edu.id} className="mb-4">
                    <h3 className="font-bold">{edu.institution}</h3>
                    <p className="text-sm">{edu.degree} in {edu.field}</p>
                    <p className="text-xs text-slate-500 italic">{edu.startDate} - {edu.endDate}</p>
                </div>
            ))}
        </div>
        <div>
            <SectionTitleClassic title="Skills" />
            <ul className="list-disc list-inside text-sm grid grid-cols-2">
                {data.skills.map((skill, i) => (
                    <li key={i} className="mb-1">{skill}</li>
                ))}
            </ul>
        </div>
    </div>
  </div>
));

const MinimalistTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-10 font-sans">
        <header className="mb-10 flex justify-between items-start">
            <div>
                <h1 className="text-5xl font-light tracking-tight mb-2 text-indigo-600">{data.personalInfo.fullName}</h1>
                <p className="text-xl text-slate-400 font-light mb-6">{data.personalInfo.jobTitle}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <ContactItem icon={<Mail size={14} />} text={data.personalInfo.email} />
                    <ContactItem icon={<Phone size={14} />} text={data.personalInfo.phone} />
                    <ContactItem icon={<MapPin size={14} />} text={data.personalInfo.address} />
                </div>
            </div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 rounded-full object-cover grayscale" />
        </header>

        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
                <section className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Work Experience</h2>
                     <div className="space-y-8 border-l border-indigo-100 pl-6 ml-1">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="relative">
                                <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                                <h3 className="font-bold text-slate-800">{exp.position}</h3>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="font-semibold text-indigo-400">{exp.company}</span>
                                    <span className="text-slate-400">{exp.startDate} — {exp.endDate}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                     </div>
                </section>
            </div>

            <div className="col-span-4 space-y-8">
                 <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Summary</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{data.personalInfo.summary}</p>
                </section>

                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Education</h2>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-4">
                            <h3 className="font-bold text-sm">{edu.degree}</h3>
                            <p className="text-xs text-indigo-400 mb-1">{edu.institution}</p>
                            <p className="text-xs text-slate-400">{edu.startDate} - {edu.endDate}</p>
                        </div>
                    ))}
                </section>

                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-100 text-xs font-medium text-slate-600 rounded">{skill}</span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
));

const ExecutiveTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 font-serif">
        <header className="border-b-4 border-slate-900 pb-6 mb-10 flex justify-between items-center">
            <div className="flex items-center gap-6">
                 <ProfilePhoto url={data.personalInfo.photoUrl} className="w-20 h-20 object-cover shadow-sm border border-slate-300" />
                 <div>
                    <h1 className="text-4xl font-black uppercase tracking-wider mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-slate-600 tracking-wide">{data.personalInfo.jobTitle}</p>
                 </div>
            </div>
            <div className="text-right text-sm space-y-1 text-slate-600 font-sans">
                <div className="flex items-center justify-end gap-2"><Mail size={12}/> {data.personalInfo.email}</div>
                <div className="flex items-center justify-end gap-2"><Phone size={12}/> {data.personalInfo.phone}</div>
                <div className="flex items-center justify-end gap-2"><MapPin size={12}/> {data.personalInfo.address}</div>
            </div>
        </header>

        <section className="mb-10">
            <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Professional Profile</h2>
            <p className="text-slate-700 leading-relaxed text-justify">{data.personalInfo.summary}</p>
        </section>

        <section className="mb-10">
            <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-6 pb-1">Professional Experience</h2>
            <div className="space-y-8">
                {data.experience.map(exp => (
                    <div key={exp.id}>
                        <div className="flex justify-between items-center mb-1 font-sans">
                            <h3 className="font-bold text-lg">{exp.company}</h3>
                            <span className="text-sm font-medium bg-slate-100 px-3 py-1 rounded-full">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div className="text-slate-600 italic mb-3 font-medium">{exp.position}</div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    </div>
                ))}
            </div>
        </section>

        <div className="grid grid-cols-2 gap-12">
            <section>
                 <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Education</h2>
                 {data.education.map(edu => (
                    <div key={edu.id} className="mb-4">
                        <div className="font-bold">{edu.institution}</div>
                        <div className="text-sm text-slate-600">{edu.degree} - {edu.field}</div>
                        <div className="text-xs text-slate-400 font-sans mt-1">{edu.startDate} - {edu.endDate}</div>
                    </div>
                ))}
            </section>
            <section>
                 <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Expertise</h2>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-sans text-sm">
                    {data.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 bg-slate-900 rotate-45"></div>
                             {skill}
                        </div>
                    ))}
                 </div>
            </section>
        </div>
    </div>
));

const CreativeTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 flex flex-col font-sans">
        <header className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-10 text-white relative overflow-hidden flex items-center gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 rounded-full border-4 border-white/30 z-10" />
            <div className="relative z-10 flex-1">
                <h1 className="text-5xl font-extrabold mb-2 tracking-tight">{data.personalInfo.fullName}</h1>
                <p className="text-xl font-medium opacity-90 mb-6">{data.personalInfo.jobTitle}</p>
                <div className="flex gap-6 text-sm font-medium opacity-80">
                    <span className="flex items-center gap-2"><Mail size={16}/> {data.personalInfo.email}</span>
                    <span className="flex items-center gap-2"><Phone size={16}/> {data.personalInfo.phone}</span>
                </div>
            </div>
        </header>

        <div className="flex-1 flex">
            <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-100">
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-1 bg-pink-500 block"></span> Contact
                    </h3>
                    <div className="space-y-3 text-sm text-slate-600">
                         <div className="flex gap-3"><MapPin size={18} className="text-pink-500"/> {data.personalInfo.address}</div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <span className="w-8 h-1 bg-pink-500 block"></span> Education
                    </h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-6 last:mb-0">
                            <div className="font-bold text-slate-800">{edu.degree}</div>
                            <div className="text-sm text-pink-500 font-medium">{edu.institution}</div>
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
                            <span key={i} className="bg-white border border-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">{skill}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-2/3 p-10">
                <div className="mb-10">
                     <h3 className="text-2xl font-bold text-slate-900 mb-6">About Me</h3>
                     <p className="text-slate-600 leading-relaxed">{data.personalInfo.summary}</p>
                </div>

                <div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-8">Work Experience</h3>
                     <div className="space-y-8">
                        {data.experience.map(exp => (
                            <div key={exp.id} className="relative pl-8 border-l-2 border-slate-100">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-4 border-pink-500 rounded-full"></div>
                                <div className="mb-2">
                                    <h4 className="font-bold text-lg text-slate-800">{exp.position}</h4>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-pink-500">{exp.company}</span>
                                        <span className="text-slate-400 font-medium">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm">{exp.description}</p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    </div>
));

const TechTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-slate-900 text-slate-300 p-8 font-mono">
        <div className="border border-slate-700 h-full p-8 relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>

            <header className="mb-10 border-b border-slate-800 pb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl text-emerald-400 font-bold mb-2">
                        <span className="text-slate-600 mr-2">&lt;</span>
                        {data.personalInfo.fullName}
                        <span className="text-slate-600 ml-2">/&gt;</span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-6 pl-6 border-l-2 border-slate-800">{data.personalInfo.jobTitle}</p>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-sans">
                        <div className="flex items-center gap-2"><Mail size={14} className="text-emerald-500"/> {data.personalInfo.email}</div>
                        <div className="flex items-center gap-2"><Phone size={14} className="text-emerald-500"/> {data.personalInfo.phone}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500"/> {data.personalInfo.address}</div>
                    </div>
                </div>
                <ProfilePhoto url={data.personalInfo.photoUrl} className="w-24 h-24 rounded border border-emerald-500/50" />
            </header>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-8">
                    <section>
                        <h2 className="text-emerald-500 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                            <span className="text-slate-600">01.</span> Profile
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed font-sans">{data.personalInfo.summary}</p>
                    </section>

                    <section>
                        <h2 className="text-emerald-500 text-sm font-bold uppercase mb-6 flex items-center gap-2">
                            <span className="text-slate-600">02.</span> Experience
                        </h2>
                        <div className="space-y-8">
                            {data.experience.map((exp, idx) => (
                                <div key={exp.id} className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 text-xs text-slate-600">0{idx+1}</div>
                                    <h3 className="text-slate-200 font-bold">{exp.position}</h3>
                                    <div className="flex gap-4 text-xs mb-2">
                                        <span className="text-emerald-400">@{exp.company}</span>
                                        <span className="text-slate-500 font-sans">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 font-sans">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-emerald-500 text-sm font-bold uppercase mb-4 flex items-center gap-2">
                            <span className="text-slate-600">03.</span> Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 text-emerald-300 text-xs rounded border border-slate-700">{skill}</span>
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
                                    <div className="font-bold text-sm text-slate-300">{edu.degree}</div>
                                    <div className="text-xs text-slate-500 mb-1">{edu.institution}</div>
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

// --- NEW TEMPLATES ---

const CompactTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 font-sans">
        <header className="flex items-center gap-6 border-b-2 border-blue-900 pb-4 mb-4">
             <ProfilePhoto url={data.personalInfo.photoUrl} className="w-20 h-20 rounded-lg object-cover" />
             <div className="flex-1">
                 <h1 className="text-3xl font-bold text-blue-900 uppercase">{data.personalInfo.fullName}</h1>
                 <p className="text-lg font-medium text-slate-600">{data.personalInfo.jobTitle}</p>
             </div>
             <div className="text-xs text-right text-slate-500 space-y-1">
                 <div>{data.personalInfo.email}</div>
                 <div>{data.personalInfo.phone}</div>
                 <div>{data.personalInfo.address}</div>
             </div>
        </header>
        
        <div className="grid grid-cols-4 gap-4">
             <div className="col-span-3">
                 <div className="mb-4">
                     <h2 className="text-sm font-bold bg-blue-100 text-blue-900 px-2 py-1 mb-2 uppercase">Profil</h2>
                     <p className="text-xs text-justify leading-relaxed">{data.personalInfo.summary}</p>
                 </div>
                 
                 <div>
                     <h2 className="text-sm font-bold bg-blue-100 text-blue-900 px-2 py-1 mb-2 uppercase">Expérience</h2>
                     {data.experience.map(exp => (
                         <div key={exp.id} className="mb-3">
                             <div className="flex justify-between font-bold text-sm">
                                 <span>{exp.position}</span>
                                 <span className="text-blue-600">{exp.startDate} - {exp.endDate}</span>
                             </div>
                             <div className="text-xs font-semibold text-slate-500 mb-1">{exp.company}</div>
                             <p className="text-xs text-slate-700 leading-snug">{exp.description}</p>
                         </div>
                     ))}
                 </div>
             </div>
             
             <div className="col-span-1 bg-slate-50 p-2 rounded">
                 <div className="mb-4">
                     <h2 className="text-xs font-bold text-blue-900 border-b border-blue-200 mb-2 pb-1 uppercase">Compétences</h2>
                     <div className="flex flex-col gap-1">
                         {data.skills.map((skill, i) => (
                             <span key={i} className="text-xs bg-white border border-slate-200 px-1 py-0.5 rounded text-slate-700 block text-center">{skill}</span>
                         ))}
                     </div>
                 </div>
                 
                 <div>
                     <h2 className="text-xs font-bold text-blue-900 border-b border-blue-200 mb-2 pb-1 uppercase">Formation</h2>
                     {data.education.map(edu => (
                         <div key={edu.id} className="mb-2">
                             <div className="font-bold text-xs">{edu.degree}</div>
                             <div className="text-[10px] text-slate-500">{edu.institution}</div>
                             <div className="text-[10px] text-slate-400 italic">{edu.startDate} - {edu.endDate}</div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
    </div>
));

const TimelineTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-sans flex flex-col">
        <header className="bg-slate-800 text-white p-8 flex items-center justify-between">
            <div>
                 <h1 className="text-3xl font-bold">{data.personalInfo.fullName}</h1>
                 <p className="text-blue-300 font-medium">{data.personalInfo.jobTitle}</p>
            </div>
            <ProfilePhoto url={data.personalInfo.photoUrl} className="w-16 h-16 rounded-full border-2 border-blue-400" />
        </header>
        
        <div className="flex-1 grid grid-cols-12">
            <div className="col-span-4 bg-slate-100 p-6 border-r border-slate-200 text-sm">
                <div className="mb-6">
                    <h3 className="font-bold text-slate-700 uppercase mb-2">Contact</h3>
                    <div className="space-y-1 text-slate-600 text-xs">
                        <div className="flex items-center gap-2"><Mail size={12}/> {data.personalInfo.email}</div>
                        <div className="flex items-center gap-2"><Phone size={12}/> {data.personalInfo.phone}</div>
                        <div className="flex items-center gap-2"><MapPin size={12}/> {data.personalInfo.address}</div>
                    </div>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-bold text-slate-700 uppercase mb-2">Compétences</h3>
                    <div className="flex flex-wrap gap-1">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="bg-white border border-slate-300 px-2 py-1 rounded text-xs">{skill}</span>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h3 className="font-bold text-slate-700 uppercase mb-2">Éducation</h3>
                    {data.education.map(edu => (
                         <div key={edu.id} className="mb-3">
                             <div className="font-bold text-xs">{edu.degree}</div>
                             <div className="text-xs text-blue-600">{edu.institution}</div>
                             <div className="text-[10px] text-slate-400">{edu.startDate} - {edu.endDate}</div>
                         </div>
                     ))}
                </div>
            </div>
            
            <div className="col-span-8 p-8">
                 <div className="mb-8">
                     <h2 className="text-xl font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">Profil Professionnel</h2>
                     <p className="text-sm text-slate-600 leading-relaxed">{data.personalInfo.summary}</p>
                 </div>
                 
                 <div>
                     <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">Expérience</h2>
                     <div className="space-y-0 relative border-l-2 border-blue-200 ml-3">
                         {data.experience.map(exp => (
                             <div key={exp.id} className="relative pl-8 pb-8">
                                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>
                                 <h3 className="font-bold text-lg text-slate-800">{exp.position}</h3>
                                 <div className="text-sm font-medium text-blue-600 mb-1">{exp.company} | {exp.startDate} - {exp.endDate}</div>
                                 <p className="text-sm text-slate-600">{exp.description}</p>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    </div>
));

const LeftBorderTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 font-serif p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-16 bg-slate-800"></div>
        
        <div className="ml-12">
            <header className="flex gap-8 mb-10 items-end border-b border-slate-300 pb-8">
                <ProfilePhoto url={data.personalInfo.photoUrl} className="w-32 h-32 shadow-lg" />
                <div>
                    <h1 className="text-5xl font-bold text-slate-800">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-slate-500 italic mt-2">{data.personalInfo.jobTitle}</p>
                </div>
            </header>
            
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-8">
                    <section>
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Contact</h3>
                        <div className="text-sm space-y-2">
                             <div>{data.personalInfo.email}</div>
                             <div>{data.personalInfo.phone}</div>
                             <div>{data.personalInfo.address}</div>
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Education</h3>
                        {data.education.map(edu => (
                            <div key={edu.id} className="mb-4">
                                <div className="font-bold text-sm">{edu.degree}</div>
                                <div className="text-xs italic text-slate-500">{edu.institution}</div>
                                <div className="text-xs text-slate-400">{edu.startDate} - {edu.endDate}</div>
                            </div>
                        ))}
                    </section>
                    
                    <section>
                         <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Skills</h3>
                         <ul className="text-sm space-y-1 list-disc list-inside">
                             {data.skills.map((skill, i) => (
                                 <li key={i}>{skill}</li>
                             ))}
                         </ul>
                    </section>
                </div>
                
                <div className="col-span-2">
                    <section className="mb-8">
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-4">Profile</h3>
                        <p className="text-sm leading-relaxed text-justify">{data.personalInfo.summary}</p>
                    </section>
                    
                    <section>
                        <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-6">Experience</h3>
                        <div className="space-y-6">
                            {data.experience.map(exp => (
                                <div key={exp.id}>
                                    <h4 className="font-bold text-lg">{exp.position}</h4>
                                    <div className="flex justify-between text-sm text-slate-500 italic mb-2 border-b border-slate-100 pb-1">
                                        <span>{exp.company}</span>
                                        <span>{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
));

// Helpers
const ContactItem = ({ icon, text, light }: { icon: React.ReactNode, text: string, light?: boolean }) => (
    <div className={`flex items-center gap-2 ${light ? 'text-slate-300' : 'text-slate-500'}`}>
        {icon}
        <span>{text}</span>
    </div>
);

const SectionTitleClassic = ({ title }: { title: string }) => (
    <h2 className="text-xl font-serif font-bold uppercase border-b border-slate-300 mb-4 pb-1">{title}</h2>
);

export default ResumePreview;
