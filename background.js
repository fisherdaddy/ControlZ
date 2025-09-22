// background.js

// 初始化MAX_HISTORY_ITEMS为可配置的值
let MAX_HISTORY_ITEMS = 100;

// 默认图标URL
const DEFAULT_FAVICON = chrome.runtime.getURL('icons/default_favicon.svg');

// 从存储中加载设置
chrome.storage.local.get(['settings'], function(result) {
  if (result.settings && result.settings.historyItemsCount) {
    MAX_HISTORY_ITEMS = result.settings.historyItemsCount;
  }
});

// 监听设置更改消息
chrome.runtime.onMessage.addListener(function(message) {
  if (message.action === 'updateHistoryItemsCount' && message.count) {
    MAX_HISTORY_ITEMS = message.count;
  }
});

// 判断是否为空白页面的函数
function isBlankPage(url) {
  return url === 'about:blank' || url === 'chrome://newtab/';
}

// 处理并验证favicon URL
function processFavIconUrl(favIconUrl, tabUrl) {
  // 如果没有favicon URL，则尝试使用网站根域名的favicon
  if (!favIconUrl && tabUrl) {
    try {
      const parsedUrl = new URL(tabUrl);
      // 使用网站的默认favicon路径
      return `${parsedUrl.protocol}//${parsedUrl.hostname}/favicon.ico`;
    } catch (e) {
      console.log('Error parsing URL for default favicon:', e);
      return DEFAULT_FAVICON;
    }
  }
  
  // 如果有favicon URL但看起来不合法，使用默认图标
  if (favIconUrl) {
    // 验证URL格式
    try {
      new URL(favIconUrl);
      return favIconUrl;
    } catch (e) {
      console.log('Invalid favicon URL:', favIconUrl);
      return DEFAULT_FAVICON;
    }
  }
  
  return DEFAULT_FAVICON;
}

// 监听标签页更新，实时维护标签页信息（仅用于后续关闭记录）
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const hasMeaningfulUpdate = changeInfo.status === 'complete' ||
    typeof changeInfo.url === 'string' ||
    typeof changeInfo.title === 'string' ||
    typeof changeInfo.favIconUrl === 'string';

  if (!hasMeaningfulUpdate) {
    return;
  }

  const tabUrl = changeInfo.url || tab.url;
  if (!tabUrl || isBlankPage(tabUrl)) {
    return;
  }

  const tabTitle = changeInfo.title || tab.title || tabUrl;
  const favIconCandidate = changeInfo.favIconUrl || tab.favIconUrl;
  let favIconUrl = processFavIconUrl(favIconCandidate, tabUrl);

  if (tabUrl.startsWith('chrome-extension://')) {
    try {
      const extensionId = new URL(tabUrl).hostname;
      chrome.management.get(extensionId, function (extensionInfo) {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          favIconUrl = DEFAULT_FAVICON;
        } else if (extensionInfo && extensionInfo.icons && extensionInfo.icons.length > 0) {
          favIconUrl = extensionInfo.icons[extensionInfo.icons.length - 1].url;
        } else {
          favIconUrl = DEFAULT_FAVICON;
        }

        updateTabInfo(tabId, tabUrl, tabTitle, favIconUrl);
      });
    } catch (error) {
      console.log('Error resolving extension icon:', error);
      updateTabInfo(tabId, tabUrl, tabTitle, DEFAULT_FAVICON);
    }
  } else {
    updateTabInfo(tabId, tabUrl, tabTitle, favIconUrl);
  }
});

/**
 * 更新标签页信息并存储到 chrome.storage.local
 * @param {number} tabId
 * @param {string} url
 * @param {string} title
 * @param {string} favIconUrl
 */
function updateTabInfo(tabId, url, title, favIconUrl) {
  const tabData = {
    url: url,
    title: title || url,
    favIconUrl: favIconUrl || DEFAULT_FAVICON
  };

  chrome.storage.local.get(['tabInfo'], function (result) {
    let tabInfo = result.tabInfo || {};
    tabInfo[tabId] = tabData;
    chrome.storage.local.set({ 'tabInfo': tabInfo });
  });
}

// 监听标签页关闭事件，将关闭的标签页写入历史记录
chrome.tabs.onRemoved.addListener(function (tabId) {
  chrome.storage.local.get(['tabInfo'], function (result) {
    let tabInfo = result.tabInfo || {};
    const closedTab = tabInfo[tabId];

    if (closedTab && closedTab.url && !isBlankPage(closedTab.url)) {
      saveHistoryItem({
        url: closedTab.url,
        title: closedTab.title || closedTab.url,
        time: Date.now(),
        favIconUrl: closedTab.favIconUrl || DEFAULT_FAVICON
      });
    }

    if (tabInfo[tabId]) {
      delete tabInfo[tabId];
      chrome.storage.local.set({ 'tabInfo': tabInfo });
    }
  });
});

// 处理标签页被替换的情况，保持缓存中的信息最新
chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
  chrome.storage.local.get(['tabInfo'], function (result) {
    let tabInfo = result.tabInfo || {};
    if (tabInfo[removedTabId]) {
      tabInfo[addedTabId] = tabInfo[removedTabId];
      delete tabInfo[removedTabId];
      chrome.storage.local.set({ 'tabInfo': tabInfo });
    }
  });
});

// 启动或安装时刷新缓存中的标签页信息，避免旧数据干扰
function refreshTabInfoCache() {
  chrome.tabs.query({}, function(tabs) {
    if (chrome.runtime.lastError) {
      console.log('Failed to refresh tab cache:', chrome.runtime.lastError);
      return;
    }

    const tabInfo = {};

    tabs.forEach(tab => {
      if (!tab || !tab.id || !tab.url || isBlankPage(tab.url)) {
        return;
      }

      const favIconUrl = processFavIconUrl(tab.favIconUrl, tab.url);
      tabInfo[tab.id] = {
        url: tab.url,
        title: tab.title || tab.url,
        favIconUrl: favIconUrl || DEFAULT_FAVICON
      };
    });

    chrome.storage.local.set({ 'tabInfo': tabInfo });
  });
}

chrome.runtime.onInstalled.addListener(refreshTabInfoCache);
chrome.runtime.onStartup.addListener(refreshTabInfoCache);

/**
 * 保存历史记录项到 chrome.storage.local
 * @param {Object} historyItem
 */
function saveHistoryItem(historyItem) {
  chrome.storage.local.get(['history'], function (result) {
    let history = result.history || [];
    const normalizedItem = {
      url: historyItem.url,
      title: historyItem.title || historyItem.url,
      time: historyItem.time || Date.now(),
      favIconUrl: historyItem.favIconUrl || DEFAULT_FAVICON
    };

    // 不再按URL去重，每次都添加新记录
    history.unshift(normalizedItem);
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    chrome.storage.local.set({ 'history': history });
  });
}
