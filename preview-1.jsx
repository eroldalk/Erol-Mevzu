import { useState, useRef, useEffect } from "react";

const CSS_BACKGROUNDS = [
  {
    id:"rain", label:"🌧 Yağmur", dark:true, textColor:"#e8f0ff",
    render:(canvas,ctx,t)=>{
      const grad=ctx.createLinearGradient(0,0,0,canvas.height);
      grad.addColorStop(0,"#0a0a1a");grad.addColorStop(1,"#1a1a2e");
      ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle="rgba(180,200,255,0.35)";ctx.lineWidth=1;
      for(let i=0;i<80;i++){
        const x=(Math.sin(i*7.3+t*0.0003)*canvas.width+canvas.width*1.5)%canvas.width;
        const y=(i*canvas.height/80+t*0.15)%canvas.height;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+18);ctx.stroke();
      }
    }
  },
  {
    id:"sunset", label:"🌅 Gün Batımı", dark:false, textColor:"#1a0a00",
    render:(canvas,ctx,t)=>{
      const grad=ctx.createLinearGradient(0,0,0,canvas.height);
      grad.addColorStop(0,"#3a1500");grad.addColorStop(0.4,"#c85000");
      grad.addColorStop(0.7,"#f0a030");grad.addColorStop(1,"#204060");
      ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);
      const sy=canvas.height*0.38+Math.sin(t*0.0003)*5;
      const glow=ctx.createRadialGradient(canvas.width/2,sy,0,canvas.width/2,sy,120);
      glow.addColorStop(0,"rgba(255,220,100,0.85)");glow.addColorStop(1,"rgba(255,100,0,0)");
      ctx.fillStyle=glow;ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  },
  {
    id:"mountain", label:"🏔 Dağ", dark:true, textColor:"#e8f4f8",
    render:(canvas,ctx,t)=>{
      const sky=ctx.createLinearGradient(0,0,0,canvas.height);
      sky.addColorStop(0,"#050a14");sky.addColorStop(1,"#1a2540");
      ctx.fillStyle=sky;ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let i=0;i<120;i++){
        const sx=(i*137.5*canvas.width/100)%canvas.width;
        const sy=(i*97.3*canvas.height/100)%(canvas.height*0.65);
        const op=0.4+Math.sin(t*0.002+i)*0.3;
        ctx.fillStyle=`rgba(255,255,255,${op})`;
        ctx.beginPath();ctx.arc(sx,sy,i%3===0?1.5:0.8,0,Math.PI*2);ctx.fill();
      }
      const mo=Math.sin(t*0.00015)*8;
      ctx.fillStyle="#0d1a0d";ctx.beginPath();
      ctx.moveTo(0,canvas.height);ctx.lineTo(0,canvas.height*0.72);
      ctx.lineTo(canvas.width*0.18,canvas.height*0.42+mo);
      ctx.lineTo(canvas.width*0.5,canvas.height*0.35+mo*0.5);
      ctx.lineTo(canvas.width*0.82,canvas.height*0.38+mo*0.7);
      ctx.lineTo(canvas.width,canvas.height*0.58);ctx.lineTo(canvas.width,canvas.height);
      ctx.closePath();ctx.fill();
    }
  },
  {
    id:"aurora", label:"🌌 Aurora", dark:true, textColor:"#e0fff4",
    render:(canvas,ctx,t)=>{
      ctx.fillStyle="#020810";ctx.fillRect(0,0,canvas.width,canvas.height);
      const colors=[[0,255,150],[0,200,255],[150,0,255],[0,255,100]];
      for(let c=0;c<4;c++){
        const [r,g,b]=colors[c];
        ctx.beginPath();
        const yB=canvas.height*(0.2+c*0.08)+Math.sin(t*0.0004+c)*30;
        ctx.moveTo(0,yB);
        for(let x=0;x<=canvas.width;x+=4){
          ctx.lineTo(x,yB+Math.sin(x*0.008+t*0.001+c*1.5)*40);
        }
        ctx.lineTo(canvas.width,0);ctx.lineTo(0,0);ctx.closePath();
        ctx.fillStyle=`rgba(${r},${g},${b},${0.06+Math.sin(t*0.0005+c)*0.03})`;
        ctx.fill();
      }
      for(let i=0;i<60;i++){
        const sx=(i*173)%canvas.width;const sy=(i*97)%(canvas.height*0.5);
        ctx.fillStyle=`rgba(255,255,255,${0.3+Math.sin(t*0.003+i)*0.25})`;
        ctx.beginPath();ctx.arc(sx,sy,0.8,0,Math.PI*2);ctx.fill();
      }
    }
  },
  {
    id:"ocean", label:"🌊 Okyanus", dark:true, textColor:"#e0f4ff",
    render:(canvas,ctx,t)=>{
      const sky=ctx.createLinearGradient(0,0,0,canvas.height*0.55);
      sky.addColorStop(0,"#0a1520");sky.addColorStop(1,"#0d2a40");
      ctx.fillStyle=sky;ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle="#061828";ctx.fillRect(0,canvas.height*0.55,canvas.width,canvas.height*0.45);
      for(let w=0;w<5;w++){
        ctx.beginPath();
        const wy=canvas.height*(0.52+w*0.09)+Math.sin(t*0.001+w)*12;
        ctx.moveTo(0,wy);
        for(let x=0;x<=canvas.width;x+=3){ctx.lineTo(x,wy+Math.sin(x*0.015+t*0.002+w*0.8)*8);}
        ctx.strokeStyle=`rgba(100,200,255,${0.15-w*0.02})`;ctx.lineWidth=1.5;ctx.stroke();
      }
    }
  },
];

