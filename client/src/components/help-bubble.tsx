import { useState } from 'react';
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
  
  // Determine position classes
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2'
  };
  
  // Determine animation variants based on position
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
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
            className={`absolute z-50 w-64 bg-card border border-border shadow-lg rounded-lg p-4 ${positionClasses[position]}`}
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