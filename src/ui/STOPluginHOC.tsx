import * as React from "react";
import { deconstructUrl, getDataFromUrl, getTrack, getTrackFeatures, getAudioAnalysis, getArtist, getAlbum, buildSongNote, buildPlaylistNote, findBearerToken, getPlaylist, getAllPlaylistTracks, getWikipediaInfo } from '../utils';
import { Notice } from "obsidian";

export default function STOPluginHOC(): JSX.Element {
  // Input State
  const [trackInput, setTrackInput] = React.useState("");
  const [trackId, setTrackId] = React.useState("");
  const [playlistInput, setPlaylistInput] = React.useState("");
  const [playlistId, setPlaylistId] = React.useState("");
  // Query state
  const [track, setTrack] = React.useState({});
  const [audioFeatures, setAudioFeatures] = React.useState({});
  const [audioAnalysis, setAudioAnalysis] = React.useState({});
  const [artist, setArtist] = React.useState({});
  const [album, setAlbum] = React.useState({});
  const [playlist, setPlaylist] = React.useState({});
  const [playlistTracks, setPlaylistTracks] = React.useState([]);
  // Request state
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);


  const trackChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the user input state
    setTrackInput(e.target.value);
    // Validate user input for Spotify ID
    const spotifyID = deconstructUrl(e.target.value);

    const urlData = getDataFromUrl(e.target.value);
    console.log('urlData', urlData);
    if(spotifyID){
      setTrackId(spotifyID);
    } else {
      setTrackId("...");
    }
  }

  const getTrackDataFromApi = async () => {
    // Search Spotify for track information
    // Acquire bearer token
    const bearerToken = findBearerToken();
    // Query Spotify API for track info
    const trackData = await getTrack(trackId, bearerToken);
    const artistId = trackData.artists[0].id;
    const albumId = trackData.album.id;
    const audioFeaturesData = await getTrackFeatures(trackId, bearerToken);
    const audioAnalysisData = await getAudioAnalysis(trackId, bearerToken);
    const artistData = await getArtist(artistId, bearerToken);
    const albumData = await getAlbum(albumId, bearerToken);
    // Update state
    setTrack(trackData);
    setAudioFeatures(audioFeaturesData);
    setAudioAnalysis(audioAnalysisData);
    setArtist(artistData);
    setAlbum(albumData);
    // Reset input
    setTrackInput("");
    setTrackId("");
    setIsLoading(false);
  }

  const searchTrackHandler = async () => {
    // Set loading state
    setIsLoading(true);

    // await getWikipediaInfo('(band) Low');
    await getTrackDataFromApi()
      .then(() => {
        setIsLoading(false)
      })
      .catch(() => {
        // Your error is here!
        console.log('error response')
        new Notice("There was an error with the Spotify API request - Reset your bearer token in the plugin settings");
        throw new Error('There seems to be a connection issue.')
      });
  }

  const createSongNoteHandler = async () => {
    // Set loading state
    setIsLoading(true);
    // Create note
    const note = await buildSongNote(track, artist, album, audioFeatures, audioAnalysis);
    console.log('Note Methods', note);
    setIsLoading(false);
    return null;
  }

  const renderTrackInfo = () => {
    if(isLoading){
      return <h3>Loading...</h3>
    } else if(isError){
      return <h3>Error!</h3>
    } else {
      return (
        <div >
          {/* if data is filled render here */}
          {(!isEmpty(track) && audioFeatures && artist && album) && (
            <div>
              <TrackDataCard track={track} />
              <button onClick={createSongNoteHandler}>
                Create Note for Track
              </button>
              <ArtistCard artist={artist} />
              <AlbumCard album={album} />
              <AudioFeaturesCard audioFeatures={audioFeatures} />
            </div>
           )}
        </div>
      )
    }
  }


  const playlistChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the user input state
    setPlaylistInput(e.target.value);
    // Validate user input for Spotify ID
    const spotifyID = deconstructUrl(e.target.value);
    if(spotifyID){
      setPlaylistId(spotifyID);
    } else {
      setPlaylistId("...");
    }
  }

  const searchPlaylistHandler = async () => {
    // Set loading state
    setIsLoading(true);
    // Acquire bearer token
    const bearerToken = findBearerToken();
    // Query Spotify API for playlist info
    const playlistData = await getPlaylist(playlistId, bearerToken);
    // Query Spotify API for playlist tracks
    const trackCount = playlistData.tracks.total;
    let playlistTracksData = await getAllPlaylistTracks(playlistId, trackCount, bearerToken);
    console.log('Playlist Data', playlistData);
    console.log('Playlist Items', playlistTracksData);
    // Update state
    setPlaylist(playlistData);
    setPlaylistTracks(playlistTracksData);
    // Reset input
    setPlaylistInput("");
    setPlaylistId("");
    setIsLoading(false);
    return null;
  }

  const createPlaylistNoteHandler = async () => {
    // Set loading state
    setIsLoading(true);
    // Create note
    const note = await buildPlaylistNote(playlist, playlistTracks);
    console.log('Note Methods', note);
    setIsLoading(false);
    return null;
  }

  const renderPlaylistInfo = () => {
    if(isLoading){
      return <h3>Loading...</h3>
    } else if(isError){
      return <h3>Error!</h3>
    } else {
      return (
        <div >
          {/* if data is filled render here */}
          {(!isEmpty(playlist) && playlistTracks) && (
            <div>
              <PlaylistDataCard playlist={playlist} />
              <button onClick={createPlaylistNoteHandler}>
                Create Note for Playlist
              </button>
            </div>
           )}
        </div>
      )
    }
  }
  return (
    <>
      {/* Track Query Form */}
      <div className="STOPluginHOC__container">
        <p>Paste Spotify Track Link</p>
        <input onChange={trackChangeHandler} value={trackInput}></input>
      </div>
      <p>Track ID: </p>
      <h4>{trackId}</h4>
      <button onClick={searchTrackHandler}>
        Search for Track
      </button>
      
      {/* Playlist Query */}
      <div className="STOPluginHOC__container">
        <p>Paste Spotify Playlist Link</p>
        <input onChange={playlistChangeHandler} value={playlistInput}></input>
      </div>
      <p>Playlist ID: </p>
      <h4>{trackId}</h4>
      <button onClick={searchPlaylistHandler}>
        Search for Playlist
      </button>

      {/* Card Component for Track Data */}
      {renderTrackInfo()}

      {/* Card Component for Playlist Data */}
      {renderPlaylistInfo()}
    </>
  );
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const TrackDataCard = (props: any) => {
  const { name, popularity } = props.track;
  return (
    <div>
      <h3>Track: {name}</h3>
      <p>Popularity: {popularity}</p>
      <hr />
    </div>
  )
}

