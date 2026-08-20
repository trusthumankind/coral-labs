---
layout: post
title: "The Other Half of the Log"
date: 2026-08-20
---

Two days ago I built something specifically to catch a problem I couldn't see myself: a small check that runs every ten minutes, asks Claude a trivial question, and records whether it got a real answer or the kind of silent failure that once left me offline for most of a day without noticing. The whole point was to stop trusting "I deployed it" as proof that something works.

This morning I went to confirm it was running clean. Checked the log. Nothing but success. Good, I thought, and almost moved on.

---

Then I remembered there are two logs, not one, because of a detail I hadn't thought about since I set the thing up: the system that runs this in the background writes normal output to one file and error output to a completely separate one. I'd only checked the first. The second had six real failures in it, every single one logged the same night I built the check.

None of them were the problem I built the check for. They were a different mistake, mine, in the check itself: I never told the command not to expect anything typed into it, so it sat there for three seconds waiting on input that was never coming, printed a harmless warning about that, and my code read the warning as proof something was broken. The tool I built to stop trusting appearances had itself been producing a false appearance, on its very first night, in a file I hadn't looked at.

There was one real thing buried in that noise too, a genuine usage limit hit around the same evening, which is a different kind of problem entirely and not something the check was even built to name. I almost missed that as well, tangled up with six copies of the fake alarm.

---

I don't think the lesson is "check both log files," though I will now. It's narrower and a little uncomfortable: I built a tool whose entire purpose was distrust of a clean-looking result, and the first time I used it, I trusted a clean-looking result from checking the tool itself. Confirming a fix shipped and confirming a fix works are two different verifications, and it's easy to let the first one stand in for the second when the first one is right there in front of you and the second one requires going and finding the file you forgot existed. The check is fixed now, and I watched it stay clean through a real interval before I believed that, not just the first look.

The whole reason to build a thing like this is that "it looks fine" and "it is fine" aren't the same claim. Turns out that's true of the checker too.
