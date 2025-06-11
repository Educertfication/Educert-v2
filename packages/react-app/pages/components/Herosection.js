import Card from './Card';
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronRight, FaChevronLeft} from 'react-icons/fa';
import { useState, useEffect } from 'react';



const Herosection = () => {
  const [slidesToShow, setSlidesToShow] = useState(3);

  // if (window.innerWidth < 480) {
  //   settings.slidesToShow = 1;
  // } else if (window.innerWidth < 1024) {
  //   settings.slidesToShow = 2;
  // } else if(window.innerWidth > 1024){
  //   settings.slidesToShow = 3;
  // }
  useEffect(() => {
    const adjustSlidesToShow = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    adjustSlidesToShow();

    window.addEventListener('resize', adjustSlidesToShow);

    return () => {
      window.removeEventListener('resize', adjustSlidesToShow);
    };
  }, []);

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };
  
    return (
    <div className="mt-[60px] max-w-7xl sm:w-[350px] xsm:w-[330px]">
        <h1 className="text-[#EEEEF0] font-[900] text-[38px] w-[300px] sm:w-[360px] sm:text-center ">Top picks</h1>
        <Slider {...settings} className='' >
        <div>
        <Card src="/image1.png" width={347} height={200} />
      </div>
      <div>
      <Card src="/image2.png" width={347} height={200} />
      </div>
      <div>
      <Card src="/image4.png" width={347} height={200} />
      </div>
      <div>
      <Card src="/image5.png" width={347} height={200} />
      </div>
      <div>
      <Card src="/image6.png" width={347} height={200} />
      </div>
        </Slider>
        
    </div>
  )
}

export default Herosection
