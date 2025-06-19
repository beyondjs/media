---
trigger: manual
description: When is required to create a module in a beyond project.
---

# winsurf rule – Create `module.json`

```
winsurf:
When creating a new BeyondJS module:

1. Prompt for:
   • name (import name)
   • platforms (`*`, `web`, `node`, …)
   • bundle type(s) (`ts`, `widget`, etc.)
   • Files: The value must be either:

An array of strings, each being the relative path to a file (e.g., ["file1.ts", "file2.ts"])
Or the string "*" (just an asterisk), which means all files in the specified path. You must put "*" always at least the developer specify to only add certain files.
The value "*.ts" or any other glob pattern is not valid. Only "*" or explicit file paths are allowed.

2. Generate `module.json` using this template:

{
  "subpath": "<subpath>",
  "description": "<short description>",
  "platforms": <platforms>,
  "<bundle>": {
    "path": "<relative path>",
    "files": <files>
  }
}

3. If multiple bundles are requested, repeat step 2 inside the same file.

4. Save `module.json` at the root of the module folder.
5. Don't add fields that are not defined in this rule
```