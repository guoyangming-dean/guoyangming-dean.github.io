---
title: "Assets"
layout: single
permalink: /assets/
---

<style>
.asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; padding: 20px; }
.asset-item { border: 1px solid #ddd; border-radius: 8px; padding: 10px; text-align: center; transition: box-shadow 0.3s; }
.asset-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.asset-item img { max-width: 100%; height: auto; border-radius: 4px; }
.asset-item a { text-decoration: none; color: #333; }
.asset-item a:hover { color: #0066cc; }
.asset-name { margin-top: 8px; font-size: 14px; word-break: break-all; }
.asset-type { font-size: 12px; color: #666; margin-top: 4px; }
.folder-section { margin-bottom: 40px; }
.folder-section h2 { border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
.loading { text-align: center; padding: 40px; font-size: 18px; color: #666; }
.error { text-align: center; padding: 40px; color: #c00; }
</style>

## Pictures

<div id="pictures-grid" class="asset-grid">
  <div class="loading">Loading pictures...</div>
</div>

## Files

<div id="files-grid" class="asset-grid">
  <div class="loading">Loading files...</div>
</div>

<script>
const repo = 'guoyangming-dean.github.io';
const branch = 'main';
const basePath = 'docs/assets';

async function fetchDirectory(path, containerId) {
  const container = document.getElementById(containerId);
  try {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    const files = await response.json();

    if (!Array.isArray(files) || files.length === 0) {
      container.innerHTML = '<div class="error">No files found</div>';
      return;
    }

    container.innerHTML = files
      .filter(f => f.type === 'file' && !f.name.startsWith('.'))
      .map(file => {
        const name = file.name;
        const ext = name.split('.').pop().toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
        const isPdf = ext === 'pdf';
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}/${encodeURIComponent(name)}`;
        const pageUrl = `https://guoyangming-dean.github.io/${path}/${encodeURIComponent(name)}`;

        if (isImage) {
          return `
            <div class="asset-item">
              <a href="${pageUrl}" target="_blank">
                <img src="${url}" alt="${name}" loading="lazy">
                <div class="asset-name">${name}</div>
              </a>
            </div>
          `;
        } else if (isPdf) {
          return `
            <div class="asset-item">
              <a href="${pageUrl}" target="_blank">
                <div style="font-size: 48px; color: #c00;">📄</div>
                <div class="asset-name">${name}</div>
                <div class="asset-type">PDF</div>
              </a>
            </div>
          `;
        } else {
          return `
            <div class="asset-item">
              <a href="${pageUrl}" target="_blank">
                <div style="font-size: 48px;">📁</div>
                <div class="asset-name">${name}</div>
              </a>
            </div>
          `;
        }
      }).join('');
  } catch (error) {
    container.innerHTML = `<div class="error">Failed to load: ${error.message}</div>`;
  }
}

fetchDirectory(`${basePath}/pictures`, 'pictures-grid');
fetchDirectory(`${basePath}/files`, 'files-grid');
</script>
