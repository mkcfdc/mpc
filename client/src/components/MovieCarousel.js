import React, { useState, useEffect } from 'react';
import MovieList from './movieList';
import LoadingScreen from './loadingScreen';
import CarouselComponent from './Carousels/CarouselComponent';
import './css/MovieCarousel.css'; // Import your custom CSS for the MovieCarousel

const MovieCarousel = () => {
  const [latestMovies, setLatestMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to track modal open state

  useEffect(() => {
    async function fetchLatestMovies() {
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_API + '/latest');
        if (!response.ok) {
          throw new Error('Failed to fetch latest movies');
        }
        const jsonData = await response.json();
        setLatestMovies(jsonData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching latest movies:', error);
        setIsLoading(false);
      }
    }

    fetchLatestMovies();
  }, []);

  const handlePosterClick = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true); // Open modal when a movie poster is clicked
  };

  return (
    <div>
      <h2>Latest Movies</h2>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className={isModalOpen ? 'carousel-overlay' : ''}>
          <CarouselComponent
            autoPlay
            data={latestMovies.slice(0, 5)}
            linkAttr="movie"
            onItemClick={handlePosterClick}
          />
        </div>
      )}
      {selectedMovie && (
        <div className="selected-movie-details">
          <MovieList movies={[selectedMovie]} />
        </div>
      )}
    </div>
  );
};

export default MovieCarousel;
