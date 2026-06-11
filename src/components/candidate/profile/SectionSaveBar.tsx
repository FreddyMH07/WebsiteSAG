import { Save } from 'lucide-react';
import Spinner from '@/components/common/Spinner';

interface Props {
  isSubmitting: boolean;
  label?: string;
}

export default function SectionSaveBar({ isSubmitting, label = 'Simpan Bagian Ini' }: Props) {
  return (
    <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
      <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[160px]">
        {isSubmitting ? <Spinner size="sm" /> : <><Save className="mr-2 h-4 w-4" />{label}</>}
      </button>
    </div>
  );
}
