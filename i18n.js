// i18n.js - 多语言支持

// 默认语言
let currentLang = 'en';

// 语言包
const translations = {
  'zh': {
    'recently_closed_pages': '最近关闭的页面',
    'clear_all': '清空所有',
    'delete': '删除',
    'no_closed_pages': '没有关闭的页面',
    'search_placeholder': '搜索...',
    'settings': '设置',
    'custom_popup_size': '自定义弹窗大小',
    'width': '宽度',
    'height': '高度',
    'history_items': '历史记录条目数',
    'language': '语言',
    'save': '保存',
    'reset': '重置',
    'settings_saved': '设置已保存',
    's_ago': '秒前',
    'min_ago': '分钟前',
    'h_ago': '小时前',
    'd_ago': '天前'
  },
  'en': {
    'recently_closed_pages': 'Recently Closed Pages',
    'clear_all': 'Clear All',
    'delete': 'Delete',
    'no_closed_pages': 'No closed pages',
    'search_placeholder': 'Search...',
    'settings': 'Settings',
    'custom_popup_size': 'Custom Popup Size',
    'width': 'Width',
    'height': 'Height',
    'history_items': 'History Items Count',
    'language': 'Language',
    'save': 'Save',
    'reset': 'Reset',
    'settings_saved': 'Settings saved',
    's_ago': 's ago',
    'min_ago': 'min ago',
    'h_ago': 'h ago',
    'd_ago': 'd ago'
  },
  'ja': {
    'recently_closed_pages': '最近閉じたページ',
    'clear_all': 'すべてクリア',
    'delete': '削除',
    'no_closed_pages': '閉じたページはありません',
    'search_placeholder': '検索...',
    'settings': '設定',
    'custom_popup_size': 'カスタムポップアップサイズ',
    'width': '幅',
    'height': '高さ',
    'history_items': '履歴アイテム数',
    'language': '言語',
    'save': '保存',
    'reset': 'リセット',
    'settings_saved': '設定が保存されました',
    's_ago': '秒前',
    'min_ago': '分前',
    'h_ago': '時間前',
    'd_ago': '日前'
  },
  'ko': {
    'recently_closed_pages': '최근에 닫은 페이지',
    'clear_all': '모두 지우기',
    'delete': '삭제',
    'no_closed_pages': '닫힌 페이지 없음',
    'search_placeholder': '검색...',
    'settings': '설정',
    'custom_popup_size': '사용자 지정 팝업 크기',
    'width': '너비',
    'height': '높이',
    'history_items': '기록 항목 수',
    'language': '언어',
    'save': '저장',
    'reset': '초기화',
    'settings_saved': '설정이 저장되었습니다',
    's_ago': '초 전',
    'min_ago': '분 전',
    'h_ago': '시간 전',
    'd_ago': '일 전'
  },
  'de': {
    'recently_closed_pages': 'Kürzlich geschlossene Seiten',
    'clear_all': 'Alle löschen',
    'delete': 'Löschen',
    'no_closed_pages': 'Keine geschlossenen Seiten',
    'search_placeholder': 'Suchen...',
    'settings': 'Einstellungen',
    'custom_popup_size': 'Benutzerdefinierte Popup-Größe',
    'width': 'Breite',
    'height': 'Höhe',
    'history_items': 'Anzahl der Verlaufseinträge',
    'language': 'Sprache',
    'save': 'Speichern',
    'reset': 'Zurücksetzen',
    'settings_saved': 'Einstellungen gespeichert',
    's_ago': 's her',
    'min_ago': 'min her',
    'h_ago': 'Std. her',
    'd_ago': 'Tage her'
  },
  'fr': {
    'recently_closed_pages': 'Pages récemment fermées',
    'clear_all': 'Tout effacer',
    'delete': 'Supprimer',
    'no_closed_pages': 'Aucune page fermée',
    'search_placeholder': 'Rechercher...',
    'settings': 'Paramètres',
    'custom_popup_size': 'Taille personnalisée du popup',
    'width': 'Largeur',
    'height': 'Hauteur',
    'history_items': 'Nombre d\'éléments d\'historique',
    'language': 'Langue',
    'save': 'Enregistrer',
    'reset': 'Réinitialiser',
    'settings_saved': 'Paramètres enregistrés',
    's_ago': 's il y a',
    'min_ago': 'min il y a',
    'h_ago': 'h il y a',
    'd_ago': 'j il y a'
  },
  'ru': {
    'recently_closed_pages': 'Недавно закрытые страницы',
    'clear_all': 'Очистить все',
    'delete': 'Удалить',
    'no_closed_pages': 'Нет закрытых страниц',
    'search_placeholder': 'Поиск...',
    'settings': 'Настройки',
    'custom_popup_size': 'Настройка размера всплывающего окна',
    'width': 'Ширина',
    'height': 'Высота',
    'history_items': 'Количество элементов истории',
    'language': 'Язык',
    'save': 'Сохранить',
    'reset': 'Сбросить',
    'settings_saved': 'Настройки сохранены',
    's_ago': 'сек. назад',
    'min_ago': 'мин. назад',
    'h_ago': 'ч. назад',
    'd_ago': 'д. назад'
  },
  'es': {
    'recently_closed_pages': 'Páginas cerradas recientemente',
    'clear_all': 'Borrar todo',
    'delete': 'Eliminar',
    'no_closed_pages': 'No hay páginas cerradas',
    'search_placeholder': 'Buscar...',
    'settings': 'Configuración',
    'custom_popup_size': 'Tamaño personalizado del popup',
    'width': 'Ancho',
    'height': 'Alto',
    'history_items': 'Número de elementos de historial',
    'language': 'Idioma',
    'save': 'Guardar',
    'reset': 'Restablecer',
    'settings_saved': 'Configuración guardada',
    's_ago': 's atrás',
    'min_ago': 'min atrás',
    'h_ago': 'h atrás',
    'd_ago': 'd atrás'
  },
  'it': {
    'recently_closed_pages': 'Pagine chiuse di recente',
    'clear_all': 'Cancella tutto',
    'delete': 'Elimina',
    'no_closed_pages': 'Nessuna pagina chiusa',
    'search_placeholder': 'Cerca...',
    'settings': 'Impostazioni',
    'custom_popup_size': 'Dimensione personalizzata popup',
    'width': 'Larghezza',
    'height': 'Altezza',
    'history_items': 'Numero elementi cronologia',
    'language': 'Lingua',
    'save': 'Salva',
    'reset': 'Reimposta',
    'settings_saved': 'Impostazioni salvate',
    's_ago': 's fa',
    'min_ago': 'min fa',
    'h_ago': 'h fa',
    'd_ago': 'g fa'
  },
  'pt': {
    'recently_closed_pages': 'Páginas fechadas recentemente',
    'clear_all': 'Limpar tudo',
    'delete': 'Excluir',
    'no_closed_pages': 'Nenhuma página fechada',
    'search_placeholder': 'Pesquisar...',
    'settings': 'Configurações',
    'custom_popup_size': 'Tamanho personalizado do popup',
    'width': 'Largura',
    'height': 'Altura',
    'history_items': 'Número de itens do histórico',
    'language': 'Idioma',
    'save': 'Salvar',
    'reset': 'Redefinir',
    'settings_saved': 'Configurações salvas',
    's_ago': 's atrás',
    'min_ago': 'min atrás',
    'h_ago': 'h atrás',
    'd_ago': 'd atrás'
  },
  'ar': {
    'recently_closed_pages': 'الصفحات المغلقة مؤخرًا',
    'clear_all': 'مسح الكل',
    'delete': 'حذف',
    'no_closed_pages': 'لا توجد صفحات مغلقة',
    'search_placeholder': 'بحث...',
    'settings': 'الإعدادات',
    'custom_popup_size': 'حجم النافذة المنبثقة المخصص',
    'width': 'العرض',
    'height': 'الارتفاع',
    'history_items': 'عدد عناصر السجل',
    'language': 'اللغة',
    'save': 'حفظ',
    'reset': 'إعادة ضبط',
    'settings_saved': 'تم حفظ الإعدادات',
    's_ago': 'ثانية مضت',
    'min_ago': 'دقيقة مضت',
    'h_ago': 'ساعة مضت',
    'd_ago': 'يوم مضى'
  },
  'id': {
    'recently_closed_pages': 'Halaman yang Baru Ditutup',
    'clear_all': 'Hapus Semua',
    'delete': 'Hapus',
    'no_closed_pages': 'Tidak ada halaman yang ditutup',
    'search_placeholder': 'Cari...',
    'settings': 'Pengaturan',
    'custom_popup_size': 'Ukuran Popup Kustom',
    'width': 'Lebar',
    'height': 'Tinggi',
    'history_items': 'Jumlah Item Riwayat',
    'language': 'Bahasa',
    'save': 'Simpan',
    'reset': 'Atur Ulang',
    'settings_saved': 'Pengaturan disimpan',
    's_ago': 'detik yang lalu',
    'min_ago': 'menit yang lalu',
    'h_ago': 'jam yang lalu',
    'd_ago': 'hari yang lalu'
  },
  'vi': {
    'recently_closed_pages': 'Các trang đã đóng gần đây',
    'clear_all': 'Xóa tất cả',
    'delete': 'Xóa',
    'no_closed_pages': 'Không có trang đã đóng',
    'search_placeholder': 'Tìm kiếm...',
    'settings': 'Cài đặt',
    'custom_popup_size': 'Kích thước cửa sổ tùy chỉnh',
    'width': 'Chiều rộng',
    'height': 'Chiều cao',
    'history_items': 'Số lượng mục lịch sử',
    'language': 'Ngôn ngữ',
    'save': 'Lưu',
    'reset': 'Đặt lại',
    'settings_saved': 'Đã lưu cài đặt',
    's_ago': 'giây trước',
    'min_ago': 'phút trước',
    'h_ago': 'giờ trước',
    'd_ago': 'ngày trước'
  },
  'th': {
    'recently_closed_pages': 'หน้าที่ปิดล่าสุด',
    'clear_all': 'ล้างทั้งหมด',
    'delete': 'ลบ',
    'no_closed_pages': 'ไม่มีหน้าที่ปิด',
    'search_placeholder': 'ค้นหา...',
    'settings': 'การตั้งค่า',
    'custom_popup_size': 'ขนาดป๊อปอัพที่กำหนดเอง',
    'width': 'ความกว้าง',
    'height': 'ความสูง',
    'history_items': 'จำนวนรายการประวัติ',
    'language': 'ภาษา',
    'save': 'บันทึก',
    'reset': 'รีเซ็ต',
    'settings_saved': 'บันทึกการตั้งค่าแล้ว',
    's_ago': 'วินาทีที่แล้ว',
    'min_ago': 'นาทีที่แล้ว',
    'h_ago': 'ชั่วโมงที่แล้ว',
    'd_ago': 'วันที่แล้ว'
  },
  'nl': {
    'recently_closed_pages': 'Recent gesloten pagina\'s',
    'clear_all': 'Alles wissen',
    'delete': 'Verwijderen',
    'no_closed_pages': 'Geen gesloten pagina\'s',
    'search_placeholder': 'Zoeken...',
    'settings': 'Instellingen',
    'custom_popup_size': 'Aangepaste popup grootte',
    'width': 'Breedte',
    'height': 'Hoogte',
    'history_items': 'Aantal geschiedenisitems',
    'language': 'Taal',
    'save': 'Opslaan',
    'reset': 'Resetten',
    'settings_saved': 'Instellingen opgeslagen',
    's_ago': 's geleden',
    'min_ago': 'min geleden',
    'h_ago': 'u geleden',
    'd_ago': 'd geleden'
  }
};

// 获取翻译文本
function t(key) {
  const lang = translations[currentLang] || translations['en'];
  return lang[key] || key;
}

// 初始化翻译
function initI18n() {
  // 从存储中获取语言设置
  chrome.storage.local.get(['settings'], function(result) {
    const settings = result.settings || {};
    currentLang = settings.language || 'en';
    
    // 更新页面上的所有带有 data-i18n 属性的元素
    translatePage();
  });
}

// 翻译页面上所有带有 data-i18n 属性的元素
function translatePage() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    
    if (el.tagName.toLowerCase() === 'input' && el.getAttribute('placeholder')) {
      el.setAttribute('placeholder', t(key));
    } else {
      el.textContent = t(key);
    }
  });
}

// 修改当前语言
function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    translatePage();
  }
}

// 导出函数
window.i18n = {
  t,
  initI18n,
  translatePage,
  setLanguage,
  getCurrentLang: () => currentLang
}; 