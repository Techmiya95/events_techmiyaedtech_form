import { z } from 'zod';

const phoneRegex = /^\+?[0-9\-\s()]{7,15}$/;

export const CANDIDATE_TYPES = ['Working Professional', 'Student'];

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().regex(phoneRegex, 'Please enter a valid phone number (at least 7 digits)'),
  event: z.string().min(1, 'Please select an event from the dropdown'),
  location: z.string().trim().min(2, 'Location / City is required'),
  candidateType: z.enum(['Working Professional', 'Student'], {
    errorMap: () => ({ message: 'Please select whether you are a Working Professional or Student' })
  })
});
