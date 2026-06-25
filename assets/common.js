(function(){
  "use strict";
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* применить контакты из стора (если подключён content.js + store.js) */
  if (window.GSStore){
    try { GSStore.applyContacts(GSStore.load().contacts); } catch(_){}
  }

  /* mobile menu */
  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  if (burger && nav){
    burger.addEventListener('click', function(){ nav.classList.toggle('open'); });
    nav.addEventListener('click', function(e){ if(e.target.tagName==='A') nav.classList.remove('open'); });
  }

  /* scroll progress + sticky header shadow */
  var header = document.querySelector('header.site');
  var progress = document.getElementById('progress');
  function onScroll(){
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', st > 20);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
