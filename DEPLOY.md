# Deploying sap-btp-mcp to SAP BTP

This turns the local `mcp-abap-adt`-style server into one Claude can reach from
ANY session (Cloud, Local, mobile) — because it lives on the public internet
instead of only on your laptop.

## Prerequisites

1. **A BTP subaccount with Cloud Foundry enabled.** If you don't have one, your
   BTP administrator sets this up (Subaccount → Enable Cloud Foundry).
2. **Cloud Foundry CLI installed** on your machine:
   https://docs.cloudfoundry.org/cf-cli/install-go-cli.html
   Verify with: `cf --version`
3. **Your SAP system's network reachability from BTP.** This is the part most
   likely to trip you up — see "On-premise vs cloud" below before you deploy.

## On-premise vs cloud — read this first

Your S/4HANA system (`sapdev.nagarro.com`) is very likely reachable only from
your corporate network/VPN. A BTP Cloud Foundry app runs in SAP's cloud and
**cannot reach it directly** unless you set up one of:

- **SAP Cloud Connector** (most common): a small agent you install on a machine
  inside your corporate network that opens a secure tunnel out to your BTP
  subaccount. BTP apps then reach your on-prem system through that tunnel via a
  "Destination" instead of a direct URL. This requires your Basis team's
  involvement (they'd need to install/configure the Cloud Connector) —
  it's not something you can do alone from a laptop.
- **Public/reachable endpoint**: if `sapdev.nagarro.com:44300` is already
  reachable from the public internet (e.g. an SAP Public Cloud / BTP ABAP
  environment system, or an on-prem system deliberately exposed with a
  firewall allowlist for SAP's IP ranges), you can skip Cloud Connector and
  call it directly, same as this code already does.

**Practical recommendation:** deploy this app first with a system you know is
reachable (or ask Basis whether Cloud Connector already exists for other BTP
apps in your landscape — many orgs already have one running). If Cloud
Connector isn't set up, this becomes a Basis-involving project, not a
same-day one.

## Step 1 — Log in to Cloud Foundry

```bash
cf login -a https://api.cf.<region>.hana.ondemand.com
# Your BTP admin gives you the exact API endpoint for your subaccount's region.
# You'll be prompted for your BTP username/password and to pick an org/space.
```

## Step 2 — Push the app (without credentials yet)

From inside this project folder:

```bash
cf push
```

This reads `manifest.yml`, uploads the code, and starts the app — but it won't
be able to reach SAP yet since no credentials are bound. That's expected;
we bind them next so they're never stored in the manifest or in plain env vars.

## Step 3 — Create a user-provided service for your SAP credentials

```bash
cf cups sap-creds -p '{"SAP_USERNAME":"your-username","SAP_PASSWORD":"your-password"}'
```

This stores the credentials in BTP's credential store, not in any file you'd
commit to git.

## Step 4 — Bind the service and restart

```bash
cf bind-service sap-btp-mcp sap-creds
cf restage sap-btp-mcp
```

Cloud Foundry injects `SAP_USERNAME` / `SAP_PASSWORD` into the app's
environment at runtime via `VCAP_SERVICES`. **Note:** the current
`src/server.js` reads these directly from `process.env` for simplicity — with
`cf cups`, they land in `VCAP_SERVICES` instead, so you'll need a small parsing
step. Ask me for this once you're at this stage and I'll add it — it's a ~10
line change.

## Step 5 — Confirm it's live

```bash
cf apps
# note the app's URL, e.g. sap-btp-mcp.cfapps.eu10.hana.cloud.sap

curl https://sap-btp-mcp.cfapps.<region>.hana.cloud.sap/health
# should return {"status":"ok"}
```

## Step 6 — Register it in Claude

1. In Claude Desktop (or claude.ai): **Settings → Connectors → Add custom
   connector** (or, for a Team/Enterprise account, an Owner does this once
   under **Organization settings → Connectors → Add → Custom → Web**).
2. Paste: `https://sap-btp-mcp.cfapps.<region>.hana.cloud.sap/mcp`
3. Click **Add**, and it should connect — no OAuth prompt yet, since this first
   version doesn't have auth wired in (see "Hardening" below for why you'll
   want to add that before real use).

## Hardening before real use (do this before relying on it)

This first version is intentionally minimal to prove the pipeline works. Two
things to add before using it for real SAP work:

1. **Authentication on the MCP endpoint itself.** Right now, anyone who
   discovers your app's URL could call `/mcp` and use your SAP credentials
   through it. Add XSUAA (BTP's OAuth2 service) so Claude has to authenticate
   before reaching your tools — this is a well-trodden BTP pattern
   (`cf create-service xsuaa application xsuaa-sap-mcp`), and I can help you
   wire it in once the unauthenticated version is confirmed working end to end.
2. **Least-privilege SAP user.** Don't point `SAP_USERNAME` at your own personal
   SAP login. Ask Basis for a dedicated service user scoped to only what this
   tool needs (read access to ADT objects, or read+write only if you actually
   need write tools).

## Local testing before you deploy

```bash
cp .env.example .env
# fill in real values in .env
npm install
npm start
# in another terminal:
curl http://localhost:8080/health
```
