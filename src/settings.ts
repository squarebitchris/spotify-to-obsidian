// src/settings.ts

import {App, PluginSettingTab, Setting} from 'obsidian'
import STOPlugin from 'main'
import { setupSpotifyAuth } from './utils';


export interface STOSettings {
  bearerToken: string | null
}

export const DEFAULT_SETTINGS: STOSettings = {
  bearerToken: null,
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
  }
}
