(() => {
 const root=document.documentElement,videos=[...document.querySelectorAll('[data-film]')],ratios=new Map();
 const compact=matchMedia('(max-width: 900px)'),saveData=navigator.connection?.saveData,reduced={get matches(){return document.documentElement.classList.contains('motion-paused')},addEventListener(){}},fine=matchMedia('(hover: hover) and (pointer: fine)');
 const paused=()=>{return root.classList.contains('motion-paused')||(reduced.matches&&!root.classList.contains('motion-enabled'))};

 const scrubbing=()=>false;
 // Original-frame encodes: no optical stabilisation, frame interpolation or mid-loop dissolves.
 const source=video=>video.dataset.film.replace('.mp4',(compact.matches||saveData)?'-clean-sm.mp4?v=20260913n':'-clean.mp4?v=20260913n');
 const prime=(video,preload='auto')=>{if(!video||video.hasAttribute('src'))return;video.preload=preload;video.src=source(video);video.load();};
 const pad=n=>String(n).padStart(2,'0');
 const archSvg='<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path fill="#190c09" fill-rule="evenodd" d="M-1-1H101V101H-1Z M24 101V44 C24 18 76 18 76 44 V101Z"/><path fill="none" stroke="#d9b273" stroke-opacity=".55" stroke-width=".25" vector-effect="non-scaling-stroke" d="M24 101V44 C24 18 76 18 76 44 V101"/></svg>';
 const journeys=[...document.querySelectorAll('.film-journey')].map(el=>{
  const stage=el.querySelector('.film-stage'),scenes=[...el.querySelectorAll('.film-scene')];
  scenes.forEach(scene=>scene.style.setProperty('--backdrop',`url("${scene.querySelector('video').getAttribute('poster').replace('.webp','-blur.webp')}")`));
  const count=document.createElement('span');count.className='film-count';count.setAttribute('aria-hidden','true');count.innerHTML=`<b>01</b><i></i>${pad(scenes.length)}`;
  el.querySelector('.film-bottom').prepend(count);
  const arch=document.createElement('div');arch.className='film-arch';arch.innerHTML=archSvg;stage.append(arch);
  return {el,stage,scenes,arch,count:count.querySelector('b'),buttons:[...el.querySelectorAll('[data-scene]')],index:-1,absTop:0,top:0,distance:1,enter:-1,progress:-1};
 });
 let frame=0,header=86,viewport=innerHeight;
 // Starting a clip (network, decoder set-up, first frames) is the main scroll cost, so clips that still need loading start once
 // their scene has been on screen briefly or scrolling settles; buffered clips start at once and playing clips keep playing.
 let scrolling=false,settleTimer=0;
 addEventListener('scroll',()=>{scrolling=true;clearTimeout(settleTimer);settleTimer=setTimeout(()=>{scrolling=false;playback();warmNeighbours();},160);},{passive:true});
 const idle=window.requestIdleCallback?fn=>requestIdleCallback(fn,{timeout:1200}):fn=>setTimeout(fn,250);
 function warmNeighbours(){idle(()=>{if(scrolling)return;for(const j of journeys){if(j.index<0)continue;[j.index+1,j.index-1].forEach(n=>prime(j.scenes[n]?.querySelector('video'),'metadata'));}});}
 function playback(){
  const eligible=videos.filter(video=>ratios.get(video)>0&&(!video.closest('.film-scene')||video.closest('.film-scene').classList.contains('is-current'))).sort((a,b)=>(ratios.get(b)||0)-(ratios.get(a)||0)).slice(0,1);
  videos.forEach(video=>{
   if(scrubbing(video)){if(eligible.includes(video)||ratios.get(video)>0)prime(video);if(!video.paused)video.pause();return;}
   if(paused()||document.hidden||!eligible.includes(video)){if(!video.paused)video.pause();return;}
   // While scrolling, a buffered clip starts at once; one that still has to load waits until its scene has been current for 250 ms,
   // so scenes flicked past don't trigger network and decoder work.
   if(scrolling&&video.paused&&video.readyState<3&&performance.now()-(+video.closest('.film-scene')?.dataset.since||0)<250)return;
   prime(video);if(video.paused)video.play().catch(()=>{});
  });
 }
 function show(j,index){
  if(j.index===index)return;
  const previous=j.index;j.stage.dataset.dir=index<previous?'up':'down';j.stage.dataset.index=index;j.index=index;
  j.scenes.forEach((scene,i)=>{scene.classList.toggle('is-current',i===index);scene.classList.toggle('was-current',i===previous);scene.setAttribute('aria-hidden',String(i!==index));});
  clearTimeout(j.settle);j.settle=setTimeout(()=>j.scenes[previous]?.classList.remove('was-current'),1150);
  j.buttons.forEach((button,i)=>{button.classList.toggle('is-done',i<index);if(i===index)button.setAttribute('aria-current','step');else{button.removeAttribute('aria-current');button.style.removeProperty('--p');}});
  j.count.textContent=pad(index+1);j.progress=-1;
  j.scenes[index].dataset.since=performance.now();clearTimeout(j.dwell);j.dwell=setTimeout(playback,260);
  // Buffer the next scene in idle time so it can start the moment it arrives.
  idle(()=>prime(j.scenes[index+1]?.querySelector('video')));
  playback();
 }
 function update(){
  frame=0;
  for(const j of journeys){
   const sectionTop=j.absTop-scrollY;
   if(sectionTop>viewport||sectionTop+j.height<0)continue;
   const raw=(scrollY-j.top)/j.distance,p=Math.max(0,Math.min(.99999,raw)),n=j.scenes.length;
   show(j,Math.min(n-1,Math.floor(p*n)));
   const within=(p*n)%1,local=Math.round(within*100)/100;
   if(local!==j.progress){j.progress=local;j.buttons[j.index]?.style.setProperty('--p',local);}
   const scrub=j.scenes[j.index]?.querySelector('video.is-square');   if(scrub&&scrubbing(scrub)&&scrub.readyState>=1&&scrub.duration){const t=Math.min(scrub.duration-.05,within*scrub.duration);if(Math.abs(scrub.currentTime-t)>1/30)scrub.currentTime=t;}
   const enter=reduced.matches?1:Math.round(Math.max(0,Math.min(1,1-(sectionTop-header)/(viewport*.9)))*200)/200;
   if(enter!==j.enter){j.enter=enter;j.arch.style.transform=`scale(${1+enter*enter*3.2})`;j.arch.style.visibility=enter>=1?'hidden':'visible';}
   // As the stage scrolls away, fade its frame, heading and counter so they don't hang over the next section.
   const exit=Math.round(Math.max(0,Math.min(1,(scrollY-j.top-j.distance)/(viewport*.3)))*20)/20;
   if(exit!==j.exit){j.exit=exit;j.stage.style.setProperty('--exit',exit);}
  }
 }
 function measure(){
  header=document.querySelector('header').getBoundingClientRect().height;viewport=innerHeight;
  journeys.forEach(j=>{j.el.style.setProperty('--film-header',`${header}px`);j.absTop=scrollY+j.el.getBoundingClientRect().top;j.top=j.absTop-header;j.height=j.el.offsetHeight;j.distance=Math.max(1,j.height-j.stage.offsetHeight);j.enter=-1;});
  update();
 }
 function jump(j,i){window.scrollTo({top:j.top+((i+.12)/j.scenes.length)*j.distance,behavior:reduced.matches?'instant':'smooth'});}
 journeys.forEach(j=>{j.el.classList.add('film-ready');j.buttons.forEach((button,i)=>button.addEventListener('click',()=>jump(j,i)));j.el.querySelector('.film-markers').addEventListener('keydown',e=>{const i=j.buttons.indexOf(document.activeElement);if(i<0)return;const targets={ArrowRight:Math.min(i+1,j.buttons.length-1),ArrowLeft:Math.max(i-1,0),Home:0,End:j.buttons.length-1};if(!(e.key in targets))return;e.preventDefault();j.buttons[targets[e.key]].focus({preventScroll:true});jump(j,targets[e.key]);});});
 // Re-sync a scrubbed clip once it can seek, so it matches the scroll position without waiting for the next scroll.
 videos.filter(video=>video.classList.contains('is-square')).forEach(video=>video.addEventListener('loadedmetadata',()=>{journeys.forEach(j=>j.progress=-1);if(!frame)frame=requestAnimationFrame(update);}));
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>ratios.set(e.target,e.isIntersecting?e.intersectionRatio:0));playback();},{threshold:[0,.25,.5,.75]});videos.forEach(video=>observer.observe(video));
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 let resizeTimer=0;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,120);});
 window.addEventListener('load',measure);document.fonts?.ready.then(measure);new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,120);}).observe(document.body);
 window.addEventListener('divi:motion',playback);document.addEventListener('visibilitychange',playback);
 if(location.hash==='#nights'){location.replace('#experience');}measure();
})();
