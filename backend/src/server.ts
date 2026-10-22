// import { WebSocketServer, WebSocket } from "ws";

// const PORT = 8080;

// const wss = new WebSocketServer({
//   port: PORT,
// });

// let nextClientId = 1;

// type Client = {
//   id: string;
//   name: string;
//   socket: WebSocket;
// };

// const clients = new Map<string, Client>();

// function broadcast(message: object) {
//   const data = JSON.stringify(message);

//   clients.forEach((client) => {
//     if (client.socket.readyState === WebSocket.OPEN) {
//       client.socket.send(data);
//     }
//   });
// }

// wss.on("connection", (socket) => {
//   const clientId = `client-${nextClientId++}`;

//   const client: Client = {
//     id: clientId,
//     name: clientId,
//     socket,
//   };

//   clients.set(clientId, client);

//   console.log(`${clientId} connected`);

//   // Tell the newly connected client who they are
//   socket.send(
//     JSON.stringify({
//       type: "welcome",
//       id: client.id,
//       name: client.name,
//     })
//   );

//   // Tell everyone that a new client joined
//   broadcast({
//     type: "system",
//     text: `${client.name} joined the chat`,
//   });

//   socket.on("message", (data) => {
//     try {
//       const message = JSON.parse(data.toString());

//       console.log("Received:", message);

//       if (message.type === "set-name") {
//         const oldName = client.name;

//         client.name = message.name;

//         broadcast({
//           type: "system",
//           text: `${oldName} is now ${client.name}`,
//         });

//         return;
//       }

//       if (message.type === "chat") {
//         broadcast({
//           type: "chat",
//           senderId: client.id,
//           senderName: client.name,
//           text: message.text,
//         });

//         return;
//       }

//       console.log("Unknown message type:", message.type);
//     } catch (error) {
//       console.error("Invalid message:", error);
//     }
//   });

//   socket.on("close", () => {
//     clients.delete(clientId);

//     console.log(`${clientId} disconnected`);

//     broadcast({
//       type: "system",
//       text: `${client.name} left the chat`,
//     });
//   });

//   socket.on("error", (error) => {
//     console.error(`WebSocket error for ${clientId}:`, error);
//   });
// });

// console.log(`WebSocket server running on ws://localhost:${PORT}`);




import { createServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.PORT ?? 8080);

type Client = {
  id: string;
  name: string;
  socket: WebSocket;
};

const clients = new Map<string, Client>();
let nextClientId = 1;

const server = createServer((request, response) => {
  if (request.url === "/health" && request.method === "GET") {
    response.writeHead(200, {
      "content-type": "application/json",
    });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  response.writeHead(404);
  response.end("Not found");
});

const wss = new WebSocketServer({
  server,
  path: "/ws",
});

function broadcast(message: object) {
  const data = JSON.stringify(message);

  clients.forEach((client) => {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(data);
    }
  });
}

wss.on("connection", (socket) => {
  const clientId = `client-${nextClientId++}`;

  const client: Client = {
    id: clientId,
    name: clientId,
    socket,
  };

  clients.set(clientId, client);

  console.log(`${clientId} connected`);

  socket.send(
    JSON.stringify({
      type: "welcome",
      id: client.id,
      name: client.name,
    }),
  );

  broadcast({
    type: "system",
    text: `${client.name} joined the chat`,
  });

  socket.on("message", (data) => {
    try {
      const message: unknown = JSON.parse(data.toString());

      if (
        typeof message !== "object" ||
        message === null ||
        !("type" in message) ||
        typeof message.type !== "string"
      ) {
        console.log("Invalid message format");
        return;
      }

      if (
        message.type === "set-name" &&
        "name" in message &&
        typeof message.name === "string"
      ) {
        const newName = message.name.trim();

        if (!newName || newName.length > 40) return;

        const oldName = client.name;
        client.name = newName;

        broadcast({
          type: "system",
          text: `${oldName} is now ${client.name}`,
        });

        return;
      }

      if (
        message.type === "chat" &&
        "text" in message &&
        typeof message.text === "string"
      ) {
        const text = message.text.trim();

        if (!text || text.length > 2000) return;

        broadcast({
          type: "chat",
          senderId: client.id,
          senderName: client.name,
          text,
        });

        return;
      }

      console.log("Unknown or invalid message type");
    } catch (error) {
      console.error("Invalid message:", error);
    }
  });

  socket.on("close", () => {
    clients.delete(clientId);

    console.log(`${clientId} disconnected`);

    broadcast({
      type: "system",
      text: `${client.name} left the chat`,
    });
  });

  socket.on("error", (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP and WebSocket server listening on port ${PORT}`);
});