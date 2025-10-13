import React from 'react'

export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="60" rx="10" fill="#061225" stroke="#06f5ff" strokeOpacity="0.12" />
      <path d="M16 40 L28 24 L40 40" stroke="#6ef3ff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="32" cy="18" r="4" fill="#9b6eff" />
    </svg>
  )
}
