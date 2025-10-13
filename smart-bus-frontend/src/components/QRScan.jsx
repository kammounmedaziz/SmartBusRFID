import React, { useEffect, useRef, useState } from 'react'

export default function QRScan({ onScan }) {
  const videoRef = useRef(null)
  const [err, setErr] = useState(null)
  const [manual, setManual] = useState('')

  useEffect(() => {
    let stream = null
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) videoRef.current.srcObject = stream
        // BarcodeDetector if available
        if ('BarcodeDetector' in window) {
          const bd = new BarcodeDetector({ formats: ['qr_code'] })
          const scan = async () => {
            try {
              const bitmap = await bd.detect(videoRef.current)
              if (bitmap && bitmap.length) {
                const txt = bitmap[0].rawValue
                try { onScan(JSON.parse(txt)) } catch { onScan(txt) }
              }
            } catch (e) {}
            requestAnimationFrame(scan)
          }
          requestAnimationFrame(scan)
        } else {
          // fallback: user will have to paste QR payload
        }
      } catch (e) {
        setErr(e)
      }
    }
    start()
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [onScan])

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{width:320,height:240,background:'#000'}} />
      {err && <div style={{color:'red'}}>Camera error: {String(err)}</div>}
      <div style={{marginTop:8}}>If your browser doesn't support camera scanning, paste QR payload here:</div>
      <input value={manual} onChange={e => setManual(e.target.value)} placeholder="Paste QR JSON or text" />
      <button onClick={() => { try { onScan(JSON.parse(manual)) } catch { onScan(manual) } }}>Submit</button>
    </div>
  )
}
