// src/utils.ts

import { request } from 'obsidian';
import { App, Notice, TFile } from "obsidian";

// import { Raindrop, RaindropList } from './models';

/**
 * Extracts a trackId from a Spotify URL
 * @param {string} url - The string that should be the correct url format -> "https://open.spotify.com/album/0BwWUstDMUbgq2NYONRqlu?si=5qGtCb3_Qh2SburnU09NtQ"
 * @returns {string} - Either the trackId or an empty string
 */
 export const deconstructUrl = (url: string): string => {
  const regEx = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track)(?::|\/)((?:[0-9a-zA-Z]){22})/;
  const match = url.match(regEx);
  if(match){
    const spotifyID = match[2]
    return spotifyID
  }
  return "";
}

/**
 * Fetches a track object from the Spotify API
 * @param {string} id - The trackId to fetch from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {Track} - The track from the Spotify API
 */
 export const getTrack = async (id: string, bearerToken: string): Promise<Track> => {
  const trackResponse = await requestAPI(`https://api.spotify.com/v1/tracks/${id}`, bearerToken);
  return trackResponse;
}

/**
 * Fetches a track audio features from the Spotify API
 * @param {string} id - The trackId to fetch data from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {TrackFeatures} - The track features from the Spotify API
 */
 export const getTrackFeatures = async (id: string, bearerToken: string): Promise<TrackFeatures> => {
  const featureResponse = await requestAPI(`https://api.spotify.com/v1/audio-features/${id}`, bearerToken);
  return featureResponse;
}

/**
 * Fetches artist from the Spotify API
 * @param {string} id - The artistId to fetch data from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {Artist} - The artist data from the Spotify API
 */
 export const getArtist = async (id: string, bearerToken: string): Promise<Artist> => {
  const artistResponse = await requestAPI(`https://api.spotify.com/v1/artists/${id}`, bearerToken);
  return artistResponse;
}

/**
 * Fetches album from the Spotify API
 * @param {string} id - The albumId to fetch data from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {Album} - The album data from the Spotify API
 */
 export const getAlbum = async (id: string, bearerToken: string): Promise<Album> => {
  const albumResponse = await requestAPI(`https://api.spotify.com/v1/albums/${id}`, bearerToken);
  return albumResponse;
}

/**
 * Reusable function perform requests to the Spotify API
 * @param {string} url - The url to perform the request to
 * @param {string} bearerToken - The bearer token
 * @returns {Object} - The data from the Spotify API
 */
const requestAPI = async (url: string, bearerToken: string): Promise<T> => {
  const apiUrl = new URL(url);
  let spotifyRequest;
  try {
    spotifyRequest = await request({
      method: 'GET',
      url: `${apiUrl.href}`,
      headers: {Authorization: `Bearer ${bearerToken}`},
    })
  } catch (error) {
    if (error.request) {
      throw new Error('There seems to be a connection issue.')
    } else {
      console.error(error)
      throw error
    }
  }
  // console.log('response data', JSON.parse(spotifyRequest))
  return JSON.parse(spotifyRequest);
}


