import { motion } from 'framer-motion';

export default function Loader({ message = "Processing..." }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-slate-300 font-medium animate-pulse">{message}</p>
    </div>
  );
}
