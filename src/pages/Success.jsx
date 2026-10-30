import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, CheckCircle, Mail, Calendar, Clock, MapPin, CreditCard, Sparkles, Building2, Monitor } from 'lucide-react';
import TicketCard from '../components/TicketCard';
import WorkshopTicketCard from '../components/WorkshopTicketCard';
import { useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export default function Success() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketData = state?.ticketData;
  const isWorkshop = state?.isWorkshop;
  const eventDetails = state?.eventDetails;
  const printRef = useRef(null);

  useEffect(() => {
    if (!ticketData) {
      navigate('/');
    }
  }, [ticketData, navigate]);

  const handleDownload = async () => {
    if (printRef.current) {
      const toastId = toast.loading('Generating official PDF pass...');
      try {
        const imgData = await htmlToImage.toPng(printRef.current, { 
          pixelRatio: 2, 
          backgroundColor: '#0f172a' 
        });
        
        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => (img.onload = resolve));

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [img.width / 2, img.height / 2]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, img.width / 2, img.height / 2);
        pdf.save(`${isWorkshop ? 'Workshop-Pass' : 'Event-Pass'}-${id}.pdf`);
        toast.success('Pass downloaded successfully!', { id: toastId });
      } catch (error) {
        toast.error(`Error generating PDF: ${error.message || 'Unknown error'}`, { id: toastId, duration: 6000 });
        console.error("PDF generation failed:", error);
      }
    }
  };

  if (!ticketData) return null;

  const eventName = isWorkshop 
    ? "GenAI Workshop (3-Day Masterclass)" 
    : (ticketData.event || "Event Registration");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center"
    >
      {/* Success Banner */}
      <div className="mb-8 text-center flex flex-col items-center max-w-xl">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-500/10">
          <CheckCircle size={36} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Registration Confirmed!</h1>
        <p className="text-slate-300 text-sm md:text-base">
          Congratulations, <span className="text-white font-semibold">{ticketData.fullName}</span>! Your registration for <span className="text-indigo-400 font-medium">{eventName}</span> is confirmed.
        </p>

        {/* Email Notification Alert Box */}
        <div className="mt-5 w-full bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 text-left flex items-start gap-3.5 shadow-lg shadow-indigo-950/50">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
            <Mail size={20} />
          </div>
          <div className="text-xs text-slate-300">
            <p className="font-semibold text-white text-sm">Confirmation Email Sent</p>
            <p className="mt-0.5 leading-relaxed">
              We have emailed your official entry pass and schedule to <strong className="text-indigo-300">{ticketData.email}</strong> from <strong>Techmiya EdTech (techmiyaedtech@gmail.com)</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-10 items-start">
        {/* Left Column: Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Details Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              {isWorkshop ? "Workshop Schedule & Mode" : "Event Information"}
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Title</p>
                <p className="font-bold text-sm text-indigo-300 mt-0.5">{eventName}</p>
              </div>

              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Dates & Timing</p>
                <p className="text-slate-200 mt-0.5 font-medium">
                  {isWorkshop ? "November 6, 7, 8, 2026 • 10:00 AM - 5:00 PM" : (eventDetails?.date || "November 2026")}
                </p>
              </div>

              {isWorkshop ? (
                <>
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px]">Selected Mode</p>
                      <p className="text-indigo-300 font-bold mt-0.5 flex items-center gap-1">
                        {ticketData.mode === 'Online' ? <Monitor size={14}/> : <Building2 size={14}/>}
                        <span>{ticketData.mode} ({ticketData.fee})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px]">Payment Status</p>
                      <p className="text-green-400 font-semibold mt-0.5">
                        {ticketData.payOffline ? "Pay ₹599 at Venue" : "Payment Proof Received"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Location</p>
                    <p className="text-slate-200 font-medium mt-0.5">{ticketData.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Candidate Type</p>
                    <p className="text-slate-200 font-medium mt-0.5">{ticketData.candidateType}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-slate-400">
                <span>Pass Reference ID:</span>
                <span className="font-mono text-indigo-300 font-bold">{id}</span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 text-xs text-slate-400 leading-relaxed">
            <p className="text-white font-medium mb-1">Gate Check-in Information:</p>
            Please present the scannable QR code on your pass at the entrance desk for rapid check-in on the day of the event.
          </div>
        </div>

        {/* Right Column: Ticket Card & Action Buttons */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/10 blur-[90px] pointer-events-none" />
            {isWorkshop ? (
              <WorkshopTicketCard data={ticketData} ticketRef={printRef} />
            ) : (
              <TicketCard data={ticketData} ticketRef={printRef} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button 
              onClick={handleDownload}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-[0.98]"
            >
              <Download size={19} />
              Download PDF Pass
            </button>
            <Link 
              to="/"
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-6 py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <ArrowLeft size={18} />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
