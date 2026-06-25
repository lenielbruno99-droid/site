import { useMemo, useState } from 'react';
import { Booking, Schedule, Service } from '../types';
import { availableTimes, services } from '../data';
import {
  buildTimesForDay,
  dateToISO,
  formatPrice,
  isDateBlocked,
} from '../utils';
import Logo from './Logo';

interface ClientBookingProps {
  schedule: Schedule;
  bookedSlots: Map<string, boolean>;
  onBookingCreated: (b: Booking) => void;
  onOpenAdmin: () => void;
}

export default function ClientBooking({
  schedule,
  bookedSlots,
  onBookingCreated,
  onOpenAdmin,
}: ClientBookingProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [error, setError] = useState('');

  const formatDateVerbose = (date: Date) =>
    date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  const dayTimesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const iso = dateToISO(selectedDate);
    if (isDateBlocked(schedule.blockedDates, iso)) return [];
    const dayConfig = schedule.weekdays[selectedDate.getDay()];
    return buildTimesForDay(dayConfig);
  }, [selectedDate, schedule]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setTimeout(() => setStep(2), 180);
  };

  const handleConfirmBooking = () => {
    if (!clientName.trim()) {
      setError('Por favor, digite seu nome.');
      setTimeout(() => setError(''), 2600);
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) return;

    const newBooking: Booking = {
      id: 'bk_' + Math.random().toString(36).slice(2, 9),
      serviceId: selectedService.id,
      serviceName: selectedService.nome,
      date: dateToISO(selectedDate),
      time: selectedTime,
      duration: selectedService.duracao_min,
      price: selectedService.preco,
      clientName,
      clientPhone,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    };
    onBookingCreated(newBooking);
    setStep(4);
  };

  const handleNewBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientName('');
    setClientPhone('');
  };

  const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <main className="max-w-[500px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Logo />
        </div>
        <p className="text-[13.5px] text-[#655a4a]">Agende seu horário em poucos toques</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6 max-w-[415px] mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              step >= i ? 'bg-[#b98a2f]' : 'bg-[#e5dcc8]'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="max-w-[415px] mx-auto mb-3 bg-[#fbe4d6] text-[#b23c1f] rounded-xl px-4 py-3 text-[13px] font-semibold">
          {error}
        </div>
      )}

      <div className="max-w-[415px] mx-auto">
        {/* Step 1: Choose service */}
        {step === 1 && (
          <div className="animate-[fadein_.22s_ease]">
            <h3 className="font-['Cormorant_Garamond'] text-[21px] mb-4 text-[#2b2016]">
              Escolha o serviço
            </h3>
            <div className="space-y-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleServiceSelect(s)}
                  className={`w-full text-left bg-white border rounded-2xl px-4 py-3.5 transition hover:border-[#d9bf87] ${
                    selectedService?.id === s.id
                      ? 'border-[#b8882a] bg-[#fffaf0] ring-1 ring-[#b8882a]'
                      : 'border-[#e6ddc9]'
                  }`}
                >
                  <div className="font-extrabold text-[15px] text-[#2b2016]">{s.nome}</div>
                  <div className="text-[12.5px] text-[#6e6251] mt-[2px]">{s.duracao_min} min</div>
                  <div className="text-[14.2px] font-extrabold text-[#9f7327] mt-1.5">
                    {formatPrice(s.preco)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose date & time */}
        {step === 2 && (
          <div className="animate-[fadein_.22s_ease]">
            <button
              onClick={() => setStep(1)}
              className="text-[13px] font-bold text-[#726658] mb-3 hover:text-[#4c4032]"
            >
              ← Voltar
            </button>
            <h3 className="font-['Cormorant_Garamond'] text-[21px] mb-3 text-[#2b2016]">
              Escolha o dia
            </h3>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
              {Array.from({ length: 21 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const iso = dateToISO(d);
                const active = selectedDate && dateToISO(selectedDate) === iso;
                const dayConfig = schedule.weekdays[d.getDay()];
                const isClosedWeekday = !dayConfig || !dayConfig.active;
                const isBlockedDate = isDateBlocked(schedule.blockedDates, iso);
                const isUnavailable = isClosedWeekday || isBlockedDate;

                return (
                  <button
                    key={iso}
                    disabled={isUnavailable}
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedTime(null);
                    }}
                    title={
                      isBlockedDate
                        ? 'Indisponível neste dia'
                        : isClosedWeekday
                        ? 'Dia de folga'
                        : ''
                    }
                    className={`flex-shrink-0 w-[60px] rounded-xl py-2.5 text-center border transition ${
                      isUnavailable
                        ? 'bg-[#f5ede0] border-[#eadccd] text-[#c7bba7] cursor-not-allowed opacity-60'
                        : active
                        ? 'bg-gradient-to-br from-[#e9c978] to-[#b47d21] border-transparent text-[#33240f]'
                        : 'bg-white border-[#e4d9c5] hover:border-[#d5c09a]'
                    }`}
                  >
                    <div className="text-[10.5px] uppercase font-bold opacity-80">
                      {DAY_NAMES[d.getDay()]}
                    </div>
                    <div className="font-['Cormorant_Garamond'] text-[20px] font-bold">
                      {d.getDate()}
                    </div>
                    {isUnavailable && <div className="text-[8.5px] mt-0.5">fechado</div>}
                  </button>
                );
              })}
            </div>

            <h3 className="font-['Cormorant_Garamond'] text-[21px] mb-3 text-[#2b2016]">
              Horários disponíveis
            </h3>
            <div className="grid grid-cols-3 gap-[10px]">
              {selectedDate && dayTimesForSelectedDate.length === 0 && (
                <div className="col-span-3 text-[13px] text-[#9a8871] py-2">
                  Nenhum horário disponível neste dia.
                </div>
              )}
              {(selectedDate ? dayTimesForSelectedDate : availableTimes).map((t) => {
                const isBooked = selectedDate
                  ? bookedSlots.get(`${dateToISO(selectedDate)}-${t}`)
                  : false;
                const active = selectedTime === t;

                return (
                  <button
                    key={t}
                    disabled={!!isBooked || !selectedDate}
                    onClick={() => {
                      setSelectedTime(t);
                      setTimeout(() => setStep(3), 120);
                    }}
                    className={`py-[11px] rounded-xl font-bold text-[13.5px] border transition ${
                      isBooked
                        ? 'bg-[#f5ede0] text-[#bfa998] border-[#eadccd] cursor-not-allowed'
                        : active
                        ? 'bg-gradient-to-br from-[#e9c978] to-[#b47d21] border-transparent text-[#33240f]'
                        : !selectedDate
                        ? 'bg-white border-[#e3d7c3] text-[#c7bba7]'
                        : 'bg-white border-[#e3d7c3] hover:border-[#d1b885] text-[#42362a]'
                    }`}
                  >
                    {isBooked ? '✕' : t}
                  </button>
                );
              })}
            </div>
            {!selectedDate && (
              <p className="text-[12px] text-[#857668] mt-3">
                Selecione um dia para liberar os horários.
              </p>
            )}
          </div>
        )}

        {/* Step 3: Client data */}
        {step === 3 && selectedService && selectedDate && selectedTime && (
          <div className="animate-[fadein_.22s_ease]">
            <button
              onClick={() => setStep(2)}
              className="text-[13px] font-bold text-[#726658] mb-3 hover:text-[#4c4032]"
            >
              ← Voltar
            </button>
            <h3 className="font-['Cormorant_Garamond'] text-[21px] mb-3 text-[#2b2016]">
              Seus dados
            </h3>
            <div className="bg-[#f1e6cf] rounded-2xl px-4 py-3.5 mb-5 text-[13.6px]">
              <div className="flex justify-between py-1.5 border-b border-[#e3cfa8]/50">
                <span className="text-[#6a5d4a]">Serviço</span>
                <b className="text-[#2b2016]">{selectedService.nome}</b>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e3cfa8]/50">
                <span className="text-[#6a5d4a]">Data</span>
                <b className="text-[#2b2016]">{formatDateVerbose(selectedDate)}</b>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#e3cfa8]/50">
                <span className="text-[#6a5d4a]">Horário</span>
                <b className="text-[#2b2016]">{selectedTime}</b>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6a5d4a]">Valor</span>
                <b className="text-[#9f7327]">{formatPrice(selectedService.preco)}</b>
              </div>
            </div>

            <label className="text-[12.5px] font-bold text-[#6d5e4a] block mb-1.5">
              Seu nome
            </label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full rounded-xl border border-[#e2d4bc] bg-white px-3.5 py-3 text-[14.5px] outline-none focus:ring-2 focus:ring-[#e7c779]"
            />

            <label className="text-[12.5px] font-bold text-[#6d5e4a] block mt-4 mb-1.5">
              WhatsApp (com DDD)
            </label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(11) 99999-0000"
              className="w-full rounded-xl border border-[#e2d4bc] bg-white px-3.5 py-3 text-[14.5px] outline-none focus:ring-2 focus:ring-[#e7c779]"
            />

            <button
              onClick={handleConfirmBooking}
              className="w-full mt-5 rounded-[14px] py-[14px] font-extrabold text-[#2d2417] bg-gradient-to-r from-[#e8c674] to-[#b67a1e] shadow-sm hover:brightness-[1.02] active:brightness-95 transition"
            >
              Confirmar agendamento
            </button>
            <p className="text-[11.6px] text-[#877769] text-center mt-3">
              Seu agendamento entra como pendente e aparece no Hall instantaneamente.
            </p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && selectedService && selectedDate && (
          <div className="text-center py-10 px-4 animate-[fadein_.22s_ease]">
            <div className="w-16 h-16 rounded-full bg-[#e8f1e2] text-[#50744a] flex items-center justify-center mx-auto mb-4">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[24px] mb-2 text-[#2b2016]">
              Agendamento enviado!
            </h2>
            <p className="text-[13.6px] text-[#6c5d4a] max-w-sm mx-auto">
              {selectedService.nome}, dia {formatDateVerbose(selectedDate)} às {selectedTime}.
              <br />A Daiane vai confirmar em breve!
            </p>
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={handleNewBooking}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#e3d4bb] text-[13.5px] font-bold text-[#3a2e1b]"
              >
                Novo agendamento
              </button>
              <button
                onClick={onOpenAdmin}
                className="px-4 py-2.5 rounded-xl bg-[#29221a] text-[#f5e9d2] text-[13.5px] font-bold"
              >
                Abrir Hall da Daiane →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 text-center text-[11.8px] text-[#9b8970]">
        Agendamentos salvos localmente no navegador.
      </div>
    </main>
  );
}
