"use strict";
/* Master Lab inventory tests. Validation is of source integrity / interface wiring,
   not independent scientific validation of the linked projects. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname,"..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const atlas=JSON.parse(read("data/labs.json"));
const js=read("data/labs.js");
const ui=read("assets/explorer.js");
const html=read("index.html");

test("machine-readable catalog has valid versioned structure", () => {
  assert.equal(atlas.schema,"EFMW-MASTER-LAB-1");
  assert.equal(atlas.compiled,"2026-11-10");
  assert.equal(atlas.owner,"enuminous");
  assert.equal(atlas.repositories.length,159);
  assert.equal(atlas.networkCount,159);
  assert.equal(atlas.subpages.length,19);
  assert.equal(atlas.pathways.length,5);
  assert.equal(atlas.readings.length,10);
});
test("browser mirror exactly matches the JSON catalog", () => {
  const marker="window.EFMW_LAB_CATALOG = ";
  assert.ok(js.includes(marker));
  const payload=js.slice(js.indexOf(marker)+marker.length).trim().replace(/;$/,"");
  assert.deepEqual(JSON.parse(payload),atlas);
});
test("all named public repositories occur exactly once", () => {
  const names=atlas.repositories.map(x=>x.name);
  assert.equal(new Set(names).size,names.length);
  assert.ok(names.includes("EFMW-Field"));
  assert.ok(names.includes("StorySpace"));
  assert.ok(names.includes("RSI"));
  assert.ok(names.includes("Monolithic_102_EFMW"));
  assert.ok(names.includes("Tortoise"));
});
test("categories are complete and nonambiguous",()=>{
  const cats=new Set(atlas.categories);
  assert.equal(cats.size,atlas.categories.length);
  for(const x of atlas.repositories) assert.ok(cats.has(x.category),"Unknown category: "+x.name+" "+x.category);
  for(const x of atlas.subpages) assert.ok(cats.has(x.category),"Unknown subpage category "+x.name);
});
test("all source URLs identify the correct actual repository",()=>{
  for(const x of atlas.repositories) {
    assert.equal(x.repo,"https://github.com/enuminous/"+x.name);
    assert.equal(x.kind,"repository");
    assert.ok(x.description.length>=10,x.name+" description");
    assert.ok(x.researchStatus,x.name+" research status");
  }
});
test("site reachability claims use the verified date and do not invent root URLs",()=>{
  const seen={live:0,unavailable:0,not_verified:0};
  for(const x of atlas.repositories){
    assert.ok(Object.prototype.hasOwnProperty.call(seen,x.access));
    seen[x.access]++;
    if(x.access==="live")assert.equal(x.site,"https://enuminous.github.io/"+x.name+"/");
    else assert.equal(x.site,null,"Non-live repo must not invent site: "+x.name);
  }
  assert.equal(seen.live,70);
  assert.equal(seen.unavailable,37);
  assert.equal(seen.not_verified,52);
  assert.equal(seen.live+seen.unavailable+seen.not_verified,159);
});
test("all direct subpages belong to an indexed repository and have safe URL",()=>{
  const names=new Set(atlas.repositories.map(x=>x.name));
  const ids=atlas.subpages.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  for(const x of atlas.subpages){
    const repoName=x.id.split("/")[0];
    assert.ok(names.has(repoName),"Unknown parent "+repoName);
    assert.equal(x.kind,"subpage");
    assert.equal(x.access,"live");
    assert.equal(x.site,"https://enuminous.github.io/"+x.id);
    assert.equal(x.repo,"https://github.com/enuminous/"+repoName);
  }
});
test("pathways reference only inventoried projects",()=>{
  const names=new Set(atlas.repositories.map(x=>x.name));
  for(const p of atlas.pathways){
    assert.ok(p.steps.length>=2);
    assert.ok(p.note.includes("not")||p.note.includes("NOT")||p.note.includes("only")||p.note.includes("navigation"),"Scope note missing: "+p.id);
    for(const name of p.steps) assert.ok(names.has(name),"Missing project: "+name);
  }
});
test("reading room uses grounded first-party research file links",()=>{
  const names=new Set(atlas.repositories.map(x=>x.name));
  for(const p of atlas.readings){
    assert.ok(names.has(p.repo),"Unknown reading repository "+p.repo);
    assert.ok(p.url.startsWith("https://github.com/enuminous/"+p.repo+"/blob/main/"));
    assert.ok(p.description.length>15);
  }
});
test("web application has all required controls and imports local catalog",()=>{
  const ids=["pathwayCards","sectorGrid","searchLabs","categoryFilter","sortFilter","accessFilters","labGrid","showMore","copyShown","csvShown","resultsCount","statAll","statLive","statSubpages","statSource","readingGrid","directory","toast"];
  for(const id of ids)assert.ok(html.includes('id="'+id+'"'),"Missing UI target "+id);
  assert.ok(html.includes("./data/labs.js"));
  assert.ok(html.includes("./assets/explorer.js"));
  assert.ok(html.includes("./assets/explorer.css"));
  assert.ok(html.includes("UNRESOLVED"));
  assert.ok(!/src=["']https?:\/\//.test(html),"External script found");
});
test("browser and catalog JavaScript compile without dependencies",()=>{
  assert.doesNotThrow(()=>new vm.Script(js));
  assert.doesNotThrow(()=>new vm.Script(ui));
});
function newHarness(){
  const nodes=new Map();
  const evt={};
  const make=id=>{
    const node={id,innerHTML:"",textContent:"",value:"",hidden:false,events:{},
      classList:{toggle(){},add(){},remove(){}},
      addEventListener(type,fn){this.events[type]=fn;},
      setAttribute(){},getAttribute(){return null;},
      scrollIntoView(){},focus(){},
      appendChild(){},click(){},remove(){},
      style:{}};
    nodes.set(id,node);return node;
  };
  const el=id=>nodes.get(id)||make(id);
  const buttons=["all","live","subpage","source","saved"].map(access=>{
    const x=make("mode-"+access);
    x.getAttribute=name=>name==="data-access"?access:null;
    return x;
  });
  const doc={
    readyState:"complete",getElementById:el,
    querySelectorAll:selector=>selector==="#accessFilters [data-access]"?buttons:[],
    addEventListener(type,fn){evt[type]=fn;},
    createElement(){return make("temp");},
    body:{appendChild(){}},
    activeElement:null,
    execCommand(){return true;}
  };
  const store=new Map();
  const localStorage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)};
  const win={EFMW_LAB_CATALOG:atlas,matchMedia:()=>({matches:true}),isSecureContext:false};
  const ctx={window:win,document:doc,localStorage,navigator:{},Set,Map,Blob,URL,
    console, setTimeout:()=>0};
  vm.runInNewContext(ui,ctx);
  return {el,evt,doc,store,buttons};
}
test("home dashboard initializes with correct counts and usable links",()=>{
  const h=newHarness();
  assert.equal(h.el("statAll").textContent,"159");
  assert.equal(h.el("statLive").textContent,"70");
  assert.equal(h.el("statSubpages").textContent,"19");
  assert.equal(h.el("statSource").textContent,"89");
  assert.ok(h.el("pathwayCards").innerHTML.includes("Field hypothesis"));
  assert.ok(h.el("labGrid").innerHTML.includes("EFMW-Field"));
  assert.ok(h.el("labGrid").innerHTML.includes("SOURCE"));
  assert.equal(h.el("showMore").hidden,false);
});
test("search is functional and can be reset without a reload",()=>{
  const h=newHarness();
  h.el("searchLabs").events.input({target:{value:"StorySpace"}});
  assert.match(h.el("resultsCount").textContent,/OF 1 MATCHING/);
  assert.ok(h.el("labGrid").innerHTML.includes("StorySpace"));
  h.el("searchLabs").events.input({target:{value:""}});
  assert.match(h.el("resultsCount").textContent,/OF 178 MATCHING/);
});
test("availability filters separate sites, source-only repositories and subpages",()=>{
  const h=newHarness();
  const click=mode=>h.el("accessFilters").events.click({target:{closest:()=>({getAttribute:()=>mode})}});
  click("live");
  assert.match(h.el("resultsCount").textContent,/OF 70 MATCHING/);
  click("source");
  assert.match(h.el("resultsCount").textContent,/OF 89 MATCHING/);
  click("subpage");
  assert.match(h.el("resultsCount").textContent,/OF 19 MATCHING/);
});
test("sector click scopes the directory and more-results pagination increments",()=>{
  const h=newHarness();
  h.el("sectorGrid").events.click({target:{closest:()=>({getAttribute:()=>"Physics & cosmos"})}});
  assert.match(h.el("resultsCount").textContent,/OF 22 MATCHING/);
  h.el("categoryFilter").events.change({target:{value:"all"}});
  assert.match(h.el("resultsCount").textContent,/SHOWING 24 OF 178/);
  h.el("showMore").events.click();
  assert.match(h.el("resultsCount").textContent,/SHOWING 48 OF 178/);
});
test("favorites persist as opt-in local bookmarks",()=>{
  const h=newHarness();
  h.el("labGrid").events.click({target:{closest:()=>({getAttribute:()=>"repo:StorySpace"})}});
  assert.ok(h.store.size>0);
  h.el("accessFilters").events.click({target:{closest:()=>({getAttribute:()=>"saved"})}});
  assert.match(h.el("resultsCount").textContent,/OF 1 MATCHING/);
  assert.ok(h.el("labGrid").innerHTML.includes("StorySpace"));
});
