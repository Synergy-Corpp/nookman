import React from 'react'
import { motion } from 'framer-motion'
import { TokenData } from '../types'

interface TokenMetricsProps {
  data: TokenData
}

const TokenMetrics: React.FC<TokenMetricsProps> = ({ data }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatPrice = (price: number): string => {
    return price.toFixed(6)
  }

  const metrics = [
    {
      label: 'PRICE',
      value: `$${formatPrice(data.price)}`,
      change: data.priceChange24h,
      icon: '💰'
    },
    {
      label: 'MARKET CAP',
      value: `$${formatNumber(data.marketCap)}`,
      icon: '📊'
    },
    {
      label: 'VOLUME 24H',
      value: `$${formatNumber(data.volume24h)}`,
      icon: '📈'
    },
    {
      label: 'HOLDERS',
      value: formatNumber(data.holders),
      icon: '👥'
    }
  ]

  return (
    <div className="bg-black/80 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
      <motion.div 
        className="text-xl font-bold text-green-400 mb-6 flex items-center space-x-2"
        animate={{ 
          textShadow: [
            "0 0 5px #00ff88",
            "0 0 15px #00ff88",
            "0 0 5px #00ff88"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>🔒</span>
        <span>$LOCK METRICS</span>
      </motion.div>

      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              borderColor: 'rgba(0, 255, 136, 0.5)',
              backgroundColor: 'rgba(0, 255, 136, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{metric.icon}</span>
              <div>
                <div className="text-sm text-green-300/70 uppercase tracking-wide">
                  {metric.label}
                </div>
                <div className="text-lg font-bold text-green-400">
                  {metric.value}
                </div>
              </div>
            </div>
            
            {metric.change !== undefined && (
              <motion.div 
                className={`text-sm font-bold px-2 py-1 rounded ${
                  metric.change >= 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                }`}
                animate={{ 
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(2)}%
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Token Address */}
      <motion.div 
        className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
        whileHover={{ backgroundColor: 'rgba(0, 255, 136, 0.15)' }}
      >
        <div className="text-xs text-green-300/70 uppercase tracking-wide mb-1">
          Token Address
        </div>
        <div className="text-xs text-green-400 font-mono break-all">
          {data.mint}
        </div>
      </motion.div>

      {/* Live Indicator */}
      <motion.div 
        className="mt-4 flex items-center justify-center space-x-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-green-400 uppercase tracking-wide">
          LIVE DATA STREAM
        </span>
      </motion.div>
    </div>
  )
}

export default TokenMetrics