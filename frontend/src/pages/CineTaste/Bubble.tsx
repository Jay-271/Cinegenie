import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';
import './CineGenres.css'

// Define types for the Bubble props
interface BubbleProps {
    genre: string;
    onClick: (genre: string) => void;
    isSelected: boolean;
  }

  const Bubble: React.FC<BubbleProps> = ({ genre, onClick, isSelected }) => {
    // State to track hover status
    const [isHovered, setIsHovered] = useState(false);
  
    // Use spring to animate scale based on hover state
    const bubbleStyle = useSpring({
      transform: isHovered ? 'scale(1.2)' : 'scale(1)', // Scale up when hovered
      opacity: isHovered ? 0.8 : 1, // Optional opacity change
      backgroundColor: isSelected ? '#4d26eb' : '#3b3b3b',
      config: { tension: 170, friction: 20 },
    });
  
    return (
      <animated.div
        style={{
          ...bubbleStyle,
          display: 'inline-block',
          borderRadius: '50%',
          color: 'white',
          padding: '20px 30px',
          margin: '10px',
          cursor: 'pointer',
          textAlign: 'center',
          fontSize: '18px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        }}
        onClick={() => onClick(genre)} data-testid="genreButton"
        onMouseEnter={() => setIsHovered(true)} // Set hover state to true on mouse enter
        onMouseLeave={() => setIsHovered(false)} // Set hover state to false on mouse leave
      >
        {genre}
      </animated.div>
    );
  };

export default Bubble