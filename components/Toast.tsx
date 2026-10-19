
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 bg-emerald-500 text-white py-2 px-4 rounded-md shadow-lg flex items-center animate-fade-in-down">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

// Add keyframes for animation in index.html or a global style if needed.
// For simplicity, we can add it directly in index.html's style tag.
// We'll rely on Tailwind's default animation capabilities if possible, but custom animations are better.
// The CSS for this would be:
/*
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate3d(0, -20%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
.animate-fade-in-down {
  animation: fadeInDown 0.5s ease-out forwards;
}
*/