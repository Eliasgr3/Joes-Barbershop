import { z } from 'zod';

export const bookingRequestSchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  startsAt: z.string().datetime(),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,20}$/, 'Μη έγκυρος αριθμός τηλεφώνου'),
  customerEmail: z.string().trim().email().optional().or(z.literal('')),
});
export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export const availabilityQuerySchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const serviceFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300).optional().or(z.literal('')),
  priceEuros: z.number().min(0),
  durationMin: z.number().int().min(5).max(480),
  isActive: z.boolean(),
});
export type ServiceForm = z.infer<typeof serviceFormSchema>;

export const barberFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  isActive: z.boolean(),
});
export type BarberForm = z.infer<typeof barberFormSchema>;

export const workingHoursFormSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const dayOffFormSchema = z.object({
  offDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(200).optional().or(z.literal('')),
});

export const manualAppointmentSchema = z.object({
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().min(6).max(30),
  customerEmail: z.string().trim().email().optional().or(z.literal('')),
  notes: z.string().trim().max(300).optional().or(z.literal('')),
});

export const appointmentStatusUpdateSchema = z.object({
  status: z.enum(['booked', 'completed', 'cancelled', 'no_show']),
});
