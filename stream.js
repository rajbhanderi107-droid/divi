// Image corridor for the Memories section: a vanilla port of the ImageStreamHero component. Two mirrored rails of photographs ride
// out of a vanishing point toward the viewer. Depth is authored as apparent size (each card a constant ratio bigger than the one
// behind it), the rails open early then hold, and cards are born across the axis so the centre never opens. Every length is in
// cqw, so the corridor keeps its proportions at any width. Photographs come from the gallery track that app.js builds.
(() => {
 const host=document.querySelector('.image-stream'),track=document.querySelector('#gallery-track');
 if(!host||!track)return;
 const images=[...track.querySelectorAll('img')].map(img=>img.getAttribute('src')).filter(Boolean);
 if(!images.length)return;
 const P={perspective:30,cardWidth:18,cardHeight:25,cardRadius:.4,birthHeight:2.6,exitHeight:46,railBirth:-11,railExit:44,fan:3.3,turnBirth:6,turnExit:28,stops:24};
 const cards=matchMedia('(max-width: 700px)').matches?8:9,speed=18,axis=55;
 // Sample the path once so the CSS keyframes trace the real curve.
 const keyframes=(dir,name)=>{
  let steps='';
  for(let s=0;s<=P.stops;s++){
   const u=s/P.stops,scale=(P.birthHeight/P.cardHeight)*Math.pow(P.exitHeight/P.birthHeight,u),z=P.perspective*(1-1/scale);
   const rail=P.railExit-(P.railExit-P.railBirth)*Math.pow(1-u,P.fan),turn=P.turnBirth+(P.turnExit-P.turnBirth)*u;
   steps+=`${(u*100).toFixed(2)}%{transform:translate3d(${(dir*rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir*turn).toFixed(2)}deg)}`;
  }
  return `@keyframes ${name}{${steps}}`;
 };
 const style=document.createElement('style');style.textContent=keyframes(1,'stream-right')+keyframes(-1,'stream-left');document.head.append(style);
 const stage=document.createElement('div');stage.className='image-stream-stage';stage.style.perspective=`${P.perspective}cqw`;stage.style.perspectiveOrigin=`50% ${axis}%`;
 const world=document.createElement('div');world.className='image-stream-world';stage.append(world);
 for(const name of ['stream-right','stream-left'])for(let i=0;i<cards;i++){
  const card=document.createElement('div');card.className='image-stream-card';
  Object.assign(card.style,{top:`${axis}%`,width:`${P.cardWidth}cqw`,height:`${P.cardHeight}cqw`,marginLeft:`${-P.cardWidth/2}cqw`,marginTop:`${-P.cardHeight/2}cqw`,borderRadius:`${P.cardRadius}cqw`});
  // Animation comes from CSS variables so the paused state can keep every card frozen mid-flight instead of collapsing onto the axis.
  // Negative delay drops each card mid-flight, so the corridor is already full on the first frame.
  card.style.setProperty('--stream-name',name);card.style.setProperty('--stream-duration',`${speed}s`);card.style.setProperty('--stream-delay',`${-(i*speed)/cards}s`);
  // Photos are assigned once the corridor nears the viewport (below): lazy loading is unreliable for images inside 3D-transformed
  // cards on phones, so these load eagerly but only when needed.
  const img=document.createElement('img');img.dataset.src=images[i%images.length];img.alt='';img.decoding='async';img.draggable=false;card.append(img);world.append(card);
 }
 host.prepend(stage);
 // Rest the corridor while it is off-screen.
 new IntersectionObserver(entries=>host.classList.toggle('stream-offscreen',!entries[0].isIntersecting),{rootMargin:'120px'}).observe(host);
 const loader=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;loader.disconnect();host.querySelectorAll('img[data-src]').forEach(img=>{img.src=img.dataset.src;img.removeAttribute('data-src');});},{rootMargin:'800px 0px'});loader.observe(host);
})();
