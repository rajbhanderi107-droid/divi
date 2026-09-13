// Rising embers drawn on the GPU (one draw call per section), paused when off-screen or when motion is paused.
(() => {
 const hosts=[...document.querySelectorAll('.hero,.compact-ritual,.film-closing')];
 if(!hosts.length)return;
 const reduced={get matches(){return document.documentElement.classList.contains('motion-paused')},addEventListener(){}};
 const paused=()=>{try{return localStorage.getItem('divi-motion')==='paused'}catch{return document.documentElement.classList.contains('motion-paused')}};
 const MAX=260;
 const VS=`#version 300 es
 in vec4 seed;uniform float t;uniform float dpr;out float alpha;
 void main(){
  float life=fract(seed.z+t*(.03+.045*seed.w));
  float x=seed.x+sin(t*(.35+seed.w*.6)+seed.z*12.)*.035;
  gl_Position=vec4(x,-1.1+life*2.3,0.,1.);
  alpha=smoothstep(0.,.15,life)*(1.-smoothstep(.62,1.,life))*(.3+.7*seed.w);
  gl_PointSize=(1.4+seed.w*3.6)*dpr;
 }`;
 const FS=`#version 300 es
 precision mediump float;in float alpha;uniform vec3 tint;out vec4 o;
 void main(){float g=smoothstep(.5,0.,length(gl_PointCoord-.5));g*=g;o=vec4(tint*g*alpha,g*alpha);}`;
 hosts.forEach(host=>{
  const canvas=document.createElement('canvas');canvas.className='embers';canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,powerPreference:'low-power'});
  if(!gl)return;
  const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;};
  const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VS));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FS));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  host.prepend(canvas);gl.useProgram(program);
  const seeds=new Float32Array(MAX*4);for(let i=0;i<MAX;i++){seeds[i*4]=Math.random()*2-1;seeds[i*4+2]=Math.random();seeds[i*4+3]=Math.random();}
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,seeds,gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(program,'seed');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,0,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.clearColor(0,0,0,0);
  const uT=gl.getUniformLocation(program,'t'),uDpr=gl.getUniformLocation(program,'dpr');
  // Ember colour follows the night: dusk orange in the hero, warm gold at the centre, pale dawn gold at the close.
  gl.uniform3fv(gl.getUniformLocation(program,'tint'),host.classList.contains('hero')?[1,.6,.28]:host.classList.contains('film-closing')?[1,.9,.66]:[1,.79,.45]);
  let visible=false,raf=0,count=0;const start=performance.now()-Math.random()*40000;
  const size=()=>{const dpr=Math.min(devicePixelRatio,1.5),w=host.clientWidth,h=host.clientHeight;canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(uDpr,dpr);count=Math.min(MAX,Math.round(w*h/(innerWidth<700?9000:4800)));};
  const frame=now=>{raf=0;if(!visible||document.hidden)return;gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uT,(now-start)/1000);gl.drawArrays(gl.POINTS,0,count);if(!paused()&&!reduced.matches)raf=requestAnimationFrame(frame);};
  const kick=()=>{if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);};
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;kick();},{rootMargin:'80px'}).observe(host);
  new ResizeObserver(()=>{size();kick();}).observe(host);
  addEventListener('divi:motion',kick);document.addEventListener('visibilitychange',kick);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(raf)cancelAnimationFrame(raf);canvas.remove();});
 });
})();
