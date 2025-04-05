import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpBubbleProps {
  content: React.ReactNode;
  title?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  icon?: React.ReactNode;
}

export function HelpBubble({ 
  content, 
  title, 
  position = 'top', 
  className = '',
  icon = <HelpCircle className="h-5 w-5" />
}: HelpBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use refs to calculate the position
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({top: 0, left: 0});
  
  // Calculate position when button is clicked
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      
      // Calculate position based on the position prop
      switch(position) {
        case 'top':
          top = rect.top - 200; // Above the button, full tooltip height
          left = rect.left + (rect.width / 2) - 128; // 128 is half of tooltip width
          break;
        case 'bottom':
          top = rect.bottom + 8; // Below the button
          left = rect.left + (rect.width / 2) - 128;
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - 100; // Centered vertically
          left = rect.left - 272; // Left of button (w-64 = 256px + 16px margin)
          break;
        case 'right':
          top = rect.top - 10; // Slightly above the button for better visibility
          left = rect.right + 16; // Right of button with gap
          break;
      }
      
      // Ensure the tooltip remains in viewport
      const padding = 16; // Distance from edge of viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 256; // w-64 = 256px
      const tooltipHeight = 200; // Approximate height
      
      // Adjust if too far left
      if (left < padding) left = padding;
      // Adjust if too far right
      if (left + tooltipWidth > viewportWidth - padding) 
        left = viewportWidth - tooltipWidth - padding;
      // Adjust if too high
      if (top < padding) top = padding;
      // Adjust if too low
      if (top + tooltipHeight > viewportHeight - padding)
        top = viewportHeight - tooltipHeight - padding;
      
      setTooltipPosition({top, left});
    }
  }, [isOpen, position]);
  
  // We don't need positionClasses anymore
  const positionClasses = {
    top: '',
    right: '',
    bottom: '',
    left: ''
  };
  
  // Simplified animation for the fixed positioned tooltip
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.15
      }
    }
  };
  
  // Add a bounce animation to the help icon when not open
  const iconVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: 2
        }
      }
    }
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary bg-primary/10 rounded-full p-1 flex items-center justify-center hover:bg-primary/20 transition-colors"
        variants={iconVariants}
        initial="idle"
        whileHover="hover"
        aria-label="Help"
      >
        {icon}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-[100] w-64 bg-white border border-border shadow-lg rounded-lg p-4"
            style={{ 
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`
            }}
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="tooltip"
          >
            <div className="flex justify-between items-start mb-2">
              {title && <h4 className="font-semibold text-card-title">{title}</h4>}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 -mr-1 -mt-1" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4 text-card-text" />
              </Button>
            </div>
            <div className="text-sm text-card-text">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}