import { useState } from 'react';
import { Schedule, BlockedDate } from '../types';
import { todayISO, parseISODate } from '../utils';

interface ScheduleSettingsProps {
  schedule: Schedule;
  setSchedule: (s: Schedule) => void;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function ScheduleSettings({ schedule, setSchedule }: ScheduleSettingsProps) {
  const [newBlockDate, setNewBlockDate] = useState(todayISO());
  const [blockReason, setBlockReason] = useState('');

  const updateDay = (dayIndex: number, field: string, value: unknown) => {
    const updated: Schedule = {
      ...schedule,
      weekdays: {
        ...schedule.weekdays,
        [dayIndex]: { ...schedule.weekdays[dayIndex], [field]: value },
      },
    };
    setSchedule(updated);
  };

  const addBlockedDate = () => {
    if (!newBlockDate) return;
    if (schedule.blockedDates.some((b) => (typeof b === 'string' ? b : b.date) === newBlockDate)) return;
    const entry = blockReason.trim()
      ? { date: newBlockDate, reason: blockReason.trim() }
      : newBlockDate;
    const updated: Schedule = { ...schedule, blockedDates: [...schedule.blockedDates, entry] };
    setSchedule(updated);
    setBlockReason('');
  };

  const removeBlockedDate = (iso: string) => {
    const updated: Schedule = {
      ...schedule,
      blockedDates: schedule.blockedDates.filter(
        (b) => (typeof b === 'string' ? b : b.date) !== iso
      ),
    };
    setSchedule(updated);
  };

  const blockedList: BlockedDate[] = schedule.blockedDates
    .map((b) => (typeof b === 'string' ? { date: b, reason: '' } : b))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Horário de funcionamento */}
      <div className="rounded-[20px] bg-white border border-[#e5d5bb] shadow-[0_6px_30px_rgba(126,94,34,.07)] p-5 sm:p-6">
        <div className="font-extrabold text-[16.5px] text-[#2b2016] mb-1">Horário de funcionamento</div>
        <p className="text-[12.8px] text-[#826f57] mb-5">
          Defina seus horários por dia da semana. Desative os dias de folga fixos.
        </p>

        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
            const day = schedule.weekdays[dayIndex];
            return (
              <div
                key={dayIndex}
                className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${
                  day.active ? 'border-[#e9dcc2] bg-[#fffdf9]' : 'border-[#eee5d6] bg-[#f7f2e8]'
                }`}
              >
                <label className="flex items-center gap-2.5 w-[130px] flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.active}
                    onChange={(e) => updateDay(dayIndex, 'active', e.target.checked)}
                    className="w-[18px] h-[18px] accent-[#b47d21]"
                  />
                  <span
                    className={`font-bold text-[13.8px] ${
                      day.active ? 'text-[#3a2e1b]' : 'text-[#a3927a]'
                    }`}
                  >
                    {DAY_NAMES[dayIndex]}
                  </span>
                </label>

                {day.active ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] text-[#7a6955]">das</span>
                    <input
                      type="time"
                      value={day.start}
                      onChange={(e) => updateDay(dayIndex, 'start', e.target.value)}
                      className="rounded-lg border border-[#dfcdb0] bg-white px-2.5 py-1.5 text-[13px]"
                    />
                    <span className="text-[12.5px] text-[#7a6955]">às</span>
                    <input
                      type="time"
                      value={day.end}
                      onChange={(e) => updateDay(dayIndex, 'end', e.target.value)}
                      className="rounded-lg border border-[#dfcdb0] bg-white px-2.5 py-1.5 text-[13px]"
                    />
                    <span className="text-[12.5px] text-[#7a6955] ml-1">intervalo</span>
                    <select
                      value={day.intervalMin}
                      onChange={(e) => updateDay(dayIndex, 'intervalMin', Number(e.target.value))}
                      className="rounded-lg border border-[#dfcdb0] bg-white px-2.5 py-1.5 text-[13px]"
                    >
                      <option value={15}>15 min</option>
                      <option value={20}>20 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                ) : (
                  <span className="text-[12.8px] text-[#a3927a] italic">
                    Dia de folga — sem agendamentos
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bloqueio de datas específicas */}
      <div className="rounded-[20px] bg-white border border-[#e5d5bb] shadow-[0_6px_30px_rgba(126,94,34,.07)] p-5 sm:p-6">
        <div className="font-extrabold text-[16.5px] text-[#2b2016] mb-1">Bloquear datas específicas</div>
        <p className="text-[12.8px] text-[#826f57] mb-5">
          Para viagens, recessos ou imprevistos. A cliente não conseguirá agendar nessas datas.
        </p>

        <div className="flex flex-wrap items-end gap-2.5 mb-5">
          <div>
            <label className="block text-[11.8px] font-bold text-[#8a7760] mb-1">Data</label>
            <input
              type="date"
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="rounded-xl border border-[#dfcdb0] bg-white px-3 py-2 text-[13.5px]"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11.8px] font-bold text-[#8a7760] mb-1">Motivo (opcional)</label>
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Ex: Viagem, recesso..."
              className="w-full rounded-xl border border-[#dfcdb0] bg-white px-3 py-2 text-[13.5px] outline-none focus:ring-2 focus:ring-[#e9c979]"
            />
          </div>
          <button
            onClick={addBlockedDate}
            className="rounded-xl bg-gradient-to-r from-[#e8c674] to-[#ba7d24] px-4 py-2.5 font-bold text-[13.5px] text-[#2b2015] hover:brightness-105"
          >
            + Bloquear
          </button>
        </div>

        {blockedList.length === 0 ? (
          <div className="text-[13px] text-[#9a8871] py-3">Nenhuma data bloqueada no momento.</div>
        ) : (
          <div className="space-y-2">
            {blockedList.map((b) => (
              <div
                key={b.date}
                className="flex items-center justify-between rounded-xl border border-[#ead9be] bg-[#fffdf9] px-4 py-2.5"
              >
                <div>
                  <span className="font-bold text-[13.8px] text-[#3a2e1b]">
                    {parseISODate(b.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })}
                  </span>
                  {b.reason && (
                    <span className="text-[12.5px] text-[#826f57] ml-2">— {b.reason}</span>
                  )}
                </div>
                <button
                  onClick={() => removeBlockedDate(b.date)}
                  className="text-[12.5px] font-bold text-[#b23c1f] hover:underline"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
