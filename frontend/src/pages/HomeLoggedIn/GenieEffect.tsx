import React, { useState, useEffect } from "react";

// Define types for smoke particles
interface SmokeParticle {
  id: number;
  charIndex: number;
  offsetX: number;
  offsetY: number;
  delay: number;
  duration: number;
  size: number;
}

// Define types for animation phases
type AnimationPhase = "appearing" | "complete" | "fading" | "hidden";

const GenieTextEffect: React.FC = () => {
  const [opacity, setOpacity] = useState<number>(0);
  const [phase, setPhase] = useState<AnimationPhase>("appearing");
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);
  const fullText = "Your Wish Is My Command";

  // Text animation cycle
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === "appearing") {
      let opacityLevel = 0;
      timer = setInterval(() => {
        if (opacityLevel < 1) {
          setOpacity((prev) => Math.min(prev + 0.05, 1));
          opacityLevel += 0.05;
        } else {
          setPhase("complete");
          clearInterval(timer);
        }
      }, 100);
    } else if (phase === "complete") {
      // Generate smoke particles based on text length
      const textLength = fullText.length;
      const newParticles: SmokeParticle[] = [];

      for (let i = 0; i < textLength * 3; i++) {
        const charIndex = Math.floor(Math.random() * textLength);
        newParticles.push({
          id: i,
          charIndex,
          offsetX: (Math.random() - 0.5) * 10,
          offsetY: (Math.random() - 0.5) * 5,
          delay: Math.random() * 2,
          duration: 2 + Math.random() * 3,
          size: 4 + Math.random() * 10,
        });
      }
      setSmokeParticles(newParticles);

      timer = setTimeout(() => {
        setPhase("fading");
      }, 2000);
    } else if (phase === "fading") {
      let opacityLevel = 1;
      timer = setInterval(() => {
        if (opacityLevel > 0) {
          setOpacity((prev) => Math.max(prev - 0.05, 0));
          opacityLevel -= 0.05;
        } else {
          setPhase("hidden");
          clearInterval(timer);
        }
      }, 100);
    } else if (phase === "hidden") {
      setSmokeParticles([]);
      timer = setTimeout(() => {
        setOpacity(0);
        setPhase("appearing");
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="container">
      {/* Text container */}
      <div className="text-container">
        {/* Text with magical effects */}
        <h1 className="magical-text" style={{ opacity }}>
          {fullText}
        </h1>

        {/* Smoke particles container */}
        <div className="smoke-particles-container">
          {smokeParticles.map((particle) => (
            <div
              key={particle.id}
              className="smoke-particle"
              style={{
                left: `calc(${
                  (particle.charIndex / fullText.length) * 100
                }% + ${particle.offsetX}px)`,
                top: `calc(50% + ${particle.offsetY}px)`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animation: `smokeRise ${particle.duration}s ease-out ${particle.delay}s`,
                animationFillMode: "forwards",
              }}
            />
          ))}
        </div>
      </div>

      {/* Magical stars */}
      <div
        className={`stars-container ${
          phase === "complete" || phase === "fading" ? "visible" : ""
        }`}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`, // Random x-position across the container
              top: `${Math.random() * 100}%`, // Random y-position across the container
              animationDuration: `${1 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
          width: 100%;
          z-index:
        }

        .text-container {
          position: relative;
        }

        .magical-text {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(to right, #9f7aea, #667eea, #4c51bf);
          -webkit-background-clip: text;
          color: transparent;
          transition: all 1s;
        }

        .smoke-particles-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .smoke-particle {
          position: absolute;
          background-color: #9f7aea;
          border-radius: 50%;
          opacity: 0;
        }

        .stars-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s;
          width: 100%;
          height: 100%;
        }

        .stars-container.visible {
          opacity: 1;
        }

        .star {
          width: 0.25rem;
          height: 0.25rem;
          background-color: #fcd34d;
          border-radius: 50%;
          animation: ping 1s infinite;
        }

        @keyframes smokeRise {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
            filter: blur(1px);
          }
          10% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-60px) scale(2) rotate(360deg);
            opacity: 0;
            filter: blur(4px);
          }
        }

        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GenieTextEffect;
