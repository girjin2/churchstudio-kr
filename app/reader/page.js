'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { unzipSync, strFromU8 } from 'fflate';

function extOf(name=''){
  const i=name.lastIndexOf('.');
  return i>=0?name.slice(i+1).toLowerCase():'';
}

function decodeXml(bytes){
  return strFromU8(bytes);
}

function xmlText(xml){
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  return Array.from(doc.querySelectorAll('w\\:t, a\\:t, hp\\:t, t, text')).map(n=>n.textContent||'').join(' ');
}

function docxText(zip){
  const main=zip['word/document.xml'];
  if(!main) throw new Error('DOCX 본문을 찾을 수 없습니다.');
  const xml=decodeXml(main);
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  const paras=Array.from(doc.getElementsByTagNameNS('*','p'));
  return paras.map(p=>Array.from(p.getElementsByTagNameNS('*','t')).map(t=>t.textContent||'').join('')).filter(Boolean).join('\n\n');
}

function hwpxText(zip){
  const names=Object.keys(zip).filter(n=>/section\d+\.xml$/i.test(n)).sort((a,b)=>{
    const na=Number((a.match(/section(\d+)/i)||[])[1]||0);
    const nb=Number((b.match(/section(\d+)/i)||[])[1]||0);
    return na-nb;
  });
  if(!names.length) throw new Error('HWPX 본문을 찾을 수 없습니다.');
  return names.map(name=>{
    const doc=new DOMParser().parseFromString(decodeXml(zip[name]),'application/xml');
    const paras=Array.from(doc.getElementsByTagNameNS('*','p'));
    return paras.map(p=>Array.from(p.getElementsByTagNameNS('*','t')).map(t=>t.textContent||'').join('')).filter(Boolean).join('\n\n');
  }).join('\n\n');
}

function pptxText(zip){
  const names=Object.keys(zip).filter(n=>/^ppt\/slides\/slide\d+\.xml$/i.test(n)).sort((a,b)=>{
    const na=Number((a.match(/slide(\d+)\.xml/i)||[])[1]||0);
    const nb=Number((b.match(/slide(\d+)\.xml/i)||[])[1]||0);
    return na-nb;
  });
  if(!names.length) throw new Error('PPTX 슬라이드를 찾을 수 없습니다.');
  return names.map((name,i)=>{
    const doc=new DOMParser().parseFromString(decodeXml(zip[name]),'application/xml');
    const text=Array.from(doc.getElementsByTagNameNS('*','t')).map(t=>t.textContent||'').filter(Boolean).join('\n');
    return `슬라이드 ${i+1}\n${text}`;
  }).join('\n\n');
}

async function parseFile(file){
  const ext=extOf(file.name);
  if(ext==='txt') return {kind:'text',text:await file.text()};
  if(ext==='pdf') return {kind:'pdf',url:URL.createObjectURL(file)};
  if(['docx','hwpx','pptx'].includes(ext)){
    const zip=unzipSync(new Uint8Array(await file.arrayBuffer()));
    if(ext==='docx') return {kind:'text',text:docxText(zip)};
    if(ext==='hwpx') return {kind:'text',text:hwpxText(zip)};
    return {kind:'text',text:pptxText(zip)};
  }
  throw new Error('지원하지 않는 형식입니다. HWPX, DOCX, PPTX, PDF, TXT를 사용해 주세요.');
}

