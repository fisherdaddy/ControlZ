// background.js

const MAX_HISTORY_ITEMS = 100;
const tabInfo = {};

// 判断是否为空白页面的函数
function isBlankPage(url) {
  return url === 'about:blank' || url === 'chrome://newtab/';
}

// 监听标签页更新，保存标签页的 URL、标题和 favicon
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.status === 'complete' && tab.url) {
    if (isBlankPage(tab.url)) {
      // 如果是空白页面，直接返回，不记录
      return;
    }

    let favIconUrl = tab.favIconUrl;

    // 检查是否为 Chrome 扩展页面
    if (tab.url.startsWith('chrome-extension://')) {
      // 获取扩展 ID
      const extensionId = new URL(tab.url).hostname;

      // 尝试获取扩展的图标
      chrome.management.get(extensionId, function (extensionInfo) {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
          // 如果获取扩展信息失败，使用默认的扩展图标
          favIconUrl = chrome.runtime.getURL('icons/extension_favicon.png');
        } else if (extensionInfo && extensionInfo.icons && extensionInfo.icons.length > 0) {
          // 使用最大尺寸的图标
          favIconUrl = extensionInfo.icons[extensionInfo.icons.length - 1].url;
        } else {
          // 如果没有找到图标，使用默认的扩展图标
          favIconUrl = chrome.runtime.getURL('icons/extension_favicon.png');
        }

        updateTabInfo(tabId, tab.url, tab.title, favIconUrl);
      });
    } else {
      updateTabInfo(tabId, tab.url, tab.title, favIconUrl);
    }
  }
});

function updateTabInfo(tabId, url, title, favIconUrl) {
  tabInfo[tabId] = {
    url: url,
    title: title,
    favIconUrl: favIconUrl
  };
}

// 监听标签页关闭事件，保存被关闭的标签页信息
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  const info = tabInfo[tabId];
  if (info) {
    const historyItem = {
      url: info.url,
      title: info.title,
      time: Date.now(),
      favIconUrl: info.favIconUrl
    };
    saveHistoryItem(historyItem);
    delete tabInfo[tabId];
  }
});

function saveHistoryItem(historyItem) {
  chrome.storage.local.get(['history'], function (result) {
    let history = result.history || [];
    // 去重
    history = history.filter(item => item.url !== historyItem.url);
    history.unshift(historyItem);
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    chrome.storage.local.set({ 'history': history });
  });
}
