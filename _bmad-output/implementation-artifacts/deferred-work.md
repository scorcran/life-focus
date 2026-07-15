
## Deferred from: code review of spec-1-1-project-scaffold-and-development-environment (2026-07-13)

- `.npmrc` legacy-peer-deps=true globally disables peer-dependency resolution for every install — introduced to work around the @typescript-eslint × TypeScript 7 peer conflict. Revisit and remove when @typescript-eslint publishes TS 7 peer support; until then genuinely-broken peer combos install silently.
