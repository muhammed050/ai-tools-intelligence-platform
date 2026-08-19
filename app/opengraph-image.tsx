import { ImageResponse } from 'next/og'

export const alt = 'AITools — Find the right AI software'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() { return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '70px', background: '#07111f', color: '#f5f7fb', fontFamily: 'sans-serif' }}><div style={{ display: 'flex', fontSize: 30, color: '#aeb8ff', marginBottom: 28 }}>AI<span style={{ color: '#8b7cff' }}>Tools</span></div><div style={{ display: 'flex', fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: -3 }}>Find the right AI<br />tool for any job.</div><div style={{ display: 'flex', fontSize: 26, color: '#93a4bb', marginTop: 28 }}>Search, compare and choose with confidence.</div></div>, { ...size }) }
