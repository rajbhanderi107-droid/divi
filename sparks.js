// Celebration sparks (Phase C): a short gold burst from primary actions, on one shared canvas that sleeps between bursts.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const paused=()=>{try{return localStorage.getItem('divi-motion')==='paused'}catch{return document.documentElement.classList.contains('motion-paused')}};
 const sparks=[];let canvas=null,ctx=null,raf=0,last=0;
 const size=()=>{const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
 const ensure=()=>{if(canvas)return;canvas=document.createElement('canvas');canvas.className='sparks';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);ctx=canvas.getContext('2d');size();};
 function step(now){
  const dt=Math.min(2,(now-last)/16.67);last=now;
  ctx.clearRect(0,0,innerWidth,innerHeight);ctx.globalCompositeOperation='lighter';
  for(let i=sparks.length-1;i>=0;i--){
   const p=sparks[i];p.vy+=.12*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=p.decay*dt;
   if(p.life<=0){sparks.splice(i,1);continue;}
   ctx.globalAlpha=p.life;ctx.fillStyle=p.warm?'#ff9f43':'#ffd27a';ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.6+p.life*.6),0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  if(sparks.length)raf=requestAnimationFrame(step);else{raf=0;ctx.clearRect(0,0,innerWidth,innerHeight);}
 }
 function burst(x,y){
  ensure();
  for(let i=0;i<26;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*4.5;sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2.2,life:1,decay:.018+Math.random()*.022,r:1+Math.random()*1.8,warm:Math.random()<.5});}
  if(!raf){last=performance.now();raf=requestAnimationFrame(step);}
 }
 document.addEventListener('click',e=>{
  if(reduced.matches||paused())return;
  const target=e.target.closest('.book,.pass-book,.night-option,.outline-button');if(!target)return;
  let x=e.clientX,y=e.clientY;
  if(!x&&!y){const r=target.getBoundingClientRect();x=r.left+r.width/2;y=r.top+r.height/2;}
  burst(x,y);
 });
 addEventListener('resize',()=>{if(canvas)size();});
})();
