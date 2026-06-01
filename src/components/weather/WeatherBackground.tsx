'use client';

import { useMemo } from 'react';

interface WeatherBackgroundProps {
  weatherMain: string;
  children: React.ReactNode;
}

export default function WeatherBackground({ weatherMain, children }: WeatherBackgroundProps) {
  const particles = useMemo(() => generateParticles(weatherMain), [weatherMain]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div key={p.id} style={p.style} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes rain-fall {
          0% {
            transform: translateY(-100vh) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(-20px);
            opacity: 0.3;
          }
        }

        @keyframes snow-fall {
          0% {
            transform: translateY(-100vh) translateX(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(0) translateX(30px) rotate(180deg);
          }
          100% {
            transform: translateY(100vh) translateX(-20px) rotate(360deg);
            opacity: 0.3;
          }
        }

        @keyframes cloud-drift {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(calc(100vw + 100%));
          }
        }

        @keyframes lightning {
          0%, 94%, 100% {
            opacity: 0;
          }
          95% {
            opacity: 0.8;
          }
          96% {
            opacity: 0;
          }
          97% {
            opacity: 0.6;
          }
        }

        @keyframes sun-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes fog-drift {
          0% {
            transform: translateX(-10%);
            opacity: 0.3;
          }
          50% {
            transform: translateX(5%);
            opacity: 0.5;
          }
          100% {
            transform: translateX(-10%);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}

function generateParticles(weatherMain: string): Array<{ id: number; style: React.CSSProperties }> {
  const particles: Array<{ id: number; style: React.CSSProperties }> = [];

  switch (weatherMain) {
    case 'Rain':
    case 'Drizzle':
      for (let i = 0; i < 50; i++) {
        particles.push({
          id: i,
          style: {
            position: 'absolute',
            width: '2px',
            height: `${10 + Math.random() * 15}px`,
            background: 'linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.5))',
            left: `${Math.random() * 100}%`,
            top: `${-10 + Math.random() * 20}%`,
            animation: `rain-fall ${0.5 + Math.random() * 0.8}s linear infinite`,
            animationDelay: `${Math.random() * 3}s`,
            borderRadius: '2px',
          },
        });
      }
      break;

    case 'Snow':
      for (let i = 0; i < 30; i++) {
        const size = 4 + Math.random() * 8;
        particles.push({
          id: i,
          style: {
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)',
            left: `${Math.random() * 100}%`,
            top: `${-10 + Math.random() * 20}%`,
            animation: `snow-fall ${4 + Math.random() * 6}s linear infinite`,
            animationDelay: `${Math.random() * 8}s`,
            borderRadius: '50%',
          },
        });
      }
      break;

    case 'Clouds':
      for (let i = 0; i < 4; i++) {
        particles.push({
          id: i,
          style: {
            position: 'absolute',
            width: `${150 + Math.random() * 200}px`,
            height: `${60 + Math.random() * 40}px`,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            top: `${10 + i * 20 + Math.random() * 10}%`,
            animation: `cloud-drift ${20 + Math.random() * 30}s linear infinite`,
            animationDelay: `${-Math.random() * 20}s`,
            filter: 'blur(20px)',
          },
        });
      }
      break;

    case 'Thunderstorm':
      for (let i = 0; i < 40; i++) {
        particles.push({
          id: i,
          style: {
            position: 'absolute',
            width: '2px',
            height: `${10 + Math.random() * 15}px`,
            background: 'linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.5))',
            left: `${Math.random() * 100}%`,
            top: `${-10 + Math.random() * 20}%`,
            animation: `rain-fall ${0.5 + Math.random() * 0.8}s linear infinite`,
            animationDelay: `${Math.random() * 3}s`,
            borderRadius: '2px',
          },
        });
      }
      particles.push({
        id: 100,
        style: {
          position: 'absolute',
          inset: '0',
          background: 'rgba(255,255,255,0.3)',
          animation: 'lightning 4s ease-in-out infinite',
        },
      });
      break;

    case 'Clear':
      particles.push({
        id: 0,
        style: {
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,200,50,0.2) 0%, transparent 70%)',
          top: '5%',
          right: '10%',
          borderRadius: '50%',
          animation: 'sun-pulse 4s ease-in-out infinite',
        },
      });
      break;

    case 'Mist':
    case 'Fog':
    case 'Haze':
      for (let i = 0; i < 5; i++) {
        particles.push({
          id: i,
          style: {
            position: 'absolute',
            width: '120%',
            height: `${80 + Math.random() * 100}px`,
            background: `rgba(200,200,220,${0.08 + Math.random() * 0.1})`,
            top: `${i * 20 + Math.random() * 10}%`,
            left: '-10%',
            animation: `fog-drift ${8 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${-Math.random() * 8}s`,
            filter: 'blur(30px)',
          },
        });
      }
      break;

    default:
      break;
  }

  return particles;
}