export default function ReaderPage(){
  const [name,setName]=useState('');
  const [text,setText]=useState('');
  const [pdfUrl,setPdfUrl]=useState('');
  const [fontSize,setFontSize]=useState(30);
  const [lineHeight,setLineHeight]=useState(1.7);
  const [theme,setTheme]=useState('light');
  const [error,setError]=useState('');
  const scroller=useRef(null);

  useEffect(()=>{
    try{
      setFontSize(Number(localStorage.getItem('reader-font-size')||30));
      setLineHeight(Number(localStorage.getItem('reader-line-height')||1.7));
      setTheme(localStorage.getItem('reader-theme')||'light');
    }catch{}
  },[]);

  useEffect(()=>{ try{ localStorage.setItem('reader-font-size',String(fontSize)); }catch{} },[fontSize]);
  useEffect(()=>{ try{ localStorage.setItem('reader-line-height',String(lineHeight)); }catch{} },[lineHeight]);
  useEffect(()=>{ try{ localStorage.setItem('reader-theme',theme); }catch{} },[theme]);

  const colors=useMemo(()=>theme==='dark'
    ? {bg:'#111',fg:'#f6f6f6',panel:'#1b1b1b',muted:'#bbb'}
    : theme==='gray'
      ? {bg:'#2a2a2a',fg:'#f0f0f0',panel:'#353535',muted:'#c8c8c8'}
      : {bg:'#fff',fg:'#111',panel:'#f5f5f5',muted:'#666'},[theme]);

  async function onFile(file){
    if(!file) return;
    setError('');
    if(pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(''); setText(''); setName(file.name);
    try{
      const parsed=await parseFile(file);
      if(parsed.kind==='pdf') setPdfUrl(parsed.url);
      else setText(parsed.text||'(본문이 비어 있습니다.)');
      requestAnimationFrame(()=>{ if(scroller.current) scroller.current.scrollTop=0; });
    }catch(e){ setError(e?.message||'파일을 읽지 못했습니다.'); }
  }

  return <main style={{minHeight:'100vh',background:colors.bg,color:colors.fg}}>
    <div style={{position:'sticky',top:0,zIndex:10,background:colors.panel,borderBottom:'1px solid rgba(127,127,127,.25)',padding:'10px 14px'}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <a href="/" style={{color:'inherit',textDecoration:'none',fontWeight:700,marginRight:8}}>← ChurchStudio</a>
        <label style={{padding:'9px 14px',border:'1px solid #888',borderRadius:10,cursor:'pointer',fontWeight:700}}>
          파일 열기
          <input type="file" accept=".hwpx,.docx,.pptx,.pdf,.txt" onChange={e=>onFile(e.target.files?.[0])} style={{display:'none'}} />
        </label>
        <button onClick={()=>setFontSize(v=>Math.min(56,v+2))}>글자 +</button>
        <button onClick={()=>setFontSize(v=>Math.max(18,v-2))}>글자 -</button>
        <button onClick={()=>setLineHeight(v=>Math.min(2.4,Number((v+.1).toFixed(1))))}>줄 +</button>
        <button onClick={()=>setLineHeight(v=>Math.max(1.2,Number((v-.1).toFixed(1))))}>줄 -</button>
        <button onClick={()=>setTheme('light')}>흰색</button>
        <button onClick={()=>setTheme('gray')}>회색</button>
        <button onClick={()=>setTheme('dark')}>검정</button>
        <span style={{marginLeft:'auto',fontSize:13,color:colors.muted}}>{name||'HWPX · DOCX · PPTX · PDF · TXT'}</span>
      </div>
    </div>

    {error && <div style={{maxWidth:1000,margin:'18px auto',padding:'12px 16px',background:'#5b1a1a',color:'#fff',borderRadius:10}}>{error}</div>}

    <div ref={scroller} style={{maxWidth:1100,margin:'0 auto',padding:'24px 26px 80px'}}>
      {!name && <div style={{padding:'56px 10px',textAlign:'center'}}>
        <h1 style={{marginBottom:12}}>예배 리더</h1>
        <p style={{color:colors.muted,fontSize:18}}>위의 파일 열기를 눌러 설교문을 선택하세요.</p>
        <p style={{color:colors.muted}}>파일은 서버에 업로드하지 않고 이 기기에서만 읽습니다.</p>
      </div>}
      {pdfUrl && <iframe src={pdfUrl} title="PDF" style={{width:'100%',height:'calc(100vh - 120px)',border:0,background:'#fff'}} />}
      {text && <article style={{fontSize,lineHeight,whiteSpace:'pre-wrap',wordBreak:'keep-all',overflowWrap:'break-word'}}>{text}</article>}
    </div>
  </main>;
}
