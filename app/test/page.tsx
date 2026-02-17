'use client';
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────
   GSAP loaded from CDN in useEffect
───────────────────────────────────────── */

const PROPERTIES = [
  { id:1, title:"Skyline Penthouse",   location:"Mumbai, Bandra West",    price:"0.008", beds:3, baths:2, sqft:2100, tag:"Featured",  img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" },
  { id:2, title:"Garden Villa",        location:"Pune, Koregaon Park",    price:"0.004", beds:4, baths:3, sqft:3200, tag:"New",        img:"https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80" },
  { id:3, title:"Urban Studio",        location:"Bangalore, Indiranagar", price:"0.002", beds:1, baths:1, sqft:680,  tag:"Popular",   img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" },
  { id:4, title:"Lakefront Retreat",   location:"Udaipur, Lake Pichola",  price:"0.006", beds:5, baths:4, sqft:4100, tag:"Exclusive", img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" },
];

const FEATURES = [
  { icon:"🔐", title:"Escrow Protection",    body:"Security deposits locked in smart contracts. Released only when both parties agree." },
  { icon:"📊", title:"Live Contract State",  body:"Balance, penalties, days remaining — fetched from Ethereum in real time." },
  { icon:"⚖️", title:"Fair Late Fees",       body:"Grace periods encoded in contract. No surprises, no negotiations, ever." },
  { icon:"🌐", title:"Zero Intermediaries",  body:"No bank, no property manager. Just landlord, tenant, and code." },
  { icon:"📱", title:"Any Wallet",           body:"MetaMask, WalletConnect, Coinbase, Trust Wallet — desktop or mobile." },
  { icon:"✅", title:"Verified On-Chain",    body:"Every transaction on Etherscan. Your lease is a permanent, tamper-proof record." },
];

/* ── load GSAP dynamically ── */
function loadScript(src) {
  return new Promise(res => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src; s.onload = res;
    document.head.appendChild(s);
  });
}

/* ── 3D tilt hook ── */
function useTilt(strength = 12) {
  const ref = useRef(null);
  const onMove = useCallback(e => {
    const el = ref.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale3d(1.03,1.03,1.03)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ── magnetic button hook ── */
function useMagnetic(strength = 0.4) {
  const ref = useRef(null);
  const onMove = useCallback(e => {
    const el = ref.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - (r.left + r.width  / 2)) * strength;
    const y  = (e.clientY - (r.top  + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  }, []);
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ── property card ── */
function PropertyCard({ p, index }) {
  const tilt  = useTilt(8);
  const [liked, setLiked] = useState(false);
  const cardRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.12 });
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={cardRef} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0) rotateX(0deg)" : "translateY(60px) rotateX(8deg)",
      transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${index * 0.13}s, transform 0.8s cubic-bezier(.16,1,.3,1) ${index * 0.13}s`,
    }}>
      <div
        {...tilt}
        ref={el => { tilt.ref.current = el; }}
        style={{
          background:"#fff", borderRadius:24, overflow:"hidden",
          boxShadow:"0 4px 24px rgba(0,0,0,0.07)",
          cursor:"pointer",
          transition:"box-shadow 0.4s ease, transform 0.4s cubic-bezier(.16,1,.3,1)",
          transformStyle:"preserve-3d",
          willChange:"transform",
        }}
      >
        {/* image */}
        <div style={{ position:"relative", height:220, overflow:"hidden" }}>
          <img src={p.img} alt={p.title}
            style={{ width:"100%", height:"100%", objectFit:"cover",
              transition:"transform 0.6s cubic-bezier(.16,1,.3,1)" }}
            onMouseEnter={e => e.target.style.transform="scale(1.08)"}
            onMouseLeave={e => e.target.style.transform="scale(1)"}
          />
          <div style={{ position:"absolute",inset:0, background:"linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45))" }} />
          <div style={{ position:"absolute",top:14,left:14,
            background:"rgba(255,255,255,0.94)", backdropFilter:"blur(8px)",
            padding:"4px 12px", borderRadius:100, fontSize:11, fontWeight:600, color:"#1A1A2E" }}>
            {p.tag}
          </div>
          <button onClick={() => setLiked(!liked)} style={{
            position:"absolute",top:14,right:14, width:36,height:36,
            borderRadius:"50%", background:"rgba(255,255,255,0.94)", backdropFilter:"blur(8px)",
            border:"none", cursor:"pointer", fontSize:16,
            transition:"transform 0.25s cubic-bezier(.34,1.56,.64,1)",
            display:"flex",alignItems:"center",justifyContent:"center",
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            {liked ? "❤️" : "🤍"}
          </button>
          <div style={{ position:"absolute",bottom:14,right:14,
            background:"#1A1A2E",color:"#fff",padding:"6px 14px",borderRadius:100,
            fontSize:13,fontWeight:700 }}>
            {p.price} ETH<span style={{fontWeight:300,opacity:.7,fontSize:10}}>/mo</span>
          </div>
        </div>

        {/* body */}
        <div style={{ padding:"18px 20px 20px" }}>
          <div style={{ fontWeight:700,fontSize:16,color:"#1A1A2E",marginBottom:4 }}>{p.title}</div>
          <div style={{ fontSize:12,color:"#9CA3AF",marginBottom:14 }}>📍 {p.location}</div>
          <div style={{ display:"flex",borderTop:"1px solid #F3F4F6",paddingTop:14 }}>
            {[{val:p.beds,label:"Beds"},{val:p.baths,label:"Baths"},{val:p.sqft,label:"sqft"}].map((s,i)=>(
              <div key={i} style={{ flex:1,textAlign:"center",borderRight:i<2?"1px solid #F3F4F6":"none" }}>
                <div style={{ fontWeight:700,fontSize:14,color:"#1A1A2E" }}>{s.val}</div>
                <div style={{ fontSize:10,color:"#9CA3AF",marginTop:1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── feature card with 3D tilt ── */
function FeatureCard({ f, index }) {
  const tilt = useTilt(6);
  const ref  = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setVis(true);obs.disconnect();} },{threshold:0.1});
    if (ref.current) obs.observe(ref.current);
    return ()=>obs.disconnect();
  },[]);

  return (
    <div ref={ref} style={{
      opacity:vis?1:0,
      transform:vis?"translateY(0)":"translateY(48px)",
      transition:`opacity 0.7s ease ${index*0.09}s, transform 0.7s cubic-bezier(.16,1,.3,1) ${index*0.09}s`,
    }}>
      <div {...tilt} ref={el=>{tilt.ref.current=el;}} style={{
        background:"#fff",borderRadius:22,padding:"28px",
        border:"1px solid #F0F0EE",
        transition:"box-shadow 0.3s,transform 0.4s cubic-bezier(.16,1,.3,1)",
        transformStyle:"preserve-3d",willChange:"transform",
        height:"100%",
      }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 20px 60px rgba(0,0,0,0.1)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
      >
        <div style={{ width:46,height:46,background:"#F8F8F6",borderRadius:13,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18 }}>
          {f.icon}
        </div>
        <div style={{ fontWeight:700,fontSize:15,color:"#1A1A2E",marginBottom:8 }}>{f.title}</div>
        <div style={{ fontSize:12.5,color:"#6B7280",lineHeight:1.65,fontWeight:300 }}>{f.body}</div>
      </div>
    </div>
  );
}

export default function LeasifyHome() {
  const [gsapReady, setGsapReady]   = useState(false);
  const [navSolid,  setNavSolid]    = useState(false);
  const [heroVis,   setHeroVis]     = useState(false);
  const [activeStep,setActiveStep]  = useState(0);
  const [counter,   setCounter]     = useState({leases:0,eth:0,users:0});
  const [statsGone, setStatsGone]   = useState(false);
  const [mousePos,  setMousePos]    = useState({x:0.5,y:0.5});
  const [cursorPos, setCursorPos]   = useState({x:-100,y:-100});
  const [cursorBig, setCursorBig]   = useState(false);

  const heroRef       = useRef(null);
  const heroImgRef    = useRef(null);
  const heroTextRef   = useRef(null);
  const parallaxRef   = useRef(null);
  const statsRef      = useRef(null);
  const pinRef        = useRef(null);
  const step1Ref      = useRef(null);

  /* ── load GSAP + ScrollTrigger ── */
  useEffect(()=>{
    (async()=>{
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
      window.gsap.registerPlugin(window.ScrollTrigger);
      setGsapReady(true);
    })();
  },[]);

  /* ── GSAP animations ── */
  useEffect(()=>{
    if (!gsapReady) return;
    const gsap = window.gsap;
    const ST   = window.ScrollTrigger;

    /* hero headline stagger */
    gsap.fromTo(".hero-char", { y:80, opacity:0, rotateX:-40 },
      { y:0, opacity:1, rotateX:0, duration:1, stagger:0.04,
        ease:"back.out(1.4)", delay:0.2 });

    gsap.fromTo(".hero-sub-line",{y:30,opacity:0},{y:0,opacity:1,duration:0.8,stagger:0.12,delay:0.9,ease:"power3.out"});
    gsap.fromTo(".hero-btns",{y:20,opacity:0},{y:0,opacity:1,duration:0.7,delay:1.3,ease:"power3.out"});

    /* hero image parallax on scroll */
    if (heroImgRef.current) {
      gsap.to(heroImgRef.current, {
        yPercent: -18,
        ease:"none",
        scrollTrigger:{ trigger:heroRef.current, start:"top top", end:"bottom top", scrub:1.2 }
      });
    }

    /* hero card 3D tilt on scroll */
    if (heroTextRef.current) {
      gsap.to(heroTextRef.current, {
        rotateX:12, y:-30,
        ease:"none",
        scrollTrigger:{ trigger:heroRef.current, start:"top top", end:"bottom top", scrub:1.5 }
      });
    }

    /* big section title reveal — clip path wipe */
    gsap.utils.toArray(".section-wipe").forEach(el=>{
      gsap.fromTo(el,
        { clipPath:"inset(0 100% 0 0)" },
        { clipPath:"inset(0 0% 0 0)", duration:1.2, ease:"power4.inOut",
          scrollTrigger:{ trigger:el, start:"top 85%", once:true } }
      );
    });

    /* marquee pause none — just leave it CSS */

    /* property section — horizontal reveal */
    gsap.utils.toArray(".prop-row").forEach(row=>{
      gsap.fromTo(row,
        { x:-60, opacity:0 },
        { x:0, opacity:1, duration:1, ease:"power3.out",
          scrollTrigger:{ trigger:row, start:"top 88%", once:true } }
      );
    });

    /* stats number counter */
    if (statsRef.current) {
      const targets = { leases:1240, eth:48, users:3600 };
      ST.create({
        trigger: statsRef.current,
        start:"top 80%",
        once:true,
        onEnter:()=>{
          gsap.to({leases:0,eth:0,users:0},{
            leases:targets.leases, eth:targets.eth, users:targets.users,
            duration:2.2, ease:"power2.out",
            onUpdate:function(){
              setCounter({ leases:Math.floor(this.targets()[0].leases),
                           eth:   Math.floor(this.targets()[0].eth),
                           users: Math.floor(this.targets()[0].users) });
            }
          });
        }
      });
    }

    /* feature cards — staggered 3d flip */
    gsap.utils.toArray(".feat-card-wrap").forEach((el,i)=>{
      gsap.fromTo(el,
        { y:60, opacity:0, rotateY:-15 },
        { y:0, opacity:1, rotateY:0, duration:0.9, ease:"back.out(1.2)",
          scrollTrigger:{ trigger:el, start:"top 90%", once:true },
          delay: i * 0.08
        }
      );
    });

    /* CTA cards — scale pop */
    gsap.utils.toArray(".cta-card").forEach((el,i)=>{
      gsap.fromTo(el,
        { scale:0.92, opacity:0, y:40 },
        { scale:1, opacity:1, y:0, duration:1, ease:"back.out(1.3)",
          scrollTrigger:{ trigger:el, start:"top 88%", once:true },
          delay:i * 0.15
        }
      );
    });

    /* pinned step panel — scrub through steps */
    if (pinRef.current) {
      ST.create({
        trigger: pinRef.current,
        start:"top top",
        end:`+=${window.innerHeight * 3}`,
        pin:true,
        scrub:false,
        onUpdate:(self)=>{
          const step = Math.min(3, Math.floor(self.progress * 4));
          setActiveStep(step);
        }
      });
    }

    /* floating badges parallax */
    gsap.utils.toArray(".float-badge").forEach((el,i)=>{
      gsap.to(el,{
        y: i%2===0 ? -30 : 30,
        ease:"none",
        scrollTrigger:{ trigger:heroRef.current, start:"top top", end:"bottom top", scrub:2+i }
      });
    });

    return ()=>{ ST.getAll().forEach(t=>t.kill()); };
  },[gsapReady]);

  /* ── scroll / mouse tracking ── */
  useEffect(()=>{
    const onScroll=()=>setNavSolid(window.scrollY>40);
    window.addEventListener("scroll",onScroll);

    const onMouse=e=>{
      setCursorPos({x:e.clientX,y:e.clientY});
      setMousePos({x:e.clientX/window.innerWidth, y:e.clientY/window.innerHeight});
    };
    window.addEventListener("mousemove",onMouse);

    setTimeout(()=>setHeroVis(true),60);
    return ()=>{ window.removeEventListener("scroll",onScroll); window.removeEventListener("mousemove",onMouse); };
  },[]);

  const magBtn1 = useMagnetic(0.35);
  const magBtn2 = useMagnetic(0.35);

  const STEPS = [
    { num:"01", title:"Connect Your Wallet",   body:"Sign in with MetaMask or any WalletConnect wallet. No passwords — your wallet is your identity.", icon:"🔗", color:"#1A1A2E",
      img:"https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=700&q=80" },
    { num:"02", title:"Browse & Filter",        body:"Explore verified listings. Filter by location, ETH price, and duration. Every property is on-chain verified.", icon:"🏠", color:"#2D5BE3",
      img:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80" },
    { num:"03", title:"Sign Lease On-Chain",    body:"Request a lease. Landlord accepts → smart contract auto-deploys. Your agreement, immutable forever on Ethereum.", icon:"📋", color:"#059669",
      img:"https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80" },
    { num:"04", title:"Pay & Track Live",       body:"Pay deposit and rent from your wallet. Track every payment and contract state in real time, directly on-chain.", icon:"⚡", color:"#D97706",
      img:"https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=700&q=80" },
  ];

  return (
    <div style={{ fontFamily:"'Sora',sans-serif", background:"#F8F8F6", minHeight:"100vh", color:"#1A1A2E", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::selection{background:#1A1A2E;color:#fff;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#F8F8F6;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:10px;}

        /* custom cursor */
        .cursor{
          position:fixed;top:0;left:0;pointer-events:none;z-index:9999;mix-blend-mode:difference;
          width:12px;height:12px;border-radius:50%;background:#1A1A2E;
          transition:transform 0.15s ease,width 0.3s,height 0.3s,background 0.3s;
          transform:translate(-50%,-50%);
        }
        .cursor.big{width:40px;height:40px;background:#1A1A2E;}
        .cursor-ring{
          position:fixed;top:0;left:0;pointer-events:none;z-index:9998;
          width:36px;height:36px;border-radius:50%;border:1px solid rgba(26,26,46,0.3);
          transform:translate(-50%,-50%);
          transition:all 0.4s cubic-bezier(.16,1,.3,1);
        }

        .btn-dark{
          background:#1A1A2E;color:#fff;border:none;padding:14px 32px;
          border-radius:14px;font-family:'Sora',sans-serif;font-size:13px;font-weight:600;
          cursor:pointer;letter-spacing:0.01em;
          transition:background 0.2s,box-shadow 0.3s;
          white-space:nowrap;
        }
        .btn-dark:hover{background:#2D2D4E;box-shadow:0 8px 32px rgba(26,26,46,0.28);}

        .btn-outline{
          background:transparent;color:#1A1A2E;border:1.5px solid #E5E7EB;
          padding:13px 32px;border-radius:14px;font-family:'Sora',sans-serif;
          font-size:13px;font-weight:500;cursor:pointer;
          transition:border-color 0.2s,background 0.2s;
        }
        .btn-outline:hover{border-color:#1A1A2E;background:#F3F4F6;}

        .nav-link{font-size:13px;font-weight:400;color:#6B7280;cursor:pointer;
          transition:color 0.2s;letter-spacing:0.01em;}
        .nav-link:hover{color:#1A1A2E;}

        .tag-pill{display:inline-flex;align-items:center;gap:6px;
          background:#F0F0F8;color:#4B5563;padding:6px 14px;border-radius:100px;
          font-size:11px;font-weight:500;letter-spacing:0.04em;font-family:'DM Mono',monospace;}

        .live-dot{width:6px;height:6px;background:#059669;border-radius:50%;
          display:inline-block;animation:blink 2s infinite;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}

        @keyframes marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
        .marquee-track{display:flex;animation:marquee 24s linear infinite;width:max-content;}
        .marquee-track:hover{animation-play-state:paused;}

        @keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}

        /* hero chars */
        .hero-char{display:inline-block;transform-origin:bottom center;}

        /* step progress bar */
        .step-bar{height:3px;background:#E5E7EB;border-radius:2px;overflow:hidden;}
        .step-fill{height:100%;border-radius:2px;background:#1A1A2E;
          transition:width 0.1s linear;}

        @keyframes scaleIn{from{transform:scale(0.85);opacity:0;}to{transform:scale(1);opacity:1;}}
        .img-switch{animation:scaleIn 0.5s cubic-bezier(.16,1,.3,1) both;}
      `}</style>

      {/* ── Custom cursor ── */}
      <div className={`cursor ${cursorBig?"big":""}`}
        style={{ left:cursorPos.x, top:cursorPos.y }} />
      <div className="cursor-ring" style={{ left:cursorPos.x, top:cursorPos.y }} />

      {/* ════════════ NAVBAR ════════════ */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        padding:"0 48px",height:68,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:navSolid?"rgba(248,248,246,0.92)":"transparent",
        backdropFilter:navSolid?"blur(20px)":"none",
        borderBottom:navSolid?"1px solid rgba(0,0,0,0.06)":"none",
        transition:"all 0.4s ease",
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,background:"#1A1A2E",borderRadius:10,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>🏠</div>
          <span style={{ fontWeight:800,fontSize:18,letterSpacing:"-0.03em",color:"#1A1A2E" }}>Leasify</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:36 }}>
          {["Browse","How it Works","For Landlords","Docs"].map(l=>(
            <span key={l} className="nav-link"
              onMouseEnter={()=>setCursorBig(true)}
              onMouseLeave={()=>setCursorBig(false)}>{l}</span>
          ))}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <span className="nav-link">Sign In</span>
          <div {...magBtn1} ref={el=>{magBtn1.ref.current=el;}}>
            <button className="btn-dark" style={{ padding:"10px 22px",fontSize:12 }}
              onMouseEnter={()=>setCursorBig(true)}
              onMouseLeave={()=>setCursorBig(false)}>
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════ HERO ════════════ */}
      <section ref={heroRef} style={{
        minHeight:"100vh",padding:"0 48px",
        display:"grid",gridTemplateColumns:"1fr 1fr",alignItems:"center",gap:60,
        maxWidth:1280,margin:"0 auto",paddingTop:80,
        perspective:1200,
      }}>
        {/* Left text */}
        <div>
          {/* tag */}
          <div className="hero-sub-line" style={{ marginBottom:24,opacity:0 }}>
            <div className="tag-pill">
              <span className="live-dot" /> Live on Ethereum Sepolia
            </div>
          </div>

          {/* headline — split into chars */}
          <h1 style={{
            fontSize:"clamp(44px,5.5vw,76px)",fontWeight:800,
            lineHeight:1.02,letterSpacing:"-0.045em",
            marginBottom:24,overflow:"hidden",
          }}>
            {"Rent homes.".split("").map((c,i)=>(
              <span key={i} className="hero-char" style={{ opacity:0, color:"#1A1A2E" }}>
                {c===" "?" ":c}
              </span>
            ))}
            <br/>
            {"On-chain.".split("").map((c,i)=>(
              <span key={i+20} className="hero-char" style={{ opacity:0, color:"#2D5BE3" }}>
                {c===" "?" ":c}
              </span>
            ))}
          </h1>

          <p className="hero-sub-line" style={{
            fontSize:15,fontWeight:300,color:"#6B7280",lineHeight:1.75,
            maxWidth:420,marginBottom:40,opacity:0,
          }}>
            Leasify replaces paper lease agreements with Ethereum smart contracts.
            Deposits secured. Payments enforced. No lawyers, no banks, no middlemen.
          </p>

          <div className="hero-btns" style={{ display:"flex",gap:14,alignItems:"center",marginBottom:52,opacity:0 }}>
            <div {...magBtn1} ref={el=>{magBtn1.ref.current=el;}}>
              <button className="btn-dark"
                onMouseEnter={()=>setCursorBig(true)}
                onMouseLeave={()=>setCursorBig(false)}>
                Find a Home
              </button>
            </div>
            <div {...magBtn2} ref={el=>{magBtn2.ref.current=el;}}>
              <button className="btn-outline">List Your Property</button>
            </div>
          </div>

          <div className="hero-sub-line" style={{ display:"flex",gap:36,opacity:0 }}>
            {[{val:"1,240+",label:"Leases"},{val:"48 ETH",label:"Secured"},{val:"3,600+",label:"Users"}].map((s,i)=>(
              <div key={i}>
                <div style={{ fontWeight:800,fontSize:24,letterSpacing:"-0.03em",color:"#1A1A2E" }}>{s.val}</div>
                <div style={{ fontSize:11,color:"#9CA3AF",marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero card with GSAP parallax */}
        <div ref={heroTextRef} style={{ position:"relative", transformStyle:"preserve-3d" }}>
          <div style={{
            background:"#fff",borderRadius:28,overflow:"hidden",
            boxShadow:"0 24px 80px rgba(0,0,0,0.14)",
            animation:"floatY 7s ease-in-out infinite",
            opacity:heroVis?1:0,
            transform:heroVis?"translateY(0)":"translateY(40px)",
            transition:"opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s",
          }}>
            <div ref={heroImgRef} style={{ height:300,overflow:"hidden",position:"relative" }}>
              <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85"
                alt="hero" style={{ width:"100%",height:"115%",objectFit:"cover" }} />
              <div style={{ position:"absolute",inset:0,
                background:"linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.5))" }} />
              <div style={{ position:"absolute",bottom:20,left:20,color:"#fff" }}>
                <div style={{ fontSize:20,fontWeight:800,letterSpacing:"-0.02em" }}>Skyline Penthouse</div>
                <div style={{ fontSize:12,opacity:.8,marginTop:2 }}>📍 Mumbai, Bandra West</div>
              </div>
              <div style={{ position:"absolute",top:20,right:20,
                background:"#1A1A2E",color:"#fff",padding:"8px 16px",borderRadius:100,
                fontSize:13,fontWeight:700 }}>0.008 ETH/mo</div>
            </div>
            <div style={{ padding:"18px 22px 22px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={{ display:"flex",gap:24 }}>
                  {[["3","Beds"],["2","Baths"],["2,100","sqft"]].map(([v,l])=>(
                    <div key={l} style={{ textAlign:"center" }}>
                      <div style={{ fontWeight:700,fontSize:15 }}>{v}</div>
                      <div style={{ fontSize:10,color:"#9CA3AF" }}>{l}</div>
                    </div>
                  ))}
                </div>
                <button className="btn-dark" style={{ padding:"10px 22px",fontSize:12 }}>Request Lease</button>
              </div>
              <div style={{ background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,
                padding:"10px 14px",display:"flex",alignItems:"center",gap:8 }}>
                <span className="live-dot" />
                <span style={{ fontSize:11,color:"#059669",fontFamily:"'DM Mono',monospace" }}>
                  Smart contract verified · 0x6379...ED12
                </span>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="float-badge" style={{
            position:"absolute",top:-28,left:-44,
            background:"#fff",borderRadius:18,padding:"12px 18px",
            boxShadow:"0 8px 32px rgba(0,0,0,0.1)",
            opacity:heroVis?1:0,transition:"opacity 0.6s ease 0.9s",
            animation:"floatY 5s ease-in-out infinite 1s",
          }}>
            <div style={{ fontSize:10,color:"#9CA3AF",marginBottom:2 }}>Deposit secured</div>
            <div style={{ fontWeight:700,fontSize:18,letterSpacing:"-0.03em",color:"#059669" }}>0.008 ETH 🔒</div>
          </div>

          <div className="float-badge" style={{
            position:"absolute",bottom:90,right:-40,
            background:"#1A1A2E",color:"#fff",borderRadius:18,padding:"12px 18px",
            boxShadow:"0 8px 32px rgba(0,0,0,0.2)",
            opacity:heroVis?1:0,transition:"opacity 0.6s ease 1.1s",
            animation:"floatY 6s ease-in-out infinite 0.5s",
          }}>
            <div style={{ fontSize:10,opacity:.5,marginBottom:2 }}>Contract status</div>
            <div style={{ fontWeight:600,fontSize:13 }}>ACTIVE ✓</div>
          </div>
        </div>
      </section>

      {/* ════════════ MARQUEE ════════════ */}
      <div style={{ background:"#1A1A2E",overflow:"hidden",padding:"16px 0",margin:"0 0 80px" }}>
        <div className="marquee-track">
          {[...Array(2)].map((_,ri)=>
            ["No Middlemen","Deposit Secured","On-Chain Verified","Any Wallet",
             "Instant Settlement","Immutable Terms","Zero Disputes","Smart Contracts"].map((t,i)=>(
              <span key={`${ri}-${i}`} style={{
                color:i%3===0?"#A78BFA":i%3===1?"#fff":"#6B7280",
                fontSize:13,fontWeight:i%3===0?600:400,
                whiteSpace:"nowrap",padding:"0 32px",
                fontFamily:i%3===2?"'DM Mono',monospace":"'Sora',sans-serif",
              }}>{t}</span>
            ))
          )}
        </div>
      </div>

      {/* ════════════ PROPERTIES ════════════ */}
      <section style={{ padding:"0 48px 100px",maxWidth:1280,margin:"0 auto" }}>
        <div className="prop-row" style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:48 }}>
          <div>
            <div className="tag-pill" style={{ marginBottom:14 }}>Featured Listings</div>
            <h2 className="section-wipe" style={{
              fontSize:"clamp(32px,4vw,52px)",fontWeight:800,
              letterSpacing:"-0.04em",lineHeight:1.1,color:"#1A1A2E",
            }}>
              Homes waiting<br/>for a tenant
            </h2>
          </div>
          <button className="btn-outline" style={{ marginBottom:8 }}>View All →</button>
        </div>

        {/* filters */}
        <div className="prop-row" style={{ display:"flex",gap:10,marginBottom:32 }}>
          {["All","Studio","1 BHK","2 BHK","Villa","Penthouse"].map((f,i)=>(
            <button key={f} style={{
              padding:"8px 20px",borderRadius:100,border:"1.5px solid",
              borderColor:i===0?"#1A1A2E":"#E5E7EB",
              background:i===0?"#1A1A2E":"#fff",
              color:i===0?"#fff":"#6B7280",fontSize:12,fontWeight:500,
              cursor:"pointer",fontFamily:"'Sora',sans-serif",transition:"all 0.2s",
            }}
            onMouseEnter={e=>{ if(i!==0){ e.currentTarget.style.borderColor="#1A1A2E"; e.currentTarget.style.color="#1A1A2E"; }}}
            onMouseLeave={e=>{ if(i!==0){ e.currentTarget.style.borderColor="#E5E7EB"; e.currentTarget.style.color="#6B7280"; }}}
            >{f}</button>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:24 }}>
          {PROPERTIES.map((p,i)=><PropertyCard key={p.id} p={p} index={i} />)}
        </div>
      </section>

      {/* ════════════ HOW IT WORKS — PINNED ════════════ */}
      <section style={{ background:"#fff",padding:"100px 48px" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:64 }}>
            <div className="tag-pill" style={{ marginBottom:16,display:"inline-flex" }}>Simple Process</div>
            <h2 className="section-wipe" style={{
              fontSize:"clamp(32px,4vw,52px)",fontWeight:800,
              letterSpacing:"-0.04em",color:"#1A1A2E",lineHeight:1.1,
            }}>
              From search to signed<br/>in four steps
            </h2>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"start" }}>
            {/* Steps */}
            <div>
              {STEPS.map((s,i)=>(
                <div key={i} onClick={()=>setActiveStep(i)}
                  style={{
                    display:"flex",alignItems:"flex-start",gap:16,padding:"20px 22px",
                    borderRadius:20,background:activeStep===i?"#F8F8F6":"transparent",
                    border:`1.5px solid ${activeStep===i?"#E5E7EB":"transparent"}`,
                    marginBottom:10,cursor:"pointer",
                    transition:"all 0.35s cubic-bezier(.16,1,.3,1)",
                    boxShadow:activeStep===i?"0 4px 24px rgba(0,0,0,0.07)":"none",
                  }}
                  onMouseEnter={e=>{if(activeStep!==i)e.currentTarget.style.background="#FAFAFA";}}
                  onMouseLeave={e=>{if(activeStep!==i)e.currentTarget.style.background="transparent";}}
                >
                  <div style={{
                    width:50,height:50,borderRadius:15,flexShrink:0,
                    background:activeStep===i?s.color:"#F3F4F6",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:22,transition:"background 0.3s,transform 0.3s",
                    transform:activeStep===i?"scale(1.08)":"scale(1)",
                  }}>{s.icon}</div>
                  <div style={{ flex:1,paddingTop:4 }}>
                    <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.12em",
                      color:activeStep===i?s.color:"#9CA3AF",marginBottom:4,fontWeight:500 }}>
                      {s.num}
                    </div>
                    <div style={{ fontWeight:700,fontSize:15,color:"#1A1A2E",marginBottom:activeStep===i?8:0 }}>
                      {s.title}
                    </div>
                    <div style={{
                      fontSize:12,color:"#6B7280",lineHeight:1.65,fontWeight:300,
                      maxHeight:activeStep===i?80:0,overflow:"hidden",
                      transition:"max-height 0.4s ease",
                    }}>{s.body}</div>
                    {/* progress bar */}
                    {activeStep===i && (
                      <div className="step-bar" style={{ marginTop:12 }}>
                        <div className="step-fill" style={{ width:"100%",transition:"width 2.8s linear" }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Image panel with 3D perspective */}
            <div style={{ position:"sticky",top:120 }}>
              <div style={{
                borderRadius:28,overflow:"hidden",position:"relative",
                aspectRatio:"4/3",
                boxShadow:"0 32px 80px rgba(0,0,0,0.16)",
                transform:"perspective(1000px) rotateY(-4deg)",
                transition:"transform 0.6s cubic-bezier(.16,1,.3,1)",
              }}
              onMouseEnter={e=>e.currentTarget.style.transform="perspective(1000px) rotateY(0deg) scale(1.02)"}
              onMouseLeave={e=>e.currentTarget.style.transform="perspective(1000px) rotateY(-4deg)"}
              >
                <img key={activeStep} src={STEPS[activeStep].img} alt="step"
                  className="img-switch"
                  style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                {/* overlay caption */}
                <div style={{
                  position:"absolute",bottom:0,left:0,right:0,
                  background:"linear-gradient(transparent, rgba(0,0,0,0.7))",
                  padding:"40px 24px 24px",
                }}>
                  <div style={{ color:"rgba(255,255,255,0.6)",fontSize:10,
                    fontFamily:"'DM Mono',monospace",letterSpacing:"0.12em",marginBottom:6 }}>
                    STEP {activeStep+1} OF 4
                  </div>
                  <div style={{ color:"#fff",fontWeight:700,fontSize:18 }}>
                    {STEPS[activeStep].title}
                  </div>
                </div>
                {/* step dots */}
                <div style={{ position:"absolute",top:20,right:20,display:"flex",gap:6 }}>
                  {STEPS.map((_,i)=>(
                    <div key={i} onClick={()=>setActiveStep(i)} style={{
                      width:i===activeStep?20:6,height:6,borderRadius:3,cursor:"pointer",
                      background:i===activeStep?"#fff":"rgba(255,255,255,0.4)",
                      transition:"all 0.3s",
                    }}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ STATS ════════════ */}
      <section ref={statsRef} style={{ background:"#1A1A2E",padding:"80px 48px" }}>
        <div style={{ maxWidth:1280,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)" }}>
          {[
            {val:counter.leases,suffix:"+",label:"Leases Created",sub:"On Ethereum"},
            {val:counter.eth,   suffix:" ETH",label:"Deposits Secured",sub:"Locked in contracts"},
            {val:counter.users, suffix:"+",label:"Users",sub:"Landlords & Tenants"},
          ].map((s,i)=>(
            <div key={i} style={{
              textAlign:"center",padding:"32px 40px",
              borderRight:i<2?"1px solid rgba(255,255,255,0.08)":"none",
            }}>
              <div style={{ fontSize:"clamp(40px,5vw,64px)",fontWeight:800,
                letterSpacing:"-0.04em",color:"#fff",lineHeight:1,marginBottom:8 }}>
                {s.val.toLocaleString()}{s.suffix}
              </div>
              <div style={{ fontWeight:600,fontSize:14,color:"#E5E7EB",marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:11,color:"#4B5563",fontFamily:"'DM Mono',monospace" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section style={{ padding:"100px 48px",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ textAlign:"center",marginBottom:56 }}>
          <div className="tag-pill" style={{ marginBottom:16,display:"inline-flex" }}>Why Leasify</div>
          <h2 className="section-wipe" style={{
            fontSize:"clamp(32px,4vw,52px)",fontWeight:800,
            letterSpacing:"-0.04em",color:"#1A1A2E",lineHeight:1.1,
          }}>
            Renting reimagined<br/>for Web3
          </h2>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feat-card-wrap" style={{ opacity:0 }}>
              <FeatureCard f={f} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ DUAL CTA ════════════ */}
      <section style={{ padding:"0 48px 100px",maxWidth:1280,margin:"0 auto" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
          {/* Landlord */}
          <div className="cta-card" style={{
            background:"#1A1A2E",borderRadius:28,padding:"52px 48px",
            color:"#fff",position:"relative",overflow:"hidden",
            minHeight:340,display:"flex",flexDirection:"column",justifyContent:"space-between",
            opacity:0,
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.transform="translateY(-6px)";
            e.currentTarget.style.boxShadow="0 24px 64px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.transform="none";
            e.currentTarget.style.boxShadow="none";
          }}
          style2={{ transition:"transform 0.4s cubic-bezier(.16,1,.3,1),box-shadow 0.4s" }}
          >
            <div style={{ position:"absolute",top:-60,right:-60,width:220,height:220,
              background:"rgba(91,110,245,0.15)",borderRadius:"50%",filter:"blur(50px)" }} />
            <div style={{ position:"absolute",bottom:-40,left:-40,width:160,height:160,
              background:"rgba(167,139,250,0.1)",borderRadius:"50%",filter:"blur(40px)" }} />
            <div>
              <div style={{ fontSize:11,fontFamily:"'DM Mono',monospace",
                letterSpacing:"0.12em",color:"#A78BFA",marginBottom:16 }}>FOR LANDLORDS</div>
              <h3 style={{ fontSize:32,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15,marginBottom:14 }}>
                List your property.<br/>Get paid on-chain.
              </h3>
              <p style={{ fontSize:13,fontWeight:300,color:"rgba(255,255,255,0.6)",lineHeight:1.7,maxWidth:320 }}>
                Deploy a smart contract for every tenant. Rent arrives directly
                to your wallet. Deposits released automatically at lease end.
              </p>
            </div>
            <button style={{ background:"#fff",color:"#1A1A2E",border:"none",
              padding:"14px 28px",borderRadius:14,fontSize:13,fontWeight:700,
              cursor:"pointer",alignSelf:"flex-start",marginTop:32,
              fontFamily:"'Sora',sans-serif",transition:"transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              Start Listing
            </button>
          </div>

          {/* Tenant */}
          <div className="cta-card" style={{
            background:"#F0F4FF",borderRadius:28,padding:"52px 48px",
            position:"relative",overflow:"hidden",
            minHeight:340,display:"flex",flexDirection:"column",justifyContent:"space-between",
            opacity:0,transition:"transform 0.4s cubic-bezier(.16,1,.3,1),box-shadow 0.4s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 24px 64px rgba(45,91,227,0.12)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
          >
            <div style={{ position:"absolute",bottom:-40,right:-40,width:200,height:200,
              background:"rgba(45,91,227,0.12)",borderRadius:"50%",filter:"blur(40px)" }} />
            <div>
              <div style={{ fontSize:11,fontFamily:"'DM Mono',monospace",
                letterSpacing:"0.12em",color:"#2D5BE3",marginBottom:16 }}>FOR TENANTS</div>
              <h3 style={{ fontSize:32,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15,color:"#1A1A2E",marginBottom:14 }}>
                Find your home.<br/>Lease it securely.
              </h3>
              <p style={{ fontSize:13,fontWeight:300,color:"#6B7280",lineHeight:1.7,maxWidth:320 }}>
                Browse verified listings. Your deposit is protected by code.
                Track every payment. No shady landlords holding your money.
              </p>
            </div>
            <button className="btn-dark" style={{ alignSelf:"flex-start",marginTop:32 }}>
              Find a Home
            </button>
          </div>
        </div>
      </section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section style={{ background:"#fff",padding:"100px 48px" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:56 }}>
            <div className="tag-pill" style={{ marginBottom:16,display:"inline-flex" }}>Testimonials</div>
            <h2 className="section-wipe" style={{
              fontSize:"clamp(28px,3.5vw,44px)",fontWeight:800,
              letterSpacing:"-0.04em",color:"#1A1A2E",
            }}>What people are saying</h2>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
            {[
              {name:"Priya S.",role:"Tenant, Mumbai",text:"My deposit is finally safe. I can see it sitting in the contract on Etherscan. No more anxiety about getting it back.",avatar:"👩‍💼"},
              {name:"Rahul M.",role:"Landlord, Pune",text:"Rent arrives in my wallet the moment tenants pay. No waiting, no fees. Leasify has completely changed how I manage properties.",avatar:"👨‍💻"},
              {name:"Ayesha K.",role:"Tenant, Bangalore",text:"The smart contract enforced my grace period automatically. I was late once — it charged exactly what was agreed. Fair.",avatar:"👩‍🎨"},
            ].map((t,i)=>{
              const tiltT = useTilt(5);
              return (
                <div key={i} {...tiltT} ref={el=>{tiltT.ref.current=el;}} style={{
                  background:"#F8F8F6",borderRadius:22,padding:"28px",
                  transformStyle:"preserve-3d",willChange:"transform",
                  transition:"box-shadow 0.3s,transform 0.4s cubic-bezier(.16,1,.3,1)",
                }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
                >
                  <div style={{ fontSize:40,color:"#E5E7EB",lineHeight:1,marginBottom:12,fontWeight:800 }}>"</div>
                  <p style={{ fontSize:13,color:"#374151",lineHeight:1.7,fontWeight:300,marginBottom:24 }}>{t.text}</p>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:40,height:40,borderRadius:"50%",background:"#E5E7EB",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight:700,fontSize:13,color:"#1A1A2E" }}>{t.name}</div>
                      <div style={{ fontSize:11,color:"#9CA3AF" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section style={{ padding:"100px 48px",maxWidth:1280,margin:"0 auto",textAlign:"center" }}>
        <div className="tag-pill" style={{ marginBottom:20,display:"inline-flex" }}>Get Started</div>
        <h2 className="section-wipe" style={{
          fontSize:"clamp(36px,5vw,68px)",fontWeight:800,
          letterSpacing:"-0.045em",lineHeight:1.04,color:"#1A1A2E",marginBottom:20,
        }}>
          Your next home is<br/>one signature away.
        </h2>
        <p style={{ fontSize:15,fontWeight:300,color:"#6B7280",lineHeight:1.7,
          maxWidth:480,margin:"0 auto 40px" }}>
          No credit checks. No bank approvals. Connect your wallet,
          find a home, sign on-chain — in minutes.
        </p>
        <div style={{ display:"flex",gap:14,justifyContent:"center" }}>
          <button className="btn-dark" style={{ padding:"16px 44px",fontSize:14 }}>Connect Wallet</button>
          <button className="btn-outline" style={{ padding:"16px 44px",fontSize:14 }}>Learn More</button>
        </div>
      </section>

      {/* ════════════ FOOTER ════════════ */}
      <footer style={{ background:"#1A1A2E",padding:"60px 48px 40px",color:"#fff" }}>
        <div style={{ maxWidth:1280,margin:"0 auto" }}>
          <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:60,marginBottom:60 }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                <div style={{ width:32,height:32,background:"rgba(255,255,255,0.1)",borderRadius:9,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>🏠</div>
                <span style={{ fontWeight:800,fontSize:17,letterSpacing:"-0.03em" }}>Leasify</span>
              </div>
              <p style={{ fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.7,maxWidth:260,fontWeight:300 }}>
                Blockchain-powered rental platform. Lease agreements secured by Ethereum smart contracts.
              </p>
              <div style={{ marginTop:20,display:"inline-flex",alignItems:"center",gap:8,
                background:"rgba(255,255,255,0.06)",padding:"8px 14px",borderRadius:10 }}>
                <span className="live-dot" />
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.4)" }}>
                  Sepolia · 0x6379...ED12
                </span>
              </div>
            </div>
            {[
              {title:"Product",links:["Browse Homes","List Property","How it Works","Pricing"]},
              {title:"Company",links:["About","Blog","Careers","Press"]},
              {title:"Legal",links:["Privacy","Terms","Cookie Policy","Security"]},
            ].map(col=>(
              <div key={col.title}>
                <div style={{ fontSize:10,fontWeight:600,letterSpacing:"0.12em",
                  color:"rgba(255,255,255,0.25)",marginBottom:20,fontFamily:"'DM Mono',monospace" }}>
                  {col.title.toUpperCase()}
                </div>
                {col.links.map(l=>(
                  <div key={l} style={{ fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:12,
                    cursor:"pointer",fontWeight:300,transition:"color 0.2s" }}
                    onMouseEnter={e=>e.target.style.color="#fff"}
                    onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.45)"}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:28,
            display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ fontSize:12,color:"rgba(255,255,255,0.25)",fontWeight:300 }}>
              © 2026 Leasify. All rights reserved.
            </div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.2)",fontFamily:"'DM Mono',monospace" }}>
              Built on Ethereum · Sepolia Testnet
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}