import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Transaction, PricePoint } from '../types'

interface LiveChartProps {
  transactions: Transaction[]
  currentPrice: number
}

const LiveChart: React.FC<LiveChartProps> = ({ transactions, currentPrice }) => {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '1h' | '24h'>('5m')

  // Generate price history data
  useEffect(() => {
    const now = Date.now()
    const basePrice = 0.001 // Starting price

    // Initialize with historical data
    if (priceHistory.length === 0) {
      const initialData: PricePoint[] = []
      for (let i = 100; i >= 0; i--) {
        const timestamp = now - (i * 60000) // 1 minute intervals
        const variation = Math.sin(i * 0.1) * 0.0001 + (Math.random() - 0.5) * 0.0001
        initialData.push({
          timestamp,
          price: basePrice + variation,
          volume: Math.random() * 10000
        })
      }
      setPriceHistory(initialData)
    }

    // Add current price to history
    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const newPoint: PricePoint = {
          timestamp: Date.now(),
          price: currentPrice || prev[prev.length - 1]?.price || basePrice,
          volume: Math.random() * 10000
        }
        
        const updated = [...prev, newPoint]
        // Keep only last 200 points
        return updated.slice(-200)
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [currentPrice, priceHistory.length])

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    const now = Date.now()
    const timeframeMs = {
      '1m': 60000,
      '5m': 300000,
      '1h': 3600000,
      '24h': 86400000
    }[timeframe]

    return priceHistory.filter(point => now - point.timestamp <= timeframeMs)
  }, [priceHistory, timeframe])

  // Calculate price change
  const priceChange = useMemo(() => {
    if (filteredData.length < 2) return 0
    const first = filteredData[0].price
    const last = filteredData[filteredData.length - 1].price
    return ((last - first) / first) * 100
  }, [filteredData])

  // Format timestamp for display
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Get recent buy/sell markers
  const recentTrades = useMemo(() => {
    return transactions.slice(0, 10).map(tx => ({
      ...tx,
      chartX: (tx.timestamp - (filteredData[0]?.timestamp || 0)) / 
              (filteredData[filteredData.length - 1]?.timestamp - (filteredData[0]?.timestamp || 0)) * 100
    }))
  }, [transactions, filteredData])

  const timeframes = [
    { key: '1m', label: '1M' },
    { key: '5m', label: '5M' },
    { key: '1h', label: '1H' },
    { key: '24h', label: '24H' }
  ] as const

  return (
    <div className="bg-black/80 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className="text-xl font-bold text-green-400 flex items-center space-x-2"
          animate={{ 
            textShadow: [
              "0 0 5px #00ff88",
              "0 0 15px #00ff88",
              "0 0 5px #00ff88"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>📈</span>
          <span>PRICE FIELD</span>
        </motion.div>

        {/* Timeframe selector */}
        <div className="flex space-x-2">
          {timeframes.map(tf => (
            <motion.button
              key={tf.key}
              className={`px-3 py-1 text-xs rounded border transition-all ${
                timeframe === tf.key
                  ? 'bg-green-500/20 border-green-500/50 text-green-400'
                  : 'bg-black/50 border-green-500/20 text-green-300/70 hover:border-green-500/40'
              }`}
              onClick={() => setTimeframe(tf.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tf.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price display */}
      <div className="flex items-center space-x-4 mb-4">
        <motion.div 
          className="text-2xl font-bold text-green-400"
          animate={{ 
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          ${currentPrice.toFixed(6)}
        </motion.div>
        
        <motion.div 
          className={`px-2 py-1 rounded text-sm font-bold ${
            priceChange >= 0 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
          animate={{ 
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.3 }}
        >
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
        </motion.div>
      </div>

      {/* Chart container */}
      <div className="relative h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTime}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#4ade80' }}
            />
            <YAxis 
              domain={['dataMin - 0.00001', 'dataMax + 0.00001']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#4ade80' }}
              tickFormatter={(value) => value.toFixed(5)}
            />
            
            {/* Price line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#00ff88"
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: '#00ff88', 
                stroke: '#00ff88',
                strokeWidth: 2
              }}
            />

            {/* Current price reference line */}
            <ReferenceLine 
              y={currentPrice} 
              stroke="#00ffaa" 
              strokeDasharray="5 5"
              strokeWidth={1}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Trade markers overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {recentTrades.map((trade) => (
              <motion.div
                key={trade.signature}
                className={`absolute ${
                  trade.type === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}
                style={{
                  left: `${trade.chartX}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ 
                  scale: 0, 
                  opacity: 0,
                  y: trade.type === 'buy' ? 20 : -20
                }}
                animate={{ 
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 0.7],
                  y: 0
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0 
                }}
                transition={{ duration: 1 }}
              >
                <div className="text-lg">
                  {trade.type === 'buy' ? '🚀' : '📉'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chart stats */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="text-center">
          <div className="text-green-300/70 uppercase tracking-wide">Volume</div>
          <div className="text-green-400 font-bold">
            ${(filteredData.reduce((sum, point) => sum + point.volume, 0) / 1000).toFixed(1)}K
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-green-300/70 uppercase tracking-wide">High</div>
          <div className="text-green-400 font-bold">
            ${Math.max(...filteredData.map(p => p.price)).toFixed(6)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-green-300/70 uppercase tracking-wide">Low</div>
          <div className="text-green-400 font-bold">
            ${Math.min(...filteredData.map(p => p.price)).toFixed(6)}
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <motion.div 
        className="mt-4 flex items-center justify-center space-x-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-green-400 uppercase tracking-wide">
          LIVE PRICE FIELD
        </span>
      </motion.div>
    </div>
  )
}

export default LiveChart