const QUOTE_BANK = [
  {quote:"Bir çocuğu koruyamayanlar,\ngeleceği koruyamaz.",author:"Nelson Mandela",bg:"mountain",tag:"Eğitim"},
  {quote:"Para değer kaybeder.\nEmek asla.",author:"Karl Marx",bg:"rain",tag:"Ekonomi"},
  {quote:"Barış bir zafer değil,\ncesarettir.",author:"Willy Brandt",bg:"aurora",tag:"Siyaset"},
  {quote:"Büyümek sessizce olur.\nGürültü yapanlar büyüyemeyenlerdir.",author:"Lao Tzu",bg:"sunset",tag:"Ekonomi"},
  {quote:"Okul bitmez.\nSadece duvarları değişir.",author:"Albert Einstein",bg:"mountain",tag:"Eğitim"},
  {quote:"Adalet gecikebilir,\nama hiç gelmemezlik edemez.",author:"Martin Luther King Jr.",bg:"ocean",tag:"Hukuk"},
  {quote:"Hakkını bilmeyene\nhakkını vermezler.",author:"Yunus Emre",bg:"rain",tag:"Toplum"},
  {quote:"Savaş, diplomasinin\nbaşarısızlığa uğradığının itirafıdır.",author:"Winston Churchill",bg:"aurora",tag:"Gündem"},
  {quote:"Doğa asla acele etmez;\nyine de her şey tamamlanır.",author:"Lao Tzu",bg:"mountain",tag:"Doğa"},
  {quote:"Şampiyonlar kafalarında kazanmış\nolarak sahaya çıkar.",author:"Muhammad Ali",bg:"sunset",tag:"Spor"},
  {quote:"İklimi değiştiremedin mi?\nO zaman kendini değiştir.",author:"Konfüçyüs",bg:"ocean",tag:"Çevre"},
  {quote:"Annenin eli değdiği her şey,\nbiraz daha güzel olur.",author:"Rumi",bg:"sunset",tag:"Aile"},
];

