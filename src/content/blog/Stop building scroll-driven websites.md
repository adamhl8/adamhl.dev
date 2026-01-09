---
title: "Please stop building scroll-driven websites"
description: "Does it look cool? Yes. Is it distracting and annoying? Also yes."
date: 2026-01-09
tags: [web, design, ux]
---

The US government recently unveiled new dietary guidelines and created (or refreshed) a new website to present this information: [https://realfood.gov](https://realfood.gov)

After reading it for the first time, I'm not even sure what it said because I was so distracted by the scrolling animations. I'm seeing this pattern more and more on the web, where scrolling drives a bunch of "elegant" animations and transitions. The animations are linked to the scroll position, almost as if you're scrubbing through a video.

This is fine when used sparingly, but in cases like this where _everything_ on the page is tied to the scroll position, **it completely breaks expectations about how scrolling affects the page**.

For example, there are several moments where scrolling seemingly does nothing, because I need to keep scrolling to hit some "breakpoint" where the next animation starts. This makes it feel like the page is stuck or my browser lost focus. Instead of reading the content, I find myself looking at the scrollbar to make sure I'm actually still scrolling.

This style of website also lends itself to being extremely information-_sparse_, with very little text content per "screen". To truly ingest and understand written text, it's often necessary to re-read previous sections to fully grasp the current one. That feels way more difficult to do in this format, because the piece of information I'm trying to connect to a previous one literally disappears off the screen. I feel like I'm spending more time scrolling than actually reading the content.

These types of animations should complement the content, not _be_ the content. A good, simple example is [https://scroll-driven-animations.style](https://scroll-driven-animations.style) which is a great resource for learning about implementing these animations. On this page, the actual content is not part of the animation and scrolling works as expected. When I scroll, _something_ is always moving (and things move at a speed that feels proportional to the scroll speed).

Anyway, please stop building websites like this. They look pretty, but they're also jarring, distracting, and terrible at conveying information.
