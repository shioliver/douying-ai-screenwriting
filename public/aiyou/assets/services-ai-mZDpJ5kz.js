import{M as J}from"./vendor-genai-CMdt6Lf-.js";import{l as b,b as p,g as L}from"./editor-image-BJ4S3Ps2.js";import{g as v,a as U,b as de,i as _,c as ue}from"./services-config-WU8_FGmR.js";const N=()=>p.getCurrentProvider().getClient(),T=e=>{if(p.getCurrentProviderType()!=="gemini")throw new Error(`"${e}" 功能需要使用 Gemini 官方 API。

当前提供商：${p.getCurrentProvider().getName()}

请切换到 Gemini API (Google Official) 以使用此功能。`)},j=e=>e?typeof e=="string"?e:e.message?e.message:e.error&&e.error.message?e.error.message:JSON.stringify(e):"Unknown error",z=e=>new Promise(t=>setTimeout(t,e));async function me(e,t=3,a=2e3){let n;for(let i=0;i<t;i++)try{return await e()}catch(r){n=r;const l=j(r).toLowerCase();if((r.status===503||r.code===503||l.includes("overloaded")||l.includes("503")||r.status===429||r.code===429)&&i<t-1){const s=a*Math.pow(2,i);await z(s);continue}throw r}throw n}function R(e,t,a){for(let n=0;n<a.length;n++)e.setUint8(t+n,a.charCodeAt(n))}const ge=e=>{const t=atob(e),a=t.length,n=new Uint8Array(a);for(let i=0;i<a;i++)n[i]=t.charCodeAt(i);return n},he=(e,t=24e3)=>{let a=0;const n=[];for(const m of e){const f=ge(m);n.push(f),a+=f.length}const i=new Uint8Array(a);let r=0;for(const m of n)i.set(m,r),r+=m.length;const l=1,c=16,s=new ArrayBuffer(44),o=new DataView(s);R(o,0,"RIFF"),o.setUint32(4,36+a,!0),R(o,8,"WAVE"),R(o,12,"fmt "),o.setUint32(16,16,!0),o.setUint16(20,1,!0),o.setUint16(22,l,!0),o.setUint32(24,t,!0),o.setUint32(28,t*l*(c/8),!0),o.setUint16(32,l*(c/8),!0),o.setUint16(34,c,!0),R(o,36,"data"),o.setUint32(40,a,!0);const d=new Uint8Array(s.byteLength+a);d.set(new Uint8Array(s),0),d.set(i,s.byteLength);let u="";const g=8192;for(let m=0;m<d.length;m+=g)u+=String.fromCharCode.apply(null,Array.from(d.subarray(m,m+g)));return"data:audio/wav;base64,"+btoa(u)},Y=async e=>{try{const a=await(await fetch(e)).blob();return new Promise((n,i)=>{const r=new FileReader;r.onload=l=>n(r.result),r.onerror=i,r.readAsDataURL(a)})}catch{return""}},V=async e=>{if(e.match(/^data:image\/(png|jpeg|jpg);base64,/)){const t=e.match(/^data:(image\/[a-zA-Z+]+);base64,/),a=t?t[1]:"image/png";return{data:e.replace(/^data:image\/[a-zA-Z+]+;base64,/,""),mimeType:a,fullDataUri:e}}return new Promise((t,a)=>{const n=new Image;n.crossOrigin="Anonymous",n.onload=()=>{const i=document.createElement("canvas");i.width=n.width,i.height=n.height;const r=i.getContext("2d");if(!r){a(new Error("Canvas context failed"));return}r.drawImage(n,0,0);const l=i.toDataURL("image/png"),c=l.replace(/^data:image\/png;base64,/,"");t({data:c,mimeType:"image/png",fullDataUri:l})},n.onerror=i=>a(new Error("Image conversion failed for Veo compatibility")),n.src=e})},q=e=>new Promise((t,a)=>{const n=document.createElement("video");n.crossOrigin="anonymous",n.src=e,n.muted=!0,n.onloadedmetadata=()=>{n.currentTime=Math.max(0,n.duration-.1)},n.onseeked=()=>{try{const i=document.createElement("canvas");i.width=n.videoWidth,i.height=n.videoHeight;const r=i.getContext("2d");r?(r.drawImage(n,0,0,i.width,i.height),t(i.toDataURL("image/png"))):a(new Error("Canvas context failed"))}catch(i){a(i)}finally{n.remove()}},n.onerror=()=>{a(new Error("Video load failed for frame extraction")),n.remove()}}),B=async(e,t)=>{const a=N(),n=`
    Analyze this image carefully.
    Does it contain any of the following visual elements?
    1. Text labels (e.g., "Front View", "Side", names, "Fig 1").
    2. Info boxes, stats blocks, or character descriptions overlaying the image.
    3. Watermarks, signatures, or large logos.
    4. Chinese characters or any handwritten notes.

    Answer strictly "YES" if any of these are visibly present.
    Answer "NO" if the image contains ONLY the character illustration with no overlay text.
    `,i=e.match(/^data:(image\/\w+);base64,/),r=i?i[1]:"image/png",l=e.replace(/^data:image\/\w+;base64,/,"");try{return((await a.models.generateContent({model:v("text"),contents:{parts:[{inlineData:{mimeType:r,data:l}},{text:n}]}})).text?.trim().toUpperCase()||"").includes("YES")}catch{return!1}},pe=`
你是一位专业的选角导演。
你的任务是从剧本或大纲中提取所有出现的角色名称。
请只输出一个 JSON 字符串数组，不要包含其他内容。
例如: ["张三", "李四", "王五"]
`,fe=`
你是一位资深的角色设计师和小说家。
你的任务是根据提供的角色名称和剧本上下文，生成极度详细的角色档案。

**输出格式要求 (JSON):**
请直接输出一个 JSON 对象，包含以下字段：
{
  "name": "角色名",
  "alias": "称谓 (同事、家人等)",
  "basicStats": "基础属性 (年龄、性别、身高、身材、发型、特征、着装)",
  "profession": "职业 (含隐藏身份)",
  "background": "生活环境、生理特征、地域标签",
  "personality": "性格 (主性格+次性格)",
  "motivation": "核心动机",
  "values": "价值观",
  "weakness": "恐惧与弱点",
  "relationships": "核心关系及影响",
  "habits": "语言风格、行为习惯、兴趣爱好",
  "appearancePrompt": "用于AI生图的详细英文提示词 (Format: [Visual Style Keywords], [Character Description], [Clothing], [Face], [Lighting]. Ensure it strictly matches the Visual Style Context provided.)"
}

**内容要求：**
1. 内容必须丰富、具体，具有画面感。
2. 必须严格遵守传入的【Visual Style Context】视觉风格设定。
3. "appearancePrompt" 字段必须包含具体的视觉风格关键词，并且描述清晰，可以直接用于文生图模型。

**视觉风格特定要求（根据 Visual Style 选择对应要求）：**

**3D动画风格（当 Visual Style 为 3D 时）：**
- 核心风格：Xianxia 3D animation character, semi-realistic style, Xianxia animation aesthetics
- 必须使用：high precision 3D modeling, PBR shading with soft translucency
- 皮肤质感：delicate and smooth skin texture (not overly realistic), subsurface scattering，追求通透柔滑质感
- 服饰细节：flowing fabric clothing, 纱质服饰的飘逸感
- 发丝细节：individual hair strands, 发丝根根分明
- 光影效果：soft ethereal lighting, cinematic rim lighting with neutral tones, ambient occlusion
- 角色气质：otherworldly gaze, elegant and natural demeanor，强化出尘气质
- 严格禁止：2D illustration, hand-drawn, anime 2D, flat shading, cel shading, toon shading, cartoon 2D, overly photorealistic, hyper-realistic skin, photorealistic rendering

**REAL真人风格（当 Visual Style 为 REAL 时）：**
- 核心风格：Photorealistic portrait, realistic human, cinematic photography, professional headshot
- 必须使用：Professional portrait photography, DSLR quality, 85mm lens, sharp focus
- 皮肤质感：Realistic skin texture, visible pores, natural skin imperfections, skin details, subsurface scattering
- 服饰细节：Realistic fabric texture, detailed clothing materials, natural fabric folds
- 发丝细节：Natural hair texture, realistic hair strands, hair volume, shiny hair
- 光影效果：Natural lighting, studio portrait lighting, softbox lighting, rim light, golden hour
- 角色气质：Natural human expression, authentic emotion, realistic gaze, professional model look
- 严格禁止：anime, cartoon, illustration, 3d render, cgi, 3d animation, painting, drawing, bad anatomy, deformed

**ANIME 2D动漫风格（当 Visual Style 为 ANIME 时）：**
- 核心风格：Anime character, anime style, 2D anime art, manga illustration style
- 必须使用：Clean linework, crisp outlines, manga art style, detailed illustration
- 皮肤质感：Smooth flat skin, cel shading, clean skin rendering, no skin texture details
- 服饰细节：Clean clothing lines, simple fabric shading, anime costume design
- 发丝细节：Stylized hair, anime hair style, sharp hair outlines, spiky hair
- 光影效果：Soft lighting, rim light, vibrant colors, cel shading lighting, flat shading
- 角色气质：Expressive anime eyes, emotional face, kawaii or cool demeanor
- 严格禁止：photorealistic, realistic, photo, 3d, cgi, live action, hyper-realistic, skin texture, pores, realistic shading

4. 如果上下文没有提供足够信息，请根据角色定位进行合理的**AI自动补全**，使其丰满。
`,ye=`
你是一位资深的角色设计师。
你的任务是为配角生成简化的角色档案。配角是故事中的次要角色，只需要基础信息即可。

**输出格式要求 (JSON):**
请直接输出一个 JSON 对象，包含以下字段：
{
  "name": "角色名",
  "basicStats": "基础属性 (年龄、性别、身高、身材、发型、特征、着装)",
  "profession": "职业",
  "introduction": "简短介绍 (1-2句话描述角色定位和在剧中的作用)",
  "appearancePrompt": "用于AI生图的详细英文提示词 (Format: [Visual Style Keywords], [Character Description], [Clothing], [Face], [Lighting]. Ensure it strictly matches the Visual Style Context provided.)"
}

**内容要求：**
1. 保持简洁，突出角色的核心定位。
2. 必须严格遵守传入的【Visual Style Context】视觉风格设定。
3. "appearancePrompt" 字段必须包含具体的视觉风格关键词，描述清晰。
4. 配角不需要详细的性格、动机、关系等信息。

**视觉风格特定要求（根据 Visual Style 选择对应要求）：**

**3D动画风格（当 Visual Style 为 3D 时）：**
- 核心风格：Xianxia 3D animation character, semi-realistic style, Xianxia animation aesthetics
- 必须使用：high precision 3D modeling, PBR shading with soft translucency
- 皮肤质感：delicate and smooth skin texture (not overly realistic), subsurface scattering，追求通透柔滑质感
- 服饰细节：flowing fabric clothing, 纱质服饰的飘逸感
- 发丝细节：individual hair strands, 发丝根根分明
- 光影效果：soft ethereal lighting, cinematic rim lighting with neutral tones, ambient occlusion
- 角色气质：otherworldly gaze, elegant and natural demeanor，强化出尘气质
- 严格禁止：2D illustration, hand-drawn, anime 2D, flat shading, cel shading, toon shading, cartoon 2D, overly photorealistic, hyper-realistic skin, photorealistic rendering

**REAL真人风格（当 Visual Style 为 REAL 时）：**
- 核心风格：Photorealistic portrait, realistic human, cinematic photography, professional headshot
- 必须使用：Professional portrait photography, DSLR quality, 85mm lens, sharp focus
- 皮肤质感：Realistic skin texture, visible pores, natural skin imperfections, skin details
- 服饰细节：Realistic fabric texture, detailed clothing materials, natural fabric folds
- 发丝细节：Natural hair texture, realistic hair strands, hair volume, shiny hair
- 光影效果：Natural lighting, studio portrait lighting, softbox lighting, rim light
- 角色气质：Natural human expression, authentic emotion, realistic gaze
- 严格禁止：anime, cartoon, illustration, 3d render, cgi, 3d animation, painting, drawing

**ANIME 2D动漫风格（当 Visual Style 为 ANIME 时）：**
- 核心风格：Anime character, anime style, 2D anime art, manga illustration style
- 必须使用：Clean linework, crisp outlines, manga art style, detailed illustration
- 皮肤质感：Smooth flat skin, cel shading, clean skin rendering, no skin texture details
- 服饰细节：Clean clothing lines, simple fabric shading, anime costume design
- 发丝细节：Stylized hair, anime hair style, sharp hair outlines, spiky hair
- 光影效果：Soft lighting, rim light, vibrant colors, cel shading lighting, flat shading
- 角色气质：Expressive anime eyes, emotional face, kawaii or cool demeanor
- 严格禁止：photorealistic, realistic, photo, 3d, cgi, live action, hyper-realistic, skin texture, pores
`,Ce=`
你是一位资深的影视剧分析专家和编剧顾问。
你的任务是对用户提供的剧名进行深度分析，从多个维度评估其创作价值和IP潜力。

**输出格式要求 (JSON):**
请直接输出一个 JSON 对象，包含以下字段：
{
  "dramaName": "剧名",
  "dramaIntroduction": "剧集介绍（简要概述剧情、主要角色、故事背景，100-200字）",
  "worldview": "世界观分析（是否有「反常识/强记忆点」的设定？参考：《进击的巨人》「巨人吃人的世界」、《咒术回战》「诅咒=负面情绪具象化」，200字左右）",
  "logicalConsistency": "逻辑自洽性分析（设定是否贯穿全剧？是否有明显BUG？参考：《火影忍者》后期「查克拉滥用」导致设定崩塌，150字左右）",
  "extensibility": "延展性分析（设定是否支持多场景/衍生内容？参考：《宝可梦》的「精灵收集」设定，可衍生游戏、卡牌、线下活动，150字左右）",
  "characterTags": "角色标签分析（角色是否有「可复制的标签组合」？参考：「高冷学霸+反差萌」「废柴逆袭+热血」，方便AI生成人设时复用标签，200字左右）",
  "protagonistArc": "主角弧光分析（主角/配角是否有清晰的成长线？参考：《海贼王》路飞从「单细胞船长」到「能承担责任的领袖」，200字左右）",
  "audienceResonance": "受众共鸣点分析（人设是否击中目标群体的「情感需求」？参考：《夏目友人帐》夏目「孤独但温柔」，击中社畜/孤独青年的共鸣，150字左右）",
  "artStyle": "画风/视觉风格分析（画风是否「差异化+适配题材」？参考：《JOJO的奇妙冒险》「荒木线」的独特画风，成为IP标识；《间谍过家家》清新画风适配家庭喜剧，200字左右）"
}

**内容要求：**
1. 如果你对该剧有所了解，请基于你的知识进行分析。
2. 如果你不了解该剧，请明确说明「无法检索到该剧的详细信息」，并建议用户提供更多上下文或尝试其他剧名。
3. 分析必须具体、深入，避免空泛的套话。
4. 每个维度的分析应该包含具体案例和可操作的建议。
5. 输出必须是纯 JSON 格式，不要包含 markdown 标记（如 \`\`\`json）。
`,we=`
You are a video prompt engineering expert for AI video generation models.

Your task is to create a single, concise video generation prompt in English that seamlessly transitions between the provided storyboard images.

**CRITICAL REQUIREMENTS:**
1. Output ONLY the video prompt in English - no explanations, no introductions, no bullet points
2. Start directly with the prompt text (e.g., "A cinematic scene showing...")
3. Focus on visual descriptions: camera movement, transitions, lighting, mood, atmosphere
4. Keep it concise (under 200 words)
5. Use professional video terminology: pan, zoom, fade, transition, tracking shot, etc.
6. Describe the flow between images, not just individual images

**DO NOT include:**
- "Here is a prompt..." or similar introductions
- Any explanations or commentary
- Bullet points or numbered lists
- Any non-English text in the prompt itself

**Example format:**
"Cinematic tracking shot transitioning from [scene 1 description] to [scene 2 description], with smooth camera movement, atmospheric lighting, [specific visual details]..."
`,Se=`
你是一位专精于短剧和微电影的专业编剧 (Professional Screenwriter)。
你的任务是根据用户的核心创意和约束条件，创建一个引人入胜的**中文剧本大纲**。

**核心原则：剧本大纲只在章节层面规划，不细化到每集**

**如果提供了【参考信息 - 来自剧目精炼】：**
- 这些信息仅作为创作参考，用于启发灵感和确定方向
- 不要照搬，而是将其作为创作风格、主题方向的参考
- 可以借鉴其中的情感基调、受众定位、角色特征等元素
- 最终作品应该是原创的，融合用户的核心创意和你的专业创作

---

## 📊 剧集规模要求

本剧为 **{TotalEpisodes} 集**，需要规划 **{ChapterCount} 个章节**，每个章节包含 **{EpisodesPerChapter} 集**。

### 角色数量要求：{MinCharacters}-{MaxCharacters} 个角色

**角色分级与描述重点：**

**A. 核心角色（3-5人）- 需要详细小传**
- **主角团队**（2-3人）：故事的绝对核心
- **核心反派**（1-2人）：与主角对抗的主要力量

描述要求（每个角色80-120字）：
> **林萧** - 男主，24岁，表面冷漠的实习医生，实际拥有"死神之眼"，能看到他人的死亡倒计时。童年目睹父母被神秘组织杀害，从此封闭内心。独自在深山中修炼十年，学会控制自己的能力。性格：外冷内热，不善表达但内心善良，对正义有执着的追求。外貌：黑发黑瞳，修长身材，常穿白大褂，眼神深邃。

**B. 重要配角（8-12人）- 简单描述**
- 导师/盟友/中立角色等

描述要求（每个角色20-40字）：
> **苏晴** - 女主的闺蜜，性格活泼开朗，是女主的情感支撑，关键时刻提供帮助。

**C. 其他角色（剩余数量）- 一笔带过**
- 群演、背景角色、一次性角色等

描述要求（每个角色5-10字）：
> **护士小李** - 医院护士，配角。

### 物品数量要求：{MinItems}-{MaxItems} 个关键物品

**物品分级与描述：**

**A. 核心物品（3-5个）- 推动主线**
描述要求（每个物品30-50字）：
> **死神之眼徽章** - 林萧家族的传承信物，能增强持有者的超感能力，但会消耗生命力。黑色金属质地，雕刻着骷髅图案。

**B. 辅助物品（5-8个）- 特定章节使用**
描述要求（每个物品15-25字）：
> **医院门禁卡** - 进入特定区域的钥匙，第5集获得。

**C. 世界物品（剩余数量）- 丰富设定**
描述要求（每个物品10-15字）：
> **手术刀** - 林萧的随身物品。

---

## 🎯 章节结构与节奏要求

### 核心原则：每章包含2-5集，描述这几集的整体故事

### 节奏规律（必须严格遵循）

1. **小高潮**：每3-5集设置一次小高潮
   - 第3-5集：第一次小高潮
   - 第8-10集：第二次小高潮
   - 第13-15集：第三次小高潮
   - 以此类推...

2. **大转折**：每10-15集设置一次大转折
   - 第10-15集：剧情大反转/阵营重组/重大秘密揭露
   - 第20-25集：中期转折/角色关系巨变
   - 第30-35集：后期转折/核心冲突升级
   - 以此类推...

---

## 📝 输出格式要求 (必须严格遵守 Markdown 格式)

# 剧名 (Title)
**一句话梗概 (Logline)**: [一句话总结故事核心]
**类型 (Genre)**: [类型] | **主题 (Theme)**: [主题] | **背景 (Setting)**: [故事背景] | **视觉风格**: [Visual Style]

---

## 主要人物小传

### 核心角色（详细小传，80-120字/人）
* **[姓名]**: [角色定位] - [年龄] [外貌特征]。性格：[性格特点]。背景：[重要经历]。能力/特征：[特殊能力或标志性特征]。

### 重要配角（简单描述，20-40字/人）
* **[姓名]**: [角色定位和作用，简短描述]

### 其他角色（一笔带过，5-10字/人）
* **[姓名]**: [身份或作用]

---

## 关键物品设定

### 核心物品（30-50字/个）
* **[物品名称]**: [物品描述、功能、象征意义]

### 辅助物品（15-25字/个）
* **[物品名称]**: [物品描述和出现时机]

### 世界物品（10-15字/个）
* **[物品名称]**: [简要描述]

---

## 剧集结构规划（共 {TotalEpisodes} 集，{ChapterCount} 章）

### 章节格式标准（每章100-150字）

#### 第X章：章节名称（第A-B集）

**涉及角色**：[本章主要角色，3-5人]

**关键物品**：[本章重要物品，2-3个]

**章节剧情**（100-150字）：
[这几集的整体故事描述，包含起承转合]

- [第A集]：[发生了什么]
- [第A+1集]：[情节推进]
- [第B集]：[本章高潮/转折]

**关键节点**：[标注：小高潮 或 大转折]

---

### 章节示例

#### 第一章：觉醒篇（第1-4集）

**涉及角色**：林萧、苏晴、王院长

**关键物品**：死神之眼徽章、神秘纸条

**章节剧情**（120字）：
实习医生林萧发现自己能看到他人的死亡倒计时，从恐惧到逐渐接受这种能力。院长王建国察觉异常，暗中观察。林萧与护士苏晴建立信任，发现医院隐藏的密室。神秘黑衣人出现，留下纸条"我知道你能看到什么"。林萧意识到自己卷入巨大阴谋，与苏晴联手逃脱追捕。第4集高潮：林萧首次主动使用能力，看到王建国只剩3天寿命。

**关键节点**：小高潮（第4集）

---

## ⚠️ 重要规则

1. **只在章节层面规划**，不要细化到每集的具体场景
2. **每章100-150字**，简洁描述这几集的核心内容
3. **每章必须包含明确的起承转合**
4. **严格遵守节奏规律**：3-5集小高潮，10-15集大转折
5. **章节之间要有因果链条**，避免情节断裂
6. **角色描述按分级处理**：核心角色详细，配角简单，其他一笔带过
7. **物品描述按分级处理**：核心详细，辅助简略，世界物品最简
8. **物品名称必须统一**，不要使用同义词
9. **单集时长参考**: {Duration} 分钟
10. **在创作中请始终贯彻[Visual Style]的视觉美学**
11. **如有参考信息，灵活运用但不要生搬硬套，保持原创性**

---

## 📌 质量检查清单

在输出前，请确认：
- [ ] 章节数量 = {ChapterCount} 个
- [ ] 每章包含 {EpisodesPerChapter} 集
- [ ] 每章100-150字
- [ ] 核心角色有详细小传（80-120字/人）
- [ ] 重要配角有简单描述（20-40字/人）
- [ ] 其他角色有一笔带过（5-10字/人）
- [ ] 核心物品有详细描述（30-50字/个）
- [ ] 辅助物品有简略描述（15-25字/个）
- [ ] 世界物品有简单描述（10-15字/个）
- [ ] 每章有明确的起承转合
- [ ] 遵循3-5集小高潮、10-15集大转折规律
- [ ] 在关键节点处标注"小高潮"或"大转折"
- [ ] 章节之间有连贯性
- [ ] 全中文输出
`,be=`
你是一位专业的短剧分集编剧，擅长创作连贯、一致的系列剧集。
你的任务是根据提供的【剧本大纲】和【指定章节】，将该章节拆分为 N 个具体的剧集脚本。

**输入上下文：**
1. 剧本大纲 (Context) - 包含所有章节的概览
2. 目标章节 (Selected Chapter) - 当前要拆分的章节
3. 前序剧集摘要 (Previous Episodes Summary) - 之前已生成的剧集摘要，用于保持连贯性
4. 全局角色设定 (Global Characters) - 剧本大纲中定义的所有角色信息
5. 全局物品设定 (Global Items) - 剧本大纲中定义的所有关键物品信息
6. 拆分集数 (Split Count): [N]
7. 单集时长参考 (Duration Constraint)
8. 视觉风格 (Visual Style): [STYLE]
9. 修改建议 (Modification Suggestions): [如果提供] - 用户针对之前生成版本的修改意见

**连贯性和一致性要求 (CRITICAL):**

1. **角色一致性**:
   - 严格遵循【全局角色设定】中的角色外貌、性格、说话方式
   - 不要改变角色的既定特征（如：如果林霄是冷静内敛的，不要突然变得热血冲动）
   - 角色关系和互动方式要保持一致

2. **物品命名一致性**:
   - 严格使用【全局物品设定】中的标准名称
   - ❌ 错误：一会儿叫"脊骨"，一会儿叫"灵骨"
   - ✅ 正确：始终使用"脊骨"这个名称
   - 物品的特征、能力描述要保持一致

3. **剧情连贯性**:
   - 参考【前序剧集摘要】，确保时间线、事件顺序合理衔接
   - 角色的知识、状态应该承接前文（如：如果第1集主角受伤了，第2集应该体现这个状态）
   - 不要出现剧情矛盾或逻辑漏洞

4. **场景连贯性**:
   - 场景描述应该符合既定的视觉风格
   - 环境细节要保持一致（如：同一个房间的布局、装饰）

**输出要求：**
请直接输出一个 **JSON 数组**，不要包含 markdown 代码块标记（如 \`\`\`json），只输出纯 JSON 字符串。
数组中每个对象代表一集，格式如下：
[
  {
    "title": "第X集：[分集标题]",
    "content": "[详细剧本内容，包含场景描写、动作指令和对白。内容长度应符合时长限制。]",
    "characters": "[本集涉及的角色列表，必须与全局设定一致]",
    "keyItems": "[本集出现的关键物品列表，必须使用标准名称]",
    "visualStyleNote": "[针对本集的视觉风格备注]",
    "continuityNote": "[本集的连贯性说明，如承接前文哪件事、角色状态变化等]"
  },
  ...
]

**内容要求：**
1. **全中文写作**。

2. **剧本内容长度要求（CRITICAL - 必须严格遵守）**：
   - 每分钟时长需要 **200-250字** 的详细剧本内容
   - 例如：1分钟剧集 = 200-250字，2分钟剧集 = 400-500字
   - **如果对话较多，字数应相应增加**（对话+场景描述的字数密度更高）
   - 计算公式：目标字数 = 时长(分钟) × 200-250字/分钟
   - 如果内容不足，AI应该：
     * 增加更详细的场景描述（环境、光影、氛围）
     * 添加更多角色的肢体动作和表情细节
     * 扩充对话内容，增加角色互动
     * 描述角色的内心活动和情感变化
     * 加入更多感官细节（声音、气味、触感等）

3. **内容结构要求**：
   - 剧本内容 (content) 必须包含：
     * **场景描述** (Scene Action)：详细的环境描写、光影氛围、空间布局
     * **肢体动作** (Physical Actions)：角色的身体姿势、动作细节、位置移动
     * **表情细节** (Facial Expressions)：眼神、微表情、情绪变化
     * **精彩对白** (Dialogue)：符合角色性格的对话，推动剧情发展
     * **情感描写** (Emotional Depth)：内心活动、情感转变、动机暗示
   - 确保 N 个剧集能够完整覆盖所选章节的情节，并且每集结尾都要有悬念 (Cliffhanger)。
   - 场景描述应体现 [STYLE] 的视觉特点。

4. **细节扩写技巧**：
   - 不要只写"他走进房间"，要写"他推开沉重的红木门，脚步沉重地踏入昏暗的书房，皮鞋在大理石地板上发出清脆的回响"
   - 不要只写"她哭了"，要写"她的眼泪如断了线的珍珠般滑落，肩膀随着压抑的抽泣微微颤抖，双手紧紧攥着衣角，指节泛白"
   - 不要只写"房间很乱"，要写"书本散落一地，纸张如同秋风中的落叶般铺满整个房间，书架歪斜，几本书籍摇摇欲坠地挂在边缘"

5. **如果提供了修改建议，请根据建议调整剧本内容，优化情节、对白或场景描述。**

6. **在每集的continuityNote中明确说明本集与剧情主线的衔接关系。**
`,ve=`
你是一位世界级的电影导演和摄影指导 (Director of Photography)。
你的任务是根据提供的【剧集脚本】，将其拆解为一系列专业的**电影分镜头 (Cinematic Shots)**。

**输入约束：**
1. 剧集内容 (Episode Content): 提供的文本。
2. 拆解数量 (Shot Count): [N] 个镜头。
3. 镜头时长 (Shot Duration): [T] 秒。
4. 视觉风格 (Visual Style): [STYLE]

**输出格式要求：**
必须直接输出一个 **JSON 数组**，不要包含任何 Markdown 标记。
数组中每个对象必须严格包含以下字段（全部为 String 类型）：

[
  {
    "subject": "主体：[详细描述人物外貌、动作、情绪]",
    "scene": "场景：[时间、地点、光影、氛围]",
    "camera": "镜头语言：[景别、角度、运镜方式、焦点]",
    "lighting": "光影：[光源性质、光比、色调]",
    "dynamics": "动态与特效：[环境动态、物理特效]",
    "audio": "声音：[人声、音效、BGM]",
    "style": "风格与质感：[画面风格、分辨率、胶片感]",
    "negative": "负面约束：[禁止出现的内容]"
  },
  ...
]

**内容创作要求：**
1. **视觉语言专业化**：使用专业的电影术语（如：侧逆光、浅景深、推镜头、荷兰角等）。
2. **画面感极强**：描述必须极其具体，能够直接指导 AI 生成高质量画面。
3. **连贯性**：镜头之间要有逻辑衔接，服务于叙事。
4. **情感传递**：通过光影和构图强化角色的情绪。
5. **风格一致性**：确保所有镜头的描述符合指定的 [STYLE]。
`,Ae=`
你是一位专业的影视分镜师和摄影指导 (Storyboard Artist & DoP)。
你的任务是将提供的【剧集脚本内容】细化拆分为详细的**影视级分镜脚本**。

**输入约束：**
1. 剧集标题 (Episode Title): 提供的标题
2. 剧集内容 (Episode Content): 提供的剧本文本
3. 目标总时长 (Total Duration): [N] 秒
4. 视觉风格 (Visual Style): [STYLE]

**输出格式要求：**
必须直接输出一个 **JSON 数组**，不要包含任何 Markdown 标记（如 \`\`\`json）。
数组中每个对象代表一个分镜，格式如下：

[
  {
    "shotNumber": 1,
    "duration": 2,
    "scene": "教室 - 白天 - 靠窗最后一排",
    "characters": ["林霄"],
    "shotSize": "特写",
    "cameraAngle": "低位仰拍",
    "cameraMovement": "固定",
    "visualDescription": "(林霄坐在靠窗座位上，单手托腮，侧身望向窗外)阳光从窗外洒在林霄的侧脸上，他目光空洞地望向窗外，教室里其他同学的声音模糊成背景音",
    "dialogue": "无",
    "visualEffects": "浅景深，背景虚化；暖色调光线；ANIME风格，强调眼神细节",
    "audioEffects": "环境音 - 教室嘈杂声（低音量）"
  },
  ...
]

**拆分要求（必须严格遵守）：**

**1. 时长控制（CRITICAL - 最重要要求）**
- 每个分镜时长：严格控制在 **1-4 秒** 之间
- 平均镜头时长：2-3秒（保持快节奏）
- 不得出现超过4秒的长镜头
- 不得出现少于1秒的碎片化镜头

**2. 分镜数量计算（必须满足最低要求）**
根据总时长智能计算分镜数量：
- **1分钟内容（60秒）**：**至少 20 个分镜**
  - 最少：20个分镜（平均3秒/镜）
  - 推荐：25-30个分镜（平均2-2.4秒/镜）
  - 最多：60个分镜（平均1秒/镜）
- **2分钟内容（120秒）**：**至少 40 个分镜**
  - 最少：40个分镜（平均3秒/镜）
  - 推荐：50-60个分镜（平均2-2.4秒/镜）
  - 最多：120个分镜（平均1秒/镜）
- **3分钟内容（180秒）**：**至少 60 个分镜**
  - 最少：60个分镜（平均3秒/镜）
  - 推荐：75-90个分镜（平均2-2.4秒/镜）
  - 最多：180个分镜（平均1秒/镜）

**3. 时间精确（强制要求）**
- **所有分镜的时长总和必须等于或大于目标总时长**
- **不得低于目标总时长**（这是底线要求）
- 如果超出，允许最多超出5秒（考虑到内容完整性）
- 例如：目标60秒，生成总时长可以在60-65秒之间
- 例如：目标120秒，生成总时长可以在120-125秒之间

**4. 时长不足的补偿策略**
如果计算后发现总时长不足，必须：
- 增加更多细节镜头（如：特写角色反应、环境细节）
- 将长镜头拆分为多个短镜头
- 添加过渡镜头或转场镜头
- 补充角色表情变化的镜头
- **严禁通过增加单个镜头时长来凑时间**（每个镜头仍必须在1-4秒范围内）

**5. 剧情结构智能拆分（核心要求）**
根据内容类型动态调整镜头节奏：

**关键情节/高潮场景**：
- 使用更多短镜头（1-2秒）
- 快速切换，营造紧张感
- 强化戏剧冲突
- 例如：对峙、冲突、意外发生、情感爆发时刻

**情感戏/对话场景**：
- 使用中等时长镜头（2-3秒）
- 适度推拉，跟随情绪
- 展现角色反应和微表情
- 例如：对话、思考、内心戏

**环境描写/转场**：
- 使用较长镜头（3-4秒）
- 建立空间感
- 缓和节奏
- 例如：环境空镜、场景切换

**动作场面**：
- 使用极短镜头（1秒）
- 快速剪辑
- 强化动感
- 例如：追逐、打斗、突发动作

**5. 内容结构识别**
必须识别并优先处理以下结构：
- 【场景】标记：场景切换处必须有分镜点
- 【画面】标记：画面描述重点处
- 对话：每个角色发言应有独立镜头（1-2秒）
- 动作：每个关键动作分解为1-2秒镜头
- 情绪：情绪变化点应有镜头切换

**内容要求：**

1. **专业术语**：
   - 景别：大远景、远景、全景、中景、中近景、近景、特写、大特写
   - 拍摄角度：视平、高位俯拍、低位仰拍、斜拍、越肩、鸟瞰
   - 运镜方式：固定、横移、俯仰、横摇、升降、轨道推拉、变焦推拉、正跟随、倒跟随、环绕、滑轨横移

2. **画面描述详细**：
   - **必须首先描述角色的肢体状态/身体姿势**（这是最重要的要求）
     - ✅ 正确："(秦烈躺在地上，浑身湿透)秦烈的眼睛里充满了不屈的怨毒，瞳孔深处燃烧着仇恨的火焰。"
     - ❌ 错误："秦烈的眼睛里充满了不屈的怨毒，瞳孔深处燃烧着仇恨的火焰。"
   - 肢体状态描述应包括：
     - 身体姿势：站着、坐着、躺着、跪着、蹲着、弯腰等
     - 身体状态：受伤、疲惫、湿透、颤抖、紧绷等
     - 位置关系：在地面上、靠墙坐着、悬在空中等
   - 在描述面部表情、眼神、细节之前，必须先交代角色的身体状态
   - 必须包含具体的人物动作、表情、环境细节
   - 描述要有画面感，能够直接指导AI生成

3. **场景信息完整**：
   - 格式："地点 - 时间 - 具体位置"
   - 例如："教室 - 白天 - 靠窗最后一排"

4. **视觉效果专业**：
   - 包含景深、色调、特效、风格等信息
   - 必须符合指定的 [STYLE] 视觉风格

5. **连贯性**：
   - 分镜之间要有逻辑衔接
   - 服务于整体叙事节奏
   - 镜头组接要符合视听语言规律
   - **肢体状态连贯性**：相邻分镜中，角色的身体姿势、位置状态应保持一致（除非有动作变化）
     - 例如：如果前一个镜头角色是"躺在地上"，下一个特写镜头也要在描述中暗示这个状态
     - 使用括号标注肢体状态以保持一致性："(角色躺在地上)"

6. **对白处理**：
   - 如果有对白，标注角色名和对白内容
   - 区分正常对白、内心独白(Voice Over)、旁白等
   - 如果无对白，写"无"

**拆分策略示例：**

*示例1：对话场景（15秒）*
- 镜头1：(林霄坐在靠窗座位上，单手托腮)林霄望向窗外，眼神空洞（2秒）
- 镜头2：(林霄坐着，侧脸特写)阳光洒在林霄侧脸上（2秒）
- 镜头3：(另一位同学站在林霄桌前)同学低头看向林霄（2秒）
- 镜头4：(林霄坐着，未回头)林霄眼皮微微颤动（2秒）
- 镜头5：(过肩镜头，林霄坐着)两人对话（3秒）
- 镜头6：(教室全景)教室里的其他同学在交谈（2秒）
- 镜头7：(林霄坐着，正面特写)林霄眼神逐渐聚焦（2秒）
= 总共7个镜头，15秒

*示例2：动作场景（10秒）*
- 镜头1：(秦烈站立，紧握拳头)秦烈怒视前方（1秒）
- 镜头2：(秦烈向前冲出)秦烈冲向对手（1秒）
- 镜头3：(两人肢体交错)特写冲击瞬间（1秒）
- 镜头4：(秦烈后退半步，踉跄)秦烈受到冲击（2秒）
- 镜头5：(秦烈单膝跪地，喘息)环境氛围渲染（2秒）
- 镜头6：(秦烈跪在地上，抬头)秦烈眼中燃烧不屈火焰（3秒）
= 总共6个镜头，10秒

**画面描述范例对比：**
- ❌ 缺少肢体状态："秦烈的眼睛里充满了不屈的怨毒，瞳孔深处燃烧着仇恨的火焰。"
- ✅ 包含肢体状态："(秦烈跪在地上，浑身湿透，雨水顺着发梢滴落)秦烈的眼睛里充满了不屈的怨毒，瞳孔深处燃烧着仇恨的火焰。"

**重要提示：**
- **每个分镜的visualDescription必须以角色肢体状态开头**（用括号标注）
- 输出必须是纯 JSON 数组，不要包含任何其他文字
- 每个分镜对象的所有字段都必须填写
- duration 字段必须是数字类型（1-4之间）
- characters 字段必须是字符串数组
- 优先保证剧情节奏，而非机械均分时长
- 关键时刻多用短镜头强化冲击力
- 过渡时刻可用较长镜头缓和节奏
`,$=async(e,t,a=[],n={},i)=>b("generateImageFromText",async()=>p.generateImages(e,t,a,n),{model:t,prompt:e.substring(0,200)+(e.length>200?"...":""),options:n,inputs:a.map(()=>"[Image Data]")},i),G=async(e,t,a={},n,i,r,l)=>b("generateVideo",async()=>{T("视频生成");const c=N(),o=e+", cinematic lighting, highly detailed, photorealistic, 4k, smooth motion, professional color grading";let d=a.resolution||(t.includes("pro")?"1080p":"720p"),u={prompt:o},g=null;if(n)try{const h=await V(n);u.image={imageBytes:h.data,mimeType:h.mimeType},g=h.fullDataUri}catch{}i&&(u.video=i);const m={numberOfVideos:1,aspectRatio:a.aspectRatio||"16:9",resolution:d};if(r&&r.length>0&&t==="veo-3.1-generate-preview"){const h=[];for(const y of r){const w=await V(y);h.push({image:{imageBytes:w.data,mimeType:w.mimeType},referenceType:"ASSET"})}m.referenceImages=h}const f=a.count||1;try{const h=[];for(let A=0;A<f;A++)h.push(me(async()=>{let E=await c.models.generateVideos({model:t,...u,config:m});for(;!E.done;)await z(5e3),E=await c.operations.getVideosOperation({operation:E});return E}));const y=await Promise.allSettled(h),w=[];let S=null;for(const A of y)if(A.status==="fulfilled"){const E=A.value.response?.generatedVideos?.[0]?.video;if(E?.uri){const M=`${E.uri}&key=`;w.push(M),S||(S=E)}}if(w.length===0)throw y.find(E=>E.status==="rejected")?.reason||new Error("Video generation failed (No valid URIs).");return{uri:w[0],uris:w,videoMetadata:S,isFallbackImage:!1}}catch(h){try{const y="Cinematic movie still, "+o,w=g?[g]:[];return{uri:(await $(y,v("image"),w,{aspectRatio:a.aspectRatio},l))[0],isFallbackImage:!0}}catch{throw new Error("Video generation failed and Image fallback also failed: "+j(h))}}},{model:t,prompt:e.substring(0,200)+(e.length>200?"...":""),options:{aspectRatio:a.aspectRatio,resolution:a.resolution,count:a.count,generationMode:a.generationMode},inputs:{hasImage:!!n,hasVideo:!!i,referenceImagesCount:r?.length||0},inputImagesCount:(n?1:0)+(r?.length||0)},l),W=async(e,t,a,n)=>b("analyzeVideo",async()=>{T("视频分析");const i=N();let r=null;if(e.startsWith("data:")){const c=e.match(/^data:(video\/\w+);base64,/)?.[1]||"video/mp4",s=e.replace(/^data:video\/\w+;base64,/,"");r={mimeType:c,data:s}}else throw new Error("Direct URL analysis not implemented in this demo. Please use uploaded videos.");return(await i.models.generateContent({model:a,contents:{parts:[{inlineData:r},{text:t}]}})).text||"Analysis failed"},{model:a,prompt:t.substring(0,200)+(t.length>200?"...":""),hasVideo:e.startsWith("data:")},n),H=async(e,t,a)=>(T("图片编辑"),(await $(t,a,[e],{count:1}))[0]),K=async(e,t,a,n)=>{const i=a||v("text");return b("planStoryboard",async()=>{const r=await p.generateContent(`Context: ${t}

User Idea: ${e}`,i,{responseMimeType:"application/json",systemInstruction:STORYBOARD_INSTRUCTION});try{return JSON.parse(r||"[]")}catch{return[]}},{model:i,prompt:e.substring(0,200)+(e.length>200?"...":""),contextLength:t.length},{...n,platform:p.getCurrentProvider().getName()})},X=async(e,t,a,n,i)=>b("generateScriptPlanner",async()=>{const r=t.episodes||10,l=4,c=Math.ceil(r/l),s=Math.round(10+r*.15),o=Math.round(s*1.3),d=Math.round(8+r*.1),u=Math.round(d*1.25);let g=Se.replace(/{TotalEpisodes}/g,String(r)).replace(/{ChapterCount}/g,String(c)).replace(/{EpisodesPerChapter}/g,String(l)).replace(/{MinCharacters}/g,String(s)).replace(/{MaxCharacters}/g,String(o)).replace(/{MinItems}/g,String(d)).replace(/{MaxItems}/g,String(u)).replace(/{Duration}/g,String(t.duration||1)),m="";if(a&&Object.keys(a).length>0){m=`

【参考信息 - 来自剧目精炼】
`,m+=`以下信息仅作为创作参考，不要完全照搬，而是融入你的创意中：

`;const w={dramaIntroduction:"剧集介绍参考",worldview:"世界观参考",logicalConsistency:"逻辑自洽性参考",extensibility:"延展性参考",characterTags:"角色特征参考",protagonistArc:"主角弧光参考",audienceResonance:"受众共鸣参考",artStyle:"画风参考"};for(const[S,A]of Object.entries(a))if(A&&A.length>0){const E=w[S]||S;m+=`${E}:
`,A.forEach(M=>{m+=`  - ${M}
`}),m+=`
`}}const f=`
核心创意: ${e}
主题: ${t.theme||"N/A"}
类型: ${t.genre||"N/A"}
背景: ${t.setting||"N/A"}
预估集数: ${t.episodes||10}
单集时长: ${t.duration||1} 分钟
视觉风格: ${t.visualStyle||"N/A"}${m}
`,h=n||v("text");return await p.generateContent(f,h,{systemInstruction:g})},{model:n||v("text"),prompt:e.substring(0,200)+(e.length>200?"...":""),config:t,hasRefinedInfo:!!a&&Object.keys(a).length>0},{...i,platform:p.getCurrentProvider().getName()}),Q=async(e,t,a,n,i,r,l,c,s)=>b("generateScriptEpisodes",async()=>{const o=Ee(e),d=Ne(e),u=c&&c.length>0?c.map((h,y)=>`
第${y+1}集：${h.title}
- 涉及角色：${h.characters}
- 关键物品：${h.keyItems||"无"}
- 剧情摘要：${h.content.substring(0,200)}...
                `).join(`
`):"无前序剧集（这是第一批生成的剧集）",g=`
剧本大纲全文：
${e}

目标章节：${t}
拆分集数：${a}
单集时长参考：${n} 分钟
视觉风格：${i||"N/A"}
${r?`
修改建议：${r}`:""}

=== 全局角色设定 ===
${o}

=== 全局物品设定 ===
${d}

=== 前序剧集摘要（用于保持连贯性）===
${u}

连贯性要求：
1. 角色特征、说话方式必须与【全局角色设定】一致
2. 物品名称必须严格使用【全局物品设定】中的标准名称
3. 剧情应承接【前序剧集摘要】中的事件和角色状态
4. 每集的continuityNote要明确说明与剧情主线的衔接关系
`,m=l||v("text"),f=await p.generateContent(g,m,{systemInstruction:be,responseMimeType:"application/json"});try{const h=f?.replace(/```json/g,"").replace(/```/g,"").trim()||"[]";return JSON.parse(h)}catch{throw new Error("生成剧本格式错误，请重试")}},{model:l||v("text"),chapter:t,splitCount:a,duration:n,style:i,hasModification:!!r,hasPreviousEpisodes:!!c&&c.length>0},{...s,platform:p.getCurrentProvider().getName()});function Ee(e){const t=e.match(/## 主要人物小传[^#]*/s);return t?t[0].trim():"未找到明确的角色定义"}function Ne(e){const t=e.match(/## 关键物品设定[^#]*/s);return t?t[0].trim():"未找到明确的物品定义"}const xe=async(e,t,a,n,i,r,l)=>{const c=r||v("text");return b("generateDetailedStoryboard",async()=>{const s=Math.floor(a/3),o=Math.floor(a/2.5),d=a,u=`🎯 CRITICAL TASK - 必须满足时长要求

【剧集信息】
Title: ${e}
Content: ${t}
Duration: ${a} seconds
Style: ${n}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 绝对要求（ABSOLUTE REQUIREMENTS）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 分镜数量强制要求：
   ✅ MUST生成至少 ${s} 个分镜
   ✅ 推荐生成 ${o} 个分镜
   ✅ 当前你的任务是生成 ${a} 秒的视频分镜

2️⃣ 时长总和强制要求：
   ✅ 所有分镜的duration总和 ≥ ${a} 秒
   ✅ 绝对不能少于 ${a} 秒（这是底线）
   ✅ 每个分镜时长范围：1-4秒

3️⃣ 计算方法：
   • 如果生成 ${s} 个分镜，每个平均 3秒 → 总计 ${s*3}秒 ✅
   • 如果生成 ${o} 个分镜，每个平均 2.5秒 → 总计 ${Math.round(o*2.5)}秒 ✅
   • 如果生成 ${d} 个分镜，每个平均 1秒 → 总计 ${d}秒 ✅

4️⃣ 错误示例（必须避免）：
   ❌ 只生成 20 个分镜 → 总计最多 80秒 < ${a}秒 → 失败
   ❌ 只生成 ${s-5} 个分镜 → 总计最多 ${(s-5)*4}秒 < ${a}秒 → 失败
   ✅ 生成 ${s} 个分镜 → 总计 ${s*3}秒 ≥ ${a}秒 → 成功

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

输出JSON数组，包含至少 ${s} 个分镜对象。`,g=await p.generateContent(u,c,{systemInstruction:Ae,responseMimeType:"application/json"});try{const m=g?.replace(/```json/g,"").replace(/```/g,"").trim()||"[]",f=JSON.parse(m);let h=0,y=0,w=0;const S=f.map((C,I)=>{let x=C.duration||3;x<1?(x=1,y++):x>4&&(x=4,y++),x!==C.duration&&w++;const O=h,D=h+x;return h=D,{id:`shot-${Date.now()}-${I}`,shotNumber:C.shotNumber||I+1,duration:x,scene:C.scene||"",characters:Array.isArray(C.characters)?C.characters:[],shotSize:C.shotSize||"",cameraAngle:C.cameraAngle||"",cameraMovement:C.cameraMovement||"",visualDescription:C.visualDescription||"",dialogue:C.dialogue||"无",visualEffects:C.visualEffects||"",audioEffects:C.audioEffects||"",startTime:O,endTime:D}}),A=S.reduce((C,I)=>C+I.duration,0),E=A/S.length,M=Math.min(...S.map(C=>C.duration)),Ve=Math.max(...S.map(C=>C.duration)),k=A-a;if(k<0){const I=Math.abs(k)/a*100,x=Math.floor(a/3),O=Math.floor(a/2.5)}else k>5;const ce=Math.floor(a/3),Fe=Math.floor(a/2.5),le=a;return S.length<ce||S.length>le,S}catch(m){throw m instanceof Error?m:new Error("分镜生成失败，请重试")}},{model:c,episodeTitle:e,totalDuration:a,visualStyle:n,contentLength:t.length},{...l,platform:p.getCurrentProvider().getName()})},Z=async(e,t,a,n,i,r)=>{const l=i||v("text");return b("generateCinematicStoryboard",async()=>{const c=`
    Episode Script: ${e}
    Shot Count: ${t}
    Shot Duration: ${a}s
    Visual Style: ${n}
    `,s=await p.generateContent(c,l,{systemInstruction:ve,responseMimeType:"application/json"});try{const o=s?.replace(/```json/g,"").replace(/```/g,"").trim()||"[]";return JSON.parse(o).map((u,g)=>({id:`shot-${Date.now()}-${g}`,subject:u.subject||"N/A",scene:u.scene||"N/A",camera:u.camera||"N/A",lighting:u.lighting||"N/A",dynamics:u.dynamics||"N/A",audio:u.audio||"N/A",style:u.style||"N/A",negative:u.negative||"",duration:a}))}catch{throw new Error("分镜生成失败，请重试")}},{model:l,shotCount:t,shotDuration:a,style:n,scriptLength:e.length},{...r,platform:p.getCurrentProvider().getName()})},ee=async(e,t,a,n)=>{const i=v("text");return b("orchestrateVideoPrompt",async()=>{const r=N(),l=e.map(s=>({inlineData:{data:s.replace(/^data:.*;base64,/,""),mimeType:"image/png"}}));return l.push({text:`Create a single video prompt that transitions between these images. User Intent: ${t}`}),(await r.models.generateContent({model:i,config:{systemInstruction:we},contents:{parts:l}})).text||t},{model:i,prompt:t.substring(0,200)+(t.length>200?"...":""),imageCount:e.length},{...n,platform:p.getCurrentProvider().getName()})},te=e=>"A sequence showing: "+e.map(t=>t.transition?.prompt||"scene").join(" transitioning to "),ae=async(e,t,a,n,i)=>b("generateAudio",async()=>{if(p.getCurrentProviderType()==="gemini"){const s=N(),o=[{text:e}];if(a){const f=a.match(/^data:(audio\/\w+);base64,/)?.[1]||"audio/wav",h=a.replace(/^data:audio\/\w+;base64,/,"");o.push({inlineData:{mimeType:f,data:h}})}const d=n?.persona?.label==="Deep Narrative"?"Kore":"Puck",g=(await s.models.generateContent({model:t,contents:{parts:o},config:{responseModalities:[J.AUDIO],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:d}}}}})).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;if(!g)throw new Error("Audio generation failed");return he([g],24e3)}const c=await p.getCurrentProvider().generateContent(e,t,n?.persona?{systemInstruction:n.persona.desc}:void 0);if(c.startsWith("http://")||c.startsWith("https://")||c.startsWith("data:"))return c;throw new Error("OpenRouter 音频生成暂不支持，请使用 Gemini API 进行音频生成")},{model:t,prompt:e.substring(0,200)+(e.length>200?"...":"")},{platform:p.getCurrentProvider().getName(),logType:"submission"}),Ie=async(e,t,a)=>{const n=v("audio");return b("transcribeAudio",async()=>{T("音频转录");const i=N(),r=e.match(/^data:(audio\/\w+);base64,/)?.[1]||"audio/wav",l=e.replace(/^data:audio\/\w+;base64,/,"");return(await i.models.generateContent({model:n,contents:{parts:[{inlineData:{mimeType:r,data:l}},{text:"Transcribe this audio strictly verbatim."}]}})).text||""},{model:n,hasAudio:!0},a)},Te=async(e,t)=>(T("实时会话"),N().live.connect({model:"gemini-2.5-flash-native-audio-preview-09-2025",callbacks:{onopen:()=>{},onmessage:r=>{r.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data&&e(r.serverContent.modelTurn.parts[0].inlineData.data)},onclose:t,onerror:r=>{t()}},config:{responseModalities:[J.AUDIO],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:"Kore"}}}}})),ne=async(e,t,a)=>{const n=t||v("text");return b("extractCharactersFromText",async()=>{const i=await p.generateContent(`提取以下剧本内容中的所有角色名：
${e}`,n,{responseMimeType:"application/json",systemInstruction:pe});try{const r=JSON.parse(i||"[]");return Array.isArray(r)?r:[]}catch{return[]}},{model:n,textLength:e.length},{...a,platform:p.getCurrentProvider().getName()})},re=async(e,t,a,n,i,r)=>{const l=i||v("text");return b("generateCharacterProfile",async()=>{const c=`
    Role Name: ${e}
    Script Context: ${t}
    Visual Style Context (CRITICAL): ${a||"Default"}
    ${n?`Additional User Description: ${n}`:"Auto-complete details based on context."}
    `,s=await p.generateContent(c,l,{responseMimeType:"application/json",systemInstruction:fe});try{const o=JSON.parse(s||"{}");return{id:`char-${Date.now()}-${Math.random()}`,name:o.name||e,alias:o.alias,basicStats:o.basicStats,profession:o.profession,personality:o.personality,motivation:o.motivation,values:o.values,weakness:o.weakness,relationships:o.relationships,habits:o.habits,appearance:o.appearancePrompt,rawProfileData:o}}catch{throw new Error("Character profile generation failed format")}},{model:l,characterName:e,hasStyleContext:!!a,hasCustomDesc:!1,contextLength:t.length},{...r,platform:p.getCurrentProvider().getName()})},ie=async(e,t,a,n,i)=>{const r=n||v("text");return b("generateSupportingCharacter",async()=>{const l=`
    Role Name: ${e}
    Script Context: ${t}
    Visual Style Context (CRITICAL): ${a||"Default"}
    This is a SUPPORTING CHARACTER - keep it simple and concise.
    `,c=await p.generateContent(l,r,{responseMimeType:"application/json",systemInstruction:ye});try{const s=JSON.parse(c||"{}");return{id:`char-${Date.now()}-${Math.random()}`,name:s.name||e,roleType:"supporting",basicStats:s.basicStats,profession:s.profession,personality:s.introduction,appearance:s.appearancePrompt,rawProfileData:s}}catch{throw new Error("Supporting character generation failed format")}},{model:r,characterName:e,roleType:"supporting",hasStyleContext:!!a,contextLength:t.length},{...i,platform:p.getCurrentProvider().getName()})},oe=async(e,t,a)=>{const n=t||v("text");return b("analyzeDrama",async()=>{const i=`
请分析以下剧集：${e}

注意：
1. 如果你对该剧有所了解，请提供详细的分析。
2. 如果你不了解该剧，请在 dramaIntroduction 字段中明确说明，并在其他字段中提供通用的分析框架建议。
`,r=await p.generateContent(i,n,{responseMimeType:"application/json",systemInstruction:Ce});try{let l=r?.trim()||"{}",c=null;try{c=JSON.parse(l)}catch{l=l.replace(/```json\s*/g,"").replace(/```\s*/g,"").trim();try{c=JSON.parse(l)}catch{const d=l.match(/\{[\s\S]*\}/);if(d)try{c=JSON.parse(d[0])}catch(u){throw new Error(`无法解析AI返回的JSON数据。
错误: ${u instanceof Error?u.message:"未知错误"}

💡 建议:
1. 重新尝试分析
2. 或切换到其他模型`)}else throw new Error("AI返回的内容中未找到有效的JSON格式")}}return{dramaName:c.dramaName||e,dramaIntroduction:c.dramaIntroduction||"暂无剧集信息",worldview:c.worldview||"",logicalConsistency:c.logicalConsistency||"",extensibility:c.extensibility||"",characterTags:c.characterTags||"",protagonistArc:c.protagonistArc||"",audienceResonance:c.audienceResonance||"",artStyle:c.artStyle||""}}catch(l){throw l instanceof Error?l:new Error("剧目分析失败，请重试")}},{model:n,dramaName:e},{...a,platform:p.getCurrentProvider().getName()})},Me=`
你是一个专业的剧本分析专家。请从给定的剧目分析文本中提取关键信息，
转换为精炼且易懂的信息条目。

**重要：你必须严格按照输入的分析类别进行提取，不要自行添加或删除类别。**

**输出格式要求 (JSON):**
根据输入的分析内容，输出对应的 JSON 对象。例如：
- 如果输入包含"剧集介绍"，输出应包含 "dramaIntroduction" 字段
- 如果输入包含"世界观分析"，输出应包含 "worldview" 字段
- 以此类推

**核心原则 - 只提取通用特征，禁止具体名词：**
1. ❌ **禁止出现**：剧名、角色名、地名、作者名等任何专有名词
2. ✅ **必须使用**：描述性词汇、形容词、通用特征
3. **目的**：提取的是"类型、风格、特征"，而不是"具体内容"

**提取原则：**
1. **灵活长度**：每条信息可以是短标签（如"青少年"）或完整描述（如"主角从弱小逐步成长为强者的励志历程"）
2. **清晰完整**：确保提取的内容含义清晰，信息完整，读者能准确理解
3. **保留精华**：提取最有价值的关键信息，去除冗余和废话
4. **数量灵活**：根据内容实际情况决定数量，可多可少，无需凑数
5. **纯JSON格式**：必须输出纯 JSON 格式，不要包含 markdown 标记（如 \`\`\`json）
6. **严格对应**：只提取输入中明确存在的分析类别，不要添加额外的类别

**提取示例：**

❌ **错误示例（包含具体名词）：**
- "《斗破苍穹》讲述萧炎的成长故事"
- "主角萧炎在乌坦城开始修炼"
- "纳兰嫣然退婚引发矛盾"

✅ **正确示例（只用描述和形容词）：**
- "主角从天才跌落废柴，历经三年屈辱后逆袭成长"
- "以修炼等级体系为核心的玄幻世界观"
- "退婚情节引发的复仇与证明自我的动力"
- "热血奋斗、永不放弃的精神内核"

✅ **短标签形式：**
- "青少年受众"
- "逆袭成长"
- "热血励志"
- "玄幻修炼"

✅ **完整描述形式：**
- "故事以被同学排挤的少年为主角，引发青少年对归属感的强烈共鸣"
- "主角在逆境中不断成长，最终通过自己的努力获得认可"
- "世界观设定融合了现代都市与超自然元素，呈现出独特的奇幻氛围"

✅ **混合形式（根据内容特点灵活选择）：**
- "温暖治愈的情感基调"
- "永不放弃的精神贯穿始终，传递正能量"
- "日式动画风格"
- "主角从弱者逆袭的经典成长线"
`,Re=async(e,t,a,n)=>{const i=a||v("text");return b("extractRefinedTags",async()=>{const r={dramaIntroduction:"剧集介绍",worldview:"世界观分析",logicalConsistency:"逻辑自洽性",extensibility:"延展性分析",characterTags:"角色标签",protagonistArc:"主角弧光",audienceResonance:"受众共鸣点",artStyle:"画风分析"},l=t.map(o=>{const d=r[o]||o,u=e[o]||"";return`【${d}】
${u}`}).join(`

`),c=t.map(o=>{const d=r[o]||o;return`"${o}": ["${d}精炼信息1", "${d}精炼信息2", ...]`}).join(`,
  `),s=`请从以下剧目分析内容中提取关键信息。

**输入的分析内容：**
${l}

**期望输出的JSON格式：**
{
  ${c}
}

请严格按照上述字段进行提取，只提取这些字段，不要添加其他字段。`;try{let d=(await p.generateContent(`${Me}

${s}`,i,{responseMimeType:"application/json"}))?.trim()||"{}";d=d.replace(/```json\s*/g,""),d=d.replace(/```\s*/g,"");const u=d.indexOf("{"),g=d.indexOf("["),m=Math.min(u!==-1?u:1/0,g!==-1?g:1/0);m!==1/0&&(d=d.substring(m));const f=d.lastIndexOf("}"),h=d.lastIndexOf("]"),y=Math.max(f!==-1?f:-1,h!==-1?h:-1);y!==-1&&(d=d.substring(0,y+1)),d=d.trim();const w=JSON.parse(d),S={};for(const A of t)S[A]=w[A]||[];return S}catch{const d={};for(const u of t)d[u]=[];return d}},{model:i,selectedFieldsCount:t.length,selectedFields:t},{...n,platform:p.getCurrentProvider().getName()})},$e=`你是一位Prompt工程专家，专门生成可复用的**场景风格描述词模板**。

**核心任务**：
生成一段通用的风格描述词，用作后续场景图像/视频生成的**风格前缀**。
这段描述词不包含具体场景内容，只包含画风、渲染质量、色调、光影等抽象风格元素。

**输出要求**：
1. 纯风格描述，不包含具体物体、场景、构图
2. 可以直接作为prompt前缀使用
3. 长度：30-50个英文单词
4. 使用逗号分隔关键词

**必须包含的元素**：
1. **核心风格标签**：
   - REAL: photorealistic style, cinematic
   - ANIME: anime style, anime background art
   - 3D: 3d render, octane render

2. **渲染质量**：
   - REAL: 8k uhd, high resolution, professional photography
   - ANIME: high quality, masterpiece, detailed illustration
   - 3D: ray tracing, global illumination, 8k

3. **光影风格**（抽象描述）：
   - REAL: natural lighting, volumetric lighting, soft shadows
   - ANIME: soft lighting, rim light, vibrant colors
   - 3D: studio lighting, HDRI lighting, ambient occlusion

4. **色调风格**：
   - 暖色调：warm tone, golden palette
   - 冷色调：cool tone, blue palette
   - 中性：natural colors, balanced colors

5. **画面质感**：
   - REAL: sharp focus, depth of field, bokeh effect
   - ANIME: cel shading, flat colors, clean lines
   - 3D: PBR materials, realistic reflections

**禁止包含**：
❌ 具体场景：forest, street, room
❌ 具体物体：tree, building, furniture
❌ 构图角度：wide shot, close-up, from above
❌ 具体光源：sunset, candlelight, neon lights

**输出格式**：
纯文本，逗号分隔，无换行，无markdown格式`,ke=`你是一位Prompt工程专家，专门生成可复用的**人物风格描述词模板**。

**核心任务**：
生成一段通用的风格描述词，用作后续人物图像/视频生成的**风格前缀**。
这段描述词不包含具体人物特征，只包含画风、渲染质量、人物绘制风格等抽象元素。

**输出要求**：
1. 纯风格描述，不包含具体外貌、服装、姿态
2. 可以直接作为prompt前缀使用
3. 长度：30-50个英文单词
4. 使用逗号分隔关键词

**必须包含的元素**：
1. **核心风格标签**：
   - REAL: photorealistic portrait, realistic human
   - ANIME: anime character, anime style
   - 3D: photorealistic 3D CG character

2. **渲染质量**：
   - REAL: 8k uhd, professional portrait photography, high resolution
   - ANIME: masterpiece, best quality, official art, detailed illustration
   - 3D: high poly model, 8k, clean 3d render, stylized rendering

3. **人物绘制质量**（抽象）：
   - REAL: detailed facial features, realistic skin texture, professional lighting
   - ANIME: beautiful detailed eyes, detailed character design, clean linework
   - 3D: smooth realistic skin, clean character design, realistic features

4. **画面质感**：
   - REAL: shallow depth of field, bokeh background, natural colors
   - ANIME: vibrant colors, cel shading, clean rendering
   - 3D: toon shading, vibrant colors, clean surfaces, artistic rendering, non-photorealistic

5. **光照风格**（适用于人物）：
   - REAL: soft portrait lighting, natural light, rim light
   - ANIME: soft shading, anime lighting, gentle highlights
   - 3D: studio lighting, soft shadows, ambient occlusion, three-point lighting

**禁止包含**：
❌ 具体外貌：long hair, blue eyes, fair skin
❌ 具体服装：dress, suit, uniform
❌ 具体姿态：standing, sitting, running
❌ 具体表情：smiling, serious, sad
❌ 具体年龄/性别：teenage girl, old man
❌ 构图角度：portrait, full body, close-up
❌ 真人皮肤纹理：skin texture, pores, wrinkles, skin details
❌ 照片质感：photorealistic, hyperrealistic, photo, photography

**输出格式**：
纯文本，逗号分隔，无换行，无markdown格式`,se=async(e,t,a,n,i,r)=>{const l=i||v("text");return b("generateStylePreset",async()=>{const c=e==="SCENE",s=c?$e:ke,o=`请生成一段${c?"场景":"人物"}风格描述词模板。

【上游视觉风格信息】
画风分析：${a.artStyle||"未提供"}
类型：${a.genre||"未提供"}
设定：${a.setting||"未提供"}

【视觉风格类型】
${t}

【用户补充】
${n||"无"}

【要求】
生成纯粹的风格描述词，不包含任何具体${c?"场景、物体或构图":"人物特征（外貌、服装、姿态、表情）"}。
只包含：画风、${c?"渲染":"人物绘制"}质量、光影风格、${c?"":"渲染"}质感等抽象元素。
这段描述词将作为前缀，用于后续所有${c?"场景":"人物"}图像生成。`;try{let u=(await p.generateContent(o,l,{systemInstruction:s}))?.trim()||"";u=u.replace(/```/g,"").replace(/^text\n/g,"").trim();const g={SCENE_REAL:"people, characters, humans, anime, cartoon, painting, illustration, 3d render, low quality, blurry, watermark, signature",SCENE_ANIME:"realistic, photo, 3d, low quality, blurry, monochrome, watermark",SCENE_3D:"2d, flat, anime, photo, painting, low poly, low quality, blurry",CHARACTER_REAL:"anime, cartoon, illustration, 3d, cgi, bad anatomy, deformed, low quality, blurry, watermark",CHARACTER_ANIME:"realistic, photo, 3d, bad anatomy, bad hands, extra limbs, low quality, blurry, nsfw",CHARACTER_3D:"2d, flat, anime, photo, painting, low poly, bad topology, low quality, blurry"},m=`${e}_${t}`,f=g[m]||"low quality, blurry, watermark";return{stylePrompt:u,negativePrompt:f}}catch{throw new Error("风格提示词生成失败，请重试")}},{model:l,presetType:e,visualStyle:t,hasUserInput:!!n,hasUpstreamInfo:!!(a.artStyle||a.genre||a.setting)},{...r,platform:p.getCurrentProvider().getName()})},Ye=Object.freeze(Object.defineProperty({__proto__:null,analyzeDrama:oe,analyzeVideo:W,compileMultiFramePrompt:te,connectLiveSession:Te,detectTextInImage:B,editImageWithText:H,extractCharactersFromText:ne,extractLastFrame:q,extractRefinedTags:Re,generateAudio:ae,generateCharacterProfile:re,generateCinematicStoryboard:Z,generateDetailedStoryboard:xe,generateImageFromText:$,generateScriptEpisodes:Q,generateScriptPlanner:X,generateStylePreset:se,generateSupportingCharacter:ie,generateVideo:G,getClient:N,orchestrateVideoPrompt:ee,planStoryboard:K,transcribeAudio:Ie,urlToBase64:Y},Symbol.toStringTag,{value:"Module"})),P="model_usage_stats",Pe=e=>{const t=localStorage.getItem(P);if(!t)return{modelId:e,successCount:0,failureCount:0,consecutiveFailures:0};try{return JSON.parse(t)[e]||{modelId:e,successCount:0,failureCount:0,consecutiveFailures:0}}catch{return{modelId:e,successCount:0,failureCount:0,consecutiveFailures:0}}},F=(e,t,a)=>{const n=localStorage.getItem(P);let i={};try{n&&(i=JSON.parse(n));const r=i[e]||{modelId:e,successCount:0,failureCount:0,consecutiveFailures:0};t?(r.successCount++,r.consecutiveFailures=0,r.lastError=void 0,r.lastErrorTime=void 0):(r.failureCount++,r.consecutiveFailures++,r.lastError=a,r.lastErrorTime=Date.now()),i[e]=r,localStorage.setItem(P,JSON.stringify(i))}catch{}},Oe=e=>{const t=Pe(e);if(t.consecutiveFailures>=3&&t.lastErrorTime){const a=Date.now()-3e5;if(t.lastErrorTime>a)return!0}return!1};async function De(e,t,a={}){const{maxAttempts:n=3,retryOnSameModel:i=0,onModelFallback:r,excludedModels:l=[],enableFallback:c=!0}=a;let s=t;const o=[...l],d=[s];let u,g=0,m=0;for(;g<n;){if(Oe(s)){const f=U(s,o);if(!f||!c)return{success:!1,attempts:g+1,error:u||"All models failed or skipped",fallbackChain:d};r&&r(s,f,"Recent failures"),s=f,o.push(s),d.push(s),m=0,g++;continue}try{const f=await e(s);return F(s,!0),{success:!0,data:f,model:s,attempts:g+1,fallbackChain:d}}catch(f){u=String(f?.message||f),F(s,!1,u);const h=de(s);b(`model_fallback_attempt_${g+1}`,async()=>({success:!1,error:f}),{model:s,modelName:h?.name,error:u,attempt:g+1,sameModelRetry:m,isQuotaError:_(f),maxAttempts:n});const y=_(f);if(!y){if(m<i){m++,g++;continue}}if(m=0,!c||g>=n-1)return{success:!1,attempts:g+1,error:y?`Model ${s} quota exceeded. ${c?"Max attempts reached.":"Fallback disabled."}`:u,fallbackChain:d};const w=U(s,o);if(!w)return{success:!1,attempts:g+1,error:y?"All models quota exceeded or unavailable":u,fallbackChain:d};r&&r(s,w,y?"配额用完":"模型调用失败"),o.push(s),s=w,d.push(s),g++}}return{success:!1,attempts:n,error:u||"Max attempts reached",fallbackChain:d}}const Le=()=>p.getCurrentProviderType();function Ue(e){return ue(e)}async function _e(e,t,a,n,i){if(Le()==="yunwu")return await L(e,t,a,n);const l=Ue("image"),c=l.indexOf(t),s=c>=0?l.slice(c):l,o=await De(async d=>await L(e,d,a,n),t,{maxAttempts:s.length,retryOnSameModel:2,excludedModels:[],enableFallback:!0,onModelFallback:(d,u,g)=>{const m=new CustomEvent("model-fallback",{detail:{category:"image",from:d,to:u,reason:g}});window.dispatchEvent(m)}});if(!o.success||!o.data)throw new Error(o.error||"所有图片模型均不可用");return o.fallbackChain&&o.fallbackChain.length>1,o.data}const qe=Object.freeze(Object.defineProperty({__proto__:null,analyzeDrama:oe,analyzeVideo:W,compileMultiFramePrompt:te,detectTextInImage:B,editImageWithText:H,extractCharactersFromText:ne,extractLastFrame:q,generateAudio:ae,generateCharacterProfile:re,generateCinematicStoryboard:Z,generateImageFromText:$,generateImageWithFallback:_e,generateScriptEpisodes:Q,generateScriptPlanner:X,generateStylePreset:se,generateSupportingCharacter:ie,generateVideo:G,getClient:N,orchestrateVideoPrompt:ee,planStoryboard:K,urlToBase64:Y},Symbol.toStringTag,{value:"Module"}));export{G as a,N as b,Te as c,_e as d,B as e,re as f,ae as g,q as h,W as i,Ye as j,qe as k,ee as o,Ie as t,Y as u};
