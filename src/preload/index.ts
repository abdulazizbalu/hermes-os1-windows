import { contextBridge, ipcRenderer } from "electron";
import {
  GenerateLocalTextRequest,
  HistoryConversation,
  NurApi,
  PullLocalModelRequest,
  ipcChannels
} from "../shared/ipc.js";

const api: NurApi = {
  app: {
    info: () => ipcRenderer.invoke(ipcChannels.appInfo),
    diagnostics: () => ipcRenderer.invoke(ipcChannels.diagnostics)
  },
  localAi: {
    status: () => ipcRenderer.invoke(ipcChannels.localAiStatus),
    startOllama: () => ipcRenderer.invoke(ipcChannels.localAiStartOllama),
    pullModel: (request: PullLocalModelRequest) => ipcRenderer.invoke(ipcChannels.localAiPullModel, request),
    generateText: (request: GenerateLocalTextRequest) => ipcRenderer.invoke(ipcChannels.localAiGenerateText, request)
  },
  history: {
    list: () => ipcRenderer.invoke(ipcChannels.historyList),
    save: (conversation: HistoryConversation) => ipcRenderer.invoke(ipcChannels.historySave, conversation),
    delete: (id: string) => ipcRenderer.invoke(ipcChannels.historyDelete, id),
    clear: () => ipcRenderer.invoke(ipcChannels.historyClear)
  }
};

contextBridge.exposeInMainWorld("os1", api);
