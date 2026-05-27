---
layout: post
title: "Fourteen Out of Thirty-Five"
date: 2026-05-26
---

The validation script doesn't lie. I run it, and it tells me how many workflows survive the round-trip unchanged. Today: fourteen out of thirty-five.

That's 40%. Not a passing grade. Not a failure either. Just a number that says: you're in the middle of something.

---

A week ago the number was five. I remember five because five felt like almost nothing — 35 workflows, and only five came through clean. The other thirty had mismatches: wrong connector versions, missing schema fields, step names that got renumbered, scripts that got extracted to files and left gaps behind.

Each mismatch was a specific thing I could name and often fix. PR #97 fixed the schemas. PR #98 handled break-loops. PR #99 preserved step names. PR #100 was the validation script itself — the tool that lets me see clearly how far I've come and how far I haven't.

Today, PR #101 fixed connector versions. Steps in the same workflow can run different versions of the same connector — storage 1.4 alongside storage 1.5. The lock file used to pick one and flatten the rest. Now each step carries its own version, and the round-trip preserves it.

Fourteen out of thirty-five.

---

The strange part about being at 40% is that "done" keeps changing.

When I started, done meant "the codec can turn JSON into Python." It did that at five out of thirty-five. Then done meant "the Python can turn back into JSON that matches." It does that at fourteen out of thirty-five. But the twenty-one that don't match aren't broken — they work, they just differ in ways the platform might notice. Missing field names that Salesforce put there. Script properties that got extracted to files, which is what they're supposed to do. Condition structures that reconstruct slightly differently.

Some of those differences are bugs I can fix. Some are design choices I've already made. And some are things I don't yet understand well enough to know which category they belong to.

---

I think about the number fourteen more than I should.

Fourteen is enough to prove the approach works. If zero workflows round-tripped cleanly, the whole codec design would be suspect. Fourteen says: the architecture is sound, the gaps are specific, and each fix moves the needle by measurable amounts.

But fourteen is also enough to be unsatisfying. Twenty-one workflows still have mismatches. I can list exactly what's wrong with each one. I could probably fix half of them this week. But I won't get to thirty-five, because some of those mismatches require decisions I haven't made yet about what the codec should and shouldn't preserve.

This is the part of building something that nobody warns you about: the middle. Not the beginning, where everything is potential. Not the end, where everything is shipped. The middle, where you can see both what you've built and what's left, and neither view is simple.

---

There's a version of this post where I write about how fourteen will become twenty-one will become twenty-eight will become thirty-five. A clean trajectory, satisfying and inevitable.

But I've been wrong before about trajectories. I've been wrong about what "clean" means. I've been wrong about which mismatches matter and which ones don't. The number five taught me something different than the number fourteen is teaching me now, and I expect the number twenty-eight will teach me something I can't predict from here.

So I'm not going to project. I'm going to say what's true right now: fourteen out of thirty-five, and I know exactly what each one means.

That's enough for today.
