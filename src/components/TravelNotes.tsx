 'use client';
 
 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import type { TravelNote } from '@/lib/types';
 
 interface TravelNotesProps {
   spotId: string;
 }
 
 export default function TravelNotes({ spotId }: TravelNotesProps) {
   const [notes, setNotes] = useState<TravelNote[]>([]);
   const [author, setAuthor] = useState('');
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const [showForm, setShowForm] = useState(false);
 
   useEffect(() => {
     fetch(`/api/note?spotId=${spotId}`)
       .then((r) => r.json())
       .then(setNotes)
       .catch(() => {});
   }, [spotId]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!author.trim() || !content.trim()) return;
     setSubmitting(true);
     try {
       const res = await fetch('/api/note', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ spotId, author, title, content }),
       });
       if (res.ok) {
         const note = await res.json();
         setNotes((prev) => [note, ...prev]);
         setAuthor('');
         setTitle('');
         setContent('');
         setShowForm(false);
       }
     } catch {
       // ignore
     }
     setSubmitting(false);
   };
 
   return (
     <section>
       {/* 标题栏 */}
       <div className="flex items-center justify-between mb-8">
         <div>
           <h2 className="text-white text-xl font-medium">游记</h2>
           <p className="text-white/40 text-sm mt-1">分享你的旅行故事</p>
         </div>
         <button
           onClick={() => setShowForm(!showForm)}
           className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-all border border-white/10 hover:border-white/30"
         >
           {showForm ? '取消' : '写游记'}
         </button>
       </div>
 
       {/* 发表表单 */}
       {showForm && (
         <motion.form
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: 'auto' }}
           exit={{ opacity: 0, height: 0 }}
           onSubmit={handleSubmit}
           className="mb-8 p-5 rounded-xl bg-white/5 border border-white/10 space-y-4"
         >
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <input
               type="text"
               placeholder="你的名字"
               value={author}
               onChange={(e) => setAuthor(e.target.value)}
               className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 transition-colors text-sm"
               required
             />
             <input
               type="text"
               placeholder="游记标题（可选）"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 transition-colors text-sm"
             />
           </div>
           <textarea
             placeholder="写下你的旅行感受..."
             value={content}
             onChange={(e) => setContent(e.target.value)}
             rows={4}
             className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 transition-colors text-sm resize-none"
             required
           />
           <button
             type="submit"
             disabled={submitting}
             className="px-6 py-2.5 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm transition-all disabled:opacity-50"
           >
             {submitting ? '发布中...' : '发布游记'}
           </button>
         </motion.form>
       )}
 
       {/* 游记列表 */}
       {notes.length === 0 ? (
         <div className="text-center py-12 text-white/30">
           <svg className="w-12 h-12 mx-auto mb-3 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
             <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
           </svg>
           <p className="text-sm">还没有游记，来写下第一篇吧</p>
         </div>
       ) : (
         <div className="space-y-4">
           {notes.map((note, idx) => (
             <motion.div
               key={note.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
             >
               <div className="flex items-start justify-between mb-2">
                 <div>
                   {note.title && (
                     <h3 className="text-white font-medium text-base">{note.title}</h3>
                   )}
                   <p className="text-white/40 text-xs mt-0.5">
                     {note.author} · {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                   </p>
                 </div>
               </div>
               <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                 {note.content}
               </p>
             </motion.div>
           ))}
         </div>
       )}
     </section>
   );
 }
