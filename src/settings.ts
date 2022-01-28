// src/settings.ts

import {App, PluginSettingTab, Setting} from 'obsidian'
import STOPlugin from 'main'
import { setupSpotifyAuth } from './utils';


export interface STOSettings {
  bearerToken: string | null,
  songNoteTemplate: string | null,
  albumNoteTemplate: string | null,
  playlistNoteTemplate: string | null,
}

export const DEFAULT_SETTINGS: STOSettings = {
  bearerToken: null,
  songNoteTemplate: null,
  albumNoteTemplate: null,
  playlistNoteTemplate: null,
}

export class STOSettingTab extends PluginSettingTab {
  plugin: STOPlugin

  constructor(app: App, plugin: STOPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const {containerEl} = this
    containerEl.empty()
    containerEl.createEl('h2', {text: 'Settings for Spotify to Obsidian'})

    new Setting(containerEl)
      .setName('Bearer Token')
      .setDesc('Enter your Spotify bearer token.')
      .setDesc('You can get a bearer token from the Spotify developer portal. https://developer.spotify.com/console/get-track/')
      .addText(text =>
        text
          .setPlaceholder('Spotify bearer token')
          .setValue(this.plugin.settings.bearerToken)
          .onChange(async value => {
            this.plugin.settings.bearerToken = value
            await this.plugin.saveSettings()
          })
    )


    new Setting(containerEl)
      .setName('Connect Spotify')
      .setDesc('Connect to Spotify.')
      .addButton(button =>
        button
          .setButtonText('Connect')
          .onClick(async () => {
            await setupSpotifyAuth()
          })
        )
     
    // Template location Settings
       
    new Setting(containerEl)
    .setName("Spotify Song template file location")
    .setDesc("Choose the file to use as a template when creating a new note from a Spotify song.")
    .addText((text) => {
      text
      .setPlaceholder('Example: Templates/Spotify Song Template')
      .setValue(this.plugin.settings.songNoteTemplate)
      .onChange(async value => {
        this.plugin.settings.songNoteTemplate = value
        await this.plugin.saveSettings()
      })
    });

    new Setting(containerEl)
    .setName("Spotify Album template file location")
    .setDesc("Choose the file to use as a template when creating a new note from a Spotify album.")
    .addText((text) => {
      text
      .setPlaceholder('Example: Templates/Spotify Album Template')
      .setValue(this.plugin.settings.albumNoteTemplate)
      .onChange(async value => {
        this.plugin.settings.albumNoteTemplate = value
        await this.plugin.saveSettings()
      })
    });

    new Setting(containerEl)
    .setName("Spotify Playlist template file location")
    .setDesc("Choose the file to use as a template when creating a new note from a Spotify playlist.")
    .addText((text) => {
      text
      .setPlaceholder('Example: Templates/Spotify Playlist Template')
      .setValue(this.plugin.settings.playlistNoteTemplate)
      .onChange(async value => {
        this.plugin.settings.playlistNoteTemplate = value
        await this.plugin.saveSettings()
      })
    });
  }
}
