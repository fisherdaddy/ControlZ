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

// 监听标签页更新，保存标签页的 URL、标题和 favicon
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.status === 'complete' && tab.url) {
    if (isBlankPage(tab.url)) {
      // 如果是空白页面，直接返回，不记录
      return;
    }

    let favIconUrl = processFavIconUrl(tab.favIconUrl, tab.url);

    // 检查是否为 Chrome 扩展页面
    if (tab.url.startsWith('chrome-extension://')) {
      // 获取扩展 ID
      const extensionId = new URL(tab.url).hostname;

      // 尝试获取扩展的图标
      chrome.management.get(extensionId, function (extensionInfo) {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          // 如果获取扩展信息失败，使用默认的扩展图标
          favIconUrl = DEFAULT_FAVICON;
        } else if (extensionInfo && extensionInfo.icons && extensionInfo.icons.length > 0) {
          // 使用最大尺寸的图标
          favIconUrl = extensionInfo.icons[extensionInfo.icons.length - 1].url;
        } else {
          // 如果没有找到图标，使用默认的扩展图标
          favIconUrl = DEFAULT_FAVICON;
        }

        updateTabInfo(tabId, tab.url, tab.title, favIconUrl);
        // 立即保存到历史记录
        saveHistoryItem({
          url: tab.url,
          title: tab.title,
          time: Date.now(),
          favIconUrl: favIconUrl
        });
      });
    } else {
      updateTabInfo(tabId, tab.url, tab.title, favIconUrl);
      // 立即保存到历史记录
      saveHistoryItem({
        url: tab.url,
        title: tab.title,
        time: Date.now(),
        favIconUrl: favIconUrl
      });
    }
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
    title: title,
    favIconUrl: favIconUrl
  };

  chrome.storage.local.get(['tabInfo'], function (result) {
    let tabInfo = result.tabInfo || {};
    tabInfo[tabId] = tabData;
    chrome.storage.local.set({ 'tabInfo': tabInfo });
  });
}

// 监听标签页关闭事件，保存被关闭的标签页信息
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.storage.local.get(['tabInfo'], function (result) {
    let tabInfo = result.tabInfo || {};
    // 只需删除已关闭标签的信息，不更新历史记录
    if (tabInfo[tabId]) {
      delete tabInfo[tabId];
      chrome.storage.local.set({ 'tabInfo': tabInfo });
    }
  });
});

/**
 * 保存历史记录项到 chrome.storage.local
 * @param {Object} historyItem
 */
function saveHistoryItem(historyItem) {
  chrome.storage.local.get(['history'], function (result) {
    let history = result.history || [];
    // 不再按URL去重，每次都添加新记录
    history.unshift(historyItem);
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    chrome.storage.local.set({ 'history': history });
  });
}
