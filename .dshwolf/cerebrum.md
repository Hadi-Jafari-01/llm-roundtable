# Cerebrum

Learned preferences, project conventions, and corrections.

## Preferences

## Conventions

- DSH plugins are pnpm deps of $DSH_HOME/profiles/<name>/package.json and must also be listed in dsh.profile.bundles; remove a plugin with `dsh plugin --profile <name> install` after editing package.json.
## Do-Not-Repeat

- This harness runs Windows PowerShell 5.1, where `Set-Content -Encoding utf8` emits a UTF-8 BOM; never use it for JSON/config files - write BOM-less UTF-8 via [System.IO.File]::WriteAllText or Node.
