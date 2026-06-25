import { Booking, Schedule, BlockedDate, DayConfig } from './types';
import { BOOKINGS_KEY, SCHEDULE_KEY } from './data';

export const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const dateToISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parseISODate = (iso: string) => {
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, m - 1, day, 12);
};

export function defaultSchedule(): Schedule {
  return {
    weekdays: {
      0: { active: false, start: '09:00', end: '17:00', intervalMin: 60 },
      1: { active: false, start: '09:00', end: '17:00', intervalMin: 60 },
      2: { active: true,  start: '09:00', end: '18:00', intervalMin: 60 },
      3: { active: true,  start: '09:00', end: '18:00', intervalMin: 60 },
      4: { active: true,  start: '09:00', end: '18:00', intervalMin: 60 },
      5: { active: true,  start: '09:00', end: '18:00', intervalMin: 60 },
      6: { active: true,  start: '09:00', end: '14:00', intervalMin: 60 },
    },
    blockedDates: [],
  };
}

export function loadSchedule(): Schedule {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return defaultSchedule();
    const parsed = JSON.parse(raw);
    return { ...defaultSchedule(), ...parsed };
  } catch {
    return defaultSchedule();
  }
}

export function saveSchedule(schedule: Schedule) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
}

export function buildTimesForDay(dayConfig: DayConfig | undefined): string[] {
  if (!dayConfig || !dayConfig.active) return [];
  const [startH, startM] = dayConfig.start.split(':').map(Number);
  const [endH, endM] = dayConfig.end.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const times: string[] = [];
  for (let mins = startTotal; mins < endTotal; mins += dayConfig.intervalMin) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return times;
}

export function isDateBlocked(blockedDates: (string | BlockedDate)[], iso: string): boolean {
  return blockedDates.some(b => (typeof b === 'string' ? b : b.date) === iso);
}

export function seedBookings(): Booking[] {
  const t = todayISO();
  const tomorrow = dateToISO(new Date(Date.now() + 86400000));
  const dayAfter = dateToISO(new Date(Date.now() + 86400000 * 2));
  return [
    { id: 'b1', serviceId: 1, serviceName: 'Design de Sobrancelhas', date: t, time: '09:00', duration: 20, price: 30, clientName: 'Marina Lopes', clientPhone: '11988124403', status: 'confirmado', createdAt: new Date().toISOString() },
    { id: 'b2', serviceId: 2, serviceName: 'Brow Lamination', date: t, time: '10:00', duration: 60, price: 120, clientName: 'Beatriz Almeida', clientPhone: '11999214488', status: 'confirmado', createdAt: new Date().toISOString() },
    { id: 'b3', serviceId: 5, serviceName: 'Lash Lifting', date: t, time: '14:00', duration: 60, price: 120, clientName: 'Camila Ribeiro', clientPhone: '11977551211', status: 'pendente', createdAt: new Date().toISOString(), notes: 'Primeira vez no estúdio' },
    { id: 'b4', serviceId: 8, serviceName: 'Hidragloss Lips', date: t, time: '15:00', duration: 40, price: 100, clientName: 'Juliana Costa', clientPhone: '11992004410', status: 'confirmado', createdAt: new Date().toISOString() },
    { id: 'b5', serviceId: 4, serviceName: 'Design com Henna', date: tomorrow, time: '11:00', duration: 40, price: 50, clientName: 'Larissa Mendes', clientPhone: '11984004422', status: 'confirmado', createdAt: new Date().toISOString() },
    { id: 'b6', serviceId: 6, serviceName: 'Nano Brows (Fios Realistas)', date: tomorrow, time: '13:00', duration: 120, price: 380, clientName: 'Fernanda Duarte', clientPhone: '11991003311', status: 'pendente', createdAt: new Date().toISOString(), notes: 'Retorno - 3ª sessão' },
    { id: 'b7', serviceId: 3, serviceName: 'Design com Coloração', date: dayAfter, time: '10:00', duration: 40, price: 60, clientName: 'Amanda Souza', clientPhone: '11980339001', status: 'pendente', createdAt: new Date().toISOString() },
    { id: 'b8', serviceId: 1, serviceName: 'Design de Sobrancelhas', date: dayAfter, time: '16:00', duration: 20, price: 30, clientName: 'Marina Lopes', clientPhone: '11988124403', status: 'confirmado', createdAt: new Date().toISOString() },
  ];
}

export function loadBookings(): Booking[] {
  const raw = localStorage.getItem(BOOKINGS_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  const seeded = seedBookings();
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}
