import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyAttendee, markAttendance } from '../services/api';
import Loader from '../components/Loader';
import { CheckCircle, XCircle, Clock, UserCheck, MapPin, Briefcase, GraduationCap, Calendar, Mail, Phone, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Verify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const result = await verifyAttendee(id);
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || "Registration not found.");
        }
      } catch (err) {
        setError("Failed to verify attendee. Please check network connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleMarkPresent = async () => {
    setMarking(true);
    try {
      const result = await markAttendance(id);
      if (result.success) {
        toast.success("Attendance marked successfully!");
        setData(prev => ({ ...prev, attendanceStatus: 'Present' }));
      } else {
        toast.error(result.error || "Failed to mark attendance.");
      }
    } catch (err) {
      toast.error("An error occurred while updating attendance.");
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-20 flex flex-col items-center justify-center">
        <Loader message="Verifying event registration pass..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 glass-panel rounded-3xl text-center border border-red-500/20">
        <XCircle size={56} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-white">Verification Failed</h2>
        <p className="text-slate-400 mb-6 text-sm">{error}</p>
        <button 
          onClick={() => navigate('/scan')} 
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-white font-medium transition-all"
        >
          Scan Another QR
        </button>
      </div>
    );
  }

  const isPresent = data.attendanceStatus === 'Present';

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="glass-panel rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-indigo-900/60 p-6 text-center border-b border-white/10">
          <p className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-1">
            GATE ENTRY VERIFICATION
          </p>
          <h2 className="text-2xl font-black text-white">{data.event || "Event Pass"}</h2>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          {/* Status Header */}
          <div className="flex justify-between items-center pb-6 border-b border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Check-in Status</p>
              {isPresent ? (
                <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-3.5 py-1.5 rounded-full text-sm border border-green-500/20">
                  <CheckCircle size={16} /> Verified & Present
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-400/10 px-3.5 py-1.5 rounded-full text-sm border border-amber-500/20">
                  <Clock size={16} /> Entry Pending
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Pass ID</p>
              <p className="font-mono text-base font-bold text-indigo-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700">
                {data.registrationId}
              </p>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Candidate Name</p>
              <p className="text-xl font-bold text-white mt-0.5">{data.fullName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Candidate Type</p>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 mt-1 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  {data.candidateType === 'Student' ? <GraduationCap size={15} /> : <Briefcase size={15} />}
                  <span>{data.candidateType || 'Attendee'}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Location / City</p>
                <p className="text-sm font-medium text-slate-200 mt-1 flex items-center gap-1.5">
                  <MapPin size={15} className="text-indigo-400 shrink-0" />
                  <span>{data.location || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Phone</p>
                <p className="text-sm font-mono text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-500" />
                  <span>{data.phone}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Email</p>
                <p className="text-sm text-slate-300 mt-0.5 truncate flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-500 shrink-0" />
                  <span className="truncate">{data.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mark Attendance Action */}
          {!isPresent && (
            <div className="pt-4">
              <button 
                onClick={handleMarkPresent}
                disabled={marking}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-xl shadow-green-600/25 active:scale-[0.98]"
              >
                {marking ? (
                  <span className="animate-pulse">Marking attendance...</span>
                ) : (
                  <>
                    <UserCheck size={20} />
                    <span>Confirm & Mark as Present</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button 
          onClick={() => navigate('/scan')} 
          className="text-slate-400 hover:text-white transition-colors text-sm underline inline-flex items-center gap-1.5"
        >
          <QrCode size={16} />
          Scan Next Attendee Pass
        </button>
      </div>
    </div>
  );
}
