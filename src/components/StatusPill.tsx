import { BookingStatus } from '../types';

interface StatusPillProps {
  status: BookingStatus;
  big?: boolean;
}

const map: Record<BookingStatus, { txt: string; cls: string }> = {
  pendente:   { txt: 'Pendente',   cls: 'bg-[#fdf0d2] text-[#9a6c16] border-[#f0d18b]' },
  confirmado: { txt: 'Confirmado', cls: 'bg-[#e9f3e2] text-[#3f6b33] border-[#c8dfb9]' },
  concluido:  { txt: 'Concluído',  cls: 'bg-[#e9ecef] text-[#55535a] border-[#d4d3d8]' },
  cancelado:  { txt: 'Cancelado',  cls: 'bg-[#fce5dd] text-[#b23c1f] border-[#f0bca9]' },
};

export default function StatusPill({ status, big = false }: StatusPillProps) {
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${
        big ? 'px-3 py-1 text-[12.7px]' : 'px-2.5 py-0.5 text-[11.4px]'
      } ${m.cls}`}
    >
      {m.txt}
    </span>
  );
}
