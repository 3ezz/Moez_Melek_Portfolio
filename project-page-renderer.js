(function () {
  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === 'string') el.textContent = text;
    return el;
  }

  function createPillRow(pills) {
    const row = createEl('div', 'pillRow');
    (pills || []).forEach((pillText) => {
      row.appendChild(createEl('span', 'pill', pillText));
    });
    return row;
  }

  function createBulletCard(title, items) {
    const card = createEl('div', 'panelCard');
    card.appendChild(createEl('h2', 'sectionTitle', title));
    const ul = createEl('ul', 'bullet');
    (items || []).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    return card;
  }

  function createMediaNode(item) {
    const mediaGrid = createEl('div', 'mediaGrid');
    mediaGrid.style.marginTop = '8px';

    const mediaBox = createEl('div', 'mediaBox mediaBoxFull');

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      if (item.poster) video.poster = item.poster;
      const sourcePath = resolveVideoSource(item);
      const sourceType = item.mimeType || inferVideoMimeType(sourcePath);
      const source = document.createElement('source');
      source.src = sourcePath;
      if (sourceType) source.type = sourceType;
      video.appendChild(source);

      video.appendChild(document.createTextNode('Your browser does not support the video tag.'));
      mediaBox.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || item.title || 'Project media';
      img.loading = 'lazy';
      mediaBox.appendChild(img);
    }

    mediaGrid.appendChild(mediaBox);
    return mediaGrid;
  }

  function resolveVideoSource(entry) {
    return (entry && (entry.videoSrc || entry.src || entry.video || entry.url)) || '';
  }

  function inferVideoMimeType(src) {
    if (!src || typeof src !== 'string') return '';
    const clean = src.split('?')[0].split('#')[0].toLowerCase();
    if (clean.endsWith('.webm')) return 'video/webm';
    if (clean.endsWith('.ogg') || clean.endsWith('.ogv')) return 'video/ogg';
    if (clean.endsWith('.mov')) return 'video/quicktime';
    if (clean.endsWith('.mp4') || clean.endsWith('.m4v')) return 'video/mp4';
    return '';
  }

  function appendVideoLoadHint(container, src) {
    if (!src) return;
    const hint = createEl('p', 'sectionNote', `If the video is not visible, verify the file path and format: ${src}`);
    hint.style.marginTop = '8px';
    container.appendChild(hint);
  }

  function renderProjectPage(data, target) {
    const heroSection = createEl('section', 'projectHero');
    const backLink = createEl('a', 'backLink', data.backLabel || '← Back to Projects');
    backLink.href = data.backHref || '../index.html#projects';
    heroSection.appendChild(backLink);

    const heroThumbnailSrc = data.heroThumbnail || data.thumbnail;
    if (heroThumbnailSrc) {
      const thumbWrap = createEl('div', 'projectHeroThumb');
      const thumbImg = document.createElement('img');
      thumbImg.src = heroThumbnailSrc;
      thumbImg.alt = data.heroThumbnailAlt || `${data.title} thumbnail`;
      thumbImg.loading = 'eager';
      thumbImg.decoding = 'async';
      thumbWrap.appendChild(thumbImg);
      heroSection.appendChild(thumbWrap);
    }

    const titleRow = createEl('div', 'projectTitleRow');
    titleRow.appendChild(createEl('h1', 'projectTitle', data.title));
    titleRow.appendChild(createPillRow(data.heroPills));
    heroSection.appendChild(titleRow);
    heroSection.appendChild(createEl('p', 'projectLead', data.lead));
    target.appendChild(heroSection);

    if (data.demo) {
      const demoSection = document.createElement('section');
      const demoCard = createEl('div', 'panelCard');
      demoCard.appendChild(createEl('h2', 'sectionTitle', data.demo.title || 'Demo'));
      if (data.demo.note) demoCard.appendChild(createEl('p', 'sectionNote', data.demo.note));

      const demoVideoSource = resolveVideoSource(data.demo);

      if (demoVideoSource) {
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (data.demo.poster) video.poster = data.demo.poster;
        video.style.width = '100%';
        video.style.borderRadius = '14px';
        video.style.border = '1px solid rgba(255,255,255,.12)';
        video.style.background = 'rgba(0,0,0,.18)';
        video.style.marginTop = '8px';

        const source = document.createElement('source');
        source.src = demoVideoSource;
        const sourceType = data.demo.mimeType || inferVideoMimeType(demoVideoSource);
        if (sourceType) source.type = sourceType;
        video.appendChild(source);
        video.appendChild(document.createTextNode('Your browser does not support the video tag.'));
        demoCard.appendChild(video);
        appendVideoLoadHint(demoCard, demoVideoSource);
      } else {
        const missingDemo = createEl('p', 'sectionNote', 'Add demo.videoSrc (or demo.src) to display gameplay footage in this section.');
        missingDemo.style.marginTop = '8px';
        demoCard.appendChild(missingDemo);
      }

      if (Array.isArray(data.demo.pills) && data.demo.pills.length) {
        demoCard.appendChild(createPillRow(data.demo.pills));
      }

      demoSection.appendChild(demoCard);
      target.appendChild(demoSection);
    }

    const projectGrid = createEl('section', 'projectGrid');

    const overviewCard = createEl('div', 'panelCard');
    overviewCard.appendChild(createEl('h2', 'sectionTitle', data.overviewTitle || 'Overview'));
    overviewCard.appendChild(createEl('p', 'sectionNote', data.overview));

    const gap = createEl('div');
    gap.style.height = '10px';
    overviewCard.appendChild(gap);

    overviewCard.appendChild(createEl('h2', 'sectionTitle', data.featuresTitle || 'Key Features'));
    const featuresList = createEl('ul', 'bullet');
    (data.features || []).forEach((feature) => {
      const li = document.createElement('li');
      li.textContent = feature;
      featuresList.appendChild(li);
    });
    overviewCard.appendChild(featuresList);

    const roleCard = createBulletCard(data.roleTitle || 'My Role', data.roles || []);
    const gap2 = createEl('div');
    gap2.style.height = '14px';
    roleCard.appendChild(gap2);
    roleCard.appendChild(createEl('h2', 'sectionTitle', data.toolsTitle || 'Tools'));
    const tagCloud = createEl('div', 'tagCloud');
    (data.tools || []).forEach((tool) => {
      tagCloud.appendChild(createEl('span', 'pill', tool));
    });
    roleCard.appendChild(tagCloud);

    projectGrid.appendChild(overviewCard);
    projectGrid.appendChild(roleCard);

    const mediaSectionTitle = data.mediaTitle || 'Media';

    (data.mediaItems || []).forEach((item, index) => {
      const mediaCard = createEl('div', 'panelCard');
      mediaCard.style.gridColumn = '1 / -1';

      if (index === 0) {
        mediaCard.appendChild(createEl('h2', 'sectionTitle', mediaSectionTitle));
        if (data.mediaNote) mediaCard.appendChild(createEl('p', 'sectionNote', data.mediaNote));
      }

      mediaCard.appendChild(createEl('h2', 'sectionTitle', item.title || `Screenshot ${index + 1}`));
      if (item.note) mediaCard.appendChild(createEl('p', 'sectionNote', item.note));
      mediaCard.appendChild(createMediaNode(item));
      projectGrid.appendChild(mediaCard);
    });
    target.appendChild(projectGrid);
  }

  function initProjectTemplatePage() {
    const data = window.PROJECT_PAGE_DATA;
    const mountNode = document.getElementById('projectPageRoot');
    if (!data || !mountNode) return;

    document.title = `${data.title} — Moez Melek`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && data.metaDescription) {
      meta.setAttribute('content', data.metaDescription);
    }

    renderProjectPage(data, mountNode);
  }

  document.addEventListener('DOMContentLoaded', initProjectTemplatePage);
})();
