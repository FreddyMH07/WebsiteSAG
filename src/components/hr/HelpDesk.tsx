import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CircleHelp, X, ChevronLeft, Send, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { helpTopics, HELP_CATEGORIES } from '@/data/helpManual';
import type { HelpTopic, HelpCategory } from '@/data/helpManual';
import { sendHelpdeskTicket } from '@/lib/web3forms';
import Spinner from '@/components/common/Spinner';

// ── Types ──────────────────────────────────────────────────────────────────────

type PanduanView = 'categories' | 'topics' | 'chat';
type ITState = 'idle' | 'submitting' | 'success' | 'error';

const KATEGORI_OPTIONS = ['Bug / Error', 'Akses & Akun', 'Permintaan Fitur', 'Lainnya'];

// ── Main ───────────────────────────────────────────────────────────────────────

export default function HelpDesk() {
  const { user, profile } = useAuth();
  const location = useLocation();

  const [open, setOpen]   = useState(false);
  const [tab, setTab]     = useState<'panduan' | 'it'>('panduan');

  // ── Panduan state ────────────────────────────────────────────────────────────
  const [search, setSearch]                   = useState('');
  const [view, setView]                       = useState<PanduanView>('categories');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [chatHistory, setChatHistory]         = useState<HelpTopic[]>([]);

  // ── IT form state ────────────────────────────────────────────────────────────
  const [itForm, setItForm]   = useState({ kategori: KATEGORI_OPTIONS[0], subjek: '', deskripsi: '' });
  const [itState, setItState] = useState<ITState>('idle');
  const [itError, setItError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when new message added
  useEffect(() => {
    if (view === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, view]);

  // Reset panduan state when panel closes
  useEffect(() => {
    if (!open) {
      setSearch('');
      setView('categories');
      setSelectedCategory(null);
      setChatHistory([]);
    }
  }, [open]);

  // ── Computed ──────────────────────────────────────────────────────────────────

  const searchResults = search.trim()
    ? helpTopics.filter(
        (t) =>
          t.question.toLowerCase().includes(search.toLowerCase()) ||
          t.answer.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const topicsInCategory = selectedCategory
    ? helpTopics.filter((t) => t.category === selectedCategory)
    : [];

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleTopicClick = (topic: HelpTopic) => {
    setChatHistory((prev) =>
      prev.find((t) => t.id === topic.id) ? prev : [...prev, topic]
    );
    setSearch('');
    setView('chat');
  };

  const handleCategoryClick = (cat: HelpCategory) => {
    setSelectedCategory(cat);
    setView('topics');
  };

  const handleBack = () => {
    if (view === 'topics') {
      setView('categories');
      setSelectedCategory(null);
    } else if (view === 'chat') {
      setView(selectedCategory ? 'topics' : 'categories');
    }
  };

  const handleITSubmit = async () => {
    if (!itForm.subjek.trim() || itForm.deskripsi.trim().length < 20) return;
    setItState('submitting');
    setItError(null);
    try {
      await sendHelpdeskTicket({
        hrName:    profile?.full_name ?? 'HR Admin',
        hrEmail:   user?.email ?? '',
        pageUrl:   window.location.href,
        kategori:  itForm.kategori,
        subjek:    itForm.subjek.trim(),
        deskripsi: itForm.deskripsi.trim(),
      });
      setItState('success');
      setItForm({ kategori: KATEGORI_OPTIONS[0], subjek: '', deskripsi: '' });
    } catch (err: unknown) {
      setItState('error');
      setItError(err instanceof Error ? err.message : 'Gagal mengirim tiket.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating button — never printed */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? 'Tutup bantuan' : 'Buka bantuan'}
        className="print:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sag-green text-white shadow-xl ring-4 ring-sag-green/20 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <CircleHelp className="h-6 w-6" />}
      </button>

      {/* Panel — never printed */}
      {open && (
        <div
          className="print:hidden fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header bar */}
          <div className="flex flex-shrink-0 items-center justify-between bg-sag-green px-5 py-4">
            <p className="font-black text-white text-sm">Bantuan HR Portal</p>
            <button onClick={() => setOpen(false)}
              className="rounded-full p-1 text-white/70 hover:text-white transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex flex-shrink-0 border-b border-slate-100">
            {(['panduan', 'it'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-semibold transition ${
                  tab === t
                    ? 'border-b-2 border-sag-green text-sag-green'
                    : 'text-slate-500 hover:text-sag-green'
                }`}
              >
                {t === 'panduan' ? 'Panduan' : 'Hubungi IT'}
              </button>
            ))}
          </div>

          {/* ─── Panduan Tab ──────────────────────────────────────────────── */}
          {tab === 'panduan' && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Search + back button */}
              <div className="flex flex-shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3">
                {(view === 'topics' || view === 'chat') && !search && (
                  <button
                    onClick={handleBack}
                    className="flex-shrink-0 rounded-full p-1 text-slate-400 hover:text-sag-green transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <input
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sag-green focus:ring-1 focus:ring-sag-green/20"
                  placeholder="Cari bantuan… (mis. cetak, tutup job, logo)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">

                {/* ── Search results ── */}
                {search && (
                  <>
                    {searchResults.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-400">
                        Tidak ada hasil untuk &ldquo;{search}&rdquo;
                      </p>
                    ) : (
                      searchResults.map((topic) => (
                        <button key={topic.id} onClick={() => handleTopicClick(topic)}
                          className="w-full rounded-2xl border border-slate-100 bg-sag-mist/50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-sag-mist transition">
                          <span className="text-xs font-normal text-slate-400">{topic.category} · </span>
                          {topic.question}
                        </button>
                      ))
                    )}
                  </>
                )}

                {/* ── Category list ── */}
                {!search && view === 'categories' && (
                  <>
                    <p className="pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pilih Kategori
                    </p>
                    {HELP_CATEGORIES.map((cat) => {
                      const count = helpTopics.filter((t) => t.category === cat).length;
                      return (
                        <button key={cat} onClick={() => handleCategoryClick(cat)}
                          className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-sag-mist/40 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-sag-mist transition">
                          <span>{cat}</span>
                          <span className="ml-2 rounded-full bg-sag-green/10 px-2 py-0.5 text-xs text-sag-green">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* ── Topic list ── */}
                {!search && view === 'topics' && selectedCategory && (
                  <>
                    <p className="pb-2 text-xs font-bold uppercase tracking-wider text-sag-green">
                      {selectedCategory}
                    </p>
                    {topicsInCategory.map((topic) => (
                      <button key={topic.id} onClick={() => handleTopicClick(topic)}
                        className="w-full rounded-2xl border border-slate-100 bg-sag-mist/40 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-sag-mist transition">
                        {topic.question}
                      </button>
                    ))}
                  </>
                )}

                {/* ── Chat bubbles ── */}
                {!search && view === 'chat' && (
                  <div className="space-y-4 pb-2">
                    {chatHistory.map((topic) => (
                      <div key={topic.id} className="space-y-2">
                        {/* Question — right bubble */}
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-3xl rounded-tr-sm bg-sag-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
                            {topic.question}
                          </div>
                        </div>
                        {/* Answer — left bubble */}
                        <div className="flex justify-start">
                          <div className="max-w-[90%] rounded-3xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm">
                            <p className="leading-relaxed">{topic.answer}</p>
                            {topic.steps && topic.steps.length > 0 && (
                              <ol className="mt-2.5 space-y-1 pl-4 text-xs text-slate-600 list-decimal">
                                {topic.steps.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            )}
                            {topic.route && (
                              <Link
                                to={topic.route}
                                onClick={() => setOpen(false)}
                                className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-sag-green hover:underline"
                              >
                                Buka halaman <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />

                    {/* Ask another question */}
                    <button
                      onClick={() => setView(selectedCategory ? 'topics' : 'categories')}
                      className="w-full rounded-2xl border border-dashed border-slate-200 py-2.5 text-xs font-semibold text-slate-400 hover:border-sag-green hover:text-sag-green transition"
                    >
                      + Tanya topik lain
                    </button>
                  </div>
                )}
              </div>

              {/* Footer — switch to IT tab */}
              <div className="flex flex-shrink-0 items-center justify-center border-t border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Tidak menemukan jawaban?{' '}
                  <button onClick={() => setTab('it')}
                    className="font-bold text-sag-green hover:underline">
                    Hubungi IT →
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ─── Hubungi IT Tab ───────────────────────────────────────────── */}
          {tab === 'it' && (
            <div className="flex-1 overflow-y-auto">
              {itState === 'success' ? (
                <div className="flex justify-start p-5">
                  <div className="max-w-[90%] rounded-3xl rounded-tl-sm bg-green-50 px-4 py-3 text-sm text-green-800 shadow-sm">
                    <p className="font-semibold">✓ Tiket terkirim ke Tim IT.</p>
                    <p className="mt-1">Kami akan menghubungi Anda via email.</p>
                    <button
                      onClick={() => setItState('idle')}
                      className="mt-3 text-xs font-bold text-sag-green hover:underline"
                    >
                      Kirim tiket lain
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 px-5 py-4">
                  {/* Transparent context info */}
                  <div className="rounded-2xl bg-sag-mist/70 px-4 py-3 text-xs text-slate-600">
                    <p className="mb-1 font-semibold text-slate-700">Disertakan otomatis:</p>
                    <p>Nama: <strong>{profile?.full_name ?? '—'}</strong></p>
                    <p>Email: <strong>{user?.email ?? '—'}</strong></p>
                    <p className="truncate">Halaman: <strong>{location.pathname}</strong></p>
                    <p>Waktu: <strong>{new Date().toLocaleString('id-ID')}</strong></p>
                  </div>

                  <div>
                    <label className="label text-xs">Kategori Masalah</label>
                    <select className="input mt-1 text-sm" value={itForm.kategori}
                      onChange={(e) => setItForm((p) => ({ ...p, kategori: e.target.value }))}>
                      {KATEGORI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label text-xs">
                      Subjek <span className="text-red-500">*</span>
                    </label>
                    <input className="input mt-1 text-sm" value={itForm.subjek}
                      onChange={(e) => setItForm((p) => ({ ...p, subjek: e.target.value }))}
                      placeholder="Ringkasan singkat masalah…" />
                  </div>

                  <div>
                    <label className="label text-xs">
                      Deskripsi <span className="text-red-500">*</span>{' '}
                      <span className="text-slate-400">(min. 20 karakter)</span>
                    </label>
                    <textarea
                      className="input mt-1 h-28 resize-none text-sm"
                      value={itForm.deskripsi}
                      onChange={(e) => setItForm((p) => ({ ...p, deskripsi: e.target.value }))}
                      placeholder="Jelaskan langkah yang dilakukan, error yang muncul, dan dampaknya…"
                    />
                    <p className={`mt-1 text-right text-xs ${itForm.deskripsi.length < 20 ? 'text-red-400' : 'text-slate-400'}`}>
                      {itForm.deskripsi.length} / 20 min
                    </p>
                  </div>

                  {itState === 'error' && (
                    <div className="rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-700">
                      <p className="font-semibold">{itError ?? 'Gagal mengirim tiket.'}</p>
                      <a
                        href="mailto:sahabatagro.it@gmail.com"
                        className="mt-1 inline-flex items-center gap-1 font-bold hover:underline"
                      >
                        Kirim langsung via email <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handleITSubmit}
                    disabled={
                      itState === 'submitting' ||
                      !itForm.subjek.trim() ||
                      itForm.deskripsi.trim().length < 20
                    }
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {itState === 'submitting'
                      ? <Spinner size="sm" />
                      : <><Send className="h-4 w-4" /> Kirim Tiket</>
                    }
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
