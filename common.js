(() => {
 const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
 const closeMenu=()=>{nav?.classList.remove('is-open');menu?.setAttribute('aria-expanded','false')};
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('is-open')){closeMenu();menu.focus()}});
 document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu()});
 matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
 document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('.close')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
 });
 const booking=document.querySelector('#booking'),frame=document.querySelector('#booking-frame'),external=document.querySelector('#booking-external');
 if(booking&&frame&&external){
  external.href=window.DIVI_CONFIG.bookingUrl;external.textContent='Open the official ticket provider ↗';
  const note=document.createElement('p');note.className='booking-note';note.textContent='Availability and prices are confirmed by the ticket provider. If booking does not appear below, open the provider directly.';frame.before(note);
  document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>{const url=new URL(window.DIVI_CONFIG.bookingUrl);url.searchParams.set('parentOrigin',location.origin);frame.src=url.href;booking.showModal()}));
  booking.addEventListener('close',()=>frame.removeAttribute('src'));
 }
 const terms=document.querySelector('#terms');
 function syncTerms(){if(!terms)return;if(location.hash==='#terms'&&!terms.open)terms.showModal();else if(location.hash!=='#terms'&&terms.open)terms.close()}
 window.addEventListener('hashchange',syncTerms);terms?.addEventListener('close',()=>{if(location.hash==='#terms')history.replaceState(null,'',location.pathname+location.search)});syncTerms();
})();
