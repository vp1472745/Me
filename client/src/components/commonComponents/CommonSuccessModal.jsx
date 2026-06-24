import React from "react";
import { CheckCircle, X } from "lucide-react";

/**
 * SuccessModal – Shows a centered modal with a success message.
 *
 * @param {boolean} isOpen - Controls visibility
 * @param {function} onClose - Called when modal should close (clicking overlay, close button, or OK)
 * @param {string} title - Main heading (e.g. "Success!")
 * @param {string} message - Detailed success message
 * @param {string} buttonText - Text for the confirm/close button (default: "OK")
 * @param {number} autoCloseDelay - Auto‑close after X ms (optional, 0 = no auto‑close)
 */
const SuccessModal = ({
  isOpen,
  onClose,
  title = "Success!",
  message = "Operation completed successfully.",
  buttonText = "OK",
  autoCloseDelay = 0,
}) => {
  if (!isOpen) return null;

  // Auto‑close functionality
  React.useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose} // Clicking overlay closes modal
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close button (optional) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#3B4953] mb-2">{title}</h2>

        {/* Message */}
        <p className="text-sm text-[#3B4953]/80 mb-6">{message}</p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#5A7863] hover:bg-[#4a6352] text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;