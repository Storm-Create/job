(function(){
  var html=document.documentElement, rail=document.getElementById('tRail'), thumb=document.getElementById('tThumb');
  var wr=document.getElementById('wheelRear'), wf=document.getElementById('wheelFront');
  if(!rail) return;
  var mq=window.matchMedia('(min-width:1px)');
  var dragging=false, startY=0, startScroll=0;
  function dims(){
    var docH=Math.max(document.body.scrollHeight, html.scrollHeight);
    var winH=window.innerHeight, railH=rail.clientHeight;
    var thumbH=Math.max(42, Math.round(railH*(winH/docH)));
    return {docH:docH, winH:winH, railH:railH, thumbH:thumbH, max:docH-winH};
  }
  function update(){
    if(!html.classList.contains('tractor-on')) return;
    var d=dims();
    thumb.style.height=d.thumbH+'px';
    var frac=d.max>0 ? Math.min(1,Math.max(0,window.scrollY/d.max)) : 0;
    var top=(d.railH-d.thumbH)*frac;
    thumb.style.transform='translateY('+top+'px)';
    var ang=window.scrollY*1.15;
    if(wr) wr.style.transform='rotate('+ang+'deg)';
    if(wf) wf.style.transform='rotate('+(ang*1.55)+'deg)';
  }
  function activate(){
    var scrollable=Math.max(document.body.scrollHeight,html.scrollHeight) > window.innerHeight+4;
    if(mq.matches && scrollable){ html.classList.add('tractor-on'); update(); }
    else { html.classList.remove('tractor-on'); }
  }
  // drag the tractor
  thumb.addEventListener('pointerdown', function(e){
    dragging=true; startY=e.clientY; startScroll=window.scrollY;
    try{thumb.setPointerCapture(e.pointerId);}catch(_){}
    e.preventDefault();
  });
  window.addEventListener('pointermove', function(e){
    if(!dragging) return;
    var d=dims(); if(d.railH<=d.thumbH) return;
    var perPx=d.max/(d.railH-d.thumbH);
    window.scrollTo(0, startScroll+(e.clientY-startY)*perPx);
  });
  window.addEventListener('pointerup', function(){ dragging=false; });
  // click on road jumps there
  rail.addEventListener('pointerdown', function(e){
    if(e.target!==rail) return;
    var d=dims(); var rect=rail.getBoundingClientRect();
    var frac=(e.clientY-rect.top-d.thumbH/2)/(d.railH-d.thumbH);
    window.scrollTo({top:Math.min(1,Math.max(0,frac))*d.max, behavior:'smooth'});
  });
  // wheel over the rail scrolls the page
  rail.addEventListener('wheel', function(e){ window.scrollBy(0,e.deltaY); e.preventDefault(); }, {passive:false});
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', function(){ activate(); update(); });
  if(mq.addEventListener) mq.addEventListener('change', function(){ activate(); update(); });
  if(window.ResizeObserver){ new ResizeObserver(function(){ activate(); update(); }).observe(document.body); }
  activate(); update();
})();
