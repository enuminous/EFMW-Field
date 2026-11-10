/* EFMW-Field Master Lab Explorer. One local catalog, zero external runtime dependencies. */
(function () {
  "use strict";
  var atlas = window.EFMW_LAB_CATALOG;
  var $ = function (id) { return document.getElementById(id); };
  var storageKey = "efmw-field-master-lab-saved-v1";
  var pageSize = 24;
  var state = { query: "", category: "all", access: "all", sort: "featured", limit: pageSize, favorites: new Set() };
  var current = [];
  var displayed = [];
  var reposByName = {};
  var catalogEntries = [];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
    });
  }
  function safeUrl(s) {
    if (typeof s !== "string" || !/^https:\/\/(github\.com|enuminous\.github\.io)\//.test(s)) return "#";
    return s;
  }
  function toast(message) {
    var el=$("toast");
    if (!el) return;
    el.textContent=message;
    el.hidden=false;
  }
  function readFavorites() {
    try {
      var raw=localStorage.getItem(storageKey);
      var parsed=raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) state.favorites=new Set(parsed.filter(function (x) {return typeof x==="string";}));
    } catch (e) { /* The catalog works without storage. */ }
  }
  function writeFavorites() {
    try {localStorage.setItem(storageKey,JSON.stringify(Array.from(state.favorites)));}
    catch (e) {toast("Bookmarks updated for this session. Local storage is unavailable.");}
  }
  function itemKey(e) {return e.kind==="subpage" ? "page:"+e.id : "repo:"+e.name;}
  function bestUrl(e) {return (e.access==="live" && e.site) ? e.site : e.repo;}
  function label(e) {
    if (e.kind==="subpage") return {text:"LAB VIEW",cls:"subpage"};
    if (e.access==="live") return {text:"LIVE PAGES",cls:"live"};
    if (e.access==="unavailable") return {text:"SOURCE / 404",cls:"unavailable"};
    return {text:"SOURCE ONLY",cls:"unavailable"};
  }
  function contains(q,record) {
    var txt=[record.name,record.category,record.description,record.researchStatus,record.id,record.repo,record.site].join(" ").toLowerCase();
    return q.split(/\s+/).every(function (token) {return txt.indexOf(token)!==-1;});
  }
  function cmpName(a,b) {return a.name.localeCompare(b.name,undefined,{sensitivity:"base"});}
  function rank(a) {
    if(a.featured) return 0;
    if(a.kind==="subpage") return 2;
    return a.access==="live" ? 1 : 3;
  }
  function filteredEntries() {
    var q=state.query.toLowerCase().trim();
    var ret=catalogEntries.filter(function (e) {
      if(state.category!=="all" && e.category!==state.category) return false;
      if(state.access==="live" && (e.kind==="subpage" || e.access!=="live")) return false;
      if(state.access==="subpage" && e.kind!=="subpage") return false;
      if(state.access==="source" && (e.kind==="subpage" || e.access==="live")) return false;
      if(state.access==="saved" && !state.favorites.has(itemKey(e))) return false;
      return !q || contains(q,e);
    });
    if(state.sort==="alpha") ret.sort(cmpName);
    else if(state.sort==="group") ret.sort(function(a,b){return a.category.localeCompare(b.category)||cmpName(a,b);});
    else ret.sort(function(a,b){return rank(a)-rank(b)||cmpName(a,b);});
    return ret;
  }
  function showCard(e) {
    var s=label(e);
    var isSaved=state.favorites.has(itemKey(e));
    var research=e.kind==="subpage" ? "Linked evidence remains scoped to its parent project." : (e.researchStatus || "Check original evidence ledger.");
    var action=e.access==="live" || e.kind==="subpage" ?
      '<a class="lab-link" href="'+esc(safeUrl(e.site))+'" target="_blank" rel="noopener noreferrer" aria-label="Open dashboard for '+esc(e.name)+'">OPEN LAB ↗</a>' : "";
    return '<article class="lab-card'+(e.featured?" featured":"")+'">'+
      '<div class="lab-card-top"><span class="lab-category">'+esc(e.category)+'</span><span class="lab-state '+s.cls+'">'+s.text+'</span></div>'+
      '<h3>'+esc(e.name)+'</h3>'+
      '<p>'+esc(e.description)+'</p>'+
      '<div class="research-note">'+esc(research)+'</div>'+
      '<div class="lab-card-actions">'+action+
      '<a class="lab-link source" href="'+esc(safeUrl(e.repo))+'" target="_blank" rel="noopener noreferrer" aria-label="Open source repository for '+esc(e.name)+'">SOURCE ↗</a>'+
      '<button type="button" class="fav" data-fav="'+esc(itemKey(e))+'" aria-label="'+(isSaved?"Remove saved":"Save")+' '+esc(e.name)+'" aria-pressed="'+(isSaved?"true":"false")+'" title="Save this project locally">'+(isSaved?"★":"☆")+'</button>'+
      '</div></article>';
  }
  function renderDirectory() {
    current=filteredEntries();
    displayed=current.slice(0,state.limit);
    $("labGrid").innerHTML=displayed.length ? displayed.map(showCard).join("") :
      '<div class="empty"><strong>No matching research entries.</strong><p>Try another topic, domain, or source availability setting. No lab has been silently removed from the catalog.</p></div>';
    $("resultsCount").textContent="SHOWING "+displayed.length+" OF "+current.length+" MATCHING ENTRIES";
    var more=$("showMore");
    more.hidden=displayed.length>=current.length;
    more.textContent="SHOW MORE RESULTS ("+(current.length-displayed.length)+" REMAINING) ↓";
    var accessButtons=document.querySelectorAll("#accessFilters [data-access]");
    accessButtons.forEach(function(btn){
      var on=btn.getAttribute("data-access")===state.access;
      btn.classList.toggle("active",on);
      btn.setAttribute("aria-pressed",String(on));
    });
  }
  function renderStats() {
    var live=atlas.repositories.filter(function(x){return x.access==="live";}).length;
    $("statAll").textContent=atlas.repositories.length.toLocaleString();
    $("statLive").textContent=live.toLocaleString();
    $("statSubpages").textContent=atlas.subpages.length.toLocaleString();
    $("statSource").textContent=(atlas.repositories.length-live).toLocaleString();
  }
  function renderSectors() {
    var cats=atlas.categories.filter(function(x){return x!=="Other research";});
    $("sectorGrid").innerHTML=cats.map(function(cat,i){
      var group=atlas.repositories.filter(function(e){return e.category===cat;});
      var lives=group.filter(function(e){return e.access==="live";}).length;
      return '<button class="sector" type="button" data-sector="'+esc(cat)+'" aria-label="Filter to '+esc(cat)+'">'+
        '<div class="sector-top"><span class="sector-index">SECTOR '+String(i+1).padStart(2,"0")+'</span><span class="sector-count">'+group.length+'</span></div>'+
        '<strong>'+esc(cat)+'</strong>'+
        '<small>'+lives+' public Pages root'+(lives===1?"":"s")+' · '+(group.length-lives)+' source-only</small></button>';
    }).join("");
  }
  function renderPathways() {
    $("pathwayCards").innerHTML=atlas.pathways.map(function(p,i){
      var steps=p.steps.map(function(name,j){
        var e=reposByName[name],url=e?bestUrl(e):("https://github.com/enuminous/"+name);
        var link='<a href="'+esc(safeUrl(url))+'" target="_blank" rel="noopener noreferrer">'+esc(name)+'</a>';
        return (j?'<span class="arrow" aria-hidden="true">→</span>':"")+link;
      }).join("");
      return '<article class="path-card"><span class="index">PATHWAY '+String(i+1).padStart(2,"0")+' / '+esc(p.category)+'</span>'+
        '<h3>'+esc(p.title)+'</h3><p>'+esc(p.note)+'</p>'+
        '<div class="path-steps">'+steps+'</div><span class="path-note">All arrows indicate navigation / research relation, not established physical derivation.</span></article>';
    }).join("");
  }
  function renderReadings() {
    $("readingGrid").innerHTML=atlas.readings.map(function(p,i){
      return '<a class="paper" href="'+esc(safeUrl(p.url))+'" target="_blank" rel="noopener noreferrer"><span class="paper-num">'+String(i+1).padStart(2,"0")+'</span>'+
        '<div><strong>'+esc(p.name)+'</strong><span>'+esc(p.description)+'</span></div><span class="paper-arrow" aria-hidden="true">↗</span></a>';
    }).join("");
  }
  function scrollToDirectory(){
    var el=$("directory");
    if(el)el.scrollIntoView({behavior:window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  }
  function resetPage(){state.limit=pageSize;renderDirectory();}
  function setCategory(cat){
    state.category=cat;$("categoryFilter").value=cat;
    if(state.access==="saved")state.access="all";
    resetPage();scrollToDirectory();
  }
  function fallbackCopy(text) {
    var el=document.createElement("textarea");
    el.value=text;el.setAttribute("readonly","readonly");
    el.style.position="fixed";el.style.opacity="0";document.body.appendChild(el);
    el.select();
    var ok=false;
    try{ok=document.execCommand("copy");}catch(e){ok=false;}
    el.remove();
    return ok;
  }
  async function copyUrls() {
    if(!displayed.length){toast("No displayed URLs to copy.");return;}
    var block=displayed.map(function(e){return bestUrl(e);}).join("\n");
    var copied=false;
    try {if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(block);copied=true;}}
    catch(e){copied=false;}
    if(!copied)copied=fallbackCopy(block);
    toast(copied?"Copied "+displayed.length+" displayed URLs.":"Clipboard unavailable; use Export CSV or select links from the catalog.");
  }
  function csvEscape(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"';}
  function exportCsv() {
    var header=["name","category","kind","access","site_url","repository_url","description","research_status"];
    var rows=[header.join(",")].concat(current.map(function(e){
      return [e.name,e.category,e.kind,e.access,e.site||"",e.repo,e.description,e.researchStatus||""].map(csvEscape).join(",");
    }));
    var blob=new Blob(["\ufeff"+rows.join("\r\n")+"\r\n"],{type:"text/csv;charset=utf-8"});
    var u=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=u;a.download="EFMW-Field-Master-Lab-Catalog-Filtered-2026-11-10.csv";
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(u);},1500);
    toast("Exported "+current.length+" matching catalog entries with source URLs and verification status.");
  }
  function attach() {
    $("searchLabs").addEventListener("input",function(e){state.query=e.target.value;resetPage();});
    $("categoryFilter").addEventListener("change",function(e){state.category=e.target.value;resetPage();});
    $("sortFilter").addEventListener("change",function(e){state.sort=e.target.value;renderDirectory();});
    $("accessFilters").addEventListener("click",function(ev){
      var b=ev.target.closest("[data-access]");if(!b)return;
      state.access=b.getAttribute("data-access");
      resetPage();
    });
    $("sectorGrid").addEventListener("click",function(ev){
      var b=ev.target.closest("[data-sector]");if(!b)return;
      setCategory(b.getAttribute("data-sector"));
    });
    $("labGrid").addEventListener("click",function(ev){
      var b=ev.target.closest("button[data-fav]");if(!b)return;
      var key=b.getAttribute("data-fav");
      if(state.favorites.has(key))state.favorites.delete(key);
      else state.favorites.add(key);
      writeFavorites();renderDirectory();
    });
    $("showMore").addEventListener("click",function(){state.limit+=pageSize;renderDirectory();});
    $("copyShown").addEventListener("click",copyUrls);
    $("csvShown").addEventListener("click",exportCsv);
    document.addEventListener("keydown",function(ev){
      var target=ev.target;
      var typing=target && (target.tagName==="INPUT"||target.tagName==="TEXTAREA"||target.tagName==="SELECT"||target.isContentEditable);
      if(ev.key==="/"&&!typing){ev.preventDefault();$("searchLabs").focus();}
      else if(ev.key==="Escape"&&document.activeElement===$("searchLabs") && $("searchLabs").value){
        $("searchLabs").value="";state.query="";resetPage();
      }
    });
  }
  function start() {
    if(!atlas || !Array.isArray(atlas.repositories)||!Array.isArray(atlas.subpages)||!Array.isArray(atlas.pathways)||!Array.isArray(atlas.readings)){
      $("labGrid").innerHTML='<div class="empty"><strong>Catalog unavailable.</strong><p>Check the local file data/labs.js and reload the site. The standalone repository remains linked above.</p></div>';
      toast("Catalog is missing or malformed. No link statuses can be established.");
      return;
    }
    atlas.repositories.forEach(function(e){reposByName[e.name]=e;});
    catalogEntries=atlas.repositories.concat(atlas.subpages);
    readFavorites();
    var categories=atlas.categories||[];
    $("categoryFilter").innerHTML='<option value="all">All domains</option>'+categories.map(function(c){
      return '<option value="'+esc(c)+'">'+esc(c)+'</option>';
    }).join("");
    renderStats();renderPathways();renderSectors();renderReadings();
    attach();renderDirectory();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();