/**
 * Creates a Obsidian Note from Spotify data
 * @param {object} track - The track data from the Spotify API
 * @returns {Note} - Obsidian Note
 */
 export async function buildNote(track: any, artist: any, album: any, audioFeatures: any): Promise<TFile> {
  // Clean up the track data
  const stockIllegalSymbols = /[\\/:|#^[\]]/g;
  const trackName = track.name.replace(stockIllegalSymbols, '');
  const artistName = artist.name.replace(stockIllegalSymbols, '');
  const normalizedPath = `Song - ${artistName} - ${trackName}.md`;
  const genreArray = artist.genres || [''];
  const genres = genreArray.map(genre => titleCase(genre));

  const artistImage = artist.images[0] ? artist.images[0].url : '';
  const albumImage = album.images[0] ? album.images[0].url : '';
  
  // console.log(genres)
  const { 
    acousticness, 
    danceability, 
    energy, 
    instrumentalness,
    speechiness, 
    tempo, 
    time_signature
  } = audioFeatures;

  console.log('attempting to create file: ' + normalizedPath);
  try {
    let templateContents = '---\n';
    templateContents += `tags:\n`;
    templateContents += `- literature\n`;
    templateContents += `- songs\n`;
    templateContents += `genres:\n`;
    genres.map((tag:string) => (templateContents += `- ${tag}\n`));
    templateContents += `status: unprocessed\n`;
    templateContents += '---\n';
    templateContents += `- Note Title: ${normalizedPath}\n`;
    templateContents += `- Song Title: ${trackName}\n`;
    templateContents += `- Artist: [[Music Artist - ${artistName}]]\n`;
    templateContents += `- Album: [[Album - ${artistName} - ${album.name}]]\n`;
    templateContents += `- Genres: \n`;
    genres.map((tag:string) => (templateContents += `  - [[${tag}]]\n`));
    templateContents += `- Source Link: [Link](${track.href}) \n`;
    templateContents += `- Duration: ${track.duration_ms}ms\n`;
    templateContents += `- Track Popularity: ${track.popularity}\n`;
    templateContents += '---\n';
    templateContents += '\n\n';
    templateContents += '## Notes\n';
    templateContents += '\n\n';
    templateContents += '---\n';
    templateContents += '\n\n';
    templateContents += '### Artist Info\n'
    templateContents += `- Artist: ${artist.name}\n`;
    templateContents += `- Followers: ${artist.followers.total}\n`;
    templateContents += `- Popularity: ${artist.popularity}\n`;
    templateContents += '- Images:\n';
    templateContents += `  - ![](${artistImage})\n`
    templateContents += '\n\n';
    templateContents += '---\n';
    templateContents += '\n\n';
    templateContents += '### Album Info\n'
    templateContents += `- Album: ${album.name}\n`;
    templateContents += `- Release Date: ${album.release_date}\n`;
    templateContents += `- Total Tracks: ${album.total_tracks}\n`;
    templateContents += `- Label: ${album.label}\n`;
    templateContents += '- Images:\n';
    templateContents += `  - ![](${albumImage})\n`
    templateContents += '\n\n';
    templateContents += '---\n';
    templateContents += '\n\n';
    templateContents += '### Audio Features\n';
    templateContents += `- Acousticness: ${acousticness}\n`;
    templateContents += `- Danceability: ${danceability}\n`;
    templateContents += `- Energy: ${energy}\n`;
    templateContents += `- Instrumentalness: ${instrumentalness}\n`;
    templateContents += `- Speechiness: ${speechiness}\n`;
    templateContents += `- Tempo: ${tempo}\n`;
    templateContents += `- Time Signature: ${time_signature}\n`;

    // const createdFile = await vault.create(normalizedPath, templateContents
    //   .replace(/{{\s*title\s*}}/gi, filename) );
    
    const app = window.app as App;
    const { vault } = app;

    const createdFile = await vault.create(
      normalizedPath,
      templateContents,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).foldManager.save(createdFile, "");

    new Notice("Note created successfully");
    return createdFile;
  } catch (err) {
    console.error(`Failed to create file: '${normalizedPath}'`, err);
    new Notice("Unable to create new file.");
  }
}


function titleCase(str) {
  const splitStr = str.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  // Directly return the joined string
  return splitStr.join(' '); 
}

/**
 * Returns bearer token from plugin settings
 * @returns {Note} - Obsidian Note
 */
 export function findBearerToken() {
  // Get the plugin settings and bearer token
  const pluginSettings = window.app.plugins.plugins['spotify-to-obsidian'].settings;
  // console.log('Find Plugin Settings', pluginSettings)
  const bearerToken = pluginSettings.bearerToken || '';
  return bearerToken;
 }