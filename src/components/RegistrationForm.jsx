import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { registrationSchema } from '../utils/validation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function RegistrationForm({ onSubmit, isLoading, events = [] }) {
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      event: events.length > 0 ? events[0].name : '',
      location: '',
      candidateType: 'Working Professional'
    }
  });

  const selectedEventName = watch('event');
  const selectedCandidateType = watch('candidateType');
  const activeEvent = events.find(e => e.name === selectedEventName) || events[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-2xl mx-auto border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl"
    >
      {/* Decorative ambient gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
          <Sparkles size={14} className="text-indigo-400" /> Fast & Seamless Registration
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Event Registration Form</h2>
        <p className="text-slate-400 text-sm md:text-base mt-1.5">
          Fill in your details below to receive your instant confirmation pass and event payment QR.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
            <User size={15} className="text-indigo-400" />
            Full Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input 
              {...register('fullName')} 
              className={`input-field pl-10 ${errors.fullName ? 'border-red-500 focus:border-red-500 bg-red-500/5' : ''}`}
              placeholder="e.g. Alex Johnson"
              disabled={isLoading}
            />
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle size={13}/>{errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Mail size={15} className="text-indigo-400" />
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input 
                {...register('email')} 
                type="email"
                className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 bg-red-500/5' : ''}`}
                placeholder="alex@company.com"
                disabled={isLoading}
              />
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Payment QR & event details will be sent here</p>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={13}/>{errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Phone size={15} className="text-indigo-400" />
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input 
                {...register('phone')} 
                type="tel"
                className={`input-field pl-10 ${errors.phone ? 'border-red-500 focus:border-red-500 bg-red-500/5' : ''}`}
                placeholder="+91 9876543210"
                disabled={isLoading}
              />
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">For WhatsApp / SMS event updates</p>
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={13}/>{errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Event Dropdown */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-indigo-400" />
              Select Event <span className="text-red-400">*</span>
            </span>
            {activeEvent?.fee && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                activeEvent.feeAmount === 0 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                Fee: {activeEvent.fee}
              </span>
            )}
          </label>
          <div className="relative">
            <select 
              {...register('event')} 
              className={`input-field pl-10 pr-10 appearance-none bg-slate-900/90 text-white cursor-pointer ${
                errors.event ? 'border-red-500 focus:border-red-500' : ''
              }`}
              disabled={isLoading}
            >
              <option value="" disabled>-- Select an event --</option>
              {events.map((evt) => (
                <option key={evt.id || evt.name} value={evt.name} className="bg-slate-900 text-white py-2">
                  {evt.name} ({evt.fee || 'Free'})
                </option>
              ))}
            </select>
            <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {errors.event && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle size={13}/>{errors.event.message}
            </p>
          )}

          {/* Dynamic Active Event Summary Card */}
          <AnimatePresence mode="wait">
            {activeEvent && (
              <motion.div
                key={activeEvent.name}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-indigo-200 font-medium">
                    <Clock size={13} className="text-indigo-400" />
                    <span>{activeEvent.date || 'Date announced soon'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <MapPin size={13} className="text-indigo-400" />
                    <span>{activeEvent.venue || 'Venue specified on ticket'}</span>
                  </div>
                </div>
                {activeEvent.description && (
                  <p className="text-slate-300 leading-relaxed pt-1 border-t border-indigo-500/10">
                    {activeEvent.description}
                  </p>
                )}
                {activeEvent.highlights && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeEvent.highlights.map((h, idx) => (
                      <span key={idx} className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-md text-[11px] border border-indigo-500/20">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location & Candidate Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
              <MapPin size={15} className="text-indigo-400" />
              Location / City <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input 
                {...register('location')} 
                className={`input-field pl-10 ${errors.location ? 'border-red-500 focus:border-red-500 bg-red-500/5' : ''}`}
                placeholder="e.g. Bangalore, Hyderabad, Pune..."
                disabled={isLoading}
              />
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            {errors.location && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={13}/>{errors.location.message}
              </p>
            )}
          </div>

          {/* Working Professional or Student */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Briefcase size={15} className="text-indigo-400" />
              Candidate Type <span className="text-red-400">*</span>
            </label>
            
            {/* Interactive Toggle Pills */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('candidateType', 'Working Professional', { shouldValidate: true })}
                disabled={isLoading}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedCandidateType === 'Working Professional'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Briefcase size={14} />
                Professional
              </button>

              <button
                type="button"
                onClick={() => setValue('candidateType', 'Student', { shouldValidate: true })}
                disabled={isLoading}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  selectedCandidateType === 'Student'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <GraduationCap size={15} />
                Student
              </button>
            </div>
            <input type="hidden" {...register('candidateType')} />
            {errors.candidateType && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={13}/>{errors.candidateType.message}
              </p>
            )}
          </div>
        </div>

        {/* Submission Note */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
          <CreditCard size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Upon registration, an automated confirmation email with your <strong className="text-slate-200">Payment QR Code</strong> and <strong className="text-slate-200">Event Details</strong> will be sent to your inbox.
          </p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex justify-center items-center gap-2 shadow-xl shadow-indigo-600/30 text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" 
              />
              <span>Confirming Registration...</span>
            </div>
          ) : (
            <>
              <span>Complete Event Registration</span>
              <CheckCircle2 size={19} />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
