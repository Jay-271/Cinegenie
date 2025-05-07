import React, { useEffect, useState } from "react";

interface SmokeParticle {
  id: number;
  charIndex: number;
  offsetX: number;
  offsetY: number;
  delay: number;
  duration: number;
  size: number;
}

type AnimationPhase = "appearing" | "complete" | "fading" | "hidden";

const MagicTextEffect: React.FC = () => {
  const [opacity, setOpacity] = useState(0);
  const [phase, setPhase] = useState<AnimationPhase>("appearing");
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);
  const fullText = "Your Wish Is My Command";

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
    <div className="magic-text-wrapper">
      <h1 className="magical-text" style={{ opacity }}>
        {fullText}
      </h1>
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

      <style>{`
        .magic-text-wrapper {
          position: relative;
          width: fit-content;
          margin: auto;
          padding: 3rem 2rem;
          text-align: center;
          z-index: 1;
        }

        .magical-text {
          font-size: 2.5rem;
          font-weight: bold;
          background: linear-gradient(to right, #9f7aea, #667eea, #4c51bf);
          -webkit-background-clip: text;
          color: transparent;
          transition: opacity 1s ease-in-out;
        }

        .smoke-particles-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .smoke-particle {
          position: absolute;
          background-color: #9f7aea;
          border-radius: 50%;
          opacity: 0;
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
      `}</style>
    </div>
  );
};

export default MagicTextEffect;
