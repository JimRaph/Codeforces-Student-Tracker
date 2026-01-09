import  { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      {message}
    </div>
  );
}
