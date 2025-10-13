import React from 'react'

export default function QRGenerate({ payload }) {
  if (!payload) return null
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload)
  // Use Google Chart API to render QR as an image (no external dependency)
  const src = `https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(text)}`
  return (
    <div style={{padding:12, border:'1px dashed #666', display:'inline-block'}}>
      <img src={src} alt="qr" style={{width:180,height:180}} />
      <div style={{marginTop:8, fontSize:12}}>{text}</div>
    </div>
  )
}
