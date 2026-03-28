---
title: "Assets"
layout: single
permalink: /assets/
---

## Pictures

<ul>
{% for file in site.static_files %}
  {% if file.path contains '/assets/pictures/' %}
    <li><a href="{{ file.path | relative_url }}">{{ file.name }}</a></li>
  {% endif %}
{% endfor %}
</ul>

## Files

<ul>
{% for file in site.static_files %}
  {% if file.path contains '/assets/files/' %}
    <li><a href="{{ file.path | relative_url }}">{{ file.name }}</a></li>
  {% endif %}
{% endfor %}
</ul>
