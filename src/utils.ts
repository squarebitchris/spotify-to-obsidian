// src/utils.ts
import { request } from 'obsidian';
import { App, Notice, TFile } from "obsidian";

// Spotify API Resource Functions

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


// miliseconds to minutes:seconds
export const msToMinSec = (ms: number): string => {
  console.log('input', ms);
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  console.log('minutes', minutes);
  console.log('seconds', seconds);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// seconds to minutes:seconds
export const secToMinSec = (sec: number): string => {
  console.log('input', sec);
  const minutes = Math.floor(sec / 60);
  const seconds = (sec % 60).toFixed(0);
  console.log('minutes', minutes);
  console.log('seconds', seconds);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// Obsidian Note Functions
/**
 * Creates a Obsidian Note from Spotify track
 * @param {object} track - The track data from the Spotify API
 * @returns {Note} - Obsidian Note
 */
 export async function buildSongNote(track: any, artist: any, album: any, audioFeatures: any, audioAnalysis: any): Promise<TFile> {
  // Clean up the track data
  const stockIllegalSymbols = /[\\/:|#^[\]]/g;
  const trackName = track.name.replace(stockIllegalSymbols, '');
  const artistName = artist.name.replace(stockIllegalSymbols, '');
  const normalizedPath = `Song - ${artistName} - ${trackName}.md`;
  const genreArray = artist.genres || [''];
  const genres = genreArray.map(genre => titleCase(genre));

  const artistImage = artist.images[0] ? artist.images[0].url : '';
  const albumImage = album.images[0] ? album.images[0].url : '';

  const PITCH_NOTATION = {
    0: 'C',
    1: 'C#/Db',
    2: 'D',
    3: 'D#/Eb',
    4: 'E',
    5: 'F',
    6: 'F#/Gb',
    7: 'G',
    8: 'G#/Ab',
    9: 'A',
    10: 'A#/Bb',
    11: 'B',
  }
  
  console.log('audioAnalysis', audioAnalysis)
  const { 
    acousticness, 
    danceability, 
    energy, 
    instrumentalness,
    speechiness, 
    tempo, 
    time_signature
  } = audioFeatures;

  const {
    bars,
    // beats,
    sections,
    // segments,
    // tatums
  } = audioAnalysis;

  console.log('attempting to create file: ' + normalizedPath);
  try {
    let templateContents = '---\n';
    templateContents += `tags:\n`;
    templateContents += `- literature\n`;
    templateContents += `- songs\n`;
    templateContents += `genres:\n`;
    genres.map((tag:string) => (templateContents += `- ${tag}\n`));
    templateContents += `audio-acousticness: ${acousticness}\n`;
    templateContents += `audio-danceability: ${danceability}\n`;
    templateContents += `audio-energy: ${energy}\n`;
    templateContents += `audio-instrumentalness: ${instrumentalness}\n`;
    templateContents += `audio-speechiness: ${speechiness}\n`;
    templateContents += `audio-tempo: ${tempo}\n`;
    templateContents += `song-duration: ${msToMinSec(track.duration_ms)}\n`;
    templateContents += `status: unprocessed\n`;
    templateContents += '---\n';
    templateContents += `- Note Title: ${normalizedPath}\n`;
    templateContents += `- Song Title: ${trackName}\n`;
    templateContents += `- Artist: [[Music Artist - ${artistName}]]\n`;
    templateContents += `- Album: [[Album - ${artistName} - ${album.name}]]\n`;
    templateContents += `- Genres: \n`;
    genres.map((tag:string) => (templateContents += `  - [[${tag}]]\n`));
    templateContents += `- Source Link: [Link](${track.href}) \n`;
    templateContents += `- Duration: ${msToMinSec(track.duration_ms)}\n`;
    templateContents += `- Track Popularity: ${track.popularity}\n`;
    templateContents += '---\n';
    templateContents += '## Notes\n';
    templateContents += '\n';
    templateContents += '---\n';
    templateContents += '### Artist Info\n'
    templateContents += `- Artist: ${artist.name}\n`;
    templateContents += `- Followers: ${artist.followers.total}\n`;
    templateContents += `- Popularity: ${artist.popularity}\n`;
    templateContents += '- Images:\n';
    templateContents += `  - ![](${artistImage})\n`
    templateContents += '\n';
    templateContents += '---\n';
    templateContents += '### Album Info\n'
    templateContents += `- Album: ${album.name}\n`;
    templateContents += `- Release Date: ${album.release_date}\n`;
    templateContents += `- Total Tracks: ${album.total_tracks}\n`;
    templateContents += `- Label: ${album.label}\n`;
    templateContents += '- Images:\n';
    templateContents += `  - ![](${albumImage})\n`
    templateContents += '\n';
    templateContents += '---\n';
    templateContents += '### Audio Features\n';
    templateContents += `- Acousticness: ${acousticness}\n`;
    templateContents += `- Danceability: ${danceability}\n`;
    templateContents += `- Energy: ${energy}\n`;
    templateContents += `- Instrumentalness: ${instrumentalness}\n`;
    templateContents += `- Speechiness: ${speechiness}\n`;
    templateContents += `- Tempo: ${tempo}\n`;
    templateContents += `- Time Signature: ${time_signature}\n`;

    templateContents += '\n';
    templateContents += '```chart\n';
    templateContents += '    type: bar\n';
    templateContents += '    labels: [Accousticness, Danceability, Energy, Instrumentalness, Speechiness]\n';
    templateContents += '    series: \n';
    templateContents += '      - title: Audio Features\n';
    templateContents += `        data: [${acousticness}, ${danceability}, ${energy}, ${instrumentalness}, ${speechiness}]\n`;
    templateContents += '```\n';
    templateContents += '\n';

    // Audio Analysis
    templateContents += '\n';
    templateContents += '---\n';
    templateContents += '## Audio Analysis\n'
    // Sections
    // Sections are defined by large variations in rhythm or timbre, e.g. chorus, verse, bridge, guitar solo, etc. 
    // Each section contains its own descriptions of tempo, key, mode, time_signature, and loudness.
    const sectionMaps = [];
    const sectionDurationIds = [];
    templateContents += '\n';
    templateContents += '### Sections\n';
    templateContents += '\n';
    templateContents += 'Section | Start | Duration | Tempo | Loudness | Key\n';
    templateContents += ':----:|:----:|:----:|:----:|:----:|:----:\n';
    sections.map((section: any, index) => {
      templateContents += `${index} | ${secToMinSec(section.start)} | ${section.duration} | ${section.tempo} | ${section.loudness} | ${PITCH_NOTATION[section.key]}\n`;
      sectionMaps.push({ section_number: index, start: section.start, duration: section.duration, tempo: section.tempo, loudness: section.loudness, key: section.key});
      sectionDurationIds.push(index);
    });

    const sectionDurations = sections.map((section: any) => section.duration);
    templateContents += '\n\n';
    templateContents += '```chart\n';
    templateContents += '    type: bar\n';
    templateContents += `    labels: [${sectionDurationIds}]\n`;
    templateContents += '    series: \n';
    templateContents += '      - title: Sections\n';
    templateContents += `        data: [${sectionDurations}]\n`;
    templateContents += '```\n';
    templateContents += '\n\n';

    // For each section, we need to get the bars that are within that section
    // We need to get the bars that are within that section
    sectionMaps.forEach((sectionMap: any) => {
      const { section_number, start, duration } = sectionMap;
      const sectionBars = bars.filter((bar: any) => {
        return (bar.start >= start && bar.start <= (start + (duration + 1)));
      });
      // Bars
      // The time intervals of the bars throughout the track. A bar (or measure) is a segment of time defined as a given number of beats.
      templateContents += '\n\n';
      templateContents += `### Section ${section_number} Bars\n`;
      templateContents += `Section Count: ${sectionBars.length}\n`;
      templateContents += `Section Time: ${secToMinSec(start)} -> ${secToMinSec(start + duration)}\n`;
      templateContents += `Tempo: => ${sectionMap.tempo}\n`;
      templateContents += `Loudness: => ${sectionMap.loudness}\n`;
      templateContents += `Key: => ${PITCH_NOTATION[sectionMap.key]}\n`;
      templateContents += '\n';
      templateContents += 'Start | Duration\n';
      templateContents += ':----:|:----:\n';
      sectionBars.map((bar: any) => {
        templateContents += `${secToMinSec(bar.start)} | ${bar.duration}\n`;
      });
    });

    // Beats
    // The time intervals of beats throughout the track. A beat is the basic time unit of a piece of music; for example, 
    // each tick of a metronome. Beats are typically multiples of tatums.
    // templateContents += '\n\n';
    // templateContents += '### Beats\n';
    // templateContents += '\n\n';
    // templateContents += 'Start | Duration\n';
    // templateContents += ':----:|:----:\n';
    // beats.map((bar: any) => {
    //   templateContents += `${bar.start} | ${bar.duration}\n`;
    // });

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

/**
 * Creates a Obsidian Note from Spotify playlist
 * @param {object} playlist - The track data from the Spotify API
 * @returns {Note} - Obsidian Note
 */
 export async function buildPlaylistNote(playlist:any, playlistTracks:any): Promise<TFile> {
  // Clean up the playlist data
  const stockIllegalSymbols = /[\\/:|#^[\]]/g;
  const playlistName = playlist.name.replace(stockIllegalSymbols, '');
  const normalizedPath = `Playlist - ${playlistName}.md`;
  const tracks = playlistTracks || [];

  // const genreArray = artist.genres || [''];
  // const genres = genreArray.map(genre => titleCase(genre));
  // const artistImage = artist.images[0] ? artist.images[0].url : '';
  // const albumImage = album.images[0] ? album.images[0].url : '';
  // templateContents += `genres:\n`;
  // genres.map((tag:string) => (templateContents += `- ${tag}\n`));

  console.log('attempting to create file: ' + normalizedPath);
  try {
    let templateContents = '---\n';
    templateContents += `tags:\n`;
    templateContents += `- literature\n`;
    templateContents += `- playlists\n`;
    templateContents += `status: unprocessed\n`;
    templateContents += '---\n';
    templateContents += `- Note Title: ${normalizedPath}\n`;
    templateContents += `- Playlist Title: ${playlistName}\n`;
    templateContents += `- Source Link: [Link](${playlist.href}) \n`;
    templateContents += `- Total Tracks: ${playlist.tracks.total}\n`;
    templateContents += '---\n';
    templateContents += '\n\n';
    templateContents += '## Notes\n';
    templateContents += '\n\n';
    templateContents += '---\n';
    templateContents += '\n\n';
    templateContents += '### Tracks Info\n'
    templateContents += '\n\n';
    templateContents += 'Image | Artist | Track Name \n';
    templateContents += ':----:|:----:|:----:\n';
    tracks.map((track: any) => {
      const { artists, album } = track.track;
      const artistTitle = artists.map((artist: any) => artist.name).join(', ');
      const albumImage = album.images[0] ? album.images[album.images.length - 1].url : '';
      templateContents += ` ![](${albumImage}) | ${artistTitle} | ${track.track.name}\n`;
    });

    templateContents += '---\n';
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
  console.log('Setting up Spotify Auth');
  const getAuthorizeHref = `${authEndpoint}?client_id=${CLIENT_ID}&redirect_uri=${AUTH_REDIRECT_URI}&scope=${SCOPES.join("%20")}&response_type=token`;
  openBrowserWindow(getAuthorizeHref);
}

export const getAccessToken = (hash: string) => {
  const params = new URLSearchParams(hash);
  console.log('Params', params)
  console.log('getHashParams', params.get('access_token'))
  return params.get('access_token');
}

export const storeSpotifyToken = async (token: string) => {
  window.app.plugins.plugins['spotify-to-obsidian'].settings.bearerToken = token;
  await window.app.plugins.plugins['spotify-to-obsidian'].saveSettings()
  new Notice("Logged into Spotify successfully");
}
