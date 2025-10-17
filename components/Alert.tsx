
import React from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const baseClasses = "p-4 rounded-md shadow-md mb-4 flex justify-between items-center";
  const typeClasses = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-sky-600 text-white",
    warning: "bg-yellow-500 text-black",
  };

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
      )}
    </div>
  );
};

export default Alert;
