(()=>{var $m=Object.defineProperty;var $r=(i,e)=>()=>(i&&(e=i(i=0)),e);var Dc=(i,e)=>{for(var t in e)$m(i,t,{get:e[t],enumerable:!0})};var Br,Qo,$v,jv,Qv,ea,ts,pi,am,lm,Yu,qT,eM,tM,nM,iM,Zu,YT,ns=$r(()=>{(function(i){i.Unimplemented="UNIMPLEMENTED",i.Unavailable="UNAVAILABLE"})(Br||(Br={}));Qo=class extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}},$v=i=>{var e,t;return i!=null&&i.androidBridge?"android":!((t=(e=i==null?void 0:i.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},jv=i=>{let e=i.CapacitorCustomPlatform||null,t=i.Capacitor||{},n=t.Plugins=t.Plugins||{},s=()=>e!==null?e.name:$v(i),r=()=>s()!=="web",o=u=>{let d=c.get(u);return!!(d!=null&&d.platforms.has(s())||a(u))},a=u=>{var d;return(d=t.PluginHeaders)===null||d===void 0?void 0:d.find(f=>f.name===u)},l=u=>i.console.error(u),c=new Map,h=(u,d={})=>{let f=c.get(u);if(f)return console.warn(`Capacitor plugin "${u}" already registered. Cannot register plugins twice.`),f.proxy;let _=s(),v=a(u),p,m=async()=>(!p&&_ in d?p=typeof d[_]=="function"?p=await d[_]():p=d[_]:e!==null&&!p&&"web"in d&&(p=typeof d.web=="function"?p=await d.web():p=d.web),p),S=(b,F)=>{var P,U;if(v){let V=v==null?void 0:v.methods.find(q=>F===q.name);if(V)return V.rtype==="promise"?q=>t.nativePromise(u,F.toString(),q):(q,I)=>t.nativeCallback(u,F.toString(),q,I);if(b)return(P=b[F])===null||P===void 0?void 0:P.bind(b)}else{if(b)return(U=b[F])===null||U===void 0?void 0:U.bind(b);throw new Qo(`"${u}" plugin is not implemented on ${_}`,Br.Unimplemented)}},A=b=>{let F,P=(...U)=>{let V=m().then(q=>{let I=S(q,b);if(I){let N=I(...U);return F=N==null?void 0:N.remove,N}else throw new Qo(`"${u}.${b}()" is not implemented on ${_}`,Br.Unimplemented)});return b==="addListener"&&(V.remove=async()=>F()),V};return P.toString=()=>`${b.toString()}() { [capacitor code] }`,Object.defineProperty(P,"name",{value:b,writable:!1,configurable:!1}),P},T=A("addListener"),R=A("removeListener"),E=(b,F)=>{let P=T({eventName:b},F),U=async()=>{let q=await P;R({eventName:b,callbackId:q},F)},V=new Promise(q=>P.then(()=>q({remove:U})));return V.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await U()},V},x=new Proxy({},{get(b,F){switch(F){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return v?E:T;case"removeListener":return R;default:return A(F)}}});return n[u]=x,c.set(u,{name:u,proxy:x,platforms:new Set([...Object.keys(d),...v?[_]:[]])}),x};return t.convertFileSrc||(t.convertFileSrc=u=>u),t.getPlatform=s,t.handleError=l,t.isNativePlatform=r,t.isPluginAvailable=o,t.registerPlugin=h,t.Exception=Qo,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},Qv=i=>i.Capacitor=jv(i),ea=Qv(typeof globalThis!="undefined"?globalThis:typeof self!="undefined"?self:typeof window!="undefined"?window:typeof global!="undefined"?global:{}),ts=ea.registerPlugin,pi=class{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);let r=this.windowListeners[e];r&&!r.registered&&this.addWindowListener(r),n&&this.sendRetainedArgumentsForEvent(e);let o=async()=>this.removeListener(e,t);return Promise.resolve({remove:o})}async removeAllListeners(){this.listeners={};for(let e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){let s=this.listeners[e];if(!s){if(n){let r=this.retainedEventArguments[e];r||(r=[]),r.push(t),this.retainedEventArguments[e]=r}return}s.forEach(r=>r(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:n=>{this.notifyListeners(t,n)}}}unimplemented(e="not implemented"){return new ea.Exception(e,Br.Unimplemented)}unavailable(e="not available"){return new ea.Exception(e,Br.Unavailable)}async removeListener(e,t){let n=this.listeners[e];if(!n)return;let s=n.indexOf(t);this.listeners[e].splice(s,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){let t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(n=>{this.notifyListeners(e,n)}))}},am=i=>encodeURIComponent(i).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),lm=i=>i.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent),Yu=class extends pi{async getCookies(){let e=document.cookie,t={};return e.split(";").forEach(n=>{if(n.length<=0)return;let[s,r]=n.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");s=lm(s).trim(),r=lm(r).trim(),t[s]=r}),t}async setCookie(e){try{let t=am(e.key),n=am(e.value),s=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",r=(e.path||"/").replace("path=",""),o=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${n||""}${s}; path=${r}; ${o};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{let e=document.cookie.split(";")||[];for(let t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}},qT=ts("CapacitorCookies",{web:()=>new Yu}),eM=async i=>new Promise((e,t)=>{let n=new FileReader;n.onload=()=>{let s=n.result;e(s.indexOf(",")>=0?s.split(",")[1]:s)},n.onerror=s=>t(s),n.readAsDataURL(i)}),tM=(i={})=>{let e=Object.keys(i);return Object.keys(i).map(s=>s.toLocaleLowerCase()).reduce((s,r,o)=>(s[r]=i[e[o]],s),{})},nM=(i,e=!0)=>i?Object.entries(i).reduce((n,s)=>{let[r,o]=s,a,l;return Array.isArray(o)?(l="",o.forEach(c=>{a=e?encodeURIComponent(c):c,l+=`${r}=${a}&`}),l.slice(0,-1)):(a=e?encodeURIComponent(o):o,l=`${r}=${a}`),`${n}&${l}`},"").substr(1):null,iM=(i,e={})=>{let t=Object.assign({method:i.method||"GET",headers:i.headers},e),s=tM(i.headers)["content-type"]||"";if(typeof i.data=="string")t.body=i.data;else if(s.includes("application/x-www-form-urlencoded")){let r=new URLSearchParams;for(let[o,a]of Object.entries(i.data||{}))r.set(o,a);t.body=r.toString()}else if(s.includes("multipart/form-data")||i.data instanceof FormData){let r=new FormData;if(i.data instanceof FormData)i.data.forEach((a,l)=>{r.append(l,a)});else for(let a of Object.keys(i.data))r.append(a,i.data[a]);t.body=r;let o=new Headers(t.headers);o.delete("content-type"),t.headers=o}else(s.includes("application/json")||typeof i.data=="object")&&(t.body=JSON.stringify(i.data));return t},Zu=class extends pi{async request(e){let t=iM(e,e.webFetchExtra),n=nM(e.params,e.shouldEncodeUrlParams),s=n?`${e.url}?${n}`:e.url,r=await fetch(s,t),o=r.headers.get("content-type")||"",{responseType:a="text"}=r.ok?e:{};o.includes("application/json")&&(a="json");let l,c;switch(a){case"arraybuffer":case"blob":c=await r.blob(),l=await eM(c);break;case"json":l=await r.json();break;case"document":case"text":default:l=await r.text()}let h={};return r.headers.forEach((u,d)=>{h[d]=u}),{data:l,headers:h,status:r.status,url:r.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}},YT=ts("CapacitorHttp",{web:()=>new Zu})});var cm={};Dc(cm,{AppWeb:()=>Ku});var Ku,hm=$r(()=>{ns();Ku=class extends pi{constructor(){super(),this.handleVisibilityChange=()=>{let e={isActive:document.hidden!==!0};this.notifyListeners("appStateChange",e),document.hidden?this.notifyListeners("pause",null):this.notifyListeners("resume",null)},document.addEventListener("visibilitychange",this.handleVisibilityChange,!1)}exitApp(){throw this.unimplemented("Not implemented on web.")}async getInfo(){throw this.unimplemented("Not implemented on web.")}async getLaunchUrl(){return{url:""}}async getState(){return{isActive:document.hidden!==!0}}async minimizeApp(){throw this.unimplemented("Not implemented on web.")}async toggleBackButtonHandler(){throw this.unimplemented("Not implemented on web.")}}});var is,kr,Ju=$r(()=>{(function(i){i.Heavy="HEAVY",i.Medium="MEDIUM",i.Light="LIGHT"})(is||(is={}));(function(i){i.Success="SUCCESS",i.Warning="WARNING",i.Error="ERROR"})(kr||(kr={}))});var um={};Dc(um,{HapticsWeb:()=>$u});var $u,dm=$r(()=>{ns();Ju();$u=class extends pi{constructor(){super(...arguments),this.selectionStarted=!1}async impact(e){let t=this.patternForImpact(e==null?void 0:e.style);this.vibrateWithPattern(t)}async notification(e){let t=this.patternForNotification(e==null?void 0:e.type);this.vibrateWithPattern(t)}async vibrate(e){let t=(e==null?void 0:e.duration)||300;this.vibrateWithPattern([t])}async selectionStart(){this.selectionStarted=!0}async selectionChanged(){this.selectionStarted&&this.vibrateWithPattern([70])}async selectionEnd(){this.selectionStarted=!1}patternForImpact(e=is.Heavy){return e===is.Medium?[43]:e===is.Light?[20]:[61]}patternForNotification(e=kr.Success){return e===kr.Warning?[30,40,30,50,60]:e===kr.Error?[27,45,50]:[35,65,21]}vibrateWithPattern(e){if(navigator.vibrate)navigator.vibrate(e);else throw this.unavailable("Browser does not support the vibrate API")}}});var pm={};Dc(pm,{ScreenOrientationWeb:()=>ju});var ju,mm=$r(()=>{ns();ju=class extends pi{constructor(){super(),typeof screen!="undefined"&&typeof screen.orientation!="undefined"&&screen.orientation.addEventListener("change",()=>{let e=screen.orientation.type;this.notifyListeners("screenOrientationChange",{type:e})})}async orientation(){if(typeof screen=="undefined"||!screen.orientation)throw this.unavailable("ScreenOrientation API not available in this browser");return{type:screen.orientation.type}}async lock(e){if(typeof screen=="undefined"||!screen.orientation||!screen.orientation.lock)throw this.unavailable("ScreenOrientation API not available in this browser");try{await screen.orientation.lock(e.orientation)}catch{throw this.unavailable("ScreenOrientation API not available in this browser")}}async unlock(){if(typeof screen=="undefined"||!screen.orientation||!screen.orientation.unlock)throw this.unavailable("ScreenOrientation API not available in this browser");try{screen.orientation.unlock()}catch{throw this.unavailable("ScreenOrientation API not available in this browser")}}}});var Tf=0,xh=1,wf=2;var Fo=1,pl=2,Rr=3,li=0,Nt=1,Un=2,Ps=0,$i=1,Ls=2,yh=3,vh=4,Ef=5;var Ns=100,Af=101,Rf=102,Cf=103,If=104,Pf=200,Lf=201,Nf=202,Df=203,Mh=204,Sh=205,Uf=206,Of=207,Ff=208,Bf=209,kf=210,zf=211,Hf=212,Gf=213,Vf=214,Va=0,Wa=1,Xa=2,fr=3,qa=4,Ya=5,Za=6,Ka=7,ml=0,Wf=1,Xf=2,ci=0,bh=1,Th=2,wh=3,Bo=4,Eh=5,Ah=6,Rh=7,oh="attached",qf="detached",Ch=300,Ds=301,Cr=302,gl=303,_l=304,Ln=1e3,In=1001,pr=1002,Mt=1003,xl=1004;var Us=1005;var Pt=1006,Ir=1007;var On=1008;var xn=1009,Ih=1010,Ph=1011,Pr=1012,yl=1013,qn=1014,bn=1015,Yn=1016,vl=1017,Ml=1018,Os=1020,Lh=35902,Nh=35899,Dh=1021,Uh=1022,Fn=1023,Ti=1026,Ni=1027,Sl=1028,bl=1029,ji=1030,Tl=1031;var wl=1033,ko=33776,zo=33777,Ho=33778,Go=33779,El=35840,Al=35841,Rl=35842,Cl=35843,Il=36196,Pl=37492,Ll=37496,Nl=37488,Dl=37489,Vo=37490,Ul=37491,Ol=37808,Fl=37809,Bl=37810,kl=37811,zl=37812,Hl=37813,Gl=37814,Vl=37815,Wl=37816,Xl=37817,ql=37818,Yl=37819,Zl=37820,Kl=37821,Jl=36492,$l=36494,jl=36495,Ql=36283,ec=36284,Wo=36285,tc=36286;var vs=2300,Ms=2301,Ha=2302,ah=2303,lh=2400,ch=2401,hh=2402,Yf=2500;var Oh=0,Xo=1,Lr=2,Zf=3200;var qo=0,Kf=1,Di="",ot="srgb",cn="srgb-linear",fo="linear",nt="srgb";var Ga=7680;var Jf=519,$f=512,jf=513,Qf=514,Fh=515,ep=516,tp=517,Bh=518,kh=519,zh=35044;var Hh="300 es",Pn=2e3,mr=2001;function jm(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Qm(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function gr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function np(){let i=gr("canvas");return i.style.display="block",i}var Ud={},_r=null;function po(...i){let e="THREE."+i.shift();_r?_r("log",e,...i):console.log(e,...i)}function ip(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Re(...i){i=ip(i);let e="THREE."+i.shift();if(_r)_r("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ue(...i){i=ip(i);let e="THREE."+i.shift();if(_r)_r("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function ys(...i){let e=i.join(" ");e in Ud||(Ud[e]=!0,Re(...i))}function sp(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var rp={[Va]:Va,[Xa]:Za,[qa]:qa,[fr]:Ya,[Wa]:Wa,[Za]:Xa,[Ka]:Ka,[Ya]:fr},ni=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Od=1234567,ho=Math.PI/180,Ss=180/Math.PI;function hi(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Qt[i&255]+Qt[i>>8&255]+Qt[i>>16&255]+Qt[i>>24&255]+"-"+Qt[e&255]+Qt[e>>8&255]+"-"+Qt[e>>16&15|64]+Qt[e>>24&255]+"-"+Qt[t&63|128]+Qt[t>>8&255]+"-"+Qt[t>>16&255]+Qt[t>>24&255]+Qt[n&255]+Qt[n>>8&255]+Qt[n>>16&255]+Qt[n>>24&255]).toLowerCase()}function Ke(i,e,t){return Math.max(e,Math.min(t,i))}function Gh(i,e){return(i%e+e)%e}function eg(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function tg(i,e,t){return i!==e?(t-i)/(e-i):0}function uo(i,e,t){return(1-t)*i+t*e}function ng(i,e,t,n){return uo(i,e,1-Math.exp(-t*n))}function ig(i,e=1){return e-Math.abs(Gh(i,e*2)-e)}function sg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function rg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function og(i,e){return i+Math.floor(Math.random()*(e-i+1))}function ag(i,e){return i+Math.random()*(e-i)}function lg(i){return i*(.5-Math.random())}function cg(i){i!==void 0&&(Od=i);let e=Od+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function hg(i){return i*ho}function ug(i){return i*Ss}function dg(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function fg(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Vh(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function pg(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),_=o((n-e)/2);switch(s){case"XYX":i.set(a*h,l*u,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*_,l*f,a*c);break;case"YXY":i.set(l*f,a*h,l*_,a*c);break;case"ZYZ":i.set(l*_,l*f,a*h,a*c);break;default:Re("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function nc(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Wh(i,e){if(e.constructor===Float32Array)return i;let t=nc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Xh(i,e){if(e.constructor===Float32Array)return i;let t=nc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}var ic={DEG2RAD:ho,RAD2DEG:Ss,generateUUID:hi,clamp:Ke,euclideanModulo:Gh,mapLinear:eg,inverseLerp:tg,lerp:uo,damp:ng,pingpong:ig,smoothstep:sg,smootherstep:rg,randInt:og,randFloat:ag,randFloatSpread:lg,seededRandom:cg,degToRad:hg,radToDeg:ug,isPowerOfTwo:dg,ceilPowerOfTwo:fg,floorPowerOfTwo:Vh,setQuaternionFromProperEuler:pg,normalize:Xh,denormalize:Wh},Jh=class Jh{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Jh.prototype.isVector2=!0;var Oe=Jh,hn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[o+0],f=r[o+1],_=r[o+2],v=r[o+3];if(u!==v||l!==d||c!==f||h!==_){let p=l*d+c*f+h*_+u*v;p<0&&(d=-d,f=-f,_=-_,v=-v,p=-p);let m=1-a;if(p<.9995){let S=Math.acos(p),A=Math.sin(S);m=Math.sin(m*S)/A,a=Math.sin(a*S)/A,l=l*m+d*a,c=c*m+f*a,h=h*m+_*a,u=u*m+v*a}else{l=l*m+d*a,c=c*m+f*a,h=h*m+_*a,u=u*m+v*a;let S=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=S,c*=S,h*=S,u*=S}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],d=r[o+1],f=r[o+2],_=r[o+3];return e[t]=a*_+h*u+l*f-c*d,e[t+1]=l*_+h*d+c*u-a*f,e[t+2]=c*_+h*f+a*d-l*u,e[t+3]=h*_-a*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),d=l(n/2),f=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*_,this._y=c*f*u-d*h*_,this._z=c*h*_+d*f*u,this._w=c*h*u-d*f*_;break;case"YXZ":this._x=d*h*u+c*f*_,this._y=c*f*u-d*h*_,this._z=c*h*_-d*f*u,this._w=c*h*u+d*f*_;break;case"ZXY":this._x=d*h*u-c*f*_,this._y=c*f*u+d*h*_,this._z=c*h*_+d*f*u,this._w=c*h*u-d*f*_;break;case"ZYX":this._x=d*h*u-c*f*_,this._y=c*f*u+d*h*_,this._z=c*h*_-d*f*u,this._w=c*h*u+d*f*_;break;case"YZX":this._x=d*h*u+c*f*_,this._y=c*f*u+d*h*_,this._z=c*h*_-d*f*u,this._w=c*h*u-d*f*_;break;case"XZY":this._x=d*h*u-c*f*_,this._y=c*f*u-d*h*_,this._z=c*h*_+d*f*u,this._w=c*h*u+d*f*_;break;default:Re("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ke(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},$h=class $h{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Fd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Fd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Uc.copy(this).projectOnVector(e),this.sub(Uc)}reflect(e){return this.sub(Uc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};$h.prototype.isVector3=!0;var O=$h,Uc=new O,Fd=new hn,jh=class jh{constructor(e,t,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],_=n[8],v=s[0],p=s[3],m=s[6],S=s[1],A=s[4],T=s[7],R=s[2],E=s[5],x=s[8];return r[0]=o*v+a*S+l*R,r[3]=o*p+a*A+l*E,r[6]=o*m+a*T+l*x,r[1]=c*v+h*S+u*R,r[4]=c*p+h*A+u*E,r[7]=c*m+h*T+u*x,r[2]=d*v+f*S+_*R,r[5]=d*p+f*A+_*E,r[8]=d*m+f*T+_*x,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,_=t*u+n*d+s*f;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/_;return e[0]=u*v,e[1]=(s*c-h*n)*v,e[2]=(a*n-s*o)*v,e[3]=d*v,e[4]=(h*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return ys("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Oc.makeScale(e,t)),this}rotate(e){return ys("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Oc.makeRotation(-e)),this}translate(e,t){return ys("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Oc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};jh.prototype.isMatrix3=!0;var ke=jh,Oc=new ke,Bd=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),kd=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function mg(){let i={enabled:!0,workingColorSpace:cn,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===nt&&(s.r=bi(s.r),s.g=bi(s.g),s.b=bi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===nt&&(s.r=dr(s.r),s.g=dr(s.g),s.b=dr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Di?fo:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[cn]:{primaries:e,whitePoint:n,transfer:fo,toXYZ:Bd,fromXYZ:kd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:ot},outputColorSpaceConfig:{drawingBufferColorSpace:ot}},[ot]:{primaries:e,whitePoint:n,transfer:nt,toXYZ:Bd,fromXYZ:kd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:ot}}}),i}var Ye=mg();function bi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function dr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Zs,Ja=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement=="undefined")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Zs===void 0&&(Zs=gr("canvas")),Zs.width=e.width,Zs.height=e.height;let s=Zs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Zs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap){let t=gr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=bi(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(bi(t[n]/255)*255):t[n]=bi(t[n]);return{data:t,width:e.width,height:e.height}}else return Re("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},gg=0,xr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:gg++}),this.uuid=hi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement!="undefined"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame!="undefined"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Fc(s[o].image)):r.push(Fc(s[o]))}else r=Fc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Fc(i){return typeof HTMLImageElement!="undefined"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&i instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&i instanceof ImageBitmap?Ja.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Re("Texture: Unable to serialize Texture."),{})}var _g=0,Bc=new O,Lt=class i extends ni{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=In,s=In,r=Pt,o=On,a=Fn,l=xn,c=i.DEFAULT_ANISOTROPY,h=Di){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_g++}),this.uuid=hi(),this.name="",this.source=new xr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Bc).x}get height(){return this.source.getSize(Bc).y}get depth(){return this.source.getSize(Bc).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Re(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Re(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ch)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ln:e.x=e.x-Math.floor(e.x);break;case In:e.x=e.x<0?0:1;break;case pr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ln:e.y=e.y-Math.floor(e.y);break;case In:e.y=e.y<0?0:1;break;case pr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Lt.DEFAULT_IMAGE=null;Lt.DEFAULT_MAPPING=Ch;Lt.DEFAULT_ANISOTROPY=1;var Qh=class Qh{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],_=l[9],v=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(_-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(_+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(c+1)/2,T=(f+1)/2,R=(m+1)/2,E=(h+d)/4,x=(u+v)/4,b=(_+p)/4;return A>T&&A>R?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=E/n,r=x/n):T>R?T<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(T),n=E/s,r=b/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=x/r,s=b/r),this.set(n,s,r,t),this}let S=Math.sqrt((p-_)*(p-_)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(S)<.001&&(S=1),this.x=(p-_)/S,this.y=(u-v)/S,this.z=(d-h)/S,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this.w=Ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this.w=Ke(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Qh.prototype.isVector4=!0;var rt=Qh,$a=class extends ni{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new rt(0,0,e,t),this.scissorTest=!1,this.viewport=new rt(0,0,e,t),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new Lt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Pt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new xr(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Mn=class extends $a{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},mo=class extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Mt,this.minFilter=Mt,this.wrapR=In,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ja=class extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Mt,this.minFilter=Mt,this.wrapR=In,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var fl=class fl{constructor(e,t,n,s,r,o,a,l,c,h,u,d,f,_,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,u,d,f,_,v,p)}set(e,t,n,s,r,o,a,l,c,h,u,d,f,_,v,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=_,m[11]=v,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new fl().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Ks.setFromMatrixColumn(e,0).length(),r=1/Ks.setFromMatrixColumn(e,1).length(),o=1/Ks.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=o*h,f=o*u,_=a*h,v=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+_*c,t[5]=d-v*c,t[9]=-a*l,t[2]=v-d*c,t[6]=_+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*h,f=l*u,_=c*h,v=c*u;t[0]=d+v*a,t[4]=_*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-_,t[6]=v+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*h,f=l*u,_=c*h,v=c*u;t[0]=d-v*a,t[4]=-o*u,t[8]=_+f*a,t[1]=f+_*a,t[5]=o*h,t[9]=v-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*h,f=o*u,_=a*h,v=a*u;t[0]=l*h,t[4]=_*c-f,t[8]=d*c+v,t[1]=l*u,t[5]=v*c+d,t[9]=f*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,_=a*l,v=a*c;t[0]=l*h,t[4]=v-d*u,t[8]=_*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+_,t[10]=d-v*u}else if(e.order==="XZY"){let d=o*l,f=o*c,_=a*l,v=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+v,t[5]=o*h,t[9]=f*u-_,t[2]=_*u-f,t[6]=a*h,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(xg,e,yg)}lookAt(e,t,n){let s=this.elements;return yn.subVectors(e,t),yn.lengthSq()===0&&(yn.z=1),yn.normalize(),Gi.crossVectors(n,yn),Gi.lengthSq()===0&&(Math.abs(n.z)===1?yn.x+=1e-4:yn.z+=1e-4,yn.normalize(),Gi.crossVectors(n,yn)),Gi.normalize(),fa.crossVectors(yn,Gi),s[0]=Gi.x,s[4]=fa.x,s[8]=yn.x,s[1]=Gi.y,s[5]=fa.y,s[9]=yn.y,s[2]=Gi.z,s[6]=fa.z,s[10]=yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],_=n[2],v=n[6],p=n[10],m=n[14],S=n[3],A=n[7],T=n[11],R=n[15],E=s[0],x=s[4],b=s[8],F=s[12],P=s[1],U=s[5],V=s[9],q=s[13],I=s[2],N=s[6],H=s[10],B=s[14],ne=s[3],X=s[7],Y=s[11],ie=s[15];return r[0]=o*E+a*P+l*I+c*ne,r[4]=o*x+a*U+l*N+c*X,r[8]=o*b+a*V+l*H+c*Y,r[12]=o*F+a*q+l*B+c*ie,r[1]=h*E+u*P+d*I+f*ne,r[5]=h*x+u*U+d*N+f*X,r[9]=h*b+u*V+d*H+f*Y,r[13]=h*F+u*q+d*B+f*ie,r[2]=_*E+v*P+p*I+m*ne,r[6]=_*x+v*U+p*N+m*X,r[10]=_*b+v*V+p*H+m*Y,r[14]=_*F+v*q+p*B+m*ie,r[3]=S*E+A*P+T*I+R*ne,r[7]=S*x+A*U+T*N+R*X,r[11]=S*b+A*V+T*H+R*Y,r[15]=S*F+A*q+T*B+R*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],_=e[3],v=e[7],p=e[11],m=e[15],S=l*f-c*d,A=a*f-c*u,T=a*d-l*u,R=o*f-c*h,E=o*d-l*h,x=o*u-a*h;return t*(v*S-p*A+m*T)-n*(_*S-p*R+m*E)+s*(_*A-v*R+m*x)-r*(_*T-v*E+p*x)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],h=e[10];return t*(o*h-a*c)-n*(r*h-a*l)+s*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],_=e[12],v=e[13],p=e[14],m=e[15],S=t*a-n*o,A=t*l-s*o,T=t*c-r*o,R=n*l-s*a,E=n*c-r*a,x=s*c-r*l,b=h*v-u*_,F=h*p-d*_,P=h*m-f*_,U=u*p-d*v,V=u*m-f*v,q=d*m-f*p,I=S*q-A*V+T*U+R*P-E*F+x*b;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let N=1/I;return e[0]=(a*q-l*V+c*U)*N,e[1]=(s*V-n*q-r*U)*N,e[2]=(v*x-p*E+m*R)*N,e[3]=(d*E-u*x-f*R)*N,e[4]=(l*P-o*q-c*F)*N,e[5]=(t*q-s*P+r*F)*N,e[6]=(p*T-_*x-m*A)*N,e[7]=(h*x-d*T+f*A)*N,e[8]=(o*V-a*P+c*b)*N,e[9]=(n*P-t*V-r*b)*N,e[10]=(_*E-v*T+m*S)*N,e[11]=(u*T-h*E-f*S)*N,e[12]=(a*F-o*U-l*b)*N,e[13]=(t*U-n*F+s*b)*N,e[14]=(v*A-_*R-p*S)*N,e[15]=(h*R-u*A+d*S)*N,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,_=r*u,v=o*h,p=o*u,m=a*u,S=l*c,A=l*h,T=l*u,R=n.x,E=n.y,x=n.z;return s[0]=(1-(v+m))*R,s[1]=(f+T)*R,s[2]=(_-A)*R,s[3]=0,s[4]=(f-T)*E,s[5]=(1-(d+m))*E,s[6]=(p+S)*E,s[7]=0,s[8]=(_+A)*x,s[9]=(p-S)*x,s[10]=(1-(d+v))*x,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=Ks.set(s[0],s[1],s[2]).length(),a=Ks.set(s[4],s[5],s[6]).length(),l=Ks.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Hn.copy(this);let c=1/o,h=1/a,u=1/l;return Hn.elements[0]*=c,Hn.elements[1]*=c,Hn.elements[2]*=c,Hn.elements[4]*=h,Hn.elements[5]*=h,Hn.elements[6]*=h,Hn.elements[8]*=u,Hn.elements[9]*=u,Hn.elements[10]*=u,t.setFromRotationMatrix(Hn),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,s,r,o,a=Pn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s),_,v;if(l)_=r/(o-r),v=o*r/(o-r);else if(a===Pn)_=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===mr)_=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=Pn,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s),_,v;if(l)_=1/(o-r),v=o/(o-r);else if(a===Pn)_=-2/(o-r),v=-(o+r)/(o-r);else if(a===mr)_=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};fl.prototype.isMatrix4=!0;var Be=fl,Ks=new O,Hn=new Be,xg=new O(0,0,0),yg=new O(1,1,1),Gi=new O,fa=new O,yn=new O,zd=new Be,Hd=new hn,Nn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ke(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ke(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Re("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return zd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(zd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Hd.setFromEuler(this),this.setFromQuaternion(Hd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Nn.DEFAULT_ORDER="XYZ";var go=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},vg=0,Gd=new O,Js=new hn,gi=new Be,pa=new O,jr=new O,Mg=new O,Sg=new hn,Vd=new O(1,0,0),Wd=new O(0,1,0),Xd=new O(0,0,1),qd={type:"added"},bg={type:"removed"},$s={type:"childadded",child:null},kc={type:"childremoved",child:null},ut=class i extends ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:vg++}),this.uuid=hi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new O,t=new Nn,n=new hn,s=new O(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Be},normalMatrix:{value:new ke}}),this.matrix=new Be,this.matrixWorld=new Be,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new go,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Js.setFromAxisAngle(e,t),this.quaternion.multiply(Js),this}rotateOnWorldAxis(e,t){return Js.setFromAxisAngle(e,t),this.quaternion.premultiply(Js),this}rotateX(e){return this.rotateOnAxis(Vd,e)}rotateY(e){return this.rotateOnAxis(Wd,e)}rotateZ(e){return this.rotateOnAxis(Xd,e)}translateOnAxis(e,t){return Gd.copy(e).applyQuaternion(this.quaternion),this.position.add(Gd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Vd,e)}translateY(e){return this.translateOnAxis(Wd,e)}translateZ(e){return this.translateOnAxis(Xd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(gi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?pa.copy(e):pa.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),jr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?gi.lookAt(jr,pa,this.up):gi.lookAt(pa,jr,this.up),this.quaternion.setFromRotationMatrix(gi),s&&(gi.extractRotation(s.matrixWorld),Js.setFromRotationMatrix(gi),this.quaternion.premultiply(Js.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ue("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(qd),$s.child=e,this.dispatchEvent($s),$s.child=null):Ue("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(bg),kc.child=e,this.dispatchEvent(kc),kc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),gi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),gi.multiply(e.parent.matrixWorld)),e.applyMatrix4(gi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(qd),$s.child=e,this.dispatchEvent($s),$s.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(jr,e,Mg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(jr,Sg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),_=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),_.length>0&&(n.nodes=_)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};ut.DEFAULT_UP=new O(0,1,0);ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ht=class extends ut{constructor(){super(),this.isGroup=!0,this.type="Group"}},Tg={type:"move"},yr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ht,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ht,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ht,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let v of e.hand.values()){let p=t.getJointPose(v,n),m=this._getHandJoint(c,v);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,_=.005;c.inputState.pinching&&d>f+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Tg)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ht;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},op={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vi={h:0,s:0,l:0},ma={h:0,s:0,l:0};function zc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ae=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ot){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ye.workingColorSpace){if(e=Gh(e,1),t=Ke(t,0,1),n=Ke(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=zc(o,r,e+1/3),this.g=zc(o,r,e),this.b=zc(o,r,e-1/3)}return Ye.colorSpaceToWorking(this,s),this}setStyle(e,t=ot){function n(r){r!==void 0&&parseFloat(r)<1&&Re("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Re("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Re("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ot){let n=op[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Re("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bi(e.r),this.g=bi(e.g),this.b=bi(e.b),this}copyLinearToSRGB(e){return this.r=dr(e.r),this.g=dr(e.g),this.b=dr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ot){return Ye.workingToColorSpace(en.copy(this),e),Math.round(Ke(en.r*255,0,255))*65536+Math.round(Ke(en.g*255,0,255))*256+Math.round(Ke(en.b*255,0,255))}getHexString(e=ot){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.workingToColorSpace(en.copy(this),t);let n=en.r,s=en.g,r=en.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ye.workingColorSpace){return Ye.workingToColorSpace(en.copy(this),t),e.r=en.r,e.g=en.g,e.b=en.b,e}getStyle(e=ot){Ye.workingToColorSpace(en.copy(this),e);let t=en.r,n=en.g,s=en.b;return e!==ot?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Vi),this.setHSL(Vi.h+e,Vi.s+t,Vi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Vi),e.getHSL(ma);let n=uo(Vi.h,ma.h,t),s=uo(Vi.s,ma.s,t),r=uo(Vi.l,ma.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},en=new Ae;Ae.NAMES=op;var _o=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ae(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},bs=class extends ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Nn,this.environmentIntensity=1,this.environmentRotation=new Nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Gn=new O,_i=new O,Hc=new O,xi=new O,js=new O,Qs=new O,Yd=new O,Gc=new O,Vc=new O,Wc=new O,Xc=new rt,qc=new rt,Yc=new rt,Si=class i{constructor(e=new O,t=new O,n=new O){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Gn.subVectors(e,t),s.cross(Gn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Gn.subVectors(s,t),_i.subVectors(n,t),Hc.subVectors(e,t);let o=Gn.dot(Gn),a=Gn.dot(_i),l=Gn.dot(Hc),c=_i.dot(_i),h=_i.dot(Hc),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,_=(o*h-a*l)*d;return r.set(1-f-_,_,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,xi)===null?!1:xi.x>=0&&xi.y>=0&&xi.x+xi.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,xi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,xi.x),l.addScaledVector(o,xi.y),l.addScaledVector(a,xi.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Xc.setScalar(0),qc.setScalar(0),Yc.setScalar(0),Xc.fromBufferAttribute(e,t),qc.fromBufferAttribute(e,n),Yc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Xc,r.x),o.addScaledVector(qc,r.y),o.addScaledVector(Yc,r.z),o}static isFrontFacing(e,t,n,s){return Gn.subVectors(n,t),_i.subVectors(e,t),Gn.cross(_i).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Gn.subVectors(this.c,this.b),_i.subVectors(this.a,this.b),Gn.cross(_i).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;js.subVectors(s,n),Qs.subVectors(r,n),Gc.subVectors(e,n);let l=js.dot(Gc),c=Qs.dot(Gc);if(l<=0&&c<=0)return t.copy(n);Vc.subVectors(e,s);let h=js.dot(Vc),u=Qs.dot(Vc);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0&&l-h>0)return o=l/(l-h),t.copy(n).addScaledVector(js,o);Wc.subVectors(e,r);let f=js.dot(Wc),_=Qs.dot(Wc);if(_>=0&&f<=_)return t.copy(r);let v=f*c-l*_;if(v<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(n).addScaledVector(Qs,a);let p=h*_-f*u;if(p<=0&&u-h>=0&&f-_>=0)return Yd.subVectors(r,s),a=(u-h)/(u-h+(f-_)),t.copy(s).addScaledVector(Yd,a);let m=1/(p+v+d);return o=v*m,a=d*m,t.copy(n).addScaledVector(js,o).addScaledVector(Qs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},un=class{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Vn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Vn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Vn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Vn):Vn.fromBufferAttribute(r,o),Vn.applyMatrix4(e.matrixWorld),this.expandByPoint(Vn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ga.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ga.copy(n.boundingBox)),ga.applyMatrix4(e.matrixWorld),this.union(ga)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vn),Vn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Qr),_a.subVectors(this.max,Qr),er.subVectors(e.a,Qr),tr.subVectors(e.b,Qr),nr.subVectors(e.c,Qr),Wi.subVectors(tr,er),Xi.subVectors(nr,tr),ms.subVectors(er,nr);let t=[0,-Wi.z,Wi.y,0,-Xi.z,Xi.y,0,-ms.z,ms.y,Wi.z,0,-Wi.x,Xi.z,0,-Xi.x,ms.z,0,-ms.x,-Wi.y,Wi.x,0,-Xi.y,Xi.x,0,-ms.y,ms.x,0];return!Zc(t,er,tr,nr,_a)||(t=[1,0,0,0,1,0,0,0,1],!Zc(t,er,tr,nr,_a))?!1:(xa.crossVectors(Wi,Xi),t=[xa.x,xa.y,xa.z],Zc(t,er,tr,nr,_a))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(yi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),yi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),yi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),yi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),yi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),yi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),yi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),yi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(yi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},yi=[new O,new O,new O,new O,new O,new O,new O,new O],Vn=new O,ga=new un,er=new O,tr=new O,nr=new O,Wi=new O,Xi=new O,ms=new O,Qr=new O,_a=new O,xa=new O,gs=new O;function Zc(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){gs.fromArray(i,r);let a=s.x*Math.abs(gs.x)+s.y*Math.abs(gs.y)+s.z*Math.abs(gs.z),l=e.dot(gs),c=t.dot(gs),h=n.dot(gs);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Et=new O,ya=new Oe,wg=0,yt=class extends ni{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=zh,this.updateRanges=[],this.gpuType=bn,this.version=0,this._normalizationScale=e!==void 0?nc(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ya.fromBufferAttribute(this,t),ya.applyMatrix3(e),this.setXY(t,ya.x,ya.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix3(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix4(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyNormalMatrix(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.transformDirection(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Wh(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Xh(e,this.array)}};var xo=class extends yt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var yo=class extends yt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var vt=class extends yt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Eg=new un,eo=new O,Kc=new O,mn=class{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Eg.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;eo.subVectors(e,this.center);let t=eo.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(eo,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Kc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(eo.copy(e.center).add(Kc)),this.expandByPoint(eo.copy(e.center).sub(Kc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ag=0,Cn=new Be,Jc=new ut,ir=new O,vn=new un,to=new un,zt=new O,St=class i extends ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ag++}),this.uuid=hi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(jm(e)?yo:xo)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ke().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Cn.makeRotationFromQuaternion(e),this.applyMatrix4(Cn),this}rotateX(e){return Cn.makeRotationX(e),this.applyMatrix4(Cn),this}rotateY(e){return Cn.makeRotationY(e),this.applyMatrix4(Cn),this}rotateZ(e){return Cn.makeRotationZ(e),this.applyMatrix4(Cn),this}translate(e,t,n){return Cn.makeTranslation(e,t,n),this.applyMatrix4(Cn),this}scale(e,t,n){return Cn.makeScale(e,t,n),this.applyMatrix4(Cn),this}lookAt(e){return Jc.lookAt(e),Jc.updateMatrix(),this.applyMatrix4(Jc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ir).negate(),this.translate(ir.x,ir.y,ir.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new vt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Re("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new un);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];vn.setFromBufferAttribute(r),this.morphTargetsRelative?(zt.addVectors(this.boundingBox.min,vn.min),this.boundingBox.expandByPoint(zt),zt.addVectors(this.boundingBox.max,vn.max),this.boundingBox.expandByPoint(zt)):(this.boundingBox.expandByPoint(vn.min),this.boundingBox.expandByPoint(vn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ue('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new mn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){let n=this.boundingSphere.center;if(vn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];to.setFromBufferAttribute(a),this.morphTargetsRelative?(zt.addVectors(vn.min,to.min),vn.expandByPoint(zt),zt.addVectors(vn.max,to.max),vn.expandByPoint(zt)):(vn.expandByPoint(to.min),vn.expandByPoint(to.max))}vn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)zt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(zt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)zt.fromBufferAttribute(a,c),l&&(ir.fromBufferAttribute(e,c),zt.add(ir)),s=Math.max(s,n.distanceToSquared(zt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ue('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ue("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new yt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[],c=new Uint8Array(n.count);for(let F=0;F<n.count;F++)a[F]=new O,l[F]=new O;let h=new O,u=new O,d=new O,f=new Oe,_=new Oe,v=new Oe,p=new O,m=new O;function S(F,P,U){c[F]=c[P]=c[U]=1,h.fromBufferAttribute(n,F),u.fromBufferAttribute(n,P),d.fromBufferAttribute(n,U),f.fromBufferAttribute(r,F),_.fromBufferAttribute(r,P),v.fromBufferAttribute(r,U),u.sub(h),d.sub(h),_.sub(f),v.sub(f);let V=1/(_.x*v.y-v.x*_.y);isFinite(V)&&(p.copy(u).multiplyScalar(v.y).addScaledVector(d,-_.y).multiplyScalar(V),m.copy(d).multiplyScalar(_.x).addScaledVector(u,-v.x).multiplyScalar(V),a[F].add(p),a[P].add(p),a[U].add(p),l[F].add(m),l[P].add(m),l[U].add(m))}let A=this.groups;A.length===0&&(A=[{start:0,count:e.count}]);for(let F=0,P=A.length;F<P;++F){let U=A[F],V=U.start,q=U.count;for(let I=V,N=V+q;I<N;I+=3)S(e.getX(I+0),e.getX(I+1),e.getX(I+2))}let T=new O,R=new O,E=new O,x=new O;function b(F){E.fromBufferAttribute(s,F),x.copy(E);let P=a[F];T.copy(P),T.sub(E.multiplyScalar(E.dot(P))).normalize(),R.crossVectors(x,P);let V=R.dot(l[F])<0?-1:1;o.setXYZW(F,T.x,T.y,T.z,V)}for(let F=0,P=n.count;F<P;++F)c[F]&&b(F);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new yt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new O,r=new O,o=new O,a=new O,l=new O,c=new O,h=new O,u=new O;if(e)for(let d=0,f=e.count;d<f;d+=3){let _=e.getX(d+0),v=e.getX(d+1),p=e.getX(d+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,p),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,_),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)zt.fromBufferAttribute(e,t),zt.normalize(),e.setXYZ(t,zt.x,zt.y,zt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,_=0;for(let v=0,p=l.length;v<p;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*h;for(let m=0;m<h;m++)d[_++]=c[f++]}return new yt(d,h,u)}if(this.index===null)return Re("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ts=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=zh,this.updateRanges=[],this.version=0,this.uuid=hi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Zd(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Zd(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function Zd(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=hi()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}var ln=new O,Zi=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s,this._normalizationScale=e!==void 0?nc(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyMatrix4(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyNormalMatrix(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.transformDirection(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){po("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new yt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){po("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Wh(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Xh(e,this.data.array)}},$c=new O,Rg=new O,Cg=new ke,Wn=class{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=$c.subVectors(n,t).cross(Rg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta($c),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Cg.getNormalMatrix(e),s=this.coplanarPoint($c).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Ig=0,tn=class extends ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ig++}),this.uuid=hi(),this.name="",this.type="Material",this.blending=$i,this.side=li,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Mh,this.blendDst=Sh,this.blendEquation=Ns,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ae(0,0,0),this.blendAlpha=0,this.depthFunc=fr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Jf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ga,this.stencilZFail=Ga,this.stencilZPass=Ga,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Re(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Re(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ae().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Wn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Oe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Oe().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},vr=class extends tn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},sr,no=new O,rr=new O,or=new O,ar=new Oe,io=new Oe,ap=new Be,va=new O,so=new O,Ma=new O,Kd=new Oe,jc=new Oe,Jd=new Oe,vo=class extends ut{constructor(e=new vr){if(super(),this.isSprite=!0,this.type="Sprite",sr===void 0){sr=new St;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ts(t,5);sr.setIndex([0,1,2,0,2,3]),sr.setAttribute("position",new Zi(n,3,0,!1)),sr.setAttribute("uv",new Zi(n,2,3,!1))}this.geometry=sr,this.material=e,this.center=new Oe(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&Ue('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),rr.setFromMatrixScale(this.matrixWorld),ap.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),or.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&rr.multiplyScalar(-or.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let o=this.center;Sa(va.set(-.5,-.5,0),or,o,rr,s,r),Sa(so.set(.5,-.5,0),or,o,rr,s,r),Sa(Ma.set(.5,.5,0),or,o,rr,s,r),Kd.set(0,0),jc.set(1,0),Jd.set(1,1);let a=e.ray.intersectTriangle(va,so,Ma,!1,no);if(a===null&&(Sa(so.set(-.5,.5,0),or,o,rr,s,r),jc.set(0,1),a=e.ray.intersectTriangle(va,Ma,so,!1,no),a===null))return;let l=e.ray.origin.distanceTo(no);l<e.near||l>e.far||t.push({distance:l,point:no.clone(),uv:Si.getInterpolation(no,va,so,Ma,Kd,jc,Jd,new Oe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){let t=super.toJSON(e);return t.object.center=this.center.toArray(),t}};function Sa(i,e,t,n,s,r){ar.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(io.x=r*ar.x-s*ar.y,io.y=s*ar.x+r*ar.y):io.copy(ar),i.copy(e),i.x+=io.x,i.y+=io.y,i.applyMatrix4(ap)}var vi=new O,Qc=new O,ba=new O,Ta=new O,ws=class{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,vi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=vi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(vi.copy(this.origin).addScaledVector(this.direction,t),vi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Qc.copy(e).add(t).multiplyScalar(.5),ba.copy(t).sub(e).normalize(),Ta.copy(this.origin).sub(Qc);let r=e.distanceTo(t)*.5,o=-this.direction.dot(ba),a=Ta.dot(this.direction),l=-Ta.dot(ba),c=Ta.lengthSq(),h=Math.abs(1-o*o),u,d,f,_;if(h>0)if(u=o*l-a,d=o*a-l,_=r*h,u>=0)if(d>=-_)if(d<=_){let v=1/h;u*=v,d*=v,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-_?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=_?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Qc).addScaledVector(ba,d),f}intersectSphere(e,t){if(e.radius<0)return null;vi.subVectors(e.center,this.origin);let n=vi.dot(this.direction),s=vi.dot(vi)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,vi)!==null}intersectTriangle(e,t,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=e.x-o.x,d=e.y-o.y,f=e.z-o.z,_=t.x-o.x,v=t.y-o.y,p=t.z-o.z,m=n.x-o.x,S=n.y-o.y,A=n.z-o.z,T=Math.abs(l),R=Math.abs(c),E=Math.abs(h),x,b,F,P,U,V,q,I,N,H,B,ne;if(T>=R&&T>=E?(F=l,V=u,N=_,ne=m,l>=0?(x=c,b=h,P=d,U=f,q=v,I=p,H=S,B=A):(x=h,b=c,P=f,U=d,q=p,I=v,H=A,B=S)):R>=E?(F=c,V=d,N=v,ne=S,c>=0?(x=h,b=l,P=f,U=u,q=p,I=_,H=A,B=m):(x=l,b=h,P=u,U=f,q=_,I=p,H=m,B=A)):(F=h,V=f,N=p,ne=A,h>=0?(x=l,b=c,P=u,U=d,q=_,I=v,H=m,B=S):(x=c,b=l,P=d,U=u,q=v,I=_,H=S,B=m)),F===0)return null;let X=x/F,Y=b/F,ie=1/F,Me=P-X*V,He=U-Y*V,$=q-X*N,_e=I-Y*N,Se=H-X*ne,Pe=B-Y*ne,xe=Se*_e-Pe*$,Ve=Me*Pe-He*Se,Tt=$*He-_e*Me;if(s){if(xe<0||Ve<0||Tt<0)return null}else if((xe<0||Ve<0||Tt<0)&&(xe>0||Ve>0||Tt>0))return null;let De=xe+Ve+Tt;if(De===0)return null;let it=ie*(xe*V+Ve*N+Tt*ne);return(De>0?it<0:it>0)?null:this.at(it/De,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Sn=class extends tn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Nn,this.combine=ml,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},$d=new Be,_s=new ws,wa=new mn,jd=new O,Ea=new O,Aa=new O,Ra=new O,eh=new O,Ca=new O,Qd=new O,Ia=new O,Qe=class extends ut{constructor(e=new St,t=new Sn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Ca.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(eh.fromBufferAttribute(u,e),o?Ca.addScaledVector(eh,h):Ca.addScaledVector(eh.sub(t),h))}t.add(Ca)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),wa.copy(n.boundingSphere),wa.applyMatrix4(r),_s.copy(e.ray).recast(e.near),!(wa.containsPoint(_s.origin)===!1&&(_s.intersectSphere(wa,jd)===null||_s.origin.distanceToSquared(jd)>(e.far-e.near)**2))&&($d.copy(r).invert(),_s.copy(e.ray).applyMatrix4($d),!(n.boundingBox!==null&&_s.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,_s)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,v=d.length;_<v;_++){let p=d[_],m=o[p.materialIndex],S=Math.max(p.start,f.start),A=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let T=S,R=A;T<R;T+=3){let E=a.getX(T),x=a.getX(T+1),b=a.getX(T+2);s=Pa(this,m,e,n,c,h,u,E,x,b),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let _=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let p=_,m=v;p<m;p+=3){let S=a.getX(p),A=a.getX(p+1),T=a.getX(p+2);s=Pa(this,o,e,n,c,h,u,S,A,T),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,v=d.length;_<v;_++){let p=d[_],m=o[p.materialIndex],S=Math.max(p.start,f.start),A=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let T=S,R=A;T<R;T+=3){let E=T,x=T+1,b=T+2;s=Pa(this,m,e,n,c,h,u,E,x,b),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{let _=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=_,m=v;p<m;p+=3){let S=p,A=p+1,T=p+2;s=Pa(this,o,e,n,c,h,u,S,A,T),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}};function Pg(i,e,t,n,s,r,o,a){let l;if(e.side===Nt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===li,a),l===null)return null;Ia.copy(a),Ia.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ia);return c<t.near||c>t.far?null:{distance:c,point:Ia.clone(),object:i}}function Pa(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,Ea),i.getVertexPosition(l,Aa),i.getVertexPosition(c,Ra);let h=Pg(i,e,t,n,Ea,Aa,Ra,Qd);if(h){let u=new O;Si.getBarycoord(Qd,Ea,Aa,Ra,u),s&&(h.uv=Si.getInterpolatedAttribute(s,a,l,c,u,new Oe)),r&&(h.uv1=Si.getInterpolatedAttribute(r,a,l,c,u,new Oe)),o&&(h.normal=Si.getInterpolatedAttribute(o,a,l,c,u,new O),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new O,materialIndex:0};Si.getNormal(Ea,Aa,Ra,d.normal),h.face=d,h.barycoord=u}return h}var ro=new rt,ef=new rt,tf=new rt,Lg=new rt,nf=new Be,La=new O,th=new mn,sf=new Be,nh=new ws,Mo=class extends Qe{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=oh,this.bindMatrix=new Be,this.bindMatrixInverse=new Be,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new un),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,La),this.boundingBox.expandByPoint(La)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new mn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,La),this.boundingSphere.expandByPoint(La)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),th.copy(this.boundingSphere),th.applyMatrix4(s),e.ray.intersectsSphere(th)!==!1&&(sf.copy(s).invert(),nh.copy(e.ray).applyMatrix4(sf),!(this.boundingBox!==null&&nh.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,nh)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new rt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===oh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===qf?this.bindMatrixInverse.copy(this.bindMatrix).invert():Re("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;ef.fromBufferAttribute(s.attributes.skinIndex,e),tf.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(ro.copy(t),t.set(0,0,0,0)):(ro.set(t.x,t.y,t.z,1),t.set(0,0,0)),ro.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=tf.getComponent(r);if(o!==0){let a=ef.getComponent(r);nf.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Lg.copy(ro).applyMatrix4(nf),o)}}return t.isVector4&&(t.w=ro.w),t.applyMatrix4(this.bindMatrixInverse)}},Mr=class extends ut{constructor(){super(),this.isBone=!0,this.type="Bone"}},Sr=class extends Lt{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Mt,h=Mt,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},rf=new Be,Ng=new Be,So=class i{constructor(e=[],t=[]){this.uuid=hi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Re("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Be)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Be;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:Ng;rf.multiplyMatrices(a,t[r]),rf.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Sr(t,e,e,Fn,bn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(Re("Skeleton: No bone found with UUID:",r),o=new Mr),this.bones.push(o),this.boneInverses.push(new Be().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}},wi=class extends yt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},lr=new Be,of=new Be,Na=[],af=new un,Dg=new Be,oo=new Qe,ao=new mn,ii=class extends Qe{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new wi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Dg)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new un),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,lr),af.copy(e.boundingBox).applyMatrix4(lr),this.boundingBox.union(af)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new mn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,lr),ao.copy(e.boundingSphere).applyMatrix4(lr),this.boundingSphere.union(ao)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(oo.geometry=this.geometry,oo.material=this.material,oo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ao.copy(this.boundingSphere),ao.applyMatrix4(n),e.ray.intersectsSphere(ao)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,lr),of.multiplyMatrices(n,lr),oo.matrixWorld=of,oo.raycast(e,Na);for(let o=0,a=Na.length;o<a;o++){let l=Na[o];l.instanceId=r,l.object=this,t.push(l)}Na.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new wi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Sr(new Float32Array(s*this.count),s,this.count,Sl,bn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},xs=new mn,Ug=new Oe(.5,.5),Da=new O,Ki=class{constructor(e=new Wn,t=new Wn,n=new Wn,s=new Wn,r=new Wn,o=new Wn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Pn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],_=r[8],v=r[9],p=r[10],m=r[11],S=r[12],A=r[13],T=r[14],R=r[15];if(s[0].setComponents(c-o,f-h,m-_,R-S).normalize(),s[1].setComponents(c+o,f+h,m+_,R+S).normalize(),s[2].setComponents(c+a,f+u,m+v,R+A).normalize(),s[3].setComponents(c-a,f-u,m-v,R-A).normalize(),n)s[4].setComponents(l,d,p,T).normalize(),s[5].setComponents(c-l,f-d,m-p,R-T).normalize();else if(s[4].setComponents(c-l,f-d,m-p,R-T).normalize(),t===Pn)s[5].setComponents(c+l,f+d,m+p,R+T).normalize();else if(t===mr)s[5].setComponents(l,d,p,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),xs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),xs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(xs)}intersectsSprite(e){xs.center.set(0,0,0);let t=Ug.distanceTo(e.center);return xs.radius=.7071067811865476+t,xs.applyMatrix4(e.matrixWorld),this.intersectsSphere(xs)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Da.x=s.normal.x>0?e.max.x:e.min.x,Da.y=s.normal.y>0?e.max.y:e.min.y,Da.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Da)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},lf=new Be,Qa=class i{constructor(){this.coordinateSystem=Pn,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];lf.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Ki),n[s].setFromProjectionMatrix(lf,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new Ki),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};var br=class extends tn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ae(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},el=new O,tl=new O,cf=new Be,lo=new ws,Ua=new mn,ih=new O,hf=new O,Es=class extends ut{constructor(e=new St,t=new br){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)el.fromBufferAttribute(t,s-1),tl.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=el.distanceTo(tl);e.setAttribute("lineDistance",new vt(n,1))}else Re("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ua.copy(n.boundingSphere),Ua.applyMatrix4(s),Ua.radius+=r,e.ray.intersectsSphere(Ua)===!1)return;cf.copy(s).invert(),lo.copy(e.ray).applyMatrix4(cf);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let f=Math.max(0,o.start),_=Math.min(h.count,o.start+o.count);for(let v=f,p=_-1;v<p;v+=c){let m=h.getX(v),S=h.getX(v+1),A=Oa(this,e,lo,l,m,S,v);A&&t.push(A)}if(this.isLineLoop){let v=h.getX(_-1),p=h.getX(f),m=Oa(this,e,lo,l,v,p,_-1);m&&t.push(m)}}else{let f=Math.max(0,o.start),_=Math.min(d.count,o.start+o.count);for(let v=f,p=_-1;v<p;v+=c){let m=Oa(this,e,lo,l,v,v+1,v);m&&t.push(m)}if(this.isLineLoop){let v=Oa(this,e,lo,l,_-1,f,_-1);v&&t.push(v)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Oa(i,e,t,n,s,r,o){let a=i.geometry.attributes.position;if(el.fromBufferAttribute(a,s),tl.fromBufferAttribute(a,r),t.distanceSqToSegment(el,tl,ih,hf)>n)return;ih.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(ih);if(!(c<e.near||c>e.far))return{distance:c,point:hf.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var uf=new O,df=new O,bo=class extends Es{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)uf.fromBufferAttribute(t,s),df.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+uf.distanceTo(df);e.setAttribute("lineDistance",new vt(n,1))}else Re("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},To=class extends Es{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},si=class extends tn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ae(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ff=new Be,uh=new ws,Fa=new mn,Ba=new O,Ei=class extends ut{constructor(e=new St,t=new si){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fa.copy(n.boundingSphere),Fa.applyMatrix4(s),Fa.radius+=r,e.ray.intersectsSphere(Fa)===!1)return;ff.copy(s).invert(),uh.copy(e.ray).applyMatrix4(ff);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let _=d,v=f;_<v;_++){let p=c.getX(_);Ba.fromBufferAttribute(u,p),pf(Ba,p,l,s,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let _=d,v=f;_<v;_++)Ba.fromBufferAttribute(u,_),pf(Ba,_,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function pf(i,e,t,n,s,r,o){let a=uh.distanceSqToPoint(i);if(a<t){let l=new O;uh.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var wo=class extends Lt{constructor(e=[],t=Ds,n,s,r,o,a,l,c,h){super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Xn=class extends Lt{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ai=class extends Lt{constructor(e,t,n=qn,s,r,o,a=Mt,l=Mt,c,h=Ti,u=1){if(h!==Ti&&h!==Ni)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new xr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Eo=class extends Ai{constructor(e,t=qn,n=Ds,s,r,o=Mt,a=Mt,l,c=Ti){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ao=class extends Lt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},gn=class i extends St{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;_("z","y","x",-1,-1,n,t,e,o,r,0),_("z","y","x",1,-1,n,t,-e,o,r,1),_("x","z","y",1,1,e,n,t,s,o,2),_("x","z","y",1,-1,e,n,-t,s,o,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new vt(c,3)),this.setAttribute("normal",new vt(h,3)),this.setAttribute("uv",new vt(u,2));function _(v,p,m,S,A,T,R,E,x,b,F){let P=T/x,U=R/b,V=T/2,q=R/2,I=E/2,N=x+1,H=b+1,B=0,ne=0,X=new O;for(let Y=0;Y<H;Y++){let ie=Y*U-q;for(let Me=0;Me<N;Me++){let He=Me*P-V;X[v]=He*S,X[p]=ie*A,X[m]=I,c.push(X.x,X.y,X.z),X[v]=0,X[p]=0,X[m]=E>0?1:-1,h.push(X.x,X.y,X.z),u.push(Me/x),u.push(1-Y/b),B+=1}}for(let Y=0;Y<b;Y++)for(let ie=0;ie<x;ie++){let Me=d+ie+N*Y,He=d+ie+N*(Y+1),$=d+(ie+1)+N*(Y+1),_e=d+(ie+1)+N*Y;l.push(Me,He,_e),l.push(He,$,_e),ne+=6}a.addGroup(f,ne,F),f+=ne,d+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ro=class i extends St{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new O,h=new Oe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){let f=n+u/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/e+1)/2,h.y=(o[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new vt(o,3)),this.setAttribute("normal",new vt(a,3)),this.setAttribute("uv",new vt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var ri=class i extends St{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=e/a,d=t/l,f=[],_=[],v=[],p=[];for(let m=0;m<h;m++){let S=m*d-o;for(let A=0;A<c;A++){let T=A*u-r;_.push(T,-S,0),v.push(0,0,1),p.push(A/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let S=0;S<a;S++){let A=S+c*m,T=S+c*(m+1),R=S+1+c*(m+1),E=S+1+c*m;f.push(A,T,E),f.push(T,R,E)}this.setIndex(f),this.setAttribute("position",new vt(_,3)),this.setAttribute("normal",new vt(v,3)),this.setAttribute("uv",new vt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Tr=class i extends St{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new O,d=new O,f=[],_=[],v=[],p=[];for(let m=0;m<=n;m++){let S=[],A=m/n,T=o+A*a,R=e*Math.cos(T),E=Math.sqrt(e*e-R*R),x=0;m===0&&o===0?x=.5/t:m===n&&l===Math.PI&&(x=-.5/t);for(let b=0;b<=t;b++){let F=b/t,P=s+F*r;u.x=-E*Math.cos(P),u.y=R,u.z=E*Math.sin(P),_.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),p.push(F+x,1-A),S.push(c++)}h.push(S)}for(let m=0;m<n;m++)for(let S=0;S<t;S++){let A=h[m][S+1],T=h[m][S],R=h[m+1][S],E=h[m+1][S+1];(m!==0||o>0)&&f.push(A,T,E),(m!==n-1||l<Math.PI)&&f.push(T,R,E)}this.setIndex(f),this.setAttribute("position",new vt(_,3)),this.setAttribute("normal",new vt(v,3)),this.setAttribute("uv",new vt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Fs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(mf(s))s.isRenderTargetTexture?(Re("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(mf(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function nn(i){let e={};for(let t=0;t<i.length;t++){let n=Fs(i[t]);for(let s in n)e[s]=n[s]}return e}function mf(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Og(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function qh(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}var lp={clone:Fs,merge:nn},Fg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Bg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Dn=class extends tn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Fg,this.fragmentShader=Bg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Fs(e.uniforms),this.uniformsGroups=Og(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ae().setHex(s.value);break;case"v2":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new O().fromArray(s.value);break;case"v4":this.uniforms[n].value=new rt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ke().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Be().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},nl=class extends Dn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},At=class extends tn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ae(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qo,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Nn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},dn=class extends At{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Oe(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ke(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Ae(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ae(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ae(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return ys('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){ys('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Co=class extends tn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ae(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ae(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qo,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Nn,this.combine=ml,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},il=class extends tn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},sl=class extends tn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Yi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function co(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function kg(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function gf(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=i[a+l]}return s}function zg(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}var oi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},rl=class extends oi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:lh,endingEnd:lh}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case ch:r=e,a=2*t-n;break;case hh:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case ch:o=e,l=2*n-t;break;case hh:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,_=(n-t)/(s-t),v=_*_,p=v*_,m=-d*p+2*d*v-d*_,S=(1+d)*p+(-1.5-2*d)*v+(-.5+d)*_+1,A=(-1-f)*p+(1.5+f)*v+.5*_,T=f*p-f*v;for(let R=0;R!==a;++R)r[R]=m*o[h+R]+S*o[c+R]+A*o[l+R]+T*o[u+R];return r}},ol=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},al=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ll=class extends oi{interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let _=(n-t)/(s-t),v=1-_;for(let p=0;p!==a;++p)r[p]=o[c+p]*v+o[l+p]*_;return r}let d=a*2,f=e-1;for(let _=0;_!==a;++_){let v=o[c+_],p=o[l+_],m=f*d+_*2,S=u[m],A=u[m+1],T=e*d+_*2,R=h[T],E=h[T+1],x=Gg(n,t,S,R,s);r[_]=cp(x,v,A,E,p)}return r}};function cp(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Hg(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Gg(i,e,t,n,s){let r=(i-e)/(s-e);for(let o=0;o<8;o++){let a=cp(r,e,t,n,s)-i;if(Math.abs(a)<1e-10)break;let l=Hg(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var _n=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Yi(t,this.TimeBufferType),this.values=Yi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Yi(e.times,Array),values:Yi(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),co(e.settings)&&(n.settings={inTangents:Yi(e.settings.inTangents,Array),outTangents:Yi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new al(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ol(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new rl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ll(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case vs:t=this.InterpolantFactoryMethodDiscrete;break;case Ms:t=this.InterpolantFactoryMethodLinear;break;case Ha:t=this.InterpolantFactoryMethodSmooth;break;case ah:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Re("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return vs;case this.InterpolantFactoryMethodLinear:return Ms;case this.InterpolantFactoryMethodSmooth:return Ha;case this.InterpolantFactoryMethodBezier:return ah}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;co(this.settings)&&(_f(this.settings.inTangents,e),_f(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;co(this.settings)&&(xf(this.settings.inTangents,e),xf(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ue("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ue("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Ue("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Ue("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Qm(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Ue("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ha,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*n,d=u-n,f=u+n;for(let _=0;_!==n;++_){let v=t[u+_];if(v!==t[d+_]||v!==t[f+_]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,co(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function _f(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function xf(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}_n.prototype.ValueTypeName="";_n.prototype.TimeBufferType=Float32Array;_n.prototype.ValueBufferType=Float32Array;_n.prototype.DefaultInterpolation=Ms;var Ri=class extends _n{constructor(e,t,n){super(e,t,n)}};Ri.prototype.ValueTypeName="bool";Ri.prototype.ValueBufferType=Array;Ri.prototype.DefaultInterpolation=vs;Ri.prototype.InterpolantFactoryMethodLinear=void 0;Ri.prototype.InterpolantFactoryMethodSmooth=void 0;var Io=class extends _n{constructor(e,t,n,s){super(e,t,n,s)}};Io.prototype.ValueTypeName="color";var Ci=class extends _n{constructor(e,t,n,s){super(e,t,n,s)}};Ci.prototype.ValueTypeName="number";var cl=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)hn.slerpFlat(r,0,o,c-a,o,c,l);return r}},Ii=class extends _n{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new cl(this.times,this.values,this.getValueSize(),e)}};Ii.prototype.ValueTypeName="quaternion";Ii.prototype.InterpolantFactoryMethodSmooth=void 0;var Pi=class extends _n{constructor(e,t,n){super(e,t,n)}};Pi.prototype.ValueTypeName="string";Pi.prototype.ValueBufferType=Array;Pi.prototype.DefaultInterpolation=vs;Pi.prototype.InterpolantFactoryMethodLinear=void 0;Pi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ji=class extends _n{constructor(e,t,n,s){super(e,t,n,s)}};Ji.prototype.ValueTypeName="vector";var Po=class{constructor(e="",t=-1,n=[],s=Yf){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=hi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Wg(n[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(_n.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);let h=kg(l);l=gf(l,1,h),c=gf(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Ci(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],h=c.name.match(r);if(h&&h.length>1){let u=h[1],d=s[u];d||(s[u]=d=[]),d.push(c)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Vg(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ci;case"vector":case"vector2":case"vector3":case"vector4":return Ji;case"color":return Io;case"quaternion":return Ii;case"bool":case"boolean":return Ri;case"string":return Pi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Wg(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Vg(i.type);if(i.times===void 0){let n=[],s=[];zg(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),co(i.settings)&&(t.settings={inTangents:Yi(i.settings.inTangents,Float32Array),outTangents:Yi(i.settings.outTangents,Float32Array)}),t}var ti={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(yf(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!yf(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function yf(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var hl=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],_=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},hp=new hl,ai=class{constructor(e){this.manager=e!==void 0?e:hp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};ai.DEFAULT_MATERIAL_NAME="__DEFAULT";var Mi={},dh=class extends Error{constructor(e,t){super(e),this.response=t}},wr=class extends ai{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=ti.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Mi[e]!==void 0){Mi[e].push({onLoad:t,onProgress:n,onError:s});return}Mi[e]=[],Mi[e].push({onLoad:t,onProgress:n,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&Re("FileLoader: HTTP Status 0 received."),typeof ReadableStream=="undefined"||c.body===void 0||c.body.getReader===void 0)return c;let h=Mi[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,_=f!==0,v=0,p=new ReadableStream({start(m){S();function S(){u.read().then(({done:A,value:T})=>{if(A)m.close();else{v+=T.byteLength;let R=new ProgressEvent("progress",{lengthComputable:_,loaded:v,total:f});for(let E=0,x=h.length;E<x;E++){let b=h[E];b.onProgress&&b.onProgress(R)}m.enqueue(T),S()}},A=>{m.error(A)})}}});return new Response(p)}else throw new dh(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a==="")return c.text();{let u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(_=>f.decode(_))}}}).then(c=>{ti.add(`file:${e}`,c);let h=Mi[e];delete Mi[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{let h=Mi[e];if(h===void 0)throw this.manager.itemError(e),c;delete Mi[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var cr=new WeakMap,ul=class extends ai{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ti.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=cr.get(o);u===void 0&&(u=[],cr.set(o,u)),u.push({onLoad:t,onError:s})}return o}let a=gr("img");function l(){h(),t&&t(this);let u=cr.get(this)||[];for(let d=0;d<u.length;d++){let f=u[d];f.onLoad&&f.onLoad(this)}cr.delete(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),ti.remove(`image:${e}`);let d=cr.get(this)||[];for(let f=0;f<d.length;f++){let _=d[f];_.onError&&_.onError(u)}cr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),ti.add(`image:${e}`,a),r.manager.itemStart(e),a.fetchPriority=this.priority,a.src=e,a}};var Lo=class extends ai{constructor(e){super(e)}load(e,t,n,s){let r=new Lt,o=new ul(this.manager);return o.setPriority(this.priority),o.setCache(this.cache),o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},As=class extends ut{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ae(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},No=class extends As{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ae(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},sh=new Be,vf=new O,Mf=new O,Er=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=xn,this.map=null,this.mapPass=null,this.matrix=new Be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ki,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;vf.setFromMatrixPosition(e.matrixWorld),t.position.copy(vf),Mf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Mf),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){sh.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(sh,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===mr||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(sh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ka=new O,za=new hn,ei=new O,Do=class extends ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Be,this.projectionMatrix=new Be,this.projectionMatrixInverse=new Be,this.coordinateSystem=Pn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ka,za,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ka,za,ei.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ka,za,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ka,za,ei.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},qi=new O,Sf=new Oe,bf=new Oe,It=class extends Do{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ss*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ho*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ss*2*Math.atan(Math.tan(ho*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){qi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qi.x,qi.y).multiplyScalar(-e/qi.z),qi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qi.x,qi.y).multiplyScalar(-e/qi.z)}getViewSize(e,t){return this.getViewBounds(e,Sf,bf),t.subVectors(bf,Sf)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ho*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},fh=class extends Er{constructor(){super(new It(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Ss*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},Uo=class extends As{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.target=new ut,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new fh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},ph=class extends Er{constructor(){super(new It(90,1,.5,500)),this.isPointLightShadow=!0}},Rs=class extends As{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new ph}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Cs=class extends Do{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},mh=class extends Er{constructor(){super(new Cs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Is=class extends As{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.target=new ut,this.shadow=new mh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Li=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var rh=new WeakMap,Oo=class extends ai{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap=="undefined"&&Re("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch=="undefined"&&Re("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=ti.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{rh.has(o)===!0?(s&&s(rh.get(o)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);return}let a={};a.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",a.headers=this.requestHeader,a.priority=this.priority,a.cache=this.cache,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ti.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),rh.set(l,c),ti.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ti.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var hr=-90,ur=1,Ar=class extends ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new It(hr,ur,e,t);s.layers=this.layers,this.add(s);let r=new It(hr,ur,e,t);r.layers=this.layers,this.add(r);let o=new It(hr,ur,e,t);o.layers=this.layers,this.add(o);let a=new It(hr,ur,e,t);a.layers=this.layers,this.add(a);let l=new It(hr,ur,e,t);l.layers=this.layers,this.add(l);let c=new It(hr,ur,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===Pn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===mr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=v,e.setRenderTarget(n,5,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},dl=class extends It{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var Yh="\\[\\]\\.:\\/",Xg=new RegExp("["+Yh+"]","g"),Zh="[^"+Yh+"]",qg="[^"+Yh.replace("\\.","")+"]",Yg=/((?:WC+[\/:])*)/.source.replace("WC",Zh),Zg=/(WCOD+)?/.source.replace("WCOD",qg),Kg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Zh),Jg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Zh),$g=new RegExp("^"+Yg+Zg+Kg+Jg+"$"),jg=["material","materials","bones","map"],gh=class{constructor(e,t,n){let s=n||ht.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ht=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Xg,"")}static parseTrackName(e){let t=$g.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);jg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Re("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ue("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ue("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ue("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ue("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ue("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;Ue("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ht.Composite=gh;ht.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ht.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ht.prototype.GetterByBindingType=[ht.prototype._getValue_direct,ht.prototype._getValue_array,ht.prototype._getValue_arrayElement,ht.prototype._getValue_toArray];ht.prototype.SetterByBindingTypeAndVersioning=[[ht.prototype._setValue_direct,ht.prototype._setValue_direct_setNeedsUpdate,ht.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_array,ht.prototype._setValue_array_setNeedsUpdate,ht.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_arrayElement,ht.prototype._setValue_arrayElement_setNeedsUpdate,ht.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_fromArray,ht.prototype._setValue_fromArray_setNeedsUpdate,ht.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var NM=new Float32Array(1);var eu=class eu{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};eu.prototype.isMatrix2=!0;var _h=eu;function Kh(i,e,t,n){let s=Qg(n);switch(t){case Dh:return i*e;case Sl:return i*e/s.components*s.byteLength;case bl:return i*e/s.components*s.byteLength;case ji:return i*e*2/s.components*s.byteLength;case Tl:return i*e*2/s.components*s.byteLength;case Uh:return i*e*3/s.components*s.byteLength;case Fn:return i*e*4/s.components*s.byteLength;case wl:return i*e*4/s.components*s.byteLength;case ko:case zo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ho:case Go:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Al:case Cl:return Math.max(i,16)*Math.max(e,8)/4;case El:case Rl:return Math.max(i,8)*Math.max(e,8)/2;case Il:case Pl:case Nl:case Dl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ll:case Vo:case Ul:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ol:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Bl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case kl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case zl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Hl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Gl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Vl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Wl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Xl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ql:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Yl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Zl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Kl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Jl:case $l:case jl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ql:case ec:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Wo:case tc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Qg(i){switch(i){case xn:case Ih:return{byteLength:1,components:1};case Pr:case Ph:case Yn:return{byteLength:2,components:1};case vl:case Ml:return{byteLength:2,components:4};case qn:case yl:case bn:return{byteLength:4,components:1};case Lh:case Nh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window!="undefined"&&(window.__THREE__?Re("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function Lp(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function t0(i){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array!="undefined"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((f,_)=>f.start-_.start);let d=0;for(let f=1;f<u.length;f++){let _=u[d],v=u[f];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,_=u.length;f<_;f++){let v=u[f];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var n0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,i0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,s0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,r0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,o0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,a0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,l0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,c0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,h0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,u0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,d0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,f0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,p0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,m0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,g0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,_0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,x0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,y0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,v0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,M0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,S0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,b0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,T0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,w0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,E0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,A0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,R0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,C0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,I0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,P0="gl_FragColor = linearToOutputTexel( gl_FragColor );",L0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,N0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,D0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,U0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,O0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,F0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,B0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,k0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,z0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,H0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,G0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,V0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,W0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,X0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,q0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Y0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Z0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,K0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,J0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,j0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Q0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,e_=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,t_=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,n_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,i_=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,s_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,r_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,o_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,a_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,l_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,c_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,h_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,u_=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,d_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,f_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,p_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,m_=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,g_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,__=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,x_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,y_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,v_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,M_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,S_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,b_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,T_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,w_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,E_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,A_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,R_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,C_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,I_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,P_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,L_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,N_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,D_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,U_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,O_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,F_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,B_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,k_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,z_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,H_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,G_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,V_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,W_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,X_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,q_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Y_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Z_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,K_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,J_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,$_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,j_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Q_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ex=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,tx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,nx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ix=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sx=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ox=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ax=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,lx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,cx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,hx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,ux=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,dx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,px=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,mx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,gx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_x=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Mx=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Sx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,bx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ex=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ax=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Ix=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Px=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Nx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Dx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qe={alphahash_fragment:n0,alphahash_pars_fragment:i0,alphamap_fragment:s0,alphamap_pars_fragment:r0,alphatest_fragment:o0,alphatest_pars_fragment:a0,aomap_fragment:l0,aomap_pars_fragment:c0,batching_pars_vertex:h0,batching_vertex:u0,begin_vertex:d0,beginnormal_vertex:f0,bsdfs:p0,iridescence_fragment:m0,bumpmap_pars_fragment:g0,clipping_planes_fragment:_0,clipping_planes_pars_fragment:x0,clipping_planes_pars_vertex:y0,clipping_planes_vertex:v0,color_fragment:M0,color_pars_fragment:S0,color_pars_vertex:b0,color_vertex:T0,common:w0,defaultnormal_vertex:E0,displacementmap_pars_vertex:A0,displacementmap_vertex:R0,emissivemap_fragment:C0,emissivemap_pars_fragment:I0,colorspace_fragment:P0,colorspace_pars_fragment:L0,envmap_fragment:N0,envmap_common_pars_fragment:D0,envmap_pars_fragment:U0,envmap_pars_vertex:O0,envmap_physical_pars_fragment:Y0,envmap_vertex:F0,fog_vertex:B0,fog_pars_vertex:k0,fog_fragment:z0,fog_pars_fragment:H0,gradientmap_pars_fragment:G0,lightmap_pars_fragment:V0,lights_lambert_fragment:W0,lights_lambert_pars_fragment:X0,lights_pars_begin:q0,lights_toon_fragment:Z0,lights_toon_pars_fragment:K0,lights_phong_fragment:J0,lights_phong_pars_fragment:$0,lights_physical_fragment:j0,lights_physical_pars_fragment:Q0,lights_fragment_begin:e_,lights_fragment_maps:t_,lights_fragment_end:n_,lightprobes_pars_fragment:i_,logdepthbuf_fragment:s_,logdepthbuf_pars_fragment:r_,logdepthbuf_pars_vertex:o_,logdepthbuf_vertex:a_,map_fragment:l_,map_pars_fragment:c_,map_particle_fragment:h_,map_particle_pars_fragment:u_,metalnessmap_fragment:d_,metalnessmap_pars_fragment:f_,morphinstance_vertex:p_,morphcolor_vertex:m_,morphnormal_vertex:g_,morphtarget_pars_vertex:__,morphtarget_vertex:x_,normal_fragment_begin:y_,normal_fragment_maps:v_,normal_pars_fragment:M_,normal_pars_vertex:S_,normal_vertex:b_,normalmap_pars_fragment:T_,clearcoat_normal_fragment_begin:w_,clearcoat_normal_fragment_maps:E_,clearcoat_pars_fragment:A_,iridescence_pars_fragment:R_,opaque_fragment:C_,packing:I_,premultiplied_alpha_fragment:P_,project_vertex:L_,dithering_fragment:N_,dithering_pars_fragment:D_,roughnessmap_fragment:U_,roughnessmap_pars_fragment:O_,shadowmap_pars_fragment:F_,shadowmap_pars_vertex:B_,shadowmap_vertex:k_,shadowmask_pars_fragment:z_,skinbase_vertex:H_,skinning_pars_vertex:G_,skinning_vertex:V_,skinnormal_vertex:W_,specularmap_fragment:X_,specularmap_pars_fragment:q_,tonemapping_fragment:Y_,tonemapping_pars_fragment:Z_,transmission_fragment:K_,transmission_pars_fragment:J_,uv_pars_fragment:$_,uv_pars_vertex:j_,uv_vertex:Q_,worldpos_vertex:ex,background_vert:tx,background_frag:nx,backgroundCube_vert:ix,backgroundCube_frag:sx,cube_vert:rx,cube_frag:ox,depth_vert:ax,depth_frag:lx,distance_vert:cx,distance_frag:hx,equirect_vert:ux,equirect_frag:dx,linedashed_vert:fx,linedashed_frag:px,meshbasic_vert:mx,meshbasic_frag:gx,meshlambert_vert:_x,meshlambert_frag:xx,meshmatcap_vert:yx,meshmatcap_frag:vx,meshnormal_vert:Mx,meshnormal_frag:Sx,meshphong_vert:bx,meshphong_frag:Tx,meshphysical_vert:wx,meshphysical_frag:Ex,meshtoon_vert:Ax,meshtoon_frag:Rx,points_vert:Cx,points_frag:Ix,shadow_vert:Px,shadow_frag:Lx,sprite_vert:Nx,sprite_frag:Dx},ge={common:{diffuse:{value:new Ae(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ae(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ae(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ae(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},di={basic:{uniforms:nn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:nn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)},envMapIntensity:{value:1}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:nn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)},specular:{value:new Ae(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:nn([ge.common,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.roughnessmap,ge.metalnessmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:nn([ge.common,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.gradientmap,ge.fog,ge.lights,{emissive:{value:new Ae(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:nn([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:nn([ge.points,ge.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:nn([ge.common,ge.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:nn([ge.common,ge.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:nn([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:nn([ge.sprite,ge.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distance:{uniforms:nn([ge.common,ge.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distance_vert,fragmentShader:qe.distance_frag},shadow:{uniforms:nn([ge.lights,ge.fog,{color:{value:new Ae(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};di.physical={uniforms:nn([di.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new ke},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ae(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ae(0)},specularColor:{value:new Ae(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};var sc={r:0,b:0,g:0},Ux=new Be,Np=new ke;Np.set(-1,0,0,0,1,0,0,0,1);function Ox(i,e,t,n,s,r){let o=new Ae(0),a=s===!0?0:1,l,c,h=null,u=0,d=null;function f(S){let A=S.isScene===!0?S.background:null;if(A&&A.isTexture){let T=S.backgroundBlurriness>0;A=e.get(A,T)}return A}function _(S){let A=!1,T=f(S);T===null?p(o,a):T&&T.isColor&&(p(T,1),A=!0);let R=i.xr.getEnvironmentBlendMode();R==="additive"?t.buffers.color.setClear(0,0,0,1,r):R==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(S,A){let T=f(A);T&&T.isCubeTexture?(c===void 0&&(c=new Qe(new gn(1,1,1),new Dn({name:"BackgroundCubeMaterial",uniforms:Fs(di.backgroundCube.uniforms),vertexShader:di.backgroundCube.vertexShader,fragmentShader:di.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(R,E,x){this.matrixWorld.copyPosition(x.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=T,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Ux.makeRotationFromEuler(A.backgroundRotation)).transpose(),T.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Np),c.material.toneMapped=Ye.getTransfer(T.colorSpace)!==nt,(h!==T||u!==T.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=T,u=T.version,d=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null)):T&&T.isTexture&&(l===void 0&&(l=new Qe(new ri(2,2),new Dn({name:"BackgroundMaterial",uniforms:Fs(di.background.uniforms),vertexShader:di.background.vertexShader,fragmentShader:di.background.fragmentShader,side:li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=T,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Ye.getTransfer(T.colorSpace)!==nt,T.matrixAutoUpdate===!0&&T.updateMatrix(),l.material.uniforms.uvTransform.value.copy(T.matrix),(h!==T||u!==T.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=T,u=T.version,d=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function p(S,A){S.getRGB(sc,qh(i)),t.buffers.color.setClear(sc.r,sc.g,sc.b,A,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(S,A=1){o.set(S),a=A,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(S){a=S,p(o,a)},render:_,addToRenderList:v,dispose:m}}function Fx(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(U,V,q,I,N){let H=!1,B=u(U,I,q,V);r!==B&&(r=B,c(r.object)),H=f(U,I,q,N),H&&_(U,I,q,N),N!==null&&e.update(N,i.ELEMENT_ARRAY_BUFFER),(H||o)&&(o=!1,T(U,V,q,I),N!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(N).buffer))}function l(){return i.createVertexArray()}function c(U){return i.bindVertexArray(U)}function h(U){return i.deleteVertexArray(U)}function u(U,V,q,I){let N=I.wireframe===!0,H=n[V.id];H===void 0&&(H={},n[V.id]=H);let B=U.isInstancedMesh===!0?U.id:0,ne=H[B];ne===void 0&&(ne={},H[B]=ne);let X=ne[q.id];X===void 0&&(X={},ne[q.id]=X);let Y=X[N];return Y===void 0&&(Y=d(l()),X[N]=Y),Y}function d(U){let V=[],q=[],I=[];for(let N=0;N<t;N++)V[N]=0,q[N]=0,I[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:q,attributeDivisors:I,object:U,attributes:{},index:null}}function f(U,V,q,I){let N=r.attributes,H=V.attributes,B=0,ne=q.getAttributes();for(let X in ne)if(ne[X].location>=0){let ie=N[X],Me=H[X];if(Me===void 0&&(X==="instanceMatrix"&&U.instanceMatrix&&(Me=U.instanceMatrix),X==="instanceColor"&&U.instanceColor&&(Me=U.instanceColor)),ie===void 0||ie.attribute!==Me||Me&&ie.data!==Me.data)return!0;B++}return r.attributesNum!==B||r.index!==I}function _(U,V,q,I){let N={},H=V.attributes,B=0,ne=q.getAttributes();for(let X in ne)if(ne[X].location>=0){let ie=H[X];ie===void 0&&(X==="instanceMatrix"&&U.instanceMatrix&&(ie=U.instanceMatrix),X==="instanceColor"&&U.instanceColor&&(ie=U.instanceColor));let Me={};Me.attribute=ie,ie&&ie.data&&(Me.data=ie.data),N[X]=Me,B++}r.attributes=N,r.attributesNum=B,r.index=I}function v(){let U=r.newAttributes;for(let V=0,q=U.length;V<q;V++)U[V]=0}function p(U){m(U,0)}function m(U,V){let q=r.newAttributes,I=r.enabledAttributes,N=r.attributeDivisors;q[U]=1,I[U]===0&&(i.enableVertexAttribArray(U),I[U]=1),N[U]!==V&&(i.vertexAttribDivisor(U,V),N[U]=V)}function S(){let U=r.newAttributes,V=r.enabledAttributes;for(let q=0,I=V.length;q<I;q++)V[q]!==U[q]&&(i.disableVertexAttribArray(q),V[q]=0)}function A(U,V,q,I,N,H,B){B===!0?i.vertexAttribIPointer(U,V,q,N,H):i.vertexAttribPointer(U,V,q,I,N,H)}function T(U,V,q,I){v();let N=I.attributes,H=q.getAttributes(),B=V.defaultAttributeValues;for(let ne in H){let X=H[ne];if(X.location>=0){let Y=N[ne];if(Y===void 0&&(ne==="instanceMatrix"&&U.instanceMatrix&&(Y=U.instanceMatrix),ne==="instanceColor"&&U.instanceColor&&(Y=U.instanceColor)),Y!==void 0){let ie=Y.normalized,Me=Y.itemSize,He=e.get(Y);if(He===void 0)continue;let $=He.buffer,_e=He.type,Se=He.bytesPerElement,Pe=_e===i.INT||_e===i.UNSIGNED_INT||Y.gpuType===yl;if(Y.isInterleavedBufferAttribute){let xe=Y.data,Ve=xe.isInterleavedBuffer===!0?xe.stride:xe.itemSize,Tt=Y.offset;if(xe.isInstancedInterleavedBuffer||xe.isInstancedBufferAttribute){for(let De=0;De<X.locationSize;De++)m(X.location+De,xe.meshPerAttribute);U.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=xe.meshPerAttribute*xe.count)}else for(let De=0;De<X.locationSize;De++)p(X.location+De);i.bindBuffer(i.ARRAY_BUFFER,$);for(let De=0;De<X.locationSize;De++)A(X.location+De,Me/X.locationSize,_e,ie,Ve*Se,(Tt+Me/X.locationSize*De)*Se,Pe)}else{if(Y.isInstancedBufferAttribute){for(let xe=0;xe<X.locationSize;xe++)m(X.location+xe,Y.meshPerAttribute);U.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let xe=0;xe<X.locationSize;xe++)p(X.location+xe);i.bindBuffer(i.ARRAY_BUFFER,$);for(let xe=0;xe<X.locationSize;xe++)A(X.location+xe,Me/X.locationSize,_e,ie,Me*Se,Me/X.locationSize*xe*Se,Pe)}}else if(B!==void 0){let ie=B[ne];if(ie!==void 0)switch(ie.length){case 2:i.vertexAttrib2fv(X.location,ie);break;case 3:i.vertexAttrib3fv(X.location,ie);break;case 4:i.vertexAttrib4fv(X.location,ie);break;default:i.vertexAttrib1fv(X.location,ie)}}}}S()}function R(){F();for(let U in n){let V=n[U];for(let q in V){let I=V[q];for(let N in I){let H=I[N];for(let B in H)h(H[B].object),delete H[B];delete I[N]}}delete n[U]}}function E(U){if(n[U.id]===void 0)return;let V=n[U.id];for(let q in V){let I=V[q];for(let N in I){let H=I[N];for(let B in H)h(H[B].object),delete H[B];delete I[N]}}delete n[U.id]}function x(U){for(let V in n){let q=n[V];for(let I in q){let N=q[I];if(N[U.id]===void 0)continue;let H=N[U.id];for(let B in H)h(H[B].object),delete H[B];delete N[U.id]}}}function b(U){for(let V in n){let q=n[V],I=U.isInstancedMesh===!0?U.id:0,N=q[I];if(N!==void 0){for(let H in N){let B=N[H];for(let ne in B)h(B[ne].object),delete B[ne];delete N[H]}delete q[I],Object.keys(q).length===0&&delete n[V]}}}function F(){P(),o=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:F,resetDefaultState:P,dispose:R,releaseStatesOfGeometry:E,releaseStatesOfObject:b,releaseStatesOfProgram:x,initAttributes:v,enableAttribute:p,disableUnusedAttributes:S}}function Bx(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function a(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function kx(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let x=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(x.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(x){return!(x!==Fn&&n.convert(x)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(x){let b=x===Yn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(x!==xn&&x!==bn&&!b&&n.convert(x)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(x){if(x==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";x="mediump"}return x==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Re("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&u===!1;t.reversedDepthBuffer===!0&&u===!1&&Re("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&u===!0&&Re("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),T=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:S,maxVaryings:A,maxFragmentUniforms:T,maxSamples:R,samples:E}}function zx(i){let e=this,t=null,n=0,s=!1,r=!1,o=new Wn,a=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let _=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,m=i.get(u);if(!s||_===null||_.length===0||r&&!p)r?h(null):c();else{let S=r?0:n,A=S*4,T=m.clippingState||null;l.value=T,T=h(_,d,A,f);for(let R=0;R!==A;++R)T[R]=t[R];m.clippingState=T,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,_){let v=u!==null?u.length:0,p=null;if(v!==0){if(p=l.value,_!==!0||p===null){let m=f+v*4,S=d.matrixWorldInverse;a.getNormalMatrix(S),(p===null||p.length<m)&&(p=new Float32Array(m));for(let A=0,T=f;A!==v;++A,T+=4)o.copy(u[A]).applyMatrix4(S,a),o.normal.toArray(p,T),p[T+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,p}}var Ko=class extends Mn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new wo(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new gn(5,5,5),r=new Dn({name:"CubemapFromEquirect",uniforms:Fs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Nt,blending:Ps});r.uniforms.tEquirect.value=t;let o=new Qe(s,r),a=t.minFilter;return t.minFilter===On&&(t.minFilter=Pt),new Ar(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},up=256,Hx=3,Gx=20,Dp=256,Up=16,Vx=3,Wx=new O,Xx=new Ae,Dr=class i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ar(1,10,null),this._boxMesh=new Qe(new gn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=Wx}=r,l=this._renderer;this._setSize(o);let c=this._allocateTarget(),h=this._getSourceTarget(!0);t>0&&(h.texture.mipmapsAutoUpdate=!1);let u=l.autoClear,d=l.autoClearColor,f=l.autoClearDepth,_=l.autoClearStencil,v=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,v===null&&(e.background=l.getClearColor(Xx));let p=new Ar(n,s,h);return p.position.copy(a),p.update(l,e),l.autoClear=u,l.autoClearColor=d,l.autoClearDepth=f,l.autoClearStencil=_,e.background=v,t>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=pp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(up,Vh(e))}_fromTexture(e,t){e.mapping===Ds||e.mapping===Cr?this._setSize(e.image.length===0?up:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=dp(e,!1,!1),n=Math.log2(e)-Hx;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=dp(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let o=e.width>>t;e.viewport.set(0,0,o,o),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Ds||e.mapping===Cr?(this._cubemapMaterial===null&&(this._cubemapMaterial=pp()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=fp()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=qx(),this._integrationMaterial=Yx());let t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/Up);for(let o=0;o<=n;o++){let a=i.lodToRoughness(o,n);if(o>n-Vx)r.roughness.value=a,this._renderCube(e,o,this._integrationMaterial);else{let l=a>0?Math.log2(t)+.5*Math.log2(6/(Dp*Math.pow(a,4)))+.5:0;s.roughness.value=a,s.lodBias.value=l,this._renderCube(e,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Zx());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}};function dp(i,e,t){return new Ko(i,{minFilter:On,generateMipmaps:e,type:Yn,colorSpace:cn,depthBuffer:t})}function Jo(i,e,t){return new Dn({name:i,uniforms:e,vertexShader:qe.cube_vert,fragmentShader:t,side:Nt,blending:Ps,depthTest:!1,depthWrite:!1})}function qx(){return Jo("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Dp}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Yx(){return Jo("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Up}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Zx(){return Jo("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Gx}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function fp(){return Jo("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function pp(){return Jo("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Kx(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===gl||f===_l)if(e.has(d)){let _=e.get(d).texture;return a(_,d.mapping)}else{let _=d.image;if(_&&_.height>0){let v=new Ko(_.height);return v.fromEquirectangularTexture(i,d),e.set(d,v),d.addEventListener("dispose",c),a(v.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){let f=d.mapping,_=f===gl||f===_l,v=f===Ds||f===Cr;if(_||v){let p=t.get(d),m=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==m)return n===null&&(n=new Dr(i)),p=_?n.fromEquirectangular(d,p):n.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,t.set(d,p),p.texture;if(p!==void 0)return p.texture;{let S=d.image;return _&&S&&S.height>0||v&&S&&l(S)?(n===null&&(n=new Dr(i)),p=_?n.fromEquirectangular(d):n.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,t.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function a(d,f){return f===gl?d.mapping=Ds:f===_l&&(d.mapping=Cr),d}function l(d){let f=0,_=6;for(let v=0;v<_;v++)d[v]!==void 0&&f++;return f===_}function c(d){let f=d.target;f.removeEventListener("dispose",c);let _=e.get(f);_!==void 0&&(e.delete(f),_.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let _=t.get(f);_!==void 0&&(t.delete(f),_.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function Jx(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&ys("WebGLRenderer: "+n+" extension not supported."),s}}}function $x(i,e,t,n){let s={},r=new WeakMap,o=new FinalizationRegistry(_=>delete s[_]);function a(_){l(_.target)}function l(_){_.index!==null&&e.remove(_.index);for(let p in _.attributes)e.remove(_.attributes[p]);_.removeEventListener("dispose",a),delete s[_.id],o.unregister(_);let v=r.get(_);v&&(e.remove(v),r.delete(_)),n.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0&&delete _._maxInstanceCount,t.memory.geometries--}function c(_,v){return s[v.id]!==void 0||(v.addEventListener("dispose",a),s[v.id]=new WeakRef(v),o.register(v,v.id,v),t.memory.geometries++),v}function h(_){let v=_.attributes;for(let p in v)e.update(v[p],i.ARRAY_BUFFER)}function u(_){let v=_.index,p=_.attributes.position,m=0;if(p===void 0)return;let S=v!==null?v.array.length:p.array.length/3-1,A=p.count>=65535?yo:xo,T=new A(Math.ceil(S/3)*6,1),R=T.array;if(v!==null){let x=v.array;m=v.version;for(let b=0,F=0;b<S;b+=3){let P=x[b+0],U=x[b+1],V=x[b+2];R[F++]=P,R[F++]=U,R[F++]=U,R[F++]=V,R[F++]=V,R[F++]=P}}else{m=p.version;for(let x=0,b=0;x<S;x+=3){let F=x+0,P=x+1,U=x+2;R[b++]=F,R[b++]=P,R[b++]=P,R[b++]=U,R[b++]=U,R[b++]=F}}T.version=m;let E=r.get(_);E&&e.remove(E),r.set(_,T)}function d(_){let v=r.get(_);if(v){let p=_.index;p!==null&&v.version<p.version&&u(_)}else u(_);return r.get(_)}function f(){for(let _ in s){let v=s[_].deref();v!==void 0&&l(v)}}return{get:c,update:h,getWireframeAttribute:d,dispose:f}}function jx(i,e,t){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,d){i.drawElements(n,d,r,u*o),t.update(d,n,1)}function c(u,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,u*o,f),t.update(d,n,f))}function h(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let v=0;for(let p=0;p<f;p++)v+=d[p];t.update(v,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Qx(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:Ue("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function ey(i,e,t){let n=new WeakMap,s=new rt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let F=function(){x.dispose(),n.delete(a),a.removeEventListener("dispose",F)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],S=a.morphAttributes.color||[],A=0;f===!0&&(A=1),_===!0&&(A=2),v===!0&&(A=3);let T=a.attributes.position.count*A,R=1;T>e.maxTextureSize&&(R=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);let E=new Float32Array(T*R*4*u),x=new mo(E,T,R,u);x.type=bn,x.needsUpdate=!0;let b=A*4;for(let P=0;P<u;P++){let U=p[P],V=m[P],q=S[P],I=T*R*4*P;for(let N=0;N<U.count;N++){let H=N*b;f===!0&&(s.fromBufferAttribute(U,N),E[I+H+0]=s.x,E[I+H+1]=s.y,E[I+H+2]=s.z,E[I+H+3]=0),_===!0&&(s.fromBufferAttribute(V,N),E[I+H+4]=s.x,E[I+H+5]=s.y,E[I+H+6]=s.z,E[I+H+7]=0),v===!0&&(s.fromBufferAttribute(q,N),E[I+H+8]=s.x,E[I+H+9]=s.y,E[I+H+10]=s.z,E[I+H+11]=q.itemSize===4?s.w:1)}}d={count:u,texture:x,size:new Oe(T,R)},n.set(a,d),a.addEventListener("dispose",F)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let _=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function ty(i,e,t,n,s){let r=new WeakMap;function o(c){let h=s.render.frame,u=c.geometry,d=e.get(c,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:o,dispose:a}}var ny={[bh]:"LINEAR_TONE_MAPPING",[Th]:"REINHARD_TONE_MAPPING",[wh]:"CINEON_TONE_MAPPING",[Bo]:"ACES_FILMIC_TONE_MAPPING",[Ah]:"AGX_TONE_MAPPING",[Rh]:"NEUTRAL_TONE_MAPPING",[Eh]:"CUSTOM_TONE_MAPPING"};function iy(i,e,t,n,s,r){let o=new Mn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=null,h=new St;h.setAttribute("position",new vt([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new vt([0,2,0,0,2,0],2));let u=new nl({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Qe(h,u),f=new Cs(-1,1,1,-1,0,1),_=null,v=null,p=!1,m,S=null,A=[],T=!1;this.setSize=function(R,E){o.setSize(R,E),a!==null&&a.setSize(R,E),l!==null&&l.setSize(R,E);for(let x=0;x<A.length;x++){let b=A[x];b.setSize&&b.setSize(R,E)}},this.setEffects=function(R){A=R,T=A.length>0&&A[0].isRenderPass===!0;let E=o.width,x=o.height;A.length>0&&a===null&&(a=new Mn(E,x,{type:Yn,depthBuffer:!1,stencilBuffer:!1}),l=new Mn(E,x,{type:Yn,depthBuffer:!1,stencilBuffer:!1}));let b=s===!0&&A.some(F=>F.needsDepthTexture===!0);b!==(o.depthTexture!==null)&&(b===!0&&c===null&&(c=new Ai(E,x),r===!0&&(c.format=Ni,c.type=Os)),o.dispose(),o.depthTexture=b?c:null,o.resolveDepthBuffer=b,o.storeMultisampledDepthBuffer=b);for(let F=0;F<A.length;F++){let P=A[F];P.setSize&&P.setSize(E,x),b&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(c)}},this.begin=function(R,E){if(p||R.toneMapping===ci&&A.length===0)return!1;if(S=E,E!==null){let x=E.width,b=E.height;(o.width!==x||o.height!==b)&&this.setSize(x,b)}return T===!1&&R.setRenderTarget(o),m=R.toneMapping,R.toneMapping=ci,!0},this.hasRenderPass=function(){return T},this.end=function(R,E){R.toneMapping=m,p=!0;let x=o,b=a;for(let F=0;F<A.length;F++){let P=A[F];P.enabled!==!1&&(P.render(R,b,x,E),P.needsSwap!==!1&&(x=b,b=b===a?l:a))}if(_!==R.outputColorSpace||v!==R.toneMapping){_=R.outputColorSpace,v=R.toneMapping,u.defines={},Ye.getTransfer(_)===nt&&(u.defines.SRGB_TRANSFER="");let F=ny[v];F&&(u.defines[F]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=x.texture,R.setRenderTarget(S),R.render(d,f),S=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),h.dispose(),u.dispose()}}var Op=new Lt,Fp=new Ai(1,1),Bp=new Eo(1),kp=new mo,zp=new ja,Hp=new wo,mp=[],gp=[],_p=new Float32Array(16),xp=new Float32Array(9),yp=new Float32Array(4);function Ur(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=mp[s];if(r===void 0&&(r=new Float32Array(s),mp[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Dt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ut(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ac(i,e){let t=gp[e];t===void 0&&(t=new Int32Array(e),gp[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function sy(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function ry(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;i.uniform2fv(this.addr,e),Ut(t,e)}}function oy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Dt(t,e))return;i.uniform3fv(this.addr,e),Ut(t,e)}}function ay(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;i.uniform4fv(this.addr,e),Ut(t,e)}}function ly(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Dt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,n))return;yp.set(n),i.uniformMatrix2fv(this.addr,!1,yp),Ut(t,n)}}function cy(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Dt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,n))return;xp.set(n),i.uniformMatrix3fv(this.addr,!1,xp),Ut(t,n)}}function hy(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Dt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,n))return;_p.set(n),i.uniformMatrix4fv(this.addr,!1,_p),Ut(t,n)}}function uy(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function dy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;i.uniform2iv(this.addr,e),Ut(t,e)}}function fy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;i.uniform3iv(this.addr,e),Ut(t,e)}}function py(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;i.uniform4iv(this.addr,e),Ut(t,e)}}function my(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function gy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;i.uniform2uiv(this.addr,e),Ut(t,e)}}function _y(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;i.uniform3uiv(this.addr,e),Ut(t,e)}}function xy(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;i.uniform4uiv(this.addr,e),Ut(t,e)}}function lc(i){return i.version===0&&(i.compareFunction=kh,i.needsUpdate=!0),i}function yy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=lc(Fp):r=Op,t.setTexture2D(e||r,s)}function vy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||zp,s)}function My(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=lc(Bp):r=Hp,t.setTextureCube(e||r,s)}function Sy(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||kp,s)}function by(i){switch(i){case 5126:return sy;case 35664:return ry;case 35665:return oy;case 35666:return ay;case 35674:return ly;case 35675:return cy;case 35676:return hy;case 5124:case 35670:return uy;case 35667:case 35671:return dy;case 35668:case 35672:return fy;case 35669:case 35673:return py;case 5125:return my;case 36294:return gy;case 36295:return _y;case 36296:return xy;case 35678:case 36198:case 36298:case 36306:case 35682:return yy;case 35679:case 36299:case 36307:return vy;case 35680:case 36300:case 36308:case 36293:return My;case 36289:case 36303:case 36311:case 36292:return Sy}}function Ty(i,e){i.uniform1fv(this.addr,e)}function wy(i,e){let t=Ur(e,this.size,2);i.uniform2fv(this.addr,t)}function Ey(i,e){let t=Ur(e,this.size,3);i.uniform3fv(this.addr,t)}function Ay(i,e){let t=Ur(e,this.size,4);i.uniform4fv(this.addr,t)}function Ry(i,e){let t=Ur(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Cy(i,e){let t=Ur(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Iy(i,e){let t=Ur(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Py(i,e){i.uniform1iv(this.addr,e)}function Ly(i,e){i.uniform2iv(this.addr,e)}function Ny(i,e){i.uniform3iv(this.addr,e)}function Dy(i,e){i.uniform4iv(this.addr,e)}function Uy(i,e){i.uniform1uiv(this.addr,e)}function Oy(i,e){i.uniform2uiv(this.addr,e)}function Fy(i,e){i.uniform3uiv(this.addr,e)}function By(i,e){i.uniform4uiv(this.addr,e)}function ky(i,e,t){let n=this.cache,s=e.length,r=ac(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=lc(Fp):o=Op;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function zy(i,e,t){let n=this.cache,s=e.length,r=ac(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||zp,r[o])}function Hy(i,e,t){let n=this.cache,s=e.length,r=ac(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));let o;this.type===i.SAMPLER_CUBE_SHADOW?o=lc(Bp):o=Hp;for(let a=0;a!==s;++a)t.setTextureCube(e[a]||o,r[a])}function Gy(i,e,t){let n=this.cache,s=e.length,r=ac(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||kp,r[o])}function Vy(i){switch(i){case 5126:return Ty;case 35664:return wy;case 35665:return Ey;case 35666:return Ay;case 35674:return Ry;case 35675:return Cy;case 35676:return Iy;case 5124:case 35670:return Py;case 35667:case 35671:return Ly;case 35668:case 35672:return Ny;case 35669:case 35673:return Dy;case 5125:return Uy;case 36294:return Oy;case 36295:return Fy;case 36296:return By;case 35678:case 36198:case 36298:case 36306:case 35682:return ky;case 35679:case 36299:case 36307:return zy;case 35680:case 36300:case 36308:case 36293:return Hy;case 36289:case 36303:case 36311:case 36292:return Gy}}var iu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=by(t.type)}},su=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Vy(t.type)}},ru=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},tu=/(\w+)(\])?(\[|\.)?/g;function vp(i,e){i.seq.push(e),i.map[e.id]=e}function Wy(i,e,t){let n=i.name,s=n.length;for(tu.lastIndex=0;;){let r=tu.exec(n),o=tu.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){vp(t,c===void 0?new iu(a,i,e):new su(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new ru(a),vp(t,u)),t=u}}}var Nr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);Wy(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Mp(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Xy=37297,qy=0;function Yy(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Sp=new ke;function Zy(i){Ye._getMatrix(Sp,Ye.workingColorSpace,i);let e=`mat3( ${Sp.elements.map(t=>t.toFixed(4))} )`;switch(Ye.getTransfer(i)){case fo:return[e,"LinearTransferOETF"];case nt:return[e,"sRGBTransferOETF"];default:return Re("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function bp(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Yy(i.getShaderSource(e),a)}else return r}function Ky(i,e){let t=Zy(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Jy={[bh]:"Linear",[Th]:"Reinhard",[wh]:"Cineon",[Bo]:"ACESFilmic",[Ah]:"AgX",[Rh]:"Neutral",[Eh]:"Custom"};function $y(i,e){let t=Jy[e];return t===void 0?(Re("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var rc=new O;function jy(){Ye.getLuminanceCoefficients(rc);let i=rc.x.toFixed(4),e=rc.y.toFixed(4),t=rc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Qy(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Zo).join(`
`)}function ev(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function tv(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Zo(i){return i!==""}function Tp(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function wp(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var nv=/^[ \t]*#include +<([\w\d./]+)>/gm;function ou(i){return i.replace(nv,iv)}function iv(i,e){let t=qe[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return ou(t)}var sv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ep(i){return i.replace(sv,rv)}function rv(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ap(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var ov={[Fo]:"SHADOWMAP_TYPE_PCF",[Rr]:"SHADOWMAP_TYPE_VSM"};function av(i){return ov[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var lv={[Cr]:"ENVMAP_MODE_REFRACTION"};function cv(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":lv[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var hv={[ml]:"ENVMAP_BLENDING_MULTIPLY",[Wf]:"ENVMAP_BLENDING_MIX",[Xf]:"ENVMAP_BLENDING_ADD"};function uv(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":hv[i.combine]||"ENVMAP_BLENDING_NONE"}function dv(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=av(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=cv(t),u=uv(t),d=Qy(t),f=ev(r),_=s.createProgram(),v,p,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Zo).join(`
`),v.length>0&&(v+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(Zo).join(`
`),p.length>0&&(p+=`
`)):(v=[Ap(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Zo).join(`
`),p=[Ap(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ci?"#define TONE_MAPPING":"",t.toneMapping!==ci?qe.tonemapping_pars_fragment:"",t.toneMapping!==ci?$y("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,Ky("linearToOutputTexel",t.outputColorSpace),jy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Zo).join(`
`)),o=ou(o),o=Tp(o,t),o=wp(o,t),a=ou(a),a=Tp(a,t),a=wp(a,t),o=Ep(o),a=Ep(a),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,v=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,p=["#define varying in",t.glslVersion===Hh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Hh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let S=m+v+o,A=m+p+a,T=Mp(s,s.VERTEX_SHADER,S),R=Mp(s,s.FRAGMENT_SHADER,A);s.attachShader(_,T),s.attachShader(_,R),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function E(P){if(i.debug.checkShaderErrors){let U=s.getProgramInfoLog(_)||"",V=s.getShaderInfoLog(T)||"",q=s.getShaderInfoLog(R)||"",I=U.trim(),N=V.trim(),H=q.trim(),B=!0,ne=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(B=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,T,R);else{let X=bp(s,T,"vertex"),Y=bp(s,R,"fragment");Ue("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+I+`
`+X+`
`+Y)}else I!==""?Re("WebGLProgram: Program Info Log:",I):(N===""||H==="")&&(ne=!1);ne&&(P.diagnostics={runnable:B,programLog:I,vertexShader:{log:N,prefix:v},fragmentShader:{log:H,prefix:p}})}s.deleteShader(T),s.deleteShader(R),x=new Nr(s,_),b=tv(s,_)}let x;this.getUniforms=function(){return x===void 0&&E(this),x};let b;this.getAttributes=function(){return b===void 0&&E(this),b};let F=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=s.getProgramParameter(_,Xy)),F},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=qy++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=T,this.fragmentShader=R,this}var fv=0,au=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new lu(e),t.set(e,n)),n}},lu=class{constructor(e){this.id=fv++,this.code=e,this.usedTimes=0}};function pv(i){return i===ji||i===Vo||i===Wo}function mv(i,e,t,n,s,r){let o=new go,a=new au,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(x){return l.add(x),x===0?"uv":`uv${x}`}function _(x,b,F,P,U,V){let q=P.fog,I=U.geometry,N=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?P.environment:null,H=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,B=e.get(x.envMap||N,H),ne=d[x.type],X=n.precision;x.precision!==null&&(X=n.getMaxPrecision(x.precision),X!==x.precision&&Re("WebGLProgram.getParameters:",x.precision,"not supported, using",X,"instead."));let Y=I.morphAttributes.position||I.morphAttributes.normal||I.morphAttributes.color,ie=Y!==void 0?Y.length:0,Me=0;I.morphAttributes.position!==void 0&&(Me=1),I.morphAttributes.normal!==void 0&&(Me=2),I.morphAttributes.color!==void 0&&(Me=3);let He,$,_e,Se;if(ne){let me=di[ne];He=me.vertexShader,$=me.fragmentShader}else{He=x.vertexShader,$=x.fragmentShader;let me=a.getVertexShaderStage(x),st=a.getFragmentShaderStage(x);a.update(x,me,st),_e=me.id,Se=st.id}let Pe=i.getRenderTarget(),xe=i.state.buffers.depth.getReversed(),Ve=U.isInstancedMesh===!0,Tt=U.isBatchedMesh===!0,De=!!x.map,it=!!x.matcap,lt=!!B,Je=lt&&B.isPMREMTexture===!0,Yt=!!x.aoMap,Rt=!!x.lightMap,pn=!!x.bumpMap&&x.wireframe===!1,mt=!!x.normalMap,Qn=!!x.displacementMap,Ft=!!x.emissiveMap,wn=!!x.metalnessMap,En=!!x.roughnessMap,An=x.anisotropy>0,D=x.clearcoat>0,Rn=x.diffuseRoughness>0,ft=x.dispersion>0,pt=x.retroreflectivity>0,pe=x.iridescence>0,Ct=x.sheen>0,Le=x.transmission>0,ze=An&&!!x.anisotropyMap,w=D&&!!x.clearcoatMap,y=D&&!!x.clearcoatNormalMap,z=D&&!!x.clearcoatRoughnessMap,se=Rn&&!!x.diffuseRoughnessMap,Q=pe&&!!x.iridescenceMap,ae=pe&&!!x.iridescenceThicknessMap,de=Ct&&!!x.sheenColorMap,K=Ct&&!!x.sheenRoughnessMap,J=!!x.specularMap,ce=!!x.specularColorMap,C=!!x.specularIntensityMap,j=Le&&!!x.transmissionMap,Z=Le&&!!x.thicknessMap,he=!!x.gradientMap,oe=!!x.alphaMap,le=x.alphaTest>0,Ce=!!x.alphaHash,Xe=!!x.extensions,re=ci;x.toneMapped&&(Pe===null||Pe.isXRRenderTarget===!0)&&(re=i.toneMapping);let Ie=Je?B.isCompressedCubeTexture?B.image[0].mipmaps:B.mipmaps:null,We={shaderID:ne,shaderType:x.type,shaderName:x.name,vertexShader:He,fragmentShader:$,defines:x.defines,customVertexShaderID:_e,customFragmentShaderID:Se,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:X,batching:Tt,batchingColor:Tt&&U._colorsTexture!==null,instancing:Ve,instancingColor:Ve&&U.instanceColor!==null,instancingMorph:Ve&&U.morphTexture!==null,outputColorSpace:Pe===null?i.outputColorSpace:Pe.isXRRenderTarget===!0?Pe.texture.colorSpace:Ye.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:De,matcap:it,envMap:lt,envMapMode:lt&&B.mapping,envMapPMREM:Je,envMapMaxLod:Je?Ie.length-1:null,envMapSize:Je?Ie[0].width:null,aoMap:Yt,lightMap:Rt,bumpMap:pn,normalMap:mt,displacementMap:Qn,emissiveMap:Ft,normalMapObjectSpace:mt&&x.normalMapType===Kf,normalMapTangentSpace:mt&&x.normalMapType===qo,packedNormalMap:mt&&x.normalMapType===qo&&pv(x.normalMap.format),metalnessMap:wn,roughnessMap:En,anisotropy:An,anisotropyMap:ze,clearcoat:D,clearcoatMap:w,clearcoatNormalMap:y,clearcoatRoughnessMap:z,diffuseRoughness:Rn,diffuseRoughnessMap:se,dispersion:ft,retroreflection:pt,iridescence:pe,iridescenceMap:Q,iridescenceThicknessMap:ae,sheen:Ct,sheenColorMap:de,sheenRoughnessMap:K,specularMap:J,specularColorMap:ce,specularIntensityMap:C,transmission:Le,transmissionMap:j,thicknessMap:Z,gradientMap:he,opaque:x.transparent===!1&&x.blending===$i&&x.alphaToCoverage===!1,alphaMap:oe,alphaTest:le,alphaHash:Ce,combine:x.combine,mapUv:De&&f(x.map.channel),aoMapUv:Yt&&f(x.aoMap.channel),lightMapUv:Rt&&f(x.lightMap.channel),bumpMapUv:pn&&f(x.bumpMap.channel),normalMapUv:mt&&f(x.normalMap.channel),displacementMapUv:Qn&&f(x.displacementMap.channel),emissiveMapUv:Ft&&f(x.emissiveMap.channel),metalnessMapUv:wn&&f(x.metalnessMap.channel),roughnessMapUv:En&&f(x.roughnessMap.channel),anisotropyMapUv:ze&&f(x.anisotropyMap.channel),clearcoatMapUv:w&&f(x.clearcoatMap.channel),clearcoatNormalMapUv:y&&f(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:z&&f(x.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:se&&f(x.diffuseRoughnessMap.channel),iridescenceMapUv:Q&&f(x.iridescenceMap.channel),iridescenceThicknessMapUv:ae&&f(x.iridescenceThicknessMap.channel),sheenColorMapUv:de&&f(x.sheenColorMap.channel),sheenRoughnessMapUv:K&&f(x.sheenRoughnessMap.channel),specularMapUv:J&&f(x.specularMap.channel),specularColorMapUv:ce&&f(x.specularColorMap.channel),specularIntensityMapUv:C&&f(x.specularIntensityMap.channel),transmissionMapUv:j&&f(x.transmissionMap.channel),thicknessMapUv:Z&&f(x.thicknessMap.channel),alphaMapUv:oe&&f(x.alphaMap.channel),vertexTangents:!!I.attributes.tangent&&(mt||An),vertexNormals:!!I.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!I.attributes.color&&I.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!I.attributes.uv&&(De||oe),fog:!!q,useFog:x.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||I.attributes.normal===void 0&&mt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:xe,skinning:U.isSkinnedMesh===!0,hasPositionAttribute:I.attributes.position!==void 0,morphTargets:I.morphAttributes.position!==void 0,morphNormals:I.morphAttributes.normal!==void 0,morphColors:I.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:Me,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:V.filter(me=>me.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&F.length>0,shadowMapType:i.shadowMap.type,toneMapping:re,decodeVideoTexture:De&&x.map.isVideoTexture===!0&&Ye.getTransfer(x.map.colorSpace)===nt,decodeVideoTextureEmissive:Ft&&x.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(x.emissiveMap.colorSpace)===nt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Un,flipSided:x.side===Nt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Xe&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xe&&x.extensions.multiDraw===!0||Tt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return We.vertexUv1s=l.has(1),We.vertexUv2s=l.has(2),We.vertexUv3s=l.has(3),l.clear(),We}function v(x){let b=[];if(x.shaderID?b.push(x.shaderID):(b.push(x.customVertexShaderID),b.push(x.customFragmentShaderID)),x.defines!==void 0)for(let F in x.defines)b.push(F),b.push(x.defines[F]);return x.isRawShaderMaterial===!1&&(p(b,x),m(b,x),b.push(i.outputColorSpace)),b.push(x.customProgramCacheKey),b.join()}function p(x,b){x.push(b.precision),x.push(b.outputColorSpace),x.push(b.envMapMode),x.push(b.envMapPMREM),x.push(b.envMapMaxLod),x.push(b.envMapSize),x.push(b.mapUv),x.push(b.alphaMapUv),x.push(b.lightMapUv),x.push(b.aoMapUv),x.push(b.bumpMapUv),x.push(b.normalMapUv),x.push(b.displacementMapUv),x.push(b.emissiveMapUv),x.push(b.metalnessMapUv),x.push(b.roughnessMapUv),x.push(b.anisotropyMapUv),x.push(b.clearcoatMapUv),x.push(b.clearcoatNormalMapUv),x.push(b.clearcoatRoughnessMapUv),x.push(b.diffuseRoughnessMapUv),x.push(b.iridescenceMapUv),x.push(b.iridescenceThicknessMapUv),x.push(b.sheenColorMapUv),x.push(b.sheenRoughnessMapUv),x.push(b.specularMapUv),x.push(b.specularColorMapUv),x.push(b.specularIntensityMapUv),x.push(b.transmissionMapUv),x.push(b.thicknessMapUv),x.push(b.combine),x.push(b.fogExp2),x.push(b.sizeAttenuation),x.push(b.morphTargetsCount),x.push(b.numSunLights),x.push(b.numDirLights),x.push(b.numPointLights),x.push(b.numSpotLights),x.push(b.numSpotLightMaps),x.push(b.numHemiLights),x.push(b.numRectAreaLights),x.push(b.numSunLightShadows),x.push(b.numDirLightShadows),x.push(b.numPointLightShadows),x.push(b.numSpotLightShadows),x.push(b.numSpotLightShadowsWithMaps),x.push(b.numLightProbes),x.push(b.numLightProbeGrids),x.push(b.shadowMapType),x.push(b.toneMapping),x.push(b.numClippingPlanes),x.push(b.numClipIntersection),x.push(b.depthPacking)}function m(x,b){o.disableAll(),b.instancing&&o.enable(0),b.instancingColor&&o.enable(1),b.instancingMorph&&o.enable(2),b.matcap&&o.enable(3),b.envMap&&o.enable(4),b.normalMapObjectSpace&&o.enable(5),b.normalMapTangentSpace&&o.enable(6),b.clearcoat&&o.enable(7),b.iridescence&&o.enable(8),b.alphaTest&&o.enable(9),b.vertexColors&&o.enable(10),b.vertexAlphas&&o.enable(11),b.vertexUv1s&&o.enable(12),b.vertexUv2s&&o.enable(13),b.vertexUv3s&&o.enable(14),b.vertexTangents&&o.enable(15),b.anisotropy&&o.enable(16),b.alphaHash&&o.enable(17),b.batching&&o.enable(18),b.dispersion&&o.enable(19),b.retroreflection&&o.enable(24),b.diffuseRoughness&&o.enable(25),b.batchingColor&&o.enable(20),b.gradientMap&&o.enable(21),b.packedNormalMap&&o.enable(22),b.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),b.numLightProbeGrids>0&&o.enable(22),b.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function S(x){let b=d[x.type],F;if(b){let P=di[b];F=lp.clone(P.uniforms)}else F=x.uniforms;return F}function A(x,b){let F=h.get(b);return F!==void 0?++F.usedTimes:(F=new dv(i,b,x,s),c.push(F),h.set(b,F)),F}function T(x){if(--x.usedTimes===0){let b=c.indexOf(x);c[b]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function R(x){a.remove(x)}function E(){a.dispose()}return{getParameters:_,getProgramCacheKey:v,getUniforms:S,acquireProgram:A,releaseProgram:T,releaseShaderCache:R,programs:c,dispose:E}}function gv(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function _v(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Rp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Cp(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,_,v,p,m){let S=i[e];return S===void 0?(S={id:d.id,object:d,geometry:f,material:_,materialVariant:o(d),groupOrder:v,renderOrder:d.renderOrder,z:p,group:m},i[e]=S):(S.id=d.id,S.object=d,S.geometry=f,S.material=_,S.materialVariant=o(d),S.groupOrder=v,S.renderOrder=d.renderOrder,S.z=p,S.group=m),e++,S}function l(d,f,_,v,p,m,S){S.reversedDepth===!0&&(p=-p);let A=a(d,f,_,v,p,m);_.transmission>0?n.push(A):_.transparent===!0?s.push(A):t.push(A)}function c(d,f,_,v,p,m){let S=a(d,f,_,v,p,m);_.transmission>0?n.unshift(S):_.transparent===!0?s.unshift(S):t.unshift(S)}function h(d,f){t.length>1&&t.sort(d||_v),n.length>1&&n.sort(f||Rp),s.length>1&&s.sort(f||Rp)}function u(){for(let d=e,f=i.length;d<f;d++){let _=i[d];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function xv(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Cp,i.set(n,[o])):s>=r.length?(o=new Cp,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function yv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new O,color:new Ae};break;case"SpotLight":t={position:new O,direction:new O,color:new Ae,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new Ae,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new Ae,groundColor:new Ae};break;case"RectAreaLight":t={color:new Ae,position:new O,halfWidth:new O,halfHeight:new O};break}return i[e.id]=t,t}}}function vv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Mv=0;function Sv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function bv(i){let e=new yv,t=vv(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);let s=new O,r=new Be,o=new Be;function a(c){let h=0,u=0,d=0;for(let V=0;V<9;V++)n.probe[V].set(0,0,0);let f=0,_=0,v=0,p=0,m=0,S=0,A=0,T=0,R=0,E=0,x=0,b=0,F=0,P=0;c.sort(Sv);for(let V=0,q=c.length;V<q;V++){let I=c[V],N=I.color,H=I.intensity,B=I.distance,ne=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===ji?ne=I.shadow.map.texture:ne=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=N.r*H,u+=N.g*H,d+=N.b*H;else if(I.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(I.sh.coefficients[X],H);P++}else if(I.isSunLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let Y=I.shadow,ie=t.get(I);ie.shadowIntensity=Y.intensity,ie.shadowBias=Y.bias,ie.shadowNormalBias=Y.normalBias,ie.shadowRadius=Y.radius,ie.shadowMapSize.copy(Y.mapSize).multiply(Y.getFrameExtents()),n.sunShadow[_]=ie,n.sunShadowMap[_]=ne;let Me=Y.getViewportCount();for(let He=0;He<Me;He++)n.sunShadowMatrix[v+He]=Y.getMatrix(He),n.sunShadowCascade[v+He]=Y._cascadeData[He];v+=Me,_++}n.sun[f]=X,f++}else if(I.isDirectionalLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let Y=I.shadow,ie=t.get(I);ie.shadowIntensity=Y.intensity,ie.shadowBias=Y.bias,ie.shadowNormalBias=Y.normalBias,ie.shadowRadius=Y.radius,ie.shadowMapSize=Y.mapSize,n.directionalShadow[p]=ie,n.directionalShadowMap[p]=ne,n.directionalShadowMatrix[p]=I.shadow.matrix,R++}n.directional[p]=X,p++}else if(I.isSpotLight){let X=e.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(N).multiplyScalar(H),X.distance=B,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,n.spot[S]=X;let Y=I.shadow;if(I.map&&(n.spotLightMap[b]=I.map,b++,Y.updateMatrices(I),I.castShadow&&F++),n.spotLightMatrix[S]=Y.matrix,I.castShadow){let ie=t.get(I);ie.shadowIntensity=Y.intensity,ie.shadowBias=Y.bias,ie.shadowNormalBias=Y.normalBias,ie.shadowRadius=Y.radius,ie.shadowMapSize=Y.mapSize,n.spotShadow[S]=ie,n.spotShadowMap[S]=ne,x++}S++}else if(I.isRectAreaLight){let X=e.get(I);X.color.copy(N).multiplyScalar(H),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),n.rectArea[A]=X,A++}else if(I.isPointLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){let Y=I.shadow,ie=t.get(I);ie.shadowIntensity=Y.intensity,ie.shadowBias=Y.bias,ie.shadowNormalBias=Y.normalBias,ie.shadowRadius=Y.radius,ie.shadowMapSize=Y.mapSize,ie.shadowCameraNear=Y.camera.near,ie.shadowCameraFar=Y.camera.far,n.pointShadow[m]=ie,n.pointShadowMap[m]=ne,n.pointShadowMatrix[m]=I.shadow.matrix,E++}n.point[m]=X,m++}else if(I.isHemisphereLight){let X=e.get(I);X.skyColor.copy(I.color).multiplyScalar(H),X.groundColor.copy(I.groundColor).multiplyScalar(H),n.hemi[T]=X,T++}}A>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ge.LTC_FLOAT_1,n.rectAreaLTC2=ge.LTC_FLOAT_2):(n.rectAreaLTC1=ge.LTC_HALF_1,n.rectAreaLTC2=ge.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let U=n.hash;(U.sunLength!==f||U.directionalLength!==p||U.pointLength!==m||U.spotLength!==S||U.rectAreaLength!==A||U.hemiLength!==T||U.numSunShadows!==_||U.numDirectionalShadows!==R||U.numPointShadows!==E||U.numSpotShadows!==x||U.numSpotMaps!==b||U.numLightProbes!==P)&&(n.sun.length=f,n.directional.length=p,n.spot.length=S,n.rectArea.length=A,n.point.length=m,n.hemi.length=T,n.sunShadow.length=_,n.sunShadowMap.length=_,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=R,n.directionalShadowMap.length=R,n.directionalShadowMatrix.length=R,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=x,n.spotShadowMap.length=x,n.spotLightMatrix.length=x+b-F,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=F,n.numLightProbes=P,U.sunLength=f,U.directionalLength=p,U.pointLength=m,U.spotLength=S,U.rectAreaLength=A,U.hemiLength=T,U.numSunShadows=_,U.numDirectionalShadows=R,U.numPointShadows=E,U.numSpotShadows=x,U.numSpotMaps=b,U.numLightProbes=P,n.version=Mv++)}function l(c,h){let u=0,d=0,f=0,_=0,v=0,p=0,m=h.matrixWorldInverse;for(let S=0,A=c.length;S<A;S++){let T=c[S];if(T.isSunLight){let R=n.sun[u];R.direction.setFromMatrixPosition(T.matrixWorld),R.direction.transformDirection(m),u++}else if(T.isDirectionalLight){let R=n.directional[d];R.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(m),d++}else if(T.isSpotLight){let R=n.spot[_];R.position.setFromMatrixPosition(T.matrixWorld),R.position.applyMatrix4(m),R.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),R.direction.sub(s),R.direction.transformDirection(m),_++}else if(T.isRectAreaLight){let R=n.rectArea[v];R.position.setFromMatrixPosition(T.matrixWorld),R.position.applyMatrix4(m),o.identity(),r.copy(T.matrixWorld),r.premultiply(m),o.extractRotation(r),R.halfWidth.set(T.width*.5,0,0),R.halfHeight.set(0,T.height*.5,0),R.halfWidth.applyMatrix4(o),R.halfHeight.applyMatrix4(o),v++}else if(T.isPointLight){let R=n.point[f];R.position.setFromMatrixPosition(T.matrixWorld),R.position.applyMatrix4(m),f++}else if(T.isHemisphereLight){let R=n.hemi[p];R.direction.setFromMatrixPosition(T.matrixWorld),R.direction.transformDirection(m),p++}}}return{setup:a,setupView:l,state:n}}function Ip(i){let e=new bv(i),t=[],n=[],s=[];function r(u){h.camera=u,t.length=0,n.length=0,s.length=0}function o(u){u.isLightProbeGrid?s.push(u):t.push(u)}function a(u){n.push(u)}function l(){e.setup(t),s.sort((u,d)=>u.priority-d.priority||u.id-d.id)}function c(u){e.setupView(t,u)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Tv(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Ip(i),e.set(s,[a])):r>=o.length?(a=new Ip(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var wv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ev=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Av=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],Rv=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],Pp=new Be,Yo=new O,nu=new O;function Cv(i,e,t){let n=new Ki,s=new Oe,r=new Oe,o=new rt,a=new il,l=new sl,c={},h=t.maxTextureSize,u={[li]:Nt,[Nt]:li,[Un]:Un},d=new Dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:wv,fragmentShader:Ev}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let _=new St;_.setAttribute("position",new yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Qe(_,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fo;let m=this.type;this.render=function(E,x,b){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;this.type===pl&&(Re("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Fo);let F=i.getRenderTarget(),P=i.getActiveCubeFace(),U=i.getActiveMipmapLevel(),V=i.state;V.setBlending(Ps),V.buffers.depth.getReversed()===!0?V.buffers.color.setClear(0,0,0,0):V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let q=m!==this.type;q&&x.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(N=>N.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,N=E.length;I<N;I++){let H=E[I],B=H.shadow;if(B===void 0){Re("WebGLShadowMap:",H,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;s.copy(B.mapSize);let ne=B.getFrameExtents();s.multiply(ne),r.copy(B.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ne.x),s.x=r.x*ne.x,B.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ne.y),s.y=r.y*ne.y,B.mapSize.y=r.y));let X=i.state.buffers.depth.getReversed();if(B.camera._reversedDepth=X,B.map===null||q===!0){if(B.map!==null&&(B.map.depthTexture!==null&&(B.map.depthTexture.dispose(),B.map.depthTexture=null),B.map.dispose()),this.type===Rr){if(H.isPointLight){Re("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}B.map=new Mn(s.x,s.y,{format:ji,type:Yn,minFilter:Pt,magFilter:Pt,generateMipmaps:!1}),B.map.texture.name=H.name+".shadowMap",B.map.depthTexture=new Ai(s.x,s.y,bn),B.map.depthTexture.name=H.name+".shadowMapDepth",B.map.depthTexture.format=Ti,B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Mt,B.map.depthTexture.magFilter=Mt}else H.isPointLight?(B.map=new Ko(s.x),B.map.depthTexture=new Eo(s.x,qn)):(B.map=new Mn(s.x,s.y),B.map.depthTexture=new Ai(s.x,s.y,qn)),B.map.depthTexture.name=H.name+".shadowMap",B.map.depthTexture.format=Ti,this.type===Fo?(B.map.depthTexture.compareFunction=X?Bh:Fh,B.map.depthTexture.minFilter=Pt,B.map.depthTexture.magFilter=Pt):(B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Mt,B.map.depthTexture.magFilter=Mt);B.camera.updateProjectionMatrix()}B.map.isWebGLCubeRenderTarget!==!0&&(B.map.width!==s.x||B.map.height!==s.y)&&B.map.setSize(s.x,s.y);let Y=B.map.isWebGLCubeRenderTarget?6:B.getViewportCount();H.isPointLight!==!0&&B.updateMatrices(H,b);let ie=(B.camera.layers.mask&4294967294)!==0?B.camera.layers:b.layers;for(let Me=0;Me<Y;Me++){let He=B.getCamera(Me);if(H.isPointLight){let $=B.camera,_e=B.matrix,Se=H.distance||$.far;Se!==$.far&&($.far=Se,$.updateProjectionMatrix()),Yo.setFromMatrixPosition(H.matrixWorld),$.position.copy(Yo),nu.copy($.position),nu.add(Av[Me]),$.up.copy(Rv[Me]),$.lookAt(nu),$.updateMatrixWorld(),_e.makeTranslation(-Yo.x,-Yo.y,-Yo.z),Pp.multiplyMatrices($.projectionMatrix,$.matrixWorldInverse),B._frustum.setFromProjectionMatrix(Pp,$.coordinateSystem,$.reversedDepth)}if(B.map.isWebGLCubeRenderTarget)i.setRenderTarget(B.map,Me),i.clear();else{Me===0&&(i.setRenderTarget(B.map),i.clear());let $=B.getViewport(Me);o.set(r.x*$.x,r.y*$.y,r.x*$.z,r.y*$.w),V.viewport(o)}n=B.getFrustum(Me),T(x,b,He,H,ie,this.type)}B.isPointLightShadow!==!0&&this.type===Rr&&S(B,b),B.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(F,P,U)};function S(E,x){let b=e.update(v);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new Mn(s.x,s.y,{format:ji,type:Yn}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(x,null,b,d,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(x,null,b,f,v,null)}function A(E,x,b,F){let P=null,U=b.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(U!==void 0)P=U;else if(P=b.isPointLight===!0?l:a,i.localClippingEnabled&&x.clipShadows===!0&&Array.isArray(x.clippingPlanes)&&x.clippingPlanes.length!==0||x.displacementMap&&x.displacementScale!==0||x.alphaMap&&x.alphaTest>0||x.map&&x.alphaTest>0||x.alphaToCoverage===!0){let V=P.uuid,q=x.uuid,I=c[V];I===void 0&&(I={},c[V]=I);let N=I[q];N===void 0&&(N=P.clone(),I[q]=N,x.addEventListener("dispose",R)),P=N}if(P.visible=x.visible,P.wireframe=x.wireframe,F===Rr?P.side=x.shadowSide!==null?x.shadowSide:x.side:P.side=x.shadowSide!==null?x.shadowSide:u[x.side],P.alphaMap=x.alphaMap,P.alphaTest=x.alphaToCoverage===!0?.5:x.alphaTest,P.map=x.map,P.clipShadows=x.clipShadows,P.clippingPlanes=x.clippingPlanes,P.clipIntersection=x.clipIntersection,P.displacementMap=x.displacementMap,P.displacementScale=x.displacementScale,P.displacementBias=x.displacementBias,P.wireframeLinewidth=x.wireframeLinewidth,P.linewidth=x.linewidth,b.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let V=i.properties.get(P);V.light=b}return P}function T(E,x,b,F,P,U){if(E.visible===!1)return;if(E.layers.test(P)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&U===Rr)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,E.matrixWorld);let I=e.update(E),N=E.material;if(Array.isArray(N)){let H=I.groups;for(let B=0,ne=H.length;B<ne;B++){let X=H[B],Y=N[X.materialIndex];if(Y&&Y.visible){let ie=A(E,Y,F,U);E.onBeforeShadow(i,E,x,b,I,ie,X),i.renderBufferDirect(b,null,I,ie,E,X),E.onAfterShadow(i,E,x,b,I,ie,X)}}}else if(N.visible){let H=A(E,N,F,U);E.onBeforeShadow(i,E,x,b,I,H,null),i.renderBufferDirect(b,null,I,H,E,null),E.onAfterShadow(i,E,x,b,I,H,null)}}let q=E.children;for(let I=0,N=q.length;I<N;I++)T(q[I],x,b,F,P,U)}function R(E){E.target.removeEventListener("dispose",R);for(let b in c){let F=c[b],P=E.target.uuid;P in F&&(F[P].dispose(),delete F[P])}}}function Iv(i,e){function t(){let C=!1,j=new rt,Z=null,he=new rt(0,0,0,0);return{setMask:function(oe){Z!==oe&&!C&&(i.colorMask(oe,oe,oe,oe),Z=oe)},setLocked:function(oe){C=oe},setClear:function(oe,le,Ce,Xe,re){re===!0&&(oe*=Xe,le*=Xe,Ce*=Xe),j.set(oe,le,Ce,Xe),he.equals(j)===!1&&(i.clearColor(oe,le,Ce,Xe),he.copy(j))},reset:function(){C=!1,Z=null,he.set(-1,0,0,0)}}}function n(){let C=!1,j=!1,Z=null,he=null,oe=null;return{setReversed:function(le){if(j!==le){let Ce=e.get("EXT_clip_control");le?Ce.clipControlEXT(Ce.LOWER_LEFT_EXT,Ce.ZERO_TO_ONE_EXT):Ce.clipControlEXT(Ce.LOWER_LEFT_EXT,Ce.NEGATIVE_ONE_TO_ONE_EXT),j=le;let Xe=oe;oe=null,this.setClear(Xe)}},getReversed:function(){return j},setTest:function(le){le?xe(i.DEPTH_TEST):Ve(i.DEPTH_TEST)},setMask:function(le){Z!==le&&!C&&(i.depthMask(le),Z=le)},setFunc:function(le){if(j&&(le=rp[le]),he!==le){switch(le){case Va:i.depthFunc(i.NEVER);break;case Wa:i.depthFunc(i.ALWAYS);break;case Xa:i.depthFunc(i.LESS);break;case fr:i.depthFunc(i.LEQUAL);break;case qa:i.depthFunc(i.EQUAL);break;case Ya:i.depthFunc(i.GEQUAL);break;case Za:i.depthFunc(i.GREATER);break;case Ka:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}he=le}},setLocked:function(le){C=le},setClear:function(le){oe!==le&&(oe=le,j&&(le=1-le),i.clearDepth(le))},reset:function(){C=!1,Z=null,he=null,oe=null,j=!1}}}function s(){let C=!1,j=null,Z=null,he=null,oe=null,le=null,Ce=null,Xe=null,re=null;return{setTest:function(Ie){C||(Ie?xe(i.STENCIL_TEST):Ve(i.STENCIL_TEST))},setMask:function(Ie){j!==Ie&&!C&&(i.stencilMask(Ie),j=Ie)},setFunc:function(Ie,We,me){(Z!==Ie||he!==We||oe!==me)&&(i.stencilFunc(Ie,We,me),Z=Ie,he=We,oe=me)},setOp:function(Ie,We,me){(le!==Ie||Ce!==We||Xe!==me)&&(i.stencilOp(Ie,We,me),le=Ie,Ce=We,Xe=me)},setLocked:function(Ie){C=Ie},setClear:function(Ie){re!==Ie&&(i.clearStencil(Ie),re=Ie)},reset:function(){C=!1,j=null,Z=null,he=null,oe=null,le=null,Ce=null,Xe=null,re=null}}}let r=new t,o=new n,a=new s,l={},c=new WeakMap,h={},u={},d={},f=new WeakMap,_=[],v=null,p=!1,m=null,S=null,A=null,T=null,R=null,E=null,x=null,b=new Ae(0,0,0),F=0,P=!1,U=null,V=null,q=null,I=null,N=null,H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),B=!1,ne=0,X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(X)[1]),B=ne>=1):X.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),B=ne>=2);let Y=null,ie={},Me=i.getParameter(i.SCISSOR_BOX),He=i.getParameter(i.VIEWPORT),$=new rt().fromArray(Me),_e=new rt().fromArray(He);function Se(C,j,Z,he){let oe=new Uint8Array(4),le=i.createTexture();i.bindTexture(C,le),i.texParameteri(C,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(C,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ce=0;Ce<Z;Ce++)C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,he,0,i.RGBA,i.UNSIGNED_BYTE,oe):i.texImage2D(j+Ce,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,oe);return le}let Pe={};Pe[i.TEXTURE_2D]=Se(i.TEXTURE_2D,i.TEXTURE_2D,1),Pe[i.TEXTURE_CUBE_MAP]=Se(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Pe[i.TEXTURE_2D_ARRAY]=Se(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Pe[i.TEXTURE_3D]=Se(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),xe(i.DEPTH_TEST),o.setFunc(fr),pn(!1),mt(xh),xe(i.CULL_FACE),Yt(Ps);function xe(C){h[C]!==!0&&(i.enable(C),h[C]=!0)}function Ve(C){h[C]!==!1&&(i.disable(C),h[C]=!1)}function Tt(C,j){return d[C]!==j?(i.bindFramebuffer(C,j),d[C]=j,C===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=j),C===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=j),!0):!1}function De(C,j){let Z=_,he=!1;if(C){Z=f.get(j),Z===void 0&&(Z=[],f.set(j,Z));let oe=C.textures;if(Z.length!==oe.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let le=0,Ce=oe.length;le<Ce;le++)Z[le]=i.COLOR_ATTACHMENT0+le;Z.length=oe.length,he=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,he=!0);he&&i.drawBuffers(Z)}function it(C){return v!==C?(i.useProgram(C),v=C,!0):!1}let lt={[Ns]:i.FUNC_ADD,[Af]:i.FUNC_SUBTRACT,[Rf]:i.FUNC_REVERSE_SUBTRACT};lt[Cf]=i.MIN,lt[If]=i.MAX;let Je={[Pf]:i.ZERO,[Lf]:i.ONE,[Nf]:i.SRC_COLOR,[Mh]:i.SRC_ALPHA,[kf]:i.SRC_ALPHA_SATURATE,[Ff]:i.DST_COLOR,[Uf]:i.DST_ALPHA,[Df]:i.ONE_MINUS_SRC_COLOR,[Sh]:i.ONE_MINUS_SRC_ALPHA,[Bf]:i.ONE_MINUS_DST_COLOR,[Of]:i.ONE_MINUS_DST_ALPHA,[zf]:i.CONSTANT_COLOR,[Hf]:i.ONE_MINUS_CONSTANT_COLOR,[Gf]:i.CONSTANT_ALPHA,[Vf]:i.ONE_MINUS_CONSTANT_ALPHA};function Yt(C,j,Z,he,oe,le,Ce,Xe,re,Ie){if(C===Ps){p===!0&&(Ve(i.BLEND),p=!1);return}if(p===!1&&(xe(i.BLEND),p=!0),C!==Ef){if(C!==m||Ie!==P){if((S!==Ns||R!==Ns)&&(i.blendEquation(i.FUNC_ADD),S=Ns,R=Ns),Ie)switch(C){case $i:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ls:i.blendFunc(i.ONE,i.ONE);break;case yh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case vh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ue("WebGLState: Invalid blending: ",C);break}else switch(C){case $i:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ls:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case yh:Ue("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case vh:Ue("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ue("WebGLState: Invalid blending: ",C);break}A=null,T=null,E=null,x=null,b.set(0,0,0),F=0,m=C,P=Ie}return}oe=oe||j,le=le||Z,Ce=Ce||he,(j!==S||oe!==R)&&(i.blendEquationSeparate(lt[j],lt[oe]),S=j,R=oe),(Z!==A||he!==T||le!==E||Ce!==x)&&(i.blendFuncSeparate(Je[Z],Je[he],Je[le],Je[Ce]),A=Z,T=he,E=le,x=Ce),(Xe.equals(b)===!1||re!==F)&&(i.blendColor(Xe.r,Xe.g,Xe.b,re),b.copy(Xe),F=re),m=C,P=!1}function Rt(C,j){C.side===Un?Ve(i.CULL_FACE):xe(i.CULL_FACE);let Z=C.side===Nt;j&&(Z=!Z),pn(Z),C.blending===$i&&C.transparent===!1?Yt(Ps):Yt(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),o.setFunc(C.depthFunc),o.setTest(C.depthTest),o.setMask(C.depthWrite),r.setMask(C.colorWrite);let he=C.stencilWrite;a.setTest(he),he&&(a.setMask(C.stencilWriteMask),a.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),a.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),Ft(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?xe(i.SAMPLE_ALPHA_TO_COVERAGE):Ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function pn(C){U!==C&&(C?i.frontFace(i.CW):i.frontFace(i.CCW),U=C)}function mt(C){C!==Tf?(xe(i.CULL_FACE),C!==V&&(C===xh?i.cullFace(i.BACK):C===wf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ve(i.CULL_FACE),V=C}function Qn(C){C!==q&&(B&&i.lineWidth(C),q=C)}function Ft(C,j,Z){C?(xe(i.POLYGON_OFFSET_FILL),(I!==j||N!==Z)&&(I=j,N=Z,o.getReversed()&&(j=-j,Z=-Z),i.polygonOffset(j,Z))):Ve(i.POLYGON_OFFSET_FILL)}function wn(C){C?xe(i.SCISSOR_TEST):Ve(i.SCISSOR_TEST)}function En(C){C===void 0&&(C=i.TEXTURE0+H-1),Y!==C&&(i.activeTexture(C),Y=C)}function An(C,j,Z){Z===void 0&&(Y===null?Z=i.TEXTURE0+H-1:Z=Y);let he=ie[Z];he===void 0&&(he={type:void 0,texture:void 0},ie[Z]=he),(he.type!==C||he.texture!==j)&&(Y!==Z&&(i.activeTexture(Z),Y=Z),i.bindTexture(C,j||Pe[C]),he.type=C,he.texture=j)}function D(){let C=ie[Y];C!==void 0&&C.type!==void 0&&(i.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)}function Rn(){try{i.compressedTexImage2D(...arguments)}catch(C){Ue("WebGLState:",C)}}function ft(){try{i.compressedTexImage3D(...arguments)}catch(C){Ue("WebGLState:",C)}}function pt(){try{i.texSubImage2D(...arguments)}catch(C){Ue("WebGLState:",C)}}function pe(){try{i.texSubImage3D(...arguments)}catch(C){Ue("WebGLState:",C)}}function Ct(){try{i.compressedTexSubImage2D(...arguments)}catch(C){Ue("WebGLState:",C)}}function Le(){try{i.compressedTexSubImage3D(...arguments)}catch(C){Ue("WebGLState:",C)}}function ze(){try{i.texStorage2D(...arguments)}catch(C){Ue("WebGLState:",C)}}function w(){try{i.texStorage3D(...arguments)}catch(C){Ue("WebGLState:",C)}}function y(){try{i.texImage2D(...arguments)}catch(C){Ue("WebGLState:",C)}}function z(){try{i.texImage3D(...arguments)}catch(C){Ue("WebGLState:",C)}}function se(C){return u[C]!==void 0?u[C]:i.getParameter(C)}function Q(C,j){u[C]!==j&&(i.pixelStorei(C,j),u[C]=j)}function ae(C){$.equals(C)===!1&&(i.scissor(C.x,C.y,C.z,C.w),$.copy(C))}function de(C){_e.equals(C)===!1&&(i.viewport(C.x,C.y,C.z,C.w),_e.copy(C))}function K(C,j){let Z=c.get(j);Z===void 0&&(Z=new WeakMap,c.set(j,Z));let he=Z.get(C);he===void 0&&(he=i.getUniformBlockIndex(j,C.name),i.uniformBlockBinding(j,he,he),Z.set(C,he))}function J(C,j,Z){let oe=c.get(j).get(C);l[oe]!==Z&&(i.bindBufferBase(i.UNIFORM_BUFFER,oe,Z),l[oe]=Z)}function ce(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},Y=null,ie={},d={},l={},f=new WeakMap,_=[],v=null,p=!1,m=null,S=null,A=null,T=null,R=null,E=null,x=null,b=new Ae(0,0,0),F=0,P=!1,U=null,V=null,q=null,I=null,N=null,$.set(0,0,i.canvas.width,i.canvas.height),_e.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:xe,disable:Ve,bindFramebuffer:Tt,drawBuffers:De,useProgram:it,setBlending:Yt,setMaterial:Rt,setFlipSided:pn,setCullFace:mt,setLineWidth:Qn,setPolygonOffset:Ft,setScissorTest:wn,activeTexture:En,bindTexture:An,unbindTexture:D,compressedTexImage2D:Rn,compressedTexImage3D:ft,texImage2D:y,texImage3D:z,pixelStorei:Q,getParameter:se,updateUBOMapping:K,uniformBlockBinding:J,texStorage2D:ze,texStorage3D:w,texSubImage2D:pt,texSubImage3D:pe,compressedTexSubImage2D:Ct,compressedTexSubImage3D:Le,scissor:ae,viewport:de,reset:ce}}function Pv(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,h=new WeakMap,u=new Set,d,f=new WeakMap,_=new Set,v=new FinalizationRegistry(w=>_.delete(w)),p=!1;try{p=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(w,y){return p?new OffscreenCanvas(w,y):gr("canvas")}function S(w,y,z){let se=1,Q=ze(w);if((Q.width>z||Q.height>z)&&(se=z/Math.max(Q.width,Q.height)),se<1)if(typeof HTMLImageElement!="undefined"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&w instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&w instanceof ImageBitmap||typeof VideoFrame!="undefined"&&w instanceof VideoFrame){let ae=Math.floor(se*Q.width),de=Math.floor(se*Q.height);d===void 0&&(d=m(ae,de));let K=y?m(ae,de):d;return K.width=ae,K.height=de,K.getContext("2d").drawImage(w,0,0,ae,de),Re("WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+ae+"x"+de+")."),K}else return"data"in w&&Re("WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),w;return w}function A(w){return w.generateMipmaps}function T(w){i.generateMipmap(w)}function R(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(w,y,z,se,Q,ae=!1){if(w!==null){if(i[w]!==void 0)return i[w];Re("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let de;se&&(de=e.get("EXT_texture_norm16"),de||Re("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=y;if(y===i.RED&&(z===i.FLOAT&&(K=i.R32F),z===i.HALF_FLOAT&&(K=i.R16F),z===i.UNSIGNED_BYTE&&(K=i.R8),z===i.UNSIGNED_SHORT&&de&&(K=de.R16_EXT),z===i.SHORT&&de&&(K=de.R16_SNORM_EXT)),y===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.R8UI),z===i.UNSIGNED_SHORT&&(K=i.R16UI),z===i.UNSIGNED_INT&&(K=i.R32UI),z===i.BYTE&&(K=i.R8I),z===i.SHORT&&(K=i.R16I),z===i.INT&&(K=i.R32I)),y===i.RG&&(z===i.FLOAT&&(K=i.RG32F),z===i.HALF_FLOAT&&(K=i.RG16F),z===i.UNSIGNED_BYTE&&(K=i.RG8),z===i.UNSIGNED_SHORT&&de&&(K=de.RG16_EXT),z===i.SHORT&&de&&(K=de.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.RG8UI),z===i.UNSIGNED_SHORT&&(K=i.RG16UI),z===i.UNSIGNED_INT&&(K=i.RG32UI),z===i.BYTE&&(K=i.RG8I),z===i.SHORT&&(K=i.RG16I),z===i.INT&&(K=i.RG32I)),y===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.RGB8UI),z===i.UNSIGNED_SHORT&&(K=i.RGB16UI),z===i.UNSIGNED_INT&&(K=i.RGB32UI),z===i.BYTE&&(K=i.RGB8I),z===i.SHORT&&(K=i.RGB16I),z===i.INT&&(K=i.RGB32I)),y===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),z===i.UNSIGNED_INT&&(K=i.RGBA32UI),z===i.BYTE&&(K=i.RGBA8I),z===i.SHORT&&(K=i.RGBA16I),z===i.INT&&(K=i.RGBA32I)),y===i.RGB&&(z===i.UNSIGNED_SHORT&&de&&(K=de.RGB16_EXT),z===i.SHORT&&de&&(K=de.RGB16_SNORM_EXT),z===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),z===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),y===i.RGBA){let J=ae?fo:Ye.getTransfer(Q);z===i.FLOAT&&(K=i.RGBA32F),z===i.HALF_FLOAT&&(K=i.RGBA16F),z===i.UNSIGNED_BYTE&&(K=J===nt?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT&&de&&(K=de.RGBA16_EXT),z===i.SHORT&&de&&(K=de.RGBA16_SNORM_EXT),z===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function x(w,y){let z;return w?y===null||y===qn||y===Os?z=i.DEPTH24_STENCIL8:y===bn?z=i.DEPTH32F_STENCIL8:y===Pr&&(z=i.DEPTH24_STENCIL8,Re("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===qn||y===Os?z=i.DEPTH_COMPONENT24:y===bn?z=i.DEPTH_COMPONENT32F:y===Pr&&(z=i.DEPTH_COMPONENT16),z}function b(w,y){return A(w)===!0||w.isFramebufferTexture&&w.minFilter!==Mt&&w.minFilter!==Pt?Math.log2(Math.max(y.width,y.height))+1:w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?y.mipmaps.length:1}function F(w){let y=new WeakRef(w);n.get(w).__ref=y,_.add(y),v.register(w,y,y)}function P(w){let y=n.get(w).__ref;y!==void 0&&(_.delete(y),v.unregister(y))}function U(w){q(w.target)}function V(w){I(w.target)}function q(w){w.removeEventListener("dispose",U),P(w),H(w),w.isVideoTexture&&h.delete(w),w.isHTMLTexture&&u.delete(w)}function I(w){w.removeEventListener("dispose",V),P(w),ne(w)}function N(){for(let w of _){let y=w.deref();y!==void 0&&(y.isRenderTarget===!0?I(y):q(y))}_.clear(),u.clear()}function H(w){let y=n.get(w);if(y.__webglInit===void 0)return;let z=w.source,se=f.get(z);if(se){let Q=se[y.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&B(w),Object.keys(se).length===0&&f.delete(z)}n.remove(w)}function B(w){let y=n.get(w);i.deleteTexture(y.__webglTexture);let z=w.source,se=f.get(z);delete se[y.__cacheKey],o.memory.textures--}function ne(w){let y=n.get(w);y.__depthDisposeCallback&&y.__depthDisposeCallback();let z=w.depthTexture;if(z&&z.renderTarget===w&&q(z),w.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(y.__webglFramebuffer[Q]))for(let ae=0;ae<y.__webglFramebuffer[Q].length;ae++)i.deleteFramebuffer(y.__webglFramebuffer[Q][ae]);else i.deleteFramebuffer(y.__webglFramebuffer[Q]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[Q])}else{if(Array.isArray(y.__webglFramebuffer))for(let Q=0;Q<y.__webglFramebuffer.length;Q++)i.deleteFramebuffer(y.__webglFramebuffer[Q]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let Q=0;Q<y.__webglColorRenderbuffer.length;Q++)y.__webglColorRenderbuffer[Q]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[Q]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let se=w.textures;for(let Q=0,ae=se.length;Q<ae;Q++){let de=n.get(se[Q]);de.__webglTexture&&(i.deleteTexture(de.__webglTexture),o.memory.textures--),n.remove(se[Q])}n.remove(w)}let X=0;function Y(){X=0}function ie(){return X}function Me(w){X=w}function He(){let w=X;return w>=s.maxTextures&&Re("WebGLTextures: Trying to use "+(w+1)+" texture units while this GPU supports only "+s.maxTextures),X+=1,w}function $(w){let y=[];return y.push(w.wrapS),y.push(w.wrapT),y.push(w.wrapR||0),y.push(w.magFilter),y.push(w.minFilter),y.push(w.anisotropy),y.push(w.internalFormat),y.push(w.format),y.push(w.type),y.push(w.generateMipmaps),y.push(w.mipmapsAutoUpdate),y.push(w.premultiplyAlpha),y.push(w.flipY),y.push(w.unpackAlignment),y.push(w.colorSpace),y.join()}function _e(w,y){let z=n.get(w);if(w.isVideoTexture&&Ct(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&z.__version!==w.version){let se=w.image;if(se===null)Re("WebGLRenderer: Texture marked for update but no image data found.");else if(se.complete===!1)Re("WebGLRenderer: Texture marked for update but image is incomplete");else{Rt(z,w,y);return}}else w.isExternalTexture&&(z.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+y)}function Se(w,y){let z=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){Rt(z,w,y);return}else w.isExternalTexture&&(z.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+y)}function Pe(w,y){let z=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){Rt(z,w,y);return}t.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+y)}function xe(w,y){let z=n.get(w);if(w.version>0&&z.__version!==w.version){pn(z,w,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+y)}let Ve={[Ln]:i.REPEAT,[In]:i.CLAMP_TO_EDGE,[pr]:i.MIRRORED_REPEAT},Tt={[Mt]:i.NEAREST,[xl]:i.NEAREST_MIPMAP_NEAREST,[Us]:i.NEAREST_MIPMAP_LINEAR,[Pt]:i.LINEAR,[Ir]:i.LINEAR_MIPMAP_NEAREST,[On]:i.LINEAR_MIPMAP_LINEAR},De={[$f]:i.NEVER,[kh]:i.ALWAYS,[jf]:i.LESS,[Fh]:i.LEQUAL,[Qf]:i.EQUAL,[Bh]:i.GEQUAL,[ep]:i.GREATER,[tp]:i.NOTEQUAL};function it(w,y){if(y.type===bn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Pt||y.magFilter===Ir||y.magFilter===Us||y.magFilter===On||y.minFilter===Pt||y.minFilter===Ir||y.minFilter===Us||y.minFilter===On)&&Re("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,Ve[y.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,Ve[y.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,Ve[y.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,Tt[y.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,Tt[y.minFilter]),y.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,De[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Mt||y.minFilter!==Us&&y.minFilter!==On||y.type===bn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let z=e.get("EXT_texture_filter_anisotropic");i.texParameterf(w,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function lt(w,y){let z=!1;w.__webglInit===void 0&&(w.__webglInit=!0,y.addEventListener("dispose",U),F(y));let se=y.source,Q=f.get(se);Q===void 0&&(Q={},f.set(se,Q));let ae=$(y);if(ae!==w.__cacheKey){Q[ae]===void 0&&(Q[ae]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,z=!0),Q[ae].usedTimes++;let de=Q[w.__cacheKey];de!==void 0&&(Q[w.__cacheKey].usedTimes--,de.usedTimes===0&&B(y)),w.__cacheKey=ae,w.__webglTexture=Q[ae].texture}return z}function Je(w,y,z){return Math.floor(Math.floor(w/z)/y)}function Yt(w,y,z,se){let ae=w.updateRanges;if(ae.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,z,se,y.data);else{ae.sort((C,j)=>C.start-j.start);let de=0;for(let C=1;C<ae.length;C++){let j=ae[de],Z=ae[C],he=j.start+j.count,oe=Je(Z.start,y.width,4),le=Je(j.start,y.width,4);Z.start<=he+1&&oe===le&&Je(Z.start+Z.count-1,y.width,4)===oe?j.count=Math.max(j.count,Z.start+Z.count-j.start):(++de,ae[de]=Z)}ae.length=de+1;let K=t.getParameter(i.UNPACK_ROW_LENGTH),J=t.getParameter(i.UNPACK_SKIP_PIXELS),ce=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let C=0,j=ae.length;C<j;C++){let Z=ae[C],he=Math.floor(Z.start/4),oe=Math.ceil(Z.count/4),le=he%y.width,Ce=Math.floor(he/y.width),Xe=oe,re=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,le),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ce),t.texSubImage2D(i.TEXTURE_2D,0,le,Ce,Xe,re,z,se,y.data)}w.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,J),t.pixelStorei(i.UNPACK_SKIP_ROWS,ce)}}function Rt(w,y,z){let se=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(se=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(se=i.TEXTURE_3D);let Q=lt(w,y),ae=y.source;t.bindTexture(se,w.__webglTexture,i.TEXTURE0+z);let de=n.get(ae);if(ae.version!==de.__version||Q===!0){if(t.activeTexture(i.TEXTURE0+z),(typeof ImageBitmap!="undefined"&&y.image instanceof ImageBitmap)===!1){let re=Ye.getPrimaries(Ye.workingColorSpace),Ie=y.colorSpace===Di?null:Ye.getPrimaries(y.colorSpace),We=y.colorSpace===Di||re===Ie?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,We)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let J=S(y.image,!1,s.maxTextureSize);J=Le(y,J);let ce=r.convert(y.format,y.colorSpace),C=r.convert(y.type),j=E(y.internalFormat,ce,C,y.normalized,y.colorSpace,y.isVideoTexture);it(se,y);let Z,he=y.mipmaps,oe=y.isVideoTexture!==!0,le=de.__version===void 0||Q===!0,Ce=ae.dataReady,Xe=b(y,J);if(y.isDepthTexture)j=x(y.format===Ni,y.type),le&&(oe?t.texStorage2D(i.TEXTURE_2D,1,j,J.width,J.height):t.texImage2D(i.TEXTURE_2D,0,j,J.width,J.height,0,ce,C,null));else if(y.isDataTexture)if(he.length>0){oe&&le&&t.texStorage2D(i.TEXTURE_2D,Xe,j,he[0].width,he[0].height);for(let re=0,Ie=he.length;re<Ie;re++)Z=he[re],oe?Ce&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,Z.width,Z.height,ce,C,Z.data):t.texImage2D(i.TEXTURE_2D,re,j,Z.width,Z.height,0,ce,C,Z.data);y.generateMipmaps=!1}else oe?(le&&t.texStorage2D(i.TEXTURE_2D,Xe,j,J.width,J.height),Ce&&Yt(y,J,ce,C)):t.texImage2D(i.TEXTURE_2D,0,j,J.width,J.height,0,ce,C,J.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){oe&&le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Xe,j,he[0].width,he[0].height,J.depth);for(let re=0,Ie=he.length;re<Ie;re++)if(Z=he[re],y.format!==Fn)if(ce!==null)if(oe){if(Ce)if(y.layerUpdates.size>0){let We=Kh(Z.width,Z.height,y.format,y.type);for(let me of y.layerUpdates){let st=Z.data.subarray(me*We/Z.data.BYTES_PER_ELEMENT,(me+1)*We/Z.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,me,Z.width,Z.height,1,ce,st)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,0,Z.width,Z.height,J.depth,ce,Z.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,re,j,Z.width,Z.height,J.depth,0,Z.data,0,0);else Re("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else oe?Ce&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,re,0,0,0,Z.width,Z.height,J.depth,ce,C,Z.data):t.texImage3D(i.TEXTURE_2D_ARRAY,re,j,Z.width,Z.height,J.depth,0,ce,C,Z.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{oe&&le&&t.texStorage2D(i.TEXTURE_2D,Xe,j,he[0].width,he[0].height);for(let re=0,Ie=he.length;re<Ie;re++)Z=he[re],y.format!==Fn?ce!==null?oe?Ce&&t.compressedTexSubImage2D(i.TEXTURE_2D,re,0,0,Z.width,Z.height,ce,Z.data):t.compressedTexImage2D(i.TEXTURE_2D,re,j,Z.width,Z.height,0,Z.data):Re("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):oe?Ce&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,Z.width,Z.height,ce,C,Z.data):t.texImage2D(i.TEXTURE_2D,re,j,Z.width,Z.height,0,ce,C,Z.data)}else if(y.isDataArrayTexture)if(oe){if(le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Xe,j,J.width,J.height,J.depth),Ce)if(y.layerUpdates.size>0){let re=Kh(J.width,J.height,y.format,y.type);for(let Ie of y.layerUpdates){let We=J.data.subarray(Ie*re/J.data.BYTES_PER_ELEMENT,(Ie+1)*re/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ie,J.width,J.height,1,ce,C,We)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,ce,C,J.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,j,J.width,J.height,J.depth,0,ce,C,J.data);else if(y.isData3DTexture)oe?(le&&t.texStorage3D(i.TEXTURE_3D,Xe,j,J.width,J.height,J.depth),Ce&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,ce,C,J.data)):t.texImage3D(i.TEXTURE_3D,0,j,J.width,J.height,J.depth,0,ce,C,J.data);else if(y.isFramebufferTexture){if(le)if(oe)t.texStorage2D(i.TEXTURE_2D,Xe,j,J.width,J.height);else{let re=J.width,Ie=J.height;for(let We=0;We<Xe;We++)t.texImage2D(i.TEXTURE_2D,We,j,re,Ie,0,ce,C,null),re>>=1,Ie>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){let re=i.canvas;if(re.hasAttribute("layoutsubtree")||re.setAttribute("layoutsubtree","true"),J.parentNode!==re){re.appendChild(J),u.add(y),re.onpaint=Ie=>{let We=Ie.changedElements;for(let me of u)We.includes(me.image)&&(me.needsUpdate=!0)},re.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,J);else{let We=i.RGBA,me=i.RGBA,st=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,We,me,st,J)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(he.length>0){if(oe&&le){let re=ze(he[0]);t.texStorage2D(i.TEXTURE_2D,Xe,j,re.width,re.height)}for(let re=0,Ie=he.length;re<Ie;re++)Z=he[re],oe?Ce&&t.texSubImage2D(i.TEXTURE_2D,re,0,0,ce,C,Z):t.texImage2D(i.TEXTURE_2D,re,j,ce,C,Z);y.generateMipmaps=!1}else if(oe){if(le){let re=ze(J);t.texStorage2D(i.TEXTURE_2D,Xe,j,re.width,re.height)}Ce&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ce,C,J)}else t.texImage2D(i.TEXTURE_2D,0,j,ce,C,J);A(y)&&y.mipmapsAutoUpdate===!0&&T(se),de.__version=ae.version,y.onUpdate&&y.onUpdate(y)}w.__version=y.version}function pn(w,y,z){if(y.image.length!==6)return;let se=lt(w,y),Q=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+z);let ae=n.get(Q);if(Q.version!==ae.__version||se===!0){t.activeTexture(i.TEXTURE0+z);let de=Ye.getPrimaries(Ye.workingColorSpace),K=y.colorSpace===Di?null:Ye.getPrimaries(y.colorSpace),J=y.colorSpace===Di||de===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);let ce=y.isCompressedTexture||y.image[0].isCompressedTexture,C=y.image[0]&&y.image[0].isDataTexture,j=[];for(let me=0;me<6;me++)!ce&&!C?j[me]=S(y.image[me],!0,s.maxCubemapSize):j[me]=C?y.image[me].image:y.image[me],j[me]=Le(y,j[me]);let Z=j[0],he=r.convert(y.format,y.colorSpace),oe=r.convert(y.type),le=E(y.internalFormat,he,oe,y.normalized,y.colorSpace),Ce=y.isVideoTexture!==!0,Xe=ae.__version===void 0||se===!0,re=Q.dataReady,Ie=b(y,Z);it(i.TEXTURE_CUBE_MAP,y);let We;if(y.isDepthTexture){if(le=x(y.format===Ni,y.type),Xe)if(Ce)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,le,Z.width,Z.height);else for(let me=0;me<6;me++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,le,Z.width,Z.height,0,he,oe,null)}else if(ce){Ce&&Xe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ie,le,Z.width,Z.height);for(let me=0;me<6;me++){We=j[me].mipmaps;for(let st=0;st<We.length;st++){let Bt=We[st];y.format!==Fn?he!==null?Ce?re&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st,0,0,Bt.width,Bt.height,he,Bt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st,le,Bt.width,Bt.height,0,Bt.data):Re("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ce?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st,0,0,Bt.width,Bt.height,he,oe,Bt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st,le,Bt.width,Bt.height,0,he,oe,Bt.data)}}}else{if(We=y.mipmaps,Ce&&Xe){We.length>0&&Ie++;let me=ze(j[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ie,le,me.width,me.height)}for(let me=0;me<6;me++)if(C){Ce?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,j[me].width,j[me].height,he,oe,j[me].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,le,j[me].width,j[me].height,0,he,oe,j[me].data);for(let st=0;st<We.length;st++){let zi=We[st].image[me].image;Ce?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st+1,0,0,zi.width,zi.height,he,oe,zi.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st+1,le,zi.width,zi.height,0,he,oe,zi.data)}}else{Ce?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,he,oe,j[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,le,he,oe,j[me]);for(let st=0;st<We.length;st++){let Bt=We[st];Ce?re&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st+1,0,0,he,oe,Bt.image[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,st+1,le,he,oe,Bt.image[me])}}}A(y)&&y.mipmapsAutoUpdate===!0&&T(i.TEXTURE_CUBE_MAP),ae.__version=Q.version,y.onUpdate&&y.onUpdate(y)}w.__version=y.version}function mt(w,y,z,se,Q,ae){let de=r.convert(z.format,z.colorSpace),K=r.convert(z.type),J=E(z.internalFormat,de,K,z.normalized,z.colorSpace),ce=n.get(y),C=n.get(z);if(C.__renderTarget=y,!ce.__hasExternalTextures){let j=Math.max(1,y.width>>ae),Z=Math.max(1,y.height>>ae);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?t.texImage3D(Q,ae,J,j,Z,y.depth,0,de,K,null):t.texImage2D(Q,ae,J,j,Z,0,de,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),pe(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,se,Q,C.__webglTexture,0,pt(y)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,se,Q,C.__webglTexture,ae),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Qn(w,y,z){if(i.bindRenderbuffer(i.RENDERBUFFER,w),y.depthBuffer){let se=y.depthTexture,Q=se&&se.isDepthTexture?se.type:null,ae=x(y.stencilBuffer,Q),de=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;pe(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,pt(y),ae,y.width,y.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,pt(y),ae,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ae,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,w)}else{let se=y.textures;for(let Q=0;Q<se.length;Q++){let ae=se[Q],de=r.convert(ae.format,ae.colorSpace),K=r.convert(ae.type),J=E(ae.internalFormat,de,K,ae.normalized,ae.colorSpace);pe(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,pt(y),J,y.width,y.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,pt(y),J,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,J,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ft(w,y,z){let se=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Q=n.get(y.depthTexture);Q.__renderTarget=y;let ae=se?y.depthTexture.image[0]:y.depthTexture.image;(!Q.__webglTexture||ae.width!==y.width||ae.height!==y.height)&&(ae.width=y.width,ae.height=y.height,y.depthTexture.needsUpdate=!0),se?xe(y.depthTexture,0):_e(y.depthTexture,0);let de=Q.__webglTexture,K=pt(y),J=se?i.TEXTURE_CUBE_MAP_POSITIVE_X+z:i.TEXTURE_2D,ce=y.depthTexture.format===Ni?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===Ti)pe(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ce,J,de,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,ce,J,de,0);else if(y.depthTexture.format===Ni)pe(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ce,J,de,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,ce,J,de,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function wn(w){let y=n.get(w),z=w.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==w.depthTexture){let se=w.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),se){let Q=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,se.removeEventListener("dispose",Q)};se.addEventListener("dispose",Q),y.__depthDisposeCallback=Q}y.__boundDepthTexture=se}if(w.depthTexture&&!y.__autoAllocateDepthBuffer)if(z)for(let se=0;se<6;se++)Ft(y.__webglFramebuffer[se],w,se);else w.texture.mipmaps.length>0?Ft(y.__webglFramebuffer[0],w,0):Ft(y.__webglFramebuffer,w,0);else if(z){y.__webglDepthbuffer=[];for(let se=0;se<6;se++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[se]),y.__webglDepthbuffer[se]===void 0)y.__webglDepthbuffer[se]=i.createRenderbuffer(),Qn(y.__webglDepthbuffer[se],w,!1);else{let Q=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=y.__webglDepthbuffer[se];i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,ae)}}else if(w.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),Qn(y.__webglDepthbuffer,w,!1);else{let Q=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,ae)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function En(w,y,z){let se=n.get(w);y!==void 0&&mt(se.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&wn(w)}function An(w){let y=w.texture,z=n.get(w),se=n.get(y);w.addEventListener("dispose",V),F(w);let Q=w.textures,ae=w.isWebGLCubeRenderTarget===!0,de=Q.length>1;if(de||(se.__webglTexture===void 0&&(se.__webglTexture=i.createTexture()),se.__version=y.version,o.memory.textures++),ae){z.__webglFramebuffer=[];for(let K=0;K<6;K++)if(y.mipmaps.length>0){z.__webglFramebuffer[K]=[];for(let J=0;J<y.mipmaps.length;J++)z.__webglFramebuffer[K][J]=i.createFramebuffer()}else z.__webglFramebuffer[K]=i.createFramebuffer()}else{if(y.mipmaps.length>0){z.__webglFramebuffer=[];for(let K=0;K<y.mipmaps.length;K++)z.__webglFramebuffer[K]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(de)for(let K=0,J=Q.length;K<J;K++){let ce=n.get(Q[K]);ce.__webglTexture===void 0&&(ce.__webglTexture=i.createTexture(),o.memory.textures++)}if(w.samples>0&&pe(w)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let K=0;K<Q.length;K++){let J=Q[K];z.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[K]);let ce=r.convert(J.format,J.colorSpace),C=r.convert(J.type),j=E(J.internalFormat,ce,C,J.normalized,J.colorSpace,w.isXRRenderTarget===!0),Z=pt(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,j,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,z.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),Qn(z.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ae){t.bindTexture(i.TEXTURE_CUBE_MAP,se.__webglTexture),it(i.TEXTURE_CUBE_MAP,y);for(let K=0;K<6;K++)if(y.mipmaps.length>0)for(let J=0;J<y.mipmaps.length;J++)mt(z.__webglFramebuffer[K][J],w,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,J);else mt(z.__webglFramebuffer[K],w,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);A(y)?T(i.TEXTURE_CUBE_MAP):y.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}else if(de){for(let K=0,J=Q.length;K<J;K++){let ce=Q[K],C=n.get(ce),j=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(j=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(j,C.__webglTexture),it(j,ce),mt(z.__webglFramebuffer,w,ce,i.COLOR_ATTACHMENT0+K,j,0),A(ce)&&T(j)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(K=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,se.__webglTexture),it(K,y),y.mipmaps.length>0)for(let J=0;J<y.mipmaps.length;J++)mt(z.__webglFramebuffer[J],w,y,i.COLOR_ATTACHMENT0,K,J);else mt(z.__webglFramebuffer,w,y,i.COLOR_ATTACHMENT0,K,0);A(y)?T(K):y.mipmaps.length>0&&i.texParameteri(K,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}w.depthBuffer&&wn(w)}function D(w){let y=w.textures;for(let z=0,se=y.length;z<se;z++){let Q=y[z];if(A(Q)&&Q.mipmapsAutoUpdate===!0){let ae=R(w),de=n.get(Q).__webglTexture;t.bindTexture(ae,de),T(ae),t.unbindTexture()}}}let Rn=[];function ft(w){if(w.samples>0){if(pe(w)===!1){let y=w.textures,z=w.width,se=w.height,Q=i.COLOR_BUFFER_BIT,ae=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=n.get(w),K=y.length>1;if(K)for(let ce=0;ce<y.length;ce++)t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer),w.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let ce=0;ce<y.length;ce++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,de.__webglColorRenderbuffer[ce]);let C=n.get(y[ce]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,C,0)}i.blitFramebuffer(0,0,z,se,0,0,z,se,Q,i.NEAREST),l===!0&&(Rn.length=0,Rn.push(i.COLOR_ATTACHMENT0+ce),w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&Rn.push(ae),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Rn))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let ce=0;ce<y.length;ce++){t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,de.__webglColorRenderbuffer[ce]);let C=n.get(y[ce]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,C,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&l){let y=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function pt(w){return Math.min(s.maxSamples,w.samples)}function pe(w){let y=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Ct(w){let y=o.render.frame;h.get(w)!==y&&(h.set(w,y),w.update())}function Le(w,y){let z=w.colorSpace,se=w.format,Q=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||z!==cn&&z!==Di&&(Ye.getTransfer(z)===nt?(se!==Fn||Q!==xn)&&Re("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ue("WebGLTextures: Unsupported texture color space:",z)),y}function ze(w){return typeof HTMLImageElement!="undefined"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame!="undefined"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=He,this.resetTextureUnits=Y,this.getTextureUnits=ie,this.setTextureUnits=Me,this.setTexture2D=_e,this.setTexture2DArray=Se,this.setTexture3D=Pe,this.setTextureCube=xe,this.rebindTextures=En,this.setupRenderTarget=An,this.updateRenderTargetMipmap=D,this.updateMultisampleRenderTarget=ft,this.setupDepthRenderbuffer=wn,this.setupFrameBufferTexture=mt,this.useMultisampledRTT=pe,this.dispose=N}function Lv(i,e){function t(n,s=Di){let r,o=Ye.getTransfer(s);if(n===xn)return i.UNSIGNED_BYTE;if(n===vl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ml)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Lh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Nh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Ih)return i.BYTE;if(n===Ph)return i.SHORT;if(n===Pr)return i.UNSIGNED_SHORT;if(n===yl)return i.INT;if(n===qn)return i.UNSIGNED_INT;if(n===bn)return i.FLOAT;if(n===Yn)return i.HALF_FLOAT;if(n===Dh)return i.ALPHA;if(n===Uh)return i.RGB;if(n===Fn)return i.RGBA;if(n===Ti)return i.DEPTH_COMPONENT;if(n===Ni)return i.DEPTH_STENCIL;if(n===Sl)return i.RED;if(n===bl)return i.RED_INTEGER;if(n===ji)return i.RG;if(n===Tl)return i.RG_INTEGER;if(n===wl)return i.RGBA_INTEGER;if(n===ko||n===zo||n===Ho||n===Go)if(o===nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ko)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===zo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ho)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Go)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ko)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===zo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ho)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Go)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===El||n===Al||n===Rl||n===Cl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===El)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Al)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Rl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Cl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Il||n===Pl||n===Ll||n===Nl||n===Dl||n===Vo||n===Ul)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Il||n===Pl)return o===nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ll)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Nl)return r.COMPRESSED_R11_EAC;if(n===Dl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Vo)return r.COMPRESSED_RG11_EAC;if(n===Ul)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ol||n===Fl||n===Bl||n===kl||n===zl||n===Hl||n===Gl||n===Vl||n===Wl||n===Xl||n===ql||n===Yl||n===Zl||n===Kl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ol)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Fl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Bl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===kl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===zl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Hl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Gl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Xl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ql)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Yl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Zl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Kl)return o===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Jl||n===$l||n===jl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Jl)return o===nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===$l)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===jl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ql||n===ec||n===Wo||n===tc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ql)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ec)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===tc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Os?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Nv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Dv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,cu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ao(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Dn({vertexShader:Nv,fragmentShader:Dv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Qe(new ri(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},hu=class extends ni{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,_=null,v=typeof XRWebGLBinding!="undefined",p=new cu,m={},S=t.getContextAttributes(),A=null,T=null,R=[],E=[],x=new Oe,b=null,F=null,P=new It;P.viewport=new rt;let U=new It;U.viewport=new rt;let V=[P,U],q=new dl,I=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let _e=R[$];return _e===void 0&&(_e=new yr,R[$]=_e),_e.getTargetRaySpace()},this.getControllerGrip=function($){let _e=R[$];return _e===void 0&&(_e=new yr,R[$]=_e),_e.getGripSpace()},this.getHand=function($){let _e=R[$];return _e===void 0&&(_e=new yr,R[$]=_e),_e.getHandSpace()};function H($){let _e=E.indexOf($.inputSource);if(_e===-1)return;let Se=R[_e];Se!==void 0&&(Se.update($.inputSource,$.frame,c||o),Se.dispatchEvent({type:$.type,data:$.inputSource}))}function B(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",B),s.removeEventListener("inputsourceschange",ne);for(let $=0;$<R.length;$++){let _e=E[$];_e!==null&&(E[$]=null,R[$].disconnect(_e))}I=null,N=null,p.reset();for(let $ in m)delete m[$];if(e.setRenderTarget(A),f=null,d=null,u=null,s=null,T=null,He.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(x.width,x.height,!1),F!==null){let $=F.camera;$.fov=F.fov,$.zoom=F.zoom,$.updateProjectionMatrix(),F=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&Re("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,n.isPresenting===!0&&Re("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function($){if(s=$,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",B),s.addEventListener("inputsourceschange",ne),S.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(x),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,Pe=null,xe=null;S.depth&&(xe=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=S.stencil?Ni:Ti,Pe=S.stencil?Os:qn);let Ve={colorFormat:t.RGBA8,depthFormat:xe,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Ve),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),T=new Mn(d.textureWidth,d.textureHeight,{format:Fn,type:xn,depthTexture:new Ai(d.textureWidth,d.textureHeight,Pe,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let Se={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,Se),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),T=new Mn(f.framebufferWidth,f.framebufferHeight,{format:Fn,type:xn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}T.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),He.setContext(s),He.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function ne($){for(let _e=0;_e<$.removed.length;_e++){let Se=$.removed[_e],Pe=E.indexOf(Se);Pe>=0&&(E[Pe]=null,R[Pe].disconnect(Se))}for(let _e=0;_e<$.added.length;_e++){let Se=$.added[_e],Pe=E.indexOf(Se);if(Pe===-1){for(let Ve=0;Ve<R.length;Ve++)if(Ve>=E.length){E.push(Se),Pe=Ve;break}else if(E[Ve]===null){E[Ve]=Se,Pe=Ve;break}if(Pe===-1)break}let xe=R[Pe];xe&&xe.connect(Se)}}function X($,_e){_e===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(_e.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(s===null)return;let _e=$.near,Se=$.far;p.texture!==null&&(p.depthNear>0&&(_e=p.depthNear),p.depthFar>0&&(Se=p.depthFar)),q.near=U.near=P.near=_e,q.far=U.far=P.far=Se,(I!==q.near||N!==q.far)&&(s.updateRenderState({depthNear:q.near,depthFar:q.far}),I=q.near,N=q.far),q.layers.mask=$.layers.mask|6,P.layers.mask=q.layers.mask&-5,U.layers.mask=q.layers.mask&-3;let Pe=$.parent,xe=q.cameras;X(q,Pe);for(let Ve=0;Ve<xe.length;Ve++)X(xe[Ve],Pe);q.projectionMatrix.copy(P.projectionMatrix),q.projectionMatrixInverse.copy(P.projectionMatrixInverse),F===null&&$.isPerspectiveCamera&&(F={camera:$,fov:$.fov,zoom:$.zoom}),Y($,q,Pe)};function Y($,_e,Se){Se===null?$.matrix.copy(_e.matrixWorld):($.matrix.copy(Se.matrixWorld),$.matrix.invert(),$.matrix.multiply(_e.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(_e.projectionMatrix),$.projectionMatrixInverse.copy(_e.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Ss*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return q},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function($){l=$,d!==null&&(d.fixedFoveation=$),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=$)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(q)},this.getCameraTexture=function($){return m[$]};let ie=null;function Me($,_e){if(h=_e.getViewerPose(c||o),_=_e,h!==null){let Se=h.views;f!==null&&(e.setRenderTargetFramebuffer(T,f.framebuffer),e.setRenderTarget(T));let Pe=!1;Se.length!==q.cameras.length&&(q.cameras.length=0,Pe=!0);for(let De=0;De<Se.length;De++){let it=Se[De],lt=null;if(f!==null)lt=f.getViewport(it);else{let Yt=u.getViewSubImage(d,it);lt=Yt.viewport,De===0&&(e.setRenderTargetTextures(T,Yt.colorTexture,Yt.depthStencilTexture),e.setRenderTarget(T))}let Je=V[De];Je===void 0&&(Je=new It,Je.layers.enable(De),Je.viewport=new rt,V[De]=Je),Je.matrix.fromArray(it.transform.matrix),Je.matrix.decompose(Je.position,Je.quaternion,Je.scale),Je.projectionMatrix.fromArray(it.projectionMatrix),Je.projectionMatrixInverse.copy(Je.projectionMatrix).invert(),Je.viewport.set(lt.x,lt.y,lt.width,lt.height),De===0&&(q.matrix.copy(Je.matrix),q.matrix.decompose(q.position,q.quaternion,q.scale)),Pe===!0&&q.cameras.push(Je)}let xe=s.enabledFeatures;if(xe&&xe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){u=n.getBinding();let De=u.getDepthInformation(Se[0]);De&&De.isValid&&De.texture&&p.init(De,s.renderState)}if(xe&&xe.includes("camera-access")&&v){e.state.unbindTexture(),u=n.getBinding();for(let De=0;De<Se.length;De++){let it=Se[De].camera;if(it){let lt=m[it];lt||(lt=new Ao,m[it]=lt);let Je=u.getCameraImage(it);lt.sourceTexture=Je}}}}for(let Se=0;Se<R.length;Se++){let Pe=E[Se],xe=R[Se];Pe!==null&&xe!==void 0&&xe.update(Pe,_e,c||o)}ie&&ie($,_e),_e.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:_e}),_=null}let He=new Lp;He.setAnimationLoop(Me),this.setAnimationLoop=function($){ie=$},this.dispose=function(){}}},Uv=new Be,Gp=new ke;Gp.set(-1,0,0,0,1,0,0,0,1);function Ov(i,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,qh(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,S,A,T){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),u(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,T)):m.isMeshMatcapMaterial?(r(p,m),_(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),v(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,S,A):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Nt&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Nt&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let S=e.get(m),A=S.envMap,T=S.envMapRotation;A&&(p.envMap.value=A,p.envMapRotation.value.setFromMatrix4(Uv.makeRotationFromEuler(T)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Gp),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,S,A){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*S,p.scale.value=A*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,S){p.ior.value=m.ior,m.diffuseRoughness>0&&(p.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(p.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,p.diffuseRoughnessMapTransform))),m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Nt&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,p.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=S.texture,p.transmissionSamplerSize.value.set(S.width,S.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function _(p,m){m.matcap&&(p.matcap.value=m.matcap)}function v(p,m){let S=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(S.matrixWorld),p.nearDistance.value=S.shadow.camera.near,p.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Fv(i,e,t,n){let s={},r={};function o(S,A){let T=A.program;n.uniformBlockBinding(S,T,s[S.id])}function a(S,A){let T=s[S.id];T===void 0&&(_(S),T=l(S),s[S.id]=T,S.addEventListener("dispose",p));let R=A.program;n.updateUBOMapping(S,R);let E=e.render.frame;r[S.id]!==E&&(c(S),r[S.id]=E)}function l(S){let A=i.createBuffer(),T=S.__size,R=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,T,R),i.bindBuffer(i.UNIFORM_BUFFER,null),A}function c(S){let A=s[S.id],T=S.uniforms,R=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,A);for(let E=0,x=T.length;E<x;E++){let b=T[E];if(Array.isArray(b))for(let F=0,P=b.length;F<P;F++)h(b[F],E,F,R);else h(b,E,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(S,A,T,R){if(d(S,A,T,R)===!0){let E=S.__offset,x=S.value;if(Array.isArray(x)){let b=0;for(let F=0;F<x.length;F++){let P=x[F],U=v(P,!0);u(P,S.__data,b),b+=U.storage/Float32Array.BYTES_PER_ELEMENT}}else u(x,S.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,E,S.__data)}}function u(S,A,T){typeof S=="number"||typeof S=="boolean"?A[T]=S:S.isMatrix3?(A[T]=S.elements[0],A[T+1]=S.elements[1],A[T+2]=S.elements[2],A[T+3]=0,A[T+4]=S.elements[3],A[T+5]=S.elements[4],A[T+6]=S.elements[5],A[T+7]=0,A[T+8]=S.elements[6],A[T+9]=S.elements[7],A[T+10]=S.elements[8],A[T+11]=0):ArrayBuffer.isView(S)?A.set(S.subarray(0,A.length-T),T):S.toArray(A,T)}function d(S,A,T,R){let E=S.value,x=A+"_"+T;if(Array.isArray(E)){R[x]===void 0&&(R[x]=[]);let b=R[x],F=!1;for(let P=0;P<E.length;P++)f(E[P],b,P)===!0&&(F=!0);return F}return f(E,R,x)}function f(S,A,T){if(A[T]===void 0)return typeof S=="number"||typeof S=="boolean"?A[T]=S:ArrayBuffer.isView(S)?A[T]=S.slice():A[T]=S.clone(),!0;{let R=A[T];if(typeof S=="number"||typeof S=="boolean"){if(R!==S)return A[T]=S,!0}else{if(ArrayBuffer.isView(S))return!0;if(R.equals(S)===!1)return R.copy(S),!0}}return!1}function _(S){let A=S.uniforms,T=0,R=16;for(let x=0,b=A.length;x<b;x++){let F=Array.isArray(A[x])?A[x]:[A[x]];for(let P=0,U=F.length;P<U;P++){let V=F[P],q=Array.isArray(V.value)?V.value:[V.value],I=Array.isArray(A[x])||Array.isArray(V.value),N=T;for(let B=0,ne=q.length;B<ne;B++){let X=q[B],Y=v(X,I),ie=T%R,Me=ie%Y.boundary,He=ie+Me;T+=Me,He!==0&&R-He<Y.storage&&(T+=R-He),B===0&&(N=T),T+=Y.storage}let H=V.type==="int"?Int32Array:V.type==="uint"?Uint32Array:Float32Array;V.__data=new H((T-N)/Float32Array.BYTES_PER_ELEMENT),V.__offset=N}}let E=T%R;return E>0&&(T+=R-E),S.__size=T,S.__cache={},this}function v(S,A){let T={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(T.boundary=4,T.storage=4):S.isVector2?(T.boundary=8,T.storage=8):S.isVector3||S.isColor?(T.boundary=16,T.storage=12):S.isVector4?(T.boundary=16,T.storage=16):S.isMatrix3?(T.boundary=16,T.storage=48):S.isMatrix4?(T.boundary=16,T.storage=64):S.isTexture?Re("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(T.boundary=16,T.storage=S.byteLength):Re("WebGLRenderer: Unsupported uniform value type.",S),A===!0&&(T.boundary=16,T.storage=Math.ceil(T.storage/16)*16),T}function p(S){let A=S.target;A.removeEventListener("dispose",p),i.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function m(){for(let S in s)i.deleteBuffer(s[S]);s={},r={}}return{bind:o,update:a,dispose:m}}var Bv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ui=null;function kv(){return ui===null&&(ui=new Sr(Bv,16,16,ji,Yn),ui.name="DFG_LUT",ui.minFilter=Pt,ui.magFilter=Pt,ui.wrapS=In,ui.wrapT=In,ui.generateMipmaps=!1,ui.needsUpdate=!0),ui}var oc=class{constructor(e={}){let{canvas:t=np(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=xn}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext!="undefined"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=o;let v=f,p=new Set([wl,Tl,bl]),m=new Set([xn,qn,Pr,Os,vl,Ml]),S=new Uint32Array(4),A=new Int32Array(4),T={textures:[],min:[],max:[],resolution:[]},R=null,E=null,x=[],b=[],F=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ci,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,U=!1,V=null,q=null,I=null,N=null;this._outputColorSpace=ot;let H=0,B=0,ne=null,X=-1,Y=null,ie=new rt,Me=new rt,He=null,$=new Ae(0),_e=0,Se=t.width,Pe=t.height,xe=1,Ve=null,Tt=null,De=new rt(0,0,Se,Pe),it=new rt(0,0,Se,Pe),lt=!1,Je=new Ki,Yt=new Qa,Rt=!1,pn=!1,mt=new Be,Qn=new O,Ft=new rt,wn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},En=!1;function An(){return ne===null?xe:1}let D=n;function Rn(M,L){return t.getContext(M,L)}let ft,pt,pe,Ct,Le,ze,w,y,z,se,Q,ae,de,K,J,ce,C,j,Z,he,oe,le,Ce;try{let M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Ie,!1),t.addEventListener("webglcontextrestored",We,!1),t.addEventListener("webglcontextcreationerror",me,!1),D===null){let L="webgl2";if(D=Rn(L,M),D===null)throw Rn(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Xe()}catch(M){throw t.removeEventListener("webglcontextlost",Ie,!1),t.removeEventListener("webglcontextrestored",We,!1),t.removeEventListener("webglcontextcreationerror",me,!1),Ue("WebGLRenderer: "+M.message),M}function Xe(){ft=new Jx(D),ft.init(),oe=new Lv(D,ft),pt=new kx(D,ft,e,oe),pe=new Iv(D,ft),pt.reversedDepthBuffer&&d&&pe.buffers.depth.setReversed(!0),q=D.createFramebuffer(),I=D.createFramebuffer(),N=D.createFramebuffer(),Ct=new Qx(D),Le=new gv,ze=new Pv(D,ft,pe,Le,pt,oe,Ct),w=new Kx(P),y=new t0(D),le=new Fx(D,y),z=new $x(D,y,Ct,le),se=new ty(D,z,y,le,Ct),j=new ey(D,pt,ze),J=new zx(Le),Q=new mv(P,w,ft,pt,le,J),ae=new Ov(P,Le),de=new xv,K=new Tv(ft),C=new Ox(P,w,pe,se,_,l),ce=new Cv(P,se,pt),Ce=new Fv(D,Ct,pt,pe),Z=new Bx(D,ft,Ct),he=new jx(D,ft,Ct),Ct.programs=Q.programs,P.capabilities=pt,P.extensions=ft,P.properties=Le,P.renderLists=de,P.shadowMap=ce,P.state=pe,P.info=Ct}v!==xn&&(F=new iy(v,t.width,t.height,a,s,r));let re=new hu(P,D);this.xr=re,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let M=ft.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=ft.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return xe},this.setPixelRatio=function(M){M!==void 0&&(xe=M,this.setSize(Se,Pe,!1))},this.getSize=function(M){return M.set(Se,Pe)},this.setSize=function(M,L,W=!0){if(re.isPresenting){Re("WebGLRenderer: Can't change size while VR device is presenting.");return}Se=M,Pe=L,t.width=Math.floor(M*xe),t.height=Math.floor(L*xe),W===!0&&(t.style.width=M+"px",t.style.height=L+"px"),F!==null&&F.setSize(t.width,t.height),this.setViewport(0,0,M,L)},this.getDrawingBufferSize=function(M){return M.set(Se*xe,Pe*xe).floor()},this.setDrawingBufferSize=function(M,L,W){Se=M,Pe=L,xe=W,t.width=Math.floor(M*W),t.height=Math.floor(L*W),this.setViewport(0,0,M,L)},this.setEffects=function(M){if(v===xn){Ue("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let L=0;L<M.length;L++)if(M[L].isOutputPass===!0){Re("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}F.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(ie)},this.getViewport=function(M){return M.copy(De)},this.setViewport=function(M,L,W,k){M.isVector4?De.set(M.x,M.y,M.z,M.w):De.set(M,L,W,k),pe.viewport(ie.copy(De).multiplyScalar(An()).round())},this.getScissor=function(M){return M.copy(it)},this.setScissor=function(M,L,W,k){M.isVector4?it.set(M.x,M.y,M.z,M.w):it.set(M,L,W,k),pe.scissor(Me.copy(it).multiplyScalar(An()).round())},this.getScissorTest=function(){return lt},this.setScissorTest=function(M){pe.setScissorTest(lt=M)},this.setOpaqueSort=function(M){Ve=M},this.setTransparentSort=function(M){Tt=M},this.getClearColor=function(M){return M.copy(C.getClearColor())},this.setClearColor=function(){C.setClearColor(...arguments)},this.getClearAlpha=function(){return C.getClearAlpha()},this.setClearAlpha=function(){C.setClearAlpha(...arguments)},this.clear=function(M=!0,L=!0,W=!0){let k=0;if(M){let G=!1;if(ne!==null){let fe=ne.texture.format;G=p.has(fe)}if(G){let fe=ne.texture.type,ve=m.has(fe),ue=C.getClearColor(),ye=C.getClearAlpha(),Ee=ue.r,Ge=ue.g,$e=ue.b;ve?(S[0]=Ee,S[1]=Ge,S[2]=$e,S[3]=ye,D.clearBufferuiv(D.COLOR,0,S)):(A[0]=Ee,A[1]=Ge,A[2]=$e,A[3]=ye,D.clearBufferiv(D.COLOR,0,A))}else k|=D.COLOR_BUFFER_BIT}L&&(k|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(k|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&D.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),V=M},this.dispose=function(){t.removeEventListener("webglcontextlost",Ie,!1),t.removeEventListener("webglcontextrestored",We,!1),t.removeEventListener("webglcontextcreationerror",me,!1),C.dispose(),de.dispose(),K.dispose(),ze.dispose(),Le.dispose(),w.dispose(),se.dispose(),z.dispose(),le.dispose(),Ce.dispose(),Q.dispose(),re.dispose(),re.removeEventListener("sessionstart",wd),re.removeEventListener("sessionend",Ed),ds.stop()};function Ie(M){M.preventDefault(),po("WebGLRenderer: Context Lost."),U=!0}function We(){po("WebGLRenderer: Context Restored."),U=!1;let M=Ct.autoReset,L=ce.enabled,W=ce.autoUpdate,k=ce.needsUpdate,G=ce.type;Xe(),Ct.autoReset=M,ce.enabled=L,ce.autoUpdate=W,ce.needsUpdate=k,ce.type=G}function me(M){Ue("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function st(M){let L=M.target;L.removeEventListener("dispose",st),Bt(L)}function Bt(M){zi(M),Le.remove(M)}function zi(M){let L=Le.get(M).programs;L!==void 0&&(L.forEach(function(W){Q.releaseProgram(W)}),M.isShaderMaterial&&Q.releaseShaderCache(M))}this.renderBufferDirect=function(M,L,W,k,G,fe){L===null&&(L=wn);let ve=G.isMesh&&G.matrixWorld.determinantAffine()<0,ue=Zm(M,L,W,k,G);pe.setMaterial(k,ve);let ye=W.index,Ee=1;if(k.wireframe===!0){if(ye=z.getWireframeAttribute(W),ye===void 0)return;Ee=2}let Ge=W.drawRange,$e=W.attributes.position,be=Ge.start*Ee,je=(Ge.start+Ge.count)*Ee;fe!==null&&(be=Math.max(be,fe.start*Ee),je=Math.min(je,(fe.start+fe.count)*Ee)),ye!==null?(be=Math.max(be,0),je=Math.min(je,ye.count)):$e!=null&&(be=Math.max(be,0),je=Math.min(je,$e.count));let wt=je-be;if(wt<0||wt===1/0)return;le.setup(G,k,ue,W,ye);let dt,ct=Z;if(ye!==null&&(dt=y.get(ye),ct=he,ct.setIndex(dt)),G.isMesh)k.wireframe===!0?(pe.setLineWidth(k.wireframeLinewidth*An()),ct.setMode(D.LINES)):ct.setMode(D.TRIANGLES);else if(G.isLine){let $t=k.linewidth;$t===void 0&&($t=1),pe.setLineWidth($t*An()),G.isLineSegments?ct.setMode(D.LINES):G.isLineLoop?ct.setMode(D.LINE_LOOP):ct.setMode(D.LINE_STRIP)}else G.isPoints?ct.setMode(D.POINTS):G.isSprite&&ct.setMode(D.TRIANGLES);if(G.isBatchedMesh)if(ft.get("WEBGL_multi_draw"))ct.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let $t=G._multiDrawStarts,Te=G._multiDrawCounts,an=G._multiDrawCount,tt=ye?y.get(ye).bytesPerElement:1,fs=Le.get(k).currentProgram.getUniforms();for(let jt=0;jt<an;jt++)fs.setValue(D,"_gl_DrawID",jt),ct.render($t[jt]/tt,Te[jt])}else if(G.isInstancedMesh)ct.renderInstances(be,wt,G.count);else if(W.isInstancedBufferGeometry){let $t=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Te=Math.min(W.instanceCount,$t);ct.renderInstances(be,wt,Te)}else ct.render(be,wt)};function Td(M,L,W,k){V!==null&&M.isNodeMaterial&&V.setObject(k,M),Rt===!0&&J.setState(M,W,!1),M.transparent===!0&&M.side===Un&&M.forceSinglePass===!1?(M.side=Nt,M.needsUpdate=!0,Jr(M,L,k),M.side=li,M.needsUpdate=!0,Jr(M,L,k),M.side=Un):Jr(M,L,k)}this.compile=function(M,L,W=null){W===null&&(W=M),V!==null&&V.renderStart(M,L,W),E=K.get(W),E.init(L),b.push(E),W.traverseVisible(function(G){G.isLight&&G.layers.test(L.layers)&&(E.pushLight(G),G.castShadow&&E.pushShadow(G))}),M!==W&&M.traverseVisible(function(G){G.isLight&&G.layers.test(L.layers)&&(E.pushLight(G),G.castShadow&&E.pushShadow(G))}),E.setupLights(),V!==null&&V.updateLights(E.state.lightsArray),pn=this.localClippingEnabled,Rt=J.init(this.clippingPlanes,pn),Rt===!0&&J.setGlobalState(this.clippingPlanes,L),V!==null&&ce.render(E.state.shadowsArray,W,L);let k=new Set;return M.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let fe=G.material;if(fe)if(Array.isArray(fe))for(let ve=0;ve<fe.length;ve++){let ue=fe[ve];Td(ue,W,L,G),k.add(ue)}else Td(fe,W,L,G),k.add(fe)}),E=b.pop(),V!==null&&V.renderEnd(),k},this.compileAsync=function(M,L,W=null){let k=this.compile(M,L,W);return new Promise(G=>{function fe(){if(k.forEach(function(ve){let ye=Le.get(ve).currentProgram;(ye===void 0||ye.isReady())&&k.delete(ve)}),k.size===0){G(M);return}setTimeout(fe,10)}ft.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let Lc=null;function qm(M){Lc&&Lc(M)}function wd(){ds.stop()}function Ed(){ds.start()}let ds=new Lp;ds.setAnimationLoop(qm),typeof self!="undefined"&&ds.setContext(self),this.setAnimationLoop=function(M){Lc=M,re.setAnimationLoop(M),M===null?ds.stop():ds.start()},re.addEventListener("sessionstart",wd),re.addEventListener("sessionend",Ed),this.render=function(M,L){if(L!==void 0&&L.isCamera!==!0){Ue("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(U===!0)return;V!==null&&V.renderStart(M,L);let W=re.enabled===!0&&re.isPresenting===!0,k=F!==null&&(ne===null||W)&&F.begin(P,ne);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(re.cameraAutoUpdate===!0&&re.updateCamera(L),L=re.getCamera()),M.isScene===!0&&M.onBeforeRender(P,M,L,ne),E=K.get(M,b.length),E.init(L),E.state.textureUnits=ze.getTextureUnits(),b.push(E),mt.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),L.isArrayCamera?Yt.setFromArrayCamera(L):Je.setFromProjectionMatrix(mt,Pn,L.reversedDepth),pn=this.localClippingEnabled,Rt=J.init(this.clippingPlanes,pn),R=de.get(M,x.length),R.init(),x.push(R),this.info.render.frame++,re.enabled===!0&&re.isPresenting===!0){let ve=P.xr.getDepthSensingMesh();ve!==null&&Nc(ve,L,-1/0,P.sortObjects)}Nc(M,L,0,P.sortObjects),R.finish(),V!==null&&V.updateLights(E.state.lightsArray),P.sortObjects===!0&&R.sort(Ve,Tt),En=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,En&&C.addToRenderList(R,M),this.info.autoReset===!0&&this.info.reset(),Rt===!0&&J.beginShadows();let G=E.state.shadowsArray;if(ce.render(G,M,L),Rt===!0&&J.endShadows(),(k&&F.hasRenderPass())===!1){let ve=R.opaque,ue=R.transmissive;if(E.setupLights(),L.isArrayCamera){let ye=L.cameras;if(ue.length>0)for(let Ee=0,Ge=ye.length;Ee<Ge;Ee++){let $e=ye[Ee];Rd(ve,ue,M,$e)}En&&C.render(M);for(let Ee=0,Ge=ye.length;Ee<Ge;Ee++){let $e=ye[Ee];Ad(R,M,$e,$e.viewport)}}else ue.length>0&&Rd(ve,ue,M,L),En&&C.render(M),Ad(R,M,L)}ne!==null&&B===0&&(ze.updateMultisampleRenderTarget(ne),ze.updateRenderTargetMipmap(ne)),k&&F.end(P),M.isScene===!0&&M.onAfterRender(P,M,L),le.resetDefaultState(),X=-1,Y=null,b.pop(),b.length>0?(E=b[b.length-1],ze.setTextureUnits(E.state.textureUnits),Rt===!0&&J.setGlobalState(P.clippingPlanes,E.state.camera)):E=null,x.pop(),x.length>0?R=x[x.length-1]:R=null,V!==null&&V.renderEnd()};function Nc(M,L,W,k){if(M.visible===!1)return;if(M.layers.test(L.layers)){if(M.isGroup)W=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(L);else if(M.isLight)E.pushLight(M),M.castShadow&&E.pushShadow(M);else if(M.isSprite){let ve=L.isArrayCamera?Yt:Je;if(!M.frustumCulled||M.intersectsFrustum(ve)){k&&Ft.setFromMatrixPosition(M.matrixWorld).applyMatrix4(mt);let ue=se.update(M),ye=M.material;ye.visible&&R.push(M,ue,ye,W,Ft.z,null,L)}}else if(M.isMesh||M.isLine||M.isPoints){let ve=L.isArrayCamera?Yt:Je;if(!M.frustumCulled||M.intersectsFrustum(ve)){let ue=se.update(M),ye=M.material;if(k&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ft.copy(M.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),Ft.copy(ue.boundingSphere.center)),Ft.applyMatrix4(M.matrixWorld).applyMatrix4(mt)),Array.isArray(ye)){let Ee=ue.groups;for(let Ge=0,$e=Ee.length;Ge<$e;Ge++){let be=Ee[Ge],je=ye[be.materialIndex];je&&je.visible&&R.push(M,ue,je,W,Ft.z,be,L)}}else ye.visible&&R.push(M,ue,ye,W,Ft.z,null,L)}}}let fe=M.children;for(let ve=0,ue=fe.length;ve<ue;ve++)Nc(fe[ve],L,W,k)}function Ad(M,L,W,k){let{opaque:G,transmissive:fe,transparent:ve}=M;E.setupLightsView(W),Rt===!0&&J.setGlobalState(P.clippingPlanes,W),k&&pe.viewport(ie.copy(k)),G.length>0&&ua(G,L,W),fe.length>0&&ua(fe,L,W),ve.length>0&&ua(ve,L,W),pe.buffers.depth.setTest(!0),pe.buffers.depth.setMask(!0),pe.buffers.color.setMask(!0),pe.setPolygonOffset(!1)}function Rd(M,L,W,k){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[k.id]===void 0){let be=ft.has("EXT_color_buffer_half_float")||ft.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[k.id]=new Mn(1,1,{generateMipmaps:!0,type:be?Yn:xn,minFilter:On,samples:Math.max(4,pt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ye.workingColorSpace})}let fe=E.state.transmissionRenderTarget[k.id],ve=k.viewport||ie;fe.setSize(ve.z*P.transmissionResolutionScale,ve.w*P.transmissionResolutionScale);let ue=P.getRenderTarget(),ye=P.getActiveCubeFace(),Ee=P.getActiveMipmapLevel();P.setRenderTarget(fe),P.getClearColor($),_e=P.getClearAlpha(),_e<1&&P.setClearColor(16777215,.5),P.clear(),En&&C.render(W);let Ge=P.toneMapping;P.toneMapping=ci;let $e=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),E.setupLightsView(k),Rt===!0&&J.setGlobalState(P.clippingPlanes,k),ua(M,W,k),ze.updateMultisampleRenderTarget(fe),ze.updateRenderTargetMipmap(fe),ft.has("WEBGL_multisampled_render_to_texture")===!1){let be=!1;for(let je=0,wt=L.length;je<wt;je++){let dt=L[je],{object:ct,geometry:$t,material:Te,group:an}=dt;if(Te.side===Un&&ct.layers.test(k.layers)){let tt=Te.side;Te.side=Nt,Te.needsUpdate=!0,Cd(ct,W,k,$t,Te,an),Te.side=tt,Te.needsUpdate=!0,be=!0}}be===!0&&(ze.updateMultisampleRenderTarget(fe),ze.updateRenderTargetMipmap(fe))}P.setRenderTarget(ue,ye,Ee),P.setClearColor($,_e),$e!==void 0&&(k.viewport=$e),P.toneMapping=Ge}function ua(M,L,W){let k=L.isScene===!0?L.overrideMaterial:null;for(let G=0,fe=M.length;G<fe;G++){let ve=M[G],{object:ue,geometry:ye,group:Ee}=ve,Ge=ve.material;Ge.allowOverride===!0&&k!==null&&(Ge=k),ue.layers.test(W.layers)&&Cd(ue,L,W,ye,Ge,Ee)}}function Cd(M,L,W,k,G,fe){V!==null&&G.isNodeMaterial&&V.setObject(M,G),M.onBeforeRender(P,L,W,k,G,fe),M.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),G.onBeforeRender(P,L,W,k,M,fe),G.transparent===!0&&G.side===Un&&G.forceSinglePass===!1?(G.side=Nt,G.needsUpdate=!0,P.renderBufferDirect(W,L,k,G,M,fe),G.side=li,G.needsUpdate=!0,P.renderBufferDirect(W,L,k,G,M,fe),G.side=Un):P.renderBufferDirect(W,L,k,G,M,fe),M.onAfterRender(P,L,W,k,G,fe)}function Id(M){let L=0;for(let W of M)W.texture!==null&&L++;return L}function Jr(M,L,W){L.isScene!==!0&&(L=wn);let k=Le.get(M),G=E.state.lights,fe=E.state.shadowsArray,ve=G.state.version,ue=Q.getParameters(M,G.state,fe,L,W,E.state.lightProbeGridArray),ye=Q.getProgramCacheKey(ue),Ee=k.programs;k.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?L.environment:null,k.fog=L.fog;let Ge=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;k.envMap=w.get(M.envMap||k.environment,Ge),k.envMapRotation=k.environment!==null&&M.envMap===null?L.environmentRotation:M.envMapRotation,Ee===void 0&&(M.addEventListener("dispose",st),Ee=new Map,k.programs=Ee,k.programVariants=new Map);let $e=Ee.get(ye);if($e!==void 0){if(k.currentProgram===$e&&k.lightsStateVersion===ve)return Ld(M,ue),$e}else ue.uniforms=Q.getUniforms(M),V!==null&&M.isNodeMaterial&&V.build(M,W,ue),M.onBeforeCompile(ue,P),$e=Q.acquireProgram(ue,ye),Ee.set(ye,$e),k.uniforms=ue.uniforms;let be=k.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(be.clippingPlanes=J.uniform),Ld(M,ue),k.needsLights=Jm(M),k.lightsStateVersion=ve,k.needsLights&&(be.ambientLightColor.value=G.state.ambient,be.lightProbe.value=G.state.probe,be.sunLights.value=G.state.sun,be.sunLightShadows.value=G.state.sunShadow,be.directionalLights.value=G.state.directional,be.directionalLightShadows.value=G.state.directionalShadow,be.spotLights.value=G.state.spot,be.spotLightShadows.value=G.state.spotShadow,be.rectAreaLights.value=G.state.rectArea,be.ltc_1.value=G.state.rectAreaLTC1,be.ltc_2.value=G.state.rectAreaLTC2,be.pointLights.value=G.state.point,be.pointLightShadows.value=G.state.pointShadow,be.hemisphereLights.value=G.state.hemi,be.sunShadowMatrix.value=G.state.sunShadowMatrix,be.sunShadowCascade.value=G.state.sunShadowCascade,be.directionalShadowMatrix.value=G.state.directionalShadowMatrix,be.spotLightMatrix.value=G.state.spotLightMatrix,be.spotLightMap.value=G.state.spotLightMap,be.pointShadowMatrix.value=G.state.pointShadowMatrix),k.numLightProbeGrids=Id(E.state.lightProbeGridArray),k.currentProgram=$e,k.uniformsList=null,$e}function Ym(M,L,W,k,G){let fe=Le.get(M),ve=fe.currentProgram.id+","+k+","+G,ue=fe.programVariants.get(ve);return ue===void 0?(ue=Jr(M,L,W),fe.programVariants.set(ve,ue)):(fe.currentProgram=ue,fe.uniformsList=null,fe.outputColorSpace=k,fe.toneMapping=G),ue}function Pd(M){if(M.uniformsList===null){let L=M.currentProgram.getUniforms();M.uniformsList=Nr.seqWithValue(L.seq,M.uniforms)}return M.uniformsList}function Ld(M,L){let W=Le.get(M);W.outputColorSpace=L.outputColorSpace,W.batching=L.batching,W.batchingColor=L.batchingColor,W.instancing=L.instancing,W.instancingColor=L.instancingColor,W.instancingMorph=L.instancingMorph,W.skinning=L.skinning,W.morphTargets=L.morphTargets,W.morphNormals=L.morphNormals,W.morphColors=L.morphColors,W.morphTargetsCount=L.morphTargetsCount,W.numClippingPlanes=L.numClippingPlanes,W.numIntersection=L.numClipIntersection,W.vertexAlphas=L.vertexAlphas,W.vertexTangents=L.vertexTangents,W.toneMapping=L.toneMapping}function Zm(M,L,W,k,G){L.isScene!==!0&&(L=wn),ze.resetTextureUnits();let fe=L.fog,ve=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?L.environment:null,ue=ne===null?P.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:Ye.workingColorSpace,ye=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Ee=w.get(k.envMap||ve,ye),Ge=k.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,$e=!!W.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),be=!!W.morphAttributes.position,je=!!W.morphAttributes.normal,wt=!!W.morphAttributes.color,dt=ci;k.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(dt=P.toneMapping);let ct=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,$t=ct!==void 0?ct.length:0,Te=Le.get(k),an=E.state.lights;if(Rt===!0&&(pn===!0||M!==Y)){let gt=M===Y&&k.id===X;J.setState(k,M,gt)}let tt=!1,fs=!1;k.version===Te.__version?Te.needsLights&&Te.lightsStateVersion!==an.state.version||G.isBatchedMesh&&Te.batching===!1||!G.isBatchedMesh&&Te.batching===!0||G.isBatchedMesh&&Te.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&Te.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&Te.instancing===!1||!G.isInstancedMesh&&Te.instancing===!0||G.isSkinnedMesh&&Te.skinning===!1||!G.isSkinnedMesh&&Te.skinning===!0||G.isInstancedMesh&&Te.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Te.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Te.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Te.instancingMorph===!1&&G.morphTexture!==null||Te.envMap!==Ee||k.fog===!0&&Te.fog!==fe||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==J.numPlanes||Te.numIntersection!==J.numIntersection)||Te.vertexAlphas!==Ge||Te.vertexTangents!==$e||Te.morphTargets!==be||Te.morphNormals!==je||Te.morphColors!==wt||Te.morphTargetsCount!==$t||Te.numLightProbeGrids!==Id(E.state.lightProbeGridArray)?tt=!0:(Te.outputColorSpace!==ue||Te.toneMapping!==dt)&&(fs=!0):(tt=!0,Te.__version=k.version);let jt=Te.currentProgram;(tt===!0||fs===!0)&&(jt=fs===!0?Ym(k,L,G,ue,dt):Jr(k,L,G),V&&k.isNodeMaterial&&V.onUpdateProgram(k,jt,Te));let da=!1,Hi=!1,ps=!1,et=jt.getUniforms(),Zt=Te.uniforms;if(pe.useProgram(jt.program)&&(da=!0,Hi=!0,ps=!0),k.id!==X&&(X=k.id,Hi=!0),da||Y!==M){pe.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),et.setValue(D,"projectionMatrix",M.projectionMatrix),et.setValue(D,"viewMatrix",M.matrixWorldInverse);let kt=et.map.cameraPosition;kt!==void 0&&kt.setValue(D,Qn.setFromMatrixPosition(M.matrixWorld)),pt.logarithmicDepthBuffer&&et.setValue(D,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&et.setValue(D,"isOrthographic",M.isOrthographicCamera===!0),Y!==M&&(Y=M,Hi=!0,ps=!0)}if(Te.needsLights&&(an.state.sunShadowMap.length>0&&et.setValue(D,"sunShadowMap",an.state.sunShadowMap,ze),an.state.directionalShadowMap.length>0&&et.setValue(D,"directionalShadowMap",an.state.directionalShadowMap,ze),an.state.spotShadowMap.length>0&&et.setValue(D,"spotShadowMap",an.state.spotShadowMap,ze),an.state.pointShadowMap.length>0&&et.setValue(D,"pointShadowMap",an.state.pointShadowMap,ze)),G.isSkinnedMesh){et.setOptional(D,G,"bindMatrix"),et.setOptional(D,G,"bindMatrixInverse");let gt=G.skeleton;gt&&(gt.boneTexture===null&&gt.computeBoneTexture(),et.setValue(D,"boneTexture",gt.boneTexture,ze))}G.isBatchedMesh&&(et.setOptional(D,G,"batchingTexture"),et.setValue(D,"batchingTexture",G._matricesTexture,ze),et.setOptional(D,G,"batchingIdTexture"),et.setValue(D,"batchingIdTexture",G._indirectTexture,ze),et.setOptional(D,G,"batchingColorTexture"),G._colorsTexture!==null&&et.setValue(D,"batchingColorTexture",G._colorsTexture,ze));let zn=W.morphAttributes;if((zn.position!==void 0||zn.normal!==void 0||zn.color!==void 0)&&j.update(G,W,jt),(Hi||Te.receiveShadow!==G.receiveShadow)&&(Te.receiveShadow=G.receiveShadow,et.setValue(D,"receiveShadow",G.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&L.environment!==null&&(Zt.envMapIntensity.value=L.environmentIntensity),Zt.dfgLUT!==void 0&&(Zt.dfgLUT.value=kv()),Hi){if(et.setValue(D,"toneMappingExposure",P.toneMappingExposure),Te.needsLights&&Km(Zt,ps),fe&&k.fog===!0&&ae.refreshFogUniforms(Zt,fe),ae.refreshMaterialUniforms(Zt,k,xe,Pe,E.state.transmissionRenderTarget[M.id]),Te.needsLights&&Te.numLightProbeGrids>0){let gt=T,kt=0;for(let mi of E.state.lightProbeGridArray)mi.texture!==null&&(gt.textures[kt]=mi.texture,gt.min[kt]=mi.boundingBox.min,gt.max[kt]=mi.boundingBox.max,gt.resolution[kt]=mi.resolution,kt++);for(let mi in gt)gt[mi].length=kt;Zt.probesSH.value=gt.textures,Zt.probesMin.value=gt.min,Zt.probesMax.value=gt.max,Zt.probesResolution.value=gt.resolution}Nr.upload(D,Pd(Te),Zt,ze)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Nr.upload(D,Pd(Te),Zt,ze),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&et.setValue(D,"center",G.center),et.setValue(D,"modelViewMatrix",G.modelViewMatrix),et.setValue(D,"normalMatrix",G.normalMatrix),et.setValue(D,"modelMatrix",G.matrixWorld),k.uniformsGroups!==void 0){let gt=k.uniformsGroups;for(let kt=0,mi=gt.length;kt<mi;kt++){let Dd=gt[kt];Ce.update(Dd,jt),Ce.bind(Dd,jt)}}return jt}function Km(M,L){M.ambientLightColor.needsUpdate=L,M.lightProbe.needsUpdate=L,M.sunLights.needsUpdate=L,M.sunLightShadows.needsUpdate=L,M.directionalLights.needsUpdate=L,M.directionalLightShadows.needsUpdate=L,M.pointLights.needsUpdate=L,M.pointLightShadows.needsUpdate=L,M.spotLights.needsUpdate=L,M.spotLightShadows.needsUpdate=L,M.rectAreaLights.needsUpdate=L,M.hemisphereLights.needsUpdate=L}function Jm(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return B},this.getRenderTarget=function(){return ne},this.setRenderTargetTextures=function(M,L,W){let k=Le.get(M);k.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),Le.get(M.texture).__webglTexture=L,Le.get(M.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:W,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,L){let W=Le.get(M);W.__webglFramebuffer=L,W.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(M,L=0,W=0){ne=M,H=L,B=W;let k=null,G=!1,fe=!1;if(M){let ue=Le.get(M);if(ue.__useDefaultFramebuffer!==void 0){pe.bindFramebuffer(D.FRAMEBUFFER,ue.__webglFramebuffer),ie.copy(M.viewport),Me.copy(M.scissor),He=M.scissorTest,pe.viewport(ie),pe.scissor(Me),pe.setScissorTest(He),X=-1;return}else if(ue.__webglFramebuffer===void 0)ze.setupRenderTarget(M);else if(ue.__hasExternalTextures)ze.rebindTextures(M,Le.get(M.texture).__webglTexture,Le.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let Ge=M.depthTexture;if(ue.__boundDepthTexture!==Ge){if(Ge!==null&&Le.has(Ge)&&(M.width!==Ge.image.width||M.height!==Ge.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ze.setupDepthRenderbuffer(M)}}let ye=M.texture;(ye.isData3DTexture||ye.isDataArrayTexture||ye.isCompressedArrayTexture)&&(fe=!0);let Ee=Le.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ee[L])?k=Ee[L][W]:k=Ee[L],G=!0):M.samples>0&&ze.useMultisampledRTT(M)===!1?k=Le.get(M).__webglMultisampledFramebuffer:Array.isArray(Ee)?k=Ee[W]:k=Ee,ie.copy(M.viewport),Me.copy(M.scissor),He=M.scissorTest}else ie.copy(De).multiplyScalar(xe).floor(),Me.copy(it).multiplyScalar(xe).floor(),He=lt;if(W!==0&&(k=q),pe.bindFramebuffer(D.FRAMEBUFFER,k)&&pe.drawBuffers(M,k),pe.viewport(ie),pe.scissor(Me),pe.setScissorTest(He),G){let ue=Le.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+L,ue.__webglTexture,W)}else if(fe){let ue=L;for(let ye=0;ye<M.textures.length;ye++){let Ee=Le.get(M.textures[ye]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+ye,Ee.__webglTexture,W,ue)}}else if(M!==null&&W!==0){let ue=Le.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,ue.__webglTexture,W)}X=-1};function Nd(M){let L=Le.get(M);return(L.__readFormat!==M.format||L.__readType!==M.type)&&(L.__readFormat=M.format,L.__readType=M.type,L.__formatReadable=pt.textureFormatReadable(M.format),L.__typeReadable=pt.textureTypeReadable(M.type)),L}this.readRenderTargetPixels=function(M,L,W,k,G,fe,ve,ue=0){if(!(M&&M.isWebGLRenderTarget)){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=Le.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ve!==void 0&&(ye=ye[ve],Array.isArray(ye)&&(ye=ye[0])),ye){pe.bindFramebuffer(D.FRAMEBUFFER,ye);try{let Ee=M.textures[ue],Ge=Ee.format,$e=Ee.type;M.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+ue);let be=Nd(Ee);if(be.__formatReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(be.__typeReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=M.width-k&&W>=0&&W<=M.height-G&&D.readPixels(L,W,k,G,oe.convert(Ge),oe.convert($e),fe)}finally{let Ee=ne!==null?Le.get(ne).__webglFramebuffer:null;pe.bindFramebuffer(D.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(M,L,W,k,G,fe,ve,ue=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ye=Le.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ve!==void 0&&(ye=ye[ve],Array.isArray(ye)&&(ye=ye[0])),ye)if(L>=0&&L<=M.width-k&&W>=0&&W<=M.height-G){pe.bindFramebuffer(D.FRAMEBUFFER,ye);let Ee=M.textures[ue],Ge=Ee.format,$e=Ee.type;M.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+ue);let be=Nd(Ee);if(be.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(be.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let je=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,je),D.bufferData(D.PIXEL_PACK_BUFFER,fe.byteLength,D.STREAM_READ),D.readPixels(L,W,k,G,oe.convert(Ge),oe.convert($e),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let wt=ne!==null?Le.get(ne).__webglFramebuffer:null;pe.bindFramebuffer(D.FRAMEBUFFER,wt);let dt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await sp(D,dt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,je),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,fe),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(je),D.deleteSync(dt),fe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,L=null,W=0){let k=Math.pow(2,-W),G=Math.floor(M.image.width*k),fe=Math.floor(M.image.height*k),ve=L!==null?L.x:0,ue=L!==null?L.y:0;ze.setTexture2D(M,0),D.copyTexSubImage2D(D.TEXTURE_2D,W,0,0,ve,ue,G,fe),pe.unbindTexture()},this.copyTextureToTexture=function(M,L,W=null,k=null,G=0,fe=0){let ve,ue,ye,Ee,Ge,$e,be,je,wt,dt=M.isCompressedTexture?M.mipmaps[fe]:M.image;if(W!==null)ve=W.max.x-W.min.x,ue=W.max.y-W.min.y,ye=W.isBox3?W.max.z-W.min.z:1,Ee=W.min.x,Ge=W.min.y,$e=W.isBox3?W.min.z:0;else{let et=Math.pow(2,-G);ve=Math.floor(dt.width*et),ue=Math.floor(dt.height*et),M.isDataArrayTexture?ye=dt.depth:M.isData3DTexture?ye=Math.floor(dt.depth*et):ye=1,Ee=0,Ge=0,$e=0}k!==null?(be=k.x,je=k.y,wt=k.z):(be=0,je=0,wt=0);let ct=oe.convert(L.format),$t=oe.convert(L.type),Te;L.isData3DTexture?(ze.setTexture3D(L,0),Te=D.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(ze.setTexture2DArray(L,0),Te=D.TEXTURE_2D_ARRAY):(ze.setTexture2D(L,0),Te=D.TEXTURE_2D),pe.activeTexture(D.TEXTURE0),pe.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,L.flipY),pe.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),pe.pixelStorei(D.UNPACK_ALIGNMENT,L.unpackAlignment);let an=pe.getParameter(D.UNPACK_ROW_LENGTH),tt=pe.getParameter(D.UNPACK_IMAGE_HEIGHT),fs=pe.getParameter(D.UNPACK_SKIP_PIXELS),jt=pe.getParameter(D.UNPACK_SKIP_ROWS),da=pe.getParameter(D.UNPACK_SKIP_IMAGES);pe.pixelStorei(D.UNPACK_ROW_LENGTH,dt.width),pe.pixelStorei(D.UNPACK_IMAGE_HEIGHT,dt.height),pe.pixelStorei(D.UNPACK_SKIP_PIXELS,Ee),pe.pixelStorei(D.UNPACK_SKIP_ROWS,Ge),pe.pixelStorei(D.UNPACK_SKIP_IMAGES,$e);let Hi=M.isDataArrayTexture||M.isData3DTexture,ps=L.isDataArrayTexture||L.isData3DTexture;if(M.isDepthTexture){let et=Le.get(M),Zt=Le.get(L),zn=Le.get(et.__renderTarget),gt=Le.get(Zt.__renderTarget);pe.bindFramebuffer(D.READ_FRAMEBUFFER,zn.__webglFramebuffer),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,gt.__webglFramebuffer);for(let kt=0;kt<ye;kt++)Hi&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Le.get(M).__webglTexture,G,$e+kt),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Le.get(L).__webglTexture,fe,wt+kt)),D.blitFramebuffer(Ee,Ge,Ee+ve,Ge+ue,be,je,be+ve,je+ue,D.DEPTH_BUFFER_BIT,D.NEAREST);pe.bindFramebuffer(D.READ_FRAMEBUFFER,null),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(G!==0||M.isRenderTargetTexture||Le.has(M)){let et=Le.get(M),Zt=Le.get(L);pe.bindFramebuffer(D.READ_FRAMEBUFFER,I),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,N);for(let zn=0;zn<ye;zn++)Hi?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,et.__webglTexture,G,$e+zn):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,et.__webglTexture,G),ps?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Zt.__webglTexture,fe,wt+zn):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Zt.__webglTexture,fe),G!==0?D.blitFramebuffer(Ee,Ge,Ee+ve,Ge+ue,be,je,be+ve,je+ue,D.COLOR_BUFFER_BIT,D.NEAREST):ps?D.copyTexSubImage3D(Te,fe,be,je,wt+zn,Ee,Ge,ve,ue):D.copyTexSubImage2D(Te,fe,be,je,Ee,Ge,ve,ue);pe.bindFramebuffer(D.READ_FRAMEBUFFER,null),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else ps?M.isDataTexture||M.isData3DTexture?D.texSubImage3D(Te,fe,be,je,wt,ve,ue,ye,ct,$t,dt.data):L.isCompressedArrayTexture?D.compressedTexSubImage3D(Te,fe,be,je,wt,ve,ue,ye,ct,dt.data):D.texSubImage3D(Te,fe,be,je,wt,ve,ue,ye,ct,$t,dt):M.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,fe,be,je,ve,ue,ct,$t,dt.data):M.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,fe,be,je,dt.width,dt.height,ct,dt.data):D.texSubImage2D(D.TEXTURE_2D,fe,be,je,ve,ue,ct,$t,dt);pe.pixelStorei(D.UNPACK_ROW_LENGTH,an),pe.pixelStorei(D.UNPACK_IMAGE_HEIGHT,tt),pe.pixelStorei(D.UNPACK_SKIP_PIXELS,fs),pe.pixelStorei(D.UNPACK_SKIP_ROWS,jt),pe.pixelStorei(D.UNPACK_SKIP_IMAGES,da),fe===0&&L.generateMipmaps===!0&&L.mipmapsAutoUpdate===!0&&D.generateMipmap(Te),pe.unbindTexture()},this.initRenderTarget=function(M){Le.get(M).__webglFramebuffer===void 0&&ze.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?ze.setTextureCube(M,0):M.isData3DTexture?ze.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?ze.setTexture2DArray(M,0):ze.setTexture2D(M,0),pe.unbindTexture()},this.resetState=function(){H=0,B=0,ne=null,pe.reset(),le.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Pn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}};function uu(i,e){if(e===Oh)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Lr||e===Xo){let t=i.getIndex();if(t===null){let r=[],o=i.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)r.push(a);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===Lr)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function Wp(i){let e=new Map,t=new Map,n=i.clone();return Xp(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,o=e.get(s),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Xp(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)Xp(i.children[n],e.children[n],t)}var cc=class extends ai{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new xu(t)}),this.register(function(t){return new yu(t)}),this.register(function(t){return new vu(t)}),this.register(function(t){return new Cu(t)}),this.register(function(t){return new Iu(t)}),this.register(function(t){return new Pu(t)}),this.register(function(t){return new Su(t)}),this.register(function(t){return new bu(t)}),this.register(function(t){return new Tu(t)}),this.register(function(t){return new wu(t)}),this.register(function(t){return new _u(t)}),this.register(function(t){return new Eu(t)}),this.register(function(t){return new Mu(t)}),this.register(function(t){return new Ru(t)}),this.register(function(t){return new Au(t)}),this.register(function(t){return new mu(t)}),this.register(function(t){return new hc(t,Ze.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new hc(t,Ze.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new Lu(t)})}load(e,t,n,s){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=Li.extractUrlBase(e);o=Li.resolveURL(c,this.path)}else o=Li.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new wr(this.manager);l.setPriority(this.priority),l.setCache(this.cache),l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Jp){try{o[Ze.KHR_BINARY_GLTF]=new Nu(e)}catch(u){s&&s(u);return}r=JSON.parse(o[Ze.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new zu(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case Ze.KHR_MATERIALS_UNLIT:o[u]=new gu;break;case Ze.KHR_DRACO_MESH_COMPRESSION:o[u]=new Du(r,this.dracoLoader);break;case Ze.KHR_TEXTURE_TRANSFORM:o[u]=new Uu;break;case Ze.KHR_MESH_QUANTIZATION:o[u]=new Ou;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function zv(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function _t(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var Ze={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},mu=class{constructor(e){this.parser=e,this.name=Ze.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,h=new Ae(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],cn);let u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Is(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Rs(h),c.distance=u;break;case"spot":c=new Uo(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),fi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}},gu=class{constructor(){this.name=Ze.KHR_MATERIALS_UNLIT}getMaterialType(){return Sn}extendParams(e,t,n){let s=[];e.color=new Ae(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],cn),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,ot))}return Promise.all(s)}},_u=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},xu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Oe(r,r)}return Promise.all(s)}},yu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(s)}},vu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_DISPERSION}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},Mu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}},Su=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_SHEEN}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(t.sheenColor=new Ae(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],cn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,ot)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}},bu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}},Tu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_VOLUME}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new Ae().setRGB(r[0],r[1],r[2],cn),Promise.all(s)}},wu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_IOR}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},Eu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_SPECULAR}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new Ae().setRGB(r[0],r[1],r[2],cn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,ot)),Promise.all(s)}},Au=class{constructor(e){this.parser=e,this.name=Ze.EXT_MATERIALS_BUMP}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}},Ru=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return _t(this.parser,e,this.name)!==null?dn:null}extendMaterialParams(e,t){let n=_t(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}},Cu=class{constructor(e){this.parser=e,this.name=Ze.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},Iu=class{constructor(e){this.parser=e,this.name=Ze.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},Pu=class{constructor(e){this.parser=e,this.name=Ze.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},hc=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let l=s.byteOffset||0,c=s.byteLength||0,h=s.count,u=s.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,s.mode,s.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(f),h,u,d,s.mode,s.filter),f})})}else return null}},Lu=class{constructor(e){this.name=Ze.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let c of s.primitives)if(c.mode!==Bn.TRIANGLES&&c.mode!==Bn.TRIANGLE_STRIP&&c.mode!==Bn.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(h=>(l[c]=h,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(let _ of u){let v=new Be,p=new O,m=new hn,S=new O(1,1,1),A=new ii(_.geometry,_.material,d);for(let R=0;R<d;R++)l.TRANSLATION&&p.fromBufferAttribute(l.TRANSLATION,R),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,R),l.SCALE&&S.fromBufferAttribute(l.SCALE,R),A.setMatrixAt(R,v.compose(p,m,S));let T=null;for(let R in l)if(R==="_COLOR_0"){let E=l[R];A.instanceColor=new wi(E.array,E.itemSize,E.normalized)}else if(R!=="TRANSLATION"&&R!=="ROTATION"&&R!=="SCALE"){if(T===null){let x=A.geometry;T=new St,T.name=x.name;for(let b in x.attributes)T.setAttribute(b,x.attributes[b]);for(let b in x.morphAttributes)T.morphAttributes[b]=x.morphAttributes[b];x.index!==null&&T.setIndex(x.index),T.morphTargetsRelative=x.morphTargetsRelative;for(let b of x.groups)T.addGroup(b.start,b.count,b.materialIndex);x.boundingBox!==null&&(T.boundingBox=x.boundingBox.clone()),x.boundingSphere!==null&&(T.boundingSphere=x.boundingSphere.clone()),T.drawRange.start=x.drawRange.start,T.drawRange.count=x.drawRange.count,T.userData=Object.assign({},x.userData),A.geometry=T}let E=l[R];T.setAttribute(R,new wi(E.array,E.itemSize,E.normalized))}ut.prototype.copy.call(A,_),this.parser.assignFinalMaterial(A),f.push(A)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}},Jp="glTF",$o=12,qp={JSON:1313821514,BIN:5130562},Nu=class{constructor(e){this.name=Ze.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,$o),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Jp)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-$o,r=new DataView(e,$o),o=0;for(;o<s;){let a=r.getUint32(o,!0);o+=4;let l=r.getUint32(o,!0);if(o+=4,l===qp.JSON){let c=new Uint8Array(e,$o+o,a);this.content=n.decode(c)}else if(l===qp.BIN){let c=$o+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Du=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ze.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let h in o){let u=Bu[h]||h.toLowerCase();a[u]=o[h]}for(let h in e.attributes){let u=Bu[h]||h.toLowerCase();if(o[h]!==void 0){let d=n.accessors[e.attributes[h]],f=Or[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){s.decodeDracoFile(h,function(f){for(let _ in f.attributes){let v=f.attributes[_],p=l[_];p!==void 0&&(v.normalized=p)}u(f)},a,c,cn,d)})})}},Uu=class{constructor(){this.name=Ze.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},Ou=class{constructor(){this.name=Ze.KHR_MESH_QUANTIZATION}},uc=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,h=s-t,u=(n-t)/h,d=u*u,f=d*u,_=e*c,v=_-c,p=-2*f+3*d,m=f-d,S=1-p,A=m-d+u;for(let T=0;T!==a;T++){let R=o[v+T+a],E=o[v+T+l]*h,x=o[_+T+a],b=o[_+T]*h;r[T]=S*R+A*E+p*x+m*b}return r}},Hv=new hn,Fu=class extends uc{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return Hv.fromArray(r).normalize().toArray(r),r}},Bn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Or={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Yp={9728:Mt,9729:Pt,9984:xl,9985:Ir,9986:Us,9987:On},Zp={33071:In,33648:pr,10497:Ln},du={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Bu={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Qi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Gv={CUBICSPLINE:void 0,LINEAR:Ms,STEP:vs},fu={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Vv(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new At({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:li})),i.DefaultMaterial}function Bs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function fi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Wv(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,h=e.length;c<h;c++){let u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let o=[],a=[],l=[];for(let c=0,h=e.length;c<h;c++){let u=e[c];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;o.push(d)}if(s){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;a.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function Xv(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function qv(i){let e,t=i.extensions&&i.extensions[Ze.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+pu(t.attributes):e=i.indices+":"+pu(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+pu(i.targets[n]);return e}function pu(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function ku(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Yv(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var Zv=new Be,zu=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new zv,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator!="undefined"&&typeof navigator.userAgent!="undefined"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap=="undefined"||n&&s<17||r&&o<98?(this.textureLoader=new Lo(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new Oo(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new wr(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return Bs(r,a,s),fi(a,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let o=t[s].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,h]of o.children.entries())r(h,a.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ze.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,o){n.load(Li.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let o=du[s.type],a=Or[s.componentType],l=s.normalized===!0,c=new a(s.count*o);return Promise.resolve(new yt(c,o,l))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],l=du[s.type],c=Or[s.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,_=s.normalized===!0,v,p;if(f&&f!==u){let m=Math.floor(d/f),S="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+m+":"+s.count,A=t.cache.get(S);A||(v=new c(a,m*f,s.count*f/h),A=new Ts(v,f/h),t.cache.add(S,A)),p=new Zi(A,l,d%f/h,_)}else a===null?v=new c(s.count*l):v=new c(a,d,s.count*l),p=new yt(v,l,_);if(s.sparse!==void 0){let m=du.SCALAR,S=Or[s.sparse.indices.componentType],A=s.sparse.indices.byteOffset||0,T=s.sparse.values.byteOffset||0,R=new S(o[1],A,s.sparse.count*m),E=new c(o[2],T,s.sparse.count*l);a!==null&&(p=new yt(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let x=0,b=R.length;x<b;x++){let F=R[x];if(p.setX(F,E[x*l]),l>=2&&p.setY(F,E[x*l+1]),l>=3&&p.setZ(F,E[x*l+2]),l>=4&&p.setW(F,E[x*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}p.normalized=_}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let s=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);let d=(r.samplers||{})[o.sampler]||{};return h.magFilter=Yp[d.magFilter]||Pt,h.minFilter=Yp[d.minFilter]||On,h.wrapS=Zp[d.wrapS]||Ln,h.wrapT=Zp[d.wrapT]||Ln,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Mt&&h.minFilter!==Pt,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());let o=s.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1,h;if(t.isKTX2Loader===!0&&o.bufferView!==void 0)h=n.getDependency("bufferView",o.bufferView).then(function(d){return new Promise(function(f,_){t.parse(d,f,_)})});else{if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(d){c=!0;let f=new Blob([d],{type:o.mimeType});return l=a.createObjectURL(f),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");h=Promise.resolve(l).then(function(d){return new Promise(function(f,_){let v=f;t.isImageBitmapLoader===!0&&(v=function(p){let m=new Lt(p);m.needsUpdate=!0,f(m)}),t.load(Li.resolveURL(d,r.path),v,void 0,_)})})}let u=h.then(function(d){return c===!0&&a.revokeObjectURL(l),fi(d,o),d.userData.mimeType=o.mimeType||Yv(o.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),d});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Ze.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[Ze.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=r.associations.get(o);o=r.extensions[Ze.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new si,tn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new br,tn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return At}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],o,a={},l=r.extensions||{},c=[];if(l[Ze.KHR_MATERIALS_UNLIT]){let u=s[Ze.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),c.push(u.extendParams(a,r,t))}else{let u=r.pbrMetallicRoughness||{};if(a.color=new Ae(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],cn),a.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",u.baseColorTexture,ot)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Un);let h=r.alphaMode||fu.OPAQUE;if(h===fu.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===fu.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Sn&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Oe(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==Sn&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Sn){let u=r.emissiveFactor;a.emissive=new Ae().setRGB(u[0],u[1],u[2],cn)}return r.emissiveTexture!==void 0&&o!==Sn&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,ot)),Promise.all(c).then(function(){let u=new o(a);return r.name&&(u.name=r.name),fi(u,r),t.associations.set(u,{materials:e}),r.extensions&&Bs(s,u,r),u})}createUniqueName(e){let t=ht.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[Ze.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Kp(l,a,t)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],h=qv(c),u=s[h];if(u)o.push(u.promise);else{let d;c.extensions&&c.extensions[Ze.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=Kp(new St,c,t),c.mode===Bn.TRIANGLE_STRIP?d=d.then(f=>uu(f,Xo)):c.mode===Bn.TRIANGLE_FAN&&(d=d.then(f=>uu(f,Lr))),s[h]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let h=o[l].material===void 0?Vv(this.cache):this.getDependency("material",o[l].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(async function(l){let c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,_=h.length;f<_;f++){let v=h[f],p=o[f],m,S=c[f];if(p.mode===Bn.TRIANGLES||p.mode===Bn.TRIANGLE_STRIP||p.mode===Bn.TRIANGLE_FAN||p.mode===void 0){let A=r.isSkinnedMesh===!0,T=v.hasAttribute("skinIndex")&&v.hasAttribute("skinWeight");A&&T===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=A&&T?new Mo(v,S):new Qe(v,S),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(p.mode===Bn.LINES)m=new bo(v,S);else if(p.mode===Bn.LINE_STRIP)m=new Es(v,S);else if(p.mode===Bn.LINE_LOOP)m=new To(v,S);else if(p.mode===Bn.POINTS)m=new Ei(v,S);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(m.geometry.morphAttributes).length>0&&Xv(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),fi(m,r),p.extensions&&Bs(s,m,p),t.assignFinalMaterial(m),u.push(m)}for(let f=0,_=u.length;f<_;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&Bs(s,u[0],r),u[0];let d=new Ht;r.extensions&&Bs(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,_=u.length;f<_;f++)d.add(u[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new It(ic.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new Cs(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),fi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),o=s,a=[],l=[];for(let c=0,h=o.length;c<h;c++){let u=o[c];if(u){a.push(u);let d=new Be;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new So(a,l)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],l=[],c=[],h=[];for(let u=0,d=s.channels.length;u<d;u++){let f=s.channels[u],_=s.samplers[f.sampler],v=f.target,p=v.node,m=s.parameters!==void 0?s.parameters[_.input]:_.input,S=s.parameters!==void 0?s.parameters[_.output]:_.output;v.node!==void 0&&(o.push(this.getDependency("node",p)),a.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",S)),c.push(_),h.push(v))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){let d=u[0],f=u[1],_=u[2],v=u[3],p=u[4],m=[];for(let A=0,T=d.length;A<T;A++){let R=d[A],E=f[A],x=_[A],b=v[A],F=p[A];if(R===void 0)continue;R.updateMatrix&&R.updateMatrix();let P=n._createAnimationTracks(R,E,x,b,F);if(P)for(let U=0;U<P.length;U++)m.push(P[U])}let S=new Po(r,void 0,m);return fi(S,s),S})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=s.weights.length;l<c;l++)a.morphTargetInfluences[l]=s.weights[l]}),o})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let c=0,h=a.length;c<h;c++)o.push(n.getDependency("node",a[c]));let l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){let h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,Zv)});for(let f=0,_=u.length;f<_;f++)h.add(u[f]);if(h.userData.pivot!==void 0&&u.length>0){let f=h.userData.pivot,_=u[0];h.pivot=new O().fromArray(f),h.position.x-=f[0],h.position.y-=f[1],h.position.z-=f[2],_.position.set(0,0,0),delete h.userData.pivot}return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let h;if(r.isBone===!0?h=new Mr:c.length>1?h=new Ht:c.length===1?h=c[0]:h=new ut,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=o),fi(h,r),r.extensions&&Bs(n,h,r),r.matrix!==void 0){let u=new Be;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!s.associations.has(h))s.associations.set(h,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let u=s.associations.get(h);s.associations.set(h,{...u})}return s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Ht;n.name&&(r.name=s.createUniqueName(n.name)),fi(r,n),n.extensions&&Bs(t,r,n);let o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(s.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let h=0,u=l.length;h<u;h++){let d=l[h];d.parent!==null?r.add(Wp(d)):r.add(d)}let c=h=>{let u=new Map;for(let[d,f]of s.associations)(d instanceof tn||d instanceof Lt)&&u.set(d,f);return h.traverse(d=>{let f=s.associations.get(d);f!=null&&u.set(d,f)}),u};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){let o=[],a=e.name?e.name:e.uuid,l=[];function c(f){f.morphTargetInfluences&&l.push(f.name?f.name:f.uuid)}Qi[r.path]===Qi.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(a);let h;switch(Qi[r.path]){case Qi.weights:h=Ci;break;case Qi.rotation:h=Ii;break;case Qi.translation:case Qi.scale:h=Ji;break;default:switch(n.itemSize){case 1:h=Ci;break;case 2:case 3:default:h=Ji;break}break}let u=s.interpolation!==void 0?Gv[s.interpolation]:Ms,d=this._getArrayFromAccessor(n);for(let f=0,_=l.length;f<_;f++){let v=new h(l[f]+"."+Qi[r.path],t.array,d,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(v),o.push(v)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=ku(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof Ii?Fu:uc;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Kv(i,e,t){let n=e.attributes,s=new un;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(s.set(new O(l[0],l[1],l[2]),new O(c[0],c[1],c[2])),a.normalized){let h=ku(Or[a.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new O,l=new O;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],f=d.min,_=d.max;if(f!==void 0&&_!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(_[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(_[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(_[2]))),d.normalized){let v=ku(Or[d.componentType]);l.multiplyScalar(v)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;let o=new mn;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function Kp(i,e,t){let n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(let o in n){let a=Bu[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){let o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return Ye.workingColorSpace!==cn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ye.workingColorSpace}" not supported.`),fi(i,e),Kv(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?Wv(i,e.targets,t):i})}var dc=class extends bs{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new gn;e.deleteAttribute("uv");let t=new At({side:Nt}),n=new At,s=new Rs(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Qe(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new ii(e,n,6),a=new ut;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let l=new Qe(e,Fr(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Qe(e,Fr(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new Qe(e,Fr(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Qe(e,Fr(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new Qe(e,Fr(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new Qe(e,Fr(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Fr(i){return new Co({color:0,emissive:16777215,emissiveIntensity:i})}var es=[{id:"oblachko",name:"\u041E\u0431\u043B\u0430\u0447\u043A\u043E",price:0,desc:"\u041F\u0443\u0448\u0438\u0441\u0442\u044B\u0439 \u0431\u0430\u0440\u0430\u0448\u0435\u043A \u0432 \u0431\u0438\u0440\u044E\u0437\u043E\u0432\u043E\u043C \u0448\u0430\u0440\u0444\u0435. \u0411\u0435\u0433\u0430\u0435\u0442 \u043D\u0430 \u0437\u0430\u0434\u043D\u0438\u0445 \u043A\u043E\u043F\u044B\u0442\u0446\u0430\u0445 \u0438 \u0432\u0441\u0435\u0433\u0434\u0430 \u0441\u043F\u0435\u0448\u0438\u0442 \u043D\u0430 \u043F\u043E\u043C\u043E\u0449\u044C.",color:"#2f8f8a"},{id:"pugovka",name:"\u041F\u0443\u0433\u043E\u0432\u043A\u0430",price:300,desc:"\u041C\u043B\u0430\u0434\u0448\u0438\u0439 \u0431\u0440\u0430\u0442 \u041E\u0431\u043B\u0430\u0447\u043A\u0430. \u0416\u0451\u043B\u0442\u0430\u044F \u0448\u0430\u043F\u043E\u0447\u043A\u0430, \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0435 \u043D\u043E\u0436\u043A\u0438 \u0438 \u043E\u0433\u0440\u043E\u043C\u043D\u043E\u0435 \u043B\u044E\u0431\u043E\u043F\u044B\u0442\u0441\u0442\u0432\u043E.",color:"#f4b13e"},{id:"bella",name:"\u0411\u0435\u043B\u043B\u0430",price:500,desc:"\u0420\u043E\u0437\u043E\u0432\u044B\u0439 \u0431\u0430\u043D\u0442, \u044F\u0433\u043E\u0434\u043D\u044B\u0439 \u0448\u0430\u0440\u0444 \u0438 \u0441\u043C\u0435\u043B\u043E\u0435 \u0441\u0435\u0440\u0434\u0446\u0435.",color:"#ec6f9f"}],ks={letter:{name:"\u043F\u0438\u0441\u044C\u043C\u0430",icon:"\u2709\uFE0F"},ticket:{name:"\u0442\u0430\u043B\u043E\u043D\u044B \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438",icon:"\u{1F3AB}"},seeds:{name:"\u043F\u0430\u043A\u0435\u0442\u0438\u043A\u0438 \u0441\u0435\u043C\u044F\u043D",icon:"\u{1F331}"},lantern:{name:"\u0444\u043E\u043D\u0430\u0440\u0438\u043A\u0438",icon:"\u{1F3EE}"},gift:{name:"\u043F\u043E\u0434\u0430\u0440\u043A\u0438",icon:"\u{1F381}"},backpack:{name:"\u0440\u044E\u043A\u0437\u0430\u0447\u043E\u043A",icon:"\u{1F392}"},star:{name:"\u0437\u0432\u0451\u0437\u0434\u043E\u0447\u043A\u0438",icon:"\u2B50"},squish:{name:"\u0441\u043A\u0432\u0438\u0448",icon:"\u{1F9F8}"},moon:{name:"\u043B\u0443\u043D\u043D\u044B\u0435 \u0438\u0441\u043A\u0440\u044B",icon:"\u{1F319}"}},kn={farm:{name:"\u041B\u0443\u0433\u043E\u0432\u0430\u044F \u0441\u0442\u0430\u043D\u0446\u0438\u044F",sky:["#9fd3e6","#e9f4e8"],fog:"#d7ebe6",fogNear:40,fogFar:170,sun:"#fff1d6",sunI:2.6,hemi:["#dff1ff","#7c9a5c"],hemiI:1.1,night:!1,ground:"grass",path:"gravel",rails:!0,music:"farm",scenery:[["tree_a",3],["tree_b",3],["tree_c",2],["bush_a",3],["bush_b",3],["flowers",3],["fence",4],["sunflowers",2],["hay",1]],landmarks:[["barn",1],["farmhouse",1],["windmill",1],["station",1]],jump:["hay","crate","barrier"],slide:["arch_flags","arch"],block:["crate_stack","wagon","wagon2"],moving:["tractor"],platform:!0,clouds:!0},festival:{name:"\u041F\u0440\u0430\u0437\u0434\u043D\u0438\u0447\u043D\u0430\u044F \u0444\u0435\u0440\u043C\u0430",sky:["#f2b98a","#fbe6c4"],fog:"#f6dcb8",fogNear:40,fogFar:160,sun:"#ffd7a0",sunI:2.2,hemi:["#ffe9cc","#9a8456"],hemiI:1,night:!1,ground:"grass",path:"dirt",music:"festival",scenery:[["garland_post",4],["balloons",2],["sunflowers",3],["tree_a",2],["tree_autumn",2],["flowers",3],["fence",3],["bush_b",2]],landmarks:[["barn",1],["farmhouse",1],["windmill",1]],jump:["hay","crate","barrels"],slide:["arch_flags"],block:["crate_stack","gift_pile"],moving:["tractor"],clouds:!0},city:{name:"\u041F\u0440\u043E\u0441\u043F\u0435\u043A\u0442 \u041A\u0430\u0448\u0442\u0430\u043D\u043E\u0432",sky:["#a9d3ea","#eef4f2"],fog:"#dbe9ee",fogNear:45,fogFar:180,sun:"#fff4e0",sunI:2.5,hemi:["#e6f2ff","#8a8f86"],hemiI:1.1,night:!1,ground:"pavement",path:"asphalt",music:"city",scenery:[["lamp",5],["tree_b",3],["bus_stop",1],["bush_a",2]],landmarks:[["bld_a",2],["bld_b",2],["bld_c",2],["bld_d",2]],buildings:!0,jump:["barrier","cones"],slide:["arch"],block:["car","car2","car3","van"],moving:["car","car2","car3","van","bus"],clouds:!0},market:{name:"\u0417\u0435\u043B\u0451\u043D\u0430\u044F \u043A\u043E\u0440\u0437\u0438\u043D\u0430",sky:["#e9efe2","#f6f7ef"],fog:"#eef1e6",fogNear:30,fogFar:120,sun:"#fff8ea",sunI:1.4,hemi:["#ffffff","#c9cdb8"],hemiI:1.6,night:!1,indoor:!0,ground:"tiles",path:"tiles",music:"market",scenery:[],landmarks:[],jump:["crate","cones"],slide:["arch"],block:["crate_stack","cart"],moving:["cart"]},depot:{name:"\u0412\u0435\u0447\u0435\u0440\u043D\u0435\u0435 \u0434\u0435\u043F\u043E",sky:["#2c3558","#a3738a"],fog:"#5b5370",fogNear:30,fogFar:140,sun:"#ffc79a",sunI:1,hemi:["#8d8fd0","#3a3540"],hemiI:.9,night:!0,ground:"gravel_dark",path:"gravel_dark",rails:!0,music:"depot",scenery:[["lamp",6],["crate_stack",1],["barrels",1]],landmarks:[["bld_a",1],["bld_b",1],["bld_c",1],["station",1]],buildings:!0,jump:["barrier","crate","barrels"],slide:["arch"],block:["wagon","wagon2","wagon3"],moving:["wagon3"],platform:!0,stars:!0},forest:{name:"\u0421\u043E\u0441\u043D\u043E\u0432\u044B\u0439 \u043B\u0435\u0441",sky:["#a6d0c4","#e8f1df"],fog:"#cfe3d4",fogNear:30,fogFar:140,sun:"#fff0cf",sunI:2.2,hemi:["#dff3e6","#5d7a4c"],hemiI:1.1,night:!1,ground:"forest",path:"dirt",music:"forest",scenery:[["pine_a",5],["pine_b",4],["tree_c",2],["mushroom",2],["fern",4],["stump",2],["bush_a",2]],landmarks:[["cliff_a",1],["cliff_b",1]],jump:["log","log","stump"],slide:["arch_branch"],block:["rock"],moving:[],clouds:!0},coast:{name:"\u041C\u043E\u0440\u0441\u043A\u0430\u044F \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u0430\u044F",sky:["#8fcfe6","#eef8f6"],fog:"#d6eef0",fogNear:45,fogFar:190,sun:"#fff6e2",sunI:2.7,hemi:["#e6f6ff","#c9b78a"],hemiI:1.15,night:!1,ground:"sand",path:"planks",sea:!0,music:"coast",scenery:[["umbrella",3],["beach_hut",2],["pier_post",3],["bench",1],["barrels",1]],landmarks:[["lighthouse",1],["boat",2]],jump:["barrels","bench","crate"],slide:["arch_flags"],block:["crate_stack"],moving:[],clouds:!0},snow:{name:"\u0421\u043D\u0435\u0436\u043D\u0430\u044F \u0434\u0435\u0440\u0435\u0432\u043D\u044F",sky:["#bcd6ea","#f3f7fa"],fog:"#e4eef5",fogNear:35,fogFar:150,sun:"#fffaf0",sunI:2.2,hemi:["#f0f6ff","#b8c8d0"],hemiI:1.3,night:!1,ground:"snow",path:"snowpath",music:"snow",snowfall:!0,scenery:[["pine_snow",6],["lamp",2],["snowman",1],["fence",2]],landmarks:[["house_snow",3],["xmas_tree",1]],jump:["snowdrift","snowdrift","barrier"],slide:["arch_ice"],block:["snowman","gift_pile"],moving:[],clouds:!0},newyear:{name:"\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0451\u043B\u043A\u0438",sky:["#1e2b55","#5a6aa0"],fog:"#34406b",fogNear:30,fogFar:140,sun:"#c7d6ff",sunI:.9,hemi:["#8ea6ff","#4a5070"],hemiI:1,night:!0,ground:"snow",path:"snowpath",music:"snow",snowfall:!0,stars:!0,scenery:[["pine_snow",4],["xmas_tree",2],["lamp",3],["garland_post",3],["snowman",1]],landmarks:[["house_snow",3]],jump:["snowdrift","snowdrift","crate"],slide:["arch_ice"],block:["gift_pile","snowman"],moving:[]},sakura:{name:"\u0421\u0430\u0434 \u0441\u0430\u043A\u0443\u0440\u044B",sky:["#f0c7d6","#f8eef0"],fog:"#f2e2e6",fogNear:35,fogFar:150,sun:"#fff0ea",sunI:2.3,hemi:["#fff0f6","#8aa27a"],hemiI:1.15,night:!1,ground:"grass_light",path:"stones",music:"sakura",petals:!0,scenery:[["sakura_a",4],["sakura_b",4],["stone_lantern",3],["bush_b",2],["flowers",2]],landmarks:[["gate",1]],jump:["bench","barrels"],slide:["arch_lantern"],block:["rock","crate_stack"],moving:[],clouds:!0},halloween:{name:"\u0422\u044B\u043A\u0432\u0435\u043D\u043D\u0430\u044F \u0430\u043B\u043B\u0435\u044F",sky:["#2b2140","#7a4f72"],fog:"#4a3a58",fogNear:25,fogFar:120,sun:"#ffb27a",sunI:.8,hemi:["#9c86d8","#2f2838"],hemiI:.9,night:!0,ground:"grass_dark",path:"dirt_dark",music:"halloween",stars:!0,scenery:[["dead_tree",4],["pumpkins",3],["fence",2],["ghost",2],["lamp",2]],landmarks:[["spooky_house",2]],jump:["pumpkins","crate"],slide:["arch_web"],block:["crate_stack","barrels"],moving:["ghost"]},night:{name:"\u041D\u043E\u0447\u043D\u0430\u044F \u0444\u0435\u0440\u043C\u0430",sky:["#1a2448","#41557e"],fog:"#2b3656",fogNear:30,fogFar:140,sun:"#b8c8ff",sunI:.8,hemi:["#7d93e0","#2a3244"],hemiI:.95,night:!0,ground:"grass_dark",path:"dirt_dark",music:"depot",stars:!0,fireflies:!0,scenery:[["tree_a",3],["tree_c",2],["bush_a",2],["fence",3],["lamp",2],["flowers",2]],landmarks:[["farmhouse",2],["barn",1],["windmill",1]],jump:["hay","crate"],slide:["arch_flags"],block:["crate_stack"],moving:[]}},Hu=[{title:"\u0421\u0435\u043C\u0435\u043D\u0430 \u0434\u043B\u044F \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u043A\u0430",copy:"\u041C\u0435\u0448\u043E\u0447\u0435\u043A \u0440\u0435\u0434\u043A\u0438\u0445 \u0441\u0435\u043C\u044F\u043D \u0443\u0435\u0445\u0430\u043B \u0441 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u0438\u043C \u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A\u043E\u043C. \u041E\u0431\u043B\u0430\u0447\u043A\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0432 \u043F\u0443\u0442\u044C \u2014 \u043E\u0442 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u0434\u043E \u0433\u043E\u0440\u043E\u0434\u0430 \u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u043E."},{title:"\u0411\u043E\u043B\u044C\u0448\u0438\u0435 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u0434\u0435\u043B\u0430",copy:"\u041F\u0440\u0430\u0437\u0434\u043D\u0438\u043A \u043F\u043E\u0437\u0430\u0434\u0438, \u0430 \u0434\u0435\u043B\u0430 \u043D\u0435 \u043A\u043E\u043D\u0447\u0430\u044E\u0442\u0441\u044F: \u043D\u0430\u0439\u0442\u0438 \u0440\u044E\u043A\u0437\u0430\u0447\u043E\u043A, \u0443\u0441\u043F\u0435\u0442\u044C \u0432 \u0448\u043A\u043E\u043B\u0443 \u0438 \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0441\u043A\u0432\u0438\u0448."},{title:"\u0422\u0451\u043F\u043B\u043E\u0435 \u0432\u043E\u043B\u0448\u0435\u0431\u0441\u0442\u0432\u043E",copy:"\u041F\u0440\u0438\u0445\u043E\u0434\u0438\u0442 \u0437\u0438\u043C\u0430. \u0414\u043D\u0451\u043C \u2014 \u043F\u043E\u0434\u0430\u0440\u043E\u043A \u0434\u043B\u044F \u041F\u0443\u0433\u043E\u0432\u043A\u0438, \u043D\u043E\u0447\u044C\u044E \u2014 \u0411\u0435\u043B\u043B\u0430 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043B\u0443\u043D\u043D\u043E\u0439 \u0444\u0435\u0435\u0439."},{title:"\u041F\u0440\u0430\u0437\u0434\u043D\u0438\u043A\u0438 \u0434\u043E\u043B\u0438\u043D\u044B",copy:"\u0414\u043E\u0431\u0440\u044B\u0435 \u0442\u0435\u043D\u0438 \u0425\u044D\u043B\u043B\u043E\u0443\u0438\u043D\u0430 \u0438 \u0437\u0432\u0435\u0437\u0434\u0430 \u0434\u043B\u044F \u0441\u0430\u043C\u043E\u0439 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0451\u043B\u043A\u0438."}],sn=[{act:0,title:"\u041F\u0438\u0441\u044C\u043C\u043E \u0441 \u0444\u0435\u0440\u043C\u044B",themes:["farm"],len:1100,speed:15,reward:40,item:"letter",items:5,q:[{t:"coins",n:60},{t:"items"}],intro:"\u0417\u0430\u0432\u0442\u0440\u0430 \u2014 \u041F\u0440\u0430\u0437\u0434\u043D\u0438\u043A \u041B\u0443\u0433\u043E\u0432. \u041D\u043E \u043C\u0435\u0448\u043E\u0447\u0435\u043A \u0440\u0435\u0434\u043A\u0438\u0445 \u0441\u0435\u043C\u044F\u043D \u043F\u043E \u043E\u0448\u0438\u0431\u043A\u0435 \u0443\u0435\u0445\u0430\u043B \u0441 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u0438\u043C \u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A\u043E\u043C! \u0412\u0435\u0442\u0435\u0440 \u0440\u0430\u0437\u043D\u0451\u0441 \u043F\u043E \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043F\u0438\u0441\u044C\u043C\u0430 \u0441 \u0430\u0434\u0440\u0435\u0441\u043E\u043C \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438 \u2014 \u043F\u043E \u043D\u0438\u043C \u041E\u0431\u043B\u0430\u0447\u043A\u043E \u0443\u0437\u043D\u0430\u0435\u0442, \u043A\u0443\u0434\u0430 \u0435\u0445\u0430\u0442\u044C.",goal:"\u0421\u043E\u0431\u0435\u0440\u0438 5 \u043F\u0438\u0441\u0435\u043C \u0438 \u0434\u043E\u0431\u0435\u0433\u0438 \u0434\u043E \u0448\u043B\u0430\u0433\u0431\u0430\u0443\u043C\u0430. \u041F\u043E \u0440\u0430\u043C\u043F\u0430\u043C \u043C\u043E\u0436\u043D\u043E \u0437\u0430\u0431\u0435\u0436\u0430\u0442\u044C \u043D\u0430 \u043A\u0440\u044B\u0448\u0438 \u0432\u0430\u0433\u043E\u043D\u043E\u0432.",lines:["\u041A\u0440\u0430\u0441\u043D\u0430\u044F \u043B\u0435\u043D\u0442\u0430 \u043D\u0430 \u0434\u043E\u0440\u043E\u0433\u0435! \u0413\u0440\u0443\u0437\u043E\u0432\u0438\u043A \u043F\u0440\u043E\u0435\u0437\u0436\u0430\u043B \u0437\u0434\u0435\u0441\u044C.","\u0415\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u2014 \u0438 \u0441\u0442\u0430\u043D\u0446\u0438\u044F \u043F\u043E\u0437\u0430\u0434\u0438!"],ending:"\u0412\u0441\u0435 \u043F\u0438\u0441\u044C\u043C\u0430 \u0441\u043E\u0431\u0440\u0430\u043D\u044B: \u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A \u0435\u0434\u0435\u0442 \u0432 \u0441\u0443\u043F\u0435\u0440\u043C\u0430\u0440\u043A\u0435\u0442 \xAB\u0417\u0435\u043B\u0451\u043D\u0430\u044F \u043A\u043E\u0440\u0437\u0438\u043D\u0430\xBB. \u041F\u0440\u0438\u0434\u0451\u0442\u0441\u044F \u0432\u043F\u0435\u0440\u0432\u044B\u0435 \u0432\u044B\u0439\u0442\u0438 \u0432 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0433\u043E\u0440\u043E\u0434."},{act:0,title:"\u0413\u043E\u0440\u043E\u0434 \u043D\u0430 \u043A\u043E\u043B\u0451\u0441\u0430\u0445",themes:["city"],len:1300,speed:16.5,reward:50,item:"ticket",items:5,q:[{t:"coins",n:80},{t:"nohit"}],intro:"\u041F\u0440\u043E\u0441\u043F\u0435\u043A\u0442 \u041A\u0430\u0448\u0442\u0430\u043D\u043E\u0432 \u0448\u0443\u043C\u0438\u0442 \u043C\u043E\u0442\u043E\u0440\u0430\u043C\u0438. \u041C\u0430\u0448\u0438\u043D\u044B \u0435\u0434\u0443\u0442 \u043D\u0430\u0432\u0441\u0442\u0440\u0435\u0447\u0443, \u0430 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A\u0430 \u043F\u043E \u0434\u043E\u0440\u043E\u0433\u0435 \u0440\u0430\u0441\u0442\u0435\u0440\u044F\u043B \u0442\u0430\u043B\u043E\u043D\u044B \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438.",goal:"\u041C\u0430\u0448\u0438\u043D\u044B \u0434\u0432\u0438\u0436\u0443\u0442\u0441\u044F \u043D\u0430\u0432\u0441\u0442\u0440\u0435\u0447\u0443 \u2014 \u0443\u0445\u043E\u0434\u0438 \u0441 \u0438\u0445 \u043F\u043E\u043B\u043E\u0441\u044B \u0437\u0430\u0440\u0430\u043D\u0435\u0435. \u0421\u043E\u0431\u0435\u0440\u0438 \u0442\u0430\u043B\u043E\u043D\u044B \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438.",lines:["\u041C\u0430\u0448\u0438\u043D\u044B \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0435\u0434\u0443\u0442 \u043D\u0430\u0432\u0441\u0442\u0440\u0435\u0447\u0443! \u0421\u043C\u043E\u0442\u0440\u0438 \u0432\u043F\u0435\u0440\u0451\u0434.","\u0412\u0434\u0430\u043B\u0438 \u0443\u0436\u0435 \u0432\u0438\u0434\u043D\u0430 \u0432\u044B\u0432\u0435\u0441\u043A\u0430 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430!"],ending:"\u0412\u043E\u0442 \u0438 \xAB\u0417\u0435\u043B\u0451\u043D\u0430\u044F \u043A\u043E\u0440\u0437\u0438\u043D\u0430\xBB! \u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u0433\u043E\u0432\u043E\u0440\u0438\u0442: \u043C\u0435\u0448\u043E\u0447\u0435\u043A \u043E\u0442\u043D\u0435\u0441\u043B\u0438 \u0432 \u043E\u0442\u0434\u0435\u043B \u0441\u0430\u0434\u0430. \u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0439\u0442\u0438 \u043C\u0435\u0436\u0434\u0443 \u043E\u0433\u0440\u043E\u043C\u043D\u044B\u043C\u0438 \u0441\u0442\u0435\u043B\u043B\u0430\u0436\u0430\u043C\u0438."},{act:0,title:"\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u044F \xAB\u0421\u0443\u043F\u0435\u0440\u043C\u0430\u0440\u043A\u0435\u0442\xBB",themes:["market"],len:1100,speed:14.5,reward:60,item:"seeds",items:5,q:[{t:"coins",n:70},{t:"items"}],intro:"\u0414\u043B\u044F \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0433\u043E \u0431\u0430\u0440\u0430\u0448\u043A\u0430 \u0441\u0443\u043F\u0435\u0440\u043C\u0430\u0440\u043A\u0435\u0442 \u2014 \u0446\u0435\u043B\u044B\u0439 \u0433\u043E\u0440\u043E\u0434. \u0422\u0435\u043B\u0435\u0436\u043A\u0438 \u043A\u0430\u043A \u0430\u0432\u0442\u043E\u0431\u0443\u0441\u044B, \u043A\u043E\u0440\u043E\u0431\u043A\u0438 \u0432\u044B\u0448\u0435 \u0437\u0430\u0431\u043E\u0440\u0430, \u0430 \u043D\u0430 \u043F\u043E\u043B\u043A\u0430\u0445 \u2014 \u043F\u0430\u043A\u0435\u0442\u0438\u043A\u0438 \u0441\u0435\u043C\u044F\u043D \u0434\u043B\u044F \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u0447\u043D\u043E\u0439 \u043A\u043B\u0443\u043C\u0431\u044B.",goal:"\u042F\u0449\u0438\u043A\u0438 \u2014 \u043F\u0440\u044B\u0436\u043A\u043E\u043C, \u0442\u0435\u043B\u0435\u0436\u043A\u0438 \u2014 \u0432 \u043E\u0431\u0445\u043E\u0434. \u0421\u043E\u0431\u0435\u0440\u0438 5 \u043F\u0430\u043A\u0435\u0442\u0438\u043A\u043E\u0432 \u0441\u0435\u043C\u044F\u043D \u0434\u043B\u044F \u043A\u043B\u0443\u043C\u0431\u044B.",lines:["\u041E\u0442\u0434\u0435\u043B \u0441\u0430\u0434\u0430 \u2014 \u0432 \u0441\u0430\u043C\u043E\u043C \u043A\u043E\u043D\u0446\u0435 \u0437\u0430\u043B\u0430!","\u041A\u0430\u0441\u0441\u0430 \u0443\u0436\u0435 \u0440\u044F\u0434\u043E\u043C!"],ending:"\u041A\u0430\u0441\u0441\u0438\u0440 \u0443\u0437\u043D\u0430\u0451\u0442 \u043A\u0440\u0430\u0441\u043D\u0443\u044E \u043B\u0435\u043D\u0442\u0443 \u0438 \u043E\u0442\u0434\u0430\u0451\u0442 \u043C\u0435\u0448\u043E\u0447\u0435\u043A. \xAB\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u043F\u043E\u0435\u0437\u0434 \u0434\u043E \u041B\u0443\u0433\u043E\u0432\u043E\u0439 \u0435\u0449\u0451 \u043D\u0435 \u0443\u0448\u0451\u043B!\xBB \u041E\u0431\u043B\u0430\u0447\u043A\u043E \u043F\u0440\u044F\u0447\u0435\u0442 \u0441\u0435\u043C\u0435\u043D\u0430 \u043F\u043E\u0434 \u0448\u0430\u0440\u0444 \u0438 \u043C\u0447\u0438\u0442\u0441\u044F \u043D\u0430 \u0432\u043E\u043A\u0437\u0430\u043B."},{act:0,title:"\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u043F\u043E\u0435\u0437\u0434",themes:["depot"],len:1400,speed:16.5,reward:75,item:"lantern",items:5,q:[{t:"coins",n:90},{t:"items"}],intro:"\u041D\u0430\u0434 \u0433\u043E\u0440\u043E\u0434\u043E\u043C \u0437\u0430\u0436\u0438\u0433\u0430\u044E\u0442\u0441\u044F \u0444\u043E\u043D\u0430\u0440\u0438. \u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0441\u043E\u0441\u0442\u0430\u0432 \u0432\u043E\u0442-\u0432\u043E\u0442 \u0443\u0439\u0434\u0451\u0442 \u0432 \u0434\u043E\u043B\u0438\u043D\u0443, \u0430 \u043F\u0443\u0442\u044C \u043A \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 \u043B\u0435\u0436\u0438\u0442 \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0443\u0437\u043E\u0432\u043E\u0435 \u0434\u0435\u043F\u043E.",goal:"\u0411\u0435\u0433\u0438 \u043F\u043E \u043A\u0440\u044B\u0448\u0430\u043C \u0432\u0430\u0433\u043E\u043D\u043E\u0432 \u0438 \u0441\u043E\u0431\u0438\u0440\u0430\u0439 \u0444\u043E\u043D\u0430\u0440\u0438\u043A\u0438 \u043F\u0440\u043E\u0432\u043E\u0434\u043D\u0438\u043A\u0430 \u2014 \u043E\u043D\u0438 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u0434\u043E\u0440\u043E\u0433\u0443 \u043A \u043F\u043E\u0435\u0437\u0434\u0443.",lines:["\u041C\u0435\u0448\u043E\u0447\u0435\u043A \u043D\u0430 \u043C\u0435\u0441\u0442\u0435. \u0415\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E!","\u0421\u043B\u044B\u0448\u0438\u0448\u044C \u0433\u0443\u0434\u043E\u043A? \u041F\u043E\u0435\u0437\u0434 \u0443\u0436\u0435 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435!"],ending:"\u041E\u0431\u043B\u0430\u0447\u043A\u043E \u0443\u0441\u043F\u0435\u0432\u0430\u0435\u0442! \u041F\u043E\u0435\u0437\u0434 \u043F\u0440\u0438\u0432\u043E\u0437\u0438\u0442 \u0435\u0433\u043E \u043A \u0437\u043D\u0430\u043A\u043E\u043C\u043E\u043C\u0443 \u043B\u0443\u0433\u0443. \u041D\u0430 \u0444\u0435\u0440\u043C\u0435 \u0443\u0436\u0435 \u0437\u0430\u0436\u0433\u043B\u0438 \u0433\u0438\u0440\u043B\u044F\u043D\u0434\u044B, \u043D\u043E \u0431\u0435\u0437 \u0441\u0435\u043C\u044F\u043D \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u043A \u043D\u0435 \u043D\u0430\u0447\u043D\u0451\u0442\u0441\u044F."},{act:0,title:"\u0414\u043E\u043C\u043E\u0439, \u043A \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u043A\u0443",themes:["festival"],len:1200,speed:16,reward:100,item:"gift",items:5,q:[{t:"coins",n:90},{t:"nohit"}],intro:"\u0424\u0435\u0440\u043C\u0430 \u0441\u0432\u0435\u0442\u0438\u0442\u0441\u044F \u0433\u0438\u0440\u043B\u044F\u043D\u0434\u0430\u043C\u0438. \u0414\u0440\u0443\u0437\u044C\u044F \u0436\u0434\u0443\u0442 \u0443 \u0441\u0430\u0434\u0430, \u0430 \u043F\u043E \u0434\u043E\u0440\u043E\u0433\u0435 \u0440\u0430\u0441\u0441\u044B\u043F\u0430\u043B\u0438\u0441\u044C \u043F\u043E\u0434\u0430\u0440\u043A\u0438 \u0434\u043B\u044F \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u043A\u0430. \u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0440\u044B\u0432\u043E\u043A!",goal:"\u0421\u043E\u0431\u0435\u0440\u0438 \u043F\u043E\u0434\u0430\u0440\u043A\u0438 \u0438 \u0434\u043E\u043D\u0435\u0441\u0438 \u0441\u0435\u043C\u0435\u043D\u0430 \u043A \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u0447\u043D\u043E\u0439 \u043A\u043B\u0443\u043C\u0431\u0435.",lines:["\u0421\u043B\u044B\u0448\u043D\u0430 \u043C\u0443\u0437\u044B\u043A\u0430 \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u043A\u0430!","\u0414\u0440\u0443\u0437\u044C\u044F \u043C\u0430\u0448\u0443\u0442 \u0443 \u043A\u043B\u0443\u043C\u0431\u044B!"],ending:"\u0421\u0435\u043C\u0435\u043D\u0430 \u0441\u043F\u0430\u0441\u0435\u043D\u044B! \u0414\u0440\u0443\u0437\u044C\u044F \u0432\u043C\u0435\u0441\u0442\u0435 \u0432\u044B\u0441\u0430\u0436\u0438\u0432\u0430\u044E\u0442 \u0438\u0445 \u0432 \u0441\u0430\u0434\u0443 \u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0442 \u041F\u0440\u0430\u0437\u0434\u043D\u0438\u043A \u041B\u0443\u0433\u043E\u0432. \u0414\u0430\u0436\u0435 \u0441\u0430\u043C\u044B\u0439 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0439 \u0431\u0430\u0440\u0430\u0448\u0435\u043A \u0441\u043F\u043E\u0441\u043E\u0431\u0435\u043D \u043D\u0430 \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0434\u0435\u043B\u043E.",finale:!0},{act:1,title:"\u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u0438 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043D\u044B\u0439 \u0440\u044E\u043A\u0437\u0430\u0447\u043E\u043A",themes:["forest","coast"],len:1500,speed:15,reward:60,item:"backpack",items:1,hero:"pugovka",q:[{t:"coins",n:90},{t:"items"}],intro:"\u041F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0433\u0443\u043B\u043A\u0438 \u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u0437\u0430\u043C\u0435\u0442\u0438\u043B: \u0435\u0433\u043E \u0440\u044E\u043A\u0437\u0430\u0447\u043E\u043A \u043E\u0441\u0442\u0430\u043B\u0441\u044F \u0443 \u043C\u0430\u044F\u043A\u0430! \u041D\u0430 \u044D\u0442\u043E\u0442 \u0440\u0430\u0437 \u043C\u0430\u043B\u044B\u0448 \u0441\u0430\u043C \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0437\u0430 \u043F\u0440\u043E\u043F\u0430\u0436\u0435\u0439 \u2014 \u0447\u0435\u0440\u0435\u0437 \u0441\u043E\u0441\u043D\u043E\u0432\u044B\u0439 \u043B\u0435\u0441 \u043D\u0430 \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u0443\u044E.",goal:"\u0418\u0433\u0440\u0430\u0435\u0448\u044C \u0437\u0430 \u041F\u0443\u0433\u043E\u0432\u043A\u0443. \u041F\u0440\u043E\u0439\u0434\u0438 \u043B\u0435\u0441 \u0438 \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u0443\u044E \u0438 \u043F\u043E\u0434\u0431\u0435\u0440\u0438 \u0440\u044E\u043A\u0437\u0430\u0447\u043E\u043A \u0443 \u043C\u0430\u044F\u043A\u0430.",lines:["\u0411\u0440\u0451\u0432\u043D\u0430 \u2014 \u043F\u0440\u044B\u0436\u043A\u043E\u043C, \u0432\u0435\u0442\u043A\u0438 \u2014 \u043F\u043E\u0434\u043A\u0430\u0442\u043E\u043C!","\u041F\u0430\u0445\u043D\u0435\u0442 \u043C\u043E\u0440\u0435\u043C! \u041C\u0430\u044F\u043A \u0443\u0436\u0435 \u0431\u043B\u0438\u0437\u043A\u043E."],ending:"\u0420\u044E\u043A\u0437\u0430\u0447\u043E\u043A \u043D\u0430\u0448\u0451\u043B\u0441\u044F \u0443 \u043C\u0430\u044F\u043A\u0430 \u2014 \u0446\u0435\u043B\u044B\u0439 \u0438 \u043D\u0435\u0432\u0440\u0435\u0434\u0438\u043C\u044B\u0439. \u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u0433\u043E\u0440\u0434\u043E \u043D\u0435\u0441\u0451\u0442 \u0435\u0433\u043E \u0434\u043E\u043C\u043E\u0439: \u0441\u0430\u043C \u0441\u043F\u0440\u0430\u0432\u0438\u043B\u0441\u044F!"},{act:1,title:"\u041E\u0431\u043B\u0430\u0447\u043A\u043E \u0441\u043F\u0435\u0448\u0438\u0442 \u0432 \u0448\u043A\u043E\u043B\u0443",themes:["city"],len:1400,speed:17.5,reward:70,item:"letter",itemName:"\u043B\u0438\u0441\u0442\u043A\u0438 \u0434\u043E\u043C\u0430\u0448\u043D\u0435\u0433\u043E \u0437\u0430\u0434\u0430\u043D\u0438\u044F",items:5,hero:"oblachko",q:[{t:"coins",n:100},{t:"items"}],intro:"\u041E\u0431\u043B\u0430\u0447\u043A\u043E \u0437\u0430\u0438\u0433\u0440\u0430\u043B\u0441\u044F \u0438 \u0432\u0441\u043F\u043E\u043C\u043D\u0438\u043B \u043F\u0440\u043E \u0443\u0440\u043E\u043A \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u043F\u043E\u0437\u0434\u043D\u043E! \u0412\u0435\u0442\u0435\u0440 \u0432\u044B\u0445\u0432\u0430\u0442\u0438\u043B \u0438\u0437 \u0440\u044E\u043A\u0437\u0430\u043A\u0430 \u043B\u0438\u0441\u0442\u043A\u0438 \u0441 \u0434\u043E\u043C\u0430\u0448\u043D\u0438\u043C \u0437\u0430\u0434\u0430\u043D\u0438\u0435\u043C. \u0422\u043E\u043B\u044C\u043A\u043E \u0431\u044B \u0410\u043F\u043F\u043E\u043B\u0438\u043D\u0430\u0440\u0438\u044F \u0410\u043B\u0435\u043A\u0441\u0430\u043D\u0434\u0440\u043E\u0432\u043D\u0430 \u043D\u0435 \u0440\u0443\u0433\u0430\u043B\u0430 \u0437\u0430 \u043E\u043F\u043E\u0437\u0434\u0430\u043D\u0438\u0435!",goal:"\u0411\u0435\u0433\u0438 \u0447\u0435\u0440\u0435\u0437 \u0433\u043E\u0440\u043E\u0434 \u0438 \u0441\u043E\u0431\u0435\u0440\u0438 5 \u043B\u0438\u0441\u0442\u043A\u043E\u0432 \u0434\u043E\u043C\u0430\u0448\u043D\u0435\u0433\u043E \u0437\u0430\u0434\u0430\u043D\u0438\u044F.",lines:["\u0417\u0432\u043E\u043D\u043E\u043A \u0447\u0435\u0440\u0435\u0437 \u043F\u044F\u0442\u044C \u043C\u0438\u043D\u0443\u0442!","\u0428\u043A\u043E\u043B\u044C\u043D\u043E\u0435 \u043A\u0440\u044B\u043B\u044C\u0446\u043E \u0443\u0436\u0435 \u0432\u0438\u0434\u043D\u043E!"],ending:"\u041E\u0431\u043B\u0430\u0447\u043A\u043E \u0432\u043B\u0435\u0442\u0430\u0435\u0442 \u0432 \u043A\u043B\u0430\u0441\u0441 \u0441\u043E \u0437\u0432\u043E\u043D\u043A\u043E\u043C \u0438 \u043A\u043B\u0430\u0434\u0451\u0442 \u043D\u0430 \u043F\u0430\u0440\u0442\u0443 \u0432\u0441\u0435 \u043B\u0438\u0441\u0442\u043A\u0438. \u0410\u043F\u043F\u043E\u043B\u0438\u043D\u0430\u0440\u0438\u044F \u0410\u043B\u0435\u043A\u0441\u0430\u043D\u0434\u0440\u043E\u0432\u043D\u0430 \u0443\u043B\u044B\u0431\u0430\u0435\u0442\u0441\u044F: \xAB\u0423\u0441\u043F\u0435\u043B!\xBB"},{act:1,title:"\u041F\u0443\u0433\u043E\u0432\u043A\u0430, \u0432\u0435\u0440\u043D\u0438 \u0441\u043A\u0432\u0438\u0448!",themes:["sakura"],len:1200,speed:16,reward:70,item:"star",items:5,chase:"pugovka",q:[{t:"coins",n:80},{t:"items"}],intro:"\u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u0441\u0445\u0432\u0430\u0442\u0438\u043B \u043B\u044E\u0431\u0438\u043C\u044B\u0439 \u0441\u043A\u0432\u0438\u0448 \u041E\u0431\u043B\u0430\u0447\u043A\u0430 \u0438 \u0443\u043C\u0447\u0430\u043B\u0441\u044F \u0432 \u0441\u0430\u0434 \u0441\u0430\u043A\u0443\u0440\u044B! \u0414\u043E\u0433\u043E\u043D\u0438 \u043C\u0430\u043B\u044B\u0448\u0430 \u2014 \u043F\u043E \u0434\u043E\u0440\u043E\u0433\u0435 \u043E\u043D \u0440\u043E\u043D\u044F\u0435\u0442 \u0437\u0432\u0451\u0437\u0434\u043E\u0447\u043A\u0438-\u043D\u0430\u043A\u043B\u0435\u0439\u043A\u0438.",goal:"\u0414\u043E\u0433\u043E\u043D\u0438 \u041F\u0443\u0433\u043E\u0432\u043A\u0443 \u0434\u043E \u043A\u043E\u043D\u0446\u0430 \u0441\u0430\u0434\u0430. \u041F\u043E\u0434 \u0444\u043E\u043D\u0430\u0440\u043D\u044B\u043C\u0438 \u0430\u0440\u043A\u0430\u043C\u0438 \u2014 \u043F\u043E\u0434\u043A\u0430\u0442.",lines:["\u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u0441\u043C\u0435\u0451\u0442\u0441\u044F \u0432\u043F\u0435\u0440\u0435\u0434\u0438!","\u041F\u043E\u0447\u0442\u0438 \u0434\u043E\u0433\u043D\u0430\u043B!"],ending:"\u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u0441\u0434\u0430\u0451\u0442\u0441\u044F \u0438 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0441\u043A\u0432\u0438\u0448. \u0411\u0440\u0430\u0442\u044C\u044F \u0432\u043C\u0435\u0441\u0442\u0435 \u0441\u043C\u0435\u044E\u0442\u0441\u044F \u043F\u043E\u0434 \u0440\u043E\u0437\u043E\u0432\u044B\u043C\u0438 \u043B\u0435\u043F\u0435\u0441\u0442\u043A\u0430\u043C\u0438."},{act:2,title:"\u041F\u043E\u0434\u0430\u0440\u043E\u043A \u0434\u043B\u044F \u041F\u0443\u0433\u043E\u0432\u043A\u0438",themes:["snow"],len:1400,speed:16,reward:90,item:"gift",items:5,hero:"oblachko",q:[{t:"coins",n:100},{t:"nohit"}],intro:"\u041F\u0440\u0438\u0448\u043B\u0430 \u0437\u0438\u043C\u0430. \u041E\u0431\u043B\u0430\u0447\u043A\u043E \u0441\u043E\u0431\u0438\u0440\u0430\u0435\u0442 \u043F\u043E\u0434\u0430\u0440\u043E\u043A \u0434\u043B\u044F \u043C\u043B\u0430\u0434\u0448\u0435\u0433\u043E \u0431\u0440\u0430\u0442\u0430: \u0434\u0435\u0442\u0430\u043B\u0438 \u0441\u043F\u0440\u044F\u0442\u0430\u043D\u044B \u043F\u043E \u0432\u0441\u0435\u0439 \u0441\u043D\u0435\u0436\u043D\u043E\u0439 \u0434\u0435\u0440\u0435\u0432\u043D\u0435.",goal:"\u041F\u0435\u0440\u0435\u043F\u0440\u044B\u0433\u0438\u0432\u0430\u0439 \u0441\u0443\u0433\u0440\u043E\u0431\u044B, \u0441\u043A\u043E\u043B\u044C\u0437\u0438 \u043F\u043E\u0434 \u043B\u0435\u0434\u044F\u043D\u044B\u043C\u0438 \u0430\u0440\u043A\u0430\u043C\u0438 \u0438 \u0441\u043E\u0431\u0435\u0440\u0438 5 \u0447\u0430\u0441\u0442\u0435\u0439 \u043F\u043E\u0434\u0430\u0440\u043A\u0430.",lines:["\u0421\u043D\u0435\u0436\u0438\u043D\u043A\u0438 \u0442\u0430\u043D\u0446\u0443\u044E\u0442 \u0432\u043E\u043A\u0440\u0443\u0433!","\u0414\u043E\u043C \u0443\u0436\u0435 \u0441\u0432\u0435\u0442\u0438\u0442\u0441\u044F \u043E\u043A\u043E\u0448\u043A\u0430\u043C\u0438!"],ending:"\u041F\u043E\u0434\u0430\u0440\u043E\u043A \u0441\u043E\u0431\u0440\u0430\u043D \u0438 \u0443\u043F\u0430\u043A\u043E\u0432\u0430\u043D. \u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0443\u0441\u043D\u0443\u0442\u044C \u043E\u0442 \u0441\u0447\u0430\u0441\u0442\u044C\u044F \u2014 \u0430 \u043D\u043E\u0447\u044C\u044E \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0434\u0440\u0443\u0433\u0430\u044F \u0441\u043A\u0430\u0437\u043A\u0430."},{act:2,title:"\u0411\u0435\u043B\u043B\u0430 \u2014 \u043B\u0443\u043D\u043D\u0430\u044F \u0444\u0435\u044F",themes:["night"],len:1300,speed:15.5,reward:90,item:"moon",items:5,hero:"bella",q:[{t:"coins",n:90},{t:"items"}],intro:"\u041A\u043E\u0433\u0434\u0430 \u0432\u0441\u0435 \u0441\u043F\u044F\u0442, \u0411\u0435\u043B\u043B\u0430 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043B\u0443\u043D\u043D\u043E\u0439 \u0444\u0435\u0435\u0439. \u0415\u0439 \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u043B\u0443\u043D\u043D\u044B\u0435 \u0438\u0441\u043A\u0440\u044B, \u0447\u0442\u043E\u0431\u044B \u043A\u0430\u0436\u0434\u043E\u043C\u0443 \u043D\u0430 \u0444\u0435\u0440\u043C\u0435 \u043F\u0440\u0438\u0441\u043D\u0438\u043B\u0441\u044F \u0434\u043E\u0431\u0440\u044B\u0439 \u0441\u043E\u043D.",goal:"\u0418\u0433\u0440\u0430\u0435\u0448\u044C \u0437\u0430 \u0411\u0435\u043B\u043B\u0443. \u0421\u043E\u0431\u0435\u0440\u0438 5 \u043B\u0443\u043D\u043D\u044B\u0445 \u0438\u0441\u043A\u0440 \u043D\u0430 \u043D\u043E\u0447\u043D\u043E\u0439 \u0444\u0435\u0440\u043C\u0435.",lines:["\u0421\u0432\u0435\u0442\u043B\u044F\u0447\u043A\u0438 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u0434\u043E\u0440\u043E\u0433\u0443.","\u041B\u0443\u043D\u0430 \u0443\u0436\u0435 \u0432\u044B\u0441\u043E\u043A\u043E!"],ending:"\u0411\u0435\u043B\u043B\u0430 \u0440\u0430\u0441\u0441\u044B\u043F\u0430\u0435\u0442 \u043B\u0443\u043D\u043D\u044B\u0435 \u0438\u0441\u043A\u0440\u044B \u043D\u0430\u0434 \u043A\u0440\u044B\u0448\u0430\u043C\u0438. \u042D\u0442\u043E\u0439 \u043D\u043E\u0447\u044C\u044E \u0432\u0441\u0435\u043C \u0441\u043D\u044F\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0445\u043E\u0440\u043E\u0448\u0438\u0435 \u0441\u043D\u044B."},{act:3,title:"\u0425\u044D\u043B\u043B\u043E\u0443\u0438\u043D \xB7 \u0444\u043E\u043D\u0430\u0440\u044C \u0434\u043E\u0431\u0440\u044B\u0445 \u0442\u0435\u043D\u0435\u0439",themes:["halloween"],len:1500,speed:16.5,reward:120,item:"lantern",items:5,hero:"bella",q:[{t:"coins",n:110},{t:"items"}],intro:"\u0411\u0435\u043B\u043B\u0430 \u043D\u0435\u0441\u0451\u0442 \u0444\u043E\u043D\u0430\u0440\u044C \u043A \u0441\u0442\u0430\u0440\u043E\u043C\u0443 \u0434\u043E\u043C\u0438\u043A\u0443. \u0417\u0434\u0435\u0441\u044C \u0436\u0438\u0432\u0443\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043E\u0431\u0440\u044B\u0435 \u043F\u0440\u0438\u0432\u0438\u0434\u0435\u043D\u0438\u044F: \u043E\u043D\u0438 \u043F\u0440\u0438\u0433\u043E\u0442\u043E\u0432\u0438\u043B\u0438 \u043A\u043E\u043D\u0444\u0435\u0442\u044B, \u0442\u044B\u043A\u0432\u044B \u0438 \u0441\u043C\u0435\u0448\u043D\u044B\u0445 \u043B\u0435\u0442\u0443\u0447\u0438\u0445 \u043C\u044B\u0448\u0435\u0439.",goal:"\u041F\u0435\u0440\u0435\u043F\u0440\u044B\u0433\u0438\u0432\u0430\u0439 \u0442\u044B\u043A\u0432\u044B, \u0441\u043A\u043E\u043B\u044C\u0437\u0438 \u043F\u043E\u0434 \u043F\u0430\u0443\u0442\u0438\u043D\u043A\u0430\u043C\u0438 \u0438 \u0441\u043E\u0431\u0435\u0440\u0438 5 \u0444\u043E\u043D\u0430\u0440\u0438\u043A\u043E\u0432.",lines:["\u0411\u0435\u043B\u043B\u0430: \xAB\u042D\u0442\u0438 \u043F\u0440\u0438\u0432\u0438\u0434\u0435\u043D\u0438\u044F \u0441\u043E\u0432\u0441\u0435\u043C \u043D\u0435 \u0441\u0442\u0440\u0430\u0448\u043D\u044B\u0435!\xBB","\u0414\u043E \u0434\u043E\u043C\u0438\u043A\u0430 \u0441 \u043A\u043E\u043D\u0444\u0435\u0442\u0430\u043C\u0438 \u2014 \u0440\u0443\u043A\u043E\u0439 \u043F\u043E\u0434\u0430\u0442\u044C!"],ending:"\u0422\u0435\u043D\u0438 \u043E\u043A\u0430\u0437\u0430\u043B\u0438\u0441\u044C \u0434\u043E\u0431\u0440\u044B\u043C\u0438! \u0411\u0435\u043B\u043B\u0430 \u0437\u0430\u0436\u0433\u043B\u0430 \u0444\u043E\u043D\u0430\u0440\u044C, \u043F\u0440\u0438\u0432\u0438\u0434\u0435\u043D\u0438\u044F \u0443\u0433\u043E\u0441\u0442\u0438\u043B\u0438 \u0434\u0440\u0443\u0437\u0435\u0439 \u043A\u043E\u043D\u0444\u0435\u0442\u0430\u043C\u0438. \u0410 \u0441\u043A\u043E\u0440\u043E \u0434\u043E\u043B\u0438\u043D\u0443 \u0443\u043A\u0440\u043E\u0435\u0442 \u0441\u043D\u0435\u0433."},{act:3,title:"\u041D\u043E\u0432\u044B\u0439 \u0433\u043E\u0434 \xB7 \u0437\u0432\u0435\u0437\u0434\u0430 \u0434\u043B\u044F \u0451\u043B\u043A\u0438",themes:["newyear"],len:1600,speed:17,reward:150,item:"star",items:5,hero:"oblachko",q:[{t:"coins",n:120},{t:"nohit"}],intro:"\u041E\u0431\u043B\u0430\u0447\u043A\u043E \u043D\u0435\u0441\u0451\u0442 \u0437\u0432\u0435\u0437\u0434\u0443 \u0434\u043B\u044F \u0441\u0430\u043C\u043E\u0439 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0451\u043B\u043A\u0438. \u041F\u043B\u043E\u0449\u0430\u0434\u044C \u0441\u0438\u044F\u0435\u0442 \u0433\u0438\u0440\u043B\u044F\u043D\u0434\u0430\u043C\u0438, \u0430 \u0434\u043E \u043F\u043E\u043B\u0443\u043D\u043E\u0447\u0438 \u0441\u043E\u0432\u0441\u0435\u043C \u043D\u0435\u043C\u043D\u043E\u0433\u043E.",goal:"\u041E\u0431\u0445\u043E\u0434\u0438 \u043F\u043E\u0434\u0430\u0440\u043A\u0438, \u043F\u0435\u0440\u0435\u043F\u0440\u044B\u0433\u0438\u0432\u0430\u0439 \u0441\u0443\u0433\u0440\u043E\u0431\u044B \u0438 \u0441\u043E\u0431\u0435\u0440\u0438 5 \u0437\u0432\u0451\u0437\u0434\u043E\u0447\u0435\u043A.",lines:["\u0417\u0432\u0435\u0437\u0434\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u0436\u0435\u0447\u044C\u0441\u044F \u0434\u043E \u043F\u043E\u043B\u0443\u043D\u043E\u0447\u0438!","\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u0443\u0436\u0435 \u0431\u043B\u0438\u0437\u043A\u043E!"],ending:"\u0417\u0432\u0435\u0437\u0434\u0430 \u0437\u0430\u0441\u0438\u044F\u043B\u0430 \u043D\u0430 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0451\u043B\u043A\u0435. \u041E\u0431\u043B\u0430\u0447\u043A\u043E, \u041F\u0443\u0433\u043E\u0432\u043A\u0430 \u0438 \u0411\u0435\u043B\u043B\u0430 \u0441\u043D\u043E\u0432\u0430 \u0432\u043C\u0435\u0441\u0442\u0435 \u2014 \u0432\u043F\u0435\u0440\u0435\u0434\u0438 \u0446\u0435\u043B\u044B\u0439 \u0433\u043E\u0434 \u043D\u043E\u0432\u044B\u0445 \u0431\u043E\u043B\u044C\u0448\u0438\u0445 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0445 \u0434\u0435\u043B.",finale:!0}],$p=["farm","city","forest","coast","snow","sakura","depot","festival","halloween","market"],Gu=[{id:"magnet",name:"\u041C\u0430\u0433\u043D\u0438\u0442",icon:"\u{1F9F2}",base:7,step:1.5,desc:"\u041F\u0440\u0438\u0442\u044F\u0433\u0438\u0432\u0430\u0435\u0442 \u043C\u043E\u043D\u0435\u0442\u044B"},{id:"shield",name:"\u0429\u0438\u0442",icon:"\u{1F6E1}\uFE0F",base:9,step:2,desc:"\u0417\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u043E\u0442 \u043E\u0434\u043D\u043E\u0433\u043E \u0443\u0434\u0430\u0440\u0430"},{id:"x2",name:"\u0414\u0432\u043E\u0439\u043D\u044B\u0435 \u043C\u043E\u043D\u0435\u0442\u044B",icon:"\xD72",base:9,step:2,desc:"\u041A\u0430\u0436\u0434\u0430\u044F \u043C\u043E\u043D\u0435\u0442\u0430 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0434\u0432\u0430\u0436\u0434\u044B"},{id:"boots",name:"\u041F\u0440\u044B\u0433\u0443\u0447\u0438\u0435 \u043A\u043E\u043F\u044B\u0442\u0446\u0430",icon:"\u{1F45F}",base:8,step:1.5,desc:"\u0412\u044B\u0441\u043E\u043A\u0438\u0435 \u043F\u0440\u044B\u0436\u043A\u0438"}],jo=[150,300,550,900,1400],Vu=[{id:"startShield",name:"\u0429\u0438\u0442 \u043D\u0430 \u0441\u0442\u0430\u0440\u0442\u0435",icon:"\u{1F6E1}\uFE0F",price:120,desc:"\u0417\u0430\u0431\u0435\u0433 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0441\u043E \u0449\u0438\u0442\u043E\u043C"},{id:"startMagnet",name:"\u041C\u0430\u0433\u043D\u0438\u0442 \u043D\u0430 \u0441\u0442\u0430\u0440\u0442\u0435",icon:"\u{1F9F2}",price:100,desc:"\u041F\u0435\u0440\u0432\u044B\u0435 \u0441\u0435\u043A\u0443\u043D\u0434\u044B \u043C\u043E\u043D\u0435\u0442\u044B \u043B\u0435\u0442\u044F\u0442 \u043A \u0442\u0435\u0431\u0435"},{id:"extraLife",name:"\u0417\u0430\u043F\u0430\u0441\u043D\u043E\u0435 \u0441\u0435\u0440\u0434\u0435\u0447\u043A\u043E",icon:"\u2764\uFE0F",price:200,desc:"+1 \u0436\u0438\u0437\u043D\u044C \u043D\u0430 \u043E\u0434\u0438\u043D \u0437\u0430\u0431\u0435\u0433"}],fc={easy:{name:"\u041B\u0451\u0433\u043A\u0438\u0439",lives:5,speed:.88,density:.8,desc:"5 \u0436\u0438\u0437\u043D\u0435\u0439 \u0438 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439 \u0442\u0435\u043C\u043F"},normal:{name:"\u0421\u0440\u0435\u0434\u043D\u0438\u0439",lives:3,speed:1,density:1,desc:"3 \u0436\u0438\u0437\u043D\u0438, \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u0442\u0435\u043C\u043F"},hard:{name:"\u0421\u043B\u043E\u0436\u043D\u044B\u0439",lives:2,speed:1.14,density:1.18,desc:"2 \u0436\u0438\u0437\u043D\u0438, \u0431\u044B\u0441\u0442\u0440\u043E \u0438 \u043F\u043B\u043E\u0442\u043D\u043E"}};var Wu={menu:.9,farm:.9,city:1.1,market:1.25,depot:.95,forest:1.2,coast:.88,snow:.9,sakura:.88,halloween:1.3,festival:1},pc=class{constructor(e,t){this.s=e,this.urlFor=t,this.ctx=null,this.buffers={},this.loading={},this.music=null,this.musicName=null,this.wantMusic=null,this.lastPlay={}}unlock(){if(!this.ctx){let e=window.AudioContext||window.webkitAudioContext;if(!e)return;this.ctx=new e,this.master=this.ctx.createDynamicsCompressor(),this.master.threshold.value=-14,this.master.ratio.value=3,this.master.connect(this.ctx.destination),this.musicBus=this.ctx.createGain(),this.sfxBus=this.ctx.createGain(),this.musicBus.connect(this.master),this.sfxBus.connect(this.master),this.applyVolumes();for(let t of["coin","jump","land","slide","swipe","hit","power","click","item","heart","shieldbreak","star","bleat","victory","fail","beep","go","horn","trainhorn","step","magnet"])this.load("sfx_"+t)}this.ctx.state!=="running"&&this.ctx.resume().catch(()=>{}),this.wantMusic&&this.musicName!==this.wantMusic&&this.playMusic(this.wantMusic)}applyVolumes(){if(!this.ctx)return;let e=this.ctx.currentTime;this.musicBus.gain.setTargetAtTime(this.s.muted?0:this.s.music*.75,e,.05),this.sfxBus.gain.setTargetAtTime(this.s.muted?0:this.s.sfx,e,.05)}load(e){return this.buffers[e]?Promise.resolve(this.buffers[e]):this.loading[e]?this.loading[e]:(this.loading[e]=fetch(this.urlFor("audio/"+e+".ogg")).then(t=>t.arrayBuffer()).then(t=>new Promise((n,s)=>this.ctx.decodeAudioData(t,n,s))).then(t=>this.buffers[e]=t).catch(t=>(console.warn("audio",e,t),null)),this.loading[e])}play(e,{vol:t=1,rate:n=1,pan:s=0,throttle:r=.03}={}){if(!this.ctx||this.s.muted)return;let o=this.buffers["sfx_"+e];if(!o){this.load("sfx_"+e);return}let a=this.ctx.currentTime;if(a-(this.lastPlay[e]||-1)<r)return;this.lastPlay[e]=a;let l=this.ctx.createBufferSource();l.buffer=o,l.playbackRate.value=n;let c=this.ctx.createGain();if(c.gain.value=t,l.connect(c),this.ctx.createStereoPanner&&s){let h=this.ctx.createStereoPanner();h.pan.value=Math.max(-1,Math.min(1,s)),c.connect(h),h.connect(this.sfxBus)}else c.connect(this.sfxBus);l.start()}async playMusic(e){if(this.wantMusic=e,!this.ctx||this.musicName===e&&this.music)return;this.musicName=e;let t=await this.load("music_"+e);if(!t||this.wantMusic!==e)return;let n=this.ctx.currentTime;if(this.music){let o=this.music;o.g.gain.setTargetAtTime(0,n,.35),setTimeout(()=>{try{o.src.stop()}catch{}},1800)}let s=this.ctx.createBufferSource();s.buffer=t,s.loop=!0;let r=this.ctx.createGain();r.gain.value=0,r.gain.setTargetAtTime(Wu[e]||1,n,.4),s.connect(r),r.connect(this.musicBus),s.start(),this.music={src:s,g:r}}duck(e){!this.music||!this.ctx||this.music.g.gain.setTargetAtTime(e?.25*(Wu[this.musicName]||1):Wu[this.musicName]||1,this.ctx.currentTime,.2)}suspend(){this.ctx&&this.ctx.state==="running"&&this.ctx.suspend()}resume(){this.ctx&&this.ctx.state!=="running"&&this.ctx.resume().catch(()=>{})}};function Xu(i){let e=i>>>0;return()=>(e=e*1664525+1013904223>>>0)/4294967296}function zs(i,e=i){let t=document.createElement("canvas");return t.width=i,t.height=e,[t,t.getContext("2d")]}function bt(i,e,t,n,s,r,o,a=1){i.globalAlpha=a;for(let l=0;l<s;l++){i.fillStyle=n[o()*n.length|0];let c=o()*e,h=o()*t,u=r[0]+o()*(r[1]-r[0]);i.beginPath(),i.ellipse(c,h,u,u*(.6+o()*.6),o()*3,0,7),i.fill()}i.globalAlpha=1}function mc(i,e,t,n,s,r){for(let o=0;o<s;o++){i.strokeStyle=n[r()*n.length|0],i.lineWidth=1+r()*1.5;let a=r()*e,l=r()*t,c=4+r()*8;i.beginPath(),i.moveTo(a,l),i.lineTo(a+(r()-.5)*4,l-c),i.stroke()}}var jp={grass:(i,e,t)=>{i.fillStyle="#7fae5a",i.fillRect(0,0,e,e),bt(i,e,e,["#8dbb63","#73a052","#97c46b","#6b9a4c"],900,[6,22],t,.5),mc(i,e,e,["#a5cf78","#5f8e44","#8fbf60"],2600,t),bt(i,e,e,["#f5f0c8","#f2b8c8","#fff"],40,[1.5,3],t)},grass_light:(i,e,t)=>{i.fillStyle="#9cba7e",i.fillRect(0,0,e,e),bt(i,e,e,["#a9c68a","#8fae70","#b3cf95"],900,[6,20],t,.5),mc(i,e,e,["#b8d49a","#86a568"],2200,t),bt(i,e,e,["#f6c3d4","#fbe1ea"],120,[2,4],t)},grass_dark:(i,e,t)=>{i.fillStyle="#3e5442",i.fillRect(0,0,e,e),bt(i,e,e,["#465d49","#36493a","#4f6a50"],900,[6,20],t,.6),mc(i,e,e,["#557256","#2f4031"],2200,t)},forest:(i,e,t)=>{i.fillStyle="#6d8a55",i.fillRect(0,0,e,e),bt(i,e,e,["#7a965f","#5f7a4a","#8a7a55","#9a8460"],1200,[5,18],t,.55),mc(i,e,e,["#87a46a","#55703f"],1800,t),bt(i,e,e,["#a5764a","#c28f5a"],120,[2,5],t)},pavement:(i,e,t)=>{i.fillStyle="#c9c6bc",i.fillRect(0,0,e,e),i.strokeStyle="#ada99e",i.lineWidth=3;for(let n=0;n<=e;n+=e/4)i.beginPath(),i.moveTo(n,0),i.lineTo(n,e),i.stroke(),i.beginPath(),i.moveTo(0,n),i.lineTo(e,n),i.stroke();bt(i,e,e,["#d6d3ca","#bbb7ac"],1500,[1,4],t,.5)},sand:(i,e,t)=>{i.fillStyle="#e8d3a2",i.fillRect(0,0,e,e),bt(i,e,e,["#f0dfb4","#dcc48f","#efe2c0","#d4b985"],4e3,[1,4],t,.6),bt(i,e,e,["#ffffff","#f6c7b8"],30,[2,4],t)},snow:(i,e,t)=>{i.fillStyle="#eef4f8",i.fillRect(0,0,e,e),bt(i,e,e,["#ffffff","#dfe9f0","#e7eff5"],1400,[6,26],t,.5),bt(i,e,e,["#cfe0ec"],300,[1,2],t)},tiles:(i,e,t)=>{i.fillStyle="#e8e6dc",i.fillRect(0,0,e,e);let n=4,s=e/n;for(let r=0;r<n;r++)for(let o=0;o<n;o++)i.fillStyle=(r+o)%2?"#e6e3d6":"#dcdccd",i.fillRect(r*s+2,o*s+2,s-4,s-4);bt(i,e,e,["#fff"],200,[2,8],t,.15)}},Qp={gravel:(i,e,t,n)=>{i.fillStyle="#b8ab92",i.fillRect(0,0,e,t),bt(i,e,t,["#c9bda5","#a3967e","#d6ccb6","#968a73","#e0d8c6"],7e3,[1.5,4],n,.85)},gravel_dark:(i,e,t,n)=>{i.fillStyle="#5e5a62",i.fillRect(0,0,e,t),bt(i,e,t,["#6d6870","#514d55","#7a7480","#47434a"],7e3,[1.5,4],n,.85)},dirt:(i,e,t,n)=>{i.fillStyle="#c4a67a",i.fillRect(0,0,e,t),bt(i,e,t,["#cfb38a","#b5966b","#d9c19c","#a88a60"],2500,[2,9],n,.6),bt(i,e,t,["#8e7556"],400,[1,3],n)},dirt_dark:(i,e,t,n)=>{i.fillStyle="#6b5a5e",i.fillRect(0,0,e,t),bt(i,e,t,["#776569","#5d4d51","#857176"],2500,[2,9],n,.6)},asphalt:(i,e,t,n)=>{i.fillStyle="#6a7074",i.fillRect(0,0,e,t),bt(i,e,t,["#757b7f","#5f6569","#80868a"],6e3,[1,3],n,.6),i.fillStyle="#f2ead2";for(let s of[1/3,2/3])for(let r=0;r<t;r+=t/2)i.fillRect(s*e-4,r+t*.1,8,t*.28);i.fillStyle="#e9e2cb",i.fillRect(6,0,7,t),i.fillRect(e-13,0,7,t)},planks:(i,e,t,n)=>{let r=t/8;for(let o=0;o<8;o++){i.fillStyle=["#b98d5e","#a87d50","#c49a6a","#b08455"][o%4],i.fillRect(0,o*r,e,r),i.fillStyle="#7a5a3d",i.fillRect(0,o*r,e,3);for(let a=0;a<6;a++)i.globalAlpha=.15,i.fillRect(0,o*r+6+n()*(r-10),e,1),i.globalAlpha=1;i.fillStyle="#6b4c33",i.beginPath(),i.arc(n()*e,o*r+r/2,2.5,0,7),i.fill()}},snowpath:(i,e,t,n)=>{i.fillStyle="#d8e4ec",i.fillRect(0,0,e,t),bt(i,e,t,["#e6eef3","#c9d7e1","#f3f7fa"],2500,[2,10],n,.6),i.globalAlpha=.2,i.fillStyle="#b9c9d6";for(let s of[.17,.5,.83])for(let r=0;r<t;r+=24)i.fillRect(s*e-10+(r%48?6:-6),r,8,12);i.globalAlpha=1},stones:(i,e,t,n)=>{i.fillStyle="#a49c90",i.fillRect(0,0,e,t);for(let s=0;s<260;s++){i.fillStyle=["#d8d0c3","#cbc2b4","#e2dbcf","#bfb6a8"][s%4];let r=n()*e,o=n()*t,a=12+n()*16;i.beginPath(),i.ellipse(r,o,a,a*.8,n()*3,0,7),i.fill()}bt(i,e,t,["#f6c3d4"],60,[2,4],n)},tiles:(i,e,t,n)=>{i.fillStyle="#efeee6",i.fillRect(0,0,e,t);let s=e/6;for(let r=0;r<6;r++)for(let o=0;o<t/s;o++)i.fillStyle=(r+o)%2?"#f2f1ea":"#e5e3d8",i.fillRect(r*s+1,o*s+1,s-2,s-2);i.fillStyle="#7da38f",i.fillRect(0,0,10,t),i.fillRect(e-10,0,10,t)}},Gt={};function em(i,e){let t="g_"+i;if(Gt[t])return Gt[t];let[n,s]=zs(512);(jp[i]||jp.grass)(s,512,Xu(i.length*997));let r=new Xn(n);return r.wrapS=r.wrapT=Ln,r.colorSpace=ot,r.anisotropy=e.capabilities.getMaxAnisotropy(),Gt[t]=r}function tm(i,e){let t="p_"+i;if(Gt[t])return Gt[t];let[n,s]=zs(512,512);(Qp[i]||Qp.gravel)(s,512,512,Xu(i.length*331));let r=new Xn(n);return r.wrapS=r.wrapT=Ln,r.colorSpace=ot,r.anisotropy=e.capabilities.getMaxAnisotropy(),Gt[t]=r}function nm(){if(Gt.sea)return Gt.sea;let[i,e]=zs(256),t=e.createLinearGradient(0,0,0,256);t.addColorStop(0,"#4fa9c8"),t.addColorStop(1,"#3f95b8"),e.fillStyle=t,e.fillRect(0,0,256,256);let n=Xu(5);e.strokeStyle="#bfe9f2";for(let r=0;r<60;r++){e.globalAlpha=.25+n()*.35,e.lineWidth=1.5;let o=n()*256,a=n()*256;e.beginPath(),e.arc(o,a,8+n()*10,Math.PI*1.15,Math.PI*1.85),e.stroke()}e.globalAlpha=1;let s=new Xn(i);return s.wrapS=s.wrapT=Ln,s.colorSpace=ot,Gt.sea=s}function im(i="#fff3b0"){let e="glow"+i;if(Gt[e])return Gt[e];let[t,n]=zs(128),s=n.createRadialGradient(64,64,0,64,64,64);s.addColorStop(0,i),s.addColorStop(.25,i+"cc"),s.addColorStop(1,i+"00"),n.fillStyle=s,n.fillRect(0,0,128,128);let r=new Xn(t);return r.colorSpace=ot,Gt[e]=r}function qu(){if(Gt.dot)return Gt.dot;let[i,e]=zs(64),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.5,"rgba(255,255,255,.7)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);let n=new Xn(i);return Gt.dot=n}function sm(){if(Gt.petal)return Gt.petal;let[i,e]=zs(64);e.fillStyle="#f7b6cc",e.beginPath(),e.ellipse(32,32,26,14,.5,0,7),e.fill(),e.fillStyle="#fbd3e1",e.beginPath(),e.ellipse(28,29,14,6,.5,0,7),e.fill();let t=new Xn(i);return t.colorSpace=ot,Gt.petal=t}function rm(i,e="",t="#2f8f8a",n="#fffaf0"){let[s,r]=zs(1024,160);r.fillStyle=t,r.fillRect(0,0,1024,160);for(let a=0;a<1024;a+=40)r.fillStyle=a/40%2?"#ffffff22":"#00000012",r.fillRect(a,0,20,14),r.fillRect(a+20,146,20,14);r.fillStyle=n,r.textAlign="center",r.textBaseline="middle",r.font="800 72px system-ui, -apple-system, Segoe UI, Roboto, sans-serif",r.fillText(i,512,e?66:82),e&&(r.font="600 30px system-ui, sans-serif",r.globalAlpha=.85,r.fillText(e,512,122));let o=new Xn(s);return o.colorSpace=ot,o.anisotropy=4,o}function om(i,e){return new Dn({side:Nt,depthWrite:!1,fog:!1,uniforms:{top:{value:new Ae(i)},bottom:{value:new Ae(e)}},vertexShader:"varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.4+0.15,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, pow(h,0.8)),1.0);
#include <colorspace_fragment>
}`})}ns();ns();var ta=ts("App",{web:()=>Promise.resolve().then(()=>(hm(),cm)).then(i=>new i.AppWeb)});ns();Ju();var fm=ts("Haptics",{web:()=>Promise.resolve().then(()=>(dm(),um)).then(i=>new i.HapticsWeb)});ns();var Qu=ts("ScreenOrientation",{web:()=>Promise.resolve().then(()=>(mm(),pm)).then(i=>new i.ScreenOrientationWeb)});var Ac=ea.isNativePlatform(),te=i=>document.getElementById(i),rn=(i,e,t)=>Math.max(e,Math.min(t,i)),hd=(i,e,t)=>i+(e-i)*t,Fe=(i=0,e=1)=>i+Math.random()*(e-i),os=i=>i[Math.random()*i.length|0],Vs=i=>{let e=0;for(let n of i)e+=n[1];let t=Math.random()*e;for(let[n,s]of i)if((t-=s)<=0)return n;return i[0][0]},xt=(i,e,t,n)=>hd(i,e,1-Math.exp(-t*n)),Em="oblachko_runner_v1";function nd(){return{v:1,device:null,coins:0,stars:sn.map(()=>0),done:sn.map(()=>!1),unlocked:1,best:0,hero:"oblachko",owned:{oblachko:!0},up:{magnet:0,shield:0,x2:0,boots:0},boosts:{startShield:0,startMagnet:0,extraLife:0},set:{music:.7,sfx:.85,muted:!1,buttons:!1,vibro:!0,diff:"normal",quality:"auto",orient:null},totalCoins:0,runs:0,tutorial:!1}}var ee=(()=>{try{let i=JSON.parse(localStorage.getItem(Em));if(i&&i.v===1){let e=nd();return{...e,...i,set:{...e.set,...i.set},up:{...e.up,...i.up},boosts:{...e.boosts,...i.boosts},owned:{...e.owned,...i.owned},stars:e.stars.map((t,n)=>i.stars&&i.stars[n]||0),done:e.done.map((t,n)=>!!(i.done&&i.done[n]))}}}catch{}return nd()})();function qt(){try{localStorage.setItem(Em,JSON.stringify(ee))}catch{}}var Am=i=>window.__EMBED&&window.__EMBED[i]||"assets/"+i,we=new pc(ee.set,Am),Rm=te("scene"),fn=new oc({canvas:Rm,antialias:!0,powerPreference:"high-performance"});fn.outputColorSpace=ot;fn.toneMapping=Bo;fn.toneMappingExposure=1.08;fn.shadowMap.enabled=!0;fn.shadowMap.type=pl;var Jt=new bs;Jt.fog=new _o("#d7ebe6",40,170);var Jn=new It(60,1,.1,700);Jt.environment=new Dr(fn).fromScene(new dc,.04).texture;Jt.environmentIntensity=.45;var xc=new No("#dff1ff","#7c9a5c",1.1);Jt.add(xc);var Wt=new Is("#fff1d6",2.6);Wt.castShadow=!0;Object.assign(Wt.shadow.camera,{left:-16,right:16,top:22,bottom:-14,near:1,far:90});Wt.shadow.bias=-6e-4;Wt.shadow.normalBias=.03;Jt.add(Wt,Wt.target);var $n=new Ht;Jt.add($n);var Kt=new Ht;Jt.add(Kt);function Cm(){let i=ee.set.quality,e=ee.device||"phone";return i==="low"?{pr:1,shadow:0,decor:.6,ahead:140}:i==="high"?{pr:2,shadow:2048,decor:1.15,ahead:190}:e==="tablet"?{pr:1.75,shadow:2048,decor:1,ahead:180}:{pr:1.4,shadow:1024,decor:.85,ahead:160}}var Ui=Cm();function ud(){Ui=Cm(),fn.setPixelRatio(Math.min(window.devicePixelRatio||1,Ui.pr));let i=Ui.shadow>0;fn.shadowMap.enabled!==i&&(fn.shadowMap.enabled=i,Jt.traverse(e=>{e.material&&[].concat(e.material).forEach(t=>t.needsUpdate=!0)})),Wt.castShadow=i,i&&Wt.shadow.mapSize.x!==Ui.shadow&&(Wt.shadow.mapSize.set(Ui.shadow,Ui.shadow),Wt.shadow.map&&(Wt.shadow.map.dispose(),Wt.shadow.map=null)),dd()}function dd(){let i=window.innerWidth,e=window.innerHeight;fn.setSize(i,e,!1),Jn.aspect=i/e;let t=e>i;Jn.fov=t?66:54,Jn.updateProjectionMatrix(),document.body.classList.toggle("landscape",!t)}window.addEventListener("resize",dd);var qr={},yc={},fd={},sM=new Set(["tree_a","tree_b","tree_c","tree_autumn","pine_a","pine_b","pine_snow","bush_a","bush_b","flowers","sunflowers","fern","sakura_a","sakura_b","cloud_a","cloud_b","shelf","ceiling_light","barn","farmhouse","windmill","station","bld_a","bld_b","bld_c","bld_d","market_front","house_snow","spooky_house","lighthouse","cliff_a","cliff_b","gate","xmas_tree","dead_tree","garland_post","lamp","fence","umbrella","beach_hut","boat","pier_post"]),Vt={};async function rM(i){let e=new cc,t={heroes:0,props:0},n=(o,a)=>new Promise((l,c)=>e.load(Am(o),l,h=>{h.total&&(t[a]=h.loaded/h.total,i((t.heroes+t.props)/2))},c)),[s,r]=await Promise.all([n("heroes.glb","heroes"),n("props.glb","props")]);for(let o of[...s.scene.children])yc[o.name.replace("hero_","")]=o;for(let o of[...r.scene.children]){let a=o.name.replace(/^p_/,"");qr[a]=o,o.traverse(l=>{l.isMesh&&(l.castShadow=!sM.has(a),l.receiveShadow=!0,l.material&&l.material.name&&(Vt[l.material.name]=l.material))}),fd[a]=new un().setFromObject(o)}for(let o in yc)yc[o].traverse(a=>{a.isMesh&&(a.castShadow=!0,a.receiveShadow=!0)});Vt.cloud&&(Vt.cloud.fog=!1),Vt.gold&&(Vt.gold.color.set("#ffd24a"),Vt.gold.emissive.set("#b77a00"),Vt.gold.emissiveIntensity=.55,Vt.gold.metalness=.55,Vt.gold.roughness=.25),Vt.gold_dark&&(Vt.gold_dark.color.set("#f0b02a"),Vt.gold_dark.emissive=new Ae("#8a5200"),Vt.gold_dark.emissiveIntensity=.4)}var Sc={};function la(i,e=$n){let n=(Sc[i]||(Sc[i]=[])).pop();return n||(n=qr[i].clone(!0),n.userData.pname=i),n.visible=!0,n.position.set(0,0,0),n.rotation.set(0,0,0),n.scale.set(1,1,1),e.add(n),n}function Ws(i){i&&(i.parent&&i.parent.remove(i),(Sc[i.userData.pname]||(Sc[i.userData.pname]=[])).push(i))}function bc(i){let e=yc[i].clone(!0),t=.72;e.position.set(0,-t,0);let n=new Ht,s=new Ht,r=new Ht;r.position.y=t,r.add(e),s.add(r),n.add(s);let o=h=>{let u=null;return e.traverse(d=>{!u&&h.test(d.name)&&(u=d)}),u},a={head:o(/^head/),body:o(/_body|^body/),tail:o(/^tail/),scarf:o(/^scarf_tail/),legL:o(/^leg_l/),legR:o(/^leg_r/),armL:o(/^arm_l/),armR:o(/^arm_r/)},l={};for(let h in a)a[h]&&(l[h]={r:a[h].rotation.clone(),p:a[h].position.clone()});let c=new Qe(new Tr(1,24,16),new At({color:"#8fdcff",emissive:"#4fb6ff",emissiveIntensity:.5,transparent:!0,opacity:.22,depthWrite:!1,roughness:.1}));return c.scale.set(.9,1,.9),c.position.y=.85,c.visible=!1,n.add(c),{id:i,root:n,inner:s,pivot:r,model:e,parts:a,base:l,phase:0,bubble:c,blink:0,roll:0}}function Fi(i,e,t,n=15){let s=i.parts,r=i.base,o=(p,m=0,S=0,A=0)=>{s[p]&&s[p].rotation.set(r[p].r.x+m,r[p].r.y+S,r[p].r.z+A)},a=1-Math.exp(-e*18),l=(p,m=0,S=0,A=0)=>{let T=s[p];if(!T)return;let R=r[p].r;T.rotation.x+=(R.x+m-T.rotation.x)*a,T.rotation.y+=(R.y+S-T.rotation.y)*a,T.rotation.z+=(R.z+A-T.rotation.z)*a};i.phase+=e*(t==="run"?n*.5:t==="idle"?2.2:6);let c=Math.sin(i.phase),h=Math.cos(i.phase),u=Math.sin(i.phase*2),d=0,f=0,_=!1,v=1;if(t==="run"){let p=rn(.55+n*.025,.6,1.05);l("legL",c*p),l("legR",-c*p),l("armL",-c*p*.85,0,.18),l("armR",c*p*.85,0,-.18),d=Math.abs(h)*.11,f=-.13-Math.abs(h)*.03,o("head",.08-u*.05,c*.06),o("tail",0,u*.5),o("scarf",-.7+Math.sin(i.phase*2.4)*.3,0,Math.sin(i.phase*1.3)*.15)}else if(t==="jump")l("legL",1.05),l("legR",-.35),l("armL",2.5,0,.45),l("armR",2.3,0,-.45),l("head",-.15),o("tail",.4),o("scarf",-1.2),f=-.05;else if(t==="fall")l("legL",.45),l("legR",.15),l("armL",.4,0,1.15+c*.25),l("armR",.4,0,-1.15-c*.25),l("head",.1),o("scarf",-.4),f=.04;else if(t==="slide")_=!0,v=.86,d=-.3,l("legL",1.7),l("legR",1.7),l("armL",1.9,0,-.2),l("armR",1.9,0,.2),l("head",.55),o("scarf",-.3),o("tail",.6);else if(t==="idle")o("legL"),o("legR"),o("armL",Math.sin(i.phase*.5)*.06,0,.08),o("armR",-Math.sin(i.phase*.5)*.06,0,-.08),o("head",Math.sin(i.phase*.5)*.05,Math.sin(i.phase*.31)*.25,Math.sin(i.phase*.4)*.06),o("tail",0,Math.sin(i.phase*1.7)*.4),o("scarf",-.1+Math.sin(i.phase)*.05),d=Math.sin(i.phase)*.012;else if(t==="cheer"){let p=Math.abs(Math.sin(i.phase*.9));d=p*.42,o("legL",p*.5),o("legR",-p*.3),o("armL",2.6+Math.sin(i.phase*2)*.35,0,.35),o("armR",2.6-Math.sin(i.phase*2)*.35,0,-.35),o("head",-.2*p),o("tail",0,Math.sin(i.phase*3)*.6),o("scarf",-.4-p*.5)}i.inner.position.y=xt(i.inner.position.y,d,22,e),i.inner.rotation.x=xt(i.inner.rotation.x,f,14,e),_?i.roll-=e*Math.max(n,9)*1.25:(i.roll=Math.atan2(Math.sin(i.roll),Math.cos(i.roll)),i.roll=xt(i.roll,0,16,e)),i.pivot.rotation.x=i.roll,i.pivot.scale.setScalar(xt(i.pivot.scale.x,v,20,e)),i.blink>0?(i.blink-=e,i.model.visible=Math.floor(i.blink*12)%2===0):i.model.visible=!0}var gc=420,Xt={meshes:[],list:[],free:[]},hs=new Be,gm=new hn,_m=new Nn,xm=new O,ym=new O;function oM(){qr.coin.updateMatrixWorld(!0),qr.coin.traverse(i=>{if(i.isMesh){let e=i.geometry.clone();e.applyMatrix4(i.matrixWorld);let t=new ii(e,i.material,gc);t.castShadow=!0,t.frustumCulled=!1,t.count=gc;for(let n=0;n<gc;n++)hs.makeScale(0,0,0),t.setMatrixAt(n,hs);Jt.add(t),Xt.meshes.push(t)}});for(let i=0;i<gc;i++)Xt.list.push({alive:!1,i}),Xt.free.push(i)}function aM(i,e,t){let n=Xt.free.pop();if(n===void 0)return;let s=Xt.list[n];Object.assign(s,{alive:!0,x:i,y:e,z:t,pull:!1,t:Math.random()*6})}function qs(i){i.alive=!1,Xt.free.push(i.i),hs.makeScale(0,0,0);for(let e of Xt.meshes)e.setMatrixAt(i.i,hs)}function lM(){for(let i of Xt.list)i.alive&&qs(i);for(let i of Xt.meshes)i.instanceMatrix.needsUpdate=!0}function id(i,e){let t=e*3.2;for(let n of Xt.list)if(n.alive){if(n.z>g.pz+12){qs(n);continue}if(g.state==="run"){let s=n.z-g.pz,r=n.x-g.px,o=n.y-(g.py+.7);if(g.pw.magnet>0&&Math.abs(s)<13&&Math.abs(r)<9&&(n.pull=!0),n.pull){let a=1-Math.exp(-i*14);n.x+=(g.px-n.x)*a,n.y+=(g.py+.8-n.y)*a,n.z+=(g.pz-.3-n.z)*a}if(Math.abs(s)<.9&&Math.abs(r)<.85&&Math.abs(o)<1.05){cM(n);continue}}_m.set(0,t+n.x*.3,0),gm.setFromEuler(_m),xm.set(n.x,n.y+Math.sin(e*3+n.z*.4)*.06,n.z),ym.set(1,1,1),hs.compose(xm,gm,ym);for(let s of Xt.meshes)s.setMatrixAt(n.i,hs)}for(let n of Xt.meshes)n.instanceMatrix.needsUpdate=!0}function cM(i){let e=g.pw.x2>0?2:1;g.coins+=e,uM(i.x,i.y,i.z,"#ffd75e",5),we.play("coin",{vol:.55,rate:1+g.coinStreak%6*.03,pan:(i.x-g.px)*.1}),g.coinStreak++,qs(i),_d()}var Vr=500,at={pos:new Float32Array(Vr*3),col:new Float32Array(Vr*3),vel:[],life:new Float32Array(Vr),n:0,idx:0},sa=new St;sa.setAttribute("position",new yt(at.pos,3));sa.setAttribute("color",new yt(at.col,3));var hM=new si({size:.28,vertexColors:!0,transparent:!0,depthWrite:!1,map:qu(),blending:Ls}),Im=new Ei(sa,hM);Im.frustumCulled=!1;Jt.add(Im);for(let i=0;i<Vr;i++)at.vel.push(new O),at.pos[i*3+1]=-999;var _c=new Ae;function Bi(i,e,t,n,s,r=3,o=2,a=.7,l=6){_c.set(n);for(let c=0;c<s;c++){let h=at.idx;at.idx=(at.idx+1)%Vr,at.pos[h*3]=i,at.pos[h*3+1]=e,at.pos[h*3+2]=t,at.col[h*3]=_c.r,at.col[h*3+1]=_c.g,at.col[h*3+2]=_c.b,at.vel[h].set(Fe(-1,1)*r,Fe(.3,1)*o,Fe(-1,1)*r),at.vel[h].g=l,at.life[h]=a*Fe(.6,1.2)}}var uM=(i,e,t,n,s=6)=>Bi(i,e,t,n,s,1.6,2.5,.45,2);function dM(i){for(let e=0;e<Vr;e++){if(at.life[e]<=0)continue;at.life[e]-=i;let t=at.vel[e];if(t.y-=(t.g||6)*i,at.pos[e*3]+=t.x*i,at.pos[e*3+1]+=t.y*i,at.pos[e*3+2]+=t.z*i,at.life[e]<=0)at.pos[e*3+1]=-999;else if(at.life[e]<.25){let n=1-i*5;at.col[e*3]*=n,at.col[e*3+1]*=n,at.col[e*3+2]*=n}}sa.attributes.position.needsUpdate=!0,sa.attributes.color.needsUpdate=!0}var Ot=2.4,sd={theme:null},ra=new Qe(new Tr(420,24,12),om("#9fd3e6","#e9f4e8"));ra.renderOrder=-1;Jt.add(ra);var zr,Hr,Gr,as;var na,Kn;var vc=[];function pd(i){let e=kn[i];for(sd.theme=i,sd.th=e;Kt.children.length;)Kt.remove(Kt.children[0]);ra.material.uniforms.top.value.set(e.sky[0]),ra.material.uniforms.bottom.value.set(e.sky[1]),Jt.fog.color.set(e.fog),Jt.fog.near=e.fogNear,Jt.fog.far=e.fogFar,xc.color.set(e.hemi[0]),xc.groundColor.set(e.hemi[1]),xc.intensity=e.hemiI*.85,Jt.environmentIntensity=e.night?.25:.45,Wt.color.set(e.sun),Wt.intensity=e.sunI,fn.toneMappingExposure=e.night?1.25:1.08;let t=em(e.ground,fn);t.repeat.set(260/9,420/9),zr=new Qe(new ri(260,420),new At({map:t,roughness:.95})),zr.rotation.x=-Math.PI/2,zr.position.y=-.03,zr.receiveShadow=!0,zr.userData.snap=9,Kt.add(zr);let n=tm(e.path,fn),s=e.rails?8.4:8;n.repeat.set(1,420/s),Hr=new Qe(new ri(s,420),new At({map:n,roughness:e.path==="tiles"?.45:.92})),Hr.rotation.x=-Math.PI/2,Hr.position.y=0,Hr.receiveShadow=!0,Hr.userData.snap=s,Kt.add(Hr);let r=new At({color:e.night?"#5d5866":e.path==="planks"?"#8a6444":"#d9d2bd",roughness:.8});for(let a of[-1,1]){let l=new Qe(new gn(.35,.14,420),r);l.position.set(a*(s/2+.12),.05,0),l.receiveShadow=!0,l.userData.snap=s,Kt.add(l)}if(Gr=null,e.rails){Gr=new Ht,Gr.userData.snap=1.2;let a=new gn(1.9,.1,.32),l=new ii(a,new At({color:e.night?"#4a3f3a":"#7a5c44",roughness:.9}),3*300),c=0;for(let u=-1;u<=1;u++)for(let d=0;d<300;d++)hs.makeTranslation(u*Ot,.04,180-d*1.2),l.setMatrixAt(c++,hs);l.receiveShadow=!0,Gr.add(l);let h=new At({color:"#b9c0c4",metalness:.8,roughness:.35});for(let u=-1;u<=1;u++)for(let d of[-.62,.62]){let f=new Qe(new gn(.1,.14,420),h);f.position.set(u*Ot+d,.14,0),f.receiveShadow=!0,Gr.add(f)}Kt.add(Gr)}if(as=null,e.sea){let a=nm();a.repeat.set(30,60),as=new Qe(new ri(200,420),new At({map:a,roughness:.25,metalness:.1,color:"#d8f2f6"})),as.rotation.x=-Math.PI/2,as.position.set(-106,.02,0),as.userData.snap=7,Kt.add(as)}if(e.indoor){let a=new At({color:"#e7ecdc",roughness:.9});for(let c of[-1,1]){let h=new Qe(new gn(.4,9,420),a);h.position.set(c*8.2,4.4,0),h.userData.snap=10,Kt.add(h);let u=new Qe(new gn(.42,.6,420),new At({color:"#7da38f"}));u.position.set(c*8.2,5.5,0),u.userData.snap=10,Kt.add(u)}let l=new Qe(new ri(17,420),new Sn({color:"#dfe6d6"}));l.rotation.x=Math.PI/2,l.position.y=8.6,l.userData.snap=10,Kt.add(l)}if(e.stars){let l=new Float32Array(1500);for(let u=0;u<500;u++){let d=Math.random(),f=Math.random()*Math.PI*2,_=.15+d*.85,v=Math.sqrt(1-_*_);l[u*3]=Math.cos(f)*v*380,l[u*3+1]=_*380,l[u*3+2]=Math.sin(f)*v*380}let c=new St;c.setAttribute("position",new yt(l,3)),na=new Ei(c,new si({color:"#fff8e0",size:2.2,sizeAttenuation:!1,fog:!1,transparent:!0,opacity:.85})),na.userData.cam=!0,Kt.add(na);let h=new Qe(new Ro(14,32),new Sn({color:"#fff4d2",fog:!1}));h.position.set(-90,150,-300),h.lookAt(0,0,0),h.userData.cam=!0,Kt.add(h)}Kn=null;let o=e.snowfall?"snow":e.petals?"petals":e.fireflies?"fireflies":null;if(o){let a=o==="fireflies"?90:420,l=new Float32Array(a*3);for(let u=0;u<a;u++)l[u*3]=Fe(-30,30),l[u*3+1]=Fe(0,18),l[u*3+2]=Fe(-70,10);let c=new St;c.setAttribute("position",new yt(l,3));let h=new si({size:o==="snow"?.22:o==="petals"?.32:.3,transparent:!0,depthWrite:!1,map:o==="petals"?sm():qu(),color:o==="fireflies"?"#ffe88a":"#ffffff",blending:o==="fireflies"?Ls:$i});Kn=new Ei(c,h),Kn.frustumCulled=!1,Kn.userData.kind=o,Kt.add(Kn)}Wt.userData.off=e.night?new O(-12,24,6):new O(10,26,12),Vt.window&&(Vt.window.emissive.set(e.night?"#ffcb78":"#000000"),Vt.window.emissiveIntensity=e.night?.9:0),Vt.lamp_glow&&(Vt.lamp_glow.emissiveIntensity=e.night?4:1.2);for(let a of vc)Ws(a);if(vc.length=0,e.clouds)for(let a=0;a<9;a++){let l=la(a%2?"cloud_a":"cloud_b",Kt);l.scale.setScalar(Fe(1.8,3.4)),l.position.set(Fe(-1,1)>0?Fe(25,110):-Fe(25,110),Fe(26,48),g.pz-Fe(40,360)),l.userData.cam=!1,l.userData.cloud=!0,vc.push(l)}}function fM(i,e){var n;ra.position.copy(Jn.position);for(let s of Kt.children)s.userData.snap&&(s.position.z=Math.round(g.pz/s.userData.snap)*s.userData.snap-120),s.userData.cam&&s.position.set(Jn.position.x+(s.userData.ox||0),(n=s.userData.oy)!=null?n:s.position.y,Jn.position.z);na&&na.position.copy(Jn.position);for(let s of vc)s.position.x+=i*.6,s.position.z>g.pz+60&&(s.position.z-=420);if(as&&(as.material.map.offset.x=e*.02%1),Kn){let s=Kn.geometry.attributes.position.array,r=Kn.userData.kind;for(let o=0;o<s.length;o+=3)r==="snow"?(s[o+1]-=i*1.6,s[o]+=Math.sin(e+o)*i*.4):r==="petals"?(s[o+1]-=i*.9,s[o]+=i*1.2,s[o+2]+=Math.sin(e*.7+o)*i*.5):(s[o+1]+=Math.sin(e*1.5+o)*i*.4,s[o]+=Math.cos(e+o*.7)*i*.5),s[o+1]<0&&(s[o+1]+=18),s[o+1]>18&&(s[o+1]-=18),s[o]>30&&(s[o]-=60),s[o]<-30&&(s[o]+=60);Kn.geometry.attributes.position.needsUpdate=!0,Kn.position.set(g.px*.5,0,g.pz),r==="fireflies"&&(Kn.material.opacity=.6+Math.sin(e*3)*.3)}let t=Wt.userData.off||new O(10,26,12);Wt.position.set(g.px+t.x,t.y,g.pz+t.z-6),Wt.target.position.set(g.px,0,g.pz-6)}var g={state:"boot",mode:"story",ch:0,chapter:null,len:0,startZ:0,pz:0,px:0,py:0,vy:0,lane:0,grounded:!0,slideT:0,jumpBuf:0,slideBuf:0,coyote:0,speed:0,baseSpeed:15,coins:0,items:0,hits:0,lives:3,maxLives:3,inv:0,revived:!1,pw:{magnet:0,shield:0,x2:0,boots:0},pwMax:{},coinStreak:0,time:0,themeIdx:-1,lineShown:0,hero:null,npc:null,friends:[],finishObj:null,shake:0,endlessOrder:[]},Tn=[],ki=[],Ne={rowZ:0,decL:0,decR:0,landL:0,landR:0,bldL:0,bldR:0,itemNext:0,itemPlan:[],powerZ:0,shelfZ:0,lightZ:0,done:!1,path:0,pathZ:-6};function md(){return g.startZ-g.pz}function Wr(i){if(g.mode==="endless"){let t=Math.max(0,Math.floor(i/800));return g.endlessOrder[t%g.endlessOrder.length]}let e=g.chapter.themes;return e.length>1&&i>g.len/2?e[1]:e[0]}var ca=()=>fc[ee.set.diff]||fc.normal,Tc={barrier:"jump",hay:"jump",crate:"jump",cones:"jump",log:"jump",stump:"jump",barrels:"jump",bench:"jump",pumpkins:"jump",snowdrift:"jump",arch:"slide",arch_flags:"slide",arch_web:"slide",arch_ice:"slide",arch_lantern:"slide",arch_branch:"slide",crate_stack:"block",rock:"block",snowman:"block",gift_pile:"block",cart:"block",car:"block",car2:"block",car3:"block",van:"block",bus:"block",tractor:"block",ghost:"block",wagon:"platform",wagon2:"platform",wagon3:"platform",ramp:"ramp"},pM={car:7,car2:8,car3:7.5,van:6,bus:5,tractor:3.5,cart:2.5,ghost:2.5,wagon3:9};function mM(i,e,t,n={}){let s=la(i),r=e*Ot;s.position.set(r,0,t),i==="ghost"&&(s.position.y=.2);let o=fd[i],a={t:"ob",name:i,obj:s,lane:e,x:r,z:t,kind:Tc[i]||"block",hx:Math.min((o.max.x-o.min.x)/2,1.15),z0:o.min.z,z1:o.max.z,top:o.max.y,low:i==="arch_branch"?1.25:1.1,move:n.move||0,hit:!1,knock:null};return a.kind==="slide"&&(a.hx=1.15),Tn.push(a),a}function Xs(i){Ws(i.obj),i.dead=!0}function Pm(i,e,t=6){for(let n of Tn)if(!n.dead&&n.t==="ob"&&n.lane===i&&e<n.z+n.z1+t&&e>n.z+n.z0-t)return n;return null}var rd=9.6,Lm=28,gM=rd*rd/(2*Lm),_M=2*rd/Lm;function ia(i){let e=ca();return g.mode==="endless"?Math.min(g.baseSpeed+i/140,27*e.speed):g.baseSpeed*(1+rn(i/g.len,0,1)*.12)}function oa(i,e,t,n){for(let s of Tn){if(s.dead||s.t!=="ob"||Math.abs(i-s.x)>s.hx+.35)continue;if(s.move&&!n&&t>s.z+s.z0-.7)return!1;let r=s.z+s.z0-.7,o=s.z+s.z1+.7;if(!(t<r||t>o)){if(s.move||s.kind==="block"||s.kind==="jump"&&e<s.top+.45||s.kind==="slide"&&e>s.low-.4&&e<s.top+.3||s.kind==="platform"&&e<s.top+.35)return!1;if(s.kind==="ramp"){let a=s.top*rn((s.z+s.z1-t)/(s.z1-s.z0),0,1);if(e<a+.35)return!1}}}return!0}function aa(i,e,t){if(!oa(i,e,t))return!1;for(let n of Xt.list)if(n.alive&&Math.abs(n.z-t)<1.1&&Math.abs(n.x-i)<.6&&Math.abs(n.y-e)<.6)return!1;return aM(i,e,t),!0}function Hs(i,e,t,n=.9,s=2.6){for(let r=e;r>t;r-=s)aa(i*Ot,n,r)}function Nm(i,e,t=1){let n=ia(g.startZ-e)*_M*.92,s=rn(Math.round(n/1.7)+1,5,11);for(let r=0;r<s;r++){let o=r/(s-1);aa(i*Ot,.75+gM*4*o*(1-o),e+n/2-o*n)}}function xM(i,e){let t=i.filter(s=>s.lane===e&&!s.dead);if(!t.length)return{pass:!0,free:!0,list:t};let n=t.some(s=>s.kind==="ramp");for(let s of t){if(s.move||s.kind==="block")return{pass:!1,list:t};if(s.kind==="platform"&&!n)return{pass:!1,list:t}}return{pass:!0,free:!1,list:t}}function vm(i,e,t){let n=e.list.slice().sort((s,r)=>r.z-s.z);for(let s of n)if(s.kind==="jump")Nm(i,s.z,s.top);else if(s.kind==="slide")Hs(i,s.z+2.6,s.z-2.8,.45,1.6);else if(s.kind==="ramp")for(let r=s.z+s.z1-.5;r>s.z+s.z0;r-=1.6){let o=s.top*rn((s.z+s.z1-r)/(s.z1-s.z0),0,1);aa(i*Ot,o+.9,r)}else s.kind==="platform"&&Hs(i,s.z+s.z1-.8,s.z+s.z0+.8,s.top+.9,2.4)}function yM(i){let e=g.startZ-i,t=kn[Wr(e)],n=ca(),s=g.mode==="endless"?rn(e/2500,0,1):rn(e/g.len,0,1),r=[-1,0,1],o=N=>{for(let H=N.length-1;H>0;H--){let B=Math.random()*(H+1)|0;[N[H],N[B]]=[N[B],N[H]]}return N},a=t.block.filter(N=>Tc[N]==="block"),l=()=>os(t.jump),c=()=>os(t.slide),h=()=>os(a.length?a:t.jump),u=()=>Math.random()<.55?l():c(),d=n.density,f=[["single",3-s*1.6],["double",1.6+s*2*d],["wall",.6+s*1.4*d],["gate",.5+s*1.6*d],["zigzag",.4+s*1.4*d],["hurdles",.8+s*.8],["tunnel",.5+s*.6],["coins",1-s*.4]];t.platform&&f.push(["train",2]),t.moving&&t.moving.length&&f.push(["moving",1.2+s*1.2]);let _=e<70?"coins":e<160?Vs([["single",3],["coins",1],["hurdles",1]]):Vs(f),v=[],p=(N,H,B,ne)=>{let X=mM(N,H,B,ne);return v.push(X),X},[m,S,A]=o(r.slice());if(_==="single")p(Math.random()<.3?h():u(),m,i);else if(_==="double")p(h(),m,i),p(Math.random()<.5?u():h(),S,i);else if(_==="wall")p(l(),m,i),p(u(),S,i),p(u(),A,i);else if(_==="gate"){let N=rn(Ne.path+os([-1,0,1]),-1,1);for(let H of r)p(H===N?u():h(),H,i)}else if(_==="zigzag"){let N=Math.max(9,ia(e)*.65);p(h(),m,i),p(h(),S,i-N),Math.random()<.5&&p(u(),A,i-N*2)}else if(_==="hurdles"){let N=2+(Math.random()<s?1:0),H=Math.max(12,ia(e)*1.2);for(let B=0;B<N;B++)p(B%2&&Math.random()<.4?c():l(),m,i-B*H);Math.random()<.5&&p(h(),S,i-H/2)}else if(_==="tunnel"){for(let N=0;N<3;N++)p(c(),m,i-N*3.4);Math.random()<.6&&p(h(),S,i-3.4)}else if(_==="train"){let N=()=>os(t.block.filter(H=>Tc[H]==="platform"));p("ramp",m,i+2.5),p(N(),m,i-7.5),Math.random()<.7&&p(N(),S,i-7.5+Fe(-3,3)),Math.random()<.35&&p(l(),A,i-4)}else if(_==="moving"){let N=os(t.moving),H=(pM[N]||6)*(.9+n.speed*.1),B=p(N,m,i,{move:H});N==="wagon3"&&(B.kind="block");let ne=Math.max(g.speed,ia(e)),X=H*(g.pz-i)/(ne+H)+14;for(let Y of Tn)Y!==B&&!Y.dead&&Y.t==="ob"&&Y.lane===m&&Y.z>i&&Y.z<i+X&&Xs(Y);for(let Y of Xt.list)Y.alive&&Math.abs(Y.x-m*Ot)<.5&&Y.z>i&&Y.z<i+X&&qs(Y);for(let Y of Tn)if(!Y.dead&&(Y.t==="pw"||Y.t==="item")&&Y.lane===m&&Y.z>i){let ie=[-1,0,1].find(Me=>Me!==m&&oa(Me*Ot,1.05,Y.z));ie!==void 0&&(Y.lane=ie,Y.x=ie*Ot,Y.obj.position.x=Y.x)}Math.random()<.4*s&&p(u(),S,i-2)}if(v.length){let N=Math.max(...v.map(B=>B.z+B.z1))+1.5,H=Math.min(...v.map(B=>B.z+B.z0))-1.5;for(let B of Xt.list)B.alive&&B.z<N&&B.z>H&&!oa(B.x,B.y,B.z,!0)&&qs(B)}let T={};for(let N of r)T[N]=xM(v,N);let R=r.filter(N=>T[N].pass);if(!R.length){let N=os(r);for(let H of v)H.lane===N&&Xs(H);T[N]={pass:!0,free:!0,list:[]},R=[N]}let E=Ne.path,x=N=>-Math.abs(N-E)*.9+(T[N].free?.6:0)+(T[N].list.some(H=>H.kind==="ramp")?1.2:0)+Math.random()*1.1,b=R.sort((N,H)=>x(H)-x(N))[0],F=v.length?Math.max(...v.map(N=>N.z+N.z1)):i,P=v.length?Math.min(...v.map(N=>N.z+N.z0)):i;if(_==="coins"){let N=E,H=Math.random();if(H<.4)Hs(N,Ne.pathZ,i-14);else if(H<.75)for(let B=0,ne=Ne.pathZ;ne>i-16;B++,ne-=2.2)aa(rn(N+Math.sin(B*.55)*(N===0?1:-N),-1,1)*Ot,.9,ne);else Hs(N,Ne.pathZ,i+4),Nm(N,i-2);return Ne.pathZ=i-16,0}let U=e<160||Math.random()<.75,V=Ne.pathZ,q=F+2.5;if(U){if(b===E)Hs(b,V,q);else{let N=(V+q)/2,H=Math.min(4.5,(V-q)/2-1);if(H>1.5){Hs(E,V,N+H);let B=4;for(let ne=0;ne<=B;ne++){let X=ne/B,Y=X*X*(3-2*X);aa(hd(E,b,Y)*Ot,.9,N+H-X*H*2)}Hs(b,N-H-2.6,q)}}vm(b,T[b])}let I=r.filter(N=>N!==b&&T[N].pass&&!T[N].free);return I.length&&Math.random()<.45&&vm(I[0],T[I[0]]),Ne.path=b,Ne.pathZ=P-2.5,Math.max(0,i-P-1)}function Mm(i,e){i==="item"&&(g.itemsPlacedZ=Ne.pathZ);let n=[Ne.path,...[-1,0,1].filter(l=>l!==Ne.path).sort(()=>Math.random()-.5)].find(l=>!Pm(l,e,4)&&oa(l*Ot,1.05,e));n===void 0&&(e=Ne.pathZ-2,n=Ne.path);let s=i==="item"?g.chapter.item:i,r=la(s);r.position.set(n*Ot,1.05,e);let o=new vo(new vr({map:im(i==="item"?"#fff0a0":"#bff0ff"),transparent:!0,depthWrite:!1,blending:Ls,opacity:.85}));o.scale.setScalar(i==="item"?2.4:1.8),r.add(o);let a=i==="item"?s==="backpack"?1.4:1.25:1.1;r.scale.setScalar(a),Tn.push({t:i==="item"?"item":"pw",name:s,obj:r,lane:n,x:n*Ot,z:e,glow:o,base:1.05});for(let l of Xt.list)l.alive&&Math.abs(l.x-n*Ot)<.5&&Math.abs(l.z-e)<1.5&&qs(l)}function Zn(i,e,t,n=0,s=1,r=0){if(!qr[i])return null;let o=la(i);return o.position.set(e,r,t),o.rotation.y=n,o.scale.setScalar(s),ki.push(o),o}function Dm(i){for(let e of[-1,1]){let t=e<0?"decL":"decR";for(;Ne[t]>i;){let s=g.startZ-Ne[t],r=Wr(s),o=kn[r],a=Ne[t];if(o.indoor){Ne[t]-=8.4;let f=Zn("shelf",e*5.9,a,e<0?Math.PI:0);Math.random()<.12&&Zn("checkout",e*4.3,a-4,e<0?Math.PI:0);continue}if(Ne[t]-=Fe(4.5,10)/Ui.decor,o.sea&&e<0){Math.random()<.6&&Zn("pier_post",-5.2,a,0,Fe(.9,1.1));continue}let l=Vs(o.scenery),c=["lamp","fence","pier_post","garland_post","bus_stop","stone_lantern","umbrella"].includes(l),h=e*(c?Fe(5.6,6.4):Fe(6.2,15)),d=l==="fence"?Math.PI/2:l==="lamp"||l==="garland_post"?(e>0?0:Math.PI)+Math.PI/2*-e*0:Fe(0,6.28);(l==="lamp"||l==="garland_post")&&(d=e>0?-Math.PI/2:Math.PI/2),l==="bus_stop"&&(d=e>0?-Math.PI/2:Math.PI/2),Zn(l,h,a,d,l==="lamp"||l==="fence"?1:Fe(.85,1.2)),Math.random()<.5*Ui.decor&&!c&&!o.buildings&&Zn(Vs(o.scenery.filter(f=>!["lamp","fence","bus_stop","garland_post","pier_post"].includes(f[0]))),e*Fe(16,34),a-Fe(0,5),Fe(0,6.28),Fe(.9,1.5))}let n=e<0?"landL":"landR";for(;Ne[n]>i;){let s=g.startZ-Ne[n],r=kn[Wr(s)],o=Ne[n];if(r.buildings){let l=Vs(r.landmarks),c=l==="bld_d"?7:6;Zn(l,e*12,o,e>0?-Math.PI/2:Math.PI/2,1),Ne[n]-=c+Fe(.4,2.5);continue}if(Ne[n]-=Fe(40,75),!r.landmarks.length)continue;let a=Vs(r.landmarks);if(r.sea&&e<0){Zn(a==="lighthouse"?"lighthouse":"boat",-Fe(16,34),o,Fe(0,6.28)*(a==="boat"?1:0));continue}if(a==="gate"){Zn("gate",0,o,0,1);continue}Zn(a,e*Fe(15,24),o,e>0?-Math.PI/2+Fe(-.4,.4):Math.PI/2+Fe(-.4,.4))}}if(kn[Wr(g.startZ-Ne.lightZ)].indoor)for(;Ne.lightZ>i;){for(let e of[-3,3])Zn("ceiling_light",e,Ne.lightZ,0,1,8.4);Ne.lightZ-=12}else Ne.lightZ=i}function Um(){let i=g.pz-Ui.ahead,e=ca();for(;Ne.rowZ>i&&!Ne.done;){let t=g.startZ-Ne.rowZ;if(g.mode==="story"&&t>g.len-45){Ne.done=!0;break}let n=yM(Ne.rowZ);for(;Ne.itemPlan.length&&Ne.itemPlan[0]>=Ne.rowZ-20;)g.itemsPlaced=(g.itemsPlaced||0)+1,Ne.itemPlan.shift(),Mm("item",Ne.pathZ-3);if(Ne.rowZ<Ne.powerZ){let r=[["magnet",3],["shield",2.5],["x2",2.5],["boots",2]];g.lives<g.maxLives&&r.push(["heart",2.5]),Mm(Vs(r),Ne.pathZ-(g.itemsPlacedZ===Ne.pathZ?7:3)),Ne.powerZ-=Fe(170,280)}let s=Math.max(17,ia(t)*1.25)*Fe(.95,1.3)/e.density;Ne.rowZ-=s+n}Dm(i)}function Om(){for(let i of Tn)i.dead||Ws(i.obj);Tn.length=0;for(let i of ki)Ws(i);ki.length=0,lM(),g.finishObj&&(Ws(g.finishObj),g.finishObj=null);for(let i of g.friends)$n.remove(i.root);g.friends=[],g.npc&&($n.remove(g.npc.root),g.npc=null)}function vM(i){g.hero&&$n.remove(g.hero.root),g.hero=bc(i),$n.add(g.hero.root)}function Fm(i){g.pz=0,g.startZ=0,g.px=0,g.py=0,g.vy=0,g.lane=0,Object.assign(Ne,{rowZ:-40,decL:25,decR:25,landL:Fe(-5,20),landR:Fe(-20,10),lightZ:20,powerZ:-Fe(120,200),done:!1,itemPlan:[],path:0,pathZ:-6})}function Rc(i,e=0){we.unlock(),Om(),g.mode=i,g.ch=e,g.chapter=i==="story"?sn[e]:null,g.len=i==="story"?g.chapter.len:1e9;let t=ca();i==="endless"&&(g.endlessOrder=$p.slice().sort(()=>Math.random()-.5),g.endlessOrder.unshift("farm")),Fm();let n=Wr(0);g.themeIdx=n,pd(n);let s=ee.hero;if(g.chapter&&g.chapter.hero&&(s=g.chapter.hero),!ee.owned[s]&&!(g.chapter&&g.chapter.hero)&&(s="oblachko"),vM(s),g.hero.root.position.set(0,0,0),g.hero.root.rotation.y=0,g.chapter&&g.chapter.chase&&(g.npc=bc(g.chapter.chase),g.npc.root.position.set(0,0,-16),g.npc.lane=0,g.npc.x=0,$n.add(g.npc.root)),g.chapter){let r=g.chapter.items;for(let o=0;o<r;o++){let a=r===1?g.len-70:130+(g.len-230)*o/(r-1);Ne.itemPlan.push(-a)}}if(Um(),i==="story"){let r=la("finish_arch");r.position.set(0,0,-g.len);let o=rm(g.chapter.finale?"\u041F\u0420\u0410\u0417\u0414\u041D\u0418\u041A!":"\u0424\u0418\u041D\u0418\u0428",g.chapter.title,"#2f8f8a");r.traverse(l=>{l.isMesh&&l.material.name==="banner"&&(l.userData.own||(l.material=l.material.clone(),l.userData.own=!0),l.material.map&&l.material.map.dispose(),l.material.map=o,l.material.color.set("#ffffff"),l.material.needsUpdate=!0)}),g.finishObj=r,es.map(l=>l.id).filter(l=>l!==s).forEach((l,c)=>{let h=bc(l);h.root.position.set(c?4:-4,0,-g.len-2),h.root.rotation.y=Math.PI+(c?.4:-.4),$n.add(h.root),g.friends.push(h)})}g.speed=0,g.baseSpeed=i==="story"?g.chapter.speed*t.speed:15*t.speed,g.coins=0,g.items=0,g.itemsPlaced=0,g.hits=0,g.coinStreak=0,g.time=0,g.lineShown=0,g.revived=!1,g.maxLives=t.lives,g.lives=t.lives,ee.boosts.extraLife>0&&(ee.boosts.extraLife--,g.lives++,g.maxLives++,jn("\u0417\u0430\u043F\u0430\u0441\u043D\u043E\u0435 \u0441\u0435\u0440\u0434\u0435\u0447\u043A\u043E: +1 \u0436\u0438\u0437\u043D\u044C")),g.inv=0,g.slideT=0,g.jumpBuf=0,g.slideBuf=0,g.grounded=!0;for(let r in g.pw)g.pw[r]=0;ee.boosts.startShield>0&&(ee.boosts.startShield--,od("shield",!0)),ee.boosts.startMagnet>0&&(ee.boosts.startMagnet--,od("magnet",!0)),qt(),ee.runs++,on(null),te("hud").classList.remove("hidden"),te("topbar").classList.add("hidden"),te("touchBtns").classList.toggle("hidden",!ee.set.buttons),te("hudProgress").classList.toggle("hidden",i!=="story"),te("hudScore").classList.toggle("hidden",i==="story"),te("hudItemsChip").classList.toggle("hidden",i!=="story"),g.chapter&&(te("hudItemIco").textContent=ks[g.chapter.item].icon,te("hudTitle").textContent=g.ch+1+". "+g.chapter.title),te("hudChase").style.display=g.npc?"block":"none",te("hudBest").textContent=ee.best,Cc(),_d(),Vm(),Ic(),we.playMusic(kn[n].music),g.state="count",g.countT=2.4,wc=!0}function od(i,e){let t=Gu.find(s=>s.id===i),n=t.base+t.step*(ee.up[i]||0);g.pw[i]=n,g.pwMax[i]=n,i==="shield"&&(g.hero.bubble.visible=!0),e||we.play("power",{vol:.8}),Ic()}function ed(i){if(!(g.inv>0)){if(g.pw.shield>0){g.pw.shield=0,g.hero.bubble.visible=!1,g.inv=1,we.play("shieldbreak",{vol:.9}),Bi(g.px,g.py+.9,g.pz,"#8fdcff",24,4,3,.6),i&&Sm(i),Ic();return}g.lives--,g.hits++,g.hitLog&&g.hitLog.push((i?i.name+":"+i.kind+(i.move?":mov":"")+"@"+Math.round(g.startZ-g.pz):"none")+" lane"+g.lane+" ["+Tn.filter(e=>!e.dead&&e.t==="ob"&&Math.abs(e.z-g.pz)<22).map(e=>e.lane+":"+e.kind[0]+":"+Math.round(e.z-g.pz)).join(",")+"]"),g.inv=1.6,g.hero.blink=1.6,g.shake=.5,we.play("hit",{vol:1}),we.play("bleat",{vol:.5,rate:Fe(.95,1.08)}),te("flash").style.opacity=1,setTimeout(()=>te("flash").style.opacity=0,220),Bm(60),g.speed*=.55,i&&Sm(i),Bi(g.px,g.py+.8,g.pz-.5,"#ffffff",14,3,3,.5),Cc(),g.lives<=0&&wM()}}function Sm(i){if(i.kind==="platform"){i.hit=!0;return}i.hit=!0,i.knock={vx:(i.x-g.px>=0?1:-1)*Fe(4,7)+(i.x===g.px?os([-5,5]):0),vy:Fe(5,7),vz:-Fe(2,5),vr:Fe(-6,6),t:0}}function Bm(i){if(ee.set.vibro)try{Ac?fm.impact({style:is.Medium}).catch(()=>{}):navigator.vibrate&&navigator.vibrate(i)}catch{}}function cs(i){if(g.state==="run")if(i==="left"||i==="right"){let e=rn(g.lane+(i==="left"?-1:1),-1,1);e!==g.lane?(g.lane=e,we.play("swipe",{vol:.35,pan:g.lane*.4})):g.shake=.12}else i==="jump"?g.jumpBuf=.18:i==="slide"&&(g.slideBuf=.22,g.grounded||(g.vy=Math.min(g.vy,-16)))}var Oi=null;Rm.addEventListener("pointerdown",i=>{we.unlock(),Oi={x:i.clientX,y:i.clientY,used:!1,id:i.pointerId}});window.addEventListener("pointermove",i=>{if(!Oi||Oi.used||i.pointerId!==Oi.id)return;let e=i.clientX-Oi.x,t=i.clientY-Oi.y,n=Math.max(22,Math.min(window.innerWidth,window.innerHeight)*.045);(Math.abs(e)>n||Math.abs(t)>n)&&(Oi.used=!0,Math.abs(e)>Math.abs(t)?cs(e>0?"right":"left"):cs(t<0?"jump":"slide"))});window.addEventListener("pointerup",()=>Oi=null);window.addEventListener("pointercancel",()=>Oi=null);window.addEventListener("keydown",i=>{let e=i.code;["ArrowLeft","KeyA"].includes(e)?cs("left"):["ArrowRight","KeyD"].includes(e)?cs("right"):["ArrowUp","KeyW","Space"].includes(e)?cs("jump"):["ArrowDown","KeyS"].includes(e)?cs("slide"):(e==="Escape"||e==="KeyP")&&(g.state==="run"?Yr():bd()),(e==="Space"||e.startsWith("Arrow"))&&i.preventDefault()});document.querySelectorAll("#touchBtns button").forEach(i=>i.addEventListener("pointerdown",e=>{e.stopPropagation(),cs(i.dataset.act)}));function bm(i,e){let t=0;for(let n of Tn){if(n.dead||n.kind!=="platform"&&n.kind!=="ramp"||Math.abs(i-n.x)>n.hx+.1)continue;let s=n.z+n.z0,r=n.z+n.z1;e<s-.2||e>r+.2||(n.kind==="platform"?t=Math.max(t,n.top):t=Math.max(t,n.top*rn((r-e)/(r-s),0,1)))}return t}function ad(i){g.time+=i;let e=md(),t=g.mode==="endless"?Math.min(g.baseSpeed+e/140,27*ca().speed):g.baseSpeed*(1+rn(e/g.len,0,1)*.12);g.speed=xt(g.speed,t,g.speed<t*.8?1.6:.8,i),g.pz-=g.speed*i,g.px=xt(g.px,g.lane*Ot,13,i);let n=bm(g.px,g.pz);g.jumpBuf>0&&(g.jumpBuf-=i),g.slideBuf>0&&(g.slideBuf-=i),g.grounded?g.coyote=.12:g.coyote-=i,g.jumpBuf>0&&g.coyote>0&&(g.vy=g.pw.boots>0?12.6:9.6,g.grounded=!1,g.coyote=0,g.jumpBuf=0,g.slideT=0,we.play("jump",{vol:.55,rate:g.pw.boots>0?.9:1})),g.grounded&&(n<g.py-.08?(g.grounded=!1,g.vy=0):g.py=n),g.grounded||(g.vy-=28*i,g.py+=g.vy*i,g.py<=n&&g.vy<=0&&(g.py=n,g.vy=0,g.grounded=!0,we.play("land",{vol:.35}),Bi(g.px,g.py+.05,g.pz,sd.th.night?"#8d86a8":"#e8dcc0",6,1.5,.8,.35,3))),g.slideBuf>0&&g.grounded&&(g.slideT=.62,g.slideBuf=0,we.play("slide",{vol:.5})),g.slideT>0&&(g.slideT-=i),g.inv>0&&(g.inv-=i);for(let h in g.pw)g.pw[h]>0&&(g.pw[h]-=i,g.pw[h]<=0&&(g.pw[h]=0,h==="shield"&&(g.hero.bubble.visible=!1),Ic()));let s=g.hero;s.root.position.set(g.px,g.py,g.pz),s.root.rotation.y=xt(s.root.rotation.y,-(g.lane*Ot-g.px)*.12,10,i),s.root.rotation.z=xt(s.root.rotation.z,(g.lane*Ot-g.px)*.05,10,i);let r=g.grounded?g.slideT>0?"slide":"run":g.vy>0?"jump":"fall";Fi(s,i,r,g.speed),g.pw.shield>0&&g.pw.shield<2&&(s.bubble.visible=Math.floor(g.pw.shield*8)%2===0),g.grounded&&g.slideT<=0&&(g.stepT=(g.stepT||0)-i,g.stepT<=0&&(g.stepT=.3,we.play("step",{vol:.12,rate:Fe(.9,1.1)})));let o=g.slideT>0&&g.grounded,a=g.py+(o?.78:1.3),l=g.py;for(let h of Tn)if(!h.dead)if(h.t==="ob"){if(h.move){h.z+=h.move*i,h.obj.position.z=h.z;for(let f of Xt.list)f.alive&&Math.abs(f.x-h.x)<1&&f.z>h.z+h.z0-.5&&f.z<h.z+h.z1+.5&&qs(f);h.name==="ghost"&&(h.obj.position.y=.25+Math.sin(g.time*3+h.x)*.15)}if(h.knock){let f=h.knock;if(f.t+=i,f.vy-=20*i,h.obj.position.x+=f.vx*i,h.obj.position.y=Math.max(-2,h.obj.position.y+f.vy*i),h.obj.position.z+=f.vz*i,h.obj.rotation.z+=f.vr*i,h.obj.rotation.x+=f.vr*.5*i,f.t>1.4){Xs(h);continue}}if(h.z+h.z0>g.pz+25){Xs(h);continue}if(h.hit||Math.abs(h.x-g.px)>h.hx+.32)continue;let u=h.z+h.z0,d=h.z+h.z1;if(g.pz-.45>d||g.pz+.45<u)continue;h.kind==="jump"||h.kind==="block"?l<h.top-.08&&ed(h):h.kind==="slide"?a>h.low&&l<h.top-.1&&ed(h):h.kind==="platform"&&l<h.top-.45&&(ed(h),g.lives>0&&(g.py=h.top,g.vy=0,g.grounded=!0))}else{if(h.obj.rotation.y+=i*2.4,h.obj.position.y=h.base+Math.sin(g.time*3+h.z)*.12,g.pw.magnet>0&&h.t==="item"&&Math.abs(h.z-g.pz)<10&&(h.x=xt(h.x,g.px,6,i),h.obj.position.x=h.x),h.z>g.pz+15){Xs(h);continue}Math.abs(h.z-g.pz)<1&&Math.abs(h.x-g.px)<1&&Math.abs(h.obj.position.y-(g.py+.7))<1.4&&SM(h)}if(g.npc){let h=g.npc,u=rn(e/g.len,0,1),d=hd(22,2.5,Math.pow(u,1.3)),f=g.pz-d,_=p=>Pm(p,f-4,5);if(_(h.lane)){let p=[-1,0,1].filter(m=>!_(m));p.length&&(h.lane=p.sort((m,S)=>Math.abs(m-h.lane)-Math.abs(S-h.lane))[0])}h.x=xt(h.x,h.lane*Ot,8,i);let v=Math.abs(Math.sin(g.time*5.5))*.25;h.root.position.set(h.x,bm(h.x,f)+v,f),Fi(h,i,"run",g.speed),te("hudChase").style.left=rn((e+d)/g.len*100,0,100)+"%",Math.random()<i*.5&&Bi(h.x,1.2,f,"#ffd75e",3,1,1.5,.6,1)}for(let h of g.friends)Fi(h,i,"cheer");for(let h=ki.length-1;h>=0;h--){let u=ki[h];if(u.position.z>g.pz+30)Ws(u),ki.splice(h,1);else if(u.userData.pname==="windmill"){let d=u.children.find(f=>/blades/.test(f.name));d&&(d.rotation.z+=i*.8)}else u.userData.pname==="ghost"&&(u.position.y=.3+Math.sin(g.time*2+u.position.z)*.3)}let c=Wr(e);c!==g.themeIdx&&MM(c),g.mode==="story"?(g.lineShown<2&&e>g.len*(g.lineShown?.68:.34)&&(jn(g.chapter.lines[g.lineShown]),g.lineShown++),e>=g.len&&bM()):e>100&&Math.floor(e/500)>Math.floor((e-g.speed*i)/500)&&jn(Math.floor(e/500)*500+" \u043C! \u0422\u0430\u043A \u0434\u0435\u0440\u0436\u0430\u0442\u044C!"),Um(),RM(e)}function MM(i){g.themeIdx=i,te("fade").style.opacity=.85,setTimeout(()=>{pd(i),te("fade").style.opacity=0,CM(kn[i].name,g.mode==="story"?"\u041D\u041E\u0412\u041E\u0415 \u041C\u0415\u0421\u0422\u041E":"\u0421\u041B\u0415\u0414\u0423\u042E\u0429\u0418\u0419 \u0423\u0427\u0410\u0421\u0422\u041E\u041A"),we.playMusic(kn[i].music)},330)}function SM(i){if(Xs(i),i.t==="item"){g.items++,we.play("item",{vol:.9}),Bi(i.x,1.2,i.z,"#fff0a0",26,3,4,.9,3),Vm();let e=g.chapter.items;jn(e===1?"\u041D\u0430\u0448\u0451\u043B\u0441\u044F "+(g.chapter.itemName||ks[i.name].name)+"!":ks[i.name].icon+" "+g.items+" \u0438\u0437 "+e)}else i.name==="heart"?(g.lives<g.maxLives&&g.lives++,we.play("heart",{vol:.9}),Bi(i.x,1.2,i.z,"#ff8a8a",16,2,3,.7,2),Cc()):(od(i.name),Bi(i.x,1.2,i.z,"#bff0ff",20,2.5,3,.7,2),jn({magnet:"\u{1F9F2} \u041C\u0430\u0433\u043D\u0438\u0442!",shield:"\u{1F6E1}\uFE0F \u0429\u0438\u0442!",x2:"\xD72 \u0414\u0432\u043E\u0439\u043D\u044B\u0435 \u043C\u043E\u043D\u0435\u0442\u044B!",boots:"\u{1F45F} \u041F\u0440\u044B\u0433\u0443\u0447\u0438\u0435 \u043A\u043E\u043F\u044B\u0442\u0446\u0430!"}[i.name]))}function bM(){g.state="finish",g.finT=0,we.duck(!0),we.play("victory",{vol:.9}),setTimeout(()=>we.play("bleat",{vol:.6,rate:1.1}),600);for(let i=0;i<6;i++)setTimeout(()=>{for(let e of["#ff6b6b","#ffd36b","#6bc8ff","#7cc46a","#ff9be0"])Bi(g.px+Fe(-4,4),Fe(4,6),g.pz-Fe(2,8),e,8,3,2,1.6,4)},i*180)}function km(i){g.finT+=i,g.speed=xt(g.speed,0,2.5,i),g.pz-=g.speed*i,g.px=xt(g.px,0,3,i),g.py=xt(g.py,0,6,i),g.hero.root.position.set(g.px,g.py,g.pz),g.hero.root.rotation.y=xt(g.hero.root.rotation.y,g.finT>1?Math.PI:0,3,i),Fi(g.hero,i,g.speed>3?"run":"cheer",g.speed);for(let e of g.friends)Fi(e,i,"cheer");g.npc&&(g.npc.root.position.z=xt(g.npc.root.position.z,g.pz-2,3,i),Fi(g.npc,i,"cheer")),g.finT>2.2&&!g.resultShown&&(g.resultShown=!0,TM())}function zm(){ee.coins+=g.coins,ee.totalCoins+=g.coins}function TM(){let i=g.chapter,e=g.ch;zm();let t=[!0];for(let l of i.q)l.t==="coins"?t.push(g.coins>=l.n):l.t==="items"?t.push(g.items>=i.items):l.t==="nohit"&&t.push(g.hits===0);let n=t.filter(Boolean).length,r=!ee.done[e]?i.reward:0,o=ee.stars[e];n===3&&o<3&&(r+=50),ee.coins+=r,ee.done[e]=!0,ee.stars[e]=Math.max(o,n),ee.unlocked=Math.max(ee.unlocked,Math.min(sn.length,e+2)),qt();let a=e===sn.length-1;vd({kicker:"\u0413\u041B\u0410\u0412\u0410 "+(e+1)+" \u041F\u0420\u041E\u0419\u0414\u0415\u041D\u0410",title:i.finale?"\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0439 \u0433\u0435\u0440\u043E\u0439 \u2014 \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0441\u0435\u0440\u0434\u0446\u0435!":"\u041F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C!",text:i.ending,stars:n,summary:[["\u041C\u043E\u043D\u0435\u0442\u044B","+"+g.coins],["\u041D\u0430\u0433\u0440\u0430\u0434\u0430",r?"+"+r:"\u2014"],[ks[i.item].icon+" \u041D\u0430\u0439\u0434\u0435\u043D\u043E",g.items+"/"+i.items],["\u0423\u0434\u0430\u0440\u044B",g.hits]],quests:gd(i,t),buttons:[a?["\u0412\u0441\u0435 \u0433\u043B\u0430\u0432\u044B","primary",()=>yd()]:["\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u0433\u043B\u0430\u0432\u0430 \u2197","primary",()=>Ys(e+1)],["\u0415\u0449\u0451 \u0440\u0430\u0437","",()=>Ys(e)],["\u0412 \u043C\u0435\u043D\u044E","ghost",()=>us()]]}),we.duck(!1),setTimeout(()=>n>=1&&we.play("star",{vol:.6}),300),setTimeout(()=>n>=2&&we.play("star",{vol:.6,rate:1.12}),550),setTimeout(()=>n>=3&&we.play("star",{vol:.6,rate:1.25}),800)}function gd(i,e){let t=[["\u0414\u043E\u0431\u0435\u0436\u0430\u0442\u044C \u0434\u043E \u0444\u0438\u043D\u0438\u0448\u0430",e?e[0]:!1]];return i.q.forEach((n,s)=>{let r=e?e[s+1]:!1;n.t==="coins"?t.push(["\u0421\u043E\u0431\u0440\u0430\u0442\u044C "+n.n+" \u043C\u043E\u043D\u0435\u0442",r]):n.t==="items"?t.push([i.items===1?"\u041D\u0430\u0439\u0442\u0438 "+(i.itemName||ks[i.item].name):"\u0421\u043E\u0431\u0440\u0430\u0442\u044C \u0432\u0441\u0435 "+(i.itemName||ks[i.item].name)+" ("+i.items+")",r]):t.push(["\u041F\u0440\u043E\u0439\u0442\u0438 \u0431\u0435\u0437 \u0435\u0434\u0438\u043D\u043E\u0433\u043E \u0443\u0434\u0430\u0440\u0430",r])}),t}function wM(){g.state="fail",we.duck(!0),setTimeout(()=>{we.play("fail",{vol:.8});let i=!g.revived&&ee.coins+g.coins>=100,e=[];i&&e.push(["\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0437\u0430 100 \u043C\u043E\u043D\u0435\u0442","primary",()=>EM()]),g.mode==="story"?e.push(["\u041D\u0430\u0447\u0430\u0442\u044C \u0433\u043B\u0430\u0432\u0443 \u0437\u0430\u043D\u043E\u0432\u043E",i?"":"primary",()=>{Xr(),Ys(g.ch)}]):e.push(["\u0415\u0449\u0451 \u0437\u0430\u0431\u0435\u0433",i?"":"primary",()=>{Xr(),Rc("endless")}]),e.push(["\u0412 \u043C\u0435\u043D\u044E","ghost",()=>{Xr(),us()}]);let t=Math.floor(md()),n=g.mode==="story"?(es.find(s=>s.id===g.hero.id)||es[0]).name+" \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u0443\u0441\u0442\u0430\u043B"+(g.hero.id==="bella"?"\u0430":"")+", \u043D\u043E \u043D\u0435 \u0441\u0434\u0430\u0451\u0442\u0441\u044F. \u041C\u043E\u043D\u0435\u0442\u044B, \u0441\u043E\u0431\u0440\u0430\u043D\u043D\u044B\u0435 \u0432 \u0437\u0430\u0431\u0435\u0433\u0435, \u043E\u0441\u0442\u0430\u043D\u0443\u0442\u0441\u044F \u0443 \u0442\u0435\u0431\u044F.":"\u0417\u0430\u0431\u0435\u0433 \u043E\u043A\u043E\u043D\u0447\u0435\u043D. \u041E\u0442\u043B\u0438\u0447\u043D\u0430\u044F \u043F\u0440\u043E\u0431\u0435\u0436\u043A\u0430!";g.mode==="endless"&&t>ee.best&&(n="\u041D\u043E\u0432\u044B\u0439 \u0440\u0435\u043A\u043E\u0440\u0434: "+t+" \u043C! \u{1F389}"),vd({kicker:g.mode==="story"?"\u041F\u0415\u0420\u0415\u0414\u042B\u0428\u041A\u0410":"\u0421\u0412\u041E\u0411\u041E\u0414\u041D\u042B\u0419 \u0417\u0410\u0411\u0415\u0413",title:"\u041E\u0439! \u041A\u043E\u043D\u0447\u0438\u043B\u0438\u0441\u044C \u0441\u0435\u0440\u0434\u0435\u0447\u043A\u0438",text:n,summary:[["\u0414\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u044F",t+" \u043C"],["\u041C\u043E\u043D\u0435\u0442\u044B","+"+g.coins],["\u0420\u0435\u043A\u043E\u0440\u0434",Math.max(ee.best,t)+" \u043C"]],buttons:e})},650)}function Xr(){g.banked||(g.banked=!0,zm(),g.mode==="endless"&&(ee.best=Math.max(ee.best,Math.floor(md()))),qt())}function EM(){let i=Math.min(g.coins,100);g.coins-=i,ee.coins-=100-i,qt(),g.revived=!0,g.lives=1,g.inv=2.5,g.hero.blink=2.5,g.hero.inner.rotation.z=0;for(let e of Tn)!e.dead&&e.t==="ob"&&e.z>g.pz-30&&Xs(e);on(null),te("hud").classList.remove("hidden"),we.duck(!1),Cc(),_d(),g.state="count",g.countT=1.6}function Yr(){if(g.state!=="run")return;g.state="pause",we.duck(!0);let i=[["\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C","primary",()=>Hm()]];g.mode==="story"&&i.push(["\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043D\u043E\u0432\u043E","",()=>{Xr(),Ys(g.ch)}]),i.push(["\u0412 \u043C\u0435\u043D\u044E","ghost",()=>{Xr(),us()}]),vd({kicker:"\u041F\u0410\u0423\u0417\u0410",title:"\u041F\u0435\u0440\u0435\u0434\u044B\u0448\u043A\u0430",text:g.mode==="story"?g.chapter.goal:"\u0417\u0430\u0431\u0435\u0433 \u0436\u0434\u0451\u0442 \u0442\u0435\u0431\u044F.",quests:g.mode==="story"?gd(g.chapter,null).map((e,t)=>[e[0],t===0?!1:g.chapter.q[t-1].t==="coins"?g.coins>=g.chapter.q[t-1].n:g.chapter.q[t-1].t==="items"?g.items>=g.chapter.items:g.hits===0]):null,buttons:i})}function Hm(){on(null),te("hud").classList.remove("hidden"),we.duck(!1),g.state="count",g.countT=1.2}var ls=null;function Gm(i){Om(),g.hero&&($n.remove(g.hero.root),g.hero=null),g.mode="menu",g.chapter=sn[0],g.len=1e9,Fm(),g.endlessOrder=["festival"],g.mode="endless",pd("festival"),Ne.rowZ=-1e9,Ne.done=!0,Dm(-150),g.mode="menu";for(let e=ki.length-1;e>=0;e--){let t=ki[e];Math.abs(t.position.x)<7&&t.position.z>-12&&(Ws(t),ki.splice(e,1))}for(let[e,t,n,s]of[["flowers",-2.5,-3,.4],["bush_a",3.4,-6,1],["hay",-4.5,-9,.3],["fence",5.5,-2,Math.PI/2],["tree_b",-6.5,-12,0]])Zn(e,t,n,s);Zr(i||ee.hero),we.playMusic("menu"),wc=!0}function Zr(i){ls&&$n.remove(ls.root),ls=bc(i),ls.root.rotation.y=Math.PI*.82,$n.add(ls.root)}var wc=!0,ss=new O,rs=new O;function AM(i){let e=window.innerHeight>window.innerWidth,t,n;if(g.state==="menu"||g.mode==="menu"){let s=performance.now()/1e3,r=!e,o=0;t=new O(r?-1.4:.7,r?1.55:1.75,r?4.3:4.6),n=new O(r?-1.65:.15,r?.85:-.95,0),t.x+=Math.sin(s*.25)*.25,ls&&(ls.root.rotation.y=Math.PI*.82+Math.sin(s*.4)*.25,Fi(ls,i,"idle"))}else{let s=e?7.2:5.3,r=e?4.4:3,o=e?9:10,a=g.state==="finish"?Math.min(1,g.finT/2):0;t=new O(g.px*.6,r+g.py*.6-a*1.5,g.pz+s-a*1.5),n=new O(g.px*.8,1.1+g.py*.65,g.pz-o*(1-a*.85)),g.shake>0&&(g.shake-=i,t.x+=Fe(-1,1)*g.shake*.4,t.y+=Fe(-1,1)*g.shake*.3)}wc?(ss.copy(t),rs.copy(n),wc=!1):(ss.x=xt(ss.x,t.x,6,i),ss.y=xt(ss.y,t.y,6,i),ss.z=xt(ss.z,t.z,14,i),rs.x=xt(rs.x,n.x,6,i),rs.y=xt(rs.y,n.y,6,i),rs.z=xt(rs.z,n.z,14,i)),Jn.position.copy(ss),Jn.lookAt(rs)}function Cc(){te("lives").innerHTML=Array.from({length:g.maxLives},(i,e)=>'<span class="'+(e<g.lives?"":"off")+'">\u2665</span>').join("")}function _d(){te("hudCoins").textContent=g.coins}function Vm(){g.chapter&&(te("hudItems").textContent=g.items+"/"+g.chapter.items)}function Ic(){let i={magnet:"\u{1F9F2}",shield:"\u{1F6E1}\uFE0F",x2:"<b>\xD72</b>",boots:"\u{1F45F}"};te("powers").innerHTML=Object.keys(g.pw).filter(e=>g.pw[e]>0).map(e=>'<div class="power" data-k="'+e+'"><span>'+i[e]+'</span><i style="--p:100%"></i></div>').join("")}var td=0;function RM(i){td-=1,!(td>0)&&(td=4,g.mode==="story"?(te("hudLeft").textContent=Math.max(0,Math.ceil(g.len-i))+" \u043C",te("hudBar").style.width=rn(i/g.len*100,0,100)+"%"):te("hudDist").textContent=Math.floor(i),document.querySelectorAll("#powers .power").forEach(e=>{let t=e.dataset.k;e.querySelector("i").style.setProperty("--p",rn(g.pw[t]/(g.pwMax[t]||1)*100,0,100)+"%")}))}var Tm=null;function jn(i){let e=te("toast");e.textContent=i,e.classList.add("show"),clearTimeout(Tm),Tm=setTimeout(()=>e.classList.remove("show"),2400)}function CM(i,e){te("bannerText").textContent=i,te("bannerSub").textContent=e||"",te("banner").classList.add("show"),setTimeout(()=>te("banner").classList.remove("show"),1900)}var IM=["loading","device","orient","menu","chapters","story","modal","shop","heroes","settings"],Gs=null,Mc=null;function on(i){for(let t of IM)te(t).classList.toggle("show",t===i);i!=="settings"&&(Mc=Gs),Gs=i;let e=["menu","chapters","shop","heroes"].includes(i);te("topbar").classList.toggle("hidden",!e),e&&(te("coinTotal").textContent=ee.coins),i&&i!=="modal"&&i!=="settings"&&te("hud").classList.add("hidden")}function us(){g.state="menu",te("hud").classList.add("hidden"),we.duck(!1),Gm(),ha(),on("menu")}function xd(){let i=ee.done.findIndex(e=>!e);return i===-1?sn.length-1:Math.min(i,ee.unlocked-1)}function ha(){let i=xd(),e=sn[i],t=ee.done.filter(Boolean).length;te("contAct").textContent="\u0418\u0441\u0442\u043E\u0440\u0438\u044F "+(e.act+1)+" \xB7 "+Hu[e.act].title,te("contTitle").textContent=e.title,te("contDetail").textContent="\u0413\u043B\u0430\u0432\u0430 "+(i+1)+" \u0438\u0437 "+sn.length+(ee.done[i]?" \xB7 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430":""),te("btnContinue").textContent=t===0?"\u041D\u0430\u0447\u0430\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E \u2197":t===sn.length?"\u041F\u0435\u0440\u0435\u0438\u0433\u0440\u0430\u0442\u044C \u0433\u043B\u0430\u0432\u0443 \u2197":"\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u2197",te("sagaCount").textContent=t+" / "+sn.length,te("sagaBar").style.width=t/sn.length*100+"%",te("starCount").textContent=ee.stars.reduce((n,s)=>n+s,0)+"\u2605",te("heroTagName").textContent=es.find(n=>n.id===ee.hero).name,te("coinTotal").textContent=ee.coins}var PM=["#d87945","#458497","#7c6fc2","#c2604a"];function yd(){g.state!=="menu"&&us();let i="";Hu.forEach((t,n)=>{i+='<div class="actTitle">\u0418\u0441\u0442\u043E\u0440\u0438\u044F '+(n+1)+" \xB7 "+t.title+'</div><p class="actCopy">'+t.copy+'</p><div class="chapterGrid">',sn.forEach((s,r)=>{if(s.act!==n)return;let o=r>=ee.unlocked,a=ee.stars[r],l=r===xd()&&!ee.done[r];i+='<button class="chapterCard '+(o?"locked ":"")+(l?"next":"")+'" data-ch="'+r+'" style="--c:'+PM[n]+'" '+(o?"disabled":"")+'><span class="num">'+(o?"\u{1F512}":r+1)+"</span><span><b>"+s.title+"</b><small>"+kn[s.themes[0]].name+(s.themes[1]?" \u2192 "+kn[s.themes[1]].name:"")+" \xB7 "+s.len+' \u043C</small><br><span class="st">'+"\u2605".repeat(a)+'<span style="color:#ddd6c3">'+"\u2605".repeat(3-a)+"</span></span></span></button>"}),i+="</div>"}),te("chapterList").innerHTML=i,on("chapters");let e=te("chapterList").querySelector(".next");e&&e.scrollIntoView({block:"center"})}te("chapterList").addEventListener("click",i=>{let e=i.target.closest("[data-ch]");e&&!e.disabled&&(we.play("click"),Ys(+e.dataset.ch))});function Ys(i){g.state!=="menu"&&(Xr(),us()),g.banked=!1,g.resultShown=!1;let e=sn[i];g.pendingCh=i,te("storyKicker").textContent="\u0413\u041B\u0410\u0412\u0410 "+(i+1)+" / "+sn.length+" \xB7 "+kn[e.themes[0]].name.toUpperCase(),te("storyTitle").textContent=e.title,te("storyText").textContent=e.intro,te("storyGoal").textContent=e.goal;let t=gd(e,null),n=ee.stars[i];te("storyQuests").innerHTML=t.map((s,r)=>'<div><i class="'+(r<n?"on":"")+'">\u2605</i>'+s[0]+"</div>").join("")+(e.hero?'<div class="muted small">\u0413\u0435\u0440\u043E\u0439 \u0433\u043B\u0430\u0432\u044B: '+es.find(s=>s.id===e.hero).name+"</div>":""),e.hero?Zr(e.hero):Zr(ee.hero),on("story")}te("storyGo").onclick=()=>{we.play("click"),g.banked=!1,g.resultShown=!1,Rc("story",g.pendingCh)};te("storyBack").onclick=()=>{we.play("click"),Zr(ee.hero),yd()};function vd({kicker:i,title:e,text:t,stars:n,summary:s,buttons:r,quests:o}){te("toast").classList.remove("show"),te("modalKicker").textContent=i||"",te("modalTitle").textContent=e||"",te("modalText").textContent=t||"";let a=te("modalStars");n!==void 0?(a.classList.remove("hidden"),[...a.children].forEach((u,d)=>{u.classList.remove("on"),d<n&&setTimeout(()=>u.classList.add("on"),50)})):a.classList.add("hidden");let l=s?s.map(u=>"<div><small>"+u[0]+"</small><b>"+u[1]+"</b></div>").join(""):"";te("modalSummary").innerHTML=l,o&&te("modalSummary").insertAdjacentHTML("afterend","");let c=o?'<div class="quests">'+o.map(u=>'<div><i class="'+(u[1]?"on":"")+'">\u2605</i>'+u[0]+"</div>").join("")+"</div>":"";te("modalText").innerHTML=(t||"")+c;let h=te("modalBtns");h.innerHTML="";for(let[u,d,f]of r){let _=document.createElement("button");_.className="btn "+d,_.textContent=u,_.onclick=()=>{we.play("click"),f()},h.appendChild(_)}on("modal")}var ld="upgrades";function Md(){te("coinTotal").textContent=ee.coins,document.querySelectorAll("#shop .tabs button").forEach(e=>e.classList.toggle("on",e.dataset.tab===ld));let i="";if(ld==="upgrades")for(let e of Gu){let t=ee.up[e.id]||0,n=t>=jo.length,s=jo[t];i+='<div class="card"><span class="ico">'+e.icon+"</span><b>"+e.name+"</b><small>"+e.desc+" \xB7 "+(e.base+e.step*t).toFixed(1).replace(".0","")+' \u0441</small><div class="lvl">'+jo.map((r,o)=>'<i class="'+(o<t?"on":"")+'"></i>').join("")+'</div><button class="btn '+(n?"":"primary")+'" data-up="'+e.id+'" '+(n||ee.coins<s?"disabled":"")+">"+(n?"\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C":'<span class="coinIco s"></span> '+s)+"</button></div>"}else for(let e of Vu)i+='<div class="card"><span class="ico">'+e.icon+"</span><b>"+e.name+"</b><small>"+e.desc+"</small><small>\u0412 \u0437\u0430\u043F\u0430\u0441\u0435: <b>"+(ee.boosts[e.id]||0)+'</b></small><button class="btn primary" data-boost="'+e.id+'" '+(ee.coins<e.price?"disabled":"")+'><span class="coinIco s"></span> '+e.price+"</button></div>";te("shopList").innerHTML=i}te("shopList").addEventListener("click",i=>{let e=i.target.closest("button");if(!(!e||e.disabled)){if(e.dataset.up){let t=e.dataset.up,n=ee.up[t]||0,s=jo[n];ee.coins>=s&&(ee.coins-=s,ee.up[t]=n+1,we.play("power"))}if(e.dataset.boost){let t=Vu.find(n=>n.id===e.dataset.boost);ee.coins>=t.price&&(ee.coins-=t.price,ee.boosts[t.id]=(ee.boosts[t.id]||0)+1,we.play("coin"))}qt(),Md()}});document.querySelectorAll("#shop .tabs button").forEach(i=>i.onclick=()=>{ld=i.dataset.tab,we.play("click"),Md()});var Ec=null;function cd(){te("coinTotal").textContent=ee.coins,te("heroList").innerHTML=es.map(i=>{let e=ee.owned[i.id],t=ee.hero===i.id,n=Ec===i.id,s=t?"\u0412\u044B\u0431\u0440\u0430\u043D":e?"\u0412\u044B\u0431\u0440\u0430\u0442\u044C":'<span class="coinIco s"></span> '+i.price;return'<button class="heroCard '+(n?"sel":"")+'" data-hero="'+i.id+'" style="--c:'+i.color+'"><span class="dot"></span><span><b>'+i.name+"</b><small>"+i.desc+'</small></span><span class="tag '+(e?"":"buy")+'">'+s+"</span></button>"}).join("")}te("heroList").addEventListener("click",i=>{let e=i.target.closest("[data-hero]");if(!e)return;let t=e.dataset.hero,n=es.find(s=>s.id===t);if(Ec!==t){Ec=t,Zr(t),we.play("bleat",{vol:.5,rate:t==="pugovka"?1.25:t==="bella"?1.12:1}),cd();return}ee.owned[t]?(ee.hero=t,we.play("click")):ee.coins>=n.price?(ee.coins-=n.price,ee.owned[t]=!0,ee.hero=t,we.play("power"),jn(n.name+" \u0442\u0435\u043F\u0435\u0440\u044C \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u0435!")):jn("\u041D\u0443\u0436\u043D\u043E \u0435\u0449\u0451 "+(n.price-ee.coins)+" \u043C\u043E\u043D\u0435\u0442"),qt(),cd(),ha()});function Kr(){te("setMusic").value=ee.set.music,te("setSfx").value=ee.set.sfx,te("setMuted").checked=ee.set.muted,te("setButtons").checked=ee.set.buttons,te("setVibro").checked=ee.set.vibro;for(let[i,e]of[["setDiff",ee.set.diff],["setQuality",ee.set.quality],["setDevice",ee.device],["setOrient",ee.set.orient||"auto"]])te(i).querySelectorAll("button").forEach(t=>t.classList.toggle("on",t.dataset.v===e));te("diffNote").textContent=fc[ee.set.diff].desc+". \u0414\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0441\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u0431\u0435\u0433\u0430."}te("setMusic").oninput=()=>{ee.set.music=+te("setMusic").value,we.applyVolumes()};te("setSfx").oninput=()=>{ee.set.sfx=+te("setSfx").value,we.applyVolumes()};te("setSfx").onchange=()=>{qt(),we.play("coin")};te("setMusic").onchange=qt;te("setMuted").onchange=()=>{ee.set.muted=te("setMuted").checked,we.applyVolumes(),qt()};te("setButtons").onchange=()=>{ee.set.buttons=te("setButtons").checked,qt()};te("setVibro").onchange=()=>{ee.set.vibro=te("setVibro").checked,qt(),ee.set.vibro&&Bm(40)};te("setDiff").onclick=i=>{let e=i.target.closest("button");e&&(ee.set.diff=e.dataset.v,qt(),Kr())};te("setQuality").onclick=i=>{let e=i.target.closest("button");e&&(ee.set.quality=e.dataset.v,qt(),ud(),Kr())};te("setDevice").onclick=i=>{let e=i.target.closest("button");e&&(Sd(e.dataset.v),Kr())};te("btnReset").onclick=()=>{if(!confirm("\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0435\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441, \u043C\u043E\u043D\u0435\u0442\u044B \u0438 \u043F\u043E\u043A\u0443\u043F\u043A\u0438?"))return;let i=ee.device;ee=nd(),ee.device=i,we.s=ee.set,qt(),ha(),Kr(),jn("\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0441\u0431\u0440\u043E\u0448\u0435\u043D")};function Sd(i){ee.device=i,qt(),document.body.classList.toggle("dev-tablet",i==="tablet"),document.body.classList.toggle("dev-phone",i!=="tablet"),ud()}function bd(){if(Gs==="settings"){on(Mc||"menu"),(Mc==="modal"||Mc===null)&&g.state==="pause"&&Yr();return}if(["chapters","shop","heroes","story"].includes(Gs)){(Gs==="heroes"||Gs==="story")&&Zr(ee.hero),on("menu"),ha();return}if(g.state==="run"){Yr();return}if(g.state==="pause"){Hm();return}Gs==="menu"&&Ac&&ta.exitApp()}document.querySelectorAll("[data-close]").forEach(i=>i.onclick=()=>{we.play("click"),bd()});te("btnContinue").onclick=()=>{we.unlock(),we.play("click"),Ys(xd())};te("btnChapters").onclick=()=>{we.play("click"),yd()};te("btnEndless").onclick=()=>{we.play("click"),g.banked=!1,Rc("endless")};te("btnShop").onclick=()=>{we.play("click"),Md(),on("shop")};te("btnHeroes").onclick=()=>{we.play("click"),Ec=ee.hero,cd(),on("heroes")};te("btnSettings").onclick=()=>{we.play("click"),Kr(),on("settings")};te("btnPause").addEventListener("pointerdown",i=>{i.stopPropagation(),Yr()});document.querySelectorAll(".deviceBtn").forEach(i=>i.onclick=()=>{we.unlock(),Sd(i.dataset.device),we.play("bleat",{vol:.6}),ee.tutorial||(ee.tutorial=!0,qt()),ee.set.orient?us():on("orient")});async function Pc(i=ee.set.orient){if(!i)return!1;if(Ac)try{return i==="auto"?await Qu.unlock():await Qu.lock({orientation:i}),!0}catch{return!1}try{let e=screen.orientation;return!e||!e.lock||!matchMedia("(pointer: coarse)").matches?!1:i==="auto"?(e.unlock(),!0):(!document.fullscreenElement&&document.documentElement.requestFullscreen&&await document.documentElement.requestFullscreen({navigationUI:"hide"}),await e.lock(i),!0)}catch{return!1}}function Wm(i){we.unlock(),we.play("click"),ee.set.orient=i,qt(),Pc(i).then(e=>{let t=window.innerHeight>window.innerWidth;i==="landscape"&&!e&&t&&setTimeout(()=>jn("\u041F\u043E\u0432\u0435\u0440\u043D\u0438\u0442\u0435 \u0442\u0435\u043B\u0435\u0444\u043E\u043D \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u043E \u21BB"),400)}),us()}te("orientLand").onclick=()=>Wm("landscape");te("orientPort").onclick=()=>Wm("portrait");te("setOrient").onclick=i=>{let e=i.target.closest("button");e&&(ee.set.orient=e.dataset.v,qt(),Pc(),Kr())};document.addEventListener("visibilitychange",()=>{document.hidden?((g.state==="run"||g.state==="count")&&(g.state="run",Yr()),we.suspend()):we.resume()});(function(){Ac&&(ta.addListener("backButton",()=>bd()),ta.addListener("pause",()=>{g.state==="run"&&Yr(),we.suspend()}),ta.addListener("resume",()=>{we.resume(),Pc()}))})();var wm=performance.now();function Xm(i){requestAnimationFrame(Xm);let e=Math.min(.05,(i-wm)/1e3);wm=i;let t=i/1e3;if(g.state==="run")ad(e);else if(g.state==="count"){g.countT-=e;let n=Math.ceil(g.countT/.6),s=g.countT>.6?String(n-1):"\u0412\u043F\u0435\u0440\u0451\u0434!",r=te("countdown");r.textContent!==s&&(r.textContent=s,g.countT>.6?we.play("beep",{vol:.5}):we.play("go",{vol:.6})),g.hero&&(g.hero.root.position.set(g.px,g.py,g.pz),Fi(g.hero,e,"idle")),g.npc&&Fi(g.npc,e,"idle"),g.countT<=0&&(r.textContent="",g.state="run",ee.runs<=2?jn("\u0421\u0432\u0430\u0439\u043F \u2190 \u2192 \u2014 \u043F\u043E\u043B\u043E\u0441\u044B, \u2191 \u2014 \u043F\u0440\u044B\u0436\u043E\u043A, \u2193 \u2014 \u043F\u043E\u0434\u043A\u0430\u0442"):g.mode==="story"&&jn(g.chapter.goal))}else g.state==="finish"?km(e):g.state==="fail"&&g.hero&&(g.hero.inner.rotation.z=xt(g.hero.inner.rotation.z,1.4,4,e),g.hero.inner.position.y=xt(g.hero.inner.position.y,.1,4,e));id(e,t),dM(e),AM(e),fM(e,t),fn.render(Jt,Jn)}(async function(){dd(),ud();try{await rM(e=>{te("loadBar").style.width=Math.round(e*92)+"%"})}catch(e){te("loadText").textContent="\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043C\u043E\u0434\u0435\u043B\u0438: "+e.message,console.error(e);return}te("loadBar").style.width="100%",oM(),g.state="menu",Gm(),ee.device&&Sd(ee.device),requestAnimationFrame(Xm),setTimeout(()=>{ee.device?ee.set.orient?(Pc(),ha(),on("menu")):on("orient"):on("device")},150),fn.compile(Jt,Jn),window.__game={sim:e=>{for(let t=0;t<e*60;t++)g.state==="count"?(g.countT-=1/60,g.countT<=0&&(g.state="run")):g.state==="run"?ad(1/60):g.state==="finish"&&km(1/60),id(1/60,t/60)},G:g,save:ee,startRun:Rc,toMenu:us,openStory:Ys,act:cs,ents:Tn,PROTO:qr,BOX:fd,coins:Xt,KIND:Tc,gen:Ne,coinFree:oa,step:ad,updateCoins:id}})();})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
