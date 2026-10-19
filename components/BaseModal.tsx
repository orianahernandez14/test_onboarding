import React, { useEffect } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} relative`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};