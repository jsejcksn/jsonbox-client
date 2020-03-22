"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const node_fetch_1=require("node-fetch"),crypto_1=require("crypto"),createError=(e,t={})=>Object.assign(new Error,{...t,message:e}),handleUnexpectedResponse=async e=>{let t;try{({message:t}=await e.json())}catch{t=`Response not OK (${e.status})`}throw createError(t,{name:"FetchError",response:e})},isValidId=(e,t)=>{const i=/^[0-9a-z_]+$/iu,s=/^[0-9a-f]{24}$/iu,o=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;switch(e){case"api-key":return o.test(t);case"box":{const e=20;return t.length>=e&&i.test(t)}case"collection":return t.length>0&&i.test(t);case"record":return s.test(t);default:throw new TypeError('Invalid parameter "type": it must be one of "api-key" | "box" | "collection" | "record"')}};exports.uuidv4=()=>{const e=[...Array(256).keys()].map(e=>e.toString(16).padStart(2,"0")),t=crypto_1.randomFillSync(new Uint8Array(16));return t[6]=15&t[6]|64,t[8]=63&t[8]|128,[...t.entries()].map(([t,i])=>[4,6,8,10].includes(t)?`-${e[i]}`:e[i]).join("")};class Jsonbox{constructor(e,{apiKey:t,origin:i="https://jsonbox.io"}={}){if(this.getUrl=({collection:e,filter:t,id:i,limit:s,skip:o,sort:n}={})=>{if("string"==typeof i&&"string"==typeof e)throw new TypeError('Cannot use both properties "id" and "collection"');const r=new URL(`${this.origin}/${this.id}`);"string"==typeof i?r.pathname+=`/${i}`:"string"==typeof e&&(r.pathname+=`/${e}`);const a={limit:s,q:t,skip:o,sort:n};return r.search=[...Object.entries(a)].filter(([,e])=>void 0!==e).map(([e,t])=>`${e}=${encodeURIComponent(t)}`).join("&"),r.href},this.create=async(e,t)=>{const i={body:JSON.stringify(e),headers:{"Content-Type":"application/json"},method:"POST"};void 0!==this.apiKey&&(i.headers["x-api-key"]=this.apiKey);const s=await node_fetch_1.default(this.getUrl({collection:t}),i);return s.ok?s.json():handleUnexpectedResponse(s)},this.delete=async e=>{const t={method:"DELETE"};if(void 0!==this.apiKey&&(t.headers={"x-api-key":this.apiKey}),Array.isArray(e)){const i=e,s=i.map(async e=>{const i=await node_fetch_1.default(this.getUrl({id:e}),t);return i.ok?i.json():handleUnexpectedResponse(i)});return(await Promise.allSettled(s)).map(({status:e},t)=>({deleted:"fulfilled"===e,id:i[t]}))}const i={};"string"==typeof e?i.id=e:"object"==typeof e&&(i.filter=e.filter);const s=await node_fetch_1.default(this.getUrl(i),t);return s.ok?s.json():handleUnexpectedResponse(s)},this.read=async e=>{const t={method:"GET"};let i;void 0!==this.apiKey&&(t.headers={"x-api-key":this.apiKey}),"string"==typeof e?i={id:e}:"object"==typeof e&&(i=e);const s=await node_fetch_1.default(this.getUrl(i),t);return s.ok?s.json():handleUnexpectedResponse(s)},this.meta=async()=>{const e={method:"GET"};void 0!==this.apiKey&&(e.headers={"x-api-key":this.apiKey});const t=await node_fetch_1.default(`${this.origin}/_meta/${this.id}`,e);return t.ok?t.json():handleUnexpectedResponse(t)},this.update=async(e,t)=>{const i={body:JSON.stringify(t),headers:{"Content-Type":"application/json"},method:"PUT"};void 0!==this.apiKey&&(i.headers["x-api-key"]=this.apiKey);const s=await node_fetch_1.default(this.getUrl({id:e}),i);return s.ok?s.json():handleUnexpectedResponse(s)},!isValidId("box",e))throw new TypeError('Invalid parmater "id": Box ID must consist of at least 20 characters including alphanumeric and "_"');if("string"==typeof t&&!isValidId("api-key",t))throw new TypeError('Invalid parameter "apiKey": API key must be a valid UUID');this.apiKey=t,this.id=e,this.origin=i}}exports.Jsonbox=Jsonbox;