/*
 * In-browser mock of the two OData V4 services used by PS-APP-001, for the static demo build.
 * It intercepts XMLHttpRequest calls to the service URLs, so no SAP system and no Node server are needed.
 * Data lives in memory only and resets on page reload. Business rules mirror
 * webapp/localService/mockdata/**\/*.js (the local Node mock used by `npm run start:mock`).
 */
(function () {
	"use strict";

	var BASE = document.currentScript.src.replace(/[^/]*$/, "");
	var NS_MAIN = "com.sap.gateway.srvd.z_ui_pseffrthdr.v0001";

	var SERVICES = [
		{
			prefix: "/sap/opu/odata4/sap/zpseffrthdr_o4/srvd/sap/z_ui_pseffrthdr/0001/",
			metadata: "mock/metadata_main.xml",
			sets: {
				RfpEffort: { keys: ["EffortId"], data: "mock/main/RfpEffort.json" },
				RfpEffortItem: { keys: ["EffortId", "ItemId"], data: "mock/main/RfpEffortItem.json" },
				EffortDashboard: { keys: ["EffortId", "SapModule", "ActivatePhase", "EntryType", "Currency"], computed: true },
				RoleValueHelp: { keys: ["Role"], data: "mock/main/RoleValueHelp.json" }
			}
		},
		{
			prefix: "/sap/opu/odata4/sap/zpseffrtrate_o4/srvd/sap/z_ui_pseffrtrate/0001/",
			metadata: "mock/metadata_rate.xml",
			sets: {
				CostRate: { keys: ["SapModule", "Role"], data: "mock/rate/CostRate.json" }
			}
		}
	];

	// ---- data store -------------------------------------------------------------------------------
	var store = {};
	var metadataText = {};
	var readyPromise;

	function ready() {
		if (!readyPromise) {
			var jobs = [];
			SERVICES.forEach(function (svc) {
				jobs.push(fetch(BASE + svc.metadata).then(function (r) { return r.text(); })
					.then(function (t) { metadataText[svc.prefix] = t; }));
				Object.keys(svc.sets).forEach(function (name) {
					var def = svc.sets[name];
					if (def.data) {
						jobs.push(fetch(BASE + def.data).then(function (r) { return r.json(); })
							.then(function (rows) { store[name] = rows; }));
					}
				});
			});
			readyPromise = Promise.all(jobs);
		}
		return readyPromise;
	}

	function findSet(name) {
		for (var i = 0; i < SERVICES.length; i++) {
			if (SERVICES[i].sets[name]) { return SERVICES[i].sets[name]; }
		}
		return null;
	}

	function uuid() {
		return (crypto.randomUUID && crypto.randomUUID()) ||
			"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0;
				return (c === "x" ? r : (r & 3 | 8)).toString(16);
			});
	}

	function now() { return new Date().toISOString(); }

	function ODataError(status, message) {
		this.status = status;
		this.message = message;
	}

	function fail(status, message) { throw new ODataError(status, message); }

	// ---- entity hooks (ported from the Node mock) -------------------------------------------------
	function dashboardRows() {
		var agg = {};
		store.RfpEffortItem.forEach(function (it) {
			var key = [it.EffortId, it.SapModule, it.ActivatePhase, it.EntryType, it.Currency || ""].join("|");
			var hdr = store.RfpEffort.filter(function (h) { return h.EffortId === it.EffortId; })[0] || {};
			var o = agg[key] = agg[key] || {
				EffortId: it.EffortId, SapModule: it.SapModule, ActivatePhase: it.ActivatePhase,
				EntryType: it.EntryType, Currency: it.Currency || "", RfpName: hdr.RfpName,
				CustomerName: hdr.CustomerName, TotalEffort: 0, TotalCost: 0
			};
			o.TotalEffort += Number(it.EffortHours || 0);
			o.TotalCost += Number(it.Cost || 0);
		});
		return Object.keys(agg).map(function (k) {
			var o = agg[k];
			o.TotalEffort = o.TotalEffort.toFixed(2);
			o.TotalCost = o.TotalCost.toFixed(2);
			return o;
		});
	}

	function deriveCost(item, oldCost) {
		var rate = store.CostRate.filter(function (r) { return r.SapModule === item.SapModule && r.Role === item.Role; })[0];
		var hours = Number(item.EffortHours || 0);
		var cost = Number(item.Cost || 0);
		var calc = rate ? hours * Number(rate.Rate) : 0;
		var manual = cost !== Number(oldCost || 0) && cost !== 0 && (!rate || cost !== calc);
		if (manual) {
			return { Cost: String(cost), Currency: item.Currency || "", CostManualOverride: "X" };
		}
		if (rate) {
			return { Cost: String(calc), Currency: rate.Currency, CostManualOverride: "" };
		}
		if (item.CostManualOverride !== "X" && cost !== 0) {
			return { Cost: "0", Currency: "", CostManualOverride: "" };
		}
		return { Cost: String(cost), Currency: item.Currency || "", CostManualOverride: item.CostManualOverride || "" };
	}

	function validateItem(item) {
		if (!item.SapModule) { fail(400, "Mandatory field missing: Module"); }
		if (!item.ActivatePhase) { fail(400, "Mandatory field missing: Phase"); }
		if (!item.Role) { fail(400, "Mandatory field missing: Role"); }
		if (Number(item.EffortHours) < 0) { fail(400, "Effort must be zero or positive"); }
		if (Number(item.Cost) < 0) { fail(400, "Cost must be zero or positive"); }
		if (item.EntryType === "ACT") {
			if (!item.ActivityDesc) { fail(400, "Mandatory field missing: Activity Description"); }
			var hdr = store.RfpEffort.filter(function (h) { return h.EffortId === item.EffortId; })[0];
			if (!hdr || hdr.Status !== "WON") { fail(400, 'Project must be marked "Won" before logging actuals'); }
		}
	}

	var HOOKS = {
		RfpEffort: {
			create: function (e) {
				["RfpName", "CustomerName"].forEach(function (f) {
					if (!e[f]) { fail(400, "Mandatory field missing: " + f); }
				});
				e.EffortId = e.EffortId || uuid();
				e.Status = e.Status || "EST";
				e.OwnerUser = e.OwnerUser || "ANKUR";
				e.CreatedBy = e.OwnerUser;
			}
		},
		RfpEffortItem: {
			create: function (e) {
				e.ItemId = e.ItemId || uuid();
				e.CreatedBy = "ANKUR";
				Object.assign(e, deriveCost(e, 0));
				validateItem(e);
			},
			update: function (merged, patch, old) {
				validateItem(merged);
				Object.assign(patch, deriveCost(merged, old.Cost));
			}
		}
	};

	// ---- query handling ---------------------------------------------------------------------------
	function tokenize(s) {
		var t = [], i = 0;
		while (i < s.length) {
			var c = s[i];
			if (/\s/.test(c)) { i++; continue; }
			if (c === "(" || c === ")" || c === ",") { t.push({ t: c }); i++; continue; }
			if (c === "'") {
				var j = i + 1, v = "";
				while (j < s.length) {
					if (s[j] === "'") {
						if (s[j + 1] === "'") { v += "'"; j += 2; continue; }
						break;
					}
					v += s[j++];
				}
				t.push({ t: "str", v: v });
				i = j + 1;
				continue;
			}
			var k = i;
			while (k < s.length && !/[\s(),']/.test(s[k])) { k++; }
			t.push({ t: "id", v: s.slice(i, k) });
			i = k;
		}
		return t;
	}

	function parseFilter(expr) {
		var tk = tokenize(expr), p = 0;
		function peek() { return tk[p]; }
		function isId(v) { return peek() && peek().t === "id" && peek().v.toLowerCase() === v; }

		function operand() {
			var tok = tk[p++];
			if (!tok) { fail(400, "Invalid $filter"); }
			if (tok.t === "str") { return function () { return { v: tok.v, str: true }; }; }
			if (tok.t === "(") {
				var inner = or();
				p++; // ")"
				return inner;
			}
			if (tok.t === "id" && peek() && peek().t === "(") {
				p++; // "("
				var args = [];
				while (peek() && peek().t !== ")") {
					args.push(operand());
					if (peek() && peek().t === ",") { p++; }
				}
				p++; // ")"
				var fn = tok.v.toLowerCase();
				return function (row) {
					var a = args.map(function (f) { return f(row); });
					var s0 = String(a[0].v == null ? "" : a[0].v).toLowerCase();
					var s1 = String(a[1] ? a[1].v : "").toLowerCase();
					if (fn === "contains") { return { v: s0.indexOf(s1) >= 0 }; }
					if (fn === "startswith") { return { v: s0.indexOf(s1) === 0 }; }
					if (fn === "endswith") { return { v: s0.slice(-s1.length) === s1 || !s1 }; }
					if (fn === "tolower") { return { v: s0 }; }
					if (fn === "toupper") { return { v: s0.toUpperCase() }; }
					fail(501, "Unsupported function in $filter: " + fn);
				};
			}
			var v = tok.v;
			if (/^[A-Za-z_]\w*$/.test(v) && !/^(true|false|null)$/.test(v)) {
				return function (row) { return { v: row[v] }; };
			}
			var lit = v === "true" ? true : v === "false" ? false : v === "null" ? null : v;
			return function () { return { v: lit, lit: true }; };
		}

		function norm(x) {
			if (x.v === null || x.v === undefined) { return null; }
			if (!x.str && typeof x.v !== "boolean" && x.v !== "" && isFinite(Number(x.v)) && !isNaN(Number(x.v))) {
				return Number(x.v);
			}
			return typeof x.v === "string" ? x.v.toLowerCase() : x.v;
		}

		function comparison() {
			if (isId("not")) {
				p++;
				var neg = comparison();
				return function (row) { return { v: !neg(row).v }; };
			}
			var left = operand();
			if (peek() && peek().t === "id" && /^(eq|ne|gt|ge|lt|le)$/.test(peek().v)) {
				var op = tk[p++].v;
				var right = operand();
				return function (row) {
					var l = left(row), r = right(row);
					var a = norm(l), b = norm(r);
					// a numeric-looking cell compared with a quoted literal: compare as text
					if (typeof a !== typeof b && a !== null && b !== null) { a = String(l.v).toLowerCase(); b = String(r.v).toLowerCase(); }
					var res;
					switch (op) {
						case "eq": res = a === b || (a === null && b === "") || (a === "" && b === null); break;
						case "ne": res = !(a === b); break;
						case "gt": res = a > b; break;
						case "ge": res = a >= b; break;
						case "lt": res = a < b; break;
						default: res = a <= b;
					}
					return { v: res };
				};
			}
			return left;
		}

		function and() {
			var l = comparison();
			while (isId("and")) {
				p++;
				var r = comparison(), prev = l;
				l = (function (a, b) { return function (row) { return { v: a(row).v && b(row).v }; }; })(prev, r);
			}
			return l;
		}

		function or() {
			var l = and();
			while (isId("or")) {
				p++;
				var r = and(), prev = l;
				l = (function (a, b) { return function (row) { return { v: a(row).v || b(row).v }; }; })(prev, r);
			}
			return l;
		}

		var fnc = or();
		return function (row) { return !!fnc(row).v; };
	}

	function compareValues(a, b) {
		if (a === b) { return 0; }
		if (a === undefined || a === null || a === "") { return -1; }
		if (b === undefined || b === null || b === "") { return 1; }
		var na = Number(a), nb = Number(b);
		if (isFinite(na) && isFinite(nb)) { return na - nb; }
		return String(a).localeCompare(String(b));
	}

	function parseKeyPredicate(pred, keys) {
		var out = {};
		if (pred.indexOf("=") < 0) {
			out[keys[0]] = unquote(pred);
			return out;
		}
		var re = /(\w+)=('(?:[^']|'')*'|[^,]+)/g, m;
		while ((m = re.exec(pred))) { out[m[1]] = unquote(m[2]); }
		return out;
	}

	function unquote(s) {
		return s[0] === "'" ? s.slice(1, -1).replace(/''/g, "'") : s;
	}

	function rowsOf(name) {
		return SERVICES.some(function (s) { return s.sets[name] && s.sets[name].computed; }) ? dashboardRows() : store[name];
	}

	function matchKey(def, row, key) {
		return def.keys.every(function (k) { return key[k] === undefined || String(row[k]) === String(key[k]); });
	}

	function clone(o) { return JSON.parse(JSON.stringify(o)); }

	function withContext(svc, set, obj) {
		return Object.assign({ "@odata.context": "$metadata#" + set }, obj);
	}

	// ---- request dispatcher -----------------------------------------------------------------------
	function handle(svc, req) {
		var url = new URL(req.url, location.href);
		var path = decodeURIComponent(url.pathname.slice(url.pathname.indexOf(svc.prefix) + svc.prefix.length));
		var q = {};
		url.search.replace(/^\?/, "").split("&").forEach(function (pair) {
			if (!pair) { return; }
			var i = pair.indexOf("=");
			q[decodeURIComponent((i < 0 ? pair : pair.slice(0, i)).replace(/\+/g, " "))] =
				i < 0 ? "" : decodeURIComponent(pair.slice(i + 1).replace(/\+/g, " "));
		});

		if (path === "$metadata") {
			return { status: 200, type: "application/xml", text: metadataText[svc.prefix] };
		}
		if (path === "") {
			return { status: 200, json: { "@odata.context": "$metadata", value: [] } };
		}

		var segs = path.split("/").filter(Boolean).map(function (s) {
			var m = /^([^(]+)(?:\((.*)\))?$/.exec(s);
			return { name: m ? m[1] : s, pred: m ? m[2] : undefined };
		});
		var first = segs[0];
		var def = svc.sets[first.name];
		if (!def) { fail(404, "Resource not found: " + first.name); }
		var setName = first.name;
		var method = req.method;
		var last = segs[segs.length - 1];

		// bound action
		if (last.name.indexOf(".") > 0 && /markAsWon$/.test(last.name) && method === "POST") {
			var hdr = findOne(setName, def, first.pred);
			hdr.Status = "WON";
			hdr.ChangedAt = hdr.LocalChangedAt = now();
			return { status: 200, json: withContext(svc, setName, clone(hdr)) };
		}

		// navigation: <Set>(key)/_Item  or  <Set>(key)/_Header
		var navFilter = null, targetSet = setName, targetDef = def, single = first.pred !== undefined;
		if (segs.length >= 2 && last.name.charAt(0) === "_") {
			var parent = findOne(setName, def, first.pred);
			if (last.name === "_Item") {
				targetSet = "RfpEffortItem";
				targetDef = findSet(targetSet);
				navFilter = function (r) { return r.EffortId === parent.EffortId; };
				single = last.pred !== undefined;
			} else if (last.name === "_Header") {
				targetSet = "RfpEffort";
				targetDef = findSet(targetSet);
				navFilter = function (r) { return r.EffortId === parent.EffortId; };
				single = true;
			} else {
				fail(404, "Unknown navigation property: " + last.name);
			}
		}

		var keyPred = segs.length === 1 ? first.pred : (last.pred !== undefined ? last.pred : undefined);
		if (segs.length === 2 && last.name === "$count") { keyPred = undefined; }

		if (method === "GET") {
			if (single && !(segs.length >= 2 && last.name === "_Item" && last.pred === undefined)) {
				var row = (segs.length >= 2 && last.name === "_Header")
					? rowsOf(targetSet).filter(navFilter)[0]
					: findOne(targetSet, targetDef, keyPred);
				if (!row) { fail(404, "Not Found"); }
				return { status: 200, json: withContext(svc, targetSet, clone(row)) };
			}
			var rows = rowsOf(targetSet).slice();
			if (navFilter) { rows = rows.filter(navFilter); }
			if (q.$filter) { rows = rows.filter(parseFilter(q.$filter)); }
			var total = rows.length;
			if (q.$orderby) {
				var orders = q.$orderby.split(",").map(function (o) {
					var parts = o.trim().split(/\s+/);
					return { f: parts[0], desc: (parts[1] || "").toLowerCase() === "desc" };
				});
				rows = rows.slice().sort(function (a, b) {
					for (var i = 0; i < orders.length; i++) {
						var c = compareValues(a[orders[i].f], b[orders[i].f]);
						if (c) { return orders[i].desc ? -c : c; }
					}
					return 0;
				});
			}
			var skip = Number(q.$skip || 0);
			var top = q.$top === undefined ? rows.length : Number(q.$top);
			rows = rows.slice(skip, skip + top).map(clone);
			if (q.$select) {
				var sel = q.$select.split(",");
				rows = rows.map(function (r) {
					var o = {};
					targetDef.keys.concat(sel).forEach(function (f) { if (f in r) { o[f] = r[f]; } });
					return o;
				});
			}
			var body = { "@odata.context": "$metadata#" + targetSet, value: rows };
			if (q.$count === "true") { body["@odata.count"] = String(total); }
			return { status: 200, json: body };
		}

		if (method === "POST") {
			var entity = JSON.parse(req.body || "{}");
			Object.keys(entity).forEach(function (k) { if (k.indexOf("@") === 0) { delete entity[k]; } });
			if (navFilter && targetSet === "RfpEffortItem") {
				entity.EffortId = findOne(setName, def, first.pred).EffortId;
			}
			var hooks = HOOKS[targetSet];
			if (hooks && hooks.create) { hooks.create(entity); }
			if (targetDef.keys.some(function (k) { return !entity[k]; })) { fail(400, "Mandatory key field missing"); }
			if (store[targetSet].some(function (r) { return matchKey(targetDef, r, entity); })) {
				fail(400, "Entity already exists");
			}
			var t = now();
			entity.CreatedAt = entity.CreatedAt || t;
			entity.ChangedBy = entity.ChangedBy || entity.CreatedBy || "ANKUR";
			entity.ChangedAt = entity.LocalChangedAt = t;
			if (!entity.CreatedBy) { entity.CreatedBy = "ANKUR"; }
			store[targetSet].push(entity);
			return { status: 201, json: withContext(svc, targetSet, clone(entity)) };
		}

		if (method === "PATCH" || method === "PUT") {
			var existing = findOne(targetSet, targetDef, keyPred);
			var patch = JSON.parse(req.body || "{}");
			Object.keys(patch).forEach(function (k) { if (k.indexOf("@") === 0) { delete patch[k]; } });
			var h = HOOKS[targetSet];
			if (h && h.update) { h.update(Object.assign({}, existing, patch), patch, existing); }
			patch.ChangedAt = patch.LocalChangedAt = now();
			Object.assign(existing, patch);
			return { status: 200, json: withContext(svc, targetSet, clone(existing)) };
		}

		if (method === "DELETE") {
			var target = findOne(targetSet, targetDef, keyPred);
			store[targetSet].splice(store[targetSet].indexOf(target), 1);
			return { status: 204 };
		}

		fail(405, "Method not allowed: " + method);
	}

	function findOne(setName, def, pred) {
		if (pred === undefined) { fail(404, "Not Found"); }
		var key = parseKeyPredicate(pred, def.keys);
		var row = rowsOf(setName).filter(function (r) { return matchKey(def, r, key); })[0];
		if (!row) { fail(404, "Not Found"); }
		return row;
	}

	function runOne(svc, req) {
		try {
			return handle(svc, req);
		} catch (e) {
			if (e instanceof ODataError) {
				return { status: e.status, json: { error: { code: String(e.status), message: e.message } } };
			}
			return { status: 500, json: { error: { code: "500", message: String(e && e.message || e) } } };
		}
	}

	// ---- $batch (multipart/mixed) -----------------------------------------------------------------
	function parseHeaders(block) {
		var h = {};
		block.split(/\r?\n/).forEach(function (line) {
			var i = line.indexOf(":");
			if (i > 0) { h[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim(); }
		});
		return h;
	}

	function splitHeadBody(text) {
		var m = /\r?\n\r?\n/.exec(text);
		if (!m) { return { head: text, body: "" }; }
		return { head: text.slice(0, m.index), body: text.slice(m.index + m[0].length) };
	}

	function boundaryOf(contentType) {
		var m = /boundary="?([^";]+)"?/i.exec(contentType || "");
		return m && m[1];
	}

	function parseMultipart(body, boundary) {
		var parts = body.split("--" + boundary);
		parts.shift();
		var out = [];
		parts.forEach(function (raw) {
			if (/^--/.test(raw)) { return; }
			raw = raw.replace(/^\r?\n/, "");
			var hb = splitHeadBody(raw), headers = parseHeaders(hb.head);
			var inner = boundaryOf(headers["content-type"]);
			if (/multipart\/mixed/i.test(headers["content-type"] || "") && inner) {
				out.push({ changeset: parseMultipart(hb.body, inner) });
				return;
			}
			var reqText = splitHeadBody(hb.body.replace(/\r?\n$/, ""));
			var lines = reqText.head.split(/\r?\n/);
			var start = /^(\w+)\s+(\S+)/.exec(lines[0]);
			out.push({
				method: start[1], url: start[2], headers: parseHeaders(lines.slice(1).join("\n")),
				body: reqText.body.replace(/\r?\n$/, ""), contentId: headers["content-id"]
			});
		});
		return out;
	}

	function httpPart(res, contentId) {
		var text = res.json !== undefined ? JSON.stringify(res.json) : (res.text || "");
		var reason = { 200: "OK", 201: "Created", 204: "No Content" }[res.status] || "Error";
		var lines = ["Content-Type: application/http", "Content-Transfer-Encoding: binary"];
		if (contentId) { lines.push("Content-ID: " + contentId); }
		lines.push("", "HTTP/1.1 " + res.status + " " + reason);
		if (text) { lines.push("Content-Type: application/json;odata.metadata=minimal"); }
		lines.push("OData-Version: 4.0", "", text);
		return lines.join("\r\n");
	}

	function runBatch(svc, req) {
		var boundary = boundaryOf(req.headers["content-type"]);
		var items = parseMultipart(req.body || "", boundary);
		// URLs inside a batch are relative to the service root
		(function absolutize(list) {
			list.forEach(function (it) {
				if (it.changeset) { absolutize(it.changeset); } else { it.url = svc.prefix + it.url.replace(/^\//, ""); }
			});
		})(items);
		var rb = "batch_" + uuid(), out = "";
		items.forEach(function (item) {
			if (item.changeset) {
				var snapshot = clone(store), cs = "changeset_" + uuid(), results = [], failed = null;
				for (var i = 0; i < item.changeset.length; i++) {
					var r = runOne(svc, item.changeset[i]);
					if (r.status >= 400) { failed = r; break; }
					results.push(httpPart(r, item.changeset[i].contentId));
				}
				if (failed) {
					store = snapshot;
					out += "--" + rb + "\r\n" + httpPart(failed) + "\r\n";
				} else {
					out += "--" + rb + "\r\nContent-Type: multipart/mixed; boundary=" + cs + "\r\n\r\n";
					results.forEach(function (p) { out += "--" + cs + "\r\n" + p + "\r\n"; });
					out += "--" + cs + "--\r\n";
				}
			} else {
				out += "--" + rb + "\r\n" + httpPart(runOne(svc, item)) + "\r\n";
			}
		});
		out += "--" + rb + "--\r\n";
		return { status: 200, type: "multipart/mixed; boundary=" + rb, text: out };
	}

	function respond(svc, req) {
		var url = new URL(req.url, location.href);
		var path = url.pathname.slice(url.pathname.indexOf(svc.prefix) + svc.prefix.length);
		if (req.method === "HEAD") { return { status: 200, text: "" }; }
		if (path === "$batch" && req.method === "POST") { return runBatch(svc, req); }
		return runOne(svc, req);
	}

	// ---- XMLHttpRequest interception --------------------------------------------------------------
	function serviceFor(url) {
		var path;
		try { path = new URL(url, location.href).pathname; } catch (e) { return null; }
		for (var i = 0; i < SERVICES.length; i++) {
			if (path.indexOf(SERVICES[i].prefix) >= 0) { return SERVICES[i]; }
		}
		return null;
	}

	var proto = XMLHttpRequest.prototype;
	var realOpen = proto.open, realSend = proto.send, realSetHeader = proto.setRequestHeader;
	var realAbort = proto.abort;

	proto.open = function (method, url) {
		var svc = serviceFor(String(url));
		if (svc) {
			this.__mock = { svc: svc, req: { method: method.toUpperCase(), url: String(url), headers: {}, body: null } };
			return;
		}
		this.__mock = null;
		return realOpen.apply(this, arguments);
	};

	proto.setRequestHeader = function (name, value) {
		if (this.__mock) { this.__mock.req.headers[name.toLowerCase()] = value; return; }
		return realSetHeader.apply(this, arguments);
	};

	proto.abort = function () {
		if (this.__mock) { this.__mock.aborted = true; return; }
		return realAbort.apply(this, arguments);
	};

	proto.send = function (body) {
		var m = this.__mock;
		if (!m) { return realSend.apply(this, arguments); }
		var xhr = this;
		m.req.body = body === undefined || body === null ? "" : String(body);
		ready().then(function () {
			return new Promise(function (resolve) { setTimeout(resolve, 15); });
		}).then(function () {
			if (m.aborted) { return; }
			var res = respond(m.svc, m.req);
			if (/[?&]mockdebug/.test(location.search)) {
				console.log("[mock] " + m.req.method + " " + m.req.url + "\n" + (m.req.body || "") + "\n=> " + res.status + " " + (res.json !== undefined ? JSON.stringify(res.json) : res.text || "").slice(0, 600));
			}
			var text = res.json !== undefined ? JSON.stringify(res.json) : (res.text || "");
			var headers = {
				"content-type": res.type || (res.json !== undefined ? "application/json;odata.metadata=minimal" : "text/plain"),
				"odata-version": "4.0",
				"x-csrf-token": "mock-token"
			};
			var define = function (name, value) { Object.defineProperty(xhr, name, { value: value, configurable: true }); };
			define("readyState", 4);
			define("status", res.status);
			define("statusText", res.status < 400 ? "OK" : "Error");
			define("responseText", text);
			define("response", text);
			define("responseURL", m.req.url);
			define("getAllResponseHeaders", function () {
				return Object.keys(headers).map(function (k) { return k + ": " + headers[k]; }).join("\r\n") + "\r\n";
			});
			define("getResponseHeader", function (n) { return headers[String(n).toLowerCase()] || null; });
			xhr.dispatchEvent(new Event("readystatechange"));
			xhr.dispatchEvent(new Event("load"));
			xhr.dispatchEvent(new Event("loadend"));
		});
	};
})();
