// popup.js

// Caché de favicons para acelerar la carga
const faviconCache = new Map();
// URL del favicon predeterminado
const DEFAULT_FAVICON = chrome.runtime.getURL('icons/default_favicon.svg');
// 设置更长的图标加载超时时间
const FAVICON_LOAD_TIMEOUT = 2000; // 2秒超时

// 应用设置的函数
function applySettings() {
  chrome.storage.local.get(['settings'], function(result) {
    const settings = result.settings || { 
      popupWidth: 600, 
      popupHeight: 540,
      historyItemsCount: 100, 
      language: 'zh'
    };
    
    // 应用窗口大小
    document.body.style.width = `${settings.popupWidth}px`;
    
    // 设置历史记录列表高度，考虑控制面板的高度
    const controlsHeight = document.getElementById('controls').offsetHeight;
    // 减去控制栏的高度和内边距，防止双滚动条
    const listHeight = settings.popupHeight - controlsHeight - 1; // 减1px边框
    document.getElementById('history-list').style.maxHeight = `${listHeight}px`;
    document.getElementById('history-list').style.height = `${listHeight}px`;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // 初始化多语言
  i18n.initI18n();
  
  // 应用设置
  applySettings();
  
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
  
  // 添加设置按钮点击事件
  document.getElementById('settings-btn').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
});

function loadHistory(query = '') {
  chrome.storage.local.get(['history', 'settings'], function (result) {
    let history = result.history || [];
    const settings = result.settings || { historyItemsCount: 100 };
    
    if (query) {
      history = history.filter(item =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        item.url.toLowerCase().includes(query)
      );
    }
    
    // 显示设置中指定数量的历史记录条目
    const historyItems = history.slice(0, settings.historyItemsCount);
    displayHistory(historyItems);
    
    // 加载favicons
    setTimeout(() => {
      loadFavicons(historyItems);
    }, 10);
  });
}

// 改进图标加载功能
function loadFavicons(historyItems) {
  historyItems.forEach(item => {
    // 如果URL为空或者不是有效的URL，直接使用默认图标
    if (!item.favIconUrl || !isValidUrl(item.favIconUrl)) {
      faviconCache.set(item.favIconUrl || 'empty', DEFAULT_FAVICON);
      updateFaviconInDOM(item.favIconUrl || 'empty', DEFAULT_FAVICON);
      return;
    }
    
    // 如果图标已在缓存中，无需重新加载
    if (faviconCache.has(item.favIconUrl)) {
      return;
    }
    
    // 设置默认图标作为临时图标，避免加载过程中显示空白
    faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
    updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
    
    // 创建一个新的图像对象来加载favicon
    const img = new Image();
    
    // 设置加载成功时的处理
    img.onload = function() {
      try {
        // 检查图像是否确实加载成功（有一些图像加载"成功"但实际上尺寸为0）
        if (img.width > 0 && img.height > 0) {
          faviconCache.set(item.favIconUrl, item.favIconUrl);
          updateFaviconInDOM(item.favIconUrl, item.favIconUrl);
        } else {
          console.log('Favicon loaded but has invalid dimensions:', item.favIconUrl);
          faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
          updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
        }
      } catch (error) {
        console.log('Error processing loaded favicon:', error);
        faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
        updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
      }
    };
    
    // 设置加载错误时的处理
    img.onerror = function() {
      console.log('Failed to load favicon:', item.favIconUrl);
      faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
      updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
    };
    
    // 创建一个超时定时器，如果图像加载时间超过了设定的超时时间，则中断加载
    const timeoutId = setTimeout(() => {
      try {
        if (!img.complete) {
          console.log('Favicon load timeout:', item.favIconUrl);
          img.src = ''; // 中断加载
          faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
          updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
        }
      } catch (error) {
        console.log('Error in favicon timeout handler:', error);
        faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
        updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
      }
    }, FAVICON_LOAD_TIMEOUT);
    
    // 尝试加载图标
    try {
      // 对某些图标URL可能需要特殊处理，比如数据URI
      if (item.favIconUrl.startsWith('data:')) {
        // 验证数据URI格式是否正确
        if (!/^data:image\/(png|jpg|jpeg|gif|svg\+xml|webp|ico);base64,/.test(item.favIconUrl)) {
          faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
          updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
          clearTimeout(timeoutId);
          return;
        }
      }
      
      // 设置来源URL，开始加载
      img.src = item.favIconUrl;
      
      // 加载完成后清除超时定时器
      img.onload = function() {
        clearTimeout(timeoutId);
        try {
          if (img.width > 0 && img.height > 0) {
            faviconCache.set(item.favIconUrl, item.favIconUrl);
            updateFaviconInDOM(item.favIconUrl, item.favIconUrl);
          } else {
            faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
            updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
          }
        } catch (error) {
          console.log('Error processing loaded favicon:', error);
          faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
          updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
        }
      };
      
      img.onerror = function() {
        clearTimeout(timeoutId);
        console.log('Failed to load favicon:', item.favIconUrl);
        faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
        updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
      };
      
    } catch (error) {
      console.log('Error setting favicon src:', error);
      faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
      updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
      clearTimeout(timeoutId);
    }
  });
}

// 更新DOM中的图标
function updateFaviconInDOM(originalUrl, newUrl) {
  try {
    const faviconElements = document.querySelectorAll(`img.favicon[data-original-src="${originalUrl}"]`);
    faviconElements.forEach(element => {
      element.src = newUrl;
    });
  } catch (error) {
    console.log('Error updating favicon in DOM:', error);
  }
}

function displayHistory(history) {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  if (history.length === 0) {
    const noHistoryDiv = document.createElement('div');
    noHistoryDiv.className = 'no-history';
    noHistoryDiv.textContent = i18n.t('no_closed_pages');
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
    
    // Primero mostrar el icono predeterminado o del caché inmediatamente
    if (isValidUrl(item.favIconUrl) && faviconCache.has(item.favIconUrl)) {
      favicon.src = faviconCache.get(item.favIconUrl);
    } else {
      favicon.src = DEFAULT_FAVICON;
      // Guardar la URL original para actualizar más tarde
      if (isValidUrl(item.favIconUrl)) {
        favicon.setAttribute('data-original-src', item.favIconUrl);
      }
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
    deleteBtn.textContent = i18n.t('delete');
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

// 优化URL有效性检查功能
function isValidUrl(url) {
  if (!url) return false;
  
  // 数据URI单独处理
  if (url.startsWith('data:')) {
    return url.startsWith('data:image/');
  }
  
  try {
    const parsedUrl = new URL(url);
    // 扩展允许的协议列表
    return ['http:', 'https:', 'chrome:', 'chrome-extension:'].includes(parsedUrl.protocol);
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
    return `${seconds} ${i18n.t('s_ago')}`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${i18n.t('min_ago')}`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${i18n.t('h_ago')}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${i18n.t('d_ago')}`;
}