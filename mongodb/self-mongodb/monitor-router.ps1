param(
  [ValidateSet('enable','disable','status','currentop','tail')]
  [string]$Action = 'status',

  [int]$SlowMs = 100,
  [int]$TailLines = 200,
  [switch]$VerboseCommands,
  [string]$Match = ''
)

function Test-MongosContainer {
  $name = docker ps --format "{{.Names}}" | Select-String -Pattern '^mongos$'
  if (-not $name) {
    throw "Container 'mongos' is not running. Start the cluster first."
  }
}

function Invoke-MongosEval {
  param([string]$Js)
  docker exec mongos mongosh --quiet --port 27017 --eval $Js
}

Test-MongosContainer

switch ($Action) {
  'enable' {
    Write-Host "Enabling mongos slow-op threshold: $SlowMs ms"
    # Use runCommand for broad compatibility across mongosh versions.
    Invoke-MongosEval "db.runCommand({ profile: 0, slowms: $SlowMs, sampleRate: 1.0 })"

    if ($VerboseCommands) {
      Write-Host "Enabling command-component verbosity on mongos"
      Invoke-MongosEval "db.adminCommand({ setParameter: 1, logComponentVerbosity: { verbosity: 0, command: { verbosity: 1 } } })"
    }

    Write-Host "Router monitoring enabled."
    Write-Host "Note: db.setProfilingLevel/system.profile are not available on mongos."
  }

  'disable' {
    Write-Host "Disabling command-component verbosity on mongos"
    Invoke-MongosEval "db.adminCommand({ setParameter: 1, logComponentVerbosity: { verbosity: 0, command: { verbosity: 0 } } })"
    Write-Host "Verbose command logging disabled."
  }

  'status' {
    Write-Host "Getting mongos monitoring parameters"
    Invoke-MongosEval "db.runCommand({ profile: -1 })"
    Invoke-MongosEval "db.adminCommand({ getParameter: 1, logComponentVerbosity: 1 })"
  }

  'currentop' {
    Write-Host "Listing current operations via mongos"
    Invoke-MongosEval 'db.adminCommand({ currentOp: 1, $all: true })'
  }

  'tail' {
    Write-Host "Tailing mongos logs (last $TailLines lines)"
    if ([string]::IsNullOrWhiteSpace($Match)) {
      docker logs -f --tail $TailLines mongos
    } else {
      docker logs -f --tail $TailLines mongos 2>&1 | Select-String -Pattern $Match
    }
  }
}
