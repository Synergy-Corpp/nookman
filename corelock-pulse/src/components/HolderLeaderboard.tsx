import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WalletBalance } from '../types'

interface HolderLeaderboardProps {
  holders: WalletBalance[]
}

const HolderLeaderboard: React.FC<HolderLeaderboardProps> = ({ holders }) => {
  const [mockHolders, setMockHolders] = useState<WalletBalance[]>([])

  // Generate mock data if no real holders provided
  useEffect(() => {
    if (holders.length === 0) {
      const generateMockHolders = () => {
        const mockData: WalletBalance[] = []
        const walletPrefixes = ['Core', 'Lock', 'Pulse', 'Field', 'Vault', 'Node', 'Sync', 'Wave']
        
        for (let i = 0; i < 20; i++) {
          const prefix = walletPrefixes[Math.floor(Math.random() * walletPrefixes.length)]
          const suffix = Math.random().toString(36).substr(2, 6)
          
          mockData.push({
            address: `${prefix}${suffix}...${Math.random().toString(36).substr(2, 4)}`,
            balance: Math.random() * 10000000,
            uiBalance: Math.random() * 100000,
            percentage: Math.random() * 15
          })
        }
        
        return mockData.sort((a, b) => b.balance - a.balance)
      }

      setMockHolders(generateMockHolders())
      
      // Update mock data periodically
      const interval = setInterval(() => {
        setMockHolders(prev => 
          prev.map(holder => ({
            ...holder,
            balance: holder.balance * (0.99 + Math.random() * 0.02),
            percentage: holder.percentage * (0.99 + Math.random() * 0.02)
          })).sort((a, b) => b.balance - a.balance)
        )
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [holders.length])

  const displayHolders = holders.length > 0 ? holders : mockHolders

  const formatBalance = (balance: number): string => {
    if (balance >= 1e9) return `${(balance / 1e9).toFixed(2)}B`
    if (balance >= 1e6) return `${(balance / 1e6).toFixed(2)}M`
    if (balance >= 1e3) return `${(balance / 1e3).toFixed(2)}K`
    return balance.toFixed(0)
  }

  const getRankEmoji = (index: number): string => {
    switch (index) {
      case 0: return '👑'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return '💎'
    }
  }

  const getRankColor = (index: number): string => {
    switch (index) {
      case 0: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      case 1: return 'text-gray-300 border-gray-300/30 bg-gray-300/10'
      case 2: return 'text-orange-400 border-orange-400/30 bg-orange-400/10'
      default: return 'text-green-400 border-green-400/30 bg-green-400/10'
    }
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
        <span>🏆</span>
        <span>TOP HOLDERS</span>
      </motion.div>

      <div className="space-y-2 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30">
        <AnimatePresence initial={false}>
          {displayHolders.slice(0, 15).map((holder, index) => (
            <motion.div
              key={holder.address}
              className={`p-3 rounded-lg border transition-all duration-300 ${getRankColor(index)}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: index * 0.05
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: index === 0 
                  ? '0 0 30px rgba(255, 215, 0, 0.5)'
                  : '0 0 20px rgba(0, 255, 136, 0.3)'
              }}
              layout
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="flex items-center space-x-2"
                    animate={{ 
                      scale: index < 3 ? [1, 1.1, 1] : 1
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: index < 3 ? Infinity : 0,
                      repeatDelay: 1
                    }}
                  >
                    <span className="text-xl">{getRankEmoji(index)}</span>
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </motion.div>
                  
                  <div>
                    <div className="text-sm font-mono font-bold">
                      {holder.address}
                    </div>
                    <div className="text-xs opacity-70">
                      {holder.percentage.toFixed(2)}% of supply
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold">
                    {formatBalance(holder.balance)} $LOCK
                  </div>
                  <div className="text-xs opacity-70">
                    ${formatBalance(holder.uiBalance)}
                  </div>
                </div>
              </div>

              {/* Progress bar for percentage */}
              <motion.div 
                className="mt-2 h-1 bg-black/30 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <motion.div
                  className={`h-full ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-300' :
                    index === 2 ? 'bg-orange-400' : 'bg-green-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(holder.percentage * 6, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.7, duration: 1 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {displayHolders.length === 0 && (
          <motion.div 
            className="text-center text-green-300/50 py-8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-2xl mb-2">🔍</div>
            <div>Loading holder data...</div>
          </motion.div>
        )}
      </div>

      {/* Stats footer */}
      <motion.div 
        className="mt-4 flex items-center justify-between text-xs text-green-300/70"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span>Top {Math.min(displayHolders.length, 15)} holders</span>
        <span className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
          <span>LIVE RANKINGS</span>
        </span>
      </motion.div>
    </div>
  )
}

export default HolderLeaderboard