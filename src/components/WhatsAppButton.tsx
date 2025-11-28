import { MessageCircle } from "lucide-react";
import { useState } from "react";

const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappNumber =
    import.meta.env.VITE_APP_WHATSAPP_CONTACT_NO || "+918340764515";

  // Default message to send
  const defaultMessage =
    "Hello! I'm interested in your products. Can you help me with more information?";

  const handleWhatsAppClick = () => {
    // Remove any + or spaces from the number for WhatsApp API
    const cleanNumber = whatsappNumber.replace(/\D/g, "");

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      defaultMessage
    )}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 group"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        {/* Animated Background Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110"></div>

        {/* Pulse Animation on Hover */}
        {isHovered && (
          <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"></div>
        )}

        {/* Content */}
        <div className="relative flex items-center justify-center w-16 h-16 md:w-14 md:h-14 rounded-full">
          <MessageCircle className="w-8 h-8 md:w-7 md:h-7 text-white" />
        </div>

        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap transition-all duration-300 pointer-events-none ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          Chat with us!
          <div className="absolute top-full right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </button>

      {/* Mobile Badge Animation */}
      {!isHovered && (
        <div className="fixed bottom-28 right-6 md:bottom-32 md:right-8 z-40 animate-bounce">
          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Chat
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
