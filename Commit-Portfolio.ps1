[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [ValidateSet('All', 'Site', 'JadwalTahunanPM', 'MPU6050', 'AutodeskInventor', 'InferenceTimeCalc', 'WordDetective')]
    [string]$Repo = 'All'
)

$ErrorActionPreference = 'Stop'
$git = 'C:\Program Files\Git\cmd\git.exe'
$workspace = $PSScriptRoot

if (-not (Test-Path -LiteralPath $git)) {
    throw "Git was not found at $git."
}

$repositories = [ordered]@{
    Site = @{
        Path = $workspace
        Remote = 'https://github.com/bnbcast/bnbcast.github.io'
        Message = 'Rebuild portfolio with React and Vite'
        Paths = @('.env.example', '.github/workflows/deploy-pages.yml', '.gitignore', 'Commit-Portfolio.ps1', 'README.md', 'index.html', 'package-lock.json', 'package.json', 'src', 'vite.config.js', 'vite.portfolio.config.js')
    }
    JadwalTahunanPM = @{
        Path = Join-Path $workspace 'BBPVP\JadwalTahunan-PM'
        Remote = 'https://github.com/bnbcast/JadwalTahunan-PM'
        Message = 'Convert maintenance scheduler to React'
        Paths = @('.env.example', '.github/workflows/deploy-pages.yml', '.gitignore', 'Breadcrumb.jsx', 'Scheduler.jsx', 'index.html', 'machines.json', 'main.jsx', 'package-lock.json', 'package.json', 'page.css', 'vite.config.js')
    }
    MPU6050 = @{
        Path = Join-Path $workspace 'BBPVP\MPU6050'
        Remote = 'https://github.com/bnbcast/MPU6050'
        Message = 'Convert MPU-6050 motion lab to React'
        Paths = @('.env.example', '.github/workflows/deploy-pages.yml', '.gitignore', 'Breadcrumb.jsx', 'MotionLab.jsx', 'index.html', 'main.jsx', 'package-lock.json', 'package.json', 'page.css', 'vite.config.js')
    }
    AutodeskInventor = @{
        Path = Join-Path $workspace 'BBPVP\AutodeskInventor'
        Remote = 'https://github.com/bnbcast/2d-inventor'
        Message = 'Convert Inventor showcase to React'
        Paths = @('.env.example', '.github/workflows/deploy-pages.yml', '.gitignore', 'Breadcrumb.jsx', 'InventorShowcase.jsx', 'index.html', 'main.jsx', 'package-lock.json', 'package.json', 'page.css', 'part.json', 'vite.config.js')
    }
    InferenceTimeCalc = @{
        Path = Join-Path $workspace 'Stanfords\InferenceTimeCalc'
        Remote = 'https://github.com/bnbcast/InferenceTimeCalc'
        Message = 'Convert inference calculator to React'
        Paths = @('.env.example', '.github/workflows/deploy-pages.yml', '.gitignore', 'Breadcrumb.jsx', 'Calculator.jsx', 'InferenceTimeCalc.css', 'index.html', 'main.jsx', 'package-lock.json', 'package.json', 'vite.config.js')
    }
    WordDetective = @{
        Path = Join-Path $workspace 'Stanfords\WordDetective'
        Remote = 'https://github.com/bnbcast/Word-Detective'
        Message = 'Convert Word Detective to React'
        Paths = @('.env.example', '.github/workflows/deploy-pages.yml', '.gitignore', 'Breadcrumb.jsx', 'WordDetective.css', 'WordDetective.jsx', 'data.js', 'index.html', 'main.jsx', 'package-lock.json', 'package.json', 'vite.config.js')
    }
}

function Invoke-RepoGit {
    param(
        [string]$RepositoryPath,
        [string[]]$Arguments
    )

    $output = & $git -C $RepositoryPath @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Git failed in '$RepositoryPath': $($output -join [Environment]::NewLine)"
    }
    return $output
}

$selectedRepositories = @()
if ($Repo -eq 'All') {
    $selectedRepositories = @($repositories.Keys)
} else {
    $selectedRepositories = @($Repo)
}

