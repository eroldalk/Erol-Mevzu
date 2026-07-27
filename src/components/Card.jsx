import { useEffect, useMemo } from "react";
import { ICON_CATS, FONT_PRESETS } from "../utils/constants";
import { useDrag } from "../utils/hooks";

// ── Keyframe injection ──────────────────────────────────────────
const KEYFRAMES = `
@keyframes mevzu-aurora{
  0%,100%{transform:translate(0%,0%) scale(1) rotate(0deg)}
  33%{transform:translate(8%,6%) scale(1.12) rotate(10deg)}
  66%{transform:translate(-6%,9%) scale(0.91) rotate(-7deg)}
}
@keyframes mevzu-ring{
  0%{transform:scale(0.1);opacity:0.95}
  100%{transform:scale(2.8);opacity:0}
}
@keyframes mevzu-twinkle{
  0%,100%{opacity:0.06;transform:scale(0.6)}
  50%{opacity:1;transform:scale(2)}
}
@keyframes mevzu-rain-fall{
  0%{transform:translateY(-110%)}
  100%{transform:translateY(120%)}
}
@keyframes mevzu-spark{
  0%{transform:translateY(0) scale(1);opacity:1}
  100%{transform:translateY(-130px) scale(0.2);opacity:0}
}
@keyframes mevzu-glow{
  0%,100%{text-shadow:0 0 5px currentColor,0 0 12px currentColor}
  50%{text-shadow:0 0 16px currentColor,0 0 32px currentColor,0 0 64px currentColor}
}
@keyframes mevzu-float{
  0%,100%{transform:translateY(0px)}
  50%{transform:translateY(-10px)}
}
@keyframes mevzu-shimmer{
  0%{background-position:-280% center}
  100%{background-position:280% center}
}
@keyframes mevzu-glitch{
  0%,76%,100%{transform:none;filter:none}
  77%{transform:translate(-4px,2px) skewX(6deg);filter:hue-rotate(90deg)}
  79%{transform:translate(5px,-3px) skewX(-5deg);filter:hue-rotate(-90deg)}
  81%{transform:translate(-3px,1px)}
  83%{transform:translate(4px,-1px);filter:hue-rotate(45deg)}
  85%{transform:none;filter:none}
}
@keyframes mevzu-pulse{
  0%,100%{opacity:0.38}
  50%{opacity:1}
}
@keyframes mevzu-neon{
  0%{text-shadow:0 0 6px #c9a84c,0 0 14px #c9a84c,0 0 28px #c9a84c}
  25%{text-shadow:0 0 6px #4af,0 0 16px #4af,0 0 38px #4af}
  50%{text-shadow:0 0 6px #f4a,0 0 16px #f4a,0 0 38px #f4a}
  75%{text-shadow:0 0 6px #4fa,0 0 16px #4fa,0 0 38px #4fa}
  100%{text-shadow:0 0 6px #c9a84c,0 0 14px #c9a84c,0 0 28px #c9a84c}
}
@keyframes mevzu-shake{
  0%,40%,100%{transform:none}
  5%{transform:translateX(-6px) rotate(-0.8deg)}
  10%{transform:translateX(6px) rotate(0.8deg)}
  15%{transform:translateX(-5px)}
  20%{transform:translateX(5px)}
  25%{transform:translateX(-3px)}
  30%{transform:translateX(3px)}
  35%{transform:translateX(-1px)}
}
@keyframes mevzu-bounce{
  0%,100%{transform:translateY(0) scale(1)}
  30%{transform:translateY(-16px) scale(1.07)}
  50%{transform:translateY(-10px) scale(1.03)}
  70%{transform:translateY(-4px) scale(1.01)}
}
@keyframes mevzu-flicker{
  0%,18%,22%,26%,52%,56%,100%{opacity:1}
  20%,24%,54%{opacity:0.12}
}
@keyframes mevzu-zoom{
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.18)}
}
`;

