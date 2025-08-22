import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Transaction } from '../types'

interface TransactionFeedProps {
  transactions: Transaction[]
}

const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  const formatAmount = (amount: number): string => {
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`
    return amount.toFixed(0)
  }

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    return `${Math.floor(seconds / 3600)}h`
  }

  return (
    <div className="bg-black/80 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm h-96 overflow-hidden">
      <motion.div 
        className="text-xl font-bold text-green-400 mb-4 flex items-center space-x-2"
        animate={{ 
          textShadow: [
            "0 0 5px #00ff88",
            "0 0 15px #00ff88",
            "0 0 5px #00ff88"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>⚡</span>
        <span>LIVE FEED</span>
      </motion.div>

      <div className="space-y-2 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30">
        <AnimatePresence initial={false}>
          {transactions.slice(0, 50).map((tx) => (
            <motion.div
              key={tx.signature}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                tx.type === 'buy' 
                  ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                  : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
              }`}
              initial={{ 
                opacity: 0, 
                y: -20, 
                scale: 0.95,
                boxShadow: '0 0 0px rgba(0, 255, 136, 0)'
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                boxShadow: tx.type === 'buy' 
                  ? '0 0 20px rgba(0, 255, 136, 0.3)'
                  : '0 0 20px rgba(255, 0, 0, 0.3)'
              }}
              exit={{ 
                opacity: 0, 
                y: 20, 
                scale: 0.95 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: tx.type === 'buy' 
                  ? '0 0 30px rgba(0, 255, 136, 0.5)'
                  : '0 0 30px rgba(255, 0, 0, 0.5)'
              }}
              layout
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className={`text-2xl ${
                      tx.type === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: tx.type === 'buy' ? [0, 10, 0] : [0, -10, 0]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {tx.type === 'buy' ? '🚀' : '📉'}
                  </motion.div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold uppercase ${
                        tx.type === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-xs text-green-300/70">
                        {formatAmount(tx.uiAmount)} $LOCK
                      </span>
                    </div>
                    
                    <div className="text-xs text-green-300/50 font-mono">
                      {tx.wallet}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    tx.type === 'buy' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${tx.price.toFixed(6)}
                  </div>
                  <div className="text-xs text-green-300/50">
                    {formatTimeAgo(tx.timestamp)}
                  </div>
                </div>
              </div>

              {/* Pulse effect overlay */}
              <motion.div
                className={`absolute inset-0 rounded-lg ${
                  tx.type === 'buy' ? 'bg-green-400' : 'bg-red-400'
                }`}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={{ pointerEvents: 'none' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {transactions.length === 0 && (
          <motion.div 
            className="text-center text-green-300/50 py-8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-2xl mb-2">🔍</div>
            <div>Scanning for transactions...</div>
          </motion.div>
        )}
      </div>

      {/* Feed stats */}
      <motion.div 
        className="mt-4 flex items-center justify-between text-xs text-green-300/70"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span>{transactions.length} transactions tracked</span>
        <span className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
          <span>REAL-TIME</span>
        </span>
      </motion.div>
    </div>
  )
}

export default TransactionFeed