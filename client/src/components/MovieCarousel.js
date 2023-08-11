import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import MovieList from './movieList';
import LoadingScreen from './loadingScreen';

const MovieCarousel = () => {
  const [latestMovies, setLatestMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestMovies() {
      try {
        const response = await fetch('https://api.moviepoopchute.lol/latest');
        if (!response.ok) {
          throw new Error('Failed to fetch latest movies');
        }
        const jsonData = await response.json();
        setLatestMovies(jsonData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching latest movies:', error);
        setIsLoading(false); // Set loading to false even if there's an error
      }
    }

    fetchLatestMovies();
  }, []);

  const handlePosterClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleSearch = (query) => {
    // Here, you can use the logic to submit the search form with the provided query
    console.log('Submitting search form with query:', query);

    // For example, if you have a reference to the form element, you can do:
    // formRef.current.submit();
  };

  return (
    <div>
      <h2>Latest Movies</h2>
      {isLoading ? (
        <LoadingScreen /> // Display LoadingScreen while loading
      ) : (
        <Carousel showThumbs={false} infiniteLoop autoPlay>
          {latestMovies.slice(0, 5).map((movie) => (
            <div
              key={movie.imdb}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}
            >
              <Link className="cursor-pointer" to={`/movie/${movie.imdb}`}>
              <img
                src={movie.poster}
                alt={`${movie.title} Poster`}
                className="carousel-poster rounded-md"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
              </Link>
            </div>
          ))}
        </Carousel>
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
