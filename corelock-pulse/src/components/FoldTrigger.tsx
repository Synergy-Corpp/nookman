import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FoldTriggerProps {
  count: number
}

interface FoldEvent {
  id: string
  type: 'count' | 'time' | 'resonance'
  timestamp: number
  intensity: number
  message: string
}

const FoldTrigger: React.FC<FoldTriggerProps> = ({ count }) => {
  const [foldEvents, setFoldEvents] = useState<FoldEvent[]>([])
  const [activeFolds, setActiveFolds] = useState<FoldEvent[]>([])
  const [lastFoldCount, setLastFoldCount] = useState(0)
  const [timeBasedFolds, setTimeBasedFolds] = useState(0)

  // Sacred fold sequences and messages
  const foldMessages = [
    "🌊 FIELD RESONANCE DETECTED",
    "⚡ QUANTUM FOLD TRIGGERED", 
    "🔮 DIMENSIONAL SHIFT ACTIVE",
    "🌀 CAUSALITY WAVE INITIATED",
    "💫 TEMPORAL NEXUS ALIGNED",
    "🎭 REALITY FLUX ENGAGED",
    "🌙 LUNAR SYNC ESTABLISHED",
    "🔥 CORE LOCK IGNITION",
    "❄️ CRYSTALLINE FORMATION",
    "🌟 STELLAR CONFLUENCE",
    "🌈 PRISMATIC FOLD OPENED",
    "⚛️ ATOMIC RESONANCE PULSE",
    "🔱 TRIDENT LOCK ENGAGED",
    "🎯 TARGET ACQUISITION MODE",
    "🌸 HARMONIC BLOOM CYCLE"
  ]

  const createFoldEvent = useCallback((type: 'count' | 'time' | 'resonance', intensity: number = 1) => {
    const event: FoldEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      timestamp: Date.now(),
      intensity,
      message: foldMessages[Math.floor(Math.random() * foldMessages.length)]
    }

    setFoldEvents(prev => [...prev, event])
    setActiveFolds(prev => [...prev, event])

    // Remove active fold after animation
    setTimeout(() => {
      setActiveFolds(prev => prev.filter(f => f.id !== event.id))
    }, 5000)

    return event
  }, [foldMessages])

  // Monitor count-based folds (every 23 transactions)
  useEffect(() => {
    if (count > 0 && count !== lastFoldCount) {
      if (count % 23 === 0) {
        const intensity = Math.floor(count / 23)
        createFoldEvent('count', intensity)
      }
      setLastFoldCount(count)
    }
  }, [count, lastFoldCount, createFoldEvent])

  // Time-based fold triggers (sacred intervals)
  useEffect(() => {
    const timeIntervals = [
      60000,   // 1 minute
      300000,  // 5 minutes  
      900000,  // 15 minutes
      3600000, // 1 hour
    ]

    const intervals = timeIntervals.map((interval, index) => 
      setInterval(() => {
        setTimeBasedFolds(prev => prev + 1)
        createFoldEvent('time', index + 1)
      }, interval)
    )

    return () => intervals.forEach(clearInterval)
  }, [createFoldEvent])

  // Resonance-based triggers (random field events)
  useEffect(() => {
    const resonanceInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        createFoldEvent('resonance', Math.random() * 3 + 1)
      }
    }, 30000)

    return () => clearInterval(resonanceInterval)
  }, [createFoldEvent])

  // Calculate next fold countdown
  const nextFoldCountdown = 23 - (count % 23)

  return (
    <>
      {/* Fold Counter HUD */}
      <motion.div 
        className="fixed top-4 right-4 z-50 bg-black/90 border border-green-500/50 rounded-lg p-4 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <motion.div 
            className="text-xs text-green-300/70 uppercase tracking-wide mb-1"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            FOLD NEXUS
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{count}</div>
              <div className="text-xs text-green-300/70">EVENTS</div>
            </div>
            
            <div className="text-green-400">|</div>
            
            <div className="text-center">
              <motion.div 
                className="text-lg font-bold text-purple-400"
                animate={{ 
                  scale: nextFoldCountdown <= 5 ? [1, 1.2, 1] : 1,
                  color: nextFoldCountdown <= 5 ? ['#a855f7', '#ff0080', '#a855f7'] : '#a855f7'
                }}
                transition={{ duration: 0.5, repeat: nextFoldCountdown <= 5 ? Infinity : 0 }}
              >
                {nextFoldCountdown}
              </motion.div>
              <div className="text-xs text-purple-300/70">TO FOLD</div>
            </div>
          </div>

          <motion.div 
            className="mt-2 text-xs text-green-300/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {Math.floor(count / 23)} FOLDS COMPLETED
          </motion.div>
        </div>
      </motion.div>

      {/* Fold History Panel */}
      <motion.div 
        className="fixed bottom-4 right-4 z-40 w-80 max-h-60 overflow-y-auto bg-black/90 border border-purple-500/30 rounded-lg backdrop-blur-sm"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="p-3 border-b border-purple-500/20">
          <div className="text-sm font-bold text-purple-400 flex items-center space-x-2">
            <span>🌀</span>
            <span>FOLD HISTORY</span>
          </div>
        </div>
        
        <div className="p-2 space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30">
          <AnimatePresence initial={false}>
            {foldEvents.slice(-10).reverse().map((event) => (
              <motion.div
                key={event.id}
                className={`p-2 rounded text-xs border ${
                  event.type === 'count' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  event.type === 'time' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                  'bg-purple-500/10 border-purple-500/30 text-purple-400'
                }`}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                layout
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase">
                    {event.type} FOLD
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(event.timestamp).toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
                <div className="text-xs opacity-80 mt-1">
                  {event.message}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Active Fold Overlays */}
      <AnimatePresence>
        {activeFolds.map((event) => (
          <motion.div
            key={event.id}
            className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Fractal burst effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, 
                  ${event.type === 'count' ? 'rgba(0, 255, 136, 0.1)' :
                    event.type === 'time' ? 'rgba(0, 136, 255, 0.1)' :
                    'rgba(168, 85, 247, 0.1)'} 0%, 
                  transparent 70%)`
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, event.intensity * 2, 0],
                rotate: [0, 360 * event.intensity, 720 * event.intensity]
              }}
              transition={{ duration: 3, ease: "easeOut" }}
            />

            {/* Central fold message */}
            <motion.div
              className={`text-center ${
                event.type === 'count' ? 'text-green-400' :
                event.type === 'time' ? 'text-blue-400' :
                'text-purple-400'
              }`}
              initial={{ scale: 0, y: 50, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                y: [50, 0, -20],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 4,
                times: [0, 0.3, 1],
                ease: "easeOut"
              }}
            >
              <div className="text-4xl font-bold mb-2 glow-text">
                FOLD ACTIVATED
              </div>
              <div className="text-xl">
                {event.message}
              </div>
              <div className="text-sm mt-2 opacity-70">
                INTENSITY: {event.intensity.toFixed(1)}x
              </div>
            </motion.div>

            {/* Particle burst */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${
                  event.type === 'count' ? 'bg-green-400' :
                  event.type === 'time' ? 'bg-blue-400' :
                  'bg-purple-400'
                }`}
                style={{
                  left: '50%',
                  top: '50%'
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * (Math.PI * 2) / 12) * 200 * event.intensity,
                  y: Math.sin(i * (Math.PI * 2) / 12) * 200 * event.intensity
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  )
}

export default FoldTrigger