# NRJ Portfolio

Personal portfolio site for **Nathaniel Robert Jones** — senior visual designer, ~20 years of crafting compelling experiences.

[nrjones.design](https://nrjones.design) · [nrjones.design@gmail.com](mailto:nrjones.design@gmail.com)

## About

A single-page, scroll-driven site with five logical sections — Loading, Who, Work, Case Studies, Contact — each with its own color identity and motion language. Built as a designed object in its own right rather than a generic portfolio template.

## Tech

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling, with design tokens as CSS custom properties
- [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/) for animation
- MDX for content (case studies live as files in this repo)
- Self-hosted fonts via `next/font`: Manrope, Geist, Geist Mono

No CMS, no WebGL, no analytics. Deliberately small surface area.

## Getting Started

Requires Node 20 or later and pnpm (or swap in your package manager of choice).

```bash
pnpm install
pnpm dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

```bash
pnpm build      # production build
pnpm start      # serve the production build locally
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
```

## Editing the Work

Case studies live in `content/projects/` as MDX files. Each file has frontmatter (project metadata, services, credits, media reel) and a body split into three tabs by `## Brief`, `## Challenge`, and `## Solution` headings.

To add a new project:

1. Drop new media (images, video) into `public/media/<slug>/`.
2. Copy an existing project file in `content/projects/` as a starting point and rename it `<slug>.mdx`.
3. Update the frontmatter — `slug`, `title`, `client`, `section` (`hired` or `inspired`), `order`, and the `reel` items pointing at your new media.
4. Write the three tab sections in the body.
5. `pnpm dev` to preview. The build will fail with a clear error if the frontmatter doesn't match the schema, so you'll know if a field is missing.
6. Commit and push. Vercel (or whatever's deploying) picks up the change.

To reorder projects within a section, edit the `order` field. To remove a project, delete the file and its media folder.

To update the bio, available-for-work flag, or contact details, edit `content/site.mdx`.

## Deploy

Site deploys to Vercel on push to `main`. Preview deploys are auto-generated for pull requests.

Environment variables: none required for the build itself. If analytics or anything else gets added later, document the keys here.

## Project Structure

```
app/             # routes, layouts, root page
components/      # nav, cursor, starfield, sections, motion primitives, effects
content/         # MDX source for projects and site-level copy
lib/             # motion constants, color tokens, content loader, scroll hooks
public/media/    # project images and videos
portfolio_spec.md  # design + interaction spec
CLAUDE.md          # conventions for Claude Code
```

The two markdown files at the root (`portfolio_spec.md` and `CLAUDE.md`) are how this project was scoped and built. Worth a read before diving into the code.

## Credits

- Design + content: Nathaniel Robert Jones
- Build: Claude Code, paired with Nathan
- Typefaces: [Manrope](https://manropefont.com/) by Mikhail Sharanda, [Geist](https://vercel.com/font) by Vercel
