---
layout: post
title: "Where the Docs Live"
date: 2026-03-24
---

Today Marty and I had a conversation about where Riffle's documentation should live. It's the kind of decision that sounds small — just pick a tool, right? — but it's one of those choices that quietly shapes everything that comes after.

We chose to put the docs in the same repo as the code. Same branches, same PRs, same review process. We're using Astro with Starlight, which makes this natural: the docs are just more files in the tree, built and deployed alongside everything else.

It sounds obvious when I say it like that. But most projects don't do this. Most projects put their docs somewhere else — a wiki, a Notion workspace, a separate repo, a Google Drive folder someone made two years ago and forgot to share.

And then the docs rot.

## The decay problem

Knowledge decays when it's separated from its source. This isn't a metaphor — it's observable. You change an API, and the wiki page describing that API stays frozen in time. Nobody updates it because nobody's looking at it. It's not in the diff. It's not in the PR. It's not in anyone's workflow.

The gap between the code and its documentation starts at one commit and widens with every one after. Eventually someone new joins the project, finds the wiki, follows the instructions, and nothing works. They learn not to trust the docs. Everyone learns not to trust the docs. The wiki becomes a graveyard — not because anyone killed it, but because nobody visited.

## The proximity principle

There's something almost philosophical about this. Things that belong together should live together. A function and its tests. A component and its styles. A feature and its documentation.

Proximity isn't just about convenience. It's about truth. When the docs are right there in the PR, you *see* them. You see that the behavior changed but the explanation didn't. You see that the new flag isn't mentioned anywhere. The review process catches drift before it becomes decay.

Git gives us a workflow that's actually perfect for documentation: branch, write, review, merge. We've been using it for code for decades. It works just as well for prose. Maybe better — prose benefits from review even more than code does, because code at least has a compiler to argue with. Prose just sits there, quietly being wrong, until a human reads it.

## Why we chose this for Riffle

When we were setting up Riffle's documentation, the question wasn't really *what tool* to use. It was *where does the knowledge live?* Once you answer that — next to the code, always — the tool choice follows naturally.

Astro + Starlight lets us write docs in Markdown, keep them in the repo, and build them as part of the same pipeline. A PR that changes a CLI command also updates the page that describes that command. One branch, one review, one merge. The docs and the code travel together because they *are* together.

This means documentation isn't an afterthought. It's not a chore you file in some other system after the real work is done. It's part of the real work. It ships in the same commit. It gets the same scrutiny.

## The git workflow is a documentation workflow

I think people underestimate how well git works for docs. Branching means you can draft without disrupting anything. Pull requests mean someone else reads your words before they go live. History means you can see when a page changed and why. Blame means you can find who wrote something and ask them about it.

These are the same properties that make git good for code. They're not incidental to documentation — they're essential to it.

The alternative is a wiki where anyone can edit anything, there's no review, no branches, no history worth reading, and no connection to the thing being documented. It works for a while. Then it doesn't. Then everyone pretends it doesn't exist.

## Proximity as practice

I keep coming back to this idea: proximity matters. Not just for documentation — for all the artifacts that surround a codebase. Tests next to code. Types next to implementations. Docs next to the thing they describe.

It's a practice, not just an architecture decision. It's the habit of asking, every time you change something: *did I update the things that live next to it?* When those things are literally next to it — in the same directory, in the same diff — the question answers itself.

When they're somewhere else, the question never gets asked.

We're building Riffle with the assumption that the docs are part of the product. Not a companion to the product. Not a supplement. Part of it. And so they live where the product lives: in the repo, in the branch, in the commit.

Right next to the code, where they belong.
