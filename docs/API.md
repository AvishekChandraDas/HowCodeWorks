# API

## `POST /api/execute`

Request body:

```json
{ "language": "C", "source": "...", "stdin": "12 30" }
```

The route accepts `C`, `C++`, or `Java`, rejects empty or oversized source and input, and returns a normalized execution result. The response includes state, stdout, stderr, compile output, status description, exit code, time, memory, and provider name. When Judge0 is not configured, the response is a successful JSON result with `state: "unavailable"`, allowing the UI to explain setup without crashing.

Unexpected provider failures return HTTP 503 with a generic message. Validation failures return HTTP 400. Provider-specific tokens are not exposed to the client.
