// server.js
// Remote (HTTP) MCP server for SAP ADT — deployable to SAP BTP Cloud Foundry.
//
// Why this file exists: your local mcp-abap-adt server only speaks stdio, so it only
// works from a session running ON your machine (Local mode in Claude Desktop). This
// version speaks Streamable HTTP, the transport Claude's custom connectors expect,
// so it works from Cloud/Remote sessions, mobile, and claude.ai too — once it's
// deployed somewhere with a public HTTPS URL, which is what the BTP deployment step
// (see DEPLOY.md) gives it.

import "dotenv/config";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { SapAdtClient } from "./sap-client.js";

const PORT = process.env.PORT || 8080;

// SAP connection config comes from environment variables — set these as BTP
// user-provided service credentials or Cloud Foundry env vars, never hardcoded.
const sap = new SapAdtClient({
  baseUrl: process.env.SAP_URL,
  client: process.env.SAP_CLIENT,
  username: process.env.SAP_USERNAME,
  password: process.env.SAP_PASSWORD
});

function buildMcpServer() {
  const server = new McpServer({ name: "sap-btp-mcp", version: "1.0.0" });

  server.registerTool(
    "GetClass",
    {
      title: "Get ABAP Class Source",
      description: "Fetch the full source code of an ABAP class by name.",
      inputSchema: { name: z.string().describe("Class name, e.g. ZCL_MY_CLASS") }
    },
    async ({ name }) => {
      const source = await sap.getClass(name);
      return { content: [{ type: "text", text: source }] };
    }
  );

  server.registerTool(
    "GetProgram",
    {
      title: "Get ABAP Program Source",
      description: "Fetch the full source code of an ABAP report/program by name.",
      inputSchema: { name: z.string().describe("Program name, e.g. ZMY_REPORT") }
    },
    async ({ name }) => {
      const source = await sap.getProgram(name);
      return { content: [{ type: "text", text: source }] };
    }
  );

  server.registerTool(
    "GetTable",
    {
      title: "Get DDIC Table Definition",
      description: "Fetch the DDIC structure/metadata of a database table.",
      inputSchema: { name: z.string().describe("Table name, e.g. MARA") }
    },
    async ({ name }) => {
      const def = await sap.getTable(name);
      return { content: [{ type: "text", text: JSON.stringify(def, null, 2) }] };
    }
  );

  server.registerTool(
    "GetCDSView",
    {
      title: "Get CDS View Source",
      description: "Fetch the DDL source of a CDS view.",
      inputSchema: { name: z.string().describe("CDS view name, e.g. ZI_MY_VIEW") }
    },
    async ({ name }) => {
      const source = await sap.getCDSView(name);
      return { content: [{ type: "text", text: source }] };
    }
  );

  server.registerTool(
    "SearchObject",
    {
      title: "Search ABAP Repository",
      description: "Quick-search the ABAP repository for objects matching a query string.",
      inputSchema: {
        query: z.string().describe("Search term, e.g. ZMM_*"),
        maxResults: z.number().optional().default(20)
      }
    },
    async ({ query, maxResults }) => {
      const results = await sap.searchObject(query, maxResults);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }
  );

  server.registerTool(
    "GetTableContents",
    {
      title: "Preview Table Data",
      description: "Read up to maxRows rows of data from a database table (read-only).",
      inputSchema: {
        tableName: z.string().describe("Table name, e.g. MARA"),
        maxRows: z.number().optional().default(100)
      }
    },
    async ({ tableName, maxRows }) => {
      const rows = await sap.getTableContents(tableName, maxRows);
      return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
    }
  );

  return server;
}

const app = express();
app.use(express.json());

// Health check — BTP/Cloud Foundry pings this to confirm the app is alive.
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Streamable HTTP MCP endpoint. Stateless mode (no session store) keeps this simple;
// every request builds a fresh server+transport pair.
app.post("/mcp", async (req, res) => {
  try {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP request error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`sap-btp-mcp listening on port ${PORT}`);
  console.log(`SAP target: ${process.env.SAP_URL} (client ${process.env.SAP_CLIENT})`);
});
