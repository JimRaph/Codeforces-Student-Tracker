import type  { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
       bg-black bg-opacity-50 "
      onClick={onClose} // close on backdrop click
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative
        dark:bg-gray-800 "
        onClick={e => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-50">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
          >
            &#x2715;
          </button>
        </header>
        <div className="p-6 ">{children}</div>
      </div>
    </div>
  );
}
