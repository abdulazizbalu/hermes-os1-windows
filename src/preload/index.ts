import { contextBridge, ipcRenderer } from "electron";
import {
  GenerateLocalTextRequest,
  HistoryConversation,
  NurApi,
  PullLocalModelRequest,
  PullModelProgress,
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
    pullModelStream: (request, onProgress) => {
      const handler = (_event: unknown, progress: PullModelProgress) => onProgress(progress);
      ipcRenderer.on(ipcChannels.localAiPullModelProgress, handler);
      const promise = ipcRenderer.invoke(ipcChannels.localAiPullModelStream, request);
      return promise.finally(() => {
        ipcRenderer.off(ipcChannels.localAiPullModelProgress, handler);
      });
    },
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
