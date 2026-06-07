async function v(){try{const a=await fetch("http://localhost:3002/api/admin/config");if(!a.ok)throw new Error(`Failed to load config: ${a.status}`);return await a.json()}catch(a){throw a}}let p=null,N=0;const M=6e4;async function T(){const a=Date.now();if(p&&a-N<M)return p;const e=await v();return p=e,N=a,e}async function H(){try{const a=await T(),e={};for(const i of a.platforms)if(i.enabled){e[i.code]={};for(const o of i.models)o.enabled&&(e[i.code][o.code]=o.subModels.filter(r=>r.enabled).map(r=>r.code))}return e}catch{return{}}}async function K(){try{const a=await T(),e={};for(const i of a.platforms)for(const o of i.models)for(const r of o.subModels)e[r.code]=r.name;return e}catch{return{}}}const u={zh:`3D动漫风格，风格化3D渲染，PBR材质渲染，高精度3D建模，3D动漫美学。

构图：特写肖像，仅头部和肩部，专注于面部表情。

角色面部表情参考表，3×3网格布局，展示9种不同的面部表情（喜悦、愤怒、悲伤、惊讶、恐惧、厌恶、中性、思考、疲惫）。

角色面部描述：{APPEARANCE}

关键约束：
- 仅特写肖像镜头（头部和肩部）
- 无全身、无下半身、无腿部
- 专注于面部特征、表情和头部
- 纯色平背景 - 仅纯色背景（白色、浅灰色或黑色），无图案、无渐变、无环境元素
- 所有9个表情中保持一致的角色设计
- 3×3网格构图`,en:`Xianxia 3D animation character, semi-realistic style, Xianxia animation aesthetics, high precision 3D modeling, PBR shading with soft translucency, subsurface scattering, ambient occlusion, delicate and smooth skin texture (not overly realistic), flowing fabric clothing, individual hair strands, neutral studio lighting, clear focused gaze, natural demeanor.

PORTRAIT COMPOSITION: Extreme close-up, head and shoulders only, facial expressions focus.

Character facial expressions reference sheet, 3x3 grid layout showing 9 different facial expressions (joy, anger, sorrow, surprise, fear, disgust, neutral, thinking, tired).

Character Face Description: {APPEARANCE}

CRITICAL CONSTRAINTS:
- Close-up portrait shots ONLY (head and shoulders)
- NO full body, NO lower body, NO legs
- Focus on facial features, expressions, and head
- SOLID FLAT BACKGROUND - Plain solid color background ONLY (white, light gray, or black). NO patterns, NO gradients, NO environmental elements
- Consistent character design across all 9 expressions
- 3x3 grid composition`},g={zh:`3D动漫风格，风格化3D渲染，PBR材质渲染，高精度3D建模，3D动漫美学。

角色三视图生成任务：生成角色三视图参考表（正视图、侧视图、后视图）。

角色描述：{APPEARANCE}
属性：{STATS}

构图：
- 创建垂直布局，包含3个视图：正视图、侧视图（侧面）、后视图
- 全身站立姿势，中性表情
- 纯色平背景 - 仅纯色背景（白色、浅灰色或黑色），无图案、无渐变、无环境元素
- 每个视图应清晰显示指定角度的角色

关键要求：
1. 一致的角色设计 - 三个视图必须显示相同的角色，面部特征、发型、身体比例和服装保持一致
2. 无文本、无标签 - 纯图像，无"正视图"或"侧视图"文字标签
3. 正确的解剖结构 - 确保每个视角的正确身体比例和自然姿势
4. 中性表情 - 在所有视图中使用平静、中性的面部表情
5. 清晰对齐 - 正视图、侧视图和后视图应垂直对齐且比例一致

参考图片：使用表情图作为面部和服装细节的视觉参考。`,en:`Xianxia 3D animation character, semi-realistic style, Xianxia animation aesthetics, high precision 3D modeling, PBR shading with soft translucency, subsurface scattering, ambient occlusion, delicate and smooth skin texture (not overly realistic), flowing fabric clothing, individual hair strands, neutral studio lighting, clear focused gaze, natural demeanor.

CHARACTER THREE-VIEW GENERATION TASK:
Generate a character three-view reference sheet (front, side, back views).

Character Description: {APPEARANCE}
Attributes: {STATS}

COMPOSITION:
- Create vertical layout with 3 views: Front View, Side View (profile), Back View
- Full body standing pose, neutral expression
- SOLID FLAT BACKGROUND - Plain solid color background ONLY (white, light gray, or black). NO patterns, NO gradients, NO environmental elements
- Each view should clearly show the character from the specified angle

CRITICAL REQUIREMENTS:
1. CONSISTENT CHARACTER DESIGN - All three views must show the SAME character with consistent facial features, hair style, body proportions, and clothing
2. NO TEXT, NO LABELS - Pure image only, no "Front View" or "Side View" text labels
3. PROPER ANATOMY - Ensure correct body proportions and natural stance for each view angle
4. NEUTRAL EXPRESSION - Use a calm, neutral face expression across all views
5. CLEAR ALIGNMENT - Front, side, and back views should be vertically aligned and proportionally consistent

REFERENCE IMAGE: Use the expression sheet as visual reference for face and clothing details.`},_={zh:`专业人像摄影风格，真实写实，电影级摄影质感。

构图：专业人像构图，仅头部和肩部，专注于面部表情。

角色面部表情参考表，3×3网格布局，展示9种不同的面部表情（喜悦、愤怒、悲伤、惊讶、恐惧、厌恶、中性、思考、疲惫）。

角色面部描述：{APPEARANCE}

关键约束：
- 仅特写肖像镜头（头部和肩部）
- 无全身、无下半身、无腿部
- 专注于面部特征、表情和头部
- 纯色平背景 - 仅纯色背景（白色或黑色），无图案、无渐变、无环境元素
- 所有9个表情中保持一致的角色设计
- 3×3网格构图`,en:`Professional portrait photography, photorealistic human, cinematic photography, professional headshot, DSLR quality, 85mm lens, sharp focus, realistic skin texture, visible pores, natural skin imperfections, subsurface scattering.

PORTRAIT COMPOSITION: Professional headshot composition, head and shoulders only, facial expressions focus.

Character facial expressions reference sheet, 3x3 grid layout showing 9 different facial expressions (joy, anger, sadness, surprise, fear, disgust, neutral, thinking, tired).

Character Face Description: {APPEARANCE}

CRITICAL CONSTRAINTS:
- Close-up portrait shots ONLY (head and shoulders)
- NO full body, NO lower body, NO legs
- Focus on facial features, expressions, and head
- SOLID FLAT BACKGROUND - Plain solid color background ONLY (white or black). NO patterns, NO gradients, NO environmental elements
- Consistent character design across all 9 expressions
- 3x3 grid composition`},x={zh:`专业人像摄影风格，真实写实，电影级摄影质感。

角色三视图生成任务：生成角色三视图参考表（正视图、侧视图、后视图）。

角色描述：{APPEARANCE}
属性：{STATS}

构图：
- 创建垂直布局，包含3个视图：正视图、侧视图（侧面）、后视图
- 全身站立姿势，中性表情
- 纯色平背景 - 仅纯色背景（白色或黑色），无图案、无渐变、无环境元素
- 每个视图应清晰显示指定角度的角色

关键要求：
1. 一致的角色设计 - 三个视图必须显示相同的角色，面部特征、发型、身体比例和服装保持一致
2. 无文本、无标签 - 纯图像，无"正视图"或"侧视图"文字标签
3. 正确的解剖结构 - 确保每个视角的正确身体比例和自然姿势
4. 中性表情 - 在所有视图中使用平静、中性的面部表情
5. 清晰对齐 - 正视图、侧视图和后视图应垂直对齐且比例一致

参考图片：使用表情图作为面部和服装细节的视觉参考。`,en:`Professional portrait photography, photorealistic human, cinematic photography, fashion photography style, studio lighting, realistic skin texture, natural fabric folds, detailed clothing materials.

CHARACTER THREE-VIEW GENERATION TASK:
Generate a character three-view reference sheet (front, side, back views).

Character Description: {APPEARANCE}
Attributes: {STATS}

COMPOSITION:
- Create vertical layout with 3 views: Front View, Side View (profile), Back View
- Full body standing pose, neutral expression
- SOLID FLAT BACKGROUND - Plain solid color background ONLY (white or black). NO patterns, NO gradients, NO environmental elements
- Each view should clearly show the character from the specified angle

CRITICAL REQUIREMENTS:
1. CONSISTENT CHARACTER DESIGN - All three views must show the SAME character with consistent facial features, hair style, body proportions, and clothing
2. NO TEXT, NO LABELS - Pure image only, no "Front View" or "Side View" text labels
3. PROPER ANATOMY - Ensure correct body proportions and natural stance for each view angle
4. NEUTRAL EXPRESSION - Use a calm, neutral face expression across all views
5. CLEAR ALIGNMENT - Front, side, and back views should be vertically aligned and proportionally consistent

REFERENCE IMAGE: Use the expression sheet as visual reference for face and clothing details.`},k={zh:`2D动漫风格，日式动漫插画，漫画艺术风格。

构图：动漫肖像构图，仅头部和肩部，专注于面部表情。

角色面部表情参考表，3×3网格布局，展示9种不同的面部表情（喜悦、愤怒、悲伤、惊讶、恐惧、厌恶、中性、思考、疲惫）。

角色面部描述：{APPEARANCE}

关键约束：
- 仅特写肖像镜头（头部和肩部）
- 无全身、无下半身、无腿部
- 专注于面部特征、表情和头部
- 纯色平背景 - 仅纯色背景（白色、浅灰色或黑色），无图案、无渐变、无环境元素
- 所有9个表情中保持一致的角色设计
- 3×3网格构图`,en:`Anime character, anime style, 2D anime art, manga illustration style, clean linework, crisp outlines, manga art style, detailed illustration.

PORTRAIT COMPOSITION: Anime portrait composition, head and shoulders only, facial expressions focus.

Character facial expressions reference sheet, 3x3 grid layout showing 9 different facial expressions (joy, anger, sadness, surprise, fear, disgust, neutral, thinking, tired).

Character Face Description: {APPEARANCE}

CRITICAL CONSTRAINTS:
- Close-up portrait shots ONLY (head and shoulders)
- NO full body, NO lower body, NO legs
- Focus on facial features, expressions, and head
- SOLID FLAT BACKGROUND - Plain solid color background ONLY (white, light gray, or black). NO patterns, NO gradients, NO environmental elements
- Consistent character design across all 9 expressions
- 3x3 grid composition`},U={zh:`2D动漫风格，日式动漫插画，漫画艺术风格。

角色三视图生成任务：生成角色三视图参考表（正视图、侧视图、后视图）。

角色描述：{APPEARANCE}
属性：{STATS}

构图：
- 创建垂直布局，包含3个视图：正视图、侧视图（侧面）、后视图
- 全身站立姿势，中性表情
- 纯色平背景 - 仅纯色背景（白色、浅灰色或黑色），无图案、无渐变、无环境元素
- 每个视图应清晰显示指定角度的角色

关键要求：
1. 一致的角色设计 - 三个视图必须显示相同的角色，面部特征、发型、身体比例和服装保持一致
2. 无文本、无标签 - 纯图像，无"正视图"或"侧视图"文字标签
3. 正确的解剖结构 - 确保每个视角的正确身体比例和自然姿势
4. 中性表情 - 在所有视图中使用平静、中性的面部表情
5. 清晰对齐 - 正视图、侧视图和后视图应垂直对齐且比例一致

参考图片：使用表情图作为面部和服装细节的视觉参考。`,en:`Anime character, 2D anime art, manga illustration, character reference sheet, clean linework, crisp outlines, anime style.

CHARACTER THREE-VIEW GENERATION TASK:
Generate a character three-view reference sheet (front, side, back views).

Character Description: {APPEARANCE}
Attributes: {STATS}

COMPOSITION:
- Create vertical layout with 3 views: Front View, Side View (profile), Back View
- Full body standing pose, neutral expression
- SOLID FLAT BACKGROUND - Plain solid color background ONLY (white, light gray, or black). NO patterns, NO gradients, NO environmental elements
- Each view should clearly show the character from the specified angle

CRITICAL REQUIREMENTS:
1. CONSISTENT CHARACTER DESIGN - All three views must show the SAME character with consistent facial features, hair style, body proportions, and clothing
2. NO TEXT, NO LABELS - Pure image only, no "Front View" or "Side View" text labels
3. PROPER ANATOMY - Ensure correct body proportions and natural stance for each view angle
4. NEUTRAL EXPRESSION - Use a calm, neutral face expression across all views
5. CLEAR ALIGNMENT - Front, side, and back views should be vertically aligned and proportionally consistent

REFERENCE IMAGE: Use the expression sheet as visual reference for face and clothing details.`},h={zh:`{SCENE_DESCRIPTION}

运镜要求：
{CAMERA_MOVEMENT}

视觉风格：
{VISUAL_STYLE}

角色：
{CHARACTERS}

关键约束：
- 视频时长：{DURATION}
- 保持场景连续性和一致性
- 流畅的运镜和自然的动作
- 高质量视频输出，避免帧率不稳定
- 遵循分镜图描述的构图和氛围`,en:`{SCENE_DESCRIPTION}

Camera Movement:
{CAMERA_MOVEMENT}

Visual Style:
{VISUAL_STYLE}

Characters:
{CHARACTERS}

Key Constraints:
- Video Duration: {DURATION}
- Maintain scene continuity and consistency
- Smooth camera movement and natural motion
- High quality video output, avoid frame rate instability
- Follow the composition and atmosphere described in the storyboard`},m={zh:`电影感视频生成，专业级电影摄影质感。

场景描述：{SCENE}

摄影参数：
- 光线：{LIGHTING}
- 色调：{COLOR_GRADE}
- 运镜：{CAMERA_WORK}
- 景别：{SHOT_SIZE}

技术要求：
- 4K分辨率，电影级画质
- 专业色彩分级，电影质感调色
- 平滑的摄像机运动
- 自然的演员表演和动作
- 环境光和阴影的真实处理
- 高动态范围（HDR）质量

输出要求：
- 视频时长：{DURATION}
- 帧率：24fps 或 30fps
- 无抖动、无闪烁
- 流畅的镜头过渡`,en:`Cinematic video generation, professional movie-quality cinematography.

Scene Description: {SCENE}

Cinematography Parameters:
- Lighting: {LIGHTING}
- Color Grade: {COLOR_GRADE}
- Camera Work: {CAMERA_WORK}
- Shot Size: {SHOT_SIZE}

Technical Requirements:
- 4K resolution, movie-grade quality
- Professional color grading, cinematic color timing
- Smooth camera movement
- Natural acting and motion
- Realistic handling of ambient light and shadows
- High Dynamic Range (HDR) quality

Output Requirements:
- Video Duration: {DURATION}
- Frame Rate: 24fps or 30fps
- No shaking, no flickering
- Smooth shot transitions`},f={zh:`AI视频生成提示词，适用于Sora等高质量视频生成模型。

场景描述：{SCENE}

详细视觉要求：
{VISUAL_DETAILS}

镜头语言：
- 运镜方式：{CAMERA_MOVEMENT}
- 景别：{SHOT_SIZE}
- 拍摄角度：{ANGLE}
- 镜头语言：{LANGUAGE_OF_LENS}

环境与氛围：
- 场景设定：{ENVIRONMENT}
- 灯光：{LIGHTING}
- 色调：{MOOD}
- 氛围感：{ATMOSPHERE}

人物与动作：
{CHARACTERS_AND_ACTIONS}

技术规范：
- 视频比例：{ASPECT_RATIO}
- 视频时长：{DURATION}
- 画质质量：{QUALITY}

创作风格：
{STYLE_GUIDANCE}

质量要求：
- 高度连贯的时序一致性
- 物理准确的运动和互动
- 稳定的画面质量，无闪烁或突变
- 自然的过渡和流畅的动作
- 符合现实世界的物理规律`,en:`AI video generation prompt, optimized for high-quality video generation models like Sora.

Scene Description: {SCENE}

Detailed Visual Requirements:
{VISUAL_DETAILS}

Cinematography:
- Camera Movement: {CAMERA_MOVEMENT}
- Shot Size: {SHOT_SIZE}
- Camera Angle: {ANGLE}
- Lens Language: {LANGUAGE_OF_LENS}

Environment and Atmosphere:
- Scene Setting: {ENVIRONMENT}
- Lighting: {LIGHTING}
- Color Tone: {MOOD}
- Atmosphere: {ATMOSPHERE}

Characters and Actions:
{CHARACTERS_AND_ACTIONS}

Technical Specifications:
- Aspect Ratio: {ASPECT_RATIO}
- Duration: {DURATION}
- Quality: {QUALITY}

Creative Style:
{STYLE_GUIDANCE}

Quality Requirements:
- High degree of temporal consistency
- Physically accurate motion and interactions
- Stable image quality, no flickering or sudden changes
- Natural transitions and smooth motion
- Consistent with real-world physics`};class G{getExpressionPromptTemplate(e){switch(e){case"3D":return u;case"REAL":return _;case"ANIME":return k;default:return u}}getThreeViewPromptTemplate(e){switch(e){case"3D":return g;case"REAL":return x;case"ANIME":return U;default:return g}}buildExpressionPrompt(e,i,o,r="3D"){const s=o||this.getExpressionPromptTemplate(r),t=i?.appearance||i?.basicStats||"Detailed character appearance";let n="";return r==="3D"?n="nsfw, text, watermark, label, signature, bad anatomy, deformed, low quality, writing, letters, logo, interface, ui, username, website, chinese characters, chinese text, english text, korean text, japanese text, any text, any characters, any letters, numbers, symbols, subtitles, captions, title, full body, standing, legs, feet, full-length portrait, wide shot, environmental background, patterned background, gradient background, 2D illustration, hand-drawn, anime 2D, flat shading, cel shading, toon shading, cartoon 2D, paper cutout, translucent, ghostly, ethereal, glowing aura, overly photorealistic, hyper-realistic skin, photorealistic rendering":r==="REAL"?n="nsfw, text, watermark, label, signature, bad anatomy, deformed, low quality, writing, letters, logo, interface, ui, username, website, chinese characters, chinese text, english text, korean text, japanese text, any text, any characters, any letters, numbers, symbols, subtitles, captions, title, full body, standing, legs, feet, full-length portrait, wide shot, environmental background, patterned background, gradient background, anime, cartoon, illustration, 3d render, cgi, 3d animation, painting, drawing":r==="ANIME"&&(n="nsfw, text, watermark, label, signature, bad anatomy, deformed, low quality, writing, letters, logo, interface, ui, username, website, chinese characters, chinese text, english text, korean text, japanese text, any text, any characters, any letters, numbers, symbols, subtitles, captions, title, full body, standing, legs, feet, full-length portrait, wide shot, environmental background, patterned background, gradient background, photorealistic, realistic, photo, 3d, cgi, live action, hyper-realistic, skin texture, pores"),{zh:`${e}

${s.zh.replace("{APPEARANCE}",t)}

负面提示词：${n}`,en:`${e}

${s.en.replace("{APPEARANCE}",t)}

Negative Prompt: ${n}`}}buildThreeViewPrompt(e,i,o,r="3D"){const s=o||this.getThreeViewPromptTemplate(r),t=i?.appearancePrompt||i?.appearance||"Detailed character appearance",n=i?.profession||"Character attributes";let l="";return r==="3D"?l="nsfw, text, watermark, label, signature, bad anatomy, deformed, low quality, writing, letters, logo, interface, ui, username, website, chinese characters, english text, patterned background, gradient background, scenery, environmental background, shadows on background, 2D illustration, hand-drawn, anime 2D, flat shading, cel shading, toon shading, cartoon 2D, paper cutout, translucent, ghostly, ethereal, glowing aura, overly photorealistic, hyper-realistic skin, photorealistic rendering":r==="REAL"?l="nsfw, text, watermark, label, signature, bad anatomy, deformed, low quality, writing, letters, logo, interface, ui, username, website, chinese characters, english text, patterned background, gradient background, scenery, environmental background, shadows on background, anime, cartoon, illustration, 3d render, cgi, 3d animation, painting, drawing":r==="ANIME"&&(l="nsfw, text, watermark, label, signature, bad anatomy, deformed, low quality, writing, letters, logo, interface, ui, username, website, chinese characters, english text, patterned background, gradient background, scenery, environmental background, shadows on background, photorealistic, realistic, photo, 3d, cgi, live action, hyper-realistic, skin texture, pores"),{zh:`${e}

${s.zh.replace("{APPEARANCE}",t).replace("{STATS}",n)}

负面提示词：${l}`,en:`${e}

${s.en.replace("{APPEARANCE}",t).replace("{STATS}",n)}

Negative Prompt: ${l}`}}syncPrompt(e,i,o){const r=i.split(`
`),s=o.split(`
`),t=r.length,n=s.length;if(t===n)return o;if(t>n){const l=t-n;return o+`
`.repeat(l)}if(t<n){const l=n-t;return s.slice(0,n-l).join(`
`)}return o}getDefaultPrompts(){return{expressionPrompt:{...u},threeViewPrompt:{...g}}}getDefaultPromptsByStyle(e){return{expressionPrompt:{...this.getExpressionPromptTemplate(e)},threeViewPrompt:{...this.getThreeViewPromptTemplate(e)}}}buildStoryboardVideoPrompt(e){const{sceneDescription:i,cameraMovement:o="平滑运镜，自然过渡",visualStyle:r="高质量3D动漫风格",characters:s="主要角色表演",duration:t="5秒"}=e;return{zh:h.zh.replace("{SCENE_DESCRIPTION}",i).replace("{CAMERA_MOVEMENT}",o).replace("{VISUAL_STYLE}",r).replace("{CHARACTERS}",s).replace("{DURATION}",t),en:h.en.replace("{SCENE_DESCRIPTION}",i).replace("{CAMERA_MOVEMENT}",o).replace("{VISUAL_STYLE}",r).replace("{CHARACTERS}",s).replace("{DURATION}",t)}}buildCinematicVideoPrompt(e){const{scene:i,lighting:o="专业电影灯光，自然光与环境光结合",colorGrade:r="电影级色彩分级，暖色调",cameraWork:s="平滑的电影摄像机运动",shotSize:t="中景",duration:n="5秒"}=e;return{zh:m.zh.replace("{SCENE}",i).replace("{LIGHTING}",o).replace("{COLOR_GRADE}",r).replace("{CAMERA_WORK}",s).replace("{SHOT_SIZE}",t).replace("{DURATION}",n),en:m.en.replace("{SCENE}",i).replace("{LIGHTING}",o).replace("{COLOR_GRADE}",r).replace("{CAMERA_WORK}",s).replace("{SHOT_SIZE}",t).replace("{DURATION}",n)}}buildSoraVideoPrompt(e){const{scene:i,visualDetails:o="高精度细节，电影级画质",cameraMovement:r="平滑运镜",shotSize:s="中景",angle:t="平视",languageOfLens:n="标准镜头",environment:l="室内场景",lighting:d="自然光",mood:c="暖色调",atmosphere:y="舒适氛围",charactersAndActions:A="角色自然表演",aspectRatio:E="16:9",duration:S="5秒",quality:O="hd",styleGuidance:b="写实风格"}=e;return{zh:f.zh.replace("{SCENE}",i).replace("{VISUAL_DETAILS}",o).replace("{CAMERA_MOVEMENT}",r).replace("{SHOT_SIZE}",s).replace("{ANGLE}",t).replace("{LANGUAGE_OF_LENS}",n).replace("{ENVIRONMENT}",l).replace("{LIGHTING}",d).replace("{MOOD}",c).replace("{ATMOSPHERE}",y).replace("{CHARACTERS_AND_ACTIONS}",A).replace("{ASPECT_RATIO}",E).replace("{DURATION}",S).replace("{QUALITY}",O==="hd"?"高清":"标清").replace("{STYLE_GUIDANCE}",b),en:f.en.replace("{SCENE}",i).replace("{VISUAL_DETAILS}",o).replace("{CAMERA_MOVEMENT}",r).replace("{SHOT_SIZE}",s).replace("{ANGLE}",t).replace("{LANGUAGE_OF_LENS}",n).replace("{ENVIRONMENT}",l).replace("{LIGHTING}",d).replace("{MOOD}",c).replace("{ATMOSPHERE}",y).replace("{CHARACTERS_AND_ACTIONS}",A).replace("{ASPECT_RATIO}",E).replace("{DURATION}",S).replace("{QUALITY}",O).replace("{STYLE_GUIDANCE}",b)}}getDefaultVideoPrompts(){return{storyboardPrompt:{...h},cinematicPrompt:{...m},soraPrompt:{...f}}}}const z=new G,I=[{id:"bytedance/seedream-4.5",name:"ByteDance Seedream 4.5",category:"image",priority:1,quality:10,speed:8,cost:8,capabilities:["OpenRouter","高质量","专业级输出","图像生成","支持 aspectRatio"],description:"ByteDance Seedream 4.5，高质量图像生成模型",tags:["bytedance","seedream","high-quality","image-generation"],isDefault:!0},{id:"black-forest-labs/flux-1.1-pro-ultra",name:"FLUX 1.1 Pro Ultra",category:"image",priority:2,quality:10,speed:7,cost:4,capabilities:["OpenRouter","最高质量","专业级输出","图像生成"],description:"FLUX 1.1 Pro Ultra，最高质量的图像生成",tags:["flux","black-forest-labs","high-quality","image-generation"],isDefault:!1},{id:"black-forest-labs/flux-1.1-pro",name:"FLUX 1.1 Pro",category:"image",priority:3,quality:9,speed:8,cost:5,capabilities:["OpenRouter","高质量","专业级输出","图像生成"],description:"FLUX 1.1 Pro，高质量的图像生成",tags:["flux","black-forest-labs","high-quality","image-generation"],isDefault:!1},{id:"black-forest-labs/flux-pro",name:"FLUX Pro",category:"image",priority:4,quality:9,speed:8,cost:5,capabilities:["OpenRouter","高质量","专业级输出","图像生成"],description:"FLUX Pro，高质量的图像生成",tags:["flux","black-forest-labs","high-quality","image-generation"],isDefault:!1},{id:"black-forest-labs/flux-dev",name:"FLUX Dev",category:"image",priority:5,quality:8,speed:9,cost:10,capabilities:["OpenRouter","免费","高质量","图像生成"],description:"FLUX Dev，免费的图像生成",tags:["flux","black-forest-labs","free","image-generation"],isDefault:!1},{id:"black-forest-labs/flux-schnell",name:"FLUX Schnell",category:"image",priority:6,quality:7,speed:10,cost:10,capabilities:["OpenRouter","免费","快速","图像生成"],description:"FLUX Schnell，免费且快速的图像生成",tags:["flux","black-forest-labs","free","fast","image-generation"],isDefault:!1},{id:"openai/dall-e-3",name:"DALL·E 3",category:"image",priority:7,quality:9,speed:7,cost:5,capabilities:["OpenRouter","高质量","专业级输出","图像生成"],description:"DALL·E 3，高质量的图像生成",tags:["openai","dall-e","high-quality","image-generation"],isDefault:!1},{id:"openai/dall-e-2",name:"DALL·E 2",category:"image",priority:8,quality:7,speed:8,cost:7,capabilities:["OpenRouter","图像生成"],description:"DALL·E 2，经典的图像生成",tags:["openai","dall-e","image-generation"],isDefault:!1},{id:"stabilityai/stable-diffusion-3.5-large-turbo",name:"Stable Diffusion 3.5 Large Turbo",category:"image",priority:9,quality:8,speed:10,cost:7,capabilities:["OpenRouter","快速","高质量","图像生成"],description:"Stable Diffusion 3.5 Large Turbo，快速且高质量的图像生成",tags:["stabilityai","stable-diffusion","fast","high-quality","image-generation"],isDefault:!1},{id:"stabilityai/stable-diffusion-3.5-large",name:"Stable Diffusion 3.5 Large",category:"image",priority:10,quality:9,speed:7,cost:6,capabilities:["OpenRouter","高质量","图像生成"],description:"Stable Diffusion 3.5 Large，高质量的图像生成",tags:["stabilityai","stable-diffusion","high-quality","image-generation"],isDefault:!1},{id:"stabilityai/stable-diffusion-xl",name:"Stable Diffusion XL",category:"image",priority:11,quality:8,speed:8,cost:8,capabilities:["OpenRouter","高质量","图像生成"],description:"Stable Diffusion XL，高质量的图像生成",tags:["stabilityai","stable-diffusion","sdxl","high-quality","image-generation"],isDefault:!1},{id:"midjourney/midjourney-v6",name:"Midjourney V6",category:"image",priority:12,quality:10,speed:6,cost:4,capabilities:["OpenRouter","最高质量","专业级输出","图像生成"],description:"Midjourney V6，最高质量的图像生成",tags:["midjourney","high-quality","image-generation"],isDefault:!1},{id:"gemini-3-pro-image-preview",name:"Gemini 3.1 Pro Image Preview",category:"image",priority:13,quality:10,speed:7,cost:5,capabilities:["最高质量","专业级输出","图像生成","支持 aspectRatio"],description:"Gemini 3.1 Pro 预览版，最高质量的图像生成",tags:["pro","high-quality","image-generation"],isDefault:!1},{id:"gemini-2.5-flash-image",name:"Gemini 2.5 Flash Image",category:"image",priority:14,quality:8,speed:10,cost:9,capabilities:["快速响应","图像生成","支持 aspectRatio"],description:"Gemini 2.5 Flash 图像生成，速度最快",tags:["fast","image-generation","aspectRatio"],isDefault:!1}],C=[{id:"bytedance/seedream-4.5",name:"ByteDance Seedream 4.5 (视频)",category:"video",priority:1,quality:9,speed:7,cost:8,capabilities:["OpenRouter","高质量","视频生成","字节跳动"],description:"ByteDance Seedream 4.5 视频生成模型",tags:["bytedance","seedream","video-generation"],isDefault:!0},{id:"sora-2-yijia",name:"Sora 2 (10秒竖屏)",category:"video",priority:2,quality:10,speed:8,cost:9,capabilities:["OpenAI Sora 2","10秒视频","9:16竖屏","1280x720","按次计费","¥0.19/次"],description:"OpenAI Sora 2 基础版，10秒竖屏视频生成，性价比最高",tags:["sora","openai","vertical","10s","720p"],isDefault:!1},{id:"sora-2-15s-yijia",name:"Sora 2 (15秒竖屏)",category:"video",priority:0,quality:10,speed:7,cost:9,capabilities:["OpenAI Sora 2","15秒视频","9:16竖屏","1280x720","按次计费","¥0.24/次"],description:"OpenAI Sora 2 基础版，15秒竖屏视频生成",tags:["sora","openai","vertical","15s","720p"]},{id:"sora-2-landscape-15s-yijia",name:"Sora 2 (15秒横屏)",category:"video",priority:0,quality:10,speed:7,cost:9,capabilities:["OpenAI Sora 2","15秒视频","16:9横屏","1280x720","按次计费","¥0.24/次"],description:"OpenAI Sora 2 基础版，15秒横屏视频生成",tags:["sora","openai","horizontal","15s","720p"]},{id:"sora-2-landscape-yijia",name:"Sora 2 (10秒横屏)",category:"video",priority:0,quality:10,speed:8,cost:9,capabilities:["OpenAI Sora 2","10秒视频","16:9横屏","1280x720","按次计费","¥0.19/次"],description:"OpenAI Sora 2 基础版，10秒横屏视频生成",tags:["sora","openai","horizontal","10s","720p"]},{id:"sora-2-pro-10s-large-yijia",name:"Sora 2 Pro (10秒竖屏)",category:"video",priority:0,quality:10,speed:6,cost:5,capabilities:["OpenAI Sora 2 Pro","10秒视频","9:16竖屏","1080x1920","按次计费","¥1.15/次","高清"],description:"OpenAI Sora 2 Pro 版，10秒竖屏高清视频生成",tags:["sora","openai","pro","vertical","10s","1080p"]},{id:"sora-2-pro-15s-large-yijia",name:"Sora 2 Pro (15秒竖屏)",category:"video",priority:0,quality:10,speed:5,cost:4,capabilities:["OpenAI Sora 2 Pro","15秒视频","9:16竖屏","1080x1920","按次计费","¥1.80/次","高清"],description:"OpenAI Sora 2 Pro 版，15秒竖屏高清视频生成",tags:["sora","openai","pro","vertical","15s","1080p"]},{id:"sora-2-pro-25s-yijia",name:"Sora 2 Pro (25秒竖屏)",category:"video",priority:0,quality:10,speed:4,cost:3,capabilities:["OpenAI Sora 2 Pro","25秒视频","9:16竖屏","1080x1920","按次计费","¥2.20/次","超长视频","高清"],description:"OpenAI Sora 2 Pro 版，25秒竖屏超长视频生成",tags:["sora","openai","pro","vertical","25s","1080p","ultra-long"]},{id:"sora-2-pro-landscape-10s-large-yijia",name:"Sora 2 Pro (10秒横屏)",category:"video",priority:0,quality:10,speed:6,cost:5,capabilities:["OpenAI Sora 2 Pro","10秒视频","16:9横屏","1920x1080","按次计费","¥0.85/次","高清"],description:"OpenAI Sora 2 Pro 版，10秒横屏高清视频生成",tags:["sora","openai","pro","horizontal","10s","1080p"]},{id:"sora-2-pro-landscape-15s-large-yijia",name:"Sora 2 Pro (15秒横屏)",category:"video",priority:0,quality:10,speed:5,cost:4,capabilities:["OpenAI Sora 2 Pro","15秒视频","16:9横屏","1920x1080","按次计费","¥1.50/次","高清"],description:"OpenAI Sora 2 Pro 版，15秒横屏高清视频生成",tags:["sora","openai","pro","horizontal","15s","1080p"]},{id:"sora-2-pro-landscape-25s-yijia",name:"Sora 2 Pro (25秒横屏)",category:"video",priority:0,quality:10,speed:4,cost:3,capabilities:["OpenAI Sora 2 Pro","25秒视频","16:9横屏","1920x1080","按次计费","¥2.20/次","超长视频","高清"],description:"OpenAI Sora 2 Pro 版，25秒横屏超长视频生成",tags:["sora","openai","pro","horizontal","25s","1080p","ultra-long"]},{id:"veo-3.1-generate-preview",name:"Veo 3.1",category:"video",priority:1,quality:10,speed:5,cost:3,capabilities:["最高质量","长视频","4K支持","流畅动画"],description:"Veo 3.1 专业版，生成高质量视频",tags:["professional","high-quality"],isDefault:!1},{id:"veo-3.1-fast-generate-preview",name:"Veo 3.1 Fast",category:"video",priority:2,quality:8,speed:9,cost:7,capabilities:["快速生成","实时预览","短视频"],description:"快速视频生成，适合快速迭代",tags:["fast","preview","short-form"]},{id:"veo-3.0-fast-generate",name:"Veo 3.0 Fast",category:"video",priority:3,quality:7,speed:8,cost:8,capabilities:["快速生成","稳定版本"],description:"Veo 3.0 快速版，稳定可靠",tags:["stable","fast"]},{id:"wan-2.1-t2v-14b",name:"Wan 2.1",category:"video",priority:4,quality:8,speed:6,cost:6,capabilities:["动画风格","文本转视频","艺术性强"],description:"Wan 2.1 擅长动画风格视频生成",tags:["animation","artistic","t2v"],requiresPolloKey:!0}],P=[{id:"openai/gpt-4o-mini",name:"GPT-4o Mini",category:"text",priority:1,quality:8,speed:9,cost:9,capabilities:["OpenRouter","快速响应","高质量推理","多语言支持","性价比高"],description:"GPT-4o Mini，快速且高效的文本生成模型",tags:["openrouter","openai","fast","cost-effective"],isDefault:!0},{id:"anthropic/claude-3-haiku",name:"Claude 3 Haiku",category:"text",priority:2,quality:8,speed:10,cost:8,capabilities:["OpenRouter","极速响应","高性价比","多语言支持"],description:"Claude 3 Haiku，最快的 Claude 模型",tags:["openrouter","anthropic","haiku","fast"]},{id:"mistralai/mistral-7b-instruct",name:"Mistral 7B Instruct",category:"text",priority:3,quality:7,speed:10,cost:10,capabilities:["OpenRouter","免费","快速响应","轻量级"],description:"Mistral 7B Instruct，免费开源模型",tags:["openrouter","mistral","free","opensource"]},{id:"gemini-3-pro-preview",name:"Gemini 3.1 Pro Preview",category:"text",priority:4,quality:10,speed:7,cost:4,capabilities:["预览版","新功能","高级推理","最强推理","复杂任务","长上下文","100万token输入"],description:"最强推理能力，适合复杂创作任务",tags:["preview","new-features","strongest-reasoning","complex-tasks"],isDefault:!1},{id:"gemini-3-flash-preview",name:"Gemini 3.1 Flash Preview",category:"text",priority:5,quality:8,speed:9,cost:7,capabilities:["快速响应","轻量任务","实时交互","100万token输入","免费层级"],description:"快速文本生成，适合实时对话，提供免费层级",tags:["fast","realtime","lightweight","free-tier"]}],D=[{id:"google/lyria-3-pro-preview",name:"Google: Lyria 3 Pro Preview",category:"audio",priority:1,quality:10,speed:8,cost:7,capabilities:["OpenRouter","专业级","高质量音频","文本转语音","多音色","音乐生成"],description:"Google Lyria 3 Pro 预览版，专业级音频生成模型",tags:["google","lyria","professional","audio-generation","tts"],isDefault:!0},{id:"gemini-2.5-flash-preview-tts",name:"Gemini 2.5 Flash TTS",category:"audio",priority:2,quality:8,speed:9,cost:8,capabilities:["文本转语音","快速生成","多音色"],description:"高质量文本转语音",tags:["tts","voice"],isDefault:!1},{id:"gemini-2.5-flash-native-audio-dialog",name:"Gemini 2.5 Native Audio",category:"audio",priority:3,quality:9,speed:7,cost:6,capabilities:["原生音频","对话生成","音效"],description:"原生音频生成，支持对话场景",tags:["native-audio","dialog","sfx"]}],q=[...I,...C,...P,...D],w=a=>{switch(a){case"image":return I;case"video":return C;case"text":return P;case"audio":return D;default:return[]}},R=a=>{const e=w(a);return e.find(o=>o.isDefault)?.id||e[0]?.id||""},L=a=>w(a).sort((e,i)=>e.priority-i.priority),V=a=>q.find(e=>e.id===a),Y=(a,e=[])=>{const i=V(a);if(!i)return null;const o=L(i.category),r=o.findIndex(s=>s.id===a);for(let s=r+1;s<o.length;s++){const t=o[s];if(!e.includes(t.id))return t.id}return null},B=a=>{const e=String(a?.message||a||"").toLowerCase();return["quota","limit","exceeded","rate limit","429","insufficient","billing","credit"].some(o=>e.includes(o))},X=a=>{const e=`model_priority_${a}`,i=localStorage.getItem(e);if(i)try{const r=JSON.parse(i);if(Array.isArray(r)){const s=r.map(t=>typeof t=="string"?t:t&&typeof t=="object"&&t.id?t.id:null).filter(t=>t!==null);if(s.length>0)return s}}catch{}return L(a).map(r=>r.id)},F=(a,e)=>{const i=a.toLowerCase();switch(e){case"image":return["dall-e","stable-diffusion","sdxl","flux","seedream","image","midjourney","t2i","text-to-image"].some(t=>i.includes(t));case"video":return["video","sora","luma","veo","wan","t2v","text-to-video"].some(t=>i.includes(t));case"audio":return["audio","tts","voice","lyria","whisper"].some(t=>i.includes(t));case"text":return!0;default:return!1}},j=a=>{const e=localStorage.getItem("OPENROUTER_API_KEY"),i=localStorage.getItem("CUSTOM_API_KEY");if(e||i){const d={text:"openrouter_default_text_model",image:"openrouter_default_image_model",video:"openrouter_default_video_model",audio:"openrouter_default_audio_model"}[a];if(d){const c=localStorage.getItem(d);if(c&&F(c,a))return c}return R(a)}const o=`default_${a}_model`,r=localStorage.getItem(o);if(r)return r;const s=`model_priority_${a}`,t=localStorage.getItem(s);if(t)try{const l=JSON.parse(t);if(Array.isArray(l)&&l.length>0)return l[0]}catch{}return R(a)};export{D as A,I,P as T,C as V,Y as a,V as b,X as c,R as d,H as e,K as f,j as g,B as i,z as p};
