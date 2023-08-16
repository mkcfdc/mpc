import React, { useState, useEffect } from 'react';
import CarouselComponent from './Carousels/CarouselComponent';

const WatchedMoviesCarousel = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    fetch(process.env.REACT_APP_BACKEND_API + `/getWatchedMovies`)
      .then(response => response.json())
      .then(data => {
        setMovies(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handlePosterClick = (movie) => {
    
  };

  return (
    <div className="py-8">
      <div className="container mx-auto">
      <h2 className="text-2xl font-semibold text-blue mb-4">Popular Films</h2>
      <CarouselComponent
          autoPlay
          data={movies.filter(movie => movie.poster)} // Filter movies with poster
          linkAttr="movie"
          onItemClick={handlePosterClick}
        />
      </div>
    </div>
  );
};

export default WatchedMoviesCarousel;
