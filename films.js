(() => {
 const root=document.documentElement,videos=[...document.querySelectorAll('[data-film]')],ratios=new Map();
 const compact=matchMedia('(max-width: 900px)'),saveData=navigator.connection?.saveData;
 const paused=()=>{try{return localStorage.getItem('divi-motion')==='paused'}catch{return root.classList.contains('motion-paused')}};
 const source=video=>(compact.matches||saveData)?video.dataset.film.replace('.mp4','-sm.mp4'):video.dataset.film;
 const prime=(video,preload='auto')=>{if(!video||video.hasAttribute('src'))return;video.preload=preload;video.src=source(video);video.load();};
 const pad=n=>String(n).padStart(2,'0');
 const journeys=[...document.querySelectorAll('.film-journey')].map(el=>{
  const j={el,stage:el.querySelector('.film-stage'),scenes:[...el.querySelectorAll('.film-scene')],buttons:[...el.querySelectorAll('[data-scene]')],index:-1,top:0,distance:1};
  j.scenes.forEach(scene=>scene.style.setProperty('--poster',`url("${scene.querySelector('video').getAttribute('poster')}")`));
  const count=document.createElement('span');count.className='film-count';count.setAttribute('aria-hidden','true');count.innerHTML=`<b>01</b><i></i>${pad(j.scenes.length)}`;
  el.querySelector('.film-bottom').prepend(count);j.count=count.querySelector('b');
  return j;
 });
 let frame=0;
 function playback(){
  const eligible=videos.filter(video=>ratios.get(video)>0&&(!video.closest('.film-scene')||video.closest('.film-scene').classList.contains('is-current'))).sort((a,b)=>(ratios.get(b)||0)-(ratios.get(a)||0)).slice(0,2);
  videos.forEach(video=>{if(paused()||document.hidden||!eligible.includes(video)){video.pause();return;}prime(video);if(video.paused)video.play().catch(()=>{});});
 }
 function show(j,index){
  if(j.index===index)return;
  const previous=j.index;j.stage.dataset.dir=index<previous?'up':'down';j.index=index;
  j.scenes.forEach((scene,i)=>{scene.classList.toggle('is-current',i===index);scene.classList.toggle('was-current',i===previous);scene.setAttribute('aria-hidden',String(i!==index));});
  clearTimeout(j.settle);j.settle=setTimeout(()=>j.scenes.forEach(scene=>scene.classList.remove('was-current')),1250);
  j.buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  j.count.textContent=pad(index+1);
  [index+1,index-1].forEach(n=>prime(j.scenes[n]?.querySelector('video'),'metadata'));
  playback();
 }
 function update(){frame=0;for(const j of journeys){const raw=(scrollY-j.top)/j.distance,p=Math.max(0,Math.min(.99999,raw));show(j,Math.min(j.scenes.length-1,Math.floor(p*j.scenes.length)));if(raw>=-.3&&raw<=1.3)j.stage.style.setProperty('--scene-travel',((p*j.scenes.length)%1).toFixed(4));const top=j.el.getBoundingClientRect().top;if(top>-innerHeight&&top<innerHeight*1.2)j.stage.style.setProperty('--enter',Math.max(0,Math.min(1,1-(top-j.headerHeight)/(innerHeight*.9))).toFixed(4));}}
 function measure(){const header=document.querySelector('header').getBoundingClientRect().height;journeys.forEach(j=>{j.headerHeight=header;j.el.style.setProperty('--film-header',`${header}px`);j.top=scrollY+j.el.getBoundingClientRect().top-header;j.distance=Math.max(1,j.el.offsetHeight-j.stage.offsetHeight);});update();}
 function jump(j,i){window.scrollTo({top:j.top+((i+.12)/j.scenes.length)*j.distance,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 journeys.forEach(j=>{j.el.classList.add('film-ready');j.buttons.forEach((button,i)=>button.addEventListener('click',()=>jump(j,i)));j.el.querySelector('.film-markers').addEventListener('keydown',e=>{const i=j.buttons.indexOf(document.activeElement);if(i<0)return;const targets={ArrowRight:Math.min(i+1,j.buttons.length-1),ArrowLeft:Math.max(i-1,0),Home:0,End:j.buttons.length-1};if(!(e.key in targets))return;e.preventDefault();j.buttons[targets[e.key]].focus({preventScroll:true});jump(j,targets[e.key]);});});
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{ratios.set(e.target,e.isIntersecting?e.intersectionRatio:0);});playback();},{threshold:[0,.1,.4,.7]});videos.forEach(video=>observer.observe(video));
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});window.addEventListener('resize',measure);window.addEventListener('load',measure);document.fonts?.ready.then(measure);
 window.addEventListener('divi:motion',()=>{update();playback();});document.addEventListener('visibilitychange',playback);
 if(location.hash==='#nights'){location.replace('#experience');}measure();
})();
