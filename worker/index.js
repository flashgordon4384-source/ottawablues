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
       -> { sheets: {...}, refs: [...], refAssignments: {...} }
       Full read, used on page load and by the poll loop.

     POST /api/sheet
       body: { gameId, side: "marshal" | "ref", entry }
       Read-modify-write of just that one game's one side, done
       inside the Durable Object so it's naturally serialized —
       no lost-update race even if two requests land at once.

     POST /api/refs
       body: { refs: [{ id, name }, ...] }
       Full replace of the master referee list. Organizer-only in
       the client UI; not re-checked here, same demo-tier trust
       model as everything else in this app (see CLAUDE.md section
       5 on access codes). Low-frequency, single-editor in practice,
       so a full replace is simpler than a diff and good enough.

     POST /api/assign
       body: { gameId, refId }  (refId: string id from the master
       list, or null to unassign)
       Read-modify-write of just that one game's assignment — same
       per-game granularity as /api/sheet, added 5 Sept 2026 so the
       head referee can assign one referee per game ahead of the
       tournament and have it show up on everyone's schedule.

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
      var refs = (await this.storage.get("refs")) || [];
      var refAssignments = (await this.storage.get("refAssignments")) || {};
      return json({ sheets: sheets, refs: refs, refAssignments: refAssignments });
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

    if (request.method === "POST" && url.pathname === "/refs") {
      var refBody;
      try {
        refBody = await request.json();
      } catch (e) {
        return json({ error: "body must be JSON" }, 400);
      }
      if (!Array.isArray(refBody && refBody.refs)) {
        return json({ error: "expected { refs: [{id, name}, ...] }" }, 400);
      }
      await this.storage.put("refs", refBody.refs);
      return json({ ok: true });
    }

    if (request.method === "POST" && url.pathname === "/assign") {
      var assignBody;
      try {
        assignBody = await request.json();
      } catch (e) {
        return json({ error: "body must be JSON" }, 400);
      }
      var assignGameId = assignBody && assignBody.gameId;
      if (!assignGameId) {
        return json({ error: "expected { gameId, refId }" }, 400);
      }
      var refAssignments2 = (await this.storage.get("refAssignments")) || {};
      if (assignBody.refId) {
        refAssignments2[assignGameId] = assignBody.refId;
      } else {
        delete refAssignments2[assignGameId];
      }
      await this.storage.put("refAssignments", refAssignments2);
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
