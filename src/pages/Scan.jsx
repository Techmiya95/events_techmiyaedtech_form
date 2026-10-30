import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Scan() {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only initialize scanner if we haven't successfully scanned yet
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(
      (result) => {
        scanner.clear();
        setScanResult(result);
        
        try {
          // Check for URL formats (both direct pathname and HashRouter hashes)
          if (result.includes('/verify/')) {
            const parts = result.split('/verify/');
            const passId = parts[1]?.split(/[?#&]/)[0];
            if (passId) {
              toast.success("QR Code Scanned!");
              navigate(`/verify/${passId}`);
              return;
            }
          }

          // Direct ID string match
          if (result.startsWith('EVT-') || result.startsWith('REG-') || result.startsWith('FM2026-')) {
            toast.success("QR Code Scanned!");
            navigate(`/verify/${result}`);
            return;
          }

          toast.error("Invalid Event QR Code format");
          setScanResult(null);
        } catch (e) {
          toast.error("Could not parse scanned QR code");
          setScanResult(null);
        }
      },
      (error) => {
        // Ignored scanner polling tick
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner: ", error);
      });
    };
  }, [scanResult, navigate]);

  return (
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col items-center">
      <div className="text-center mb-8">
        <QrCode size={48} className="mx-auto text-indigo-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2 text-white">Scan Entry Pass</h1>
        <p className="text-slate-400 text-sm">Position the attendee's QR code within the frame to verify entry.</p>
      </div>

      <div className="w-full glass-panel p-4 rounded-3xl overflow-hidden border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
        {!scanResult ? (
          <div id="reader" className="w-full bg-slate-900 rounded-2xl overflow-hidden scanner-container"></div>
        ) : (
          <div className="p-10 text-center text-green-400 font-medium animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
            Verifying entry pass...
          </div>
        )}
      </div>
      
      <div className="mt-8 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-200 text-xs leading-relaxed">
        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
        <p>Ensure you have granted camera permissions. If the camera preview does not load, try refreshing the page or using Google Chrome / Safari.</p>
      </div>
    </div>
  );
}
