# Baron Builders Selections Portal

One online system that takes every house from contract to signed, paid selections. Three portals on one sign-in: **staff**, **buyers**, and **vendors**.

Prepared by Diget Group for Baron Builders.

## Start here

| Read | For |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | The structural rules: where code goes and what to reuse |
| [AGENTS.md](AGENTS.md) | The current implementation: stack, commands, folder map |
| [ACCESS.md](ACCESS.md) | Who can see and do what |
| [DATABASE.md](DATABASE.md) | The schema and its conventions |
| [BRAND.md](BRAND.md) | Logo, color, and type |

## Run it

Requires Node 24 (`.nvmrc`).

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

## Before you push

```bash
npm run check:ci
```

That runs the structural checks, the type check, lint, and a production build. CI runs the same steps on every pull request.
