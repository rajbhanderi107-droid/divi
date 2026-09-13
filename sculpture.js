const host=document.querySelector('#divi-sculpture');
if(host){
 let started=false;
 const observer=new IntersectionObserver(async entries=>{if(!entries.some(e=>e.isIntersecting)||started)return;started=true;
 try{const T=await import('./vendor/three.module.min.js');init(T);}catch{host.classList.add('sculpture-fallback');}
 },{rootMargin:'1200px 0px'});observer.observe(host);
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
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Three-dimensional garbo: a painted clay pot with a glowing lamp inside, its light shining through the holes, on a brass lotus beneath temple bells');host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(0,2.8,7.8);camera.lookAt(0,1.35,0);
 // A small studio environment gives the brass broad, coherent reflections.
 const studio=new T.Scene();studio.background=new T.Color(0x24160e);
 for(const [x,y,z,w,h,power] of [[-4,3,2,3,5,6],[4,4,-2,2,5,4],[0,6,0,5,3,3]]){const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(1,.82,.57).multiplyScalar(power),side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);}
 const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(studio,.04);scene.environment=env.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 scene.add(new T.HemisphereLight(0xffedc5,0x50200e,1.25));const key=new T.DirectionalLight(0xffe5b0,3.2);key.position.set(3,5,4);scene.add(key);const rim=new T.DirectionalLight(0xffc98a,1.8);rim.position.set(-4,2.5,-2);scene.add(rim);
 const gold=new T.MeshStandardMaterial({color:0xb98943,metalness:.88,roughness:.26,envMapIntensity:.65,side:T.DoubleSide});const pale=new T.MeshStandardMaterial({color:0xf1d19c,metalness:.55,roughness:.3,envMapIntensity:.6,side:T.DoubleSide});
 const group=new T.Group();scene.add(group);
 function lathe(points,material=gold){return new T.Mesh(new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),64),material);}

 // Light cast on the wall behind, as if escaping through the pot's holes.
 const wall=new T.Mesh(new T.PlaneGeometry(10.5,10.5),new T.MeshStandardMaterial({color:0x25150e,roughness:1}));wall.position.set(0,1.45,-3);wall.receiveShadow=true;wall.visible=false;scene.add(wall);

 // Brass lotus pedestal.
 const base=lathe([[0,0],[.8,0],[.85,.07],[.75,.16],[.4,.24],[.3,.35],[.3,.55],[.43,.62],[.45,.68],[0,.68]]);group.add(base);
 const petalGeometry=new T.BufferGeometry(),vertices=[],indices=[];
 for(let row=0;row<=20;row++){const u=row/20;for(let col=0;col<=12;col++){const v=col/6-1;vertices.push(v*.32*Math.sin(Math.PI*u),.35*u*u+.13*v*v*Math.sin(Math.PI*u),u*1.25);if(row<20&&col<12){const a=row*13+col;indices.push(a,a+13,a+1,a+1,a+13,a+14);}}}
 petalGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));petalGeometry.setIndex(indices);petalGeometry.computeVertexNormals();
 const petals=[];for(let layer=0;layer<2;layer++)for(let i=0;i<12;i++){const angle=i*Math.PI/6+layer*.26;const pivot=new T.Group();pivot.rotation.y=angle;pivot.position.y=.25+layer*.15;const petal=new T.Mesh(petalGeometry,layer?pale:gold);petal.scale.setScalar(layer?.82:1);petal.rotation.x=layer?-.2:.04;pivot.add(petal);group.add(pivot);petals.push({mesh:petal,base:petal.rotation.x,phase:i*.25+layer});}
 for(const [radius,y] of [[.78,.12],[.39,.58]]){const ring=new T.Mesh(new T.TorusGeometry(radius,.018,8,80),pale);ring.rotation.x=Math.PI/2;ring.position.y=y;ring.userData.lotus=true;group.add(ring);}

 // The garbo itself.
 const {map,emissiveMap}=paintPot(T);
 const clay=new T.MeshStandardMaterial({map,emissiveMap,emissive:0xffffff,emissiveIntensity:1.5,roughness:.8,metalness:.04,side:T.DoubleSide});
 const grain=document.createElement('canvas');grain.width=grain.height=256;const grainCtx=grain.getContext('2d'),grainPixels=grainCtx.createImageData(256,256);for(let i=0;i<grainPixels.data.length;i+=4){const g=110+Math.random()*35;grainPixels.data.set([g,g,g,255],i);}grainCtx.putImageData(grainPixels,0,0);clay.bumpMap=new T.CanvasTexture(grain);clay.bumpMap.wrapS=clay.bumpMap.wrapT=T.RepeatWrapping;clay.bumpMap.repeat.set(8,4);clay.bumpScale=.006;clay.roughness=.91;clay.metalness=0;
 const pot=lathe([[.3,0],[.5,.06],[.72,.28],[.84,.55],[.86,.78],[.78,1.02],[.6,1.2],[.4,1.3],[.3,1.36],[.31,1.44],[.36,1.5],[.33,1.53]],clay);
 // Open mesh apertures: omitted faces expose the illuminated interior.
 const profile=new T.CatmullRomCurve3([[.3,0],[.5,.06],[.72,.28],[.84,.55],[.86,.78],[.78,1.02],[.6,1.2],[.4,1.3],[.3,1.36],[.31,1.44],[.36,1.5],[.33,1.53]].map(([r,y])=>new T.Vector3(r,y,0)));
 const shell=new T.LatheGeometry(profile.getPoints(128).map(p=>new T.Vector2(p.x,p.y)),256),uv=shell.attributes.uv,old=shell.index.array,faces=[];
 const edges=new Map();
 for(let i=0;i<old.length;i+=3){const a=old[i],b=old[i+1],c=old[i+2],u=(uv.getX(a)+uv.getX(b)+uv.getX(c))/3,v=(uv.getY(a)+uv.getY(b)+uv.getY(c))/3;const dx=((u*24)%1-.5)/.28,dy=((v*12)%1-.5)/.27;const hole=v>.24&&v<.59&&dx*dx+dy*dy<1;if(!hole){faces.push(a,b,c);for(const [x,y] of [[a,b],[b,c],[c,a]]){const k=Math.min(x,y)+','+Math.max(x,y);if(edges.has(k))edges.delete(k);else edges.set(k,[x,y]);}}}
 // A second clay skin and joined aperture edges give the vessel real wall thickness.
 const positions=Array.from(shell.attributes.position.array),normals=shell.attributes.normal,texcoords=Array.from(uv.array),count=shell.attributes.position.count,outer=faces.slice();
 for(let i=0;i<count;i++){positions.push(positions[i*3]-normals.getX(i)*.035,positions[i*3+1]-normals.getY(i)*.035,positions[i*3+2]-normals.getZ(i)*.035);texcoords.push(uv.getX(i),uv.getY(i));}
 for(let i=0;i<outer.length;i+=3)faces.push(outer[i+2]+count,outer[i+1]+count,outer[i]+count);
 for(const [a,b] of edges.values())faces.push(a,b,b+count,a,b+count,a+count);
 shell.setAttribute('position',new T.Float32BufferAttribute(positions,3));shell.setAttribute('uv',new T.Float32BufferAttribute(texcoords,2));shell.setIndex(faces);shell.computeVertexNormals();pot.geometry.dispose();pot.geometry=shell;clay.emissiveIntensity=0;
 pot.castShadow=true;pot.receiveShadow=true;
 const lamp=lathe([[0,0],[.17,.01],[.23,.08],[.27,.14],[.25,.16],[.18,.08],[0,.04]],gold);lamp.position.y=.86;group.add(lamp);
 const mirrors=new T.InstancedMesh(new T.CircleGeometry(.027,6),new T.MeshStandardMaterial({color:0xffedcb,metalness:1,roughness:.08,side:T.DoubleSide}),32),mirrorPose=new T.Object3D();for(let i=0;i<32;i++){const a=i*Math.PI/16;mirrorPose.position.set(Math.sin(a)*.735,1.56,Math.cos(a)*.735);mirrorPose.rotation.y=a;mirrorPose.updateMatrix();mirrors.setMatrixAt(i,mirrorPose.matrix);}group.add(mirrors);
 pot.position.y=.62;pot.scale.setScalar(.95);group.add(pot);
 const mouth=new T.Mesh(new T.TorusGeometry(.326,.026,16,96),clay);mouth.rotation.x=Math.PI/2;mouth.position.y=.62+1.5*.95;group.add(mouth);
 const inner=new T.PointLight(0xff9a3c,12,7);inner.position.y=1.23;inner.castShadow=true;inner.shadow.mapSize.set(512,512);inner.shadow.bias=-.0003;inner.shadow.normalBias=.008;group.add(inner);
 // Lamplight filling the vessel, seen through the apertures. Unlit, so shadows cannot darken it; hottest near the diya, flickering with the flame.
 const hearth=new T.Mesh(new T.SphereGeometry(1,48,32),new T.ShaderMaterial({side:T.BackSide,toneMapped:false,uniforms:{uFlicker:{value:0}},
  vertexShader:'varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float uFlicker;varying vec3 vPos;void main(){float heat=clamp(1.-distance(vPos,vec3(0.,-.6,0.))/2.3,0.,1.);vec3 col=mix(vec3(.78,.3,.07),vec3(1.,.66,.26),heat)+vec3(1.,.88,.6)*pow(heat,4.)*.5;gl_FragColor=vec4(col*(.92+uFlicker*.08),1.);}'}));
 hearth.position.y=1.2;hearth.scale.set(.72,.6,.72);group.add(hearth);
 hearth.onBeforeRender=()=>{const t=performance.now()/1000;hearth.material.uniforms.uFlicker.value=Math.sin(t*7)*.5+Math.sin(t*13.3)*.3+Math.sin(t*23.7)*.2;};

 const flameY=1.03;
 const flame=lathe([[0,0],[.07,.04],[.13,.14],[.11,.27],[.055,.42],[0,.65]],new T.MeshBasicMaterial({color:0xffbd45}));flame.position.y=flameY-.05;flame.scale.setScalar(.72);group.add(flame);
 const core=lathe([[0,0],[.045,.05],[.06,.15],[0,.34]],new T.MeshBasicMaterial({color:0xfff3c5}));core.position.set(0,flameY-.04,.06);core.scale.setScalar(.72);group.add(core);
 const glow=new T.PointLight(0xffa53c,.5,2);glow.position.set(0,flameY+.4,.4);group.add(glow);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,207,105,.8)');gradient.addColorStop(.2,'rgba(255,148,30,.25)');gradient.addColorStop(1,'rgba(255,109,12,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,opacity:.08,depthWrite:false,blending:T.AdditiveBlending}));halo.position.set(0,flameY+.25,0);halo.scale.set(.32,.5,1);group.add(halo);

 const orbit=new T.Group();orbit.position.y=-.04;group.add(orbit);for(const radius of [1.45,1.58]){const ring=new T.Mesh(new T.TorusGeometry(radius,.006,6,96),gold);ring.rotation.x=Math.PI/2;orbit.add(ring);}
 const dustGeometry=new T.BufferGeometry(),dustPositions=new Float32Array(48*3);for(let i=0;i<48;i++){dustPositions[i*3]=Math.sin(i*2.4)*(1.1+i%4*.28);dustPositions[i*3+1]=(i*.137)%3.4;dustPositions[i*3+2]=Math.cos(i*2.4)*1.4;}dustGeometry.setAttribute('position',new T.BufferAttribute(dustPositions,3));const dust=new T.Points(dustGeometry,new T.PointsMaterial({color:0xffd793,size:.028,transparent:true,opacity:.6,depthWrite:false}));scene.add(dust);
 const bells=[];for(const x of [-2.15,2.15]){const bellGroup=new T.Group();bellGroup.position.set(x,3.05,0);const bell=lathe([[0,-.55],[.12,-.55],[.17,-.42],[.19,-.2],[.3,-.02],[.31,.03],[.26,.07],[.13,-.09],[.08,-.3],[0,-.35]]);bell.rotation.z=Math.PI;bellGroup.add(bell);const chain=new T.Mesh(new T.CylinderGeometry(.014,.014,1.1,8),gold);chain.position.y=.52;bellGroup.add(chain);const clapper=new T.Mesh(new T.SphereGeometry(.06,12,8),gold);clapper.position.y=-.02;bellGroup.add(clapper);scene.add(bellGroup);bells.push(bellGroup);}
 for(const bell of bells){for(let i=0;i<12;i++){const link=new T.Mesh(new T.TorusGeometry(.025,.007,6,12),pale);link.position.y=.55+i*.05;link.rotation.y=i%2*Math.PI/2;bell.add(link);}const lip=new T.Mesh(new T.TorusGeometry(.29,.013,8,40),pale);lip.rotation.x=Math.PI/2;lip.position.y=-.015;bell.add(lip);}

 // Original Blender models, loaded only when the sculpture enters the viewport.
 import('./vendor/GLTFLoader.js').then(({GLTFLoader})=>{
  const loader=new GLTFLoader();
  // Blender models (scripts/build-divi-models.py). Each replaces its simple lathe stand-in once loaded; clay, wood and skin get a fine
  // object-space grain (colour and roughness) so they read as real material instead of smooth plastic.
  const grain=(material,scale,amount)=>{material.onBeforeCompile=s=>{
   s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGrain;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGrain=position;');
   s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGrain;float gHash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float gNoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(gHash(i),gHash(i+vec3(1,0,0)),f.x),mix(gHash(i+vec3(0,1,0)),gHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(gHash(i+vec3(0,0,1)),gHash(i+vec3(1,0,1)),f.x),mix(gHash(i+vec3(0,1,1)),gHash(i+vec3(1,1,1)),f.x),f.y),f.z);}')
    .replace('#include <color_fragment>','#include <color_fragment>\nfloat gn=gNoise(vGrain*'+scale.toFixed(1)+')*.55+gNoise(vGrain*'+(scale*5).toFixed(1)+')*.45;diffuseColor.rgb*='+(1-amount).toFixed(3)+'+gn*'+(amount*2).toFixed(3)+';')
    .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(gn-.5)*'+amount.toFixed(3)+',0.,1.);');
  };material.needsUpdate=true;};
  const [garboModel,lotusModel,dholModel,dandiyaModel,bellModel,diyaModel]=['garbo','lotus','dhol-2','dandiya-2','bell','diya'].map(name=>new URL('./assets/models/divi-'+name+'.glb',import.meta.url).href);
  // Scale a prop to a target size and stand it on the floor.
  const fit=(model,size,x,z,angle)=>{model.rotation.y=angle;const box=new T.Box3().setFromObject(model),dim=box.getSize(new T.Vector3());model.scale.setScalar(size/Math.max(dim.x,dim.y,dim.z));model.position.set(x,0,z);box.setFromObject(model);model.position.y-=box.min.y;};
  const load=(src,done)=>loader.load(src,gltf=>{gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});done(gltf.scene);resume();},undefined,()=>{});
  const named=(model,pattern,scale,amount)=>model.traverse(o=>{if(o.isMesh&&pattern.test(o.material?.name||''))grain(o.material,scale,amount);});
  load(garboModel,model=>{named(model,/terracotta/i,9,.16);model.position.y=.62;model.scale.setScalar(.95);pot.visible=mouth.visible=mirrors.visible=false;group.add(model);});
  load(lotusModel,model=>{model.traverse(o=>{if(o.isMesh)o.material.envMapIntensity=1.35;});base.visible=false;petals.forEach(p=>p.mesh.parent.visible=false);group.children.forEach(c=>{if(c.userData.lotus)c.visible=false;});group.add(model);});
  load(dholModel,model=>{named(model,/wood|skin/i,14,.12);fit(model,.92,1.6,.35,-.35);scene.add(model);});
  load(dandiyaModel,model=>{named(model,/lacquer/i,20,.06);fit(model,1.05,-1.55,.45,.25);scene.add(model);});
  load(bellModel,model=>{bells.forEach(b=>{b.children.forEach(c=>c.visible=false);const copy=model.clone();copy.scale.setScalar(.92);b.add(copy);});});
  load(diyaModel,model=>{model.scale.setScalar(.6);model.position.set(-.276,.86,0);lamp.visible=false;group.add(model);});
 }).catch(()=>{});
 const paused=()=>{return document.documentElement.classList.contains('motion-paused')||(matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('motion-enabled'))};
 let visible=false,raf=0,time=0,last=0,target=0,smoothed=0;
 function draw(now){raf=0;if(!visible||document.hidden)return;const still=paused();if(!still){const dt=Math.min((now-last)/1000,.05);time+=dt;smoothed+=(target-smoothed)*(1-Math.exp(-dt*4));
  group.rotation.y=smoothed*.45;
  const flicker=Math.sin(time*7)*.5+Math.sin(time*13.3)*.3+Math.sin(time*23.7)*.2;
  flame.scale.set(.72*(1+flicker*.13),.72*(1+Math.sin(time*9)*.19),.72);flame.rotation.z=Math.sin(time*4)*.12;core.rotation.z=flame.rotation.z;core.scale.y=flame.scale.y;
  inner.intensity=9+flicker*.65;glow.intensity=.5+flicker*.05;halo.material.opacity=.08+flicker*.01;
  wall.rotation.z=0;
  bells.forEach((b,i)=>b.rotation.z=Math.sin(time*.65+i)*.022);
  dust.rotation.y=time*.035;for(let i=0;i<48;i++)dustPositions[i*3+1]=((i*.137+time*.045)%3.4);dustGeometry.attributes.position.needsUpdate=true;}
  last=now;renderer.render(scene,camera);
  // Keep the painted lotus in place until the first 3D frame has actually been drawn, then crossfade to the canvas.
  if(!host.classList.contains('sculpture-ready'))requestAnimationFrame(()=>host.classList.add('sculpture-ready'));if(!still)raf=requestAnimationFrame(draw);}
 function resume(){if(raf)cancelAnimationFrame(raf);raf=0;last=performance.now();draw(last);}
 new IntersectionObserver(e=>{visible=e[0].isIntersecting;resume();},{threshold:.05}).observe(host);
 new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();resume();}).observe(host);
 host.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!paused()){target=(e.clientX-host.getBoundingClientRect().left)/host.clientWidth*.5-.25;}});host.addEventListener('pointerleave',()=>{target=0;});
 window.addEventListener('divi:motion',resume);document.addEventListener('visibilitychange',resume);renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(raf)cancelAnimationFrame(raf);host.classList.remove('sculpture-ready');});
}
