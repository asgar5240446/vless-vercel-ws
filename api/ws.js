export const config = {
  runtime: "edge",
};

export default async function handler(req) {

  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("VLESS WS Proxy on Vercel is running.");
  }

  const target = "wss://91.107.251.214:443/"; // آدرس سرور اصلی خودت

  const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

  const serverSocket = new WebSocket(target);

  serverSocket.onopen = () => {

    clientSocket.onmessage = (event) => {
      if (serverSocket.readyState === WebSocket.OPEN) {
        serverSocket.send(event.data);
      }
    };

    serverSocket.onmessage = (event) => {
      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(event.data);
      }
    };
  };

  clientSocket.onclose = () => serverSocket.close();
  serverSocket.onclose = () => clientSocket.close();

  clientSocket.onerror = () => serverSocket.close();
  serverSocket.onerror = () => clientSocket.close();

  return response;
}
