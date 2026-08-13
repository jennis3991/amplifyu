import { T } from './theme.js';
import { DAY_SCENE_IMAGES } from './data.js';

export function SceneClarity() {
  return (
    <svg viewBox="0 0 430 280" xmlns="http://www.w3.org/2000/svg" 
style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="scW" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#E8E2D8"/><stop offset="100%" 
stopColor="#D4CEC4"/></linearGradient>
        <linearGradient id="scSh" x1="0" y1="0" x2="1" y2="0"><stop 
offset="0%" stopColor="#1A1814" stopOpacity="0.3"/><stop offset="100%" 
stopColor="#1A1814" stopOpacity="0"/></linearGradient>
      </defs>
      <rect width="430" height="280" fill="url(#scW)"/>
      <rect y="210" width="430" height="70" fill="#C8C2B8"/>
      <rect width="90" height="280" fill="url(#scSh)"/>
      <polygon points="300,0 430,0 430,280 180,280 120,210" fill="#FFF8F0" 
opacity="0.18"/>
      <ellipse cx="370" cy="30" rx="120" ry="80" fill="#FFF0D8" 
opacity="0.22"/>
      <rect x="195" y="148" width="52" height="62" fill="#D8D2C4"/>
      <rect x="193" y="146" width="56" height="4" fill="#C8C2B4"/>
      <rect x="208" y="118" width="26" height="32" fill="#1A1814" 
opacity="0.85"/>
      <ellipse cx="221" cy="212" rx="28" ry="6" fill="#A8A298" 
opacity="0.4"/>
    </svg>
  );
}
export function SceneVoice() {
  return (
    <svg viewBox="0 0 430 280" xmlns="http://www.w3.org/2000/svg" 
style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="svW" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#D8D4C8"/><stop offset="100%" 
stopColor="#C4BEB4"/></linearGradient>
      </defs>
      <rect width="430" height="280" fill="url(#svW)"/>
      <rect y="230" width="430" height="50" fill="#B8B2A8"/>
      <rect x="120" y="0" width="190" height="235" fill="#E8E4DC"/>
      <rect x="118" y="0" width="194" height="237" fill="none" 
stroke="#2A2820" strokeWidth="3"/>
      <line x1="215" y1="0" x2="215" y2="237" stroke="#2A2820" 
strokeWidth="1.5"/>
      <line x1="118" y1="118" x2="312" y2="118" stroke="#2A2820" 
strokeWidth="1.5"/>
      <rect x="0" y="0" width="100" height="280" fill="#1A1814" 
opacity="0.12"/>
      <rect x="330" y="0" width="100" height="280" fill="#1A1814" 
opacity="0.1"/>
    </svg>
  );
}
export function SceneStory() {
  return (
    <svg viewBox="0 0 430 280" xmlns="http://www.w3.org/2000/svg" 
style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="ssW" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#C8C4BA"/><stop offset="100%" 
stopColor="#B4B0A6"/></linearGradient>
        <radialGradient id="ssV" cx="50%" cy="45%" r="42%"><stop 
offset="0%" stopColor="#FFF8F0" stopOpacity="0.5"/><stop offset="100%" 
stopColor="#FFF8F0" stopOpacity="0"/></radialGradient>
      </defs>
      <rect width="430" height="280" fill="url(#ssW)"/>
      <ellipse cx="215" cy="130" rx="80" ry="60" fill="url(#ssV)"/>
      <line x1="0" y1="0" x2="215" y2="130" stroke="#C4BEB4" 
strokeWidth="1.5"/>
      <line x1="0" y1="280" x2="215" y2="130" stroke="#B8B2A8" 
strokeWidth="1.5"/>
      <line x1="430" y1="0" x2="215" y2="130" stroke="#C4BEB4" 
strokeWidth="1.5"/>
      <line x1="430" y1="280" x2="215" y2="130" stroke="#B8B2A8" 
strokeWidth="1.5"/>
      <rect x="0" y="0" width="55" height="280" fill="#1A1814" 
opacity="0.18"/>
      <rect x="375" y="0" width="55" height="280" fill="#1A1814" 
opacity="0.18"/>
    </svg>
  );
}
export function SceneStructure() {
  return (
    <svg viewBox="0 0 430 280" xmlns="http://www.w3.org/2000/svg" 
style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="sstW" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#D4D0C8"/><stop offset="100%" 
stopColor="#C0BCB4"/></linearGradient>
        <linearGradient id="sstB" x1="0" y1="0" x2="1" y2="1"><stop 
offset="0%" stopColor="#9E9A92"/><stop offset="100%" 
stopColor="#888278"/></linearGradient>
        <linearGradient id="sstT" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#A8A49C"/><stop offset="100%" 
stopColor="#9A9690"/></linearGradient>
      </defs>
      <rect width="430" height="280" fill="url(#sstW)"/>
      <rect y="220" width="430" height="60" fill="#B8B4AA"/>
      <rect x="68" y="170" width="72" height="50" fill="url(#sstB)"/>
      <polygon points="68,170 140,170 148,160 76,160" fill="url(#sstT)"/>
      <polygon points="140,170 148,160 148,210 140,220" fill="#888278"/>
      <rect x="179" y="142" width="72" height="78" fill="url(#sstB)"/>
      <polygon points="179,142 251,142 259,132 187,132" 
fill="url(#sstT)"/>
      <polygon points="251,142 259,132 259,210 251,220" fill="#888278"/>
      <rect x="290" y="108" width="72" height="112" fill="url(#sstB)"/>
      <polygon points="290,108 362,108 370,98 298,98" fill="url(#sstT)"/>
      <polygon points="362,108 370,98 370,218 362,220" fill="#888278"/>
    </svg>
  );
}
export function ScenePresence() {
  return (
    <svg viewBox="0 0 430 280" xmlns="http://www.w3.org/2000/svg" 
style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="spW" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#D0CCC4"/><stop offset="100%" 
stopColor="#BCBAB0"/></linearGradient>
        <linearGradient id="spL" x1="0" y1="0" x2="1" y2="1"><stop 
offset="0%" stopColor="#FFF8F0" stopOpacity="0.3"/><stop offset="100%" 
stopColor="#FFF8F0" stopOpacity="0"/></linearGradient>
      </defs>
      <rect width="430" height="280" fill="url(#spW)"/>
      <rect y="218" width="430" height="62" fill="#B4B0A8"/>
      <polygon points="0,0 200,0 280,280 -40,280" fill="url(#spL)"/>
      <rect x="198" y="150" width="5" height="68" fill="#3A3630"/>
      <rect x="232" y="150" width="5" height="68" fill="#3A3630"/>
      <rect x="193" y="188" width="50" height="8" fill="#3A3630" rx="1"/>
      <rect x="192" y="148" width="52" height="6" fill="#3A3630" rx="1"/>
      <ellipse cx="218" cy="220" rx="32" ry="5" fill="#A8A298" 
opacity="0.3"/>
    </svg>
  );
}
export function ScenePie() {
  return (
    <svg viewBox="0 0 430 280" xmlns="http://www.w3.org/2000/svg" 
style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="spiW" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#222428"/><stop offset="100%" 
stopColor="#1A1C20"/></linearGradient>
        <linearGradient id="spiS" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#2C2E34"/><stop offset="100%" 
stopColor="#1C1E22"/></linearGradient>
      </defs>
      <rect width="430" height="280" fill="url(#spiW)"/>
      <rect x="80" y="0" width="270" height="232" fill="url(#spiS)"/>
      <g fill="#1A1C20" opacity="0.7">
        <rect x="85" y="140" width="18" height="92"/>
        <rect x="121" y="128" width="22" height="104"/>
        <rect x="159" y="118" width="18" height="114"/>
        <rect x="201" y="108" width="14" height="124"/>
        <rect x="230" y="132" width="16" height="100"/>
        <rect x="303" y="152" width="15" height="80"/>
      </g>
      <line x1="215" y1="0" x2="215" y2="232" stroke="#1A1C20" 
strokeWidth="2"/>
      <line x1="80" y1="116" x2="350" y2="116" stroke="#1A1C20" 
strokeWidth="1.5"/>
      <rect x="78" y="0" width="274" height="234" fill="none" 
stroke="#1A1C20" strokeWidth="3"/>
      <rect x="0" y="0" width="76" height="280" fill="#222428"/>
      <rect x="352" y="0" width="78" height="280" fill="#222428"/>
    </svg>
  );
}
export function SceneBrand() {
  return (
    <svg viewBox="0 0 430 280" xmlns="http://www.w3.org/2000/svg" 
style={{width:"100%",height:"100%"}}>
      <defs>
        <linearGradient id="sbrW" x1="0" y1="0" x2="0" y2="1"><stop 
offset="0%" stopColor="#D8D4CC"/><stop offset="100%" 
stopColor="#C4C0B8"/></linearGradient>
        <linearGradient id="sbrF" x1="0" y1="0" x2="1" y2="1"><stop 
offset="0%" stopColor="#5A5650"/><stop offset="100%" 
stopColor="#3A3630"/></linearGradient>
        <radialGradient id="sbrL" cx="35%" cy="25%" r="50%"><stop 
offset="0%" stopColor="#FFF8F0" stopOpacity="0.3"/><stop offset="100%" 
stopColor="#FFF8F0" stopOpacity="0"/></radialGradient>
      </defs>
      <rect width="430" height="280" fill="url(#sbrW)"/>
      <rect y="222" width="430" height="58" fill="#B8B4AC"/>
      <ellipse cx="100" cy="0" rx="200" ry="140" fill="url(#sbrL)"/>
      <rect x="186" y="84" width="66" height="122" fill="url(#sbrF)"/>
      <polygon points="186,84 252,84 260,78 194,78" fill="#3A3630"/>
      <polygon points="252,80 320,68 340,222 260,210" fill="#D8D4CC" 
opacity="0.6"/>
      <ellipse cx="219" cy="224" rx="40" ry="6" fill="#A8A49A" 
opacity="0.35"/>
    </svg>
  );
}

