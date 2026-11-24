/* طبقة تخزين محلية: تعمل عمل claude.use("db") و claude.use("user") داخل المتصفح (localStorage).
   لاحقاً نستبدل هذا الملف بربط Supabase دون المساس بباقي التطبيق. */
(function(){
  var KEY='bistahel_db_v1',subs=[];
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
  function save(d){try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}}
  var mem=load();
  function snap(p){var ds=Object.keys(mem).filter(function(k){return k.indexOf(p+'/')===0&&k.slice(p.length+1).indexOf('/')<0;}).map(function(k){var v=mem[k];return {id:k.slice(p.length+1),data:function(){return JSON.parse(JSON.stringify(v));}};});return {docs:ds};}
  function fire(path){var p=path.slice(0,path.lastIndexOf('/'));subs.forEach(function(s){if(s.p===p)s.cb(snap(p));});}
  function docref(path){return {
    set:function(d){mem[path]=JSON.parse(JSON.stringify(d));save(mem);fire(path);return Promise.resolve();},
    delete:function(){delete mem[path];save(mem);fire(path);return Promise.resolve();}};}
  function coll(p){return {doc:function(id){return docref(p+'/'+id);},onSnapshot:function(cb){var s={p:p,cb:cb};subs.push(s);setTimeout(function(){cb(snap(p));},0);return function(){subs=subs.filter(function(x){return x!==s;});};}};}
  addEventListener('storage',function(e){if(e.key===KEY){mem=load();subs.forEach(function(s){s.cb(snap(s.p));});}});
  var uid=(function(){try{var u=localStorage.getItem('bistahel_uid');if(!u){u='u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);localStorage.setItem('bistahel_uid',u);}return u;}catch(e){return 'local';}})();
  var db={collection:coll,doc:docref};
  var user={id:function(){return Promise.resolve(uid);},me:function(){return Promise.resolve({name:'أنا'});},profiles:function(ids){var o={};ids.forEach(function(i){o[i]={name:i===uid?'أنا':'مستخدم'};});return Promise.resolve(o);},can:function(){return Promise.resolve(true);}};
  window.claude={use:function(n){return Promise.resolve(n==='db'?db:n==='user'?user:null);}};
})();
