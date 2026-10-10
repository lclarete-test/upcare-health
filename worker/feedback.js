const forms={topic:{url:'https://docs.google.com/forms/u/0/d/e/1FAIpQLSc_4W6etDZ7mmba_xA9kWpoMyBqz9rl9ccT_9EQV6C3FtP36Q/formResponse',fields:{topic:'entry.935362366',email:'entry.187950082'}},vote:{url:'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeADrMZwHfT44-0Td7uN_G-FQVGT26rZlAsnq0G8ky83f1tqQ/formResponse',fields:{title:'entry.1192052566',url:'entry.1636469058',vote:'entry.309549674',id:'entry.733242733'}}};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(request){const url=new URL(request.url);
 if(url.pathname==='/api/feedback'){
  if(request.method!=='POST')return json({ok:false},405);
  if(request.headers.get('origin')!==url.origin)return json({ok:false},403);
  if(Number(request.headers.get('content-length')||0)>6000)return json({ok:false},413);
  try{const raw=await request.text();if(raw.length>6000)return json({ok:false},413);const data=JSON.parse(raw);let values;
   if(data.type==='topic'){const topic=String(data.topic||'').trim(),email=String(data.email||'').trim();if(!topic||topic.length>2000||email.length>254||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return json({ok:false},400);values={topic,email};}
   else if(data.type==='vote'){const path=new URL(String(data.url||'')).pathname;const page=assets[path+'index.html'];if(!/^\/stories\/[^/]+\/$/.test(path)||!page||!['Yes','No'].includes(data.vote)||!/^[a-zA-Z0-9-]{8,80}$/.test(data.id||''))return json({ok:false},400);const html=atob(page.data);const title=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g,'')||String(data.title||'').slice(0,300);values={title,url:'https://upcare.health'+path,vote:data.vote,id:data.id};}
   else return json({ok:false},400);
   const config=forms[data.type],body=new URLSearchParams();for(const [k,v]of Object.entries(values))body.set(config.fields[k],v);body.set('fvv','1');body.set('pageHistory','0');
   const response=await fetch(config.url+'?hl=en',{method:'POST',body,redirect:'follow',signal:AbortSignal.timeout(12000)});const html=await response.text();
   if(!response.ok||!(/Your response has been recorded|Your response was recorded/.test(html)))return json({ok:false,message:'We could not confirm your submission. Please try again.'},502);
   return json({ok:true});
  }catch{return json({ok:false,message:'We could not save your response. Please try again.'},502);}
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 let path=url.pathname;if(!assets[path]&&assets[path+'/index.html'])return Response.redirect(url.origin+path+'/'+url.search,301);if(path.endsWith('/'))path+='index.html';const asset=assets[path];if(!asset)return new Response('Page not found',{status:404});
 const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':asset.type,'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
}};
