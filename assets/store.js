/* ============================================================
   ГРАД СТРОЙ 5 — слой хранения контента (Store)

   СЕЙЧАС: данные берутся из assets/content.js (значения по умолчанию),
   а правки админ-панели сохраняются в localStorage этого браузера.

   ПОТОМ (когда будет сервер + база данных):
   достаточно поменять ТОЛЬКО две функции — load() и save().
   Места отмечены комментариями  // === ДЛЯ СЕРВЕРА ===
   Остальной код сайта и админки трогать не нужно.
   ============================================================ */
(function(){
  "use strict";

  var LS_KEY = "gs_content_v1";

  // Глубокое слияние сохранённых правок поверх значений по умолчанию,
  // чтобы при добавлении новых полей в content.js ничего не ломалось.
  function deepMerge(base, over){
    if (Array.isArray(over)) return over.slice();           // массивы заменяем целиком
    if (over && typeof over === "object"){
      var out = {};
      var keys = Object.keys(base || {}).concat(Object.keys(over));
      keys.forEach(function(k){
        if (out.hasOwnProperty(k)) return;
        var b = base ? base[k] : undefined;
        var o = over[k];
        out[k] = (o !== undefined) ? (typeof o === "object" && o && !Array.isArray(o) ? deepMerge(b, o) : (Array.isArray(o) ? o.slice() : o)) : b;
      });
      return out;
    }
    return (over !== undefined) ? over : base;
  }

  function defaults(){
    // глубокая копия дефолтов, чтобы их случайно не мутировать
    return JSON.parse(JSON.stringify(window.GS_CONTENT_DEFAULT || {}));
  }

  /* =========================================================
     load() — вернуть актуальный контент.
     ========================================================= */
  function load(){
    var base = defaults();
    // === ДЛЯ СЕРВЕРА ===
    // Заменить тело на:
    //   const res = await fetch('/api/content');
    //   return await res.json();
    // (и сделать load() асинхронной — см. примечание внизу файла)
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return base;
      var saved = JSON.parse(raw);
      return deepMerge(base, saved);
    } catch(e){
      return base;
    }
  }

  /* =========================================================
     save(content) — сохранить контент.
     ========================================================= */
  function save(content){
    // === ДЛЯ СЕРВЕРА ===
    // Заменить тело на:
    //   await fetch('/api/content', {
    //     method: 'PUT',
    //     headers: {'Content-Type':'application/json'},
    //     body: JSON.stringify(content)
    //   });
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(content));
      return true;
    } catch(e){
      return false;
    }
  }

  /* reset() — вернуть значения по умолчанию (удалить локальные правки) */
  function reset(){
    try { window.localStorage.removeItem(LS_KEY); } catch(e){}
    return defaults();
  }

  /* exportJSON() — выгрузить content.json для переноса на хостинг/в базу */
  function exportJSON(content){
    var blob = new Blob([JSON.stringify(content, null, 2)], {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "content.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }

  /* =========================================================
     applyContacts(c) — подставить контакты по всему сайту.
     Работает на любой странице: обновляет ссылки tel/mailto/wa/tg
     и тексты, помеченные data-gs="...".
     ========================================================= */
  function applyContacts(c){
    if (!c) return;
    // ссылки
    [].forEach.call(document.querySelectorAll('a[href^="tel:"]'), function(a){
      a.setAttribute('href', 'tel:' + c.phoneTel);
    });
    [].forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function(a){
      a.setAttribute('href', 'mailto:' + c.email);
    });
    [].forEach.call(document.querySelectorAll('a[href*="wa.me/"]'), function(a){
      a.setAttribute('href', a.getAttribute('href').replace(/wa\.me\/\d+/, 'wa.me/' + c.whatsapp));
    });
    [].forEach.call(document.querySelectorAll('a[href*="t.me/"]'), function(a){
      a.setAttribute('href', c.telegram);
    });
    // тексты по data-gs
    function setAll(sel, val){ [].forEach.call(document.querySelectorAll(sel), function(el){ el.textContent = val; }); }
    setAll('[data-gs="phoneText"]', c.phoneDisplay);
    setAll('[data-gs="email"]',     c.email);
    setAll('[data-gs="hours"]',     c.hours);
    setAll('[data-gs="area"]',      c.area);
    setAll('[data-gs="topline"]',   c.topline);
  }

  window.GSStore = {
    load: load,
    save: save,
    reset: reset,
    exportJSON: exportJSON,
    defaults: defaults,
    applyContacts: applyContacts
  };

  /* Примечание для серверной версии:
     если load() станет асинхронной (fetch), то на страницах нужно
     обернуть инициализацию в async/await или .then(). Сейчас всё
     синхронно, поэтому никаких задержек рендера нет. */
})();
