/*! Baron Builders preloader — drop-in, no dependencies.
 *  <script src="baron-loader.js"></script>  (put it first in <head>, synchronous)
 *  Options (data-* on the script tag):
 *    data-min="3.4"     minimum seconds on screen (lets the build finish)
 *    data-max="9"       hard cap in seconds, in case "load" never fires
 *    data-speed="2"     animation speed multiplier
 *    data-bg="#0b0c0e"  overlay background
 *  API: BaronLoader.hide()  ·  event: "baron:loaded" on document
 */
(function(){
'use strict';
if(window.BaronLoader||!document.documentElement)return;
var S=document.currentScript,D=function(k,d){return S&&S.dataset[k]?parseFloat(S.dataset[k]):d};
var MIN=D('min',3.4),MAX=D('max',9),SPEED=D('speed',2),BG=(S&&S.dataset.bg)||'#0b0c0e';
var NS='http://www.w3.org/2000/svg',TX=176.34,SC=2.6847,TW=318.6,VB='-26 -36 550.9 208.9',TEXT=[{"d":"<path transform=\"translate(-4.56 0)\" d=\"M36.08 56L4.56 56L4.56 0L34.48 0Q46.08 0 51.60 4.12Q57.12 8.24 57.12 14.64Q57.12 18.88 54.80 22.16Q52.80 24.96 49.44 26.72Q49.60 26.80 49.84 26.88Q54.56 28.72 57.16 32.20Q59.76 35.68 59.76 40.56Q59.76 47.84 53.72 51.92Q47.68 56 36.08 56M23.12 34L23.12 42.80L34.48 42.80Q37.60 42.80 39.16 41.68Q40.72 40.56 40.72 38.40Q40.72 36.24 39.16 35.12Q37.60 34 34.48 34L23.12 34M23.12 13.20L23.12 21.52L31.92 21.52Q35.12 21.52 36.60 20.44Q38.08 19.36 38.08 17.36Q38.08 15.28 36.60 14.24Q35.12 13.20 31.92 13.20M81.92 56L62.72 56L87.20 0L105.76 0L130.24 56L110.72 56L106.96 46.24L85.68 46.24L81.92 56M90.88 32.64L101.76 32.64L96.32 18.56M154.56 56L135.68 56L135.68 0L161.84 0Q174.72 0 181.44 5.68Q188.16 11.36 188.16 21.12Q188.16 27.60 185.04 32.24Q182.32 36.40 177.60 38.80L189.36 56L169.20 56L159.68 41.92L154.56 41.92L154.56 56M154.56 14.56L154.56 27.68L161.44 27.68Q165.36 27.68 167.24 25.92Q169.12 24.16 169.12 21.12Q169.12 18.08 167.24 16.32Q165.36 14.56 161.44 14.56M227.12 57.28Q220.24 57.28 214.44 55.12Q208.64 52.96 204.40 49Q200.16 45.04 197.80 39.68Q195.44 34.32 195.44 28Q195.44 21.60 197.80 16.28Q200.16 10.96 204.40 7Q208.64 3.04 214.44 0.88Q220.24-1.28 227.04-1.28Q233.92-1.28 239.68 0.88Q245.44 3.04 249.68 7Q253.92 10.96 256.28 16.28Q258.64 21.60 258.64 28Q258.64 34.32 256.28 39.68Q253.92 45.04 249.68 49Q245.44 52.96 239.68 55.12Q233.92 57.28 227.12 57.28M227.04 42Q229.68 42 231.96 41.04Q234.24 40.08 235.96 38.28Q237.68 36.48 238.64 33.88Q239.60 31.28 239.60 28Q239.60 24.72 238.64 22.12Q237.68 19.52 235.96 17.72Q234.24 15.92 231.96 14.96Q229.68 14 227.04 14Q224.40 14 222.12 14.96Q219.84 15.92 218.12 17.72Q216.40 19.52 215.44 22.12Q214.48 24.72 214.48 28Q214.48 31.28 215.44 33.88Q216.40 36.48 218.12 38.28Q219.84 40.08 222.12 41.04Q224.40 42 227.04 42M286.32 56L267.92 56L267.92 0L283.44 0L304.72 25.44L304.72 0L323.12 0L323.12 56L307.60 56L286.32 30.56\"/>","fill":"#ffffff"},{"d":"<path transform=\"translate(-3.26 0)\" d=\"M25.82 111.07L3.26 111.07L3.26 71L24.67 71Q32.97 71 36.92 73.95Q40.87 76.90 40.87 81.48Q40.87 84.51 39.21 86.86Q37.78 88.86 35.38 90.12Q35.49 90.18 35.66 90.23Q39.04 91.55 40.90 94.04Q42.76 96.53 42.76 100.02Q42.76 105.23 38.44 108.15Q34.12 111.07 25.82 111.07M16.54 95.33L16.54 101.63L24.67 101.63Q26.90 101.63 28.02 100.82Q29.14 100.02 29.14 98.48Q29.14 96.93 28.02 96.13Q26.90 95.33 24.67 95.33L16.54 95.33M16.54 80.45L16.54 86.40L22.84 86.40Q25.13 86.40 26.19 85.63Q27.25 84.85 27.25 83.42Q27.25 81.93 26.19 81.19Q25.13 80.45 22.84 80.45M68.41 111.99Q59.19 111.99 54.04 107.01Q48.89 102.03 48.89 93.04L48.89 71L62.40 71L62.40 92.64Q62.40 97.22 64.06 99.14Q65.72 101.05 68.52 101.05Q71.38 101.05 73.01 99.14Q74.65 97.22 74.65 92.64L74.65 71L87.93 71L87.93 93.04Q87.93 102.03 82.77 107.01Q77.62 111.99 68.41 111.99M109.34 111.07L95.83 111.07L95.83 71L109.34 71M149.18 111.07L117.58 111.07L117.58 71L131.09 71L131.09 100.59L149.18 100.59M174.36 111.07L154.61 111.07L154.61 71L174.36 71Q181.06 71 186.16 73.43Q191.25 75.87 194.11 80.33Q196.97 84.80 196.97 91.04Q196.97 97.22 194.11 101.71Q191.25 106.20 186.16 108.64Q181.06 111.07 174.36 111.07M168.12 81.53L168.12 100.54L173.79 100.54Q176.65 100.54 178.80 99.45Q180.95 98.36 182.15 96.22Q183.35 94.07 183.35 91.04Q183.35 87.94 182.15 85.83Q180.95 83.71 178.80 82.62Q176.65 81.53 173.79 81.53M236.93 111.07L203.62 111.07L203.62 71L236.19 71L236.19 81.19L216.90 81.19L216.90 85.88L233.84 85.88L233.84 95.61L216.90 95.61L216.90 100.88L236.93 100.88M257.37 111.07L243.86 111.07L243.86 71L262.58 71Q271.79 71 276.60 75.06Q281.41 79.13 281.41 86.11Q281.41 90.75 279.18 94.07Q277.23 97.05 273.85 98.76L282.27 111.07L267.84 111.07L261.03 101L257.37 101L257.37 111.07M257.37 81.42L257.37 90.81L262.29 90.81Q265.09 90.81 266.44 89.55Q267.79 88.29 267.79 86.11Q267.79 83.94 266.44 82.68Q265.09 81.42 262.29 81.42M303.16 111.99Q298.12 111.99 293.43 110.84Q288.74 109.70 285.70 107.86L290.05 98.02Q292.91 99.68 296.44 100.68Q299.96 101.68 303.28 101.68Q305.22 101.68 306.34 101.42Q307.45 101.17 307.97 100.68Q308.49 100.19 308.49 99.51Q308.49 98.42 307.28 97.79Q306.08 97.16 304.11 96.73Q302.13 96.30 299.78 95.82Q297.44 95.33 295.06 94.53Q292.69 93.73 290.71 92.41Q288.74 91.09 287.53 88.95Q286.33 86.80 286.33 83.59Q286.33 79.87 288.42 76.81Q290.51 73.75 294.66 71.92Q298.81 70.08 304.99 70.08Q309.06 70.08 313.01 70.94Q316.96 71.80 320.11 73.58L316.04 83.36Q313.06 81.88 310.29 81.13Q307.51 80.39 304.88 80.39Q302.93 80.39 301.79 80.73Q300.64 81.07 300.16 81.65Q299.67 82.22 299.67 82.91Q299.67 83.94 300.87 84.54Q302.07 85.14 304.05 85.54Q306.02 85.94 308.40 86.40Q310.77 86.86 313.12 87.66Q315.47 88.46 317.44 89.78Q319.42 91.09 320.62 93.21Q321.82 95.33 321.82 98.48Q321.82 102.14 319.73 105.20Q317.64 108.27 313.52 110.13Q309.40 111.99 303.16 111.99\"/>","fill":"#ff4b57"},{"d":"<path transform=\"translate(-1.29 0)\" d=\"M3.80 136.92L1.29 136.92L1.29 126.07L5.92 126.07Q8.18 126.07 9.44 127.12Q10.70 128.16 10.70 130.01Q10.70 131.22 10.12 132.09Q9.55 132.97 8.49 133.43Q8.48 133.43 8.48 133.45L10.90 136.92L8.18 136.92L6.11 133.90Q6.04 133.90 5.98 133.90L3.80 133.90L3.80 136.92M3.80 128.12L3.80 131.90L5.84 131.90Q7.01 131.90 7.58 131.39Q8.15 130.89 8.15 130.01Q8.15 129.11 7.58 128.61Q7.01 128.12 5.84 128.12M24.09 136.92L15.69 136.92L15.69 126.07L23.89 126.07L23.89 128.09L18.18 128.09L18.18 130.44L23.22 130.44L23.22 132.39L18.18 132.39L18.18 134.91L24.09 134.91M32.66 137.11Q31.36 137.11 30.17 136.76Q28.97 136.41 28.25 135.85L29.10 133.96Q29.80 134.46 30.75 134.77Q31.70 135.09 32.68 135.09Q33.42 135.09 33.88 134.94Q34.34 134.80 34.55 134.53Q34.77 134.27 34.77 133.93Q34.77 133.49 34.43 133.24Q34.09 132.98 33.53 132.82Q32.97 132.66 32.30 132.51Q31.63 132.36 30.95 132.15Q30.28 131.93 29.72 131.59Q29.16 131.25 28.81 130.69Q28.46 130.13 28.46 129.26Q28.46 128.33 28.97 127.57Q29.47 126.80 30.49 126.34Q31.50 125.88 33.04 125.88Q34.06 125.88 35.05 126.12Q36.04 126.36 36.80 126.85L36.03 128.75Q35.27 128.32 34.51 128.11Q33.75 127.90 33.02 127.90Q32.29 127.90 31.83 128.07Q31.36 128.24 31.16 128.51Q30.96 128.78 30.96 129.14Q30.96 129.56 31.30 129.81Q31.64 130.07 32.20 130.22Q32.76 130.38 33.43 130.53Q34.11 130.69 34.78 130.89Q35.45 131.09 36.01 131.43Q36.57 131.77 36.92 132.33Q37.27 132.89 37.27 133.74Q37.27 134.66 36.76 135.42Q36.24 136.18 35.23 136.64Q34.21 137.11 32.66 137.11M44.51 136.92L42 136.92L42 126.07L44.51 126.07M55.02 136.92L50.09 136.92L50.09 126.07L55.02 126.07Q56.79 126.07 58.14 126.74Q59.48 127.42 60.24 128.63Q61 129.84 61 131.50Q61 133.14 60.24 134.36Q59.48 135.57 58.14 136.25Q56.79 136.92 55.02 136.92M52.60 128.13L52.60 134.86L54.90 134.86Q55.98 134.86 56.78 134.45Q57.58 134.04 58.02 133.28Q58.46 132.52 58.46 131.50Q58.46 130.46 58.02 129.71Q57.58 128.95 56.78 128.54Q55.98 128.13 54.90 128.13M74.30 136.92L65.90 136.92L65.90 126.07L74.10 126.07L74.10 128.09L68.40 128.09L68.40 130.44L73.44 130.44L73.44 132.39L68.40 132.39L68.40 134.91L74.30 134.91M81.79 136.92L79.31 136.92L79.31 126.07L81.39 126.07L86.78 132.66L86.78 126.07L89.26 126.07L89.26 136.92L87.20 136.92L81.79 130.33M99.61 136.92L97.09 136.92L97.09 128.12L93.62 128.12L93.62 126.07L103.08 126.07L103.08 128.12L99.61 128.12M109.95 136.92L107.44 136.92L107.44 126.07L109.95 126.07M116.68 136.92L114.10 136.92L118.94 126.07L121.42 126.07L126.27 136.92L123.64 136.92L122.68 134.60L117.64 134.60L116.68 136.92M118.44 132.69L121.88 132.69L120.16 128.53M138.36 136.92L130.41 136.92L130.41 126.07L132.92 126.07L132.92 134.87L138.36 134.87M159.06 134.55Q158.54 134.55 158.10 134.29Q157.65 134.04 157.39 133.60Q157.13 133.15 157.13 132.58Q157.13 132.01 157.39 131.57Q157.65 131.14 158.10 130.88Q158.54 130.63 159.06 130.63Q159.59 130.63 160.03 130.88Q160.47 131.14 160.74 131.57Q161 132.01 161 132.58Q161 133.15 160.74 133.60Q160.47 134.04 160.03 134.29Q159.59 134.55 159.06 134.55M186.12 137.11Q184.86 137.11 183.79 136.70Q182.71 136.28 181.92 135.53Q181.13 134.77 180.69 133.74Q180.25 132.72 180.25 131.50Q180.25 130.27 180.69 129.25Q181.13 128.22 181.93 127.47Q182.73 126.71 183.79 126.30Q184.86 125.88 186.14 125.88Q187.55 125.88 188.68 126.37Q189.82 126.86 190.60 127.81L188.99 129.29Q188.43 128.66 187.75 128.34Q187.07 128.02 186.26 128.02Q185.50 128.02 184.86 128.27Q184.23 128.52 183.76 128.98Q183.30 129.45 183.04 130.08Q182.79 130.72 182.79 131.50Q182.79 132.27 183.04 132.91Q183.30 133.54 183.76 134.01Q184.23 134.47 184.86 134.72Q185.50 134.97 186.26 134.97Q187.07 134.97 187.75 134.65Q188.43 134.33 188.99 133.68L190.60 135.17Q189.82 136.11 188.68 136.61Q187.55 137.11 186.12 137.11M200.43 137.11Q199.14 137.11 198.05 136.69Q196.96 136.27 196.16 135.51Q195.36 134.75 194.92 133.73Q194.48 132.70 194.48 131.50Q194.48 130.29 194.92 129.26Q195.36 128.24 196.17 127.48Q196.97 126.72 198.06 126.30Q199.14 125.88 200.41 125.88Q201.70 125.88 202.78 126.30Q203.85 126.72 204.65 127.48Q205.45 128.24 205.90 129.26Q206.35 130.27 206.35 131.50Q206.35 132.70 205.90 133.74Q205.45 134.77 204.65 135.52Q203.85 136.27 202.78 136.69Q201.70 137.11 200.43 137.11M200.41 134.97Q201.14 134.97 201.75 134.72Q202.37 134.47 202.83 134.01Q203.30 133.54 203.55 132.91Q203.81 132.27 203.81 131.50Q203.81 130.72 203.55 130.08Q203.30 129.45 202.84 128.98Q202.38 128.52 201.76 128.27Q201.14 128.02 200.41 128.02Q199.68 128.02 199.07 128.27Q198.46 128.52 198 128.98Q197.53 129.45 197.27 130.08Q197.02 130.72 197.02 131.50Q197.02 132.25 197.27 132.90Q197.53 133.54 197.99 134.01Q198.44 134.47 199.06 134.72Q199.68 134.97 200.41 134.97M213.61 136.92L211.25 136.92L211.25 126.07L213.33 126.07L217.39 132.81L221.39 126.07L223.45 126.07L223.48 136.92L221.12 136.92L221.11 130.41L217.92 135.77L216.78 135.77L213.61 130.55M231.42 136.92L229.06 136.92L229.06 126.07L231.14 126.07L235.20 132.81L239.20 126.07L241.26 126.07L241.29 136.92L238.94 136.92L238.92 130.41L235.73 135.77L234.60 135.77L231.42 130.55M255.28 136.92L246.87 136.92L246.87 126.07L255.07 126.07L255.07 128.09L249.37 128.09L249.37 130.44L254.41 130.44L254.41 132.39L249.37 132.39L249.37 134.91L255.28 134.91M262.80 136.92L260.28 136.92L260.28 126.07L264.92 126.07Q267.18 126.07 268.44 127.12Q269.69 128.16 269.69 130.01Q269.69 131.22 269.12 132.09Q268.55 132.97 267.49 133.43Q267.48 133.43 267.48 133.45L269.89 136.92L267.18 136.92L265.11 133.90Q265.04 133.90 264.98 133.90L262.80 133.90L262.80 136.92M262.80 128.12L262.80 131.90L264.84 131.90Q266 131.90 266.58 131.39Q267.15 130.89 267.15 130.01Q267.15 129.11 266.58 128.61Q266 128.12 264.84 128.12M279.88 137.11Q278.62 137.11 277.55 136.70Q276.47 136.28 275.68 135.53Q274.89 134.77 274.45 133.74Q274.01 132.72 274.01 131.50Q274.01 130.27 274.45 129.25Q274.89 128.22 275.69 127.47Q276.49 126.71 277.55 126.30Q278.62 125.88 279.90 125.88Q281.31 125.88 282.44 126.37Q283.58 126.86 284.36 127.81L282.75 129.29Q282.19 128.66 281.51 128.34Q280.83 128.02 280.02 128.02Q279.26 128.02 278.62 128.27Q277.99 128.52 277.52 128.98Q277.06 129.45 276.80 130.08Q276.55 130.72 276.55 131.50Q276.55 132.27 276.80 132.91Q277.06 133.54 277.52 134.01Q277.99 134.47 278.62 134.72Q279.26 134.97 280.02 134.97Q280.83 134.97 281.51 134.65Q282.19 134.33 282.75 133.68L284.36 135.17Q283.58 136.11 282.44 136.61Q281.31 137.11 279.88 137.11M291.43 136.92L288.92 136.92L288.92 126.07L291.43 126.07M298.16 136.92L295.59 136.92L300.42 126.07L302.90 126.07L307.75 136.92L305.12 136.92L304.16 134.60L299.12 134.60L298.16 136.92M299.93 132.69L303.37 132.69L301.65 128.53M319.85 136.92L311.89 136.92L311.89 126.07L314.41 126.07L314.41 134.87L319.85 134.87\"/>","fill":"#ffffff"}];
var C={sc:'#f3f1ee',ss:'#c9c5be',tc:'#e0323e',ts:'#a01721',ws:'#101114',wt:'#ffffff',slab:'#f3f1ee'};
var clamp=function(x,a,b){a=a==null?0:a;b=b==null?1:b;return Math.min(b,Math.max(a,x))},lerp=function(a,b,t){return a+(b-a)*t};
var eOutBack=function(x){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
var eOutCubic=function(x){return 1-Math.pow(1-x,3)};
var eInOut=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
var el=function(n,a,p){var e=document.createElementNS(NS,n);for(var k in (a||{}))e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};

/* overlay */
var box=document.createElement('div');box.id='baron-loader';box.setAttribute('role','status');box.setAttribute('aria-label','Loading Baron Builders');
var css=document.createElement('style');
css.textContent='#baron-loader{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:'+BG+';transition:transform .8s cubic-bezier(.76,0,.24,1),opacity .3s linear .6s;will-change:transform}'
 +'#baron-loader.bl-out{transform:translateY(-100%);opacity:0;pointer-events:none}'
 +'#baron-loader svg{width:min(560px,84vw);height:auto;overflow:visible}'
 +'#baron-loader .bl-bar{position:absolute;left:50%;bottom:9vh;width:min(220px,44vw);height:2px;transform:translateX(-50%);background:rgba(255,255,255,.12);overflow:hidden;border-radius:2px}'
 +'#baron-loader .bl-bar i{display:block;height:100%;width:100%;background:#c41e2a;transform-origin:left;transform:scaleX(0)}'
 +'html.bl-lock,html.bl-lock body{overflow:hidden!important}';
(document.head||document.documentElement).appendChild(css);
document.documentElement.classList.add('bl-lock');

var svg=el('svg',{viewBox:VB,'aria-hidden':'true'});
var defs=el('defs',{},svg);
var grad=el('linearGradient',{id:'bl-sh',x1:0,y1:0,x2:1,y2:0},defs);
el('stop',{offset:0,'stop-color':'#fff','stop-opacity':0},grad);el('stop',{offset:.5,'stop-color':'#fff','stop-opacity':.55},grad);el('stop',{offset:1,'stop-color':'#fff','stop-opacity':0},grad);
var clipRect=function(id){var c=el('clipPath',{id:id,clipPathUnits:'userSpaceOnUse'},defs);return el('rect',{x:0,y:0,width:64,height:0},c)};

var TOWERS=[
 {id:'s',x0:9,x1:23,x2:30,yl:29,yr:20,ys:24,yb:48,top:20,N:6,t0:1.5,t1:4.2,fc:C.sc,sd:C.ss,wc:C.ws},
 {id:'t',x0:32,x1:46,x2:54,yl:16,yr:7,ys:12,yb:48,top:7,N:9,t0:1.9,t1:5.2,fc:C.tc,sd:C.ts,wc:C.wt}
];
var cl={};
TOWERS.forEach(function(w){w.maxH=w.yb-w.top;w.step=w.maxH/w.N;cl['f'+w.id]=clipRect('bl-cf'+w.id);cl['s'+w.id]=clipRect('bl-cs'+w.id);cl['x'+w.id]=clipRect('bl-cx'+w.id)});
function hAt(w,t){var u=clamp((t-w.t0)/(w.t1-w.t0));if(u>=1)return w.maxH;var f=u*w.N,i=Math.floor(f),fr=f-i,e=eOutBack(clamp(fr/.5));return Math.max(0,Math.min(w.maxH,(i+e)*w.step))}
var shapeClip=el('clipPath',{id:'bl-shape'},defs);
TOWERS.forEach(function(w){el('polygon',{points:w.x0+','+w.yb+' '+w.x0+','+w.yl+' '+w.x1+','+w.yr+' '+w.x1+','+w.yb},shapeClip);el('polygon',{points:w.x1+','+w.yb+' '+w.x1+','+w.yr+' '+w.x2+','+w.ys+' '+w.x2+','+w.yb},shapeClip)});
var tClip=[0,1,2].map(function(i){var c=el('clipPath',{id:'bl-ct'+i,clipPathUnits:'userSpaceOnUse'},defs);return el('rect',{x:-8,y:-12,width:0,height:170},c)});

var markWrap=el('g',{transform:'scale('+SC+') translate(-4 -5)'},svg);
var bounce=el('g',{},markWrap);
var frame=el('g',{transform:'translate(0 -1)'},bounce);
var slab=el('polygon',{points:'5,56 9,50 59,50 55,56',fill:C.slab},frame);
var scaf={};
TOWERS.forEach(function(w){var g=el('g',{'clip-path':'url(#bl-cx'+w.id+')',stroke:'#fff','stroke-width':.28,opacity:0,fill:'none','stroke-linecap':'round'},frame);scaf[w.id]=g;
 var xa=w.x0-1.2,xb=w.x1,xc=w.x2+1.2;
 [xa,xb,xc].forEach(function(x){el('line',{x1:x,y1:w.yb,x2:x,y2:w.top-3,opacity:.5},g)});
 for(var k=0;k<=w.N+1;k++){var y=w.yb-k*w.step;el('line',{x1:xa,y1:y,x2:xc,y2:y,opacity:.45},g);if(k<=w.N)el('line',{x1:xa,y1:y,x2:xb,y2:y-w.step,opacity:.3},g)}});
TOWERS.forEach(function(w){
 var gs=el('g',{'clip-path':'url(#bl-cs'+w.id+')'},frame);el('polygon',{points:w.x1+','+w.yb+' '+w.x1+','+w.yr+' '+w.x2+','+w.ys+' '+w.x2+','+w.yb,fill:w.sd},gs);
 var gf=el('g',{'clip-path':'url(#bl-cf'+w.id+')'},frame);el('polygon',{points:w.x0+','+w.yb+' '+w.x0+','+w.yl+' '+w.x1+','+w.yr+' '+w.x1+','+w.yb,fill:w.fc},gf)});
var wins=[],seed=11,rnd=function(){return(seed=(seed*16807)%2147483647)/2147483647};
TOWERS.forEach(function(w){var roof=function(x){return w.yl+(w.yr-w.yl)*(x-w.x0)/(w.x1-w.x0)},cw=1.9,ch=2.3,px=3.7,py=4.6,cols=Math.floor((w.x1-w.x0-4.4-cw)/px)+1;
 for(var r=0;r<15;r++){var y=w.yb-4.2-r*py;for(var c=0;c<cols;c++){var x=w.x0+2.2+c*px;if(y<roof(x)+3.4)continue;
  wins.push({e:el('rect',{x:x,y:y,width:cw,height:ch,rx:.3,fill:w.wc,opacity:0},frame),x:x,y:y,w:cw,h:ch,tw:w,ph:rnd()*6.28,blink:rnd()<.38})}}});
var sheenG=el('g',{'clip-path':'url(#bl-shape)'},frame);
var sheen=el('polygon',{points:'-14,60 -2,60 14,-4 2,-4',fill:'url(#bl-sh)',opacity:0},sheenG);
var crane=el('g',{opacity:0},frame),cs={stroke:'#cfcdc8','stroke-width':.3,'stroke-linecap':'round',fill:'none',opacity:.75};
var L=function(a,b,c,d,x){var o={x1:a,y1:b,x2:c,y2:d};for(var k in cs)o[k]=cs[k];for(var k2 in (x||{}))o[k2]=x[k2];return el('line',o,crane)};
L(57,50,57,-3);L(59.6,50,59.6,-3);
for(var y=50;y>-3;y-=3.2){L(57,y,59.6,y-3.2,{opacity:.5});L(59.6,y,57,y-3.2,{opacity:.2})}
L(58.3,-3,22,-3);L(58.3,-1.4,22,-1.4,{opacity:.5});for(var x=58;x>22;x-=4.2)L(x,-1.4,x-2.1,-3,{opacity:.4});
L(58.3,-3,64.5,-3);L(58.3,-5.8,58.3,-3);L(58.3,-5.8,22,-3,{opacity:.4});L(58.3,-5.8,64.5,-3,{opacity:.4});
el('rect',{x:62,y:-2.9,width:2.6,height:2.4,fill:'#6b6a66'},crane);el('rect',{x:55.2,y:-2.2,width:2,height:2.4,fill:'#86837c'},crane);
el('rect',{x:38,y:-3.2,width:2,height:1.8,fill:'#e0323e'},crane);
var cable=L(39,-1.4,39,30,{opacity:.8}),load=el('rect',{x:37.4,y:30,width:3.2,height:1.2,fill:'#e0323e'},crane),hook=el('rect',{x:38.4,y:29,width:1.2,height:1,fill:'#cfcdc8'},crane);
var textG=el('g',{transform:'translate('+TX+' 0)'},svg);
var tLines=TEXT.map(function(t,i){var o=el('g',{'clip-path':'url(#bl-ct'+i+')'},textG),inner=el('g',{fill:t.fill},o);inner.innerHTML=t.d;return inner});

var bar=document.createElement('div');bar.className='bl-bar';var barFill=document.createElement('i');bar.appendChild(barFill);
box.appendChild(svg);box.appendChild(bar);
(document.body||document.documentElement).appendChild(box);
if(!document.body)document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(box)});

var DONE=Math.max.apply(null,TOWERS.map(function(w){return w.t1}));
function render(t){
 var ps=eOutCubic(clamp((t-.1)/.9));slab.setAttribute('transform','translate('+(-70*(1-ps)).toFixed(2)+' 0)');slab.setAttribute('opacity',clamp(ps*2));
 var H={};
 TOWERS.forEach(function(w){var h=hAt(w,t),hs=hAt(w,t-.22);H[w.id]=h;
  var set=function(r,hh){r.setAttribute('y',w.yb-hh);r.setAttribute('height',hh+2)};
  set(cl['f'+w.id],h);set(cl['s'+w.id],hs);set(cl['x'+w.id],Math.min(w.maxH+4,h+w.step*2.2));
  scaf[w.id].setAttribute('opacity',(.9*clamp((t-.7)/.3)*(1-clamp((t-(w.t1+.5))/.7))).toFixed(3))});
 wins.forEach(function(o){var h=H[o.tw.id],s=eOutBack(clamp((h-(o.tw.yb-o.y-o.h*.6))/2.4)),cx=o.x+o.w/2,cy=o.y+o.h/2;
  o.e.setAttribute('transform','translate('+cx+' '+cy+') scale('+Math.max(0,s).toFixed(3)+') translate('+(-cx)+' '+(-cy)+')');
  var op=clamp(s*3)*.92;if(o.blink&&t>o.tw.t1+.9)op*=.35+.65*(.5+.5*Math.sin(t*1.25+o.ph));o.e.setAttribute('opacity',op.toFixed(3))});
 var tw=TOWERS[1];crane.setAttribute('opacity',(clamp((t-.6)/.4)*(1-clamp((t-(tw.t1+.7))/.8))).toFixed(3));
 var ty=Math.max(tw.yb-H.t-3.5,2),by;
 if(t<tw.t1+.35){var P=.78,ph=(((t-1.2)%P)+P)%P/P;by=ph<.5?lerp(45,ty,eInOut(ph/.5)):lerp(ty,45,eInOut((ph-.5)/.5));if(t<1.2)by=45}else by=lerp(ty,-.5,eInOut(clamp((t-tw.t1-.35)/.6)));
 cable.setAttribute('y2',by);load.setAttribute('y',by);hook.setAttribute('y',by-1);
 var sp=eInOut(clamp((t-DONE-.1)/1));sheen.setAttribute('transform','translate('+lerp(-10,78,sp).toFixed(2)+' 0)');sheen.setAttribute('opacity',sp>0&&sp<1?1:0);
 var bp=clamp((t-DONE)/.7),bs=1+.035*Math.sin(bp*Math.PI)*(1-bp);bounce.setAttribute('transform','translate(32 52) scale('+bs.toFixed(4)+') translate(-32 -52)');
 tLines.forEach(function(g,i){var p=eOutCubic(clamp((t-(DONE+.25+i*.17))/.85));tClip[i].setAttribute('width',(p*(TW+16)).toFixed(1));g.setAttribute('transform','translate('+((1-p)*-18).toFixed(2)+' 0)');g.setAttribute('opacity',clamp(p*3))})
}

/* lifecycle */
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var ready=document.readyState==='complete',t0=performance.now(),leaving=false,raf;
window.addEventListener('load',function(){ready=true});
function leave(){if(leaving)return;leaving=true;cancelAnimationFrame(raf);
 box.classList.add('bl-out');document.documentElement.classList.remove('bl-lock');
 var fin=function(){if(box.parentNode)box.parentNode.removeChild(box);if(css.parentNode)css.parentNode.removeChild(css);document.dispatchEvent(new Event('baron:loaded'))};
 box.addEventListener('transitionend',function h(e){if(e.propertyName==='transform'){box.removeEventListener('transitionend',h);fin()}});
 setTimeout(fin,1500)}
function tick(now){var real=(now-t0)/1000;render(real*SPEED);
 barFill.style.transform='scaleX('+clamp(real/MIN)+')';
 if((ready&&real>=MIN)||real>=MAX){leave();return}
 raf=requestAnimationFrame(tick)}
if(reduce){render(99);barFill.style.transform='scaleX(1)';var go=function(){setTimeout(leave,300)};ready?go():window.addEventListener('load',go)}
else raf=requestAnimationFrame(tick);
window.BaronLoader={hide:leave};
})();
