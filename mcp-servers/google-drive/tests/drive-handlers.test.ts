import { jest, describe, beforeEach, afterEach, it, expect } from "@jest/globals";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import os from "os";

const mockDriveFilesList = jest.fn<any>();
const mockDriveFilesGet = jest.fn<any>();
const mockDriveFilesExport = jest.fn<any>();

const mockDrive = {
  files: {
    list: mockDriveFilesList,
    get: mockDriveFilesGet,
    export: mockDriveFilesExport,
  },
};

jest.unstable_mockModule("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    drive: jest.fn(() => mockDrive),
  },
}));

jest.unstable_mockModule("../src/auth.js", () => ({
  getOAuth2Client: jest.fn<() => Promise<any>>().mockResolvedValue({}),
}));

const { setupServer } = await import("../src/index.js");
const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");

describe("Google Drive MCP Server Handlers (Offline Unit Tests)", () => {
  let client: any;
  let server: ReturnType<typeof setupServer>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = setupServer();
    client = new Client(
      { name: "test-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  afterEach(async () => {
    if (client) {
      await client.close();
    }
    if (server) {
      await server.close();
    }
  });

  it("should list available tools", async () => {
    const response = await client.listTools();
    expect(response.tools).toHaveLength(3);
    const toolNames = response.tools.map((t: any) => t.name);
    expect(toolNames).toContain("search_drive_files");
    expect(toolNames).toContain("read_google_doc");
    expect(toolNames).toContain("download_drive_file");
  });

  it("should search drive files successfully", async () => {
    const mockFiles = [
      {
        id: "file-123",
        name: "Test Doc",
        mimeType: "application/vnd.google-apps.document",
        webViewLink: "https://drive.google.com/file/d/file-123/view",
      },
    ];
    mockDriveFilesList.mockResolvedValueOnce({
      data: { files: mockFiles },
    });

    const result = await client.callTool({
      name: "search_drive_files",
      arguments: { query: "Test" },
    });

    expect(mockDriveFilesList).toHaveBeenCalledWith({
      q: "name contains 'Test' or fullText contains 'Test'",
      fields: "files(id, name, mimeType, webViewLink)",
    });

    const content = (result as any).content;
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe("text");
    expect(JSON.parse(content[0].text)).toEqual(mockFiles);
  });

  it("should read a Google Doc via export", async () => {
    mockDriveFilesGet.mockResolvedValueOnce({
      data: {
        mimeType: "application/vnd.google-apps.document",
        name: "Test Document",
      },
    });
    mockDriveFilesExport.mockResolvedValueOnce({
      data: "Exported plain text content of Google Doc",
    });

    const result = await client.callTool({
      name: "read_google_doc",
      arguments: { fileId: "doc-123" },
    });

    expect(mockDriveFilesGet).toHaveBeenCalledWith({
      fileId: "doc-123",
      fields: "mimeType, name",
    });
    expect(mockDriveFilesExport).toHaveBeenCalledWith({
      fileId: "doc-123",
      mimeType: "text/plain",
    });

    const content = (result as any).content;
    expect(content[0]).toEqual({
      type: "text",
      text: "Exported plain text content of Google Doc",
    });
  });

  it("should read a plain text file directly", async () => {
    mockDriveFilesGet
      .mockResolvedValueOnce({
        data: {
          mimeType: "text/plain",
          name: "notes.txt",
        },
      })
      .mockResolvedValueOnce({
        data: "Raw file contents from Google Drive",
      });

    const result = await client.callTool({
      name: "read_google_doc",
      arguments: { fileId: "file-456" },
    });

    expect(mockDriveFilesGet).toHaveBeenNthCalledWith(1, {
      fileId: "file-456",
      fields: "mimeType, name",
    });
    expect(mockDriveFilesGet).toHaveBeenNthCalledWith(2, {
      fileId: "file-456",
      alt: "media",
    });

    const content = (result as any).content;
    expect(content[0]).toEqual({
      type: "text",
      text: "Raw file contents from Google Drive",
    });
  });

  it("should download a binary drive file", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gdrive-test-"));
    const outputPath = path.join(tempDir, "test-output.pdf");

    const mockStream = Readable.from(["file binary chunk 1", "file binary chunk 2"]);
    mockDriveFilesGet.mockResolvedValueOnce({
      data: mockStream,
    });

    const result = await client.callTool({
      name: "download_drive_file",
      arguments: { fileId: "bin-789", outputPath },
    });

    expect(mockDriveFilesGet).toHaveBeenCalledWith(
      { fileId: "bin-789", alt: "media" },
      { responseType: "stream" }
    );

    const content = (result as any).content;
    expect(content[0]).toEqual({
      type: "text",
      text: `Successfully downloaded file to: ${outputPath}`,
    });

    const fileExists = fs.existsSync(outputPath);
    expect(fileExists).toBe(true);

    const fileContent = fs.readFileSync(outputPath, "utf-8");
    expect(fileContent).toBe("file binary chunk 1file binary chunk 2");

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should return isError when tool execution fails", async () => {
    mockDriveFilesList.mockRejectedValueOnce(new Error("API quota exceeded"));

    const result = await client.callTool({
      name: "search_drive_files",
      arguments: { query: "fail" },
    });

    expect(result.isError).toBe(true);
    const content = (result as any).content;
    expect(content[0].text).toContain("Error executing tool: API quota exceeded");
  });
});
