/* Extraccion de colores desde fotos y vista de daltonismo. */

function handleImageFile(file){
  if(!file)return;
  const img=new Image();
  img.onload=()=>{const cols=extractPaletteFromImage(img);renderExtracted(cols);showToast(cols.length+" colores extraídos");URL.revokeObjectURL(img.src);};
  img.onerror=()=>showToast("No se pudo leer la imagen");
  img.src=URL.createObjectURL(file);
}
function extractPaletteFromImage(img){
  // Achicamos la imagen para procesar pocos píxeles y agrupamos por color (cuantización simple).
  const c=document.createElement("canvas"),scale=Math.min(120/img.width,120/img.height,1);
  c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));
  const cx=c.getContext("2d");cx.drawImage(img,0,0,c.width,c.height);
  const data=cx.getImageData(0,0,c.width,c.height).data,buckets={};
  for(let i=0;i<data.length;i+=4){
    if(data[i+3]<125)continue;                       // ignora píxeles transparentes
    const r=data[i],g=data[i+1],b=data[i+2];
    const key=((r>>4)<<8)|((g>>4)<<4)|(b>>4);        // agrupa en bloques de color
    (buckets[key]||(buckets[key]=[0,0,0,0]));const bk=buckets[key];bk[0]+=r;bk[1]+=g;bk[2]+=b;bk[3]++;
  }
  const list=Object.values(buckets).map(b=>[Math.round(b[0]/b[3]),Math.round(b[1]/b[3]),Math.round(b[2]/b[3]),b[3]]).sort((a,b)=>b[3]-a[3]);
  const chosen=[];
  for(const col of list){
    if(chosen.length>=6)break;
    // Sólo sumamos colores suficientemente distintos a los ya elegidos.
    if(chosen.every(o=>Math.abs(o[0]-col[0])+Math.abs(o[1]-col[1])+Math.abs(o[2]-col[2])>60))chosen.push(col);
  }
  return chosen.map(c=>rgbToHex(c[0],c[1],c[2]));
}
function renderExtracted(cols){
  const wrap=document.getElementById("extracted-colors");wrap.innerHTML="";
  cols.forEach(hex=>{const d=document.createElement("div");d.className="quick-color";d.dataset.hex=hex;d.style.background=hex;d.title=hex+" — tocá para usar";d.addEventListener("click",()=>fromHex(hex));wrap.appendChild(d);});
}

// ── Simulación de daltonismo ───────────────────────────────────
// Matrices de aproximación (Viénot) para los tres tipos más comunes.
function renderCbPreview(){
  const sel=document.getElementById("cb-select"),strip=document.getElementById("cb-strip");
  if(!sel||!strip)return;
  const mode=sel.value,pal=generatePalette(H,S,L,currentHarmony);
  strip.innerHTML="";
  pal.forEach(c=>{const s=document.createElement("span");s.style.background=simulateCb(c.hex,mode);strip.appendChild(s);});
}

// ── Conexión de los botones de las funciones nuevas ────────────
