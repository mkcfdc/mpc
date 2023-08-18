import React from 'react';
import SearchForm from './searchForm';
import AccountInfo from './accountInfo';
import LogoArea from './logoArea';
import MovieList from './movieList';
import MovieCarousel from './MovieCarousel';
import { useAuth0 } from '@auth0/auth0-react';

function MainContent({ searchResults, onSearch }) {
  const { isAuthenticated } = useAuth0(); // Extract isAuthenticated property

  return (
    <div>
      <LogoArea />

      {isAuthenticated && (
        <>
          <MovieCarousel />
          <div className="grid gap-6">
            <div>
              <SearchForm onSearch={onSearch} />
              {(searchResults ?? []).length > 0 ? (
                <MovieList movies={searchResults} />
              ) : (
                <AccountInfo />
              )}
            </div>
          </div>
        </>
      )}

      {!isAuthenticated && (
         <div className="bg-red-100 text-red-800 p-4 rounded-md">
         <p>You must be logged in to use these features!</p>
       </div>
      )}
    </div>
  );
}

export default MainContent;
