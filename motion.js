// Entry choreography (Phase A): section content arrives heading → text → art → action, once, on the shared motion tokens.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches||!('IntersectionObserver' in window))return;
 const targets=[...document.querySelectorAll('.event-strip,.compact-ritual>div:last-child,.film-closing>div,.gallery-track,.pass-grid,.lineup-grid,.visit-faq,.footer-top')];
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('rv-in');observer.unobserve(entry.target);}),{rootMargin:'0px 0px -12% 0px'});
 // Content already on screen at load stays put; only content further down the page is choreographed.
 targets.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*.92)return;el.classList.add('rv');observer.observe(el);});
 // Rest the canopy light rays while the reveal section is off-screen.
 const reveal=document.querySelector('.real-reveal');
 if(reveal)new IntersectionObserver(entries=>reveal.classList.toggle('reveal-idle',!entries[0].isIntersecting)).observe(reveal);
})();