function StyleInjector() {
  useEffect(() => {
    const ID = "mevzu-kf";
    if (!document.getElementById(ID)) {
      const el = document.createElement("style");
      el.id = ID;
      el.textContent = KEYFRAMES;
      document.head.appendChild(el);
    }
  }, []);
  return null;
}

// ── Animated background layers ─────────────────────────────────
function Aurora() {
  const blobs = [
    ["rgba(80,180,255,.32)","8s","0s",false],
    ["rgba(160,80,255,.26)","11s","1.8s",true],
    ["rgba(60,230,160,.2)","9.5s","3.2s",false],
    ["rgba(255,150,60,.18)","14s","5.5s",true],
  ];
  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden" }}>
      {blobs.map(([c,dur,del,inv],i) => (
        <div key={i} style={{
          position:"absolute",width:"150%",height:"150%",left:"-25%",top:"-25%",
          background:`radial-gradient(ellipse ${48+i*14}% ${42+i*10}% at ${22+i*20}% ${28+i*16}%, ${c} 0%, transparent 68%)`,
          filter:"blur(22px)",
          animation:`mevzu-aurora ${dur} ease-in-out infinite ${del} ${inv?"reverse":"normal"}`,
        }} />
      ))}
    </div>
  );
}

function Plasma() {
  const blobs = [
    ["rgba(255,45,120,.34)","24% 36%","7s","0s",false],
    ["rgba(45,110,255,.30)","76% 64%","10s","2s",true],
    ["rgba(255,215,30,.28)","60% 20%","8s","1s",false],
    ["rgba(30,225,180,.24)","32% 80%","12s","3.5s",true],
    ["rgba(215,35,255,.24)","84% 44%","9s","4.5s",false],
  ];
  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden" }}>
      {blobs.map(([c,pos,dur,del,inv],i) => (
        <div key={i} style={{
          position:"absolute",inset:"-45%",
          background:`radial-gradient(ellipse 58% 52% at ${pos}, ${c} 0%, transparent 62%)`,
          filter:"blur(14px)",
          mixBlendMode:"screen",
          animation:`mevzu-aurora ${dur} ease-in-out infinite ${del} ${inv?"reverse":"normal"}`,
        }} />
      ))}
    </div>
  );
}

function Stars({ color }) {
  const items = useMemo(() => Array.from({ length: 55 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    sz: Math.random() * 2.8 + 0.7,
    del: (Math.random() * 5).toFixed(2),
    dur: (Math.random() * 2.5 + 1.5).toFixed(2),
  })), []);

  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none" }}>
      {items.map((s,i) => (
        <div key={i} style={{
          position:"absolute",left:`${s.x}%`,top:`${s.y}%`,
          width:s.sz,height:s.sz,borderRadius:"50%",
          background:color,
          boxShadow:`0 0 ${s.sz*3}px ${color},0 0 ${s.sz*7}px ${color}`,
          animation:`mevzu-twinkle ${s.dur}s ease-in-out infinite ${s.del}s`,
        }} />
      ))}
    </div>
  );
}

function Rings({ color }) {
  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center" }}>
      {[0,0.7,1.4,2.1,2.8].map((del,i) => (
        <div key={i} style={{
          position:"absolute",
          width:"82%",aspectRatio:"1",borderRadius:"50%",
          border:`${1.8-i*0.2}px solid ${color}`,
          boxShadow:`0 0 10px ${color},0 0 20px ${color}44`,
          animation:`mevzu-ring 3.8s ease-out infinite ${del}s`,
        }} />
      ))}
    </div>
  );
}

