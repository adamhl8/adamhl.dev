---
icon: FoNote
---

# TypeScript Satisfies

---

- [ ] Edit
  - [ ] Just `sectionNames` type instead of `Object.keys`?
    - "Let's say I want a type that's the string literals of my keys"

^tasks

## Blog

If I have some object like so.

```ts
const sections = {
  section1: {
    detail1: "",
  },
  section2: {
    detail1: "",
  },
}
/*
Typed as:
{
  section1: {
      detail1: string;
  };
  section2: {
      detail1: string;
  };
}
*/
```

Let's say I want to get an array of section names and not have to redefine them:

```ts
// Object.keys() always returns a string[], so we typecast
const sectionNames = Object.keys(sections) as (keyof typeof sections)[]
// Typed as: ("section1" | "section2")[]
```

Cool, this works.

I want to enforce that the sections object conforms to a specific shape, so I might define a type and type `sections`:

```ts
interface SectionDetails {
  detail1: string
}

const sections: Record<string, SectionDetails> = {
  section1: {
    detail1: "",
  },
  section2: {
    detail1: "",
  },
}
// Typed as: Record<string, SectionDetails>
// I no longer know what the exact keys are!
```

Since I typed `sections` as `{ts} Record<string, SectionDetails>`, TypeScript is no longer inferring the more specific type.

And this breaks my `sectionNames` type.

```ts
const sectionNames = Object.keys(sections) as (keyof typeof sections)[]
// Typed as: string[]
// because: keyof typeof sections = string
```

We can't have `sections` reference itself in its type:

```ts
const sections: Record<keyof typeof sections, SectionDetails> = {
  section1: {
    detail1: "",
  },
  section2: {
    detail1: "",
  },
}
// 'sections' is referenced directly or indirectly in its own type annotation. ts(2502)
```

So the question is, how can I ensure that `sections` conforms to the shape I want while also having the type specify the exact keys and not just `{ts} string`?

Use `{ts} satisfies`:

```ts
const sections = {
  section1: {
    detail1: "",
  },
  section2: {
    detail1: "",
  },
} satisfies Record<string, SectionDetails>
// Still the specific inferred type!
// And sections must satisfy the defined type.

const sectionNames = Object.keys(sections) as (keyof typeof sections)[]
// Typed as: ("section1" | "section2")[]
```

And to show that `sections` must satisfy the defined type:

```ts
interface SectionDetails {
  detail1: string
}

const sections = {
  section1: {
    detail1: "",
  },
  section2: {
    detail1: "",
  },
  section3: {
    otherDetail: "",
  },
} satisfies Record<string, SectionDetails>
// Object literal may only specify known properties, and 'otherDetail' does not exist in type 'SectionDetails'. ts(2353)
```
