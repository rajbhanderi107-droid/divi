// Passes, lineup and WhatsApp, rendered from site-config.js. Each stays hidden until its data is filled in.
(() => {
 const config=window.DIVI_CONFIG||{};
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const openBooking=()=>document.querySelector('header [data-book]')?.click();

 const passes=document.querySelector('#passes');
 if(passes&&Array.isArray(config.passes)&&config.passes.length){
  passes.querySelector('.pass-grid').innerHTML=config.passes.map(pass=>`<article class="pass-card"><h3>${esc(pass.name)}</h3><p class="pass-price">${esc(pass.price)}</p>${pass.note?`<p class="pass-note">${esc(pass.note)}</p>`:''}<button type="button" class="book pass-book">Book this pass <span aria-hidden="true">↗</span></button></article>`).join('');
  passes.addEventListener('click',e=>{if(e.target.closest('.pass-book'))openBooking();});
  passes.hidden=false;
 }

 const lineup=document.querySelector('#lineup');
 if(lineup&&Array.isArray(config.lineup)&&config.lineup.length){
  lineup.querySelector('.lineup-grid').innerHTML=config.lineup.map(artist=>`<article class="lineup-card">${artist.photo?`<img src="${esc(artist.photo)}" alt="${esc(artist.name)}" loading="lazy" width="800" height="1000">`:''}<h3>${esc(artist.name)}</h3>${artist.role?`<p>${esc(artist.role)}</p>`:''}${artist.nights?`<p class="lineup-nights">${esc(artist.nights)}</p>`:''}</article>`).join('');
  lineup.hidden=false;
 }

 const whatsapp=document.querySelector('.whatsapp');
 if(whatsapp&&/^\d{8,15}$/.test(String(config.whatsapp||''))){
  whatsapp.href=`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hi Divi Garba, I have a question about Navratri 2026.')}`;
  whatsapp.hidden=false;
 }
})();
