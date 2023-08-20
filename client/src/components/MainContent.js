import React from 'react';
import SearchForm from './searchForm';
import AccountInfo from './accountInfo';
import LogoArea from './logoArea';
import MovieList from './movieList';
import MovieCarousel from './MovieCarousel';
import WatchedMoviesCarousel from './watchedMoviesCarousel'; // Make sure the import path is correct

import { useAuth0 } from '@auth0/auth0-react';
import TransferStatusBar from './transferStatusBar';

function MainContent({ searchResults, onSearch }) {
  const { isAuthenticated } = useAuth0(); // Extract isAuthenticated property

  return (
    <div>
      <LogoArea />

      {isAuthenticated ? (
        <>
          <MovieCarousel />
          <div className="grid gap-6">
            <div>
              <SearchForm onSearch={onSearch} />
              {(searchResults ?? []).length > 0 ? (
                <MovieList movies={searchResults} />
              ) : (
                <>
                  <AccountInfo />
                  <WatchedMoviesCarousel />
                </>
              )}
            </div>
            <TransferStatusBar />
          </div>
        </>
      ) : (
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <p>You must be logged in to use these features!</p>
        </div>
      )}
    </div>
  );
}

export default MainContent;
