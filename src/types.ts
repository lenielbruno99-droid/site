export type BookingStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

export interface Booking {
  id: string;
  serviceId: number;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  clientName: string;
  clientPhone: string;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export interface Service {
  id: number;
  nome: string;
  duracao_min: number;
  preco: number;
}

export interface DayConfig {
  active: boolean;
  start: string;
  end: string;
  intervalMin: number;
}

export interface BlockedDate {
  date: string;
  reason: string;
}

export interface Schedule {
  weekdays: Record<number, DayConfig>;
  blockedDates: (string | BlockedDate)[];
}
