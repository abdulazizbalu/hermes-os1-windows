# Local Gemma Provider Design

## Goal

Replace Orgo as the active backend with a free local provider that runs Gemma 4 through Ollama on the user's Windows machine.

## Decision

OS1 Windows will use a Local AI Provider instead of Orgo. The first supported runtime is local Windows/Ollama, with WSL kept as a selectable runtime for the next agent/terminal slice. The app will not require an Orgo account, Orgo API key, cloud computer, or paid service.

## User Experience

The Connections section becomes "Local Gemma". It shows Ollama status, available Gemma 4 model choices, local model installation state, runtime selection, and a saved local workspace connection. The OS1 coral/cream visual language remains unchanged.

Primary actions:

- Detect Ollama.
- Select `gemma4:e2b`, `gemma4:e4b`, or `gemma4:26b`.
- Pull the selected Gemma 4 model through Ollama.
- Save a Local/WSL workspace connection.

## Provider Model

The active provider is `local`.

Connection records store only local metadata:

- label
- transport: `local` or `wsl`
- model
- runtime
- workspace path
- destination display text

There are no API secrets for this provider.

## Main Process

Electron main owns all local integration:

- Detect whether the `ollama` CLI is available.
- Query Ollama's local HTTP API at `http://127.0.0.1:11434/api`.
- List installed local models with `GET /api/tags`.
- Pull Gemma models with `POST /api/pull` and `stream: false`.
- Save connection metadata to the existing connections JSON file.

Renderer receives only sanitized status and model metadata.

## Renderer

The renderer uses the existing typed preload bridge. It does not call Ollama directly. The UI replaces Orgo API key controls with local controls and keeps the same panel/card vocabulary already used in the app.

## Out Of Scope

This slice does not install Ollama automatically, install WSL, start Hermes Agent, or implement the interactive terminal. Those are follow-up slices after the local provider is in place.

## References

- Ollama local API base URL and endpoints: `https://docs.ollama.com/api/introduction`
- Ollama model listing endpoint: `https://docs.ollama.com/api/tags`
- Ollama model pull endpoint: `https://docs.ollama.com/api/pull`
- Gemma 4 Ollama models: `https://ollama.com/library/gemma4`
