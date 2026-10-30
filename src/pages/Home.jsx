import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as htmlToImage from 'html-to-image';
import RegistrationForm from '../components/RegistrationForm';
import TicketCard from '../components/TicketCard';
import { generateRegistrationID } from '../utils/generateID';
import { submitRegistration, getEvents } from '../services/api';
import { DEFAULT_EVENTS } from '../utils/eventsData';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Award, Users, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const ticketRef = useRef(null);
  const navigate = useNavigate();

  // Load events (dynamic from backend or fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        const loadedEvents = await getEvents();
        if (isMounted && loadedEvents && loadedEvents.length > 0) {
          setEvents(loadedEvents);
        }
      } catch (err) {
        console.warn("Could not fetch remote events, using defaults:", err);
      }
    };
    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegistration = async (formData) => {
    setIsSubmitting(true);
    try {
      const registrationId = generateRegistrationID();
      const completeData = { 
        ...formData, 
        registrationId 
      };
      
      // Temporarily set data to render ticket in DOM for screenshot capture
      setTicketData(completeData);
      
      // Wait for React to render ticket in DOM
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
            console.error("Failed to capture ticket preview:", e);
          }
        }

        const payload = {
          ...completeData,
          ticketImage: ticketImageBase64
        };

        const result = await submitRegistration(payload);
        
        if (result.success) {
          toast.success('Registration successful! Please check your email for the ticket and payment QR.');
          
          // Match the selected event details
          const eventDetails = events.find(e => e.name === completeData.event) || events[0];

          navigate(`/success/${registrationId}`, { 
            state: { 
              ticketData: completeData,
              eventDetails: eventDetails
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
    <div className="flex flex-col items-center justify-center py-6 md:py-12">
      {/* Hero Header */}
      <div className="mb-10 text-center max-w-3xl px-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs md:text-sm font-semibold mb-5 shadow-lg shadow-indigo-500/10"
        >
          <Sparkles size={16} className="text-indigo-400" />
          <span>Techmiya EdTech & FestPitch Portal</span>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 text-transparent bg-clip-text"
        >
          Event Registration
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-300 text-base md:text-xl font-normal max-w-2xl mx-auto leading-relaxed"
        >
          Choose your event, register your spot, and receive instant entry passes with UPI payment QR codes directly to your inbox.
        </motion.p>

        {/* Feature Pills */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-slate-400"
        >
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full border border-white/5">
            <CheckCircle2 size={14} className="text-green-400" />
            <span>Instant Email Confirmation</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full border border-white/5">
            <Award size={14} className="text-indigo-400" />
            <span>Official Digital Entry Pass</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-full border border-white/5">
            <Users size={14} className="text-purple-400" />
            <span>Students & Professionals Welcome</span>
          </div>
        </motion.div>
      </div>

      {/* Main Registration Form */}
      <RegistrationForm 
        onSubmit={handleRegistration} 
        isLoading={isSubmitting} 
        events={events}
      />

      {/* Off-screen Ticket render container for htmlToImage */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
        {ticketData && (
          <div className="w-[450px]">
             <TicketCard data={ticketData} ticketRef={ticketRef} />
          </div>
        )}
      </div>
    </div>
  );
}
