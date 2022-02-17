// src/apiUtils.ts
import {
  // App, 
  Notice, 
  // TFile,
  request,
  // MetadataCache,
  // normalizePath,
  // TFile,
  // Vault,
  // Workspace,
} from "obsidian";
import parseSpotifyUri from 'spotify-uri';
/**
 * Fetches a track object from the Spotify API
 * @param {string} id - The trackId to fetch from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {Track} - The track from the Spotify API
 */
 export const getTrack = async (id: string, bearerToken: string): Promise<Track> => {
  const trackResponse = await requestAPI(`https://api.spotify.com/v1/tracks/${id}`, bearerToken);
  // console.log('trackResponse', trackResponse)
  return trackResponse;
}
/**
 * Fetches wikipedia information about the artist
 * @param {string} artistName - The artist to fetch information about
 * @returns {Object} - The wikipedia information about the artist
*/
 export const getWikipediaInfo = async (artistName: ArtistName): Promise<WikipediaInfo> => {
  // const wikiUrl = new URL(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=&explaintext=&titles=${artistName}`);
  // try {
  //   const wikiResponse = await request(wikiUrl.href);
  //   console.log('wikiResponse', wikiResponse)
  //   const wikiData = JSON.parse(wikiResponse);
  //   console.log('wikiData', wikiData);
  //   const wikiInfo = wikiData.query.pages[Object.keys(wikiData.query.pages)[0]];
  //   console.log('wikiInfo', wikiInfo);
  //   return wikiInfo;
  // } catch (error) {
  //   console.error(error);
  //   return {};
  // }
  return artistName;
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
 * Fetches playlist from the Spotify API
 * @param {string} id - The playlistId to fetch data from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {Playlist} - The playlist data from the Spotify API
 */
 export const getPlaylist = async (id: string, bearerToken: string): Promise<Playlist> => {
  const playlistResponse = await requestAPI(`https://api.spotify.com/v1/playlists/${id}`, bearerToken);
  return playlistResponse;
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

// Track Metadata Functions
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
 * Fetches a track audio analysis from the Spotify API
 * @param {string} id - The trackId to fetch data from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {AudioAnalysis} - The track features from the Spotify API
 */
 export const getAudioAnalysis = async (id: string, bearerToken: string): Promise<AudioAnalysis> => {
  const audioAnalysisResponse = await requestAPI(`https://api.spotify.com/v1/audio-analysis/${id}`, bearerToken);
  return audioAnalysisResponse;
}

// Playlist Metdata Functions
// https://open.spotify.com/playlist/62XU0jZ2Zy95d5QQzhFGsq?si=ff104043591d41a5
// https://open.spotify.com/playlist/15rSpQyYwSx3skNdXujx0T?si=65c73225b4ac41ac
// Query => items(track(name,artists(name),album(name, images)))
/**
 * Fetches a playlists tracks from the Spotify API
 * @param {string} id - The playlistId to fetch data from the Spotify API
 * @param {string} bearerToken - The bearer token
 * @returns {PlaylistTracks} - The track features from the Spotify API
 */
export const getPlaylistTracks = async (id: string, bearerToken: string): Promise<PlaylistTracks> => {
  const playlistTracksResponse = await requestAPI(`https://api.spotify.com/v1/playlists/${id}/tracks`, bearerToken);
  return playlistTracksResponse;
}

// Request Functions
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

/**
 * Extracts a trackId from a Spotify URL
 * @param {string} url - The string that should be the correct url format -> "https://open.spotify.com/album/0BwWUstDMUbgq2NYONRqlu?si=5qGtCb3_Qh2SburnU09NtQ"
 * @returns {string} - Either the trackId or an empty string
 */
 export const deconstructUrl = (url: string): string => {
  const regEx = /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/;
  const match = url.match(regEx);
  if(match){
    const spotifyID = match[2]
    return spotifyID
  }
  return "";
}

// Extract ID from URL and find which type of data to fetch
// Url Formats => 
// -> "https://open.spotify.com/album/0BwWUstDMUbgq2NYONRqlu?si=5qGtCb3_Qh2SburnU09NtQ"
// -> "https://open.spotify.com/track/0BwWUstDMUbgq2NYONRqlu?si=5qGtCb3_Qh2SburnU09NtQ"
// -> "https://open.spotify.com/playlist/62XU0jZ2Zy95d5QQzhFGsq?si=ff104043591d41a5"
export const getDataFromUrl = (url: string): any => {
  const parsed = parseSpotifyUri(url);
  return parsed;
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
    new Notice("There was an error with the Spotify API request - Reset your bearer token in the plugin settings");
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
 * Paginates through Tracks of a playlist
 * @param {string} playlistId - The Spotify ID of the playlist
 * @param {string} bearerToken - The bearer token
 * @returns {Array} - An array of track objects
 * @see https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlist-tracks/
 */
export const getAllPlaylistTracks = async (playlistId: string, trackCount: number,  bearerToken: string): Promise<Array<any>> => {
  // Get the first page of tracks
  let flag = true;
  // let counterBlock = 0;
  const tracksArray = [];
  const query_obj = {limit: 20, offset: 0, parallel: Math.ceil(trackCount/20)};
  const paginateUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(name%2Cartists(name)%2Calbum(name%2C%20images)))`;
  while (flag) {
    // Create Batched Request
    const waitAll = range(query_obj.parallel).map((idx) => 
      requestAPI(`${paginateUrl}&limit=${query_obj.limit}&offset=${(query_obj.offset + idx*query_obj.limit)}`, bearerToken)
    );

    await Promise.all(waitAll).then(result => {
      // Iterate through parallel requests
      result.map(r => {
        // Add tracks to return array
        r.items.forEach(function(element) { 
          tracksArray.push(element);
        });
      })
      // Need to find if any of the results contain no items
      flag = result.every(r => r.items.length > 0)
      // Update offset
      query_obj.offset += query_obj.limit * query_obj.parallel;
    });
  }
  return tracksArray;
}

function range(size, startAt = 0) {
  return [...Array(size).keys()].map(i => i + startAt);
}

// // Authentication Functions
// Params:
const authEndpoint = 'https://accounts.spotify.com/authorize';
const OBSIDIAN_PROTOCOL = "obsidian://";
const OBSIDIAN_AUTH_PROTOCOL_ACTION = "spotify-auth";
const AUTH_REDIRECT_URI = `${OBSIDIAN_PROTOCOL}${OBSIDIAN_AUTH_PROTOCOL_ACTION}`;
const CLIENT_ID = '43d0a1f3979e4916a25c4dee07d33c3a';
// TODO - Change this to a specific scope
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
];

// Spotify Auth Functions
const openBrowserWindow = (url: string) => window.location.assign(url);

export const setupSpotifyAuth = async (): Promise<void> => {
  // console.log('Setting up Spotify Auth');
  const getAuthorizeHref = `${authEndpoint}?client_id=${CLIENT_ID}&redirect_uri=${AUTH_REDIRECT_URI}&scope=${SCOPES.join("%20")}&response_type=token`;
  openBrowserWindow(getAuthorizeHref);
}

export const getAccessToken = (hash: string) => {
  const params = new URLSearchParams(hash);
  // console.log('Params', params)
  // console.log('getHashParams', params.get('access_token'))
  return params.get('access_token');
}

export const storeSpotifyToken = async (token: string) => {
  window.app.plugins.plugins['spotify-to-obsidian'].settings.bearerToken = token;
  await window.app.plugins.plugins['spotify-to-obsidian'].saveSettings()
  new Notice("Logged into Spotify successfully");
}