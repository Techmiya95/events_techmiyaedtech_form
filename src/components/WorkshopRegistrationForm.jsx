import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { workshopRegistrationSchema } from '../utils/validation';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  Monitor, 
  Building2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  CreditCard, 
  Sparkles,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkshopRegistrationForm({ onSubmit, isLoading }) {
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    setError,
    clearErrors,
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(workshopRegistrationSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      workshop: 'GenAI Workshop: Prompt Engineering, RAG & Production Agents',
      mode: 'Online',
      payOffline: false,
      paymentScreenshot: ''
    }
  });

  const selectedMode = watch('mode');
  const payOffline = watch('payOffline');
  const isOnline = selectedMode === 'Online';
  const fee = isOnline ? '₹499' : '₹599';

  // Handle image file selection and conversion to base64
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result;
      if (base64) {
        setScreenshotPreview(base64);
        setValue('paymentScreenshot', base64, { shouldValidate: true });
        clearErrors('paymentScreenshot');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotPreview(null);
    setValue('paymentScreenshot', '', { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-3xl p-6 md:p-10 w-full max-w-2xl mx-auto border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl"
    >
      {/* Decorative ambient gradients */}
      <div className="absolute -top-24 -right-24 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 tracking-wide uppercase">
          <Sparkles size={14} className="text-indigo-400" />
          <span>Techmiya EdTech Workshop Portal</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Register for Workshop
        </h2>
        <p className="text-slate-300 text-sm md:text-base mt-1.5">
          Join the 3-day GenAI hands-on masterclass. Reserve your seat below!
        </p>

        {/* Schedule Badge Card */}
        <div className="mt-4 p-3.5 bg-indigo-950/40 rounded-2xl border border-indigo-500/20 flex flex-wrap items-center justify-around gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-200 font-medium">
            <Calendar size={14} className="text-indigo-400" />
            <span>November 6, 7, 8, 2026</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-200 font-medium">
            <Clock size={14} className="text-purple-400" />
            <span>Morning 10:00 AM - 5:00 PM</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-200 font-medium">
            <Sparkles size={14} className="text-emerald-400" />
            <span>3 Days Hands-on Coding</span>
          </div>
        </div>
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
              placeholder="e.g. John Doe"
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

        {/* Phone & Email Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={13}/>{errors.phone.message}
              </p>
            )}
          </div>

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
                placeholder="john@example.com"
                disabled={isLoading}
              />
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={13}/>{errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Selection GenAI Workshop */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center gap-1.5">
            <Sparkles size={15} className="text-indigo-400" />
            Selected Workshop <span className="text-red-400">*</span>
          </label>
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-indigo-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white">GenAI Workshop (LLMs, RAG & Agents)</p>
              <p className="text-xs text-indigo-300">November 6, 7, 8, 2026 • 10:00 AM - 5:00 PM</p>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-semibold border border-indigo-500/30 shrink-0">
              Techmiya
            </span>
          </div>
          <input type="hidden" {...register('workshop')} />
        </div>

        {/* Mode Selection: Online (₹499) vs Offline (₹599) */}
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Select Workshop Mode <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Online Option */}
            <div
              onClick={() => {
                setValue('mode', 'Online', { shouldValidate: true });
                setValue('payOffline', false);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedMode === 'Online'
                  ? 'bg-indigo-600/20 border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${selectedMode === 'Online' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Monitor size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Online Mode</h4>
                    <p className="text-[11px] text-slate-400">Interactive Live Stream</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-indigo-300">₹499</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join remotely from anywhere. Full access to hands-on labs, recordings & digital certificate.
              </p>
            </div>

            {/* Offline Option */}
            <div
              onClick={() => setValue('mode', 'Offline', { shouldValidate: true })}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedMode === 'Offline'
                  ? 'bg-purple-600/20 border-purple-400 ring-2 ring-purple-500/30 shadow-lg shadow-purple-600/20'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${selectedMode === 'Offline' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Offline Mode</h4>
                    <p className="text-[11px] text-slate-400">In-Person Campus</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-purple-300">₹599</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                In-person hands-on training at Techmiya Innovation Campus. 1-on-1 mentorship, high-tea & networking.
              </p>
            </div>
          </div>
          <input type="hidden" {...register('mode')} />
          {errors.mode && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle size={13}/>{errors.mode.message}
            </p>
          )}
        </div>

        {/* Offline Pay Option Checkbox */}
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                {...register('payOffline')}
                className="w-5 h-5 mt-0.5 rounded border-amber-400 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-amber-200">
                  I will pay offline at the venue desk
                </span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Check this box if you prefer to pay ₹599 directly at the registration desk on November 6, 2026. No screenshot upload is required.
                </p>
              </div>
            </label>
          </motion.div>
        )}

        {/* Payment QR Code & Screenshot Upload Section */}
        {/* Shown when Online is selected OR when Offline is selected but "I will pay offline" is NOT checked */}
        <AnimatePresence mode="wait">
          {(isOnline || !payOffline) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-400" />
                  <h4 className="font-bold text-sm text-white">Scan & Pay via UPI</h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Payable: {fee}
                </span>
              </div>

              {/* QR Code and Payment Details */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-900/80 p-4 rounded-2xl border border-white/5">
                <div className="bg-white p-2.5 rounded-xl shadow-md shrink-0 border border-slate-200">
                  <img 
                    src="/Images/payment_QR.jpeg" 
                    alt="Payment QR" 
                    className="w-36 h-36 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://worldfounderscommunity.github.io/Founders_meetup/Images/payment_QR.jpeg";
                    }}
                  />
                  <p className="text-[10px] font-extrabold text-slate-800 text-center mt-1 uppercase tracking-wider">
                    UPI SCAN & PAY
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-300 flex-1">
                  <div className="p-2.5 rounded-xl bg-indigo-900/30 border border-indigo-500/20">
                    <p className="text-slate-400 text-[11px]">Workshop Fee</p>
                    <p className="text-lg font-black text-indigo-300">{fee}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mode: <strong className="text-white">{selectedMode}</strong> (Nov 6, 7, 8)
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Scan with Google Pay, PhonePe, Paytm, or any UPI app.<br/>
                    2. Complete the payment of <strong>{fee}</strong>.<br/>
                    3. Take a screenshot and upload below to confirm.
                  </p>
                </div>
              </div>

              {/* Upload Screenshot Field */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload size={15} className="text-indigo-400" />
                    Upload Payment Screenshot {isOnline && <span className="text-red-400">*</span>}
                  </span>
                  <span className="text-[11px] text-slate-400">PNG, JPG up to 5MB</span>
                </label>

                {!screenshotPreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-900/60 ${
                      errors.paymentScreenshot 
                        ? 'border-red-500 bg-red-500/5' 
                        : 'border-indigo-500/30 bg-slate-900/40 hover:border-indigo-400'
                    }`}
                  >
                    <Upload size={28} className="mx-auto text-indigo-400 mb-2 opacity-80" />
                    <p className="text-xs font-semibold text-white">Click or drag & drop to upload payment screenshot</p>
                    <p className="text-[11px] text-slate-400 mt-1">Upload the successful UPI transaction screenshot</p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/90 rounded-2xl border border-indigo-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img 
                        src={screenshotPreview} 
                        alt="Screenshot Preview" 
                        className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0"
                      />
                      <div className="text-left overflow-hidden">
                        <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                          <CheckCircle2 size={14} /> Screenshot Uploaded
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">Ready for verification</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors shrink-0"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {errors.paymentScreenshot && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13}/>{errors.paymentScreenshot.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offline payment note when checkbox is checked */}
        {!isOnline && payOffline && (
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-start gap-3 text-xs text-emerald-200">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <p className="font-bold text-white text-sm">Offline Payment Selected</p>
              <p className="mt-0.5 text-slate-300 leading-relaxed">
                Your offline seat is reserved for November 6, 7, 8, 2026. You can pay ₹599 directly at the Techmiya Innovation Campus reception desk when you arrive.
              </p>
            </div>
          </div>
        )}

        {/* Submission Note */}
        <div className="p-3.5 bg-slate-900/50 rounded-xl border border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
          <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Upon submission, an automated confirmation email with your digital workshop entry pass will be sent from <strong className="text-slate-200">Techmiya EdTech (techmiyaedtech@gmail.com)</strong>.
          </p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex justify-center items-center gap-2 shadow-xl shadow-indigo-600/30 text-base"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" 
              />
              <span>Registering for Workshop...</span>
            </div>
          ) : (
            <>
              <span>Confirm & Register for Workshop</span>
              <CheckCircle2 size={19} />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
