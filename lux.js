// Premium interactions: painting-to-reality reveal, magnetic buttons, gallery drag with glide.
(() => {
 const root=document.documentElement,reduced={get matches(){return document.documentElement.classList.contains('motion-paused')},addEventListener(){}},fine=matchMedia('(hover: hover) and (pointer: fine)');
 const paused=()=>{try{return localStorage.getItem('divi-motion')==='paused'}catch{return root.classList.contains('motion-paused')}};

 // The illustration layer carries a static mandala-shaped window; scaling that layer (transform only) grows the window until the real photograph fills the stage.
 const reveal=document.querySelector('.real-reveal');
 if(reveal){
  const stage=reveal.querySelector('.reveal-stage'),art=reveal.querySelector('.reveal-art'),real=reveal.querySelector('.reveal-real');
  let top=0,distance=1,frame=0,last=-1,timer=0;
  const update=()=>{
   frame=0;const p=Math.round(Math.max(0,Math.min(1,(scrollY-top)/distance))*500)/500;if(p===last)return;last=p;
   reveal.dataset.phase=p<.45?'art':'real';
   if(reduced.matches||paused())return;
   art.style.transform=`scale(${(1+8*p*p).toFixed(3)})`;
   art.style.opacity=p<.35?'1':Math.max(0,1-(p-.35)/.45).toFixed(3);
   real.style.transform=`scale(${(1.16-.16*p).toFixed(4)})`;
   real.style.opacity=Math.min(1,p/.22).toFixed(3);
  };
  const measure=()=>{const stick=parseFloat(getComputedStyle(stage).top)||0;top=reveal.getBoundingClientRect().top+scrollY-stick;distance=Math.max(1,reveal.offsetHeight-stage.offsetHeight);last=-1;update();};
  const later=()=>{clearTimeout(timer);timer=setTimeout(measure,120);};
  reveal.classList.add('reveal-ready');
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  addEventListener('resize',later);addEventListener('load',measure);new ResizeObserver(later).observe(document.body);measure();
 }

 // Magnetic pull toward the cursor on primary actions.
 if(fine.matches)document.querySelectorAll('.book,.outline-button').forEach(button=>{
  button.addEventListener('pointermove',e=>{if(paused()||reduced.matches)return;const r=button.getBoundingClientRect();button.style.setProperty('--mx',`${(((e.clientX-r.left)/r.width)-.5)*10}px`);button.style.setProperty('--my',`${(((e.clientY-r.top)/r.height)-.5)*8}px`);});
  button.addEventListener('pointerleave',()=>{button.style.removeProperty('--mx');button.style.removeProperty('--my');});
 });

 // Mouse drag on the gallery with a short glide; clicks still open the lightbox when the pointer did not travel.
 const track=document.querySelector('#gallery-track');
 if(track&&fine.matches){
  let down=false,moved=false,startX=0,startLeft=0,lastX=0,lastT=0,velocity=0,glideFrame=0;
  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;startX=lastX=e.clientX;startLeft=track.scrollLeft;lastT=performance.now();velocity=0;cancelAnimationFrame(glideFrame);});
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(!moved&&Math.abs(dx)>6){moved=true;track.classList.add('is-dragging');}if(!moved)return;track.scrollLeft=startLeft-dx;const now=performance.now();velocity=(e.clientX-lastX)/Math.max(1,now-lastT);lastX=e.clientX;lastT=now;});
  addEventListener('pointerup',()=>{if(!down)return;down=false;if(!moved)return;let speed=-velocity*16;const glide=()=>{track.scrollLeft+=speed;speed*=.92;if(Math.abs(speed)>.5&&!reduced.matches)glideFrame=requestAnimationFrame(glide);else track.classList.remove('is-dragging');};glide();});
  track.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
 }
})();
