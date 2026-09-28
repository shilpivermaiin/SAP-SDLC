// sap-client.js
// Thin wrapper around SAP's ADT (ABAP Development Tools) REST API.
// This is the same protocol Eclipse ADT and the local mcp-abap-adt server use —
// we're just calling it over HTTPS ourselves instead of shelling out to a local process.

import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

export class SapAdtClient {
  /**
   * @param {object} cfg
   * @param {string} cfg.baseUrl   e.g. https://sapdev.nagarro.com:44300
   * @param {string} cfg.client    e.g. "110"
   * @param {string} cfg.username
   * @param {string} cfg.password
   */
  constructor(cfg) {
    this.baseUrl = cfg.baseUrl.replace(/\/$/, "");
    this.client = cfg.client;
    this.http = axios.create({
      baseURL: this.baseUrl,
      auth: { username: cfg.username, password: cfg.password },
      headers: {
        Accept: "application/xml",
        "X-sap-adt-sessiontype": "stateless"
      },
      params: { "sap-client": this.client },
      timeout: 30000
    });
    this._csrfToken = null;
  }

  // ADT requires a CSRF token for any write (POST/PUT) call — fetch it once and cache it.
  async _getCsrfToken() {
    if (this._csrfToken) return this._csrfToken;
    const res = await this.http.get("/sap/bc/adt/repository/nodestructure", {
      headers: { "X-CSRF-Token": "Fetch" }
    });
    this._csrfToken = res.headers["x-csrf-token"];
    return this._csrfToken;
  }

  async getClass(name) {
    const res = await this.http.get(`/sap/bc/adt/oo/classes/${encodeURIComponent(name.toLowerCase())}/source/main`);
    return res.data;
  }

  async getProgram(name) {
    const res = await this.http.get(`/sap/bc/adt/programs/programs/${encodeURIComponent(name.toLowerCase())}/source/main`);
    return res.data;
  }

  async getTable(name) {
    const res = await this.http.get(`/sap/bc/adt/ddic/tables/${encodeURIComponent(name.toLowerCase())}`);
    return parser.parse(res.data);
  }

  async getCDSView(name) {
    const res = await this.http.get(`/sap/bc/adt/ddic/ddl/sources/${encodeURIComponent(name.toLowerCase())}/source/main`);
    return res.data;
  }

  async searchObject(query, maxResults = 20) {
    const res = await this.http.get("/sap/bc/adt/repository/informationsystem/search", {
      params: { operation: "quickSearch", query, maxResults }
    });
    return parser.parse(res.data);
  }

  // Read table contents via the data preview service (read-only, capped row count — same
  // safety behavior as SE16N).
  async getTableContents(tableName, maxRows = 100) {
    const res = await this.http.get(
      `/sap/bc/adt/datapreview/ddic/${encodeURIComponent(tableName.toLowerCase())}`,
      { params: { rowNumber: maxRows } }
    );
    return parser.parse(res.data);
  }

  async runSyntaxCheck(objectUri, source) {
    const csrf = await this._getCsrfToken();
    const res = await this.http.post(
      `/sap/bc/adt/${objectUri}/source/main`,
      source,
      { headers: { "X-CSRF-Token": csrf, "Content-Type": "text/plain" } }
    );
    return res.data;
  }
}
