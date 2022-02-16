// src/index.ts
import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";

import { DEFAULT_SETTINGS, STOSettings, STOSettingTab } from 'src/settings'
import STOPluginHOC from "./ui/STOPluginHOC";
import { getAccessToken, storeSpotifyToken } from "./utils";

const VIEW_TYPE = "react-view-spotify";

class STOReactView extends ItemView {
  private reactComponent: React.ReactElement;

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Spotify to Obsidian";
  }

  getIcon(): string {
    return "audio-file";
  }

  async onOpen(): Promise<void> {
    this.reactComponent = React.createElement(STOPluginHOC);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReactDOM.render(this.reactComponent, (this as any).contentEl);
  }
}

export default class STOPlugin extends Plugin {
  private view: STOReactView;
  settings: STOSettings;
  bearerToken: string;

  async onload(): Promise<void> {
    await this.loadSettings();

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new STOSettingTab(this.app, this));

    this.registerView(
      VIEW_TYPE,
      (leaf: WorkspaceLeaf) => (this.view = new STOReactView(leaf))
    );

    this.registerObsidianProtocolHandler(
      "spotify-auth",
      async (params) => {
        // console.log('spotify-auth params returned', params);
        const access_token = getAccessToken(params.hash);
        // console.log('spotify-auth access_token returned', access_token);
        await storeSpotifyToken(access_token);
      }
    );

    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }

  onLayoutReady(): void {
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
      return;
    }
    this.app.workspace.getRightLeaf(false).setViewState({
      type: VIEW_TYPE,
    });
  }
}
