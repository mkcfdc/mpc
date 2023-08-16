import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const CarouselComponent = ({ data, linkAttr, onItemClick }) => {
  return (
    <div className="py-8">
      <div className="container mx-auto">
        <Carousel
          showThumbs={false}
          showStatus={false}
          className="carousel-poster rounded-md overflow-hidden"
          centerMode={false}
          autoPlay
        >
          {data.map(item => (
            <div key={item.imdb} className="carousel-item p-4">
              <a
                href={`/${linkAttr}/${item.imdb}`}
                className="block transition duration-300 transform hover:scale-105"
                onClick={() => onItemClick(item)} // Handle item click
              >
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-1/6 sm:w-1/5 md:w-1/7 h-auto rounded-lg shadow-lg"
                  style={{ maxWidth: '200px', maxHeight: 'auto' }} // Set maximum width to 200px
                />
              </a>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default CarouselComponent;
