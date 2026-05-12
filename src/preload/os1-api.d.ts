import { OS1Api } from "../shared/ipc.js";

declare global {
  interface Window {
    os1: OS1Api;
  }
}

export {};
