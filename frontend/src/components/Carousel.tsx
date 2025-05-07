import {useState} from "react";
import "./Carousel.css";

import { slides } from "./carouselData.json";
import {BsArrowLeftCircleFill, BsArrowRightCircleFill} from "react-icons/bs";

function Carousel() {

	const [slide, setSlide] = useState(0);

	const nextSlide = () =>
	{
		setSlide(slide === slides.length - 1 ? 0 : slide + 1);
	};
	
	const prevSlide = () =>
	{
		setSlide(slide === 0 ? slides.length - 1: slide - 1);
	};

	setTimeout(nextSlide, 10000);

	return (
  
  <div className="carousel">
	
      {slides.map((item, idx) => (
        <img src={item.src} alt={item.alt} key={idx} className={slide === idx ? "slide" : "slide slide-hidden"}/>
      ))}
	  
	  <BsArrowLeftCircleFill className="arrow arrow-left" onClick={prevSlide}/>
	  <BsArrowRightCircleFill className="arrow arrow-right" onClick={nextSlide}/>
	  
      <span className="indicators">
	  {slides.map((_,idx) => (
		<button key={idx} onClick={() => setSlide(idx)} className={slide === idx ? "indicator" : "indicator indicator-inactive"}></button>
	  ))}
	  </span>
	  </div>
  );
}

export default Carousel;
