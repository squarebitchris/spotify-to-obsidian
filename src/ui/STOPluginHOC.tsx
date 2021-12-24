import * as React from "react";
import { deconstructUrl, getTrack, getTrackFeatures, getAudioAnalysis, getArtist, getAlbum, buildNote, findBearerToken } from '../utils';

export default function STOPluginHOC(): JSX.Element {
  // Input State
  const [userInput, setUserInput] = React.useState("");
  const [trackId, setTrackId] = React.useState("");
  // Query state
  const [track, setTrack] = React.useState({});
  const [audioFeatures, setAudioFeatures] = React.useState({});
  const [audioAnalysis, setAudioAnalysis] = React.useState({});
  const [artist, setArtist] = React.useState({});
  const [album, setAlbum] = React.useState({});
  // Request state
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the user input state
    setUserInput(e.target.value);
    // Validate user input for Spotify ID
    const spotifyID = deconstructUrl(e.target.value);
    if(spotifyID){
      setTrackId(spotifyID);
    } else {
      setTrackId("...");
    }
  }

  const searchTrackHandler = async () => {
    // Set loading state
    setIsLoading(true);
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
    setUserInput("");
    setTrackId("");
    setIsLoading(false);
    return null;
  }

  const createNoteHandler = async () => {
    // Set loading state
    setIsLoading(true);
    // Create note
    const note = await buildNote(track, artist, album, audioFeatures, audioAnalysis);
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
              <button onClick={createNoteHandler}>
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

  return (
    <>
      <div className="STOPluginHOC__container">
        <p>Paste Spotify Track Link</p>
        <input onChange={changeHandler} value={userInput}></input>
      </div>
      <p>Track ID: </p>
      <h4>{trackId}</h4>
      <button onClick={searchTrackHandler}>
        Search for Track
      </button>
      {/* Card Component for Track Data */}
      {renderTrackInfo()}
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