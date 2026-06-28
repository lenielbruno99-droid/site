import { useMemo, useState } from 'react';
import { Booking, BookingStatus, Schedule } from '../types';
import { services } from '../data';
import { formatPrice, parseISODate, saveSchedule, todayISO } from '../utils';
import StatusPill from './StatusPill';
import ScheduleSettings from './ScheduleSettings';
import ManualBookingModal from './ManualBookingModal';

interface AdminHallProps {
  bookings: Booking[];
  schedule: Schedule;
  setSchedule: (s: Schedule) => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onAddBooking: (b: Booking) => void;
  onDeleteBooking: (id: string) => void;
}

export default function AdminHall({
  bookings,
  schedule,
  setSchedule,
  onUpdateStatus,
  onAddBooking,
  onDeleteBooking,
}: AdminHallProps) {
  const [adminDate, setAdminDate] = useState(todayISO());
  const [adminTab, setAdminTab] = useState<'agendamentos' | 'horarios'>('agendamentos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [serviceFilter, setServiceFilter] = useState<'todos' | number>('todos');
  const [search, setSearch] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => statusFilter === 'todos' || b.status === statusFilter)
      .filter((b) => serviceFilter === 'todos' || b.serviceId === serviceFilter)
      .filter((b) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          b.clientName.toLowerCase().includes(s) ||
          b.clientPhone.includes(s) ||
          b.serviceName.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [bookings, statusFilter, serviceFilter, search]);

  const dayBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.date === adminDate && b.status !== 'cancelado')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [bookings, adminDate]
  );

  const kpis = useMemo(() => {
    const todayList = bookings.filter(
      (b) => b.date === adminDate && b.status !== 'cancelado'
    );
    const revenue = todayList
      .filter((b) => b.status !== 'pendente')
      .reduce((s, b) => s + b.price, 0);
    const pending = bookings.filter((b) => b.status === 'pendente').length;
    const weekRevenue = bookings
      .filter((b) => {
        const d = parseISODate(b.date);
        const now = new Date();
        const diff = Math.abs(d.getTime() - now.getTime()) / 86400000;
        return diff <= 7 && b.status !== 'cancelado' && b.status !== 'pendente';
      })
      .reduce((s, b) => s + b.price, 0);
    return { todayCount: todayList.length, revenue, pending, weekRevenue };
  }, [bookings, adminDate]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) ?? null;

  const whatsappLink = (b: Booking) => {
    const phone = b.clientPhone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Oi ${b.clientName.split(' ')[0]}! Aqui é a Daiane 💛 Confirmando seu horário de ${
        b.serviceName
      } dia ${parseISODate(b.date).toLocaleDateString('pt-BR')} às ${b.time}. Te espero!`
    );
    return `https://wa.me/55${phone}?text=${msg}`;
  };

  const clientHistory = (phone: string) =>
    bookings
      .filter((b) => b.clientPhone === phone && b.status !== 'cancelado')
      .sort((a, b) => b.date.localeCompare(a.date));

  const handleDeleteClick = () => {
    if (!selectedBooking) return;
    setConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedBooking) return;
    onDeleteBooking(selectedBooking.id);
    setSelectedBookingId(null);
    setConfirmingDelete(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-[34px] sm:text-[40px] text-[#3a2e1b] leading-tight">
            Hall da Daiane
          </h1>
          <p className="text-[13.8px] text-[#7a6955]">
            Seus agendamentos, em tempo real. Dados salvos localmente.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={adminDate}
            onChange={(e) => setAdminDate(e.target.value)}
            className="rounded-xl border border-[#e0cfb2] bg-white px-3 py-2 text-[13.5px]"
          />
          <button
            onClick={() => setShowNewBooking(true)}
            className="rounded-xl bg-gradient-to-r from-[#e8c674] to-[#ba7d24] px-4 py-2.5 font-bold text-[13.5px] text-[#2b2015] hover:brightness-105"
          >
            + Agendar manual
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-7 border-b border-[#e9dcc2]">
        {(['agendamentos', 'horarios'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`px-4 py-2.5 text-[13.8px] font-bold border-b-2 transition ${
              adminTab === tab
                ? 'border-[#b47d21] text-[#3a2e1b]'
                : 'border-transparent text-[#9a8871] hover:text-[#5e4f3c]'
            }`}
          >
            {tab === 'agendamentos' ? 'Agendamentos' : 'Horários & Folgas'}
          </button>
        ))}
      </div>

      {adminTab === 'horarios' ? (
        <ScheduleSettings
          schedule={schedule}
          setSchedule={(s) => {
            setSchedule(s);
            saveSchedule(s);
          }}
        />
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
            {[
              {
                label: 'Hoje',
                value: kpis.todayCount,
                sub: `${dayBookings.length} na agenda`,
              },
              {
                label: 'Faturamento do dia',
                value: formatPrice(kpis.revenue),
                sub: 'Confirmados/Concluídos',
              },
              {
                label: 'Pendentes',
                value: kpis.pending,
                sub: 'Aguardando confirmação',
              },
              {
                label: 'Faturamento 7d',
                value: formatPrice(kpis.weekRevenue),
                sub: 'Última semana',
              },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-[18px] bg-white border border-[#e7d9c1] px-4 py-4 shadow-[0_3px_18px_rgba(137,102,42,.060)]"
              >
                <div className="text-[11.7px] font-semibold text-[#8a7760] uppercase tracking-wide">
                  {k.label}
                </div>
                <div className="text-[26px] font-extrabold text-[#2b2319] mt-1">{k.value}</div>
                <div className="text-[12.3px] text-[#917d63]">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-7">
            {/* Left: Today timeline */}
            <div className="xl:col-span-4">
              <div className="rounded-[20px] bg-white border border-[#e5d5bb] shadow-[0_6px_30px_rgba(126,94,34,.07)]">
                <div className="px-5 pt-5 pb-3 border-b border-[#f0e3cc] flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-[16.5px] text-[#2b2016]">Agenda do dia</div>
                    <div className="text-[12.8px] text-[#826f57]">
                      {parseISODate(adminDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })}
                    </div>
                  </div>
                  <span className="text-[11.5px] font-bold px-2.5 py-1 rounded-full bg-[#f6ecd8] text-[#9a6b1f]">
                    {dayBookings.length} horários
                  </span>
                </div>
                <div className="p-4 sm:p-5 space-y-3 max-h-[540px] overflow-auto">
                  {dayBookings.length === 0 && (
                    <div className="text-[13.5px] text-[#9a8871] py-5">
                      Nenhum agendamento neste dia.
                    </div>
                  )}
                  {dayBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      className={`w-full text-left rounded-2xl border px-3.5 py-3.5 transition ${
                        selectedBookingId === b.id
                          ? 'border-[#c6932b] bg-[#fff9ee]'
                          : 'border-[#ead9be] hover:border-[#d4b87f] bg-[#fffdf9]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#2a2116] text-[14.6px]">{b.time}</span>
                        <StatusPill status={b.status} />
                      </div>
                      <div className="font-bold mt-1 text-[14.6px] text-[#3a2d1a]">
                        {b.clientName}
                      </div>
                      <div className="text-[12.8px] text-[#7b6851]">
                        {b.serviceName} • {b.duration} min
                      </div>
                      <div className="text-[12.6px] text-[#a27b39] font-semibold mt-0.5">
                        {formatPrice(b.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-[18px] bg-[#f4e9d3] border border-[#e4cfac] px-4 py-3.5 text-[12.9px] text-[#83653b]">
                <b className="text-[#5e4220]">Dica:</b> Status pendente = cliente agendou sozinha.
                Confirme no WhatsApp em 1 clique na lateral.
              </div>
            </div>

            {/* Middle: bookings table */}
            <div className="xl:col-span-5">
              <div className="rounded-[20px] bg-white border border-[#e5d5bb] shadow-[0_6px_30px_rgba(126,94,34,.07)]">
                <div className="px-5 pt-5 pb-3 border-b border-[#f0e3cc]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-extrabold text-[16.5px] text-[#2b2016]">
                      Todos os agendamentos
                    </div>
                    <div className="text-[12.3px] text-[#86705b]">
                      {filteredBookings.length} resultados
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      placeholder="Buscar cliente, serviço…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 min-w-[180px] rounded-xl border border-[#dfcdb0] bg-[#fffcf7] px-3 py-2 text-[13.4px] outline-none focus:ring-2 focus:ring-[#e9c979]"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-xl border border-[#dfcdb0] bg-white px-3 py-2 text-[13.4px]"
                    >
                      <option value="todos">Todos status</option>
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    <select
                      value={serviceFilter}
                      onChange={(e) =>
                        setServiceFilter(
                          e.target.value === 'todos' ? 'todos' : Number(e.target.value)
                        )
                      }
                      className="rounded-xl border border-[#dfcdb0] bg-white px-3 py-2 text-[13.4px]"
                    >
                      <option value="todos">Todos serviços</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="max-h-[560px] overflow-auto">
                  <table className="w-full text-[13.3px]">
                    <thead className="text-[11.8px] text-[#8c7760] uppercase tracking-wide border-b border-[#f0e3cc] bg-[#fdf8f0]">
                      <tr>
                        <th className="text-left font-bold px-5 py-2.5">Data</th>
                        <th className="text-left font-bold px-3 py-2.5">Cliente</th>
                        <th className="text-left font-bold px-3 py-2.5">Serviço</th>
                        <th className="text-left font-bold px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBookingId(b.id)}
                          className={`border-b border-[#f3e6d1] cursor-pointer hover:bg-[#fff8ec] ${
                            selectedBookingId === b.id ? 'bg-[#fff4df]' : ''
                          }`}
                        >
                          <td className="px-5 py-3 font-bold text-[#3b2d1a] whitespace-nowrap">
                            {parseISODate(b.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}{' '}
                            • {b.time}
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-[#33271a]">{b.clientName}</div>
                            <div className="text-[12px] text-[#957e62]">{b.clientPhone}</div>
                          </td>
                          <td className="px-3 py-3 text-[#6b5942]">{b.serviceName}</td>
                          <td className="px-3 py-3">
                            <StatusPill status={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredBookings.length === 0 && (
                    <div className="px-5 py-10 text-[#9d8970]">Nenhum agendamento encontrado.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: booking detail */}
            <div className="xl:col-span-3">
              <div className="rounded-[20px] bg-white border border-[#e5d5bb] shadow-[0_6px_30px_rgba(126,94,34,.07)] p-5 sticky top-[84px]">
                {!selectedBooking ? (
                  <div className="text-[13.5px] text-[#9a8770] py-8 text-center">
                    Selecione um agendamento na agenda
                    <br />
                    para ver detalhes.
                  </div>
                ) : (
                  <div>
                    <div className="text-[12.2px] text-[#a08a6d]">
                      {parseISODate(selectedBooking.date).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                      })}{' '}
                      • {selectedBooking.time}
                    </div>
                    <div className="text-[20px] font-extrabold text-[#2b2016] mt-1">
                      {selectedBooking.clientName}
                    </div>
                    <div className="text-[13.4px] text-[#7b664e]">{selectedBooking.clientPhone}</div>
                    <div className="mt-3 text-[13.8px]">
                      <div className="font-semibold text-[#2b2016]">
                        {selectedBooking.serviceName}
                      </div>
                      <div className="text-[#7a6750]">
                        {selectedBooking.duration} min • {formatPrice(selectedBooking.price)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <StatusPill status={selectedBooking.status} big />
                    </div>
                    {selectedBooking.notes && (
                      <div className="mt-3 text-[12.8px] bg-[#fdf4e2] border border-[#efdbb6] text-[#7b6138] rounded-xl px-3 py-2">
                        {selectedBooking.notes}
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-2">
                      <a
                        href={whatsappLink(selectedBooking)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center bg-[#25D366] text-white font-extrabold rounded-xl py-2.5 text-[13.6px] shadow-sm hover:brightness-105 transition"
                      >
                        WhatsApp cliente
                      </a>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onUpdateStatus(selectedBooking.id, 'confirmado')}
                          className="rounded-xl border border-[#d8c19a] py-2 text-[12.8px] font-bold text-[#604b2b] bg-[#fffaf0] hover:bg-[#fff3d8] transition"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => onUpdateStatus(selectedBooking.id, 'concluido')}
                          className="rounded-xl border border-[#c8d9bd] py-2 text-[12.8px] font-bold text-[#406039] bg-[#f3f8f0] hover:bg-[#e8f3e2] transition"
                        >
                          Concluir
                        </button>
                        <button
                          onClick={() => onUpdateStatus(selectedBooking.id, 'pendente')}
                          className="rounded-xl border border-[#e1ccaa] py-2 text-[12.8px] font-bold text-[#75603b] hover:bg-[#fdf7ee] transition"
                        >
                          Pendente
                        </button>
                        <button
                          onClick={() => onUpdateStatus(selectedBooking.id, 'cancelado')}
                          className="rounded-xl border border-[#f0c8b8] py-2 text-[12.8px] font-bold text-[#b64a2c] bg-[#fdf2ee] hover:bg-[#fce5dd] transition"
                        >
                          Cancelar
                        </button>
                      </div>

                      {/* Botão de excluir, com confirmação antes */}
                      {!confirmingDelete ? (
                        <button
                          onClick={handleDeleteClick}
                          className="w-full rounded-xl border border-[#e3c5b8] py-2 text-[12.6px] font-bold text-[#8a3a22] bg-white hover:bg-[#fdf2ee] transition mt-1"
                        >
                          Excluir agendamento
                        </button>
                      ) : (
                        <div className="mt-1 rounded-xl border border-[#f0c8b8] bg-[#fdf2ee] px-3 py-3">
                          <div className="text-[12.6px] font-bold text-[#8a3a22] mb-2">
                            Excluir definitivamente? Não pode ser desfeito.
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setConfirmingDelete(false)}
                              className="rounded-lg py-1.5 text-[12.3px] font-bold text-[#6d5e4a] bg-white border border-[#e3d4bb]"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleConfirmDelete}
                              className="rounded-lg py-1.5 text-[12.3px] font-bold text-white bg-[#b64a2c] hover:brightness-105"
                            >
                              Sim, excluir
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Client history */}
                    <div className="mt-4 border-t border-[#efdfc5] pt-4">
                      <div className="text-[11.8px] font-bold text-[#957e5f] uppercase tracking-wide mb-2">
                        Histórico da cliente
                      </div>
                      <div className="space-y-1.5 text-[12.7px]">
                        {clientHistory(selectedBooking.clientPhone)
                          .slice(0, 5)
                          .map((h) => (
                            <div key={h.id} className="flex justify-between text-[#6e5940]">
                              <span>
                                {parseISODate(h.date).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                })}{' '}
                                · {h.serviceName}
                              </span>
                              <span className="text-[#b1863f]">{formatPrice(h.price)}</span>
                            </div>
                          ))}
                        {clientHistory(selectedBooking.clientPhone).length === 0 && (
                          <div className="text-[#9a8570]">Primeira visita</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-[12.2px] text-[#99836a] flex flex-wrap gap-5">
            <span>✓ Agendamentos da página Cliente caem aqui automaticamente</span>
            <span>✓ Dados sincronizados via Supabase</span>
          </div>
        </>
      )}

      {showNewBooking && (
        <ManualBookingModal
          services={services}
          onClose={() => setShowNewBooking(false)}
          onSave={(b) => {
            onAddBooking(b);
            setShowNewBooking(false);
            setAdminDate(b.date);
            setSelectedBookingId(b.id);
          }}
        />
      )}
    </div>
  );
}
