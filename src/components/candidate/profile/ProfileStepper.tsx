import { CheckCircle } from 'lucide-react';

export const SECTIONS = [
  { id: 1, name: 'Posisi Dilamar' },
  { id: 2, name: 'Data Diri' },
  { id: 3, name: 'Data Keluarga' },
  { id: 4, name: 'Pend. Formal' },
  { id: 5, name: 'Pend. Non-Formal' },
  { id: 6, name: 'Bahasa' },
  { id: 7, name: 'Organisasi' },
  { id: 8, name: 'Pengalaman Kerja' },
  { id: 9, name: 'Referensi' },
  { id: 10, name: 'Info Lainnya' },
  { id: 11, name: 'Pernyataan' },
];

interface Props {
  current: number;
  completeSections: number[];
  onChange: (id: number) => void;
}

export default function ProfileStepper({ current, completeSections, onChange }: Props) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex min-w-max gap-1">
        {SECTIONS.map((s) => {
          const done = completeSections.includes(s.id);
          const active = current === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition whitespace-nowrap
                ${active ? 'bg-sag-green text-white shadow' : done ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {done && !active ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] flex-shrink-0
                  ${active ? 'bg-white/20' : 'bg-white/60'}`}>{s.id}</span>
              )}
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
