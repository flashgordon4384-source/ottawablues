/* ==========================================================
   OBCC 2026 — shared tournament state
   ==========================================================
   A Durable Object holding one thing: game-sheet entries
   (marshal + referee), per game. This is the actual blocker
   named in CLAUDE.md section 7 — "three marshals on three
   phones produce three records that never meet." Nothing else
   moves server-side yet: standings, cards, tie-breakers, rosters
   all stay computed client-side in public/index.html exactly as
   they are today. This just makes state.sheets shared instead of
   trapped in one browser tab.

   Deliberately narrow endpoints instead of one big state blob —
   each request touches only the one game/side it's about, so two
   people editing different games (the normal case: one marshal
   per field) can never clobber each other. See CLAUDE.md section
   2 for why there's no wrangler.toml-avoidance principle being
   violated by this file existing — Durable Object bindings and
   migrations are config-file-only features; the "no wrangler.toml"
   decision from 31 Aug was about NOT duplicating what the
   dashboard's deploy command already covered on its own, which
   no longer holds once a Durable Object is in the picture.

   Endpoints (same-origin — this Worker and the static site are
   one deployment, so no CORS to think about):

     GET  /api/state
       -> { sheets: { [gameId]: { marshal, ref } } }
       Full read, used on page load and by the poll loop.

     POST /api/sheet
       body: { gameId, side: "marshal" | "ref", entry }
       Read-modify-write of just that one game's one side, done
       inside the Durable Object so it's naturally serialized —
       no lost-update race even if two requests land at once.

   Anything that isn't /api/* falls through to the static site
   (env.ASSETS). In practice Cloudflare serves a matching static
   asset before this Worker's fetch() is even invoked, so that
   fallback is a safety net, not the normal path.
   ========================================================== */

export class TournamentState {
  constructor(state, env) {
    this.storage = state.storage;
  }

  async fetch(request) {
    var url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/state") {
      var sheets = (await this.storage.get("sheets")) || {};
      return json({ sheets: sheets });
    }

    if (request.method === "POST" && url.pathname === "/sheet") {
      var body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: "body must be JSON" }, 400);
      }
      var gameId = body && body.gameId;
      var side = body && body.side;
      var entry = body && body.entry;
      if (!gameId || (side !== "marshal" && side !== "ref") || typeof entry !== "object" || !entry) {
        return json({ error: "expected { gameId, side: 'marshal'|'ref', entry }" }, 400);
      }
      var sheets2 = (await this.storage.get("sheets")) || {};
      if (!sheets2[gameId]) sheets2[gameId] = { marshal: null, ref: null };
      sheets2[gameId][side] = entry;
      await this.storage.put("sheets", sheets2);
      return json({ ok: true });
    }

    return json({ error: "not found" }, 404);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json" }
  });
}

// One tournament, one Durable Object instance, named rather than
// random so every request finds the same one without needing to
// look an ID up first.
var TOURNAMENT_ID = "obcc-2026";

export default {
  async fetch(request, env) {
    var url = new URL(request.url);

    if (url.pathname.indexOf("/api/") === 0) {
      var id = env.TOURNAMENT.idFromName(TOURNAMENT_ID);
      var stub = env.TOURNAMENT.get(id);
      var inner = new URL(request.url);
      inner.pathname = url.pathname.slice(4) || "/"; // "/api/sheet" -> "/sheet"
      return stub.fetch(new Request(inner.toString(), request));
    }

    return env.ASSETS.fetch(request);
  }
};
