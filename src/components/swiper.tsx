"use client"
// import Swiper core and required modules
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y
} from 'swiper/modules';

import {
  Swiper,
  SwiperSlide
} from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

export default function Swipers() {
  return (
    <Swiper
      className="w-full h-screen"
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={10}
      slidesPerView={1}
      navigation
      pagination={ { clickable: true }}
      scrollbar={ { draggable: true }}
      >
      <SwiperSlide className="">Slide 1</SwiperSlide>
      <SwiperSlide className="">Slide 2</SwiperSlide>
      <SwiperSlide className="">Slide 3</SwiperSlide>
      <SwiperSlide className="">Slide 4</SwiperSlide>
    </Swiper>
  );
};