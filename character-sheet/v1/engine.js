(function(){
"use strict";
const DIRECTIONS=["up","up-up-right","up-right","right-up-right","right","right-right-down","right-down","down-right-down","down","down-down-left","down-left","left-down-left","left","left-left-up","left-up","up-left-up"];
const app=document.getElementById("characterApp");
if(!app)return;
/* Read typography from the original Ash CSS, not from site-wide font guesses. */
function inheritAshTypography(){
 const probe=document.createElement("div");
 probe.setAttribute("aria-hidden","true");
 probe.style.cssText="position:fixed!important;left:-200vw!important;top:-200vh!important;width:1200px!important;height:1px!important;overflow:hidden!important;visibility:hidden!important;pointer-events:none!important";
 probe.innerHTML='<div class="stage stage-gaze" id="gaze"><header class="topbar"><div class="brand"><b data-font-role="brand">Ash</b><span data-font-role="small">CHARACTER PROFILE</span></div><nav class="ash-nav"><a data-font-role="nav">PROFILE</a></nav></header><section class="copy copy-right"><p class="eyebrow" data-font-role="eyebrow">ASH // PROFILE</p><h1 class="headline" data-font-role="headline">CHARACTER</h1><p class="valueprop" data-font-role="body">Sample description</p><div class="cta-row"><button class="cta" data-font-role="cta">INSPECT</button></div><div class="spec-strip"><div data-font-role="technical">CAPTURE SPEC</div></div></section></div><div class="details-wrap" id="details"><h2 class="tagline band-title" data-font-role="section">DETAILS</h2></div>';
 document.body.append(probe);
 const roles={brand:"brand",small:"label",nav:"tech",eyebrow:"tech",headline:"display",body:"font",cta:"cta",technical:"tech",section:"section"};
 const map={brand:"--cs-font-brand",label:"--cs-font-label",tech:"--cs-font-tech",display:"--cs-font-display",font:"--cs-font",cta:"--cs-font-cta",section:"--cs-font-section"};
 for(const [role,token] of Object.entries(roles)){
  const el=probe.querySelector('[data-font-role="'+role+'"]');
  if(!el)continue;
  const computed=getComputedStyle(el);
  const variable=map[token];
  if(variable&&computed.fontFamily)app.style.setProperty(variable,computed.fontFamily);
  if(role==="headline")app.style.setProperty("--cs-font-weight-headline",computed.fontWeight);
  if(role==="brand")app.style.setProperty("--cs-font-weight-brand",computed.fontWeight);
  if(role==="body")app.style.setProperty("--cs-font-weight-body",computed.fontWeight);
  if(role==="eyebrow")app.style.setProperty("--cs-font-weight-label",computed.fontWeight);
 }
 probe.remove();
}
inheritAshTypography();
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el;}
function section(id,cls){const el=node("section",cls);el.id=id;return el;}
function image(frame,desc){const el=node("img");el.alt=frame.alt||desc;el.decoding="async";el.draggable=false;el.src=frame.url;return el;}
function isUrl(value){try{const u=new URL(value);return u.protocol==="https:";}catch(e){return false;}}
function validate(c){
 const errors=[];
 if(!c||!c.id||!c.name||!c.gaze)return["Missing required character settings"];
 const g=c.gaze.frames;
 if(!Array.isArray(g)||g.length!==16)errors.push("Gaze must contain exactly 16 frames");
 else{
  if(new Set(g.map(f=>f.direction)).size!==16||DIRECTIONS.some(d=>!g.some(f=>f.direction===d)))errors.push("Gaze direction mapping incomplete");
  g.forEach(f=>{if(!isUrl(f.url))errors.push("Invalid gaze image URL: "+f.direction);});
 }
 if(c.turntable&&c.turntable.enabled){
  const f=c.turntable.frames;
  if(!Array.isArray(f)||f.length!==16||new Set(f.map(x=>x.yaw)).size!==16)errors.push("Turntable requires 16 distinct yaw frames");
  else f.forEach(x=>{if(!isUrl(x.url))errors.push("Invalid turntable frame URL");});
 }
 return errors;
}
function alertErrors(list){const box=node("div","cs-warning","Character configuration invalid: "+list.join("; "));box.setAttribute("role","alert");app.replaceChildren(box);}
const manifest=document.getElementById("characterManifest");
let cfg;
try{cfg=JSON.parse(manifest?manifest.textContent:"{}");}catch(err){alertErrors(["Malformed JSON character manifest"]);return;}
if(cfg.id==="new-character" && Array.isArray(cfg.gaze&&cfg.gaze.frames) && cfg.gaze.frames.length===16 && cfg.gaze.frames.every(f=>!f.url)){
 app.dataset.theme="custom";
 app.replaceChildren();
 const head=node("header","cs-header");
 const brand=node("a","cs-brand");brand.href="#starter";brand.append(node("strong","","NEW CHARACTER"),node("small","","CHARACTER SHEET STARTER"));head.append(brand);app.append(head);
 const hero=section("starter","cs-pane");
 const visual=node("div","cs-visual");
 const frame=node("div","cs-frame");frame.setAttribute("aria-label","Placeholder for the 16-direction character portrait");
 const label=node("div","cs-fallback","ADD 16 GAZE IMAGES TO YOUR CHARACTER MANIFEST");
 label.style.display="flex";label.style.border="1px dashed var(--cs-border)";
 frame.append(label);visual.append(frame);
 const copy=node("div","cs-copy");
 copy.append(node("p","cs-eyebrow","CHARACTER SHEET ENGINE // STARTER"),node("h1","cs-headline","READY FOR A NEW CHARACTER"),node("p","cs-description","This is an empty template, not a broken character sheet. Add 16 named gaze images, character information, and a skin in the characterManifest JSON to activate the interactive portrait."));
 hero.append(visual,copy);app.append(hero);
 const instructions=section("instructions","cs-section");
 instructions.append(node("p","cs-kicker","SETUP CHECKLIST"),node("h2","","WHAT TO ADD"));
 const grid=node("dl","cs-info-grid");
 [["01","Character name, biography, appearance"],["02","16 HTTPS gaze image URLs"],["03","Theme colors and typography"],["04","Optional 16-view turntable and studies"]].forEach(item=>{const cell=node("div","cs-info-item");cell.append(node("dt","",item[0]),node("dd","",item[1]));grid.append(cell);});
 instructions.append(grid);app.append(instructions);
 return;
}
const errors=validate(cfg);if(errors.length){alertErrors(errors);return;}
app.dataset.theme=cfg.theme||"custom";
app.dataset.character=cfg.id;
const tokenMap={background:"--cs-bg",surface:"--cs-surface",header:"--cs-header",text:"--cs-text",muted:"--cs-muted",headline:"--cs-ink",accent:"--cs-accent",border:"--cs-border",grid:"--cs-grid"};
if(cfg.skin){
 for(const [key,val] of Object.entries(cfg.skin)){
  if(!tokenMap[key]||typeof val!=="string")continue;
  const v=val.trim();
  if(/^#[0-9a-f]{3,8}$/i.test(v)||/^(rgb|rgba|hsl|hsla)\([0-9.,%\s]+\)$/i.test(v))app.style.setProperty(tokenMap[key],v);
 }
}
cfg.details=Array.isArray(cfg.details)?cfg.details:[];
cfg.gallery=Array.isArray(cfg.gallery)?cfg.gallery:[];
cfg.turntable=cfg.turntable||{enabled:false,frames:[]};
app.replaceChildren();
const header=node("header","cs-header");
const brand=node("a","cs-brand");brand.href="#gaze";
brand.append(node("strong","",cfg.name.toUpperCase()),node("small","","CHARACTER PROFILE"));
const nav=node("nav","cs-nav");nav.setAttribute("aria-label","Character navigation");
function navLink(label,to){const a=node("a","",label);a.href="#"+to;nav.append(a);}
navLink("Profile","gaze");
if(cfg.turntable.enabled)navLink("Appearance","turntable");
if(cfg.details.length)navLink("Details","details");
if(cfg.materials&&cfg.materials.length)navLink("Materials","materials");
if(cfg.poses&&cfg.poses.length)navLink("Poses","poses");
if(cfg.afterdark&&cfg.afterdark.length)navLink("Afterdark","afterdark");
if(cfg.gallery.length)navLink("Studies","studies");
header.append(brand,nav);app.append(header);
function descriptionPane(sectionName,eyebrow,title,paragraph,buttonLabel,buttonHref){
 const copy=node("div","cs-copy");
 copy.append(node("p","cs-eyebrow",cfg.name+" // "+eyebrow),node("h1","cs-headline",title),node("p","cs-description",paragraph));
 if(buttonHref){const row=node("div","cs-actions"),a=node("a","cs-button",buttonLabel);a.href="#"+buttonHref;row.append(a);copy.append(row);}
 return copy;
}
function visualFrame(cls,label){
 const outer=node("div","cs-visual "+cls),frame=node("div","cs-frame");
 frame.setAttribute("role","group");frame.setAttribute("aria-label",label);
 const fallback=node("div","cs-fallback","IMAGE UNAVAILABLE");fallback.setAttribute("role","status");
 outer.append(frame,fallback);
 return{outer,frame};
}
function applyFit(el,g){
 el.style.setProperty("--cs-scale",String(g.scale||1));
 el.style.setProperty("--cs-object-position",g.anchor||"center bottom");
 el.style.setProperty("--cs-transform-origin",g.anchor||"center bottom");
}
function preloadFrames(frames){
 if(!("Image" in window))return;
 const queue=frames.slice();let count=0;
 function next(){if(count>=3||!queue.length)return;count++;const entry=queue.shift(),img=new Image();img.onload=img.onerror=()=>{count--;next();};img.src=entry.url;}
 next();next();next();
}
function displayFrame(img,f,outer){
 if(!f)return;
 if(img.dataset.current===f.url)return;
 img.dataset.current=f.url;
 outer.dataset.error="false";
 img.onerror=()=>{if(img.dataset.current===f.url)outer.dataset.error="true";};
 img.onload=()=>{if(img.dataset.current===f.url)outer.dataset.error="false";};
 img.src=f.url;
}
const gaze=section("gaze","cs-pane");
const gazeVisual=visualFrame("cs-gaze","Interactive directional portrait of "+cfg.name);
applyFit(gazeVisual.frame,cfg.gaze);
gazeVisual.frame.tabIndex=0;
const gframes=new Map(cfg.gaze.frames.map(f=>[f.direction,f]));
const gimg=image(gframes.get(cfg.gaze.initial)||gframes.get("left"),"Portrait of "+cfg.name);
gazeVisual.frame.append(gimg);
const gCaption=node("figcaption","", "MOVE POINTER TO CHANGE GAZE");gazeVisual.outer.append(gCaption);
let currentDirection=cfg.gaze.initial||"left";
function setDirection(direction){
 const target=gframes.get(direction);if(!target)return;
 currentDirection=direction;displayFrame(gimg,target,gazeVisual.outer);
}
function pointerGaze(e){
 const rect=gazeVisual.frame.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const dx=(e.clientX-(rect.left+rect.width/2))/(rect.width/2);
 const dy=(e.clientY-(rect.top+rect.height/2))/(rect.height/2);
 if(Math.hypot(dx,dy)<.14)return;
 const angle=(Math.atan2(dx,-dy)+2*Math.PI)%(2*Math.PI);
 setDirection(DIRECTIONS[Math.round(angle/(Math.PI/8))%16]);
}
gazeVisual.frame.addEventListener("pointermove",pointerGaze);
gazeVisual.frame.addEventListener("pointerdown",pointerGaze);
gazeVisual.frame.addEventListener("keydown",e=>{
 const idx=DIRECTIONS.indexOf(currentDirection);
 if(e.key==="ArrowRight"||e.key==="ArrowDown"){e.preventDefault();setDirection(DIRECTIONS[(idx+1)%16]);}
 if(e.key==="ArrowLeft"||e.key==="ArrowUp"){e.preventDefault();setDirection(DIRECTIONS[(idx+15)%16]);}
});
gaze.append(gazeVisual.outer,descriptionPane("gaze","Profile",cfg.name.toUpperCase(),cfg.biography,cfg.turntable.enabled?"INSPECT APPEARANCE":(cfg.details.length?"EXPLORE DETAILS":null),cfg.turntable.enabled?"turntable":(cfg.details.length?"details":null)));
app.append(gaze);
preloadFrames(cfg.gaze.frames);
if(cfg.turntable.enabled){
 const turn=section("turntable","cs-pane");
 const tv=visualFrame("cs-turn","Drag to rotate "+cfg.name+" through 360 degrees");
 applyFit(tv.frame,cfg.turntable);
 tv.frame.tabIndex=0;
 const list=cfg.turntable.frames.slice().sort((a,b)=>a.yaw-b.yaw);
 let angle=cfg.turntable.initialYaw||0;
 const tImg=image(list[0],"Full-body turntable of "+cfg.name);
 tv.frame.append(tImg);
 const readout=node("figcaption","", "DRAG TO ROTATE");
 tv.outer.append(readout);
 const normalize=x=>(x%360+360)%360;
 function drawTurn(){
  const yaw=normalize(angle);
  const nearest=list.reduce((best,f)=>Math.abs((((f.yaw-yaw)+540)%360)-180)<Math.abs((((best.yaw-yaw)+540)%360)-180)?f:best,list[0]);
  displayFrame(tImg,nearest,tv.outer);
  readout.textContent="YAW "+nearest.yaw+"°  ·  DRAG TO ROTATE";
 }
 let pressed=false,lastX=0;
 tv.frame.addEventListener("pointerdown",e=>{pressed=true;lastX=e.clientX;tv.frame.setPointerCapture(e.pointerId);});
 tv.frame.addEventListener("pointermove",e=>{if(!pressed)return;angle+=((e.clientX-lastX)/Math.max(250,tv.frame.clientWidth))*360;lastX=e.clientX;drawTurn();});
 const stop=()=>{pressed=false;};
 tv.frame.addEventListener("pointerup",stop);tv.frame.addEventListener("pointercancel",stop);tv.frame.addEventListener("lostpointercapture",stop);
 tv.frame.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();angle+=(e.key==="ArrowRight"?1:-1)*(cfg.turntable.stepDegrees||22.5);drawTurn();}});
 const copy=descriptionPane("turntable","Appearance",cfg.headline,cfg.appearance,cfg.details.length?"VIEW DETAILS":null,cfg.details.length?"details":null);
 const hint=node("div","cs-readout","16 VIEWS · 360° YAW · "+(cfg.turntable.stepDegrees||22.5)+"° STEPS");
 copy.append(hint);
 turn.append(copy,tv.outer);app.append(turn);drawTurn();
 preloadFrames(list);
}
if(cfg.details.length){
 const details=section("details","cs-section");
 details.append(node("p","cs-kicker",cfg.name+" // CHARACTER DATA"),node("h2","","DETAILS"));
 const dl=node("dl","cs-info-grid");
 cfg.details.forEach(([key,value])=>{const wrap=node("div","cs-info-item");wrap.append(node("dt","",key),node("dd","",value));dl.append(wrap);});
 details.append(dl);app.append(details);
}
function addGallery(id,eyebrow,heading,items){
 if(!Array.isArray(items)||!items.length)return;
 const area=section(id,"cs-section");
 area.append(node("p","cs-kicker",cfg.name+" // "+eyebrow),node("h2","",heading));
 const gallery=node("div","cs-gallery");
 items.forEach((f,i)=>{if(!f||!isUrl(f.url))return;
  const figure=node("figure"),im=image(f,cfg.name+" study "+(i+1)),caption=node("figcaption","",f.alt||"STUDY "+String(i+1).padStart(2,"0"));
  im.loading="lazy";figure.append(im,caption);gallery.append(figure);
 });
 area.append(gallery);app.append(area);
}
if(cfg.materials&&cfg.materials.length){
 const mat=section("materials","cs-section");
 mat.append(node("p","cs-kicker",cfg.name+" // PALETTE & MATERIALS"),node("h2","","MATERIALS"));
 const dl=node("dl","cs-info-grid");
 cfg.materials.forEach(item=>{
  if(!Array.isArray(item)||item.length<2)return;
  const wrap=node("div","cs-info-item");
  wrap.append(node("dt","",item[0]),node("dd","",item[1]));dl.append(wrap);
 });
 mat.append(dl);app.append(mat);
}
addGallery("poses","BODY LANGUAGE","POSES",cfg.poses);
addGallery("afterdark","CINEMATIC STUDIES","AFTER DARK",cfg.afterdark);
if(cfg.gallery.length){
 const studies=section("studies","cs-section");
 studies.append(node("p","cs-kicker",cfg.name+" // ART & POSES"),node("h2","","STUDIES"));
 const gallery=node("div","cs-gallery");
 cfg.gallery.forEach((f,i)=>{const figure=node("figure"),im=image(f,cfg.name+" study "+(i+1)),caption=node("figcaption","",f.alt||"STUDY "+String(i+1).padStart(2,"0"));im.loading="lazy";figure.append(im,caption);gallery.append(figure);});
 studies.append(gallery);app.append(studies);
}
if(!cfg.sheets||cfg.sheets.enabled!==false)app.append(node("footer","cs-footer",(cfg.sheets&&cfg.sheets.caption)||cfg.name+" · QUEEN OF HEAVEN"));
window.characterSheetEngine={version:"1.0.0",characterId:cfg.id,validate:()=>validate(cfg),getCurrentGaze:()=>currentDirection};
})();