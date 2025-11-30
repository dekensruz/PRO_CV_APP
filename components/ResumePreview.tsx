import React, { forwardRef } from 'react';
import { ResumeData, TemplateType } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface Props {
  data: ResumeData;
  template: TemplateType;
}

const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data, template }, ref) => {
  
  if (template === 'modern') {
    return <ModernTemplate data={data} ref={ref} />;
  }
  
  if (template === 'classic') {
    return <ClassicTemplate data={data} ref={ref} />;
  }

  return <MinimalistTemplate data={data} ref={ref} />;
});

// --- Templates ---

const ModernTemplate = forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => (
  <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 shadow-sm flex">
    {/* Left Column */}
    <div className="w-1/3 bg-slate-900 text-white p-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold leading-tight mb-2">{data.personalInfo.fullName}</h1>
            <p className="text-primary-400 font-medium uppercase tracking-widest text-sm">{data.personalInfo.jobTitle}</p>
        </div>

        <div className="space-y-6 text-sm">
            <ContactItem icon={<Mail size={14} />} text={data.personalInfo.email} light />
            <ContactItem icon={<Phone size={14} />} text={data.personalInfo.phone} light />
            <ContactItem icon={<MapPin size={14} />} text={data.personalInfo.address} light />
        </div>

        <div className="mt-12">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-4 text-slate-400">Education</h3>
            {data.education.map(edu => (
                <div key={edu.id} className="mb-4">
                    <p className="font-bold">{edu.degree}</p>
                    <p className="text-slate-400 text-xs">{edu.institution}</p>
                    <p className="text-slate-500 text-xs italic">{edu.startDate} - {edu.endDate}</p>
                </div>
            ))}
        </div>

        <div className="mt-12">
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
  <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12">
    <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center">
         <h1 className="text-4xl font-serif font-bold mb-2">{data.personalInfo.fullName}</h1>
         <p className="text-lg text-slate-600 font-serif italic mb-4">{data.personalInfo.jobTitle}</p>
         <div className="flex justify-center gap-4 text-sm text-slate-500">
            <span>{data.personalInfo.email}</span>
            <span>•</span>
            <span>{data.personalInfo.phone}</span>
            <span>•</span>
            <span>{data.personalInfo.address}</span>
         </div>
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
        <header className="mb-10">
            <h1 className="text-5xl font-light tracking-tight mb-2 text-indigo-600">{data.personalInfo.fullName}</h1>
            <p className="text-xl text-slate-400 font-light mb-6">{data.personalInfo.jobTitle}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <ContactItem icon={<Mail size={14} />} text={data.personalInfo.email} />
                <ContactItem icon={<Phone size={14} />} text={data.personalInfo.phone} />
                <ContactItem icon={<MapPin size={14} />} text={data.personalInfo.address} />
            </div>
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