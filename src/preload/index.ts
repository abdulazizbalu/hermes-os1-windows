import { contextBridge, ipcRenderer } from "electron";
import {
  ConnectionDraft,
  GenerateLocalTextRequest,
  LocalConnectionDraft,
  OS1Api,
  PullLocalModelRequest,
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
    saveLocal: (draft: LocalConnectionDraft) => ipcRenderer.invoke(ipcChannels.connectionsSaveLocal, draft)
  },
  localAi: {
    status: () => ipcRenderer.invoke(ipcChannels.localAiStatus),
    pullModel: (request: PullLocalModelRequest) => ipcRenderer.invoke(ipcChannels.localAiPullModel, request),
    generateText: (request: GenerateLocalTextRequest) => ipcRenderer.invoke(ipcChannels.localAiGenerateText, request)
  }
};

contextBridge.exposeInMainWorld("os1", api);
