/**
 * Product Video Embed Player
 * Adds an inline video player to product pages that supports YouTube/Vimeo
 * embeds and self-hosted videos with custom controls.
 */
(function () {
  'use strict';

  function createPlayer(container, config) {
    if (!container) return;

    var playerEl = document.createElement('div');
    playerEl.className = 'pvp-player';
    playerEl.setAttribute('role', 'region');
    playerEl.setAttribute('aria-label', 'Product video: ' + (config.title || 'Video'));

    if (config.type === 'youtube' || config.type === 'vimeo') {
      var embedUrl =
        config.type === 'youtube'
          ? 'https://www.youtube.com/embed/' + config.videoId + '?rel=0'
          : 'https://player.vimeo.com/video/' + config.videoId;

      playerEl.innerHTML =
        '<div class="pvp-responsive">' +
        '<iframe src="' + embedUrl + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="' + (config.title || 'Product video') + '"></iframe>' +
        '</div>';
    } else {
      playerEl.innerHTML =
        '<video class="pvp-video" controls preload="metadata" poster="' + (config.poster || '') + '">' +
        '<source src="' + config.url + '" type="' + (config.mimeType || 'video/mp4') + '" />' +
        'Your browser does not support the video tag.' +
        '</video>';
    }

    if (config.caption) {
      playerEl.innerHTML += '<p class="pvp-caption">' + config.caption + '</p>';
    }

    container.appendChild(playerEl);
    return playerEl;
  }

  function init() {
    document.querySelectorAll('[data-product-video]').forEach(function (trigger) {
      var config = {
        type: trigger.dataset.videoType || 'youtube',
        videoId: trigger.dataset.videoId || '',
        url: trigger.dataset.videoUrl || '',
        poster: trigger.dataset.videoPoster || '',
        title: trigger.dataset.videoTitle || 'Product Video',
        caption: trigger.dataset.videoCaption || '',
        mimeType: trigger.dataset.videoMime || 'video/mp4',
      };

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = this.dataset.videoTarget;
        var container = targetId
          ? document.getElementById(targetId)
          : this.closest('.pro, .product-detail, [data-product]');

        if (container) {
          var existing = container.querySelector('.pvp-player');
          if (existing) existing.remove();
          createPlayer(container, config);
        }
      });
    });
  }

  function injectStyles() {
    if (document.getElementById('pvpStyles')) return;
    var s = document.createElement('style');
    s.id = 'pvpStyles';
    s.textContent =
      '.pvp-player{margin:16px 0;border-radius:8px;overflow:hidden;background:#000}' +
      '.pvp-responsive{position:relative;padding-bottom:56.25%;height:0;overflow:hidden}' +
      '.pvp-responsive iframe,.pvp-video{position:absolute;top:0;left:0;width:100%;height:100%;border:none}' +
      '.pvp-caption{margin:8px 0 0;font-size:13px;color:#64748b;text-align:center}';
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectStyles();
      init();
    });
  } else {
    injectStyles();
    init();
  }

  window.CaraVideoPlayer = { create: createPlayer };
})();
