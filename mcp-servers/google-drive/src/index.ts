import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { google } from "googleapis";
import { getOAuth2Client } from "./auth.js";

let drive: any;

async function initializeDrive() {
  const auth = await getOAuth2Client();
  drive = google.drive({ version: "v3", auth });
}

export function setupServer() {
  const server = new Server(
    { name: "google-drive", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_drive_files",
          description: "Search Google Drive files by filename and full-text content.",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query keyword" }
            },
            required: ["query"]
          }
        },
        {
          name: "read_google_doc",
          description: "Read the text content of a Google Doc or plain text file by ID.",
          inputSchema: {
            type: "object",
            properties: {
              fileId: { type: "string", description: "Google Drive File ID" }
            },
            required: ["fileId"]
          }
        },
        {
          name: "download_drive_file",
          description: "Download a binary file (PDF/Image) to a local directory.",
          inputSchema: {
            type: "object",
            properties: {
              fileId: { type: "string", description: "Google Drive File ID" },
              outputPath: { type: "string", description: "Absolute path to save file locally" }
            },
            required: ["fileId", "outputPath"]
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (!drive) {
      await initializeDrive();
    }

    const { name, arguments: args } = request.params;
    const parsedArgs = args as any;

    try {
      if (name === "search_drive_files") {
        const res = await drive.files.list({
          q: `name contains '${parsedArgs.query}' or fullText contains '${parsedArgs.query}'`,
          fields: "files(id, name, mimeType, webViewLink)",
        });
        return {
          content: [{ type: "text", text: JSON.stringify(res.data.files, null, 2) }]
        };
      }

      if (name === "read_google_doc") {
        const fileMeta = await drive.files.get({
          fileId: parsedArgs.fileId,
          fields: "mimeType, name",
        });

        if (fileMeta.data.mimeType === "application/vnd.google-apps.document") {
          const res = await drive.files.export({
            fileId: parsedArgs.fileId,
            mimeType: "text/plain",
          });
          return {
            content: [{ type: "text", text: res.data as string }]
          };
        } else {
          const res = await drive.files.get({
            fileId: parsedArgs.fileId,
            alt: "media",
          });
          return {
            content: [{ type: "text", text: typeof res.data === "string" ? res.data : JSON.stringify(res.data) }]
          };
        }
      }

      if (name === "download_drive_file") {
        const dest = fs.createWriteStream(parsedArgs.outputPath);
        const res = await drive.files.get(
          { fileId: parsedArgs.fileId, alt: "media" },
          { responseType: "stream" }
        );

        await new Promise((resolve, reject) => {
          res.data
            .on("error", reject)
            .pipe(dest)
            .on("error", reject)
            .on("finish", resolve);
        });

        return {
          content: [{ type: "text", text: `Successfully downloaded file to: ${parsedArgs.outputPath}` }]
        };
      }

      throw new Error(`Tool not found: ${name}`);
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Error executing tool: ${err.message}` }],
        isError: true,
      };
    }
  });

  return server;
}

async function run() {
  await initializeDrive();
  const server = setupServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Drive MCP server running on stdio");
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
