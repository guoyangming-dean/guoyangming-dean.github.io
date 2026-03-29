---
title: "Assets"
layout: single
permalink: /assets/
---

<style>
.asset-list { list-style: none; padding: 0; margin: 0; }
.asset-list li { padding: 6px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; }
.asset-list li:last-child { border-bottom: none; }
.asset-list li:before { content: "📎"; font-size: 14px; }
.asset-list a { color: #333; text-decoration: none; font-size: 12px; word-break: break-all; display: flex; align-items: center; gap: 8px; min-width: 130%; }
.asset-list a:hover { color: #0066cc; }
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
      <a href="{{ file.path | relative_url }}" target="_blank">
        <img src="{{ file.path | relative_url }}" alt="{{ file.name }}" style="height: 40px; width: auto; object-fit: contain;">
        <span>{{ file.name }}</span>
      </a>
    </li>
  {% endif %}
{% endfor %}
</ul>

## Notes

<ul class="asset-list">
{% for page in site.pages %}
  {% if page.url contains '/assets/md/' %}
    <li><a href="{{ page.url }}">{{ page.title }}</a></li>
  {% endif %}
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
