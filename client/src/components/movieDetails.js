import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { BsFillPlayFill } from 'react-icons/bs';
import StreamModal from './streamModal';
import DownloadModal from './downloadModal';
import LogoArea from './logoArea';
import LoadingScreen from './loadingScreen';

const MovieDetails = () => {
  const { imdbId } = useParams();
  const [movieDetails, setMovieDetails] = useState(null);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [transferId, setTransferId] = useState(false);
  const [torrentHash, setTorrentHash] = useState(false);

  const [streamLink, setStreamLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_API + `/search/${imdbId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        const data = await response.json();
        setMovieDetails(data[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setIsLoading(false);
      }
    }

    fetchMovieDetails();
  }, [imdbId]);

  const handleStreamClick = async (hash) => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_API + `/getStreamLink/${hash}`);
      const data = await response.json();
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
    setTransferId('');
    setShowDownloadModal(false);
  };

  if (!movieDetails) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <LoadingScreen />
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: `url(${movieDetails.background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white bg-opacity-80 overflow-hidden shadow rounded-lg">
          <div className="sm:flex p-3">
            <div className="flex-shrink-0">
              <img
                className="h-96 w-full object-cover rounded-sm"
                src={movieDetails.poster}
                alt={`${movieDetails.title} Poster`}
              />
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4 bg-opacity-80">
                <Link
                  to="/"
                  className="text-blue-500 hover:underline inline-flex items-center"
                >
                  <AiOutlineArrowLeft className="w-4 h-4 mr-1" />
                  Back to Search
                </Link>
                <LogoArea />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{movieDetails.title}</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>{movieDetails.year}</p>
                <p>Rating: {movieDetails.rating}</p>
              </div>
              <div className="mt-5">
                <h4 className="text-sm leading-5 font-medium text-gray-500">Overview</h4>
                <p className="mt-2 text-sm leading-5 text-gray-900">{movieDetails.overview}</p>
              </div>
              <div className="mt-5">
                <h4 className="text-sm leading-5 font-medium text-gray-500">Torrents</h4>
                <div className="mt-2 space-y-2">
                  {movieDetails.torrents && movieDetails.torrents.length > 0 ? (
                    movieDetails.torrents.map((torrent, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <a
                          href={torrent.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {torrent.quality}
                        </a>
                        <span className="text-gray-500">{torrent.size}</span>
                        <button
                          className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 flex items-center space-x-1"
                          onClick={() => handleStreamClick(torrent.hash)}
                        >
                          <BsFillPlayFill className="w-4 h-4" />
                          <span>Stream</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No torrents available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <StreamModal streamLink={streamLink} onClose={handleCloseModal} />
      )}
      {showDownloadModal && (
        <DownloadModal transferId={transferId} torrentHash={torrentHash} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default MovieDetails;
