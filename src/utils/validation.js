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

export const workshopRegistrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().trim().regex(phoneRegex, 'Please enter a valid phone number (at least 7 digits)'),
  email: z.string().trim().email('Please enter a valid email address'),
  workshop: z.string().min(1, 'Workshop name is required'),
  mode: z.enum(['Online', 'Offline'], {
    errorMap: () => ({ message: 'Please select Online or Offline mode' })
  }),
  payOffline: z.boolean().optional(),
  paymentScreenshot: z.string().optional()
}).refine((data) => {
  // When mode is Online, upload screenshot is strictly required!
  if (data.mode === 'Online') {
    return !!data.paymentScreenshot && data.paymentScreenshot.length > 50;
  }
  // When mode is Offline and payOffline is not checked, user needs to upload screenshot if paying online
  if (data.mode === 'Offline' && !data.payOffline) {
    return !!data.paymentScreenshot && data.paymentScreenshot.length > 50;
  }
  return true;
}, {
  message: 'Please upload your payment screenshot before submitting',
  path: ['paymentScreenshot']
});
