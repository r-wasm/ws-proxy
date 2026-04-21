/**
 * Minimal websockify-compatible Cloudflare Worker.
 *
 * Emscripten's SOCKFS tunnels raw TCP bytes as binary WebSocket frames
 * (websockify protocol). This worker buffers incoming bytes until it sees
 * the end of an HTTP request (\r\n\r\n), then responds with "Hello World".
 */

export default {
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("WebSocket required", { status: 426 });
    }

    const { 0: clientSocket, 1: serverSocket } = new WebSocketPair();
    serverSocket.accept();

    let chunks = [];
    let responded = false;

    serverSocket.addEventListener("message", (event) => {
      if (responded) return;

      // Collect raw bytes (Emscripten sends binary frames)
      const chunk =
        event.data instanceof ArrayBuffer
          ? new Uint8Array(event.data)
          : new TextEncoder().encode(event.data);
      chunks.push(chunk);

      // Decode accumulated bytes to check for end-of-headers
      const totalLen = chunks.reduce((n, c) => n + c.length, 0);
      const buf = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) { buf.set(c, offset); offset += c.length; }

      const text = new TextDecoder("latin1").decode(buf);
      if (!text.includes("\r\n\r\n")) return;  // wait for full headers

      responded = true;
      const body = "socks5h://test:yolo@ws.r-universe.dev:443";
      const response = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${body.length}`,
        "Connection: close",
        "",
        body,
      ].join("\r\n");

      serverSocket.send(new TextEncoder().encode(response));
      // Give the send a tick to flush before closing
      setTimeout(() => serverSocket.close(), 50);
    });

    // Echo back the subprotocol header — Chrome requires this when client sends it
    const protocol = request.headers.get("Sec-WebSocket-Protocol");
    const headers = {};
    if (protocol) headers["Sec-WebSocket-Protocol"] = protocol;

    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
      headers,
    });
  },
};
