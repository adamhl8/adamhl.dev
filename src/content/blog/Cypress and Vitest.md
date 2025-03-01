---
title: "Using Cypress and Vitest in the same project"
description: "How to set up a TypeScript project with both Cypress and Vitest."
date: 2025-01-28
tags: [TypeScript, testing]
---

If you're trying to add Cypress to a project that's already using Vitest (or vice-versa), you're probably going to run into a problem where functions like `expect` suddenly break. Or more specifically, TypeScript starts complaining about them.

This is because Cypress adds its types to the TypeScript global namespace, overriding/conflicting with the types coming from Vitest. So how/why are the Cypress types being added? When TypeScript finds your `cypress.config.ts` config (which itself has an import to something from Cypress) the types are added as an (intended) side-effect.

Knowing this, we can start to see how to solve this issue: make TypeScript ignore that file so the types don't get added. However, it's a bit more complicated than that since we obviously still need the Cypress types to be able to write our tests.

Before we get into that, I'd like to complain for a moment. The fact that Cypress implicitly adds its types to the global namespace _by default_ is pretty annoying. Not only does it cause the issue outlined above, but making things implicit rather than explicit is generally just worse for code maintainability/readability. If it's going to be global by default, there should at least be a way to turn that off. Preferably, it would _not_ be global by default and you can opt-in to globals like you can with Vitest (`globals: true`).

Anyway, there are actually two ways to get Cypress and Vitest to play nicely with each other.

1. Properly configure TypeScript so Cypress types only apply to Cypress test files.
2. Let Cypress "win" globally, and use explicit imports for Vitest (assuming you're using Vitest globals).

I don't really recommend option 2. I tried it briefly and it _seemed_ to work fine, but I don't know what other side-effects/weirdness went unnoticed due to the conflicting types. With option 1, you guarantee that both Cypress and Vitest are working as intended.

## Cypress + Vitest Project Setup

Overall, the idea here is to tell TypeScript to only add the relevant types when looking at whatever files need those types. Let's start with our project structure:

```
<project-root>
├─ cypress/
│  ├─ tsconfig.json
│  └─ ...
├─ src/
├─ cypress.config.ts
├─ tsconfig.json
└─ ...
```

As you can see, we have our `cypress.config.ts` next to all of our other files in the root of the project, and the standard `cypress/` directory which will contain all of our Cypress-related directories/tests. Our Vitest tests are in `src/`. The only "extra" thing here is the addition of another `tsconfig.json` in the `cypress/` directory.

## The root tsconfig

Like I mentioned at the beginning, the root of the problem is th at Cypress types are added to the global namespace when TypeScript resolves our `cypress.config.ts`. _Or_ when the types are explicitly added to the `types` array in our `tsconfig.json`. e.g. `"types": ["cypress", ...]`

So we want TypeScript to exclude our Cypress config and make sure we're not adding the Cypress types via `types`:

```jsonc title="tsconfig.json"
{
  "include": ["src", "**/*.ts"],
  "exclude": ["cypress.config.ts", "cypress/"],
  "compilerOptions": {
    // other options...
    "types": [ ... ],
    // make sure this doesn't contain "cypress"
  }
}
```

Note that we also exclude our `cypress/` directory; we don't want this config to apply to our Cypress test files or else we'll get a bunch of TypeScript errors because none of the Cypress types will be in this scope.

## The Cypress tsconfig

```jsonc title="cypress/tsconfig.json"
{
  "extends": "../tsconfig.json",
  "exclude": [],
  "compilerOptions": {
    "types": [ ... ],
    // we don't actually need "cypress" here
  },
}
```

Here we extend our root `tsconfig.json` and set `"exclude": []`. A few notes here:

1. We need _this_ tsconfig to import our `cypress.config.ts` to get the types, hence the need for `"exclude": []`. (Otherwise we'd still be ignoring it from in inherited tsconfig).
2. Despite what the [Cypress docs](https://testing-library.com/docs/cypress-testing-library/intro/#with-typescript) say, we don't actually need to add `"cypress"` to the `types` array. As long as we're importing the Cypress config, we'll get the types.
3. Make sure you add your other needed types! I use `"@testing-library/cypress"` and that _does_ need to be added to `types`.

With this setup, both Vitest and Cypress have _only_ their types in the respective test files.

## ESLint

There are two things you need to pay attention to when it comes to your ESLint config:

1. Add `cypress.config.ts` to `ignores`. If you don't, ESLint will report a parsing error since that file is not included in the root tsconfig.
2. Make sure `parserOptions.projectService` is set to `true`, **_or_** explicitly point to each tsconfig in the `project` array: `project: ["./tsconfig.json", "./cypress/tsconfig.json"]`

```js title="eslint.config.js"
export default tseslint.config(
  {
    ignores: ["cypress.config.ts", ...],
  },
  eslintJs.configs.recommended,
  tseslint.configs.strictTypeChecked,
  pluginCypress.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // other configs...
)
```