function Rain({ color }) {
  const CHARS = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ013578アイウ".split("");
  const cols = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    left: `${(i / 20) * 100 + (Math.random() - 0.5) * 3}%`,
    delay: `${-(Math.random() * 9).toFixed(1)}s`,
    dur: `${(3.5 + Math.random() * 5).toFixed(1)}s`,
    chars: Array.from({ length: 16 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
  })), []);

  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden" }}>
      {cols.map((c,i) => (
        <div key={i} style={{
          position:"absolute",left:c.left,
          display:"flex",flexDirection:"column",gap:2,
          animation:`mevzu-rain-fall ${c.dur} linear infinite ${c.delay}`,
          filter:`drop-shadow(0 0 5px ${color})`,
        }}>
          {c.chars.map((ch,j) => (
            <span key={j} style={{
              fontSize:11,fontFamily:"monospace",lineHeight:1,
              color: j === 0 ? "#fff" : color,
              opacity: j === 0 ? 1 : Math.max(0.05, 1 - j * 0.065),
              display:"block",
            }}>{ch}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Waves() {
  const bands = [
    ["rgba(30,100,255,.22)","9s","0s","30%","55%"],
    ["rgba(0,210,190,.17)","12s","2.5s","70%","60%"],
    ["rgba(120,20,255,.15)","10s","5s","50%","45%"],
    ["rgba(0,160,255,.13)","13s","7s","55%","70%"],
  ];
  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden" }}>
      {bands.map(([c,dur,del,x,y],i) => (
        <div key={i} style={{
          position:"absolute",width:"180%",height:"55%",left:"-40%",
          top:`${15+i*20}%`,
          background:`radial-gradient(ellipse 70% 55% at ${x} ${y}, ${c} 0%, transparent 70%)`,
          filter:"blur(28px)",
          animation:`mevzu-aurora ${dur} ease-in-out infinite ${del} ${i%2?"reverse":"normal"}`,
        }} />
      ))}
    </div>
  );
}

function Fire() {
  const embers = [
    ["rgba(255,55,0,.42)","5.5s","0s","50%","88%"],
    ["rgba(255,140,0,.30)","7s","0.7s","35%","92%"],
    ["rgba(255,30,0,.26)","6.5s","1.8s","66%","86%"],
    ["rgba(255,200,40,.18)","8.5s","0.3s","50%","95%"],
    ["rgba(200,20,0,.22)","6s","3s","42%","82%"],
    ["rgba(255,100,10,.16)","9s","2s","60%","90%"],
  ];
  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden" }}>
      {embers.map(([c,dur,del,x,y],i) => (
        <div key={i} style={{
          position:"absolute",inset:"-15%",
          background:`radial-gradient(ellipse ${36+i*8}% ${30+i*4}% at ${x} ${y}, ${c} 0%, transparent 60%)`,
          filter:`blur(${18+i*5}px)`,
          animation:`mevzu-aurora ${dur} ease-in-out infinite ${del} ${i%2?"reverse":"normal"}`,
        }} />
      ))}
    </div>
  );
}

function Nebula() {
  const clouds = [
    ["rgba(110,0,220,.28)","13s","0s","22%","28%"],
    ["rgba(0,80,255,.22)","10s","2s","76%","64%"],
    ["rgba(200,0,120,.18)","15s","4s","58%","18%"],
    ["rgba(0,200,220,.15)","11s","6s","30%","80%"],
    ["rgba(160,0,255,.18)","12s","8s","80%","40%"],
  ];
  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden" }}>
      {clouds.map(([c,dur,del,x,y],i) => (
        <div key={i} style={{
          position:"absolute",width:"160%",height:"160%",left:"-30%",top:"-30%",
          background:`radial-gradient(ellipse ${40+i*12}% ${34+i*8}% at ${x} ${y}, ${c} 0%, transparent 65%)`,
          filter:"blur(22px)",
          animation:`mevzu-aurora ${dur} ease-in-out infinite ${del} ${i%2?"reverse":"normal"}`,
        }} />
      ))}
    </div>
  );
}

function Geo({ color }) {
  return (
    <div style={{
      position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden",
      backgroundImage:`linear-gradient(${color}1a 1px,transparent 1px),linear-gradient(90deg,${color}1a 1px,transparent 1px)`,
      backgroundSize:"44px 44px",
      animation:"mevzu-float 5s ease-in-out infinite",
    }} />
  );
}

function Sparks({ color }) {
  const items = useMemo(() => Array.from({length: 32}, () => ({
    x: Math.random()*100,
    y: 20 + Math.random()*80,
    sz: Math.random()*2.5+1,
    del: `${-(Math.random()*4).toFixed(1)}s`,
    dur: `${(1.4+Math.random()*1.8).toFixed(1)}s`,
  })), []);
  return (
    <div style={{ position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden" }}>
      {items.map((p,i) => (
        <div key={i} style={{
          position:"absolute",left:`${p.x}%`,top:`${p.y}%`,
          width:p.sz,height:p.sz,borderRadius:"50%",
          background:color,
          boxShadow:`0 0 ${p.sz*2}px ${color},0 0 ${p.sz*5}px ${color}`,
          animation:`mevzu-spark ${p.dur} linear infinite ${p.del}`,
        }} />
      ))}
    </div>
  );
}

function AnimatedBg({ s }) {
  const c = s.color.text;
  const bg = s.bgAnim || "none";
  if (bg === "aurora")  return <Aurora />;
  if (bg === "plasma")  return <Plasma />;
  if (bg === "stars")   return <Stars color={c} />;
  if (bg === "rings")   return <Rings color={c} />;
  if (bg === "rain")    return <Rain color={c} />;
  if (bg === "waves")   return <Waves />;
  if (bg === "fire")    return <Fire />;
  if (bg === "nebula")  return <Nebula />;
  if (bg === "geo")     return <Geo color={c} />;
  if (bg === "sparks")  return <Sparks color={c} />;
  return null;
}

// ── Text animation style ────────────────────────────────────────
function textAnimStyle(anim, color) {
  const inf = { animationIterationCount:"infinite", animationTimingFunction:"ease-in-out", display:"inline-block" };
  if (anim === "glow")   return { ...inf, animationName:"mevzu-glow",   animationDuration:"2.5s" };
  if (anim === "float")  return { ...inf, animationName:"mevzu-float",  animationDuration:"3.2s" };
  if (anim === "glitch") return { ...inf, animationName:"mevzu-glitch", animationDuration:"5s" };
  if (anim === "pulse")  return { ...inf, animationName:"mevzu-pulse",  animationDuration:"2s" };
  if (anim === "shimmer") return {
    ...inf,
    animationName:"mevzu-shimmer",
    animationDuration:"2.5s",
    animationTimingFunction:"linear",
    background:`linear-gradient(90deg, ${color} 18%, rgba(255,255,255,.95) 50%, ${color} 82%)`,
    backgroundSize:"280% auto",
    WebkitBackgroundClip:"text",
    WebkitTextFillColor:"transparent",
    backgroundClip:"text",
  };
  if (anim === "neon")    return { ...inf, animationName:"mevzu-neon",    animationDuration:"3.5s" };
  if (anim === "shake")   return { ...inf, animationName:"mevzu-shake",   animationDuration:"4s" };
  if (anim === "bounce")  return { ...inf, animationName:"mevzu-bounce",  animationDuration:"2.8s" };
  if (anim === "flicker") return { ...inf, animationName:"mevzu-flicker", animationDuration:"5s" };
  if (anim === "zoom")    return { ...inf, animationName:"mevzu-zoom",    animationDuration:"3s" };
  return {};
}

// ── Card sub-components ─────────────────────────────────────────
const Noise = () => (
  <div style={{
    position:"absolute",inset:0,pointerEvents:"none",zIndex:0,
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
    backgroundSize:"300px",
  }} />
);

const Logo = ({ color }) => (
  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:1 }}>
    <div style={{ display:"flex",alignItems:"flex-end",gap:1 }}>
      <span style={{ fontFamily:"Georgia,serif",fontSize:13,color,lineHeight:1,marginBottom:2 }}>'</span>
      <span style={{ fontSize:17,fontWeight:700,color,lineHeight:1 }}>#</span>
    </div>
    <span style={{ fontSize:8,fontWeight:700,letterSpacing:3,color }}>MEVZU</span>
  </div>
);

const DragBox = ({ children, drag, style = {} }) => (
  <div
    onMouseDown={(e) => drag.onDown(e, drag.pos)}
    onTouchStart={(e) => drag.onDown(e, drag.pos)}
    style={{
      position:"absolute",cursor:"grab",userSelect:"none",zIndex:5,
      transform:`translate(${drag.pos.x}px,${drag.pos.y}px)`,
      ...style,
    }}
  >
    {children}
  </div>
);

function CardIcon({ s }) {
  if (s.iconHidden) return null;
  const color = s.iconColor || s.color.text;
  if (s.iconMode === "emoji") {
    const ef = s.color.dark ? "brightness(1.9) saturate(0.65)" : "none";
    return (
      <div style={{ fontSize:s.iconSize,lineHeight:1,opacity:s.iconOpacity,filter:ef,userSelect:"none" }}>
        {s.emoji}
      </div>
    );
  }
  const all = Object.values(ICON_CATS).flat();
  const found = all.find((i) => i.n === s.svgIcon);
  if (!found) return null;
  const IC = found.C;
  return (
    <div style={{ opacity:s.iconOpacity }}>
      <IC size={s.iconSize} color={color} strokeWidth={1.2} />
    </div>
  );
}

// ── Main Card ──────────────────────────────────────────────────
export default function Card({ s, cardRef, portrait = false, dragPos, onDragMove }) {
  const qd = useDrag(dragPos?.quote, onDragMove && (p => onDragMove("quote", p)));
  const ad = useDrag(dragPos?.author, onDragMove && (p => onDragMove("author", p)));
  const id = useDrag(dragPos?.icon, onDragMove && (p => onDragMove("icon", p)));
  const ld = useDrag(dragPos?.logo, onDragMove && (p => onDragMove("logo", p)));
  const t = s.color.text;
  const ta = textAnimStyle(s.textAnim || "none", t);
  const hasAnim = (s.textAnim || "none") !== "none";

  const qMax = portrait ? 200 : 380;

  // Yazı fontu, gradient metin rengi ve gölge/blur derinlik efekti
  const fontPreset = FONT_PRESETS[s.fontStyle] || FONT_PRESETS["serif-italic"];
  const gradientOn = s.textGradient?.enabled && (s.textAnim || "none") !== "shimmer";
  const gradientStyle = gradientOn ? {
    background: `linear-gradient(90deg, ${s.textGradient.from}, ${s.textGradient.to})`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text", color: "transparent",
  } : {};
  const shadowStyle = s.textShadow?.enabled ? {
    textShadow: `0 ${Math.round(2 + (s.textShadow.intensity / 100) * 6)}px ${Math.round(4 + (s.textShadow.intensity / 100) * 20)}px rgba(0,0,0,${(0.15 + (s.textShadow.intensity / 100) * 0.45).toFixed(2)})`,
  } : {};

  const Q = () => (
    <span
      data-mevzu-gradient={gradientOn ? "1" : undefined}
      data-mevzu-gradient-fallback={gradientOn ? s.textGradient.from : undefined}
      style={{
        fontFamily:fontPreset.family,fontWeight:fontPreset.weight,fontStyle:fontPreset.style,
        fontSize:s.fontSize,lineHeight:1.55,
        color:t,whiteSpace:"pre-wrap",
        display:"block", maxWidth:qMax,
        ...shadowStyle,
        ...ta,
        ...gradientStyle,
      }}>
      {s.quote}
    </span>
  );

  const Author = () => (
    <span
      data-mevzu-gradient={gradientOn ? "1" : undefined}
      data-mevzu-gradient-fallback={gradientOn ? s.textGradient.from : undefined}
      style={{
        fontSize:10,fontWeight:300,letterSpacing:3,textTransform:"uppercase",
        color:t,opacity: hasAnim ? 1 : .5,
        ...shadowStyle,
        ...(hasAnim ? ta : {}),
        ...gradientStyle,
      }}>
      {s.author}
    </span>
  );

  const sz = portrait
    ? "min(260px, calc(100vw - 40px))"
    : "min(500px, calc(100vw - 32px))";

  return (
    <>
      <StyleInjector />
      <div ref={cardRef} style={{
        width:sz,
        ...(portrait ? { aspectRatio:"9/16" } : { height:sz }),
        background:s.color.bg,
        position:"relative",overflow:"hidden",flexShrink:0,transition:"background 0.3s",
      }}>
        <Noise />
        <AnimatedBg s={s} />

        <DragBox drag={id} style={{ bottom:80,right:10,zIndex:2 }}>
          <CardIcon s={s} />
        </DragBox>

        {s.layout === "a" && <>
          <DragBox drag={ld} style={{ top:24,left:28,zIndex:3 }}><Logo color={t} /></DragBox>
          {s.tag && (
            <div style={{ position:"absolute",top:28,right:28,zIndex:3,fontSize:8,letterSpacing:5,textTransform:"uppercase",color:t,opacity:.35 }}>
              {s.tag}
            </div>
          )}
          <DragBox drag={qd} style={{ left:"50%",top:"50%",transform:`translate(calc(-50% + ${qd.pos.x}px),calc(-50% + ${qd.pos.y}px))`,width:"80%",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:18 }}>
            <Q />
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:24,height:1,background:t,opacity:.2 }} />
              <Author />
              <div style={{ width:24,height:1,background:t,opacity:.2 }} />
            </div>
          </DragBox>
        </>}

        {s.layout === "b" && <>
          <DragBox drag={ld} style={{ top:28,left:36,zIndex:3 }}><Logo color={t} /></DragBox>
          {s.tag && (
            <div style={{ position:"absolute",top:32,right:32,zIndex:3,fontSize:8,letterSpacing:5,textTransform:"uppercase",color:t,opacity:.35 }}>
              {s.tag}
            </div>
          )}
          <DragBox drag={qd} style={{ left:36,top:80 }}>
            <div style={{ fontFamily:"Georgia,serif",fontSize:86,lineHeight:.65,opacity:.07,color:t,userSelect:"none",marginBottom:4 }}>"</div>
            <Q />
          </DragBox>
          <DragBox drag={ad} style={{ left:36,bottom:36 }}>
            <div style={{ width:32,height:1,background:t,opacity:.2,marginBottom:12 }} />
            <Author />
          </DragBox>
        </>}

        {s.layout === "c" && <>
          <DragBox drag={ld} style={{ top:28,left:22,zIndex:3 }}><Logo color={t} /></DragBox>
          {s.tag && (
            <div style={{ position:"absolute",top:32,right:28,zIndex:3,fontSize:8,letterSpacing:4,textTransform:"uppercase",color:t,opacity:.3 }}>
              {s.tag}
            </div>
          )}
          <DragBox drag={qd} style={{ left:22,top:90 }}>
            {s.cat && (
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
                <div style={{ width:4,height:4,borderRadius:"50%",background:t,opacity:.4 }} />
                <span style={{ fontSize:8,letterSpacing:5,textTransform:"uppercase",color:t,opacity:.45 }}>{s.cat}</span>
              </div>
            )}
            <Q />
          </DragBox>
          <DragBox drag={ad} style={{ left:22,bottom:32 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:20,height:1,background:t,opacity:.25 }} />
              <Author />
            </div>
          </DragBox>
        </>}
      </div>
    </>
  );
}