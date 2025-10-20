import React, { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { apiFetch } from '../api.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Reports({ token }) {
  const [rows, setRows] = useState([])
  useEffect(()=>{
    let mounted=true
    apiFetch('/api/reports/fare-by-day', token).then(r=>{ if(mounted) setRows(r) }).catch(()=>{})
    return ()=> mounted=false
  },[])

  const labels = rows.map(r=>r.day)
  const data = { labels, datasets:[{label:'Fare collected',data:rows.map(r=>r.total),borderColor:'#6ef3ff',backgroundColor:'rgba(110,243,255,0.1)'}] }

  return (
    <div className="page reports">
      <h2>Reports</h2>
      <div style={{maxWidth:800}}>
        <Line data={data} />
      </div>
    </div>
  )
}


