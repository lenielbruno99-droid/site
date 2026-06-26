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

  useEffect(() => {
    setBookings(loadBookings());
  }, []);

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
    const { error } = await supabase.from('agendamentos').insert([{
      cliente: b.clientName,
      whatsapp: b.clientPhone,
      servico: b.service,
      data_agendamento: `${b.date} às ${b.time}`
    }]);

    if (!error) {
      setBookings((prev) => [b, ...prev]);
    } else {
      alert("Erro ao salvar no banco de dados.");
      console.error(error);
    }
  };

  const handleScheduleChange = (s: Schedule) => {
    setSchedule(s);
    saveSchedule(s);
  };

  return (
    <div className="min-h-screen bg-[#fbf7f0] text-[#2c2620] antialiased">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#fbf7f0]/90 border-b border-[#e8e0d5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[68px] flex items-center justify-between">
          <button onClick={() => setMode('client')} className="hover:opacity-80 transition-opacity">
            <Logo small />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-[#f2e9d8] rounded-full p-1 text-[12px] font-medium tracking-wide">
              <button
                onClick={() => setMode('client')}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === 'client' ? 'bg-white shadow-sm text-[#3b2f1f]' : 'text-[#8a7a63] hover:text-[#3b2f1f]'
                }`}
              >
                Agendar
              </button>
              <button
                onClick={tryOpenAdmin}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === 'admin' ? 'bg-white shadow-sm text-[#3b2f1f]' : 'text-[#8a7a63] hover:text-[#3b2f1f]'
                }`}
              >
                Gestão
              </button>
            </div>
          </div>
        </div>
      </header>

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

      {showPinModal && (
        <PinModal 
          onSuccess={handlePinSuccess} 
          onClose={() => setShowPinModal(false)} 
        />
      )}
    </div>
  );
}
