import { useState } from 'react';
import { Service, Booking } from '../types';
import { availableTimes } from '../data';
import { todayISO, formatPrice } from '../utils';

interface ManualBookingModalProps {
  services: Service[];
  onClose: () => void;
  onSave: (booking: Booking) => void;
}

export default function ManualBookingModal({ services, onClose, onSave }: ManualBookingModalProps) {
  const [serviceId, setServiceId] = useState(services[0].id);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('10:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const svc = services.find((s) => s.id === serviceId)!;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: 'bk_' + Math.random().toString(36).slice(2, 9),
      serviceId: svc.id,
      serviceName: svc.nome,
      date,
      time,
      duration: svc.duracao_min,
      price: svc.preco,
      clientName: name,
      clientPhone: phone,
      status: 'confirmado',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[22px] bg-white shadow-2xl border border-[#e8d8bc] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[18px] font-extrabold text-[#2b2016]">Novo agendamento manual</div>
          <button onClick={onClose} className="text-[#857263] text-[26px] leading-none hover:text-[#3a2e1b]">
            ×
          </button>
        </div>

        <div className="grid gap-3 text-[13.5px]">
          <div>
            <div className="text-[12px] font-bold text-[#7b6853] mb-1">Serviço</div>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value))}
              className="w-full rounded-xl border border-[#e0cfb2] px-3 py-2.5 bg-white"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {formatPrice(s.preco)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[12px] font-bold text-[#7b6853] mb-1">Data</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[#e0cfb2] px-3 py-2.5"
              />
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#7b6853] mb-1">Horário</div>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-[#e0cfb2] px-3 py-2.5 bg-white"
              >
                {availableTimes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="text-[12px] font-bold text-[#7b6853] mb-1">Cliente</div>
            <input
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#e0cfb2] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#e9c979]"
            />
          </div>

          <div>
            <div className="text-[12px] font-bold text-[#7b6853] mb-1">WhatsApp</div>
            <input
              placeholder="(11) 99999-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-[#e0cfb2] px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#e9c979]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#e1cfb3] text-[13.5px] font-bold text-[#6a5842]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-[#2a2118] text-[#f6e8ce] font-bold text-[13.5px] hover:bg-[#3b3021]"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
