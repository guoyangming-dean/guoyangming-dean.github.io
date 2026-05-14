---
title: "Assets"
layout: single
permalink: /assets/
classes:
  - assets-page
---

<style>
.assets-page .page__content { font-size: 0.92rem; }
.asset-list { list-style: none; padding: 0; margin: 0 0 1.5rem; }
.asset-list li { padding: 0.45rem 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 0.55rem; }
.asset-list li:last-child { border-bottom: none; }
.asset-list li:before { content: "📎"; flex: 0 0 auto; font-size: 0.9rem; line-height: 1; }
.asset-list a { color: #333; text-decoration: none; word-break: break-word; display: flex; align-items: center; gap: 0.65rem; min-width: 0; width: 100%; }
.asset-list a:hover { color: #0066cc; }
.asset-list img { flex: 0 0 auto; height: 2.35rem; width: auto; max-width: 4rem; object-fit: contain; }
.asset-list span { min-width: 0; }
</style>

## Files

<ul class="asset-list">
{% for file in site.static_files %}
  {% if file.path contains '/assets/files/' %}
    <li><a href="{{ file.path | relative_url }}">{{ file.name }}</a></li>
  {% endif %}
{% endfor %}
</ul>

## Pictures

<ul class="asset-list">
{% for file in site.static_files %}
  {% if file.path contains '/assets/pictures/' %}
    <li>
      <a href="{{ file.path | relative_url }}?open=1" target="_blank" rel="noopener">
        <img src="{{ file.path | relative_url }}" alt="{{ file.name }}">
        <span>{{ file.name }}</span>
      </a>
    </li>
  {% endif %}
{% endfor %}
</ul>

## Notes

<ul class="asset-list">
{% assign notes = site.pages | where_exp: "page", "page.path contains 'assets/notes/'" | sort: "title" %}
{% for note in notes %}
  {% assign note_title = note.name | remove: ".md" | replace: "_", " " %}
  <li><a href="{{ note.url | relative_url }}">{{ note_title }}</a></li>
{% endfor %}
</ul>

## Docs

<ul class="asset-list">
{% for file in site.static_files %}
  {% if file.path contains '/assets/docs/' %}
    <li><a href="{{ file.path | relative_url }}">{{ file.name }}</a></li>
  {% endif %}
{% endfor %}
</ul>
