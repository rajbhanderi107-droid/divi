const host=document.querySelector('#divi-sculpture');
if(host){
 let started=false;
 const observer=new IntersectionObserver(async entries=>{if(!entries.some(e=>e.isIntersecting)||started)return;started=true;
 try{const T=await import('./vendor/three.module.min.js');init(T);}catch{host.classList.add('sculpture-fallback');}
 },{rootMargin:'300px'});observer.observe(host);
}
function init(T){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Three-dimensional brass diya on a sculpted lotus, surrounded by hanging temple bells');host.append(renderer.domElement);host.classList.add('sculpture-ready');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(0,2.8,7.9);camera.lookAt(0,.85,0);
 // A small studio environment gives the metal broad, coherent reflections.
 const studio=new T.Scene();studio.background=new T.Color(0x24160e);
 for(const [x,y,z,w,h,power] of [[-4,3,2,3,5,6],[4,4,-2,2,5,4],[0,6,0,5,3,3]]){const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(1,.82,.57).multiplyScalar(power),side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);}
 const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(studio,.04);scene.environment=env.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 scene.add(new T.HemisphereLight(0xffedc5,0x50200e,3));const key=new T.DirectionalLight(0xffe5b0,5);key.position.set(3,5,4);scene.add(key);const rim=new T.DirectionalLight(0xffffff,3);rim.position.set(-4,2,-2);scene.add(rim);
 const gold=new T.MeshStandardMaterial({color:0xb98943,metalness:.88,roughness:.26,envMapIntensity:.65});const pale=new T.MeshStandardMaterial({color:0xf1d19c,metalness:.55,roughness:.3,envMapIntensity:.6});
 const group=new T.Group();scene.add(group);
 function lathe(points,material=gold){return new T.Mesh(new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),64),material);}
 const base=lathe([[0,0],[.8,0],[.85,.07],[.75,.16],[.4,.24],[.3,.35],[.3,.55],[.43,.62],[.45,.68],[0,.68]]);group.add(base);
 const bowl=lathe([[0,.63],[.25,.65],[.55,.75],[.8,.95],[.96,1.12],[.99,1.2],[.94,1.23],[.88,1.12],[.74,.97],[.5,.83],[.2,.75],[0,.75]]);group.add(bowl);
 const petalGeometry=new T.BufferGeometry(),vertices=[],indices=[];
 for(let row=0;row<=20;row++){const u=row/20;for(let col=0;col<=12;col++){const v=col/6-1;vertices.push(v*.32*Math.sin(Math.PI*u),.35*u*u+.13*v*v*Math.sin(Math.PI*u),u*1.25);if(row<20&&col<12){const a=row*13+col;indices.push(a,a+13,a+1,a+1,a+13,a+14);}}}
 petalGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));petalGeometry.setIndex(indices);petalGeometry.computeVertexNormals();gold.side=T.DoubleSide;pale.side=T.DoubleSide;
 const petals=[];for(let layer=0;layer<2;layer++)for(let i=0;i<12;i++){const angle=i*Math.PI/6+layer*.26;const pivot=new T.Group();pivot.rotation.y=angle;pivot.position.y=.25+layer*.15;const petal=new T.Mesh(petalGeometry,layer?pale:gold);petal.scale.setScalar(layer?.82:1);petal.rotation.x=layer?-.2:.04;pivot.add(petal);group.add(pivot);petals.push({mesh:petal,base:petal.rotation.x,phase:i*.25+layer});}
 for(const [radius,y] of [[.96,1.19],[.78,.12],[.39,.58]]){const rim=new T.Mesh(new T.TorusGeometry(radius,.018,8,80),pale);rim.rotation.x=Math.PI/2;rim.position.y=y;group.add(rim);}
 const beads=new T.InstancedMesh(new T.SphereGeometry(.018,8,6),pale,80),dummy=new T.Object3D();for(let i=0;i<80;i++){const a=i*Math.PI/40;dummy.position.set(Math.cos(a)*.944,1.145,Math.sin(a)*.944);dummy.updateMatrix();beads.setMatrixAt(i,dummy.matrix);}group.add(beads);
 // Repeated raised leafwork follows the bowl, rather than using a flat decal.
 const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.quadraticCurveTo(.065,.085,0,.18);leafShape.quadraticCurveTo(-.065,.085,0,0);
 const leafGeometry=new T.ExtrudeGeometry(leafShape,{depth:.008,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:1,steps:1});
 for(let i=0;i<32;i++){const a=i*Math.PI/16;const leaf=new T.Mesh(leafGeometry,pale);leaf.position.set(Math.sin(a)*.82,.93,Math.cos(a)*.82);leaf.rotation.y=a;leaf.rotation.x=-.6;group.add(leaf);}
 const oil=new T.Mesh(new T.CircleGeometry(.82,64),new T.MeshStandardMaterial({color:0x562809,metalness:.25,roughness:.17}));oil.rotation.x=-Math.PI/2;oil.position.y=1.13;group.add(oil);
 const flame=lathe([[0,0],[.07,.04],[.13,.14],[.11,.27],[.055,.42],[0,.65]],new T.MeshBasicMaterial({color:0xffbd45}));flame.position.y=1.14;group.add(flame);
 const core=lathe([[0,0],[.045,.05],[.06,.15],[0,.34]],new T.MeshBasicMaterial({color:0xfff3c5}));core.position.set(0,1.15,.08);group.add(core);
 const glow=new T.PointLight(0xffa53c,5,5);glow.position.set(0,1.7,0);group.add(glow);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,207,105,.8)');gradient.addColorStop(.2,'rgba(255,148,30,.25)');gradient.addColorStop(1,'rgba(255,109,12,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending}));halo.position.set(0,1.48,0);halo.scale.set(1.2,1.6,1);group.add(halo);
 const orbit=new T.Group();orbit.position.y=-.04;group.add(orbit);for(const radius of [1.45,1.58]){const ring=new T.Mesh(new T.TorusGeometry(radius,.006,6,96),gold);ring.rotation.x=Math.PI/2;orbit.add(ring);}
 const dustGeometry=new T.BufferGeometry(),dustPositions=new Float32Array(36*3);for(let i=0;i<36;i++){dustPositions[i*3]=Math.sin(i*2.4)*(1.1+i%4*.28);dustPositions[i*3+1]=(i*.137)%2.8;dustPositions[i*3+2]=Math.cos(i*2.4)*1.4;}dustGeometry.setAttribute('position',new T.BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeometry,new T.PointsMaterial({color:0xffd793,size:.025,transparent:true,opacity:.55,depthWrite:false}));scene.add(dust);
 const bells=[];for(const x of [-2,2]){const bellGroup=new T.Group();bellGroup.position.set(x,2.4,0);const bell=lathe([[0,-.55],[.12,-.55],[.17,-.42],[.19,-.2],[.3,-.02],[.31,.03],[.26,.07],[.13,-.09],[.08,-.3],[0,-.35]]);bell.rotation.z=Math.PI;bellGroup.add(bell);const chain=new T.Mesh(new T.CylinderGeometry(.014,.014,1.1,8),gold);chain.position.y=.52;bellGroup.add(chain);const clapper=new T.Mesh(new T.SphereGeometry(.06,12,8),gold);clapper.position.y=-.02;bellGroup.add(clapper);scene.add(bellGroup);bells.push(bellGroup);}
 for(const bell of bells){for(let i=0;i<12;i++){const link=new T.Mesh(new T.TorusGeometry(.025,.007,6,12),pale);link.position.y=.55+i*.05;link.rotation.y=i%2*Math.PI/2;bell.add(link);}const lip=new T.Mesh(new T.TorusGeometry(.29,.013,8,40),pale);lip.rotation.x=Math.PI/2;lip.position.y=-.015;bell.add(lip);}
 const paused=()=>document.documentElement.classList.contains('motion-paused')||(matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('motion-enabled'));
 let visible=false,raf=0,time=0,last=0,target=0,smoothed=0;
 function draw(now){raf=0;if(!visible||document.hidden)return;const still=paused();if(!still){const dt=Math.min((now-last)/1000,.05);time+=dt;smoothed+=(target-smoothed)*(1-Math.exp(-dt*4));group.rotation.y=Math.sin(time*.22)*.25+smoothed;flame.scale.set(1+Math.sin(time*7)*.07,1+Math.sin(time*9)*.08,1);flame.rotation.z=Math.sin(time*4)*.055;core.rotation.z=flame.rotation.z;core.scale.y=flame.scale.y;halo.material.opacity=.4+Math.sin(time*5)*.08;glow.intensity=5+Math.sin(time*9)*.5;bells.forEach((b,i)=>b.rotation.z=Math.sin(time*.9+i)*.075);petals.forEach(p=>p.mesh.rotation.x=p.base+Math.sin(time*.45+p.phase)*.035);dust.rotation.y=time*.035;for(let i=0;i<36;i++)dustPositions[i*3+1]=((i*.137+time*.045)%2.8);dustGeometry.attributes.position.needsUpdate=true;}last=now;renderer.render(scene,camera);if(!still)raf=requestAnimationFrame(draw);}
 function resume(){if(raf)cancelAnimationFrame(raf);raf=0;last=performance.now();draw(last);}
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;resume();},{threshold:.05}).observe(host);
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();resume();}).observe(host);
 host.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!paused()){target=(e.clientX-host.getBoundingClientRect().left)/host.clientWidth*.4-.2;}});host.addEventListener('pointerleave',()=>{target=0;});
 window.addEventListener('divi:motion',resume);document.addEventListener('visibilitychange',resume);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(raf)cancelAnimationFrame(raf);host.classList.remove('sculpture-ready');});
}