foreach ($name in $selectedRepositories) {
    $repository = $repositories[$name]
    $path = $repository.Path

    if (-not (Test-Path -LiteralPath (Join-Path $path '.git'))) {
        throw "The '$name' Git repository was not found at '$path'."
    }

    $topLevel = (Invoke-RepoGit -RepositoryPath $path -Arguments @('rev-parse', '--show-toplevel') | Select-Object -First 1).Trim()
    $expectedRoot = (Resolve-Path -LiteralPath $path).Path
    if ([System.IO.Path]::GetFullPath($topLevel).TrimEnd('\') -ine $expectedRoot.TrimEnd('\')) {
        throw "The '$name' path is not the root of its own repository."
    }

    $branch = (Invoke-RepoGit -RepositoryPath $path -Arguments @('branch', '--show-current') | Select-Object -First 1).Trim()
    if ($branch -ne 'main') {
        throw "Expected '$name' to be on branch 'main'; found '$branch'."
    }

    $remote = (Invoke-RepoGit -RepositoryPath $path -Arguments @('remote', 'get-url', 'origin') | Select-Object -First 1).Trim().TrimEnd('/')
    $remote = $remote -replace '\.git$', ''
    if ($remote -ne $repository.Remote) {
        throw "The origin for '$name' does not match the expected repository."
    }

    $authorName = (Invoke-RepoGit -RepositoryPath $path -Arguments @('config', 'user.name') | Select-Object -First 1).Trim()
    $authorEmail = (Invoke-RepoGit -RepositoryPath $path -Arguments @('config', 'user.email') | Select-Object -First 1).Trim()
    if (-not $authorName -or -not $authorEmail) {
        throw "Configure your Git user.name and user.email before committing '$name'."
    }
    if ($env:GIT_AUTHOR_NAME -or $env:GIT_AUTHOR_EMAIL -or $env:GIT_COMMITTER_NAME -or $env:GIT_COMMITTER_EMAIL) {
        throw 'Clear GIT_AUTHOR_* and GIT_COMMITTER_* environment overrides before committing.'
    }

    $stagedPaths = @(Invoke-RepoGit -RepositoryPath $path -Arguments @('diff', '--cached', '--name-only'))
    $allowedPaths = @($repository.Paths | ForEach-Object { $_.Replace('\', '/') })
    $unrelatedStagedPaths = @($stagedPaths | Where-Object {
        $stagedPath = $_.Replace('\', '/')
        $isAllowed = $false
        foreach ($allowedPath in $allowedPaths) {
            if ($stagedPath -eq $allowedPath -or $stagedPath.StartsWith("$allowedPath/")) {
                $isAllowed = $true
                break
            }
        }
        -not $isAllowed
    })
    if ($unrelatedStagedPaths.Count -gt 0) {
        throw "The '$name' repository has staged changes outside this conversion: $($unrelatedStagedPaths -join ', '). Commit or unstage those separately."
    }

    foreach ($relativePath in $repository.Paths) {
        if (-not (Test-Path -LiteralPath (Join-Path $path $relativePath))) {
            throw "Expected conversion file '$relativePath' is missing from '$name'."
        }
    }

    $description = "Commit conversion changes in '$name' as '$authorName' (no push)."
    if ($PSCmdlet.ShouldProcess($path, $description)) {
        Invoke-RepoGit -RepositoryPath $path -Arguments (@('add', '--') + $repository.Paths) | Out-Null

        $stagedStatus = @(Invoke-RepoGit -RepositoryPath $path -Arguments @('diff', '--cached', '--name-only'))
        if ($stagedStatus.Count -eq 0) {
            Write-Output "Skipping '$name': no conversion changes to commit."
            continue
        }

        Invoke-RepoGit -RepositoryPath $path -Arguments @('commit', '-m', $repository.Message) | ForEach-Object { Write-Output $_ }

        $commitAuthor = (Invoke-RepoGit -RepositoryPath $path -Arguments @('show', '-s', '--format=%an <%ae>', 'HEAD') | Select-Object -First 1).Trim()
        $commitMessage = Invoke-RepoGit -RepositoryPath $path -Arguments @('show', '-s', '--format=%B', 'HEAD')
        if ($commitAuthor -ne "$authorName <$authorEmail>") {
            throw "The '$name' commit author does not match your configured Git identity."
        }
        if (($commitMessage -join "`n") -match '(?im)^Co-authored-by:\s*Copilot\b') {
            throw "The '$name' commit contains an unexpected Copilot co-author trailer."
        }

        Write-Output "Committed '$name' as $commitAuthor. Nothing was pushed."
    } else {
        Write-Output "Validated '$name': author '$authorName'; commit message '$($repository.Message)'; no push."
    }
}
