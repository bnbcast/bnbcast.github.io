# Portfolio and project demos

The portfolio and its five standalone web projects use React and Vite. Each
project keeps its own visual design and functionality.

## Run locally

```sh
npm install
npm run dev
```

Vite serves the main portfolio at `/` and the project sites at:

- `/Stanfords/InferenceTimeCalc/`
- `/Stanfords/WordDetective/`
- `/BBPVP/JadwalTahunan-PM/`
- `/BBPVP/MPU6050/`
- `/BBPVP/AutodeskInventor/`

## Production build

```sh
npm run build
npm run preview
```

## GitHub Pages deployment

The root portfolio and each standalone project repository include a GitHub
Actions workflow that builds its React app with Vite and deploys the generated
`dist/` files to GitHub Pages. After pushing a workflow to a repository, set
that repository's **Settings → Pages → Build and deployment → Source** to
**GitHub Actions**. The project workflows build from their own repositories;
they do not rely on files in this root repository.
The root workflow intentionally builds only the portfolio, because the
standalone projects are maintained in separate Git repositories. Their own
workflows build and publish those projects independently.

The standalone repositories can also be run and built independently:

```powershell
cd BBPVP\JadwalTahunan-PM
npm ci
npm run dev
npm run build
```

Use the same commands inside `BBPVP\MPU6050`, `BBPVP\AutodeskInventor`,
`Stanfords\InferenceTimeCalc`, or `Stanfords\WordDetective`.
