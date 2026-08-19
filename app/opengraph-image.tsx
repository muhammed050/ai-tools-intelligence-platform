import { ImageResponse } from 'next/og'

export const alt = 'Eldevo — AI Tools Intelligence'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() { return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '70px', background: '#ffffff', color: '#0f172a', fontFamily: 'sans-serif' }}><div style={{ display: 'flex', fontSize: 34, fontWeight: 800, color: '#4f46e5', marginBottom: 28 }}>Eldevo</div><div style={{ display: 'flex', fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: -3 }}>AI tools intelligence<br />for better workflows.</div><div style={{ display: 'flex', fontSize: 26, color: '#475569', marginTop: 28 }}>Discover, compare and choose with confidence.</div></div>, { ...size }) }
