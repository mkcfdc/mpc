import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import StreamModal from './streamModal';
import DownloadModal from './downloadModal';

function MovieList({ movies }) {
  const [showModal, setShowModal] = useState(false);
  const [streamLink, setStreamLink] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [transferId, setTransferId] = useState(false);
  const [torrentHash, setTorrentHash] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [expandedMovie, setExpandedMovie] = useState(null);

  // Function to toggle the expanded state of a movie's overview
  const toggleExpanded = (movieId) => {
    if (expandedMovie === movieId) {
      setExpandedMovie(null);
    } else {
      setExpandedMovie(movieId);
    }
  };

  const handleStreamClick = async (hash) => {
    setSelectedMovie(hash);
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_API + `/getStreamLink/${hash}`);
      const data = await response.json();
      console.log(data);
      if (data.streamLink) {
        setStreamLink(data.streamLink);
        setShowModal(true);
      } else if (data.status === 'success' && data.id) {
        const tId = data.id;
        console.log(tId);
        
          setShowDownloadModal(true);
          setTransferId(tId);
          setTorrentHash(hash);
      
      }
    } catch (error) {
      console.error('Error fetching stream link:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStreamLink('');
    setSelectedMovie(null);
    setTransferId('');
    setShowDownloadModal(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {movies.map((movie) => (
        <div key={movie.imdb} className="movie-card bg-cover bg-center relative flex gap-4 p-4 rounded-md shadow-md transform hover:scale-105 transition duration-300" style={{ backgroundImage: `url("${movie.background}")` }}>
          <div className="poster-image h-60 w-44 flex-shrink-0">
            <img
              src={movie.poster}
              alt="Movie Poster"
              className="h-full w-full object-cover rounded-md"
            />
          </div>
          <div className="movie-details flex-1 flex flex-col justify-between bg-black bg-opacity-70 p-4 rounded-md">
            <div>
              <h2 className="text-white text-xl font-semibold mb-2">
                {movie.title} ({movie.year})
              </h2>
              <div className="overview bg-white bg-opacity-80 rounded-md p-4 mb-2">
            {movie.overview.length > 250 && expandedMovie !== movie.imdb ? (
              <>
                <p className="text-gray-800">{movie.overview.slice(0, 250)}...</p>
                <button
                  className="text-blue-500 font-semibold cursor-pointer"
                  onClick={() => toggleExpanded(movie.imdb)}
                >
                  Read more
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-800">{movie.overview}</p>
                <Link className="text-blue-500 font-semibold cursor-pointer" to={`/movie/${movie.imdb}`}>View Details</Link> {/* Add Link */}
                {movie.overview.length > 250 && (
                  <button
                    className="text-blue-500 font-semibold cursor-pointer"
                    onClick={() => toggleExpanded(movie.imdb)}
                  >
                    Read less
                  </button>
                )}
              </>
            )}
          </div>
              <button className="trailer-button bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Watch Trailer
              </button>
            </div>
            <div className="download-links mt-2 flex flex-wrap">
              {Object.entries(movie.torrents.reduce((groups, torrent) => {
                const groupKey = torrent.quality;
                if (!groups[groupKey]) {
                  groups[groupKey] = [];
                }
                groups[groupKey].push(torrent);
                return groups;
              }, {})).map(([quality, torrents]) => (
                <div key={quality} className="flex items-center mb-3">
                  {torrents.map((torrent, torrentIndex) => (
                    <React.Fragment key={torrentIndex}>
                      <button
                        className={`download-button text-blue-500 mr-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md flex items-center ${torrentIndex === torrents.length - 1 ? 'mr-0' : ''}`}
                        onClick={() => window.open(torrent.url, '_blank')}
                      >
                        <span className="mr-1">&#128202;</span> Download {quality}
                      </button>
                      <button
                    className="stream-now-button bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 flex items-center"
                    style={{ backgroundColor: 'rgb(0, 128, 0)' }}
                    onClick={() => handleStreamClick(torrent.hash)} // Stream the first quality's link
                  >
                    <span className="mr-1">&#9658;</span> Stream {quality}
                  </button>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {showModal && selectedMovie && (
        <StreamModal streamLink={streamLink} onClose={handleCloseModal} />
      )}
      {showDownloadModal && (
        <DownloadModal transferId={transferId} torrentHash={torrentHash} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default MovieList;