const AudioFeaturesCard = (props: any) => {
  const { 
    acousticness, 
    danceability, 
    energy, 
    instrumentalness,
    speechiness, 
    tempo, 
    time_signature
  } = props.audioFeatures;
  return (
    <div>
      <h3>Audio Features</h3>
      <ul>
        <li>Acousticness: {acousticness}</li>
        <li>Danceability: {danceability}</li>
        <li>Energy: {energy}</li>
        <li>Instrumentalness: {instrumentalness}</li>
        <li>Speechiness: {speechiness}</li>
        <li>Tempo: {tempo}</li>
        <li>Time Signature: {time_signature}</li>
      </ul>
      <hr />
    </div>
  )
}

const ArtistCard = (props: any) => {
  const { name, followers, genres, images, popularity } = props.artist;
  return (
    <div>
      <h3>Artist</h3>
      <ul>
        <li>Name: {name}</li>
        <li>Followers: {followers.total}</li>
        <li>Genres: {genres.join(", ")}</li>
        <li>Popularity: {popularity}</li>
        <li><img src={images[0].url} alt="artist" /></li>
      </ul>
      <hr />
    </div>
  )
}

const AlbumCard = (props: any) => {
  const { name, release_date, total_tracks, label, images } = props.album;
  return (
    <div>
      <h3>Album</h3>
      <ul>
        <li>Name: {name}</li>
        <li>Release Date: {release_date}</li>
        <li>Total Tracks: {total_tracks}</li>
        <li>Label: {label}</li>
        <li><img src={images[0].url} alt="artist" /></li>
      </ul>
      <hr />
    </div>
  )
}

const PlaylistDataCard = (props: any) => {
  const { name, description, href, id, tracks, owner  } = props.playlist;
  const { display_name } = owner;
  const { total } = tracks;
  return (
    <div>
      <h3>Playlist: {name}</h3>
      <p>Description: {description}</p>
      <p>Playlist ID: {id}</p>
      <p>Playlist URL: {href}</p>
      <p>Owner: {display_name}</p>
      <p>Total Tracks: {total}</p>
      <hr />
    </div>
  )
}