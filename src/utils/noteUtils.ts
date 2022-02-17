// src/utils.ts
import {
  App, 
  Notice, 
  TFile,
  // request,
  // MetadataCache,
  normalizePath,
  // TFile,
  // Vault,
  // Workspace,
} from "obsidian";


// Note Template Functions

export function getTemplateSetting() {
  // Get the plugin settings 
  const pluginSettings = window.app.plugins.plugins['spotify-to-obsidian'].settings;
  // console.log('Find Plugin Settings', pluginSettings)
  const settingValue = pluginSettings.songNoteTemplate || '';
  return settingValue;
}

export const loadTemplate = (vault, metadataCache) => async (templatePath: string): Promise<> => {
    const normalizedTemplatePath = normalizePath(templatePath);
    try {
      const templateFile = metadataCache.getFirstLinkpathDest(
        normalizedTemplatePath,
        ""
      );

      if (!templateFile) {
        const errMsg = `Unable to find template file at ${normalizedTemplatePath}`;
        // console.log(errMsg);
        new Notice(errMsg);
        return null;
      }

      const templateContents = vault.cachedRead(templateFile);

      return templateContents;
    } catch (err) {
      // console.log(`Failed to load template from ${normalizedTemplatePath}`, err);
      new Notice("Failed to load Spotify note template settings");
      return null;
    }
  };

