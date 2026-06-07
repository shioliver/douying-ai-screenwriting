import{g as m}from"./services-config-WU8_FGmR.js";import{l as g,b as p}from"./editor-image-BJ4S3Ps2.js";import"./vendor-react-Dv2FWvGu.js";import"./vendor-icons-DHdy39jm.js";import"./services-ai-mZDpJ5kz.js";import"./vendor-genai-CMdt6Lf-.js";class ${constructor(){this.name="sora2",this.supportedModels=["sora"]}async build(r,e){const{includeBlackScreen:o=!0,blackScreenDuration:s=.5}=e||{};if(r.length===0)throw new Error("至少需要一个分镜");return this.buildBasicPrompt(r,o,s)}buildBasicPrompt(r,e,o){let s="";e&&(s+=`Shot 1:
duration: ${o.toFixed(1)}s
Scene: 纯黑空镜，无任何视觉内容

`);const c=e?2:1,i=r.map((t,a)=>{const n=t.duration||5,u=c+a,l=[];t.shotSize&&l.push(t.shotSize),t.cameraAngle&&l.push(t.cameraAngle),t.cameraMovement&&l.push(t.cameraMovement),t.visualDescription&&l.push(t.visualDescription),t.visualEffects&&t.visualEffects!=="无"&&l.push(`[${t.visualEffects}]`),t.dialogue&&t.dialogue!=="无"&&l.push(`"${t.dialogue}"`),t.audioEffects&&t.audioEffects!=="无"&&l.push(`[${t.audioEffects}]`);const d=l.join("，")||t.visualDescription||"";return`Shot ${u}:
duration: ${n.toFixed(1)}s
Scene: ${d}`}).join(`

`);return s+i}}class S{constructor(){this.name="generic",this.supportedModels=["luma","runway","veo","minimax","volcengine","grok","qwen"]}async build(r,e){if(r.length===0)throw new Error("至少需要一个分镜");const o=e?.visualStyle||"Cinematic, high quality, consistent style",s=e?.preserveDialogue!==!1,c=r.map((n,u)=>`
镜头 ${n.shotNumber} (${n.duration}秒)
- 景别: ${n.shotSize}
- 拍摄角度: ${n.cameraAngle}
- 运镜方式: ${n.cameraMovement}
- 场景: ${n.scene||"未指定"}
- 视觉描述: ${n.visualDescription}
- 对白: ${n.dialogue||"无"}
- 视觉特效: ${n.visualEffects||"无"}
- 音效: ${n.audioEffects||"无"}`).join(`
`),i=r.reduce((n,u)=>n+u.duration,0),t=`你是一位专业的视频提示词生成器。你的任务是将分镜信息转换为多镜头视频提示词格式。

分镜信息：
${c}

总时长：约 ${i.toFixed(1)} 秒

输出要求：
1. 第一行输出统一风格声明：Style: ${o}
2. 空一行后，依次输出每个 Shot
3. 每个 Shot 包含 duration、Scene、Dialogue（如有）、SFX（如有）字段
4. Scene 只描述视觉画面，不要重复风格信息
5. ${s?"对白原样保留，用 Dialogue 字段输出":"忽略对白"}
6. 只输出多镜头格式，不要添加任何前缀、后缀、说明、建议或解释
7. 不要使用 "---" 分隔线
8. 不要添加"导演建议"、"色彩控制"等额外内容

输出格式示例：
Style: ${o}

Shot 1:
duration: X.Xs
Scene: [场景描述]，[动作描述]
Dialogue: "对白内容"
SFX: [音效描述]

Shot 2:
duration: X.Xs
Scene: [场景描述]，[动作描述]
SFX: [音效描述]`,a="你是一个视频提示词格式化工具。只负责将分镜信息转换为指定格式，不添加任何额外内容。";try{return await g("GenericPromptBuilder.build",async()=>{const n=m("text"),u=await p.generateContent(a+`

`+t,n,{systemInstruction:a});return u?this.cleanPrompt(u):this.buildBasicPrompt(r,e)},{model:m("text"),prompt:t.substring(0,200),options:{shotCount:r.length,totalDuration:r.reduce((n,u)=>n+u.duration,0)}},{nodeId:"generic-builder",nodeType:"GENERIC_PROMPT_BUILDER",platform:p.getCurrentProvider().getName()})}catch{return this.buildBasicPrompt(r,e)}}cleanPrompt(r){let e=r.trim();const o=["好的，","好的。","以下是","这是","根据要求","为你生成","优化后的","这是优化后的","以下是优化后的","你好","你好，我是","作为导演","作为专业的","Sure,","Here is","Certainly,","I will","Let me"];for(const t of o)e.startsWith(t)&&(e=e.substring(t.length).trim());if(!e.startsWith("Style:")&&!e.startsWith("Shot 1:")){const t=e.indexOf("Style:");if(t!==-1)e=e.substring(t).trim();else{const a=e.indexOf("Shot 1:");if(a!==-1)e=e.substring(a).trim();else{const n=e.match(/Shot \d+:/);n&&(e=e.substring(n.index).trim())}}}e=e.replace(/```[\w]*\n?/g,"").trim();const s=e.indexOf(`
---`);return s!==-1&&(e=e.substring(0,s).trim()),e=e.split(`
`).filter(t=>{const a=t.trim();return!(a.startsWith("###")||a==="---"||a.match(/^--+$/))}).join(`
`).trim(),e}buildBasicPrompt(r,e){const o=e?.visualStyle||"Cinematic, high quality, consistent style",s=e?.preserveDialogue!==!1,c=r.map((i,t)=>{const a=i.duration||5,n=i.visualDescription||"",u=i.dialogue,l=i.audioEffects;let d=`Shot ${t+1}:
duration: ${a.toFixed(1)}s
Scene: ${n}`;return s&&u&&u!=="无"&&(d+=`
Dialogue: "${u}"`),l&&l!=="无"&&(d+=`
SFX: ${l}`),d}).join(`

`);return`Style: ${o}

${c}`}}class b{constructor(){this.name="simple",this.supportedModels=[]}async build(r,e){if(r.length===0)throw new Error("至少需要一个分镜");const o=r.reduce((i,t)=>i+t.duration,0);r.map((i,t)=>`镜头 ${t+1}: ${i.visualDescription}`).join(", 然后 ");const s=`请将以下分镜信息转换为一个流畅的视频描述：

分镜信息：
${r.map((i,t)=>`
镜头 ${i.shotNumber} (${i.duration}秒)
- 景别: ${i.shotSize}
- 拍摄角度: ${i.cameraAngle}
- 运镜方式: ${i.cameraMovement}
- 场景: ${i.scene||"未指定"}
- 视觉描述: ${i.visualDescription}
- 对话: ${i.dialogue||"无"}`).join(`
`)}

总时长：约 ${o.toFixed(1)} 秒

输出要求：
1. 生成一个简洁流畅的视频描述文本
2. 包含所有关键视觉信息
3. 不要添加任何前缀、后缀或解释
4. 直接输出描述文本`,c="你是一个视频描述生成工具。负责将分镜信息转换为简洁的视频描述。";try{return await g("SimpleTextBuilder.build",async()=>{const i=m("text"),t=await p.generateContent(c+`

`+s,i,{systemInstruction:c});return t?t.trim():this.buildBasicPrompt(r)},{model:m("text"),prompt:s.substring(0,200),options:{shotCount:r.length,totalDuration:o}},{nodeId:"simple-builder",nodeType:"SIMPLE_PROMPT_BUILDER",platform:p.getCurrentProvider().getName()})}catch{return this.buildBasicPrompt(r)}}buildBasicPrompt(r){return r.map((e,o)=>{const s=e.duration||5,c=e.visualDescription||"";return`${o+1}. (${s.toFixed(1)}s) ${c}`}).join(`
`)}}class y{constructor(){this.builders=new Map,this.register(new $),this.register(new S),this.register(new b)}register(r){this.builders.set(r.name,r)}getByModel(r){return r==="sora"?this.builders.get("sora2"):this.builders.get("generic")}getByNodeType(r){return r==="SORA_VIDEO_GENERATOR"?this.builders.get("sora2"):r==="STORYBOARD_VIDEO_GENERATOR"?this.builders.get("generic"):this.builders.get("generic")}getAllBuilders(){return Array.from(this.builders.values())}getByName(r){const e=this.builders.get(r);if(!e)throw new Error(`未找到名为 "${r}" 的提示词构建器`);return e}}const B=new y;export{S as GenericPromptBuilder,b as SimpleTextBuilder,$ as Sora2PromptBuilder,B as promptBuilderFactory};
