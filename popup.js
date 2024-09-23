// popup.js

document.addEventListener('DOMContentLoaded', function () {
  loadHistory();

  document.getElementById('clear-all').addEventListener('click', function () {
    chrome.storage.local.set({ 'history': [] }, function () {
      loadHistory();
    });
  });

  document.getElementById('search').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    loadHistory(query);
  });
});

function loadHistory(query = '') {
  chrome.storage.local.get(['history'], function (result) {
    let history = result.history || [];
    if (query) {
      history = history.filter(item =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        item.url.toLowerCase().includes(query)
      );
    }
    history = history.slice(0, 20);
    displayHistory(history);
  });
}

function displayHistory(history) {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  if (history.length === 0) {
    const noHistoryDiv = document.createElement('div');
    noHistoryDiv.className = 'no-history';
    noHistoryDiv.textContent = '没有关闭的页面';
    list.appendChild(noHistoryDiv);
    return;
  }
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';

    const itemContent = document.createElement('div');
    itemContent.className = 'item-content';

    const favicon = document.createElement('img');
    favicon.className = 'favicon';

    // 检查 favicon URL 是否有效
    if (isValidUrl(item.favIconUrl)) {
      favicon.src = item.favIconUrl;
      favicon.onerror = function () {
        this.src = chrome.runtime.getURL('icons/default_favicon.png');
      };
    } else {
      favicon.src = chrome.runtime.getURL('icons/default_favicon.png');
    }

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = item.title || item.url;

    itemContent.appendChild(favicon);
    itemContent.appendChild(title);

    const timeSpan = document.createElement('div');
    timeSpan.className = 'time';
    const timeAgo = getTimeAgo(item.time);
    timeSpan.textContent = timeAgo;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '删除';
    deleteBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      deleteHistoryItem(item);
    });

    div.appendChild(itemContent);
    div.appendChild(timeSpan);
    div.appendChild(deleteBtn);

    div.addEventListener('click', function () {
      chrome.tabs.create({ url: item.url });
    });

    list.appendChild(div);
  });
}

function isValidUrl(url) {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:', 'chrome:'].includes(parsedUrl.protocol);
  } catch (e) {
    return false;
  }
}

function deleteHistoryItem(itemToDelete) {
  chrome.storage.local.get(['history'], function (result) {
    let history = result.history || [];
    history = history.filter(item => !(item.url === itemToDelete.url && item.time === itemToDelete.time));
    chrome.storage.local.set({ 'history': history }, function () {
      loadHistory();
    });
  });
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) {
    return `${seconds} s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}