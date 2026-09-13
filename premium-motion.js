(() => {
const ns='http://www.w3.org/2000/svg';
function ring(){
const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 600 600');svg.setAttribute('class','living-mandala');svg.setAttribute('aria-hidden','true');
let shapes='<circle cx="300" cy="300" r="275"/><circle cx="300" cy="300" r="245"/><circle cx="300" cy="300" r="195"/>';
for(let i=0;i<24;i++) shapes+='<g transform="rotate('+i*15+' 300 300)"><path d="M300 28 Q352 105 300 168 Q248 105 300 28Z"/><path d="M300 92 Q320 127 300 155 Q280 127 300 92Z"/><circle cx="300" cy="185" r="4"/></g>';
svg.innerHTML=shapes;return svg;
}
document.querySelectorAll('.hero-composition,.story-canvas').forEach(el=>{el.append(ring());});
document.querySelectorAll('.hero,.story-canvas,.details,.panorama-art,.lotus-banner figure').forEach(el=>{
const layer=document.createElement('div');layer.className='floating-lights';layer.setAttribute('aria-hidden','true');
for(let i=0;i<14;i++){const dot=document.createElement('i');dot.style.cssText='--x:'+((i*37+9)%97)+'%;--y:'+((i*23+13)%91)+'%;--delay:'+(-i*1.7)+'s;--duration:'+(7+i%5)+'s;';layer.append(dot)}el.append(layer);
});
document.querySelectorAll('.story-canvas,.panorama-art,.lotus-banner figure').forEach(el=>{const light=document.createElement('div');light.className='scene-luminescence';light.setAttribute('aria-hidden','true');el.append(light)});
})();
