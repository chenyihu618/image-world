'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notes as notesApi } from '@/lib/api';
import type { TravelNote } from '@/lib/types';

export default function TravelNotes({ spotId }: { spotId: string }) {
  const [noteList, setNoteList] = useState<TravelNote[]>([]);
  const [author, setAuthor] = useState(''); const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false); const [showForm, setShowForm] = useState(false);

  useEffect(() => { notesApi.list(spotId).then(setNoteList).catch(() => {}); }, [spotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const note = await notesApi.create({ spotId, author, title, content });
      setNoteList(prev => [note as any, ...prev]);
      setAuthor(''); setTitle(''); setContent(''); setShowForm(false);
    } catch {} finally { setSubmitting(false); }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div><h2 className="text-white text-xl font-medium">游记</h2><p className="text-white/40 text-sm mt-1">分享你的旅行故事</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-sm transition-all border border-white/10">{showForm ? '取消' : '写游记'}</button>
      </div>
      {showForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSubmit} className="mb-8 p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="你的名字" value={author} onChange={e => setAuthor(e.target.value)} className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 text-sm" required />
            <input type="text" placeholder="游记标题（可选）" value={title} onChange={e => setTitle(e.target.value)} className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 text-sm" />
          </div>
          <textarea placeholder="写下你的旅行感受..." value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/50 text-sm resize-none" required />
          <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm disabled:opacity-50">{submitting ? '发布中...' : '发布游记'}</button>
        </motion.form>
      )}
      <div className="space-y-4">
        {noteList.map((note, idx) => (
          <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>{note.title && <h3 className="text-white font-medium text-base">{note.title}</h3>}<p className="text-white/40 text-xs mt-0.5">{note.author} · {new Date(note.createdAt).toLocaleDateString('zh-CN')}</p></div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </motion.div>
        ))}
        {noteList.length === 0 && <div className="text-center py-12 text-white/30"><p className="text-sm">还没有游记，来写下第一篇吧</p></div>}
      </div>
    </section>
  );
}