import { useEffect, useMemo, useState } from 'react';
import { Booking, BookingStatus, Schedule } from './types';
import { loadSchedule, saveSchedule } from './utils';
import Logo from './components/Logo';
import PinModal from './components/PinModal';
import ClientBooking from './components/ClientBooking';
import AdminHall from './components/AdminHall';
import { supabase } from './supabaseClient';

type Mode = 'client' | 'admin';

// Converte uma linha do Supabase (formato do banco) para o formato Booking usado no app
function rowToBooking(row: any): Booking {
  // data_agendamento vem como "2026-06-27 às 11:00" — separamos de volta
  const [datePart, timePart] = (row.data_agendamento || '').split(' às ');
  return {
    id: String(row.id),
    serviceId: 0,
    serviceName: row.servico || '',
    date: datePart || '',
    time: timePart || '',
    duration: 0,
    price: 0,
    clientName: row.cliente || '',
    clientPhone: row.whatsapp || '',
    status: (row.status as BookingStatus) || 'pendente',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export default function App() {
  const [mode, setMode] = useState<Mode>('client');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedule, setSchedule] = useState<Schedule>(loadSchedule());
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Busca os agendamentos reais do Supabase (não do localStorage)
  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      setLoadError('Não foi possível carregar os agendamentos.');
      return;
    }
    setBookings((data || []).map(rowToBooking));
  };

  // Carrega ao abrir a página
  useEffect(() => {
    fetchBookings();
  }, []);

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

  // Atualiza status no Supabase e recarrega a lista real
  const handleUpdateStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase
      .from('agendamentos')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Erro ao atualizar status.');
      console.error(error);
      return;
    }
    await fetchBookings();
  };

  // Salva no Supabase e recarrega a lista real (garante sincronia entre dispositivos)
  const handleAddBooking = async (b: Booking) => {
    const { error } = await supabase.from('agendamentos').insert([{
      cliente: b.clientName,
      whatsapp: b.clientPhone,
      servico: b.serviceName,
      data_agendamento: `${b.date} às ${b.time}`,
      status: 'pendente',
    }]);

    if (error) {
      alert('Erro ao salvar no banco de dados.');
      console.error(error);
      return;
    }
    await fetchBookings();
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
            {/* Versão mobile do menu — sempre visível, igual ao desktop */}
            <div className="sm:hidden flex bg-[#f2e9d8] rounded-full p-1 text-[12px] font-bold">
              <button
                onClick={() => setMode('client')}
                className={`px-3 py-1.5 rounded-full transition ${
                  mode === 'client' ? 'bg-white shadow-sm text-[#3b2f1f]' : 'text-[#8a7a63]'
                }`}
              >
                Cliente
              </button>
              <button
                onClick={tryOpenAdmin}
                className={`px-3 py-1.5 rounded-full transition ${
                  mode === 'admin' ? 'bg-white shadow-sm text-[#3b2f1f]' : 'text-[#8a7a63]'
                }`}
              >
                Gestão
              </button>
            </div>
          </div>
        </div>
      </header>

      {loadError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-3">
          <div className="bg-[#fbe4d6] text-[#b23c1f] rounded-xl px-4 py-3 text-[13px] font-semibold">
            {loadError}
          </div>
        </div>
      )}

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
