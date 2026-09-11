'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const box={maxWidth:920,margin:'0 auto',padding:'40px 20px 80px'};
const card={background:'#fff',border:'1px solid #e5e7eb',borderRadius:18,padding:22,marginBottom:16,boxShadow:'0 8px 24px rgba(15,23,42,.05)'};
const input={width:'100%',padding:'12px 14px',border:'1px solid #cbd5e1',borderRadius:10,fontSize:15,boxSizing:'border-box'};
const btn={padding:'11px 16px',border:0,borderRadius:10,background:'#111827',color:'#fff',fontWeight:700,cursor:'pointer'};
const lightBtn={...btn,background:'#e5e7eb',color:'#111827'};

export default function AdminFeedbackPage(){
  const [loading,setLoading]=useState(true);
  const [authorized,setAuthorized]=useState(false);
  const [posts,setPosts]=useState([]);
  const [replyDrafts,setReplyDrafts]=useState({});
  const [message,setMessage]=useState('');

  useEffect(()=>{
    async function init(){
      const {data:{session}}=await supabase.auth.getSession();
      if(!session){setLoading(false);return;}
      const {data:profile}=await supabase.from('profiles').select('role').eq('user_id',session.user.id).maybeSingle();
      if(profile?.role!=='admin'){setLoading(false);return;}
      setAuthorized(true);
      await loadPosts();
      setLoading(false);
    }
    init();
  },[]);

  async function loadPosts(){
    const {data,error}=await supabase.from('feedback_posts').select('*').order('created_at',{ascending:false});
    if(error){setMessage(error.message);return;}
    setPosts(data||[]);
  }

  async function saveReply(id){
    const text=(replyDrafts[id]??posts.find(p=>p.id===id)?.admin_reply??'').trim();
    const {error}=await supabase.from('feedback_posts').update({
      admin_reply:text||null,
      status:text?'answered':'open',
      replied_at:text?new Date().toISOString():null,
      updated_at:new Date().toISOString()
    }).eq('id',id);
    if(error){setMessage(error.message);return;}
    setMessage('답변을 저장했습니다.');
    await loadPosts();
  }

  async function removePost(id){
    if(!confirm('이 사용자 의견을 삭제할까요?'))return;
    const {error}=await supabase.from('feedback_posts').delete().eq('id',id);
    if(error){setMessage(error.message);return;}
    setMessage('의견을 삭제했습니다.');
    await loadPosts();
  }

  if(loading)return <main style={box}><p>확인 중...</p></main>;

  if(!authorized)return <main style={box}>
    <a href="/admin" style={{textDecoration:'none',color:'#475569'}}>← 관리자</a>
    <div style={card}><h1>접근 권한이 없습니다.</h1><p>관리자 계정으로 로그인한 뒤 이용해 주세요.</p></div>
  </main>;

  const openCount=posts.filter(p=>p.status!=='answered').length;

  return <main style={box}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:24}}>
      <div><a href="/admin" style={{textDecoration:'none',color:'#475569'}}>← 관리자</a><h1 style={{margin:'8px 0 0'}}>사용자 의견 관리</h1></div>
      <button style={lightBtn} onClick={loadPosts}>새로고침</button>
    </div>

    <section style={card}>
      <strong style={{fontSize:22}}>전체 {posts.length}건</strong>
      <span style={{marginLeft:14,color:'#b45309',fontWeight:700}}>답변 대기 {openCount}건</span>
      <p style={{marginBottom:0,color:'#64748b'}}>비밀 게시판 글은 관리자에게 모두 표시됩니다. 여기서 내용을 확인하고 직접 답변할 수 있습니다.</p>
    </section>

    {message&&<p style={{fontWeight:700,color:'#047857'}}>{message}</p>}

    {posts.length===0&&<section style={card}><p style={{margin:0}}>등록된 사용자 의견이 없습니다.</p></section>}

    {posts.map(p=><article key={p.id} style={card}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div>
          <strong style={{fontSize:19}}>{p.title}</strong>
          <div style={{fontSize:13,color:'#64748b',marginTop:5}}>{new Date(p.created_at).toLocaleString('ko-KR')} · {p.status==='answered'?'답변 완료':'답변 대기'}</div>
        </div>
        <button style={lightBtn} onClick={()=>removePost(p.id)}>삭제</button>
      </div>
      <p style={{whiteSpace:'pre-wrap',lineHeight:1.7}}>{p.body}</p>
      <div style={{display:'grid',gap:8,marginTop:16}}>
        <textarea style={{...input,minHeight:110}} placeholder="관리자 답변을 입력하세요." value={replyDrafts[p.id]??p.admin_reply??''} onChange={e=>setReplyDrafts({...replyDrafts,[p.id]:e.target.value})}/>
        <button style={btn} onClick={()=>saveReply(p.id)}>답변 저장</button>
      </div>
    </article>)}
  </main>;
}
