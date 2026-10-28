# Security Notes

User source is never executed inside the Next.js process. The API validates language, source size, and stdin size before sending code to the configured Judge0 service. Provider credentials are read only on the server and are not exposed through client bundles.

Judge0 must provide the process, time, memory, filesystem, and network isolation for submitted programs. CompilerLab does not claim that a generic provider URL is production-grade isolation. Deployments should add authentication, distributed rate limiting, restrictive response headers, and monitoring at the edge.

The API deliberately returns a generic provider error to the browser and logs only a concise server-side message. Output is rendered as text, not HTML.
