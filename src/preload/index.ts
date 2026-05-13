import { contextBridge, ipcRenderer } from "electron";
import {
  ConnectionDraft,
  CreateOrgoComputerRequest,
  OrgoConnectionDraft,
  OS1Api,
  SaveOrgoApiKeyRequest,
  ipcChannels
} from "../shared/ipc.js";

const api: OS1Api = {
  app: {
    info: () => ipcRenderer.invoke(ipcChannels.appInfo),
    diagnostics: () => ipcRenderer.invoke(ipcChannels.diagnostics)
  },
  connections: {
    list: () => ipcRenderer.invoke(ipcChannels.connectionsList),
    saveDraft: (draft: ConnectionDraft) => ipcRenderer.invoke(ipcChannels.connectionsSaveDraft, draft),
    saveOrgo: (draft: OrgoConnectionDraft) => ipcRenderer.invoke(ipcChannels.connectionsSaveOrgo, draft)
  },
  orgo: {
    credentialStatus: () => ipcRenderer.invoke(ipcChannels.orgoCredentialStatus),
    saveApiKey: (request: SaveOrgoApiKeyRequest) => ipcRenderer.invoke(ipcChannels.orgoSaveApiKey, request),
    clearApiKey: () => ipcRenderer.invoke(ipcChannels.orgoClearApiKey),
    listWorkspaces: () => ipcRenderer.invoke(ipcChannels.orgoListWorkspaces),
    createComputer: (request: CreateOrgoComputerRequest) => ipcRenderer.invoke(ipcChannels.orgoCreateComputer, request)
  }
};

contextBridge.exposeInMainWorld("os1", api);
