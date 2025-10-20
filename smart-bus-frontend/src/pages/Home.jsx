import React, { useState, useEffect, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'

const StatusBadge = memo(() => (
  <div className="inline-badge">
    <div className="badge-inner">
      <span className="sparkles">✨</span>
      <span className="badge-text">SmartBus Transit</span>
    </div>
  </div>
))

const MainTitle = memo(() => (
  <div className="main-title">
    <h1>
      <span className="brand">SMART-BUS</span>
      <span className="highlight"> Transit</span>
    </h1>
  </div>
))

const CTAButton = memo(({ to, text }) => (
  <Link to={to} className="cta-btn">
    {text}
  </Link>
))

const WORDS = [
  'Reliable card management',
  'Fast contactless payments',
  'Real-time transaction reports',
  'Secure and simple'
]

function HomeInner() {
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { setLoaded(true); return () => setLoaded(false) }, [])

  const handleTyping = useCallback(() => {
    const current = WORDS[wordIndex]
    if (isTyping) {
      if (charIndex < current.length) {
        setText(prev => prev + current[charIndex])
        setCharIndex(c => c + 1)
      } else {
        setTimeout(() => setIsTyping(false), 1500)
      }
    } else {
      if (charIndex > 0) {
        setText(prev => prev.slice(0, -1))
        setCharIndex(c => c - 1)
      } else {
        setWordIndex(w => (w + 1) % WORDS.length)
        setIsTyping(true)
      }
    }
  }, [charIndex, isTyping, wordIndex])

  useEffect(() => {
    const t = setTimeout(handleTyping, isTyping ? 100 : 40)
    return () => clearTimeout(t)
  }, [handleTyping, isTyping, charIndex])

  return (
    <div className={`home-landing ${loaded ? 'loaded' : ''}`}>
      {/* decorative petals */}
      <div className="petals">
        {[...Array(7)].map((_, i) => <div key={i} className="petal" />)}
      </div>
      <div className="hero">
        <StatusBadge />
        <MainTitle />
        <div className="typing">
          <span className="typing-text">{text}</span>
          <span className="cursor">|</span>
        </div>
        
      </div>

      <div className="features">
        <div className="feature">Fast top-ups</div>
        <div className="feature">Secure payments</div>
        <div className="feature">Daily reports</div>
      </div>

      <div className="home-stats" aria-hidden>
        <div className="stat"><div className="num">1.2K</div><div>Active Cards</div></div>
        <div className="stat"><div className="num">24K</div><div>Transactions</div></div>
        <div className="stat"><div className="num">98%</div><div>Satisfaction</div></div>
        <div className="stat"><div className="num">99.9%</div><div>Uptime</div></div>
      </div>
    </div>
  )
}

export default memo(HomeInner)



