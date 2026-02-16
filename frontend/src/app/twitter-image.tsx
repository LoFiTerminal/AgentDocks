import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AgentDocks - Launch AI Agents in Seconds';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1C1917',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              border: '8px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}
          >
            <div
              style={{
                fontSize: 60,
                color: '#F59E0B',
                display: 'flex',
              }}
            >
              ⚡
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 20,
            display: 'flex',
          }}
        >
          AgentDocks.ai
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: '#A8A29E',
            textAlign: 'center',
            maxWidth: 800,
            display: 'flex',
          }}
        >
          Launch AI Agents in Seconds
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#F59E0B',
              fontSize: 24,
            }}
          >
            <span style={{ marginRight: 10 }}>🔒</span> Privacy First
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#F59E0B',
              fontSize: 24,
            }}
          >
            <span style={{ marginRight: 10 }}>⚡</span> Lightning Fast
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#F59E0B',
              fontSize: 24,
            }}
          >
            <span style={{ marginRight: 10 }}>🎨</span> Beautiful GUI
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
