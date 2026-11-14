<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (PCTIERS)

- Public ranking reads go through `createServerFn` in `src/lib/pctiers.functions.ts` using the publishable client from `src/lib/pctiers.server.ts`; why: SSR loaders need data without a user session, and RLS only allows public SELECT.
- Tier order, tier points and the gamemode list live only in `src/lib/tiers.ts` (covered by `src/lib/tiers.test.ts`); why: leaderboards, badges and profiles must agree on one ladder.
- Tier badge colors/glow come from `--tier-*` tokens and `.tier-badge[data-tier][data-level]` rules in `src/styles.css`; why: higher tiers get stronger visuals without per-component styling.
- Player skins/heads load from mc-heads.net by username; why: no skin storage needed.
