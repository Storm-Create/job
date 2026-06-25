/* ============================================================
   ГРАД СТРОЙ 5 — логика админ-панели
   Читает контент через GSStore.load(), сохраняет через GSStore.save().
   При переезде на сервер код админки менять НЕ нужно — меняются
   только load()/save() в assets/store.js.
   ============================================================ */
(function(){
  "use strict";

  /* --- гейт доступа: вход выдаётся формой на сайте (sessionStorage) --- */
  var allowed = false;
  try { allowed = sessionStorage.getItem('gs_admin') === '1'; } catch(_){}
  var locked = document.getElementById('adminLocked');
  var app = document.getElementById('adminApp');
  if (!allowed){
    if (locked) locked.style.display = 'block';
    if (app) app.style.display = 'none';
    return;
  }
  if (locked) locked.style.display = 'none';
  if (app) app.style.display = 'block';

  /* --- рабочая копия контента --- */
  var data = GSStore.load();
  var $ = function(id){ return document.getElementById(id); };

  function toast(msg){
    var t = $('adminSaved'); t.textContent = msg || 'Сохранено';
    t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); }, 1800);
  }

  /* ============ ВКЛАДКИ ============ */
  var tabs = [].slice.call(document.querySelectorAll('.admin-tabs button'));
  var panels = [].slice.call(document.querySelectorAll('.admin-panel'));
  tabs.forEach(function(b){
    b.addEventListener('click', function(){
      tabs.forEach(function(x){ x.classList.remove('active'); });
      panels.forEach(function(x){ x.classList.remove('active'); });
      b.classList.add('active');
      $('panel-' + b.dataset.tab).classList.add('active');
    });
  });

  /* ============ КОНТАКТЫ ============ */
  var contactFields = ['phoneDisplay','phoneTel','whatsapp','telegram','email','hours','area','topline'];
  function fillContacts(){
    contactFields.forEach(function(k){ var el=$('c_'+k); if(el) el.value = (data.contacts&&data.contacts[k]!=null)?data.contacts[k]:''; });
  }
  function readContacts(){
    data.contacts = data.contacts || {};
    contactFields.forEach(function(k){ var el=$('c_'+k); if(el) data.contacts[k]=el.value.trim(); });
  }

  /* ============ ТЕКСТЫ ============ */
  var textFields = ['heroEyebrow','heroTitleMain','heroTitleAccent','heroLead',
    'calcEyebrow','calcTitle','calcSub','pricesEyebrow','pricesTitle','pricesSub','priceNote',
    'contactsEyebrow','contactsTitle','contactsSub'];
  function fillTexts(){
    textFields.forEach(function(k){ var el=$('t_'+k); if(el) el.value=(data.texts&&data.texts[k]!=null)?data.texts[k]:''; });
  }
  function readTexts(){
    data.texts = data.texts || {};
    textFields.forEach(function(k){ var el=$('t_'+k); if(el) data.texts[k]=el.value; });
  }

  /* ============ КАЛЬКУЛЯТОР ============ */
  function fillRates(){
    var R=data.rates.RATES, E=data.rates.EX;
    $('r_asphalt').value=R.asphalt.base; $('r_chippings').value=R.chippings.base; $('r_pavers').value=R.pavers.base;
    $('r_polymer').value=R.pavers.mult.polymer; $('r_granite').value=R.pavers.mult.granite;
    $('e_paverPrep').value=E.paverPrep; $('e_curbPerM').value=E.curbPerM;
    $('e_delivery').value=E.delivery; $('e_cleanup').value=E.cleanup; $('e_minOrder').value=E.minOrder;
    $('e_prepPct').value=Math.round(E.prepPct*100);
  }
  function num(id, fallback){ var v=parseFloat($(id).value); return isNaN(v)?fallback:v; }
  function readRates(){
    var R=data.rates.RATES, E=data.rates.EX;
    R.asphalt.base=num('r_asphalt',R.asphalt.base);
    R.chippings.base=num('r_chippings',R.chippings.base);
    R.pavers.base=num('r_pavers',R.pavers.base);
    R.pavers.mult.polymer=num('r_polymer',R.pavers.mult.polymer);
    R.pavers.mult.granite=num('r_granite',R.pavers.mult.granite);
    E.paverPrep=num('e_paverPrep',E.paverPrep);
    E.curbPerM=num('e_curbPerM',E.curbPerM);
    E.delivery=num('e_delivery',E.delivery);
    E.cleanup=num('e_cleanup',E.cleanup);
    E.minOrder=num('e_minOrder',E.minOrder);
    E.prepPct=num('e_prepPct',E.prepPct*100)/100;
  }

  /* ============ ПРАЙС-ЛИСТ ============ */
  var priceWrap = $('priceEditor');
  function renderPrices(){
    priceWrap.innerHTML = '';
    (data.prices||[]).forEach(function(sec, si){
      var box = document.createElement('div'); box.className='price-sec';
      var rows = (sec.i||[]).map(function(it, ri){
        return '<div class="price-row" data-si="'+si+'" data-ri="'+ri+'">' +
          '<input class="pr-name" value="'+esc(it[0])+'" placeholder="Наименование" data-fld="0" />' +
          '<input value="'+esc(it[1])+'" placeholder="ед." data-fld="1" />' +
          '<input value="'+esc(it[2])+'" placeholder="цена" data-fld="2" />' +
          '<button class="ico-btn danger" data-act="delrow" title="Удалить позицию">×</button>' +
        '</div>';
      }).join('');
      box.innerHTML =
        '<div class="price-sec-head">' +
          '<input class="sec-title" value="'+esc(sec.t)+'" placeholder="Заголовок раздела" data-act="sectitle" />' +
          '<button class="ico-btn danger" data-act="delsec" title="Удалить раздел">×</button>' +
        '</div>' +
        '<div class="price-rows">' + rows +
          '<div class="row-add"><button class="btn-sm" data-act="addrow" data-si="'+si+'">+ позиция</button></div>' +
        '</div>';
      priceWrap.appendChild(box);
    });
  }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  // живое чтение значений прайса из DOM в data
  function readPricesFromDOM(){
    [].forEach.call(priceWrap.querySelectorAll('.price-sec'), function(box, si){
      var title = box.querySelector('.sec-title');
      if(data.prices[si]) data.prices[si].t = title.value;
    });
    [].forEach.call(priceWrap.querySelectorAll('.price-row'), function(row){
      var si=+row.dataset.si, ri=+row.dataset.ri;
      if(!data.prices[si] || !data.prices[si].i[ri]) return;
      var inputs = row.querySelectorAll('input[data-fld]');
      var arr = data.prices[si].i[ri];
      arr[0]=inputs[0].value; arr[1]=inputs[1].value; arr[2]=inputs[2].value;
    });
  }

  priceWrap.addEventListener('click', function(e){
    var btn = e.target.closest('[data-act]'); if(!btn) return;
    var act = btn.dataset.act;
    if(act==='delrow'){
      readPricesFromDOM();
      var row=btn.closest('.price-row'); var si=+row.dataset.si, ri=+row.dataset.ri;
      data.prices[si].i.splice(ri,1); renderPrices();
    } else if(act==='addrow'){
      readPricesFromDOM();
      var si=+btn.dataset.si; data.prices[si].i.push(['Новая позиция','ед.','0 ₽']); renderPrices();
    } else if(act==='delsec'){
      readPricesFromDOM();
      var box=btn.closest('.price-sec');
      var idx=[].indexOf.call(priceWrap.children, box);
      data.prices.splice(idx,1); renderPrices();
    }
  });
  $('addSection').addEventListener('click', function(){
    readPricesFromDOM();
    data.prices.push({t:'Новый раздел', i:[['Новая позиция','ед.','0 ₽']]});
    renderPrices();
  });

  /* ============ СБОР ВСЕХ ДАННЫХ ============ */
  function collect(){ readContacts(); readTexts(); readRates(); readPricesFromDOM(); }

  /* ============ КНОПКИ ============ */
  $('btnSave').addEventListener('click', function(){
    collect();
    var ok = GSStore.save(data);
    toast(ok ? 'Сохранено. Обновите сайт, чтобы увидеть изменения.' : 'Не удалось сохранить');
  });
  $('btnExport').addEventListener('click', function(){
    collect(); GSStore.save(data); GSStore.exportJSON(data);
  });
  $('btnReset').addEventListener('click', function(){
    if(!confirm('Вернуть все цены и тексты к значениям по умолчанию? Локальные изменения будут удалены.')) return;
    data = GSStore.reset(); fillAll(); toast('Сброшено к значениям по умолчанию');
  });
  $('btnLogout').addEventListener('click', function(){
    try { sessionStorage.removeItem('gs_admin'); } catch(_){}
    window.location.href = 'index.html';
  });
  $('btnPreview').addEventListener('click', function(){
    collect(); GSStore.save(data);
    window.open('index.html', '_blank');
  });

  /* ============ ИНИЦИАЛИЗАЦИЯ ============ */
  function fillAll(){ fillContacts(); fillTexts(); fillRates(); renderPrices(); }
  fillAll();
})();