// Obsidian Note Functions
/**
 * Creates a Obsidian Note from Spotify track
 * @param {object} track - The track data from the Spotify API
 * @returns {Note} - Obsidian Note
 */
 export async function buildSongNote(track: any, artist: any, album: any, audioFeatures: any, audioAnalysis: any): Promise<TFile> {
  const app = window.app as App;
  const { vault, metadataCache } = app;

  // Generate File Name
  const stockIllegalSymbols = /[\\/:|#^[\]]/g;
  const trackName = track.name.replace(stockIllegalSymbols, '');
  const artistName = artist.name.replace(stockIllegalSymbols, '');
  const normalizedPath = `Song - ${artistName} - ${trackName}.md`;
  try {
    // Attempt to load template
    const templateSetting = getTemplateSetting();
    const templateData = await loadTemplate(vault, metadataCache)(templateSetting);
    // console.log('templateData', templateData)
    // const templateData = templateSetting ? await loadTemplate(vault, metadataCache)(templateSetting) : "";
    let templateContents = "";
    // if a template is found, use it to generate the note contents
    if (templateData) {
      // Replace template variables
      new Notice("Creating note from template");
      templateContents = generateTemplateSongNote(templateData, track, artist, album, audioFeatures, audioAnalysis);
    } else {
      // If no template is found, use the default template
      templateContents = generateDefaultSongNote(track, artist, album, audioFeatures, audioAnalysis);
    }

    // Create note file
    const createdFile = await vault.create(
      normalizedPath,
      templateContents,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).foldManager.save(createdFile, "");

    new Notice(` Song Note created successfully: Song - ${artistName} - ${trackName}`);
    return createdFile;
  } catch (err) {
    console.error(`Failed to create file: '${normalizedPath}'`, err);
    new Notice("Unable to create new file.");
  }
}

const stockIllegalSymbols = /[\\/:|#^[\]]/g;

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

// Todo - Refactor the fuck out of this
function generateDefaultSongNote(track, artist, album, audioFeatures, audioAnalysis) {
  let templateContents = '';
  // Clean up the track data
  const trackName = track.name.replace(stockIllegalSymbols, '');
  const artistName = artist.name.replace(stockIllegalSymbols, '');
  const normalizedPath = `Song - ${artistName} - ${trackName}.md`;
  const genreArray = artist.genres || [''];
  const genres = genreArray.map(genre => titleCase(genre));

  const artistImage = artist.images[0] ? artist.images[0].url : '';
  const albumImage = album.images[0] ? album.images[0].url : '';

  // console.log('audioAnalysis', audioAnalysis)
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

  // try {
    templateContents = '---\n';
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
    templateContents += `- Source Link: [Link](https://open.spotify.com/track/${track.id}) \n`;
    templateContents += `- Duration: ${msToMinSec(track.duration_ms)}\n`;
    templateContents += `- Track Popularity: ${track.popularity}\n`;
    templateContents += '---\n';
    templateContents += '### Play\n';
    templateContents += '\n';
    templateContents += `<iframe src="https://open.spotify.com/embed/track/${track.id}?utm_source=generator" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    templateContents += '\n\n';
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
    return templateContents;
  // }
}

// Todo - Refactor the fuck out of this = 
const generateTemplateSongNote = (templateContents, track, artist, album, audioFeatures, audioAnalysis) => {
  // {{SONG_TITLE}}
  const trackName = track.name.replace(stockIllegalSymbols, '');
  // {{ARTIST_NAME}}
  const artistName = artist.name.replace(stockIllegalSymbols, '');
  // {{FILE_NAME}}
  const fileName = `Song - ${artistName} - ${trackName}`;
  // {{ALBUM_NAME}}
  const albumName = album.name.replace(stockIllegalSymbols, '');
  // {{LIST_GENRES_AS_TAGS}}
  const genreArray = artist.genres || [''];
  let listGenresAsTags = '';
  genreArray.map((tag:string, i, {length}) => ( 
    (length - 1 === i) ? 
      listGenresAsTags += `- ${titleCase(tag)}` : listGenresAsTags += `- ${titleCase(tag)}\n`
  ));
  // {{AUDIO_FEATURES_AS_TAGS}}
  const { 
    acousticness, 
    danceability, 
    energy, 
    instrumentalness,
    speechiness, 
    tempo, 
    time_signature
  } = audioFeatures;
  let audioFeaturesAsTags = '';
  audioFeaturesAsTags += `audio-acousticness: ${acousticness}\n`;
  audioFeaturesAsTags += `audio-danceability: ${danceability}\n`;
  audioFeaturesAsTags += `audio-energy: ${energy}\n`;
  audioFeaturesAsTags += `audio-instrumentalness: ${instrumentalness}\n`;
  audioFeaturesAsTags += `audio-speechiness: ${speechiness}\n`;
  audioFeaturesAsTags += `audio-tempo: ${tempo}\n`;
  audioFeaturesAsTags += `song-duration: ${msToMinSec(track.duration_ms)}`;
  // {{LIST_GENRES_AS_LINKS}}
  let listGenresAsLinks = '';
  genreArray.map((tag:string, i, {length}) => ( 
    (length - 1 === i) ? 
      listGenresAsLinks += `  - [[${titleCase(tag)}]]` :  `  - [[${titleCase(tag)}]]\n`
  ));
  // {{SPOTIFY_LINK}}
  const spotifyLink = `[Link](https://open.spotify.com/track/${track.id})`;
  // {{SONG_DURATION}}
  const songDuration = msToMinSec(track.duration_ms);
  // {{SONG_POPULARITY}}
  const songPopularity = track.popularity;
  // {{ARTIST_FOLLOWERS}}
  const artistFollowers = artist.followers.total;
  // {{ARTIST_POPULARITY}}
  const artistPopularity = artist.popularity;
  // {{ARTIST_IMAGE}}
  const artistImage = artist.images[0] ? `![](${artist.images[0].url})` : '';
  // {{ALBUM_RELEASE_DATE}}
  const albumReleaseDate = album.release_date;
  // {{ALBUM_TOTAL_TRACKS}}
  const albumTotalTracks = album.total_tracks;
  // {{ALBUM_LABEL}}
  const albumLabel = album.label;
  // {{ALBUM_IMAGE}}
  const albumImage = album.images[0] ? `![](${album.images[0].url})` : ''; 
  // {{PLAY_SECTION}}
  let playSection = '';
  playSection += '### Play\n';
  playSection += '\n';
  playSection += `<iframe src="https://open.spotify.com/embed/track/${track.id}?utm_source=generator" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
  playSection += '\n\n';
  playSection += '---\n';
  // {{AUDIO_FEATURES_LIST}}
  let audioFeaturesList = '';
  audioFeaturesList += `- Acousticness: ${acousticness}\n`;
  audioFeaturesList += `- Danceability: ${danceability}\n`;
  audioFeaturesList += `- Energy: ${energy}\n`;
  audioFeaturesList += `- Instrumentalness: ${instrumentalness}\n`;
  audioFeaturesList += `- Speechiness: ${speechiness}\n`;
  audioFeaturesList += `- Tempo: ${tempo}\n`;
  audioFeaturesList += `- Time Signature: ${time_signature}\n`;
  // {{AUDIO_FEATURES_CHART}}
  let audioFeaturesChart = '';
  audioFeaturesChart += '\n';
  audioFeaturesChart += '```chart\n';
  audioFeaturesChart += '    type: bar\n';
  audioFeaturesChart += '    labels: [Accousticness, Danceability, Energy, Instrumentalness, Speechiness]\n';
  audioFeaturesChart += '    series: \n';
  audioFeaturesChart += '      - title: Audio Features\n';
  audioFeaturesChart += `        data: [${acousticness}, ${danceability}, ${energy}, ${instrumentalness}, ${speechiness}]\n`;
  audioFeaturesChart += '```\n';
  audioFeaturesChart += '\n';
  // {{AUDIO_ANALYSIS_SECTIONS_TABLE}}
  const {
    bars,
    sections,
  } = audioAnalysis;
  const sectionMaps = [];
  const sectionDurationIds = [];
  let audioAnalysisSectionsTable = '';
  audioAnalysisSectionsTable += '\n';
  audioAnalysisSectionsTable += 'Section | Start | Duration | Tempo | Loudness | Key\n';
  audioAnalysisSectionsTable += ':----:|:----:|:----:|:----:|:----:|:----:\n';
  sections.map((section: any, index) => {
    audioAnalysisSectionsTable += `${index} | ${secToMinSec(section.start)} | ${section.duration} | ${section.tempo} | ${section.loudness} | ${PITCH_NOTATION[section.key]}\n`;
    sectionMaps.push({ section_number: index, start: section.start, duration: section.duration, tempo: section.tempo, loudness: section.loudness, key: section.key});
    sectionDurationIds.push(index);
  });
  // {{AUDIO_ANALYSIS_SECTIONS_CHART}}
  let audioAnalysisSectonsChart = '';
  const sectionDurations = sections.map((section: any) => section.duration);
  audioAnalysisSectonsChart += '\n\n';
  audioAnalysisSectonsChart += '```chart\n';
  audioAnalysisSectonsChart += '    type: bar\n';
  audioAnalysisSectonsChart += `    labels: [${sectionDurationIds}]\n`;
  audioAnalysisSectonsChart += '    series: \n';
  audioAnalysisSectonsChart += '      - title: Sections\n';
  audioAnalysisSectonsChart += `        data: [${sectionDurations}]\n`;
  audioAnalysisSectonsChart += '```\n';
  audioAnalysisSectonsChart += '\n\n';
  // {{AUDIO_ANALYSIS_SECTION_DETAILS}}
  let audioAnalysisSectionDetails = '';
  sectionMaps.forEach((sectionMap: any) => {
    const { section_number, start, duration } = sectionMap;
    const sectionBars = bars.filter((bar: any) => {
      return (bar.start >= start && bar.start <= (start + (duration + 1)));
    });
    // Bars
    // The time intervals of the bars throughout the track. A bar (or measure) is a segment of time defined as a given number of beats.
    audioAnalysisSectionDetails += '\n\n';
    audioAnalysisSectionDetails += `### Section ${section_number} Bars\n`;
    audioAnalysisSectionDetails += `Section Count: ${sectionBars.length}\n`;
    audioAnalysisSectionDetails += `Section Time: ${secToMinSec(start)} -> ${secToMinSec(start + duration)}\n`;
    audioAnalysisSectionDetails += `Tempo: => ${sectionMap.tempo}\n`;
    audioAnalysisSectionDetails += `Loudness: => ${sectionMap.loudness}\n`;
    audioAnalysisSectionDetails += `Key: => ${PITCH_NOTATION[sectionMap.key]}\n`;
    audioAnalysisSectionDetails += '\n';
    audioAnalysisSectionDetails += 'Start | Duration\n';
    audioAnalysisSectionDetails += ':----:|:----:\n';
    sectionBars.map((bar: any) => {
      audioAnalysisSectionDetails += `${secToMinSec(bar.start)} | ${bar.duration}\n`;
    });
  });

  const songItem =  {
    resolved_song_title: trackName,
    resolved_artist_name: artistName,
    resolved_file_name: fileName,
    resolved_album_name: albumName,
    resolved_list_genres_as_tags: listGenresAsTags,
    resolved_audio_features_as_tags: audioFeaturesAsTags,
    resolved_list_genres_as_links: listGenresAsLinks,
    resolved_spotify_link: spotifyLink,
    resolved_song_duration: songDuration,
    resolved_play_section: playSection,
    resolved_song_popularity: songPopularity,
    resolved_artist_followers: artistFollowers,
    resolved_artist_popularity: artistPopularity,
    resolved_artist_image: artistImage,
    resolved_album_release_date: albumReleaseDate,
    resolved_album_total_tracks: albumTotalTracks,
    resolved_album_label: albumLabel,
    resolved_album_image: albumImage,
    resolved_audio_features_list: audioFeaturesList,
    resolved_audio_features_chart: audioFeaturesChart,
    resolved_audio_analysis_sections_table: audioAnalysisSectionsTable,
    resolved_audio_analysis_sections_chart: audioAnalysisSectonsChart,
    resolved_audio_analysis_section_details: audioAnalysisSectionDetails,
  } 
  const substitutions = new Map([
    ["SONG_TITLE", (item) => item.resolved_song_title ?? "Untitled"],
    ["ARTIST_NAME", (item) => item.resolved_artist_name ?? "Unknown"],
    ["FILE_NAME", (item) => item.resolved_file_name ?? "Untitled"],
    ["ALBUM_NAME", (item) => item.resolved_album_name ?? "Unknown"],
    ["LIST_GENRES_AS_TAGS", (item) => item.resolved_list_genres_as_tags ?? "Unknown"],
    ["AUDIO_FEATURES_AS_TAGS", (item) => item.resolved_audio_features_as_tags ?? "Unknown"],
    ["LIST_GENRES_AS_LINKS", (item) => item.resolved_list_genres_as_links ?? "Unknown"],
    ["SPOTIFY_LINK", (item) => item.resolved_spotify_link ?? "Unknown"],
    ["SONG_DURATION", (item) => item.resolved_song_duration ?? "Unknown"],
    ["SONG_POPULARITY", (item) => item.resolved_song_popularity ?? "Unknown"],
    ["PLAY_SECTION", (item) => item.resolved_play_section ?? "Unknown"],
    ["ARTIST_FOLLOWERS", (item) => item.resolved_artist_followers ?? "Unknown"],
    ["ARTIST_POPULARITY", (item) => item.resolved_artist_popularity ?? "Unknown"],
    ["ARTIST_IMAGE", (item) => item.resolved_artist_image ?? "Unknown"],
    ["ALBUM_RELEASE_DATE", (item) => item.resolved_album_release_date ?? "Unknown"],
    ["ALBUM_TOTAL_TRACKS", (item) => item.resolved_album_total_tracks ?? "Unknown"],
    ["ALBUM_LABEL", (item) => item.resolved_album_label ?? "Unknown"],
    ["ALBUM_IMAGE", (item) => item.resolved_album_image ?? "Unknown"],
    ["AUDIO_FEATURES_LIST", (item) => item.resolved_audio_features_list ?? "Unknown"],
    ["AUDIO_FEATURES_CHART", (item) => item.resolved_audio_features_chart ?? "Unknown"],
    ["AUDIO_ANALYSIS_SECTIONS_TABLE", (item) => item.resolved_audio_analysis_sections_table ?? "Unknown"],
    ["AUDIO_ANALYSIS_SECTIONS_CHART", (item) => item.resolved_audio_analysis_sections_chart ?? "Unknown"],
    ["AUDIO_ANALYSIS_SECTION_DETAILS", (item) => item.resolved_audio_analysis_section_details ?? "Unknown"],
  ]);

  return Array.from(substitutions.entries()).reduce((acc, currentValue) => {
    const [variableName, substitutionFn] = currentValue;
    const regex = new RegExp(`{{${variableName}}}`, "gi");
    return acc.replace(regex, substitutionFn(songItem));
  }, templateContents);
};

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

  // console.log('attempting to create file: ' + normalizedPath);
  try {
    let templateContents = '---\n';
    templateContents += `tags:\n`;
    templateContents += `- literature\n`;
    templateContents += `- playlists\n`;
    templateContents += `status: unprocessed\n`;
    templateContents += '---\n';
    templateContents += `- Note Title: ${normalizedPath}\n`;
    templateContents += `- Playlist Title: ${playlistName}\n`;

    
    templateContents += `- Source Link: [Link](https://open.spotify.com/playlist/${playlist.id}) \n`;
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

    new Notice("Playlist Note created successfully");
    return createdFile;
  } catch (err) {
    console.error(`Failed to create file: '${normalizedPath}'`, err);
    new Notice("Unable to create new file.");
  }
}

// miliseconds to minutes:seconds
export const msToMinSec = (ms: number): string => {
  // console.log('input', ms);
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  // console.log('minutes', minutes);
  // console.log('seconds', seconds);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// seconds to minutes:seconds
export const secToMinSec = (sec: number): string => {
  // console.log('input', sec);
  const minutes = Math.floor(sec / 60);
  const seconds = (sec % 60).toFixed(0);
  // console.log('minutes', minutes);
  // console.log('seconds', seconds);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
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