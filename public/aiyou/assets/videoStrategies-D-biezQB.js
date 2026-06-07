import{u as l,h as g,i as u,o as p}from"./services-ai-mZDpJ5kz.js";import{g as f}from"./editor-image-BJ4S3Ps2.js";import{g as s}from"./services-config-WU8_FGmR.js";import"./vendor-genai-CMdt6Lf-.js";import"./vendor-react-Dv2FWvGu.js";import"./vendor-icons-DHdy39jm.js";const h=async(c,i,r)=>{let e=null;const n=i.find(a=>a.data.image||a.data.croppedFrame);return n&&(e=n.data.croppedFrame||n.data.image||null),{finalPrompt:r,videoInput:null,inputImageForGeneration:e,referenceImages:void 0,generationMode:"DEFAULT"}},I=async(c,i,r)=>{let e=[];const n=i.find(a=>a.data.videoUri||a.data.videoMetadata);if(n&&n.data.videoUri)try{let a=n.data.videoUri;a.startsWith("http")&&(a=await l(a));const d=await g(a);d&&(e=[d])}catch{}return{finalPrompt:r,videoInput:null,inputImageForGeneration:e.length>0?e[0]:null,referenceImages:void 0,generationMode:"CONTINUE"}},v=async(c,i,r)=>{const e=[];i.forEach(a=>{a.data.croppedFrame?e.push(a.data.croppedFrame):a.data.image&&e.push(a.data.image)});let n=r;if(e.length>=2)try{n=await p(e,r)}catch{}return{finalPrompt:n,videoInput:null,inputImageForGeneration:e[0],referenceImages:e,generationMode:"FIRST_LAST_FRAME"}},T=async(c,i,r)=>{let e=null,n="";const a=i.find(o=>o.data.videoUri);if(a&&a.data.videoUri)try{let o=a.data.videoUri;o.startsWith("http")&&(o=await l(o)),n=await u(o,"Analyze the visual style, lighting, composition, and color grading briefly.",s("text"))}catch{}if(c.data.croppedFrame)e=c.data.croppedFrame;else{const o=i.find(t=>t.data.croppedFrame);if(o)e=o.data.croppedFrame;else{const t=i.find(m=>m.data.image);if(t&&(e=t.data.image),!e&&a)try{e=await g(a.data.videoUri)}catch{}}}let d=`${r}. 

Visual Style Reference: ${n}`;if(e)try{const o=`
            CRITICAL IMAGE RESTORATION TASK:
            1. Input is a low-resolution crop. Your goal is to UPSCALE and RESTORE it to 4K quality.
            2. STRICTLY PRESERVE the original composition, character pose, camera angle, and object placement.
            3. DO NOT reframe, DO NOT zoom out, DO NOT change the perspective.
            4. Fix blurriness and noise. Add skin texture and realistic details matching the description: "${r}".
            5. Ensure the style matches: "${n||"Cinematic, High Fidelity"}".
            6. Output a single, high-quality image that looks exactly like the input but sharper.

            NEGATIVE CONSTRAINTS:
            - DO NOT add new people, characters, or subjects.
            - The number of people MUST remain exactly the same as the input.
            - DO NOT hallucinate extra limbs, faces, or background figures.

            STRUCTURAL INTEGRITY:
            - Treat the input image as the absolute ground truth for composition.
            - Only enhance existing pixels, do not invent new geometry.
            `,t=await f(o,s("image"),[e],{aspectRatio:c.data.aspectRatio||"16:9"});t&&t.length>0&&(e=t[0])}catch{}return{finalPrompt:d,videoInput:null,inputImageForGeneration:e,referenceImages:void 0,generationMode:"CUT"}},y=async(c,i,r)=>{const e=i.find(t=>t.data.videoUri),a=i.find(t=>t.data.image)?.data.image||i.find(t=>t.data.image)?.data.image||null;let d="";if(e?.data.videoUri)try{let t=e.data.videoUri;t.startsWith("http")&&(t=await l(t)),d=await u(t,"Describe ONLY the physical actions, camera movement, and background environment of this video. Do not describe the person's identity. Example: 'A figure is waving their hand while walking forward in a studio.'",s("text"))}catch{d="performing dynamic action"}let o="";return d?o=`Character Action Reference: ${d}. 
User Instruction: ${r||"Cinematic video"}`:o=r,{finalPrompt:o,videoInput:null,inputImageForGeneration:a,referenceImages:void 0,generationMode:"CHARACTER_REF"}},C=async(c,i,r)=>{switch(c.data.generationMode||"DEFAULT"){case"CHARACTER_REF":return y(c,i,r);case"FIRST_LAST_FRAME":return v(c,i,r);case"CUT":return T(c,i,r);case"CONTINUE":return I(c,i,r);case"DEFAULT":default:return h(c,i,r)}};export{C as getGenerationStrategy,y as processCharacterRef,h as processDefaultVideoGen,v as processFrameWeaver,T as processSceneDirector,I as processStoryContinuator};
