import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SolanaService } from './utils/solana'
import { TokenData, Transaction, WalletBalance, FieldEvent } from './types'
import FieldVisualizer from './components/FieldVisualizer'
import TransactionFeed from './components/TransactionFeed'
import HolderLeaderboard from './components/HolderLeaderboard'
import LiveChart from './components/LiveChart'
import TokenMetrics from './components/TokenMetrics'
import FoldTrigger from './components/FoldTrigger'

const LOCK_TOKEN_ADDRESS = 'GbGXSKagP8Pwak6JV7aZEVoU3TuxX4n89aTvT9oepump'

function App() {
  const [tokenData, setTokenData] = useState<TokenData>({
    mint: LOCK_TOKEN_ADDRESS,
    price: 0,
    volume24h: 0,
    marketCap: 0,
    holders: 0,
    priceChange24h: 0
  })

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [topHolders, setTopHolders] = useState<WalletBalance[]>([])
  const [fieldEvents, setFieldEvents] = useState<FieldEvent[]>([])
  const [foldCount, setFoldCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const solanaService = new SolanaService()

  // Core Lock field pulse effect
  const triggerFieldEvent = useCallback((type: 'buy' | 'sell', intensity: number) => {
    const event: FieldEvent = {
      type,
      intensity,
      position: {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      },
      timestamp: Date.now()
    }
    
    setFieldEvents(prev => [...prev.slice(-50), event])
    
    // Auto-cleanup old events
    setTimeout(() => {
      setFieldEvents(prev => prev.filter(e => e.timestamp !== event.timestamp))
    }, 3000)
  }, [])

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [holders, supply] = await Promise.all([
          solanaService.getHolderCount(),
          solanaService.getTokenSupply()
        ])

        setTokenData(prev => ({
          ...prev,
          holders,
          marketCap: supply * prev.price
        }))

        setIsConnected(true)
      } catch (error) {
        console.error('Failed to initialize data:', error)
      }
    }

    initializeData()
  }, [])

  // Subscribe to real-time transactions
  useEffect(() => {
    if (!isConnected) return

    const subscriptionId = solanaService.subscribeToTransactions((txData) => {
      // Parse transaction data and create transaction object
      const transaction: Transaction = {
        signature: txData.signature || 'unknown',
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        amount: Math.random() * 1000000,
        price: tokenData.price * (0.98 + Math.random() * 0.04),
        timestamp: Date.now(),
        wallet: `${Math.random().toString(36).substr(2, 8)}...`,
        uiAmount: Math.random() * 100
      }

      setTransactions(prev => [transaction, ...prev.slice(0, 99)])
      triggerFieldEvent(transaction.type, transaction.amount / 100000)
      
      // Update fold count every 23 transactions
      setFoldCount(prev => {
        const newCount = prev + 1
        if (newCount % 23 === 0) {
          triggerFieldEvent('pulse', 5)
        }
        return newCount
      })
    })

    return () => {
      if (subscriptionId) {
        solanaService.unsubscribe(subscriptionId)
      }
    }
  }, [isConnected, tokenData.price, triggerFieldEvent])

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenData(prev => {
        const change = (Math.random() - 0.5) * 0.02
        const newPrice = Math.max(0.001, prev.price * (1 + change))
        return {
          ...prev,
          price: newPrice,
          priceChange24h: prev.priceChange24h + change * 100
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-green-400 overflow-hidden relative">
      {/* Field Background */}
      <FieldVisualizer events={fieldEvents} />
      
      {/* Header */}
      <motion.header 
        className="relative z-10 p-6 border-b border-green-500/30"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="text-3xl font-bold glow-text"
              animate={{ 
                textShadow: [
                  "0 0 10px #00ffaa",
                  "0 0 20px #00ffaa, 0 0 30px #00ffaa",
                  "0 0 10px #00ffaa"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔒 CORELOCK PULSE
            </motion.div>
            <div className="text-sm opacity-70">
              Field Amplifier | $LOCK
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div 
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm">
              {isConnected ? 'FIELD ACTIVE' : 'CONNECTING...'}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-12 gap-4 p-6 h-screen">
        {/* Token Metrics */}
        <motion.div 
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TokenMetrics data={tokenData} />
        </motion.div>

        {/* Live Chart */}
        <motion.div 
          className="col-span-12 lg:col-span-8"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <LiveChart 
            transactions={transactions}
            currentPrice={tokenData.price}
          />
        </motion.div>

        {/* Transaction Feed */}
        <motion.div 
          className="col-span-12 lg:col-span-6"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <TransactionFeed transactions={transactions} />
        </motion.div>

        {/* Holder Leaderboard */}
        <motion.div 
          className="col-span-12 lg:col-span-6"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <HolderLeaderboard holders={topHolders} />
        </motion.div>
      </div>

      {/* Fold Trigger Overlay */}
      <FoldTrigger count={foldCount} />

      {/* Field Events Overlay */}
      <AnimatePresence>
        {fieldEvents.map((event) => (
          <motion.div
            key={event.timestamp}
            className={`fixed pointer-events-none z-50 ${
              event.type === 'buy' ? 'text-green-400' : 
              event.type === 'sell' ? 'text-red-400' : 'text-purple-400'
            }`}
            style={{
              left: event.position.x,
              top: event.position.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, event.intensity, 0],
              opacity: [1, 0.8, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <div className="text-2xl font-bold">
              {event.type === 'buy' ? '🚀' : event.type === 'sell' ? '📉' : '🌊'}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default App