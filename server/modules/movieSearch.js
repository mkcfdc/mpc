import fetch from 'node-fetch';
import AWS from 'aws-sdk';
import db from './db.js'; // Make sure you import your database module here

// Configure AWS credentials and S3 bucket name
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION
  });
const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET;

async function getMovieImages(imdbId) {
    const [imageUrls, _] = await db.query(
        "SELECT background_url, poster_url FROM image_urls WHERE imdb_id = ?",
        [imdbId]
    );

    if (imageUrls.length > 0) {
        return {
            background_url: imageUrls[0].background_url,
            poster_url: imageUrls[0].poster_url,
        };
    } else {
        const apiKey = 'b115806e56e9674a716691486aaf237b';
        const moviesEndpoint = 'https://webservice.fanart.tv/v3/movies';
        const movieUrl = `${moviesEndpoint}/${imdbId}?api_key=${apiKey}`;

            const response = await fetch(movieUrl);
            const movieData = await response.json();

            let backgroundUrl = null;
            let posterUrl = null;

            if (movieData && movieData.moviebackground && movieData.moviebackground.length > 0) {
                movieData.moviebackground.sort((a, b) => b.likes - a.likes);
                backgroundUrl = movieData.moviebackground[0].url;
            }

            if (movieData && movieData.movieposter && movieData.movieposter.length > 0) {
                movieData.movieposter.sort((a, b) => b.likes - a.likes);
                posterUrl = movieData.movieposter[0].url;
            }

            if (backgroundUrl && posterUrl) {
                // Upload images to S3
                const backgroundS3Key = `cache/${imdbId}_moviebackground.jpg`;
                const posterS3Key = `cache/${imdbId}_movieposter.jpg`;
        
                try {
                    await Promise.all([
                        s3.putObject({ Bucket: bucketName, Key: backgroundS3Key, Body: await fetch(backgroundUrl).then(response => response.buffer()) }).promise(),
                        s3.putObject({ Bucket: bucketName, Key: posterS3Key, Body: await fetch(posterUrl).then(response => response.buffer()) }).promise()
                    ]);
        
                    // Update database with S3 URLs
                    await db.query(
                        "INSERT IGNORE INTO image_urls (imdb_id, poster_url, background_url) VALUES (?, ?, ?)",
                        [imdbId, `https://${bucketName}.s3.amazonaws.com/${posterS3Key}`, `https://${bucketName}.s3.amazonaws.com/${backgroundS3Key}`]
                    );
        
                    return {
                        background_url: `https://${bucketName}.s3.amazonaws.com/${backgroundS3Key}`,
                        poster_url: `https://${bucketName}.s3.amazonaws.com/${posterS3Key}`,
                    };
                } catch (error) {
                    console.error('Error uploading images to S3 or updating database:', error);
                    return null;
                }
            } else {
                return null;
            }
    }
}

async function searchMovies(query) {
    const searchQuery = '%' + query + '%';

    const [movies, _] = await db.query(
        "SELECT m.*, i.poster_url AS cached_poster_url, i.background_url AS cached_background_url \
        FROM movies m \
        LEFT JOIN image_urls i ON m.imdb_id = i.imdb_id \
        WHERE m.title LIKE ? OR m.imdb_id LIKE ? \
        ORDER BY m.id DESC \
        LIMIT 10",
        [searchQuery, searchQuery]
    );

    if (movies.length > 0) {
        const alignedMovies = await Promise.all(movies.map(async movie => {
            if (!movie.cached_poster_url || !movie.cached_background_url) {
                const imageUrls = await getMovieImages(movie.imdb_id);
                if (imageUrls) {
                    movie.cached_poster_url = imageUrls.poster_url;
                    movie.cached_background_url = imageUrls.background_url;
                }
            }

            return {
                title: movie.title,
                year: movie.year,
                overview: movie.overview,
                rating: movie.rating,
                imdb: movie.imdb_id,
                torrents: JSON.parse(movie.torrents),
                trailer: movie.trailer,
                background: movie.cached_background_url || movie.background,
                poster: movie.cached_poster_url || movie.poster,
            };
        }));

        return JSON.stringify(alignedMovies, null, 2);
    } else {
        return null;
    }
}

async function getLatestMovies() {
    const [latestMovies, _] = await db.query(
        "SELECT m.*, i.poster_url AS cached_poster_url, i.background_url AS cached_background_url \
        FROM movies m \
        LEFT JOIN image_urls i ON m.imdb_id = i.imdb_id \
        ORDER BY m.id DESC \
        LIMIT 5"
    );

    if (latestMovies.length > 0) {
        const alignedMovies = await Promise.all(latestMovies.map(async movie => {
            let backgroundUrl = movie.cached_background_url;
            let posterUrl = movie.cached_poster_url;

            if (!backgroundUrl || !posterUrl) {
                const imageUrls = await getMovieImages(movie.imdb_id);
                if (imageUrls) {
                    backgroundUrl = imageUrls.background_url || backgroundUrl;
                    posterUrl = imageUrls.poster_url || posterUrl;
                }
            }

            return {
                title: movie.title,
                year: movie.year,
                imdb: movie.imdb_id,
                torrents: JSON.parse(movie.torrents),
                poster: posterUrl || movie.poster,
            };
        }));

        return JSON.stringify(alignedMovies, null, 2);
    } else {
        return null;
    }
}


export { searchMovies, getLatestMovies };