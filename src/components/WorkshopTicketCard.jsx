import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, User, Mail, Phone, Sparkles, CheckCircle2 } from 'lucide-react';

export default function WorkshopTicketCard({ data, ticketRef }) {
  if (!data) return null;

  const verifyUrl = `${window.location.origin}/verify/${data.registrationId}`;
  const isOnline = data.mode === 'Online';

  return (
    <div 
      ref={ticketRef} 
      className="bg-[#0f172a] text-white rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30 max-w-md w-full mx-auto relative select-none"
    >
      {/* Ticket Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-center relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-white/10 rotate-12 pointer-events-none" />
        <div className="flex items-center justify-center gap-1.5 text-indigo-200 text-xs font-semibold tracking-widest uppercase mb-1">
          <Sparkles size={13} />
          <span>TECHMIYA EDTECH • OFFICIAL PASS</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase line-clamp-2 px-1">
          GenAI Workshop 2026
        </h2>
        <p className="text-indigo-100 text-xs tracking-widest font-semibold mt-1">
          3-DAY INTENSIVE MASTERCLASS
        </p>
      </div>

      {/* Ticket Body */}
      <div className="p-6 bg-[#1e293b] relative">
        {/* Notch cutouts for ticket look */}
        <div className="absolute -left-3 top-0 w-6 h-6 bg-[#0f172a] rounded-full transform -translate-y-1/2 border-r border-b border-indigo-500/30" />
        <div className="absolute -right-3 top-0 w-6 h-6 bg-[#0f172a] rounded-full transform -translate-y-1/2 border-l border-b border-indigo-500/30" />
        
        <div className="border-t border-dashed border-slate-600/70 absolute top-0 left-5 right-5" />

        <div className="mt-3 flex flex-col md:flex-row gap-5 items-center md:items-start">
          <div className="flex-1 space-y-3 w-full">
            {/* Attendee Name */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Attendee Name</p>
              <p className="font-bold text-lg text-white leading-tight mt-0.5">{data.fullName}</p>
            </div>
            
            {/* Dates & Timing */}
            <div className="pt-2 border-t border-slate-700/50 space-y-1">
              <p className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-400 shrink-0" />
                <span>November 6, 7, 8, 2026</span>
              </p>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-400 shrink-0" />
                <span>10:00 AM - 5:00 PM IST (Daily)</span>
              </p>
            </div>

            {/* Mode & Payment Option */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mode</p>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                  isOnline 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {data.mode} ({data.fee})
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</p>
                <span className="inline-block text-[11px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md mt-0.5 border border-green-500/20">
                  {data.payOffline ? 'Pay at Desk' : 'Verified'}
                </span>
              </div>
            </div>

            {/* Registration ID */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pass ID</p>
              <div className="mt-0.5 font-mono text-sm font-bold bg-slate-900/90 text-indigo-300 px-2.5 py-1 rounded-lg inline-block border border-indigo-500/30">
                {data.registrationId}
              </div>
            </div>
            
            {/* Contact details */}
            <div className="pt-2 border-t border-slate-700/50 space-y-0.5">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                <Mail size={11} className="text-slate-500 shrink-0" />
                <span className="truncate">{data.email}</span>
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Phone size={11} className="text-slate-500 shrink-0" />
                <span>{data.phone}</span>
              </p>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-md shrink-0 border border-slate-200">
            <QRCodeSVG 
              value={verifyUrl}
              size={110}
              level={"H"}
              includeMargin={false}
            />
            <p className="text-[10px] text-slate-800 font-extrabold mt-1.5 tracking-wider uppercase">
              SCAN TO VERIFY
            </p>
          </div>
        </div>
      </div>
      
      {/* Ticket Footer */}
      <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex flex-col gap-1 text-[11px]">
        <div className="flex justify-between items-center text-slate-400">
          <span>Admit One Participant</span>
          <span className="text-indigo-400 font-mono font-medium">Techmiya EdTech</span>
        </div>
        <p className="text-[10px] text-slate-400 text-center">
          Confirmation sent to {data.email}
        </p>
      </div>
    </div>
  );
}
