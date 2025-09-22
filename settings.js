// settings.js

// 默认设置
const DEFAULT_SETTINGS = {
  popupWidth: 400,
  popupHeight: 400,
  historyItemsCount: 100,
  language: 'en'
};

// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化国际化
  i18n.initI18n();
  
  // 加载设置
  loadSettings();
  
  // 添加事件监听器
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  document.getElementById('language-select').addEventListener('change', function() {
    const selectedLang = this.value;
    i18n.setLanguage(selectedLang);
  });
  
  // 为输入框添加焦点效果
  const inputElements = document.querySelectorAll('input, select');
  inputElements.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });
});

// 加载设置
function loadSettings() {
  chrome.storage.local.get(['settings'], function(result) {
    const settings = result.settings || DEFAULT_SETTINGS;
    
    // 填充表单
    document.getElementById('popup-width').value = settings.popupWidth || DEFAULT_SETTINGS.popupWidth;
    document.getElementById('popup-height').value = settings.popupHeight || DEFAULT_SETTINGS.popupHeight;
    document.getElementById('history-items-count').value = settings.historyItemsCount || DEFAULT_SETTINGS.historyItemsCount;
    
    // 设置语言选择器
    const languageSelect = document.getElementById('language-select');
    languageSelect.value = settings.language || DEFAULT_SETTINGS.language;
    
    // 更新UI语言
    i18n.setLanguage(settings.language || DEFAULT_SETTINGS.language);
  });
}

// 显示消息
function showMessage(messageText) {
  const message = document.getElementById('settings-message');
  message.textContent = messageText;
  message.classList.add('visible');
  
  // 3秒后清除消息
  setTimeout(function() {
    message.classList.remove('visible');
    setTimeout(() => {
      message.textContent = '';
    }, 300); // 等待淡出动画完成
  }, 3000);
}

// 保存设置
function saveSettings() {
  const settings = {
    popupWidth: parseInt(document.getElementById('popup-width').value) || DEFAULT_SETTINGS.popupWidth,
    popupHeight: parseInt(document.getElementById('popup-height').value) || DEFAULT_SETTINGS.popupHeight,
    historyItemsCount: parseInt(document.getElementById('history-items-count').value) || DEFAULT_SETTINGS.historyItemsCount,
    language: document.getElementById('language-select').value
  };
  
  // 验证输入范围
  settings.popupWidth = Math.min(Math.max(settings.popupWidth, 250), 800);
  settings.popupHeight = Math.min(Math.max(settings.popupHeight, 200), 540);
  settings.historyItemsCount = Math.min(Math.max(settings.historyItemsCount, 10), 500);
  
  // 更新输入框的值，以防范围被调整
  document.getElementById('popup-width').value = settings.popupWidth;
  document.getElementById('popup-height').value = settings.popupHeight;
  document.getElementById('history-items-count').value = settings.historyItemsCount;
  
  // 添加保存动画效果
  const saveButton = document.getElementById('save-settings');
  saveButton.classList.add('saving');
  
  // 保存到存储
  chrome.storage.local.set({settings: settings}, function() {
    // 显示保存成功信息
    showMessage(i18n.t('settings_saved'));
    
    // 移除保存动画效果
    setTimeout(() => {
      saveButton.classList.remove('saving');
    }, 500);
    
    // 更新MAX_HISTORY_ITEMS (向后台脚本发送消息)
    chrome.runtime.sendMessage({
      action: 'updateHistoryItemsCount',
      count: settings.historyItemsCount
    });
  });
}

// 重置设置
function resetSettings() {
  // 填充默认值
  document.getElementById('popup-width').value = DEFAULT_SETTINGS.popupWidth;
  document.getElementById('popup-height').value = DEFAULT_SETTINGS.popupHeight;
  document.getElementById('history-items-count').value = DEFAULT_SETTINGS.historyItemsCount;
  document.getElementById('language-select').value = DEFAULT_SETTINGS.language;
  
  // 添加重置动画效果
  const resetButton = document.getElementById('reset-settings');
  resetButton.classList.add('resetting');
  
  // 保存默认设置
  chrome.storage.local.set({settings: DEFAULT_SETTINGS}, function() {
    // 显示保存成功信息
    showMessage(i18n.t('settings_saved'));
    
    // 移除重置动画效果
    setTimeout(() => {
      resetButton.classList.remove('resetting');
    }, 500);
    
    // 更新UI语言
    i18n.setLanguage(DEFAULT_SETTINGS.language);
    
    // 更新MAX_HISTORY_ITEMS (向后台脚本发送消息)
    chrome.runtime.sendMessage({
      action: 'updateHistoryItemsCount',
      count: DEFAULT_SETTINGS.historyItemsCount
    });
  });
} 