export const SCENES_MAP = 
{clarity:SceneClarity,voice:SceneVoice,story:SceneStory,structure:SceneStructure,presence:ScenePresence,pie:ScenePie,brand:SceneBrand};

export function Scene({name, height=280, day=null}) {
  const overrideImg = day ? DAY_SCENE_IMAGES[day] : null;
  const Comp = SCENES_MAP[name] || SCENES_MAP.clarity;
  return (
    <div 
style={{width:"100%",height,position:"relative",overflow:"hidden",flexShrink:0}}>
      {overrideImg
        ? <img loading="lazy" src={overrideImg} alt="" 
style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        : <div style={{position:"absolute",inset:0}}><Comp/></div>
      }
      <div 
style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.38) 100%)"}}/>
    </div>
  );
}
export function OBScene({name, height=270}) {
  const Comp = SCENES_MAP[name] || SCENES_MAP.clarity;
  return (
    <div 
style={{width:"100%",height,position:"relative",overflow:"hidden",flexShrink:0}}>
      <div style={{position:"absolute",inset:0}}><Comp/></div>
      <div 
style={{position:"absolute",inset:0,background:"rgba(15,12,8,0.45)"}}/>
      <div 
style={{position:"absolute",bottom:0,left:0,right:0,height:100,background:"linear-gradient(to top,rgba(11,13,16,1),transparent)"}}/>
    </div>
  );
}

// ─── SHARED UI 
