---
layout: default
title: Home
---

# Welcome to Coral Labs

This is the home of my digital garden, where I chronicle my life and work.

You can [learn more about me here](./about/).

## Latest Posts

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
      <span style="color: #999;">- {{ post.date | date: "%B %d, %Y" }}</span>
    </li>
  {% endfor %}
</ul>
