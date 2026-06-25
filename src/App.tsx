import { useEffect, useMemo, useState } from 'react';
import { Booking, BookingStatus, Schedule } from './types';
import { loadBookings, loadSchedule, saveBookings, saveSchedule } from './utils';
import Logo from './components/Logo';
import PinModal from './components/PinModal';
import ClientBooking from './components/ClientBooking';
import AdminHall from './components/AdminHall';
import { supabase } from './supabaseClient';
type Mode = 'client' | 'admin';

export default function App() {
  const [mode, setMode] = useState<Mode>('client');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedule, setSchedule] = useState<Schedule>(loadSchedule());
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Load bookings on mount
    // Busca os agendamentos no banco de dados quando o site abre
  useEffect(() => {
    async function carregarDados() {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*');
      
      if (error) {
        console.error("Erro ao carregar:", error);
      } else if (data) {
        setBookings(data);
      }
    }
    carregarDados();
  }, []);

  // Persist bookings whenever they change
  useEffect(() => {
    if (bookings.length > 0) saveBookings(bookings);
  }, [bookings]);

  const bookedSlots = useMemo(() => {
    const m = new Map<string, boolean>();
    bookings
      .filter((b) => b.status !== 'cancelado')
      .forEach((b) => {
        m.set(`${b.date}-${b.time}`, true);
      });
    return m;
  }, [bookings]);

  const tryOpenAdmin = () => {
    if (!isAdminUnlocked) {
      setShowPinModal(true);
      return;
    }
    setMode('admin');
  };

  const handlePinSuccess = () => {
    setIsAdminUnlocked(true);
    setShowPinModal(false);
    setMode('admin');
  };

  const handleUpdateStatus = (id: string, status: BookingStatus) => {
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b)));
  };
  const handleAddBooking = async (b: Booking) => {
    // 1. Envia para o Banco de Dados (Supabase)
    const { error } = await supabase
      .from('agendamentos')
      .insert([{ 
        cliente: b.clientName,
        whatsapp: b.clientPhone,
        servico: b.service,
        data_agendamento: `${b.date} às ${b.time}` 
      }]);

    if (error) {
      alert("Erro ao salvar no banco de dados.");
      console.error("Detalhes do erro:", error);
    } else {
      // 2. Se deu certo, atualiza a lista na tela do seu site
      setBookings((prev) => [b, ...prev]);
      alert("Agendamento realizado e salvo no banco!");
    }
  };

  const handleScheduleChange = (s: Schedule) => {
    setSchedule(s);
    saveSchedule(s);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f0] text-[#2c2620] antialiased">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#fbf7f0]/90 border-b border-[#e6dac5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[68px] flex items-center justify-between">
          <button onClick={() => setMode('client')} className="hover:opacity-80 transition">
            <Logo small />
          </button>
          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <div className="hidden sm:flex bg-[#f2e9d8] rounded-full p-1 text-[12.6px] font-semibold text-[#69583c]">
              <button
                onClick={() => setMode('client')}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === 'client'
                    ? 'bg-white shadow-sm text-[#3b2f1f]'
                    : 'hover:text-[#3a2f1d]'
                }`}
              >
                Agendar
              </button>
              <button
                onClick={tryOpenAdmin}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === 'admin'
                    ? 'bg-white shadow-sm text-[#3b2f1f]'
                    : 'hover:text-[#3a2f1d]'
                }`}
              >
                Hall da Daiane
              </button>
            </div>
            {/* Mobile nav */}
            <div className="sm:hidden flex bg-[#f2e9d8] rounded-full p-1 text-[12.4px] font-bold text-[#69583c]">
              <button
                onClick={() => setMode('client')}
                className={`px-3 py-1.5 rounded-full transition ${
                  mode === 'client' ? 'bg-white shadow-sm text-[#3b2f1f]' : ''
                }`}
              >
                Cliente
              </button>
              <button
                onClick={tryOpenAdmin}
                className={`px-3 py-1.5 rounded-full transition ${
                  mode === 'admin' ? 'bg-white shadow-sm text-[#3b2f1f]' : ''
                }`}
              >
                Gestão
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      {mode === 'client' ? (
        <ClientBooking
          schedule={schedule}
          bookedSlots={bookedSlots}
          onBookingCreated={handleAddBooking}
          onOpenAdmin={tryOpenAdmin}
        />
      ) : (
        <AdminHall
          bookings={bookings}
          schedule={schedule}
          setSchedule={handleScheduleChange}
          onUpdateStatus={handleUpdateStatus}
          onAddBooking={handleAddBooking}
        />
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <PinModal
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}

      <style>{`
        body { font-family: 'Manrope', system-ui, sans-serif; }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-6px); }
          40%,80%  { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
