// CommonModal.jsx
import  { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Professional Modal Component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal closes
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} closeOnBackdrop - Close when clicking outside (default true)
 * @param {boolean} showCloseButton - Show close button in header (default true)
 * @param {string} className - Additional custom classes
 */
const CommonModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
  showCloseButton = true,
  className = "",
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Size mapping
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw] w-full",
  };

  // Close handlers
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Focus trap: keep focus inside modal
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative w-full ${sizeClasses[size]} 
          bg-white dark:bg-gray-900 rounded-2xl shadow-2xl 
          transform transition-all duration-300 ease-out
          animate-in fade-in zoom-in
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2
            id="modal-title"
            className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100"
          >
            {title}
          </h2>

          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Close modal"
            >
              <X size={22} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Optional Footer can be added by passing footer prop, but keeping it flexible */}
      </div>
    </div>
  );
};

export default CommonModal;