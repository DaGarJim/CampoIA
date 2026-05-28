import{A as r}from"./index-CzgHVyT3.js";async function s(n,e){const{data:a,error:o}=await r.functions.invoke("ai-coach",{body:{mode:n,payload:e}});if(o)throw new Error('El IA Coach no está disponible. Revisa la Edge Function "ai-coach" en Supabase.');return a}async function $(n,e,a){const o=await s("chat",{question:n,context:e,conversation:a});return(o==null?void 0:o.reply)??""}async function g(n){return s("metrics",{player:{name:n.name,pos:n.pos,age:n.age,score:n.score,adherence:n.adherence,mins:n.mins,height_cm:n.height_cm,weight_kg:n.weight_kg}})}async function m(n){const e=await s("report",n);return(e==null?void 0:e.markdown)??""}async function p(n){const e=await s("season-import",{text:n});return(e==null?void 0:e.matches)??[]}async function d(n){const e=await s("player-import",{text:n});return(e==null?void 0:e.player)??{}}function u(n){const e=[n.name,n.pos??"",`score ${n.score??"—"}`,`adh ${n.adherence??0}%`,`min ${n.mins??0}`,`estado ${n.status}`];return n.tag&&e.push(n.tag),`- ${e.filter(Boolean).join(" · ")}`}function f(n,e=[],a=[]){const o=new Map(n.map(i=>[i.id,i.name])),c=[];if(c.push(`JUGADORES (${n.length}):
${n.map(u).join(`
`)}`),e.length){const i=e.slice(0,8).map(t=>`- ${t.date} ${o.get(t.player_id)??""} vs ${t.rival??"?"} ${t.result??""} (${t.mins??0}', ${t.role??"—"})`).join(`
`);c.push(`ÚLTIMOS PARTIDOS:
${i}`)}if(a.length){const i=a.slice(0,6).map(t=>`- ${t.date} ${o.get(t.player_id??"")??""} ${t.type??""} ${t.duration??0}' RPE ${t.rpe??"—"}`).join(`
`);c.push(`ÚLTIMAS SESIONES:
${i}`)}return c.join(`

`)}export{$ as a,f as b,m as c,p as d,g,d as i};
