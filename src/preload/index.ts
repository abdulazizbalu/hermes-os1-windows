import { contextBridge, ipcRenderer } from "electron";
import { ConnectionDraft, OS1Api, ipcChannels } from "../shared/ipc.js";

const api: OS1Api = {
  app: {
    info: () => ipcRenderer.invoke(ipcChannels.appInfo),
    diagnostics: () => ipcRenderer.invoke(ipcChannels.diagnostics)
  },
  connections: {
    list: () => ipcRenderer.invoke(ipcChannels.connectionsList),
    saveDraft: (draft: ConnectionDraft) => ipcRenderer.invoke(ipcChannels.connectionsSaveDraft, draft)
  }
};

contextBridge.exposeInMainWorld("os1", api);
