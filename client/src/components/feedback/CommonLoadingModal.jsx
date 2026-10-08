// LoadingModal.jsx - Professional Loading Modal (No external deps)
import React from "react";
import { Loader2 } from "lucide-react";

/**
 * @param {boolean} isLoading - Show/hide modal
 * @param {string} message - Loading text
 * @param {boolean} showProgress - Show progress bar
 * @param {number} progress - Progress value (0-100)
 * @param {string} variant - 'spinner' or 'dots' (default: 'spinner')
 */
const LoadingModal = ({
  isLoading,
  message = "Loading...",
  showProgress = false,
  progress = 0,
  variant = "spinner",
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        {/* Spinner or Dots */}
        <div className="flex justify-center mb-4">
          {variant === "spinner" ? (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          ) : (
            <div className="flex space-x-2">
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          )}
        </div>

        {/* Message */}
        <p className="text-gray-800 font-medium text-lg">{message}</p>

        {/* Optional Progress Bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;