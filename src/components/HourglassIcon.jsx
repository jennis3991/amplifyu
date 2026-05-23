import { T } from '../theme.js';

export function HourglassIcon({streak, size=36}) {
  const pct = Math.min(streak/14,1);
  const bW=size*0.52, bH=size*0.34, nW=size*0.09, nH=size*0.08;
  const cx=size/2, tY=size*0.04, btY=size*0.62, sw=size*0.055;
  const sH=bH*pct*0.82, sY=btY+bH-sH;
  const tsH=bH*(1-pct)*0.78;
  return (
    <svg width={size} height={size} viewBox={"0 0 "+size+" "+size} 
fill="none">
      <path d={"M "+(cx-bW/2)+" "+tY+" Q "+(cx-bW/2)+" "+(tY+bH)+" "+cx+" "+(tY+bH)+" Q "+(cx+bW/2)+" "+(tY+bH)+" "+(cx+bW/2)+" "+tY+" Z"} 
fill={T.navyLight} stroke={T.navy} strokeWidth={sw}/>
      {tsH>1 && <path d={"M "+(cx-bW/2*(tsH/bH)*0.9)+" "+(tY+bH-tsH)+" Q "+cx+" "+(tY+bH-tsH*0.6)+" "+(cx+bW/2*(tsH/bH)*0.9)+" "+(tY+bH-tsH)+" Q "+(cx+bW/2*0.9)+" "+(tY+bH)+" "+cx+" "+(tY+bH)+" Q "+(cx-bW/2*0.9)+" "+(tY+bH)+" "+(cx-bW/2*(tsH/bH)*0.9)+" "+(tY+bH-tsH)+" Z"} fill={T.gold} 
opacity="0.7"/>}
      <rect x={cx-nW/2} y={tY+bH} width={nW} height={nH} fill={T.navy}/>
      <path d={"M "+(cx-bW/2)+" "+(btY+bH)+" Q "+(cx-bW/2)+" "+btY+" "+cx+" "+btY+" Q "+(cx+bW/2)+" "+btY+" "+(cx+bW/2)+" "+(btY+bH)+" Z"} 
fill={T.navyLight} stroke={T.navy} strokeWidth={sw}/>
      {sH>0.5 && (
        <>
          <clipPath id={"hg"+streak}><path d={"M "+(cx-bW/2)+" "+(btY+bH)+" Q "+(cx-bW/2)+" "+btY+" "+cx+" "+btY+" Q "+(cx+bW/2)+" "+btY+" "+(cx+bW/2)+" "+(btY+bH)+" Z"}/></clipPath>
          <rect x={cx-bW/2} y={sY} width={bW} height={sH+2} fill={T.gold} 
clipPath={"url(#hg"+streak+")"}/>
        </>
      )}
      <line x1={cx-bW/2-sw/2} y1={tY} x2={cx+bW/2+sw/2} y2={tY} 
stroke={T.navy} strokeWidth={sw}/>
      <line x1={cx-bW/2-sw/2} y1={btY+bH} x2={cx+bW/2+sw/2} y2={btY+bH} 
stroke={T.navy} strokeWidth={sw}/>
    </svg>
  );
}

