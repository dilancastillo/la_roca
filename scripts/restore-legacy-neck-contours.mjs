import fs from 'node:fs/promises';
import sharp from 'sharp';
// Vector contours recovered from original catalog thumbnails, not substitute models.
const base='apps/web/public/assets/catalog/blusa-antifluido-t180';
const original=await fs.readFile(`${base}/svg-clean/blouse-legacy-aros-neck.svg`,'utf8');
const body=original.match(/<path\b[^>]*\/>/s)[0].replace('class="st0"','fill="#1d1d1b"');
const models=[
 {file:15,name:'2018',left:116,right:203,top:7,polygon:[[113,4],[206,4],[205,46],[166,106],[147,106],[113,46]]},
 {file:17,name:'modelo-17',left:122,right:221,top:30,polygon:[[119,27],[224,27],[222,66],[194,88],[141,88],[120,66]]},
 {file:18,name:'modelo-18',left:120,right:206,top:25,polygon:[[117,22],[209,22],[209,75],[173,113],[111,123],[90,123],[90,115],[118,103]]},
];
function inside(x,y,p){let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function simplify(points,t=.28){if(points.length<3)return points;const a=points[0],b=points.at(-1),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);let max=0,k=0;for(let i=1;i<points.length-1;i++){const v=points[i],d=len?Math.abs(dy*v[0]-dx*v[1]+b[0]*a[1]-b[1]*a[0])/len:Math.hypot(v[0]-a[0],v[1]-a[1]);if(d>max){max=d;k=i}}return max>t?[...simplify(points.slice(0,k+1),t).slice(0,-1),...simplify(points.slice(k),t)]:[a,b];}
for(const m of models){
 const {data,info}=await sharp(`apps/web/public/assets/catalog/blusa-antifluido-t180-24263/necks/neck-model-${m.file}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height,mask=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;mask[y*w+x]=inside(x+.5,y+.5,m.polygon)&&data[i+3]>128&&(data[i]+data[i+1]+data[i+2])/3<180?1:0;}
 const edges=new Map();const add=(a,b)=>{const k=a.join(',');if(!edges.has(k))edges.set(k,[]);edges.get(k).push(b)};const black=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&mask[y*w+x];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(black(x,y)){if(!black(x,y-1))add([x,y],[x+1,y]);if(!black(x+1,y))add([x+1,y],[x+1,y+1]);if(!black(x,y+1))add([x+1,y+1],[x,y+1]);if(!black(x-1,y))add([x,y+1],[x,y]);}
 const loops=[];while(edges.size){const start=edges.keys().next().value;let key=start,pts=[start.split(',').map(Number)];do{const list=edges.get(key);if(!list?.length)break;const p=list.pop();if(!list.length)edges.delete(key);pts.push(p);key=p.join(',');}while(key!==start);if(pts.length>4){const mid=Math.floor(pts.length/2);pts=[...simplify(pts.slice(0,mid+1)).slice(0,-1),...simplify(pts.slice(mid))];loops.push(pts)}}
 const scale=315/(m.right-m.left),fmt=v=>Number(v.toFixed(2));
 const d=loops.map(p=>'M'+p.map(v=>`${fmt(379+(v[0]-m.left)*scale)},${fmt(144+(v[1]-m.top)*scale)}`).join('L')+'Z').join(' ');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><!-- Contour source: original catalog neck-model-${m.file}.png; legacy ${m.name}. --><g fill="#1d1d1b">${body}<path d="${d}" fill-rule="evenodd"/></g></svg>`;
 await fs.writeFile(`${base}/svg-clean/blouse-legacy-${m.name}-neck.svg`,svg);console.log(m.name,loops.length,d.length);
}
