import React from "react";

const StarBackground: React.FC = () => {
  return (
    <div className="star-background">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${1 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}

      <style>{`
        .star-background {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
        }

        .star {
          position: absolute;
          width: 0.25rem;
          height: 0.25rem;
          background-color: #fcd34d;
          border-radius: 50%;
          animation: ping 1s infinite;
        }

        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StarBackground;
