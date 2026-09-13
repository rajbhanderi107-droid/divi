// Code-drawn ornament library (Phase B): toran, lotus rosette dividers, paisley corners and the intro rosette ring.
// Vector, so crisp at any size; strokes draw in once as they scroll into view.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const r2=n=>Math.round(n*100)/100;
 const fromMarkup=markup=>{const t=document.createElement('template');t.innerHTML=markup.trim();return t.content.firstChild;};

 function toranMarkup(count){
  let body='';
  for(let i=0;i<count;i++){
   const x=i*72,cx=x+36,delay=r2(-(i%6)*.55);
   body+=`<path class="t-rope" d="M${x} 5 Q${cx} 19 ${x+72} 5"/><circle class="t-knot" cx="${x}" cy="5" r="2.6"/>`;
   body+=i%2
    ?`<g class="t-sway" style="--d:${delay}s"><line class="t-string" x1="${cx}" y1="12" x2="${cx}" y2="20"/><path class="t-leaf" d="M${cx} 20 C${cx+10} 29 ${cx+8} 45 ${cx} 56 C${cx-8} 45 ${cx-10} 29 ${cx} 20Z"/><path class="t-rib" d="M${cx} 23 L${cx} 53"/></g>`
    :`<g class="t-sway" style="--d:${delay}s"><line class="t-string" x1="${cx}" y1="12" x2="${cx}" y2="23"/><circle class="t-flower" cx="${cx}" cy="30" r="7"/><circle class="t-heart" cx="${cx}" cy="30" r="2.8"/><circle class="t-bead" cx="${cx}" cy="43" r="3"/></g>`;
  }
  return `<svg viewBox="0 0 ${count*72} 62" aria-hidden="true" focusable="false">${body}</svg>`;
 }
 function rosetteMarkup(){
  let petals='';
  for(let i=0;i<12;i++)petals+=`<path pathLength="1" transform="rotate(${i*30} 60 30)" d="M60 30 C65.5 23 65.5 13 60 7 C54.5 13 54.5 23 60 30Z"/>`;
  return `<svg viewBox="0 0 120 60" aria-hidden="true" focusable="false"><path pathLength="1" d="M-220 30 H36"/><path pathLength="1" d="M84 30 H340"/><circle pathLength="1" cx="-226" cy="30" r="2.5"/><circle pathLength="1" cx="346" cy="30" r="2.5"/>${petals}<circle pathLength="1" cx="60" cy="30" r="4.5"/></svg>`;
 }
 function paisleyMarkup(side){
  return `<svg class="orn-paisley orn-draw ${side}" viewBox="0 0 90 110" aria-hidden="true" focusable="false"><path pathLength="1" d="M45 104 C14 96 6 62 18 38 C30 14 62 6 76 24 C88 40 78 62 58 64 C44 65 38 52 46 44 C52 38 60 42 58 50"/><path pathLength="1" d="M45 92 C25 86 19 63 27 45 C35 29 56 22 67 34"/><circle pathLength="1" cx="30" cy="70" r="2.5"/><circle pathLength="1" cx="38" cy="80" r="2.5"/><circle pathLength="1" cx="48" cy="86" r="2.5"/></svg>`;
 }
 function ringMarkup(){
  let petals='';
  for(let i=0;i<16;i++)petals+=`<path pathLength="1" transform="rotate(${r2(i*22.5)} 60 60)" d="M60 8 C64.5 14 64.5 20 60 26 C55.5 20 55.5 14 60 8Z"/>`;
  return `<svg class="intro-ring" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle pathLength="1" cx="60" cy="60" r="58"/><circle pathLength="1" cx="60" cy="60" r="30"/>${petals}</svg>`;
 }

 // Toran hangs from the event strip over the top of the first film.
 const strip=document.querySelector('.event-strip');
 if(strip){
  const holder=document.createElement('div');holder.className='orn-toran';holder.setAttribute('aria-hidden','true');strip.after(holder);
  let last=0,timer=0;
  const draw=()=>{const count=Math.ceil(strip.clientWidth/72)+1;if(count===last)return;last=count;holder.innerHTML=toranMarkup(count);};
  draw();addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(draw,150);});
  new IntersectionObserver(entries=>holder.classList.toggle('orn-idle',!entries[0].isIntersecting),{rootMargin:'80px 0px'}).observe(strip);
 }

 // Lotus rosette dividers above section headings.
 [['.gallery',''],['#plan',''],['#passes','on-dark'],['#lineup','on-dark']].forEach(([selector,tone])=>{
  const section=document.querySelector(selector);if(!section)return;
  const divider=document.createElement('div');divider.className=`orn-divider orn-draw ${tone}`.trim();divider.setAttribute('aria-hidden','true');divider.innerHTML=rosetteMarkup();section.prepend(divider);
 });

 // Paisley corners in the footer and a rosette ring around the intro flame.
 const footer=document.querySelector('footer');if(footer)footer.append(fromMarkup(paisleyMarkup('l')),fromMarkup(paisleyMarkup('r')));
 const flame=document.querySelector('.welcome-loader .intro-flame');if(flame)flame.append(fromMarkup(ringMarkup()));

 const drawTargets=document.querySelectorAll('.orn-draw');
 if(reduced.matches||!('IntersectionObserver' in window)){drawTargets.forEach(el=>el.classList.add('orn-in'));return;}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('orn-in');observer.unobserve(entry.target);}),{rootMargin:'0px 0px -10% 0px'});
 drawTargets.forEach(el=>observer.observe(el));
})();
