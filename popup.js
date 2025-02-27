// popup.js

// Caché de favicons para acelerar la carga
const faviconCache = new Map();
// URL del favicon predeterminado
const DEFAULT_FAVICON = chrome.runtime.getURL('icons/default_favicon.svg');

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
    
    // Mostrar la lista inmediatamente
    const historyItems = history.slice(0, 100);
    displayHistory(historyItems);
    
    // Cargar favicons en segundo plano, sin bloquear la UI
    setTimeout(() => {
      loadFavicons(historyItems);
    }, 10);
  });
}

// Función para cargar los favicons en segundo plano
function loadFavicons(historyItems) {
  historyItems.forEach(item => {
    if (!isValidUrl(item.favIconUrl) || faviconCache.has(item.favIconUrl)) {
      // Si ya está en caché o no es válido, no es necesario cargar
      return;
    }
    
    const img = new Image();
    img.onload = function() {
      try {
        faviconCache.set(item.favIconUrl, item.favIconUrl);
        // Actualizar todos los elementos del DOM que usan este favicon
        updateFaviconInDOM(item.favIconUrl, item.favIconUrl);
      } catch (error) {
        console.log('Error procesando favicon cargado:', error);
        faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
        updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
      }
    };
    
    img.onerror = function() {
      faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
      // Actualizar todos los elementos del DOM que usan este favicon
      updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
    };
    
    try {
      img.src = item.favIconUrl;
      
      // Timeout más corto para no bloquear
      setTimeout(() => {
        try {
          if (img.complete) return;
          img.src = '';
        } catch (error) {
          console.log('Error en timeout de favicon:', error);
          // Si hay un error al manipular la imagen, usar el favicon predeterminado
          faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
          updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
        }
      }, 500);
    } catch (error) {
      console.log('Error al establecer favicon:', error);
      faviconCache.set(item.favIconUrl, DEFAULT_FAVICON);
      updateFaviconInDOM(item.favIconUrl, DEFAULT_FAVICON);
    }
  });
}

// Actualiza todas las instancias de un favicon en el DOM
function updateFaviconInDOM(originalUrl, newUrl) {
  try {
    const faviconElements = document.querySelectorAll(`img.favicon[data-original-src="${originalUrl}"]`);
    faviconElements.forEach(element => {
      element.src = newUrl;
    });
  } catch (error) {
    console.log('Error al actualizar favicon en DOM:', error);
  }
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