function CssBgCanvas({bgId,width,height}){
  const ref=useRef(null);
  const animRef=useRef(null);
  const bg=CSS_BACKGROUNDS.find(b=>b.id===bgId)||CSS_BACKGROUNDS[0];
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext("2d");
    let start=null;
    const loop=ts=>{if(!start)start=ts;bg.render(canvas,ctx,ts-start);animRef.current=requestAnimationFrame(loop);};
    animRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(animRef.current);
  },[bgId,width,height]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:0}}/>;
}

function AnimText({quote,author,tag,textColor,phase}){
  const lines=quote.split("\n");
  return(
    <div style={{position:"absolute",zIndex:4,left:0,right:0,bottom:"16%",padding:"0 28px"}}>
      {tag&&<div style={{fontSize:9,letterSpacing:5,textTransform:"uppercase",color:textColor,marginBottom:14,
        transition:"opacity 0.8s, transform 0.8s",opacity:phase>=1?0.65:0,
        transform:phase>=1?"translateY(0)":"translateY(10px)"}}>{tag}</div>}
      {lines.map((line,i)=>(
        <div key={i} style={{fontFamily:"Georgia,serif",fontSize:26,fontStyle:"italic",
          fontWeight:i===0?700:400,lineHeight:1.45,marginBottom:4,
          color:i===0?`hsl(40,90%,${textColor==="#1a0a00"?"32%":"68%"})`:textColor,
          transition:`transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i*0.18}s, opacity 0.9s ease ${i*0.18}s`,
          transform:phase>=2?"translateX(0)":"translateX(-80px)",opacity:phase>=2?1:0,
          textShadow:"0 2px 24px rgba(0,0,0,0.65)"}}>{line}</div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:20,
        transition:"opacity 1s ease 0.5s",opacity:phase>=3?1:0}}>
        <div style={{width:22,height:1,background:textColor,opacity:.4}}/>
        <span style={{fontSize:10,fontWeight:300,letterSpacing:3,textTransform:"uppercase",
          color:textColor,opacity:.7,textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>{author}</span>
      </div>
    </div>
  );
}

const Logo=({color})=>(
  <div style={{position:"absolute",top:26,left:22,zIndex:5,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
    <div style={{display:"flex",alignItems:"flex-end",gap:1}}>
      <span style={{fontFamily:"Georgia,serif",fontSize:13,color,lineHeight:1,marginBottom:2,textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>'</span>
      <span style={{fontSize:17,fontWeight:700,color,lineHeight:1,textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>#</span>
    </div>
    <span style={{fontSize:8,fontWeight:700,letterSpacing:3,color,textShadow:"0 1px 8px rgba(0,0,0,.5)"}}>MEVZU</span>
  </div>
);

function PostCard({data,animated,cardRef}){
  const [phase,setPhase]=useState(0);
  const bg=CSS_BACKGROUNDS.find(b=>b.id===data.bg)||CSS_BACKGROUNDS[0];
  useEffect(()=>{
    if(!animated){setPhase(0);return;}
    setPhase(0);
    const t1=setTimeout(()=>setPhase(1),200);
    const t2=setTimeout(()=>setPhase(2),700);
    const t3=setTimeout(()=>setPhase(3),1800);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  },[animated]);
  return(
    <div ref={cardRef} style={{width:320,height:568,position:"relative",overflow:"hidden",
      flexShrink:0,background:"#000",borderRadius:16,boxShadow:"0 24px 64px rgba(0,0,0,.6)"}}>
      <CssBgCanvas bgId={data.bg} width={320} height={568}/>
      <div style={{position:"absolute",inset:0,zIndex:1,
        background:"linear-gradient(to bottom,rgba(0,0,0,.3) 0%,rgba(0,0,0,.5) 50%,rgba(0,0,0,.4) 100%)"}}/>
      <Logo color={bg.textColor}/>
      <AnimText quote={data.quote} author={data.author} tag={data.tag}
        textColor={bg.textColor} phase={phase}/>
    </div>
  );
}

function matchQuote(gundem){
  const l=gundem.toLowerCase();
  if(l.includes("ekonomi")||l.includes("para")||l.includes("borsa")||l.includes("enflasyon"))return QUOTE_BANK[1];
  if(l.includes("eğitim")||l.includes("okul")||l.includes("öğrenci")||l.includes("üniversite"))return QUOTE_BANK[4];
  if(l.includes("spor")||l.includes("futbol")||l.includes("maç")||l.includes("derbi"))return QUOTE_BANK[9];
  if(l.includes("hukuk")||l.includes("mahkeme")||l.includes("adalet")||l.includes("yargı"))return QUOTE_BANK[5];
  if(l.includes("savaş")||l.includes("iran")||l.includes("dış politika")||l.includes("nato"))return QUOTE_BANK[7];
  if(l.includes("doğa")||l.includes("iklim")||l.includes("çevre")||l.includes("hava"))return QUOTE_BANK[10];
  if(l.includes("aile")||l.includes("anne")||l.includes("çocuk"))return QUOTE_BANK[11];
  if(l.includes("barış")||l.includes("siyaset")||l.includes("seçim"))return QUOTE_BANK[2];
  return QUOTE_BANK[Math.floor(Math.random()*QUOTE_BANK.length)];
}

export default function App(){
  const [step,setStep]=useState("home");
  const [current,setCurrent]=useState(null);
  const [animated,setAnimated]=useState(false);
  const [gundem,setGundem]=useState("");
  const cardRef=useRef(null);

  const generate=async(fromGundem=false)=>{
    setStep("generating");setAnimated(false);
    await new Promise(r=>setTimeout(r,1000));
    const chosen=fromGundem&&gundem.trim()?matchQuote(gundem):QUOTE_BANK[Math.floor(Math.random()*QUOTE_BANK.length)];
    setCurrent({...chosen});
    setStep("result");
    setTimeout(()=>setAnimated(true),300);
  };

  const reset=()=>{setStep("home");setCurrent(null);setAnimated(false);setGundem("");};

  const bg="#141414";
  const center={minHeight:"100vh",display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",background:bg,
    fontFamily:"'DM Sans',sans-serif",color:"#f0f0f0",padding:"24px",gap:24};

  // ── HOME ──
  if(step==="home") return(
    <div style={center}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,marginBottom:4}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:2}}>
          <span style={{fontFamily:"Georgia,serif",fontSize:38,color:"#c9a84c",lineHeight:1}}>'</span>
          <span style={{fontSize:46,fontWeight:700,color:"#c9a84c",lineHeight:1}}>#</span>
        </div>
        <span style={{fontSize:22,fontWeight:700,letterSpacing:7,color:"#c9a84c"}}>MEVZU</span>
        <span style={{fontSize:9,letterSpacing:3,color:"#555",textTransform:"uppercase"}}>Otomatik Post Üreticisi</span>
      </div>
      <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#555"}}>Gündem Konusu</label>
          <input value={gundem} onChange={e=>setGundem(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&generate(true)}
            placeholder="ekonomi, eğitim, spor, adalet, doğa..."
            style={{background:"#1c1c1c",border:"1px solid #282828",borderRadius:10,
              color:"#f0f0f0",fontSize:14,padding:"12px 14px",outline:"none",fontFamily:"inherit"}}
            onFocus={e=>e.target.style.borderColor="#c9a84c"}
            onBlur={e=>e.target.style.borderColor="#282828"}/>
        </div>
        <button onClick={()=>generate(true)}
          style={{background:"linear-gradient(135deg,#c9a84c,#a07830)",color:"#1a1200",border:"none",
            borderRadius:12,padding:"15px 0",cursor:"pointer",fontFamily:"inherit",fontSize:12,
            fontWeight:700,letterSpacing:3,textTransform:"uppercase",
            boxShadow:"0 4px 20px rgba(201,168,76,.25)"}}>
          ✦ Post Üret
        </button>
        <button onClick={()=>generate(false)}
          style={{background:"transparent",color:"#555",border:"1px solid #282828",borderRadius:12,
            padding:"13px 0",cursor:"pointer",fontFamily:"inherit",fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>
          🎲 Rastgele
        </button>
      </div>
    </div>
  );

  // ── GENERATING ──
  if(step==="generating") return(
    <div style={center}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
        <div style={{width:52,height:52,borderRadius:"50%",border:"2px solid #282828",
          borderTop:"2px solid #c9a84c",animation:"spin 0.9s linear infinite"}}/>
        <span style={{fontSize:11,color:"#555",letterSpacing:3,textTransform:"uppercase"}}>Post hazırlanıyor...</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── RESULT ──
  const bgDef=CSS_BACKGROUNDS.find(b=>b.id===current?.bg)||CSS_BACKGROUNDS[0];
  return(
    <div style={{...center,justifyContent:"flex-start",paddingTop:32,gap:20}}>
      {/* Top bar */}
      <div style={{width:"100%",maxWidth:340,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={reset} style={{background:"none",border:"none",color:"#555",fontSize:18,cursor:"pointer"}}>← Geri</button>
        <span style={{fontSize:9,letterSpacing:3,color:"#555",textTransform:"uppercase"}}>Hazır Post</span>
        <button onClick={()=>{setAnimated(false);setTimeout(()=>generate(gundem.trim().length>0),100);}}
          style={{background:"none",border:"1px solid #282828",borderRadius:8,color:"#c9a84c",
            fontSize:9,letterSpacing:2,textTransform:"uppercase",padding:"6px 12px",cursor:"pointer"}}>
          🎲 Yenile
        </button>
      </div>

      {/* Kart */}
      <PostCard data={current} animated={animated} cardRef={cardRef}/>

      {/* Bilgi */}
      <div style={{width:"100%",maxWidth:320,background:"#1c1c1c",border:"1px solid #282828",
        borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
        <span style={{fontSize:9,letterSpacing:3,color:"#555",textTransform:"uppercase"}}>Üretilen Söz</span>
        <p style={{fontFamily:"Georgia,serif",fontStyle:"italic",color:"#f0f0f0",fontSize:13,lineHeight:1.5,margin:0}}>
          "{current?.quote?.replace(/\n/g," ")}"
        </p>
        <span style={{fontSize:10,color:"#c9a84c",letterSpacing:2}}>— {current?.author}</span>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",padding:"3px 8px",
            borderRadius:20,background:"rgba(201,168,76,.1)",color:"#c9a84c"}}>{current?.tag}</span>
          <span style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",padding:"3px 8px",
            borderRadius:20,background:"#242424",color:"#555"}}>{bgDef.label}</span>
        </div>
      </div>

      {/* Butonlar */}
      <div style={{width:"100%",maxWidth:320,display:"flex",gap:8}}>
        <button onClick={()=>{setAnimated(false);setTimeout(()=>setAnimated(true),50);}}
          style={{flex:1,background:"#1c1c1c",border:"1px solid #282828",borderRadius:10,
            padding:"12px 0",cursor:"pointer",color:"#c9a84c",fontFamily:"inherit",
            fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>
          ▷ Önizle
        </button>
        <button onClick={async()=>{
          if(!cardRef.current)return;
          const btn=document.activeElement;
          if(btn)btn.textContent="⏳";
          try{
            const {default:h2c}=await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js");
            const canvas=await h2c(cardRef.current,{scale:2,useCORS:true,logging:false,backgroundColor:null});
            const a=document.createElement("a");
            a.download=`mevzu-${Date.now()}.png`;
            a.href=canvas.toDataURL("image/png");a.click();
          }catch(e){alert("Chrome kullan: "+e.message);}
          if(btn)btn.textContent="⬇ İndir";
        }} style={{flex:2,background:"#c9a84c",color:"#1a1200",border:"none",borderRadius:10,
          padding:"12px 0",cursor:"pointer",fontFamily:"inherit",fontSize:12,
          fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>
          ⬇ İndir
        </button>
      </div>
    </div>
  );
}
