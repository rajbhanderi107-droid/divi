(() => {
 const root=document.documentElement,toggle=document.querySelector('.motion-toggle'),preference=matchMedia('(prefers-reduced-motion: reduce)');
 let stored=null;try{stored=localStorage.getItem('divi-motion')}catch{}
 // Motion plays by default (the site is built around it); the toggle pauses everything and the choice is remembered.
 let paused=stored==='paused';const videos=[...document.querySelectorAll('.ambient-video')],visible=new Set();
 const ornamentSections=document.querySelectorAll('.story-intro,.gallery,.visit-planner,.np-hero,footer');
 ornamentSections.forEach(section=>section.classList.add('decorative-field'));
 const ornamentObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('motion-offscreen',!entry.isIntersecting)),{rootMargin:'100px'});
 document.querySelectorAll('.hero,.story-stage,.details,.decorative-field,.art-interlude,.lotus-banner').forEach(section=>ornamentObserver.observe(section));
 function sync(){
  root.classList.toggle('page-hidden',document.hidden);
  root.classList.toggle('motion-enabled',!paused);
  root.classList.toggle('motion-paused',paused);toggle.textContent=paused?'Play motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Play animations':'Pause animations');
  document.getAnimations().forEach(animation=>{if(animation.playState==='finished')return;if(paused)animation.pause();else if(animation.playState==='paused')animation.play()});
  videos.forEach(video=>{if(paused||document.hidden||!visible.has(video)){video.pause();return}if(!video.getAttribute('src')){video.src=video.dataset.src;video.load()}video.play().catch(()=>{})});
  window.dispatchEvent(new Event('divi:motion'));
 }
 toggle.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('divi-motion',paused?'paused':'playing')}catch{}sync()});
 document.addEventListener('visibilitychange',sync);
 const videoObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target)});sync()},{rootMargin:'80px'});videos.forEach(video=>videoObserver.observe(video));
 const drawer=document.querySelector('.planner-drawer');const openPlan=()=>{if(location.hash==='#plan')drawer.open=true};window.addEventListener('hashchange',openPlan);openPlan();document.querySelectorAll('a[href="#plan"]').forEach(a=>a.addEventListener('click',()=>drawer.open=true));
 const reveals=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;reveals.unobserve(entry.target);if(!paused)entry.target.animate([{opacity:.55,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'})})},{threshold:.1});
 document.querySelectorAll('.story-intro,.section-heading,.feature,.stories article,.visit-essentials,.location').forEach(el=>reveals.observe(el));sync();
})();
