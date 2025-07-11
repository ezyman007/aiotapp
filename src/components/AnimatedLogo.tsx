"use client";
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  className?: string;
}

export function AnimatedLogo({ className = "" }: AnimatedLogoProps) {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add entrance animation
    if (logoRef.current) {
      logoRef.current.style.opacity = '0';
      logoRef.current.style.transform = 'scale(0.8) rotateY(180deg)';
      
      setTimeout(() => {
        if (logoRef.current) {
          logoRef.current.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
          logoRef.current.style.opacity = '1';
          logoRef.current.style.transform = 'scale(1) rotateY(0deg)';
        }
      }, 300);
    }
  }, []);

  return (
    <div ref={logoRef} className={`flex items-center gap-3 ${className}`}>
      {/* 3D IoT Cube */}
      <div className="relative">
        <motion.div
          className="w-12 h-12 relative transform-style-preserve-3d"
          animate={{
            rotateY: [0, 360],
            rotateX: [0, 15, 0],
          }}
          transition={{
            rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
            rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* Cube faces */}
          <div className="absolute w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 transform rotateY-0 translateZ-6 border-2 border-white/20 shadow-lg" />
          <div className="absolute w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 transform rotateY-90 translateZ-6 border-2 border-white/20 shadow-lg" />
          <div className="absolute w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 transform rotateY-180 translateZ-6 border-2 border-white/20 shadow-lg" />
          <div className="absolute w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 transform rotateY-270 translateZ-6 border-2 border-white/20 shadow-lg" />
          <div className="absolute w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 transform rotateX-90 translateZ-6 border-2 border-white/20 shadow-lg" />
          <div className="absolute w-12 h-12 bg-gradient-to-br from-yellow-500 to-green-500 transform rotateX-270 translateZ-6 border-2 border-white/20 shadow-lg" />
          
          {/* IoT Circuit Lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/40 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white/60 rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
        
        {/* Floating particles */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full"
          animate={{
            y: [0, 8, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      {/* AI Brain Icon */}
      <div className="relative">
        <motion.div
          className="w-10 h-10 relative"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Neural Network Nodes */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 relative">
              {/* Central node */}
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              
              {/* Connected nodes */}
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 animate-ping" />
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2 animate-ping" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-1/2 left-0 w-2 h-2 bg-pink-400 rounded-full transform -translate-y-1/2 animate-ping" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-0 w-2 h-2 bg-yellow-400 rounded-full transform -translate-y-1/2 animate-ping" style={{ animationDelay: '1.5s' }} />
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 32">
                <motion.path
                  d="M16 8 L16 16 M16 16 L16 24 M16 16 L8 16 M16 16 L24 16"
                  stroke="rgba(59, 130, 246, 0.6)"
                  strokeWidth="1"
                  fill="none"
                  animate={{
                    strokeDasharray: [0, 20, 0],
                    strokeDashoffset: [0, -20, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Text with gradient and glow */}
      <div className="flex flex-col">
        <motion.h1
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
          animate={{
            textShadow: [
              "0 0 20px rgba(59, 130, 246, 0.5)",
              "0 0 30px rgba(147, 51, 234, 0.5)",
              "0 0 20px rgba(59, 130, 246, 0.5)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          AIoT SensorHub
        </motion.h1>
        <motion.div
          className="text-xs text-gray-600 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          IoT & AI Analytics Platform
        </motion.div>
      </div>
    </div>
  );
} 