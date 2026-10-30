import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, CheckCircle, Mail, QrCode, AlertCircle, Calendar, MapPin, CreditCard, Sparkles } from 'lucide-react';
import TicketCard from '../components/TicketCard';
import { useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export default function Success() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketData = state?.ticketData;
  const eventDetails = state?.eventDetails;
  const printRef = useRef(null);

  useEffect(() => {
    if (!ticketData) {
      navigate('/registration');
    }
  }, [ticketData, navigate]);

  const handleDownload = async () => {
    if (printRef.current) {
      const toastId = toast.loading('Generating official PDF ticket...');
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
        pdf.save(`Event-Pass-${id}.pdf`);
        toast.success('Ticket downloaded successfully!', { id: toastId });
      } catch (error) {
        toast.error(`Error generating PDF: ${error.message || 'Unknown error'}`, { id: toastId, duration: 6000 });
        console.error("PDF generation failed:", error);
      }
    }
  };

  if (!ticketData) return null;

  const qrImageUrl = eventDetails?.paymentQrUrl || "/Images/payment_QR.jpeg";
  const isPaidEvent = eventDetails ? (eventDetails.feeAmount > 0 || eventDetails.fee !== "Free") : true;

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
          Congratulations, <span className="text-white font-semibold">{ticketData.fullName}</span>! Your registration for <span className="text-indigo-400 font-medium">{ticketData.event}</span> is recorded.
        </p>

        {/* Email Notification Alert Box */}
        <div className="mt-5 w-full bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4 text-left flex items-start gap-3.5 shadow-lg shadow-indigo-950/50">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
            <Mail size={20} />
          </div>
          <div className="text-xs text-slate-300">
            <p className="font-semibold text-white text-sm">Confirmation Email Dispatched</p>
            <p className="mt-0.5 leading-relaxed">
              We have sent an email to <strong className="text-indigo-300">{ticketData.email}</strong> containing your official entry ticket, event schedule, and payment details with QR code.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-10 items-start">
        {/* Left Column: Event & Payment Details Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment QR Section */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-400" />
                <h3 className="font-bold text-white text-base">Payment Details</h3>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                isPaidEvent 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {eventDetails?.fee || '₹499'}
              </span>
            </div>

            {isPaidEvent ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Please scan the QR code below using any UPI app (GPay, PhonePe, Paytm) to complete payment.
                </p>

                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner max-w-[240px] mx-auto border border-slate-200">
                  <img 
                    src={qrImageUrl} 
                    alt="Scan to Pay QR"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Images/payment_QR.jpeg";
                    }}
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                  <p className="text-[11px] font-bold text-slate-800 mt-2 tracking-wide uppercase">
                    UPI SCAN & PAY
                  </p>
                </div>

                {/* Reference Note */}
                <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Registration ID:</span>
                    <span className="font-mono text-indigo-300 font-bold">{id}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Payable Amount:</span>
                    <span className="text-white font-bold">{eventDetails?.fee || '₹499'}</span>
                  </div>
                  <p className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800">
                    * Please add your Registration ID ({id}) in the transaction remarks/notes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-center space-y-2">
                <CheckCircle size={32} className="text-green-400 mx-auto" />
                <p className="text-sm font-bold text-green-300">Free Admission</p>
                <p className="text-xs text-slate-400">No payment is required for this event. Your pass is ready for check-in!</p>
              </div>
            )}
          </div>

          {/* Event Information Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              Event Information
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-semibold text-[10px]">Event Name</p>
                <p className="font-bold text-sm text-indigo-300 mt-0.5">{ticketData.event}</p>
              </div>

              {eventDetails?.date && (
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Date & Time</p>
                  <p className="text-slate-200 mt-0.5">{eventDetails.date}</p>
                </div>
              )}

              {eventDetails?.venue && (
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Venue / Mode</p>
                  <p className="text-slate-200 mt-0.5">{eventDetails.venue}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Attendee Location</p>
                  <p className="text-slate-200 font-medium mt-0.5">{ticketData.location}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-semibold text-[10px]">Candidate Type</p>
                  <p className="text-slate-200 font-medium mt-0.5">{ticketData.candidateType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Preview & Actions */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/10 blur-[90px] pointer-events-none" />
            <TicketCard data={ticketData} ticketRef={printRef} />
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
              to="/registration"
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-6 py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <ArrowLeft size={18} />
              Register Another
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
