'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const box = {maxWidth:980,margin:'0 auto',padding:'32px 20px 60px'};
const card = {background:'#fff',border:'1px solid #e5e7eb',borderRadius:18,padding:22,marginBottom:18,boxShadow:'0 8px 24px rgba(15,23,42,.05)'};
const input = {width:'100%',padding:'12px 14px',border:'1px solid #cbd5e1',borderRadius:10,fontSize:15,boxSizing:'border-box'};
const btn = {padding:'11px 16px',border:0,borderRadius:10,background:'#111827',color:'#fff',fontWeight:700,cursor:'pointer'};
const lightBtn = {...btn,background:'#e5e7eb',color:'#111827'};

export default function AdminPage(){
  const [session,setSession]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [loading,setLoading]=useState(true);
  const [email,setEmail]=useState('girjin2@gmail.com');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [notices,setNotices]=useState([]);
  const [releases,setReleases]=useState([]);
  const [notice,setNotice]=useState({title:'',body:'',is_pinned:false,is_published:true});
  const [release,setRelease]=useState({version:'',title:'',summary:'',download_url:'',file_name:'',file_size_text:'',sha256:'',is_latest:true,is_published:true});

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>check(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>check(s));
    return ()=>subscription.unsubscribe();
  },[]);

  async function check(s){
    setSession(s||null);
    setIsAdmin(false);
    if(!s){ setLoading(false); return; }
    const {data}=await supabase.from('profiles').select('role').eq('user_id',s.user.id).maybeSingle();
    const ok=data?.role==='admin';
    setIsAdmin(ok);
    setLoading(false);
    if(ok) await loadAll();
  }

  async function loadAll(){
    const [{data:n},{data:r}]=await Promise.all([
      supabase.from('notices').select('*').order('is_pinned',{ascending:false}).order('published_at',{ascending:false}),
      supabase.from('releases').select('*').order('released_at',{ascending:false})
    ]);
    setNotices(n||[]); setReleases(r||[]);
  }

  async function login(e){
    e.preventDefault(); setMessage(''); setLoading(true);
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error){ setMessage('로그인에 실패했습니다. 관리자 계정이 아직 없다면 아래 계정 만들기를 눌러주세요.'); setLoading(false); }
  }

  async function signup(){
    setMessage('');
    if(email.toLowerCase()!=='girjin2@gmail.com'){ setMessage('관리자 이메일은 girjin2@gmail.com만 사용할 수 있습니다.'); return; }
    if(password.length<6){ setMessage('비밀번호는 6자 이상 입력해 주세요.'); return; }
    setLoading(true);
    const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:'ChurchStudio 관리자'}}});
    if(error) setMessage(error.message);
    else setMessage('관리자 계정을 만들었습니다. 이메일 확인 요청이 오면 확인한 뒤 로그인해 주세요.');
    setLoading(false);
  }

  async function addNotice(e){
    e.preventDefault(); setMessage('');
    if(!notice.title.trim()||!notice.body.trim()) return;
    const {error}=await supabase.from('notices').insert(notice);
    if(error) setMessage(error.message); else { setNotice({title:'',body:'',is_pinned:false,is_published:true}); await loadAll(); }
  }

  async function deleteNotice(id){
    if(!confirm('이 공지를 삭제할까요?')) return;
    await supabase.from('notices').delete().eq('id',id); await loadAll();
  }

  async function addRelease(e){
    e.preventDefault(); setMessage('');
    if(!release.version.trim()||!release.title.trim()) return;
    if(release.is_latest) await supabase.from('releases').update({is_latest:false}).eq('is_latest',true);
    const payload={...release,download_url:release.download_url||null,file_name:release.file_name||null,file_size_text:release.file_size_text||null,sha256:release.sha256||null};
    const {error}=await supabase.from('releases').insert(payload);
    if(error) setMessage(error.message); else { setRelease({version:'',title:'',summary:'',download_url:'',file_name:'',file_size_text:'',sha256:'',is_latest:true,is_published:true}); await loadAll(); }
  }

  async function deleteRelease(id){
    if(!confirm('이 배포 정보를 삭제할까요?')) return;
    await supabase.from('releases').delete().eq('id',id); await loadAll();
  }

  if(loading) return <main style={box}><p>확인 중...</p></main>;

  if(!session) return <main style={box}>
    <a href="/" style={{textDecoration:'none',color:'#475569'}}>← 홈페이지</a>
    <div style={{...card,maxWidth:460,margin:'60px auto'}}>
      <h1 style={{marginTop:0}}>ChurchStudio 관리자</h1>
      <p style={{color:'#64748b'}}>관리자 계정으로 로그인하세요.</p>
      <form onSubmit={login} style={{display:'grid',gap:12}}>
        <input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder="이메일" />
        <input style={input} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="비밀번호" />
        <button style={btn}>로그인</button>
        <button type="button" style={lightBtn} onClick={signup}>첫 관리자 계정 만들기</button>
      </form>
      {message&&<p style={{marginTop:14,color:'#b91c1c'}}>{message}</p>}
    </div>
  </main>;

  if(!isAdmin) return <main style={box}><h1>접근 권한이 없습니다.</h1><button style={btn} onClick={()=>supabase.auth.signOut()}>로그아웃</button></main>;

  return <main style={box}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:24}}>
      <div><a href="/" style={{textDecoration:'none',color:'#475569'}}>← 홈페이지</a><h1 style={{margin:'8px 0 0'}}>관리자</h1></div>
      <button style={lightBtn} onClick={()=>supabase.auth.signOut()}>로그아웃</button>
    </div>
    {message&&<p style={{color:'#b91c1c'}}>{message}</p>}

    <section style={card}>
      <h2>공지 등록</h2>
      <form onSubmit={addNotice} style={{display:'grid',gap:10}}>
        <input style={input} placeholder="제목" value={notice.title} onChange={e=>setNotice({...notice,title:e.target.value})}/>
        <textarea style={{...input,minHeight:120}} placeholder="내용" value={notice.body} onChange={e=>setNotice({...notice,body:e.target.value})}/>
        <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
          <label><input type="checkbox" checked={notice.is_pinned} onChange={e=>setNotice({...notice,is_pinned:e.target.checked})}/> 상단 고정</label>
          <label><input type="checkbox" checked={notice.is_published} onChange={e=>setNotice({...notice,is_published:e.target.checked})}/> 공개</label>
        </div>
        <button style={btn}>공지 등록</button>
      </form>
      <div style={{marginTop:20}}>{notices.map(n=><div key={n.id} style={{borderTop:'1px solid #e5e7eb',padding:'12px 0',display:'flex',justifyContent:'space-between',gap:12}}><div><strong>{n.is_pinned?'[고정] ':''}{n.title}</strong><div style={{color:'#64748b',fontSize:14}}>{n.is_published?'공개':'비공개'}</div></div><button style={lightBtn} onClick={()=>deleteNotice(n.id)}>삭제</button></div>)}</div>
    </section>

    <section style={card}>
      <h2>배포 등록</h2>
      <form onSubmit={addRelease} style={{display:'grid',gap:10}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:10}}>
          <input style={input} placeholder="버전 예: 1.0.0" value={release.version} onChange={e=>setRelease({...release,version:e.target.value})}/>
          <input style={input} placeholder="배포 제목" value={release.title} onChange={e=>setRelease({...release,title:e.target.value})}/>
        </div>
        <textarea style={{...input,minHeight:90}} placeholder="설명" value={release.summary} onChange={e=>setRelease({...release,summary:e.target.value})}/>
        <input style={input} placeholder="다운로드 URL" value={release.download_url} onChange={e=>setRelease({...release,download_url:e.target.value})}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <input style={input} placeholder="파일명" value={release.file_name} onChange={e=>setRelease({...release,file_name:e.target.value})}/>
          <input style={input} placeholder="파일 크기" value={release.file_size_text} onChange={e=>setRelease({...release,file_size_text:e.target.value})}/>
        </div>
        <input style={input} placeholder="SHA-256" value={release.sha256} onChange={e=>setRelease({...release,sha256:e.target.value})}/>
        <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
          <label><input type="checkbox" checked={release.is_latest} onChange={e=>setRelease({...release,is_latest:e.target.checked})}/> 최신 버전</label>
          <label><input type="checkbox" checked={release.is_published} onChange={e=>setRelease({...release,is_published:e.target.checked})}/> 공개</label>
        </div>
        <button style={btn}>배포 등록</button>
      </form>
      <div style={{marginTop:20}}>{releases.map(r=><div key={r.id} style={{borderTop:'1px solid #e5e7eb',padding:'12px 0',display:'flex',justifyContent:'space-between',gap:12}}><div><strong>{r.is_latest?'[최신] ':''}{r.version} · {r.title}</strong><div style={{color:'#64748b',fontSize:14}}>{r.is_published?'공개':'비공개'}</div></div><button style={lightBtn} onClick={()=>deleteRelease(r.id)}>삭제</button></div>)}</div>
    </section>
  </main>;
}
