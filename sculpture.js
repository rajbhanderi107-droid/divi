const host=document.querySelector('#divi-sculpture');
if(host){
 let started=false;
 const observer=new IntersectionObserver(async entries=>{if(!entries.some(e=>e.isIntersecting)||started)return;started=true;
 try{const T=await import('./vendor/three.module.min.js');init(T);}catch{host.classList.add('sculpture-fallback');}
 },{rootMargin:'300px'});observer.observe(host);
}
// The garbo: a perforated clay pot with a lamp inside, the vessel Garba is named after. Light escapes through its holes onto the wall behind.
function paintPot(T){
 const W=1024,H=512,color=document.createElement('canvas'),light=document.createElement('canvas');color.width=light.width=W;color.height=light.height=H;
 const c=color.getContext('2d'),l=light.getContext('2d');
 const clay=c.createLinearGradient(0,0,0,H);clay.addColorStop(0,'#6e2f12');clay.addColorStop(.45,'#a14d22');clay.addColorStop(1,'#62290e');c.fillStyle=clay;c.fillRect(0,0,W,H);
 for(let i=0;i<2600;i++){c.fillStyle=`rgba(${40+Math.random()*60},${15+Math.random()*20},5,${Math.random()*.12})`;c.fillRect(Math.random()*W,Math.random()*H,2,2);}
 l.fillStyle='#000';l.fillRect(0,0,W,H);
 const band=(y,h,fill)=>{c.fillStyle=fill;c.fillRect(0,y,W,h);};
 band(90,6,'#d9a441');band(182,5,'#d9a441');band(270,5,'#d9a441');band(432,6,'#d9a441');
 // Mirror-work dots and painted dot rows (canvas pixels are stretched ~1.8x horizontally around the lathe, so ellipses read as circles).
 const dot=(x,y,r,fill,ctx=c)=>{ctx.beginPath();ctx.ellipse(x,y,r/1.8,r,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();};
 for(let x=16;x<W;x+=32){dot(x,150,5,'#e8c26f');dot(x,150,2.2,'#fff3cf');dot(x+16,118,2.5,'#f6e2b8');dot(x,455,3,'#f6e2b8');}
 c.fillStyle='#f2d7a0';for(let x=0;x<W;x+=40){c.beginPath();c.moveTo(x,256);c.lineTo(x+20,212);c.lineTo(x+40,256);c.closePath();c.fill();}
 c.fillStyle='#8f3a17';for(let x=0;x<W;x+=40){c.beginPath();c.moveTo(x+10,256);c.lineTo(x+20,234);c.lineTo(x+30,256);c.closePath();c.fill();}
 for(let row=0,y=296;y<=414;row++,y+=22)for(let x=row%2?16:0;x<W;x+=32){
  dot(x,y,6.5,'#1a0701');
  const g=l.createRadialGradient(x,y,0,x,y,10);g.addColorStop(0,'#fff1c2');g.addColorStop(.35,'#ffb347');g.addColorStop(1,'#ff7a1a00');l.fillStyle=g;l.beginPath();l.ellipse(x,y,10/1.8,10,0,0,Math.PI*2);l.fill();
 }
 const map=new T.CanvasTexture(color),emissiveMap=new T.CanvasTexture(light);
 for(const t of [map,emissiveMap]){t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;t.anisotropy=4;}
 return {map,emissiveMap};
}
function paintWall(T){
 const S=1024,canvas=document.createElement('canvas');canvas.width=canvas.height=S;const ctx=canvas.getContext('2d');
 for(let r=70;r<500;r+=30){const n=Math.floor(Math.PI*2*r/34),fade=1-r/520;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(r/30)%2*.09,x=S/2+Math.cos(a)*r,y=S/2+Math.sin(a)*r,size=3+fade*5;const g=ctx.createRadialGradient(x,y,0,x,y,size*2.2);g.addColorStop(0,`rgba(255,214,140,${.9*fade})`);g.addColorStop(1,'rgba(255,150,40,0)');ctx.fillStyle=g;ctx.fillRect(x-size*2.2,y-size*2.2,size*4.4,size*4.4);}}
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;return t;
}
function init(T){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Three-dimensional garbo: a painted clay pot with a glowing lamp inside, its light shining through the holes, on a brass lotus beneath temple bells');host.append(renderer.domElement);host.classList.add('sculpture-ready');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(0,3.1,8.9);camera.lookAt(0,1.35,0);
 // A small studio environment gives the brass broad, coherent reflections.
 const studio=new T.Scene();studio.background=new T.Color(0x24160e);
 for(const [x,y,z,w,h,power] of [[-4,3,2,3,5,6],[4,4,-2,2,5,4],[0,6,0,5,3,3]]){const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(1,.82,.57).multiplyScalar(power),side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);}
 const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(studio,.04);scene.environment=env.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 scene.add(new T.HemisphereLight(0xffedc5,0x50200e,2.4));const key=new T.DirectionalLight(0xffe5b0,4.2);key.position.set(3,5,4);scene.add(key);const rim=new T.DirectionalLight(0xffc98a,3.2);rim.position.set(-4,2.5,-2);scene.add(rim);
 const gold=new T.MeshStandardMaterial({color:0xb98943,metalness:.88,roughness:.26,envMapIntensity:.65,side:T.DoubleSide});const pale=new T.MeshStandardMaterial({color:0xf1d19c,metalness:.55,roughness:.3,envMapIntensity:.6,side:T.DoubleSide});
 const group=new T.Group();scene.add(group);
 function lathe(points,material=gold){return new T.Mesh(new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),64),material);}

 // Light cast on the wall behind, as if escaping through the pot's holes.
 const wall=new T.Mesh(new T.PlaneGeometry(10.5,10.5),new T.MeshBasicMaterial({map:paintWall(T),transparent:true,opacity:.45,depthWrite:false}));wall.position.set(0,1.45,-3);scene.add(wall);

 // Brass lotus pedestal.
 const base=lathe([[0,0],[.8,0],[.85,.07],[.75,.16],[.4,.24],[.3,.35],[.3,.55],[.43,.62],[.45,.68],[0,.68]]);group.add(base);
 const petalGeometry=new T.BufferGeometry(),vertices=[],indices=[];
 for(let row=0;row<=20;row++){const u=row/20;for(let col=0;col<=12;col++){const v=col/6-1;vertices.push(v*.32*Math.sin(Math.PI*u),.35*u*u+.13*v*v*Math.sin(Math.PI*u),u*1.25);if(row<20&&col<12){const a=row*13+col;indices.push(a,a+13,a+1,a+1,a+13,a+14);}}}
 petalGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));petalGeometry.setIndex(indices);petalGeometry.computeVertexNormals();
 const petals=[];for(let layer=0;layer<2;layer++)for(let i=0;i<12;i++){const angle=i*Math.PI/6+layer*.26;const pivot=new T.Group();pivot.rotation.y=angle;pivot.position.y=.25+layer*.15;const petal=new T.Mesh(petalGeometry,layer?pale:gold);petal.scale.setScalar(layer?.82:1);petal.rotation.x=layer?-.2:.04;pivot.add(petal);group.add(pivot);petals.push({mesh:petal,base:petal.rotation.x,phase:i*.25+layer});}
 for(const [radius,y] of [[.78,.12],[.39,.58]]){const ring=new T.Mesh(new T.TorusGeometry(radius,.018,8,80),pale);ring.rotation.x=Math.PI/2;ring.position.y=y;group.add(ring);}

 // The garbo itself.
 const {map,emissiveMap}=paintPot(T);
 const clay=new T.MeshStandardMaterial({map,emissiveMap,emissive:0xffffff,emissiveIntensity:1.5,roughness:.8,metalness:.04,side:T.DoubleSide});
 const pot=lathe([[.3,0],[.5,.06],[.72,.28],[.84,.55],[.86,.78],[.78,1.02],[.6,1.2],[.4,1.3],[.3,1.36],[.31,1.44],[.36,1.5],[.33,1.53]],clay);
 pot.position.y=.62;pot.scale.setScalar(.95);group.add(pot);
 const mouth=new T.Mesh(new T.TorusGeometry(.345,.022,10,64),pale);mouth.rotation.x=Math.PI/2;mouth.position.y=.62+1.5*.95;group.add(mouth);
 const inner=new T.PointLight(0xff9a3c,6,4);inner.position.y=1.3;group.add(inner);

 const flameY=.62+1.53*.95;
 const flame=lathe([[0,0],[.07,.04],[.13,.14],[.11,.27],[.055,.42],[0,.65]],new T.MeshBasicMaterial({color:0xffbd45}));flame.position.y=flameY-.05;flame.scale.setScalar(.72);group.add(flame);
 const core=lathe([[0,0],[.045,.05],[.06,.15],[0,.34]],new T.MeshBasicMaterial({color:0xfff3c5}));core.position.set(0,flameY-.04,.06);core.scale.setScalar(.72);group.add(core);
 const glow=new T.PointLight(0xffa53c,4,5);glow.position.set(0,flameY+.4,.4);group.add(glow);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,207,105,.8)');gradient.addColorStop(.2,'rgba(255,148,30,.25)');gradient.addColorStop(1,'rgba(255,109,12,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending}));halo.position.set(0,flameY+.25,0);halo.scale.set(1.1,1.5,1);group.add(halo);

 const orbit=new T.Group();orbit.position.y=-.04;group.add(orbit);for(const radius of [1.45,1.58]){const ring=new T.Mesh(new T.TorusGeometry(radius,.006,6,96),gold);ring.rotation.x=Math.PI/2;orbit.add(ring);}
 const dustGeometry=new T.BufferGeometry(),dustPositions=new Float32Array(48*3);for(let i=0;i<48;i++){dustPositions[i*3]=Math.sin(i*2.4)*(1.1+i%4*.28);dustPositions[i*3+1]=(i*.137)%3.4;dustPositions[i*3+2]=Math.cos(i*2.4)*1.4;}dustGeometry.setAttribute('position',new T.BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeometry,new T.PointsMaterial({color:0xffd793,size:.028,transparent:true,opacity:.6,depthWrite:false}));scene.add(dust);
 const bells=[];for(const x of [-2.15,2.15]){const bellGroup=new T.Group();bellGroup.position.set(x,3.05,0);const bell=lathe([[0,-.55],[.12,-.55],[.17,-.42],[.19,-.2],[.3,-.02],[.31,.03],[.26,.07],[.13,-.09],[.08,-.3],[0,-.35]]);bell.rotation.z=Math.PI;bellGroup.add(bell);const chain=new T.Mesh(new T.CylinderGeometry(.014,.014,1.1,8),gold);chain.position.y=.52;bellGroup.add(chain);const clapper=new T.Mesh(new T.SphereGeometry(.06,12,8),gold);clapper.position.y=-.02;bellGroup.add(clapper);scene.add(bellGroup);bells.push(bellGroup);}
 for(const bell of bells){for(let i=0;i<12;i++){const link=new T.Mesh(new T.TorusGeometry(.025,.007,6,12),pale);link.position.y=.55+i*.05;link.rotation.y=i%2*Math.PI/2;bell.add(link);}const lip=new T.Mesh(new T.TorusGeometry(.29,.013,8,40),pale);lip.rotation.x=Math.PI/2;lip.position.y=-.015;bell.add(lip);}

 const paused=()=>{try{return localStorage.getItem('divi-motion')==='paused'}catch{return document.documentElement.classList.contains('motion-paused')}};
 let visible=false,raf=0,time=0,last=0,target=0,smoothed=0;
 function draw(now){raf=0;if(!visible||document.hidden)return;const still=paused();if(!still){const dt=Math.min((now-last)/1000,.05);time+=dt;smoothed+=(target-smoothed)*(1-Math.exp(-dt*4));
  group.rotation.y=Math.sin(time*.22)*.3+smoothed+time*.08;
  const flicker=Math.sin(time*7)*.5+Math.sin(time*13.3)*.3+Math.sin(time*23.7)*.2;
  flame.scale.set(.72*(1+flicker*.06),.72*(1+Math.sin(time*9)*.08),.72);flame.rotation.z=Math.sin(time*4)*.055;core.rotation.z=flame.rotation.z;core.scale.y=flame.scale.y;
  clay.emissiveIntensity=1.45+flicker*.28;inner.intensity=6+flicker*1.2;glow.intensity=4+flicker*.6;halo.material.opacity=.42+flicker*.07;
  wall.rotation.z=time*.035;wall.material.opacity=.42+flicker*.05;
  bells.forEach((b,i)=>b.rotation.z=Math.sin(time*.9+i)*.075);petals.forEach(p=>p.mesh.rotation.x=p.base+Math.sin(time*.45+p.phase)*.035);
  dust.rotation.y=time*.035;for(let i=0;i<48;i++)dustPositions[i*3+1]=((i*.137+time*.045)%3.4);dustGeometry.attributes.position.needsUpdate=true;}
  last=now;renderer.render(scene,camera);if(!still)raf=requestAnimationFrame(draw);}
 function resume(){if(raf)cancelAnimationFrame(raf);raf=0;last=performance.now();draw(last);}
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;resume();},{threshold:.05}).observe(host);
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();resume();}).observe(host);
 host.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!paused()){target=(e.clientX-host.getBoundingClientRect().left)/host.clientWidth*.5-.25;}});host.addEventListener('pointerleave',()=>{target=0;});
 window.addEventListener('divi:motion',resume);document.addEventListener('visibilitychange',resume);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(raf)cancelAnimationFrame(raf);host.classList.remove('sculpture-ready');});
}
