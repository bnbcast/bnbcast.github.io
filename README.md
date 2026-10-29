# Zaky Azhari — Portfolio and project demos

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

The multi-page build preserves these paths under `dist/`. The previous HTML
versions are retained alongside each React entry as `index.original.html`.

## Commit the site changes

`Commit-Portfolio.ps1` can create local commits for the portfolio and the five
standalone project repositories. It uses each repository's configured Git
identity, stages only the conversion files, and does not push:

```powershell
.\Commit-Portfolio.ps1 -Repo All -WhatIf
.\Commit-Portfolio.ps1 -Repo All
```

You can commit one repository by using `Site`, `JadwalTahunanPM`, `MPU6050`,
`AutodeskInventor`, `InferenceTimeCalc`, or `WordDetective` instead of `All`.
Review the changes and commit author before running without `-WhatIf`.
