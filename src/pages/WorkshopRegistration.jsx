import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as htmlToImage from 'html-to-image';
import WorkshopRegistrationForm from '../components/WorkshopRegistrationForm';
import WorkshopTicketCard from '../components/WorkshopTicketCard';
import { generateRegistrationID } from '../utils/generateID';
import { submitWorkshopRegistration } from '../services/api';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Clock, Award, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

export default function WorkshopRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const ticketRef = useRef(null);
  const navigate = useNavigate();

  const handleRegistration = async (formData) => {
    setIsSubmitting(true);
    try {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const registrationId = `GENAI-2026-${randomPart}`;

      const fee = formData.mode === 'Online' ? '₹499' : '₹599';
      const completeData = {
        ...formData,
        registrationId,
        fee,
        timing: 'November 6, 7, 8, 2026 • 10:00 AM - 5:00 PM IST',
        location: formData.mode === 'Online' ? 'Online Live Stream' : 'Techmiya Innovation Campus'
      };

      setTicketData(completeData);

      // Render ticket in DOM briefly to capture high-res pass
      setTimeout(async () => {
        let ticketImageBase64 = null;
        if (ticketRef.current) {
          try {
            const dataUrl = await htmlToImage.toJpeg(ticketRef.current, {
              pixelRatio: 1.5,
              backgroundColor: '#0f172a',
              quality: 0.65
            });
            ticketImageBase64 = dataUrl;
          } catch (e) {
            console.error("Failed to capture pass image:", e);
          }
        }

        const payload = {
          ...completeData,
          ticketImage: ticketImageBase64
        };

        const result = await submitWorkshopRegistration(payload);

        if (result.success) {
          toast.success('Workshop registration confirmed! Please check your email for the pass.');
          navigate(`/success/${registrationId}`, {
            state: {
              ticketData: completeData,
              isWorkshop: true
            }
          });
        } else {
          toast.error(result.error || 'Registration failed. Please try again.');
          setTicketData(null);
        }
        setIsSubmitting(false);
      }, 400);

    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
      setTicketData(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 md:py-10">
      {/* Hero Presentation */}
      <div className="mb-10 text-center max-w-3xl px-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs md:text-sm font-semibold mb-4 shadow-lg shadow-indigo-500/10"
        >
          <Sparkles size={16} className="text-indigo-400" />
          <span>Techmiya EdTech Presents</span>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 text-transparent bg-clip-text"
        >
          Register for Workshop
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-300 text-base md:text-xl font-normal max-w-2xl mx-auto leading-relaxed"
        >
          3-Day Hands-on Masterclass on <span className="text-white font-semibold">Generative AI, Prompt Engineering, RAG Systems, & Production Agents</span>.
        </motion.p>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 mt-6 text-xs text-slate-300"
        >
          <div className="flex items-center gap-1.5 bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            <Calendar size={14} className="text-indigo-400" />
            <span>Nov 6, 7, 8, 2026</span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            <Clock size={14} className="text-indigo-400" />
            <span>10:00 AM - 5:00 PM</span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            <Award size={14} className="text-purple-400" />
            <span>Industry Certificate</span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            <ShieldCheck size={14} className="text-green-400" />
            <span>Online (₹499) / Offline (₹599)</span>
          </div>
        </motion.div>
      </div>

      {/* Main Registration Form */}
      <WorkshopRegistrationForm 
        onSubmit={handleRegistration} 
        isLoading={isSubmitting} 
      />

      {/* Off-screen Ticket render container for pass generation */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
        {ticketData && (
          <div className="w-[450px]">
            <WorkshopTicketCard data={ticketData} ticketRef={ticketRef} />
          </div>
        )}
      </div>
    </div>
  );
}
