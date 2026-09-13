(() => {
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,last='';
 const stops=[[104,46,23],[26,14,11],[103,64,34]];
 function update(){frame=0;const progress=Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))),segment=progress<.72?0:1,t=segment===0?Math.min(1,progress/.42):Math.min(1,(progress-.72)/.28),a=stops[segment],b=stops[segment+1],value=`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`;if(value!==last){root.style.setProperty('--phase-tint',value);last=value;}}
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});update();
 const rosette='<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">'+Array.from({length:12},(_,i)=>`<path transform="rotate(${i*30} 100 100)" d="M100 22Q133 65 100 87Q67 65 100 22Z"/>`).join('')+'<circle cx="100" cy="100" r="10"/><circle cx="100" cy="100" r="89"/></svg>';
 document.querySelectorAll('.gallery,.visit-planner,.film-closing').forEach(section=>{const ornament=document.createElement('div');ornament.className='ornament-strip';ornament.setAttribute('aria-hidden','true');ornament.innerHTML=rosette;if(section.classList.contains('film-closing'))section.querySelector('div')?.prepend(ornament);else section.prepend(ornament);});
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;if(!reduce.matches&&!root.classList.contains('motion-paused'))e.target.classList.add('is-drawing');observer.unobserve(e.target);}),{threshold:.6});document.querySelectorAll('.ornament-strip').forEach(el=>observer.observe(el));
 document.querySelectorAll('.film-heading').forEach(el=>{const mark=document.createElement('img');mark.className='ornament-mini';mark.src='assets/ornaments/paisley.svg';mark.alt='';mark.width=48;mark.height=48;el.append(mark);});
})();
