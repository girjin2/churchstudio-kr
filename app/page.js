'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function parseGitHubReleaseUrl(url='') {
  const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/(.+)$/i);
  if (!m) return null;
  return {
    owner: m[1],
    repo: m[2],
    tag: decodeURIComponent(m[3]),
    assetName: decodeURIComponent(m[4])
  };
}

function noticeDate(value){
  if(!value) return '';
  try{
    return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
  }catch{
    return '';
  }
}

export default function Home() {
  const [latest,setLatest]=useState(null);
  const [downloadCount,setDownloadCount]=useState(null);
  const [downloadBase,setDownloadBase]=useState(0);
  const [notices,setNotices]=useState([]);

  useEffect(()=>{
    Promise.all([
      supabase
        .from('releases')
        .select('*')
        .eq('is_published',true)
        .order('is_latest',{ascending:false})
        .order('released_at',{ascending:false})
        .limit(1)
        .maybeSingle(),
      supabase
        .from('notices')
        .select('*')
        .eq('is_published',true)
        .order('is_pinned',{ascending:false})
        .order('published_at',{ascending:false})
        .limit(10),
      supabase
        .from('site_settings')
        .select('value')
        .eq('key','download_count_base')
        .maybeSingle()
    ]).then(([releaseResult,noticeResult,baseResult])=>{
      setLatest(releaseResult.data||null);
      setNotices(noticeResult.data||[]);
      const base=Number.parseInt(baseResult.data?.value||'0',10);
      setDownloadBase(Number.isFinite(base)?base:0);
    });
  },[]);

  useEffect(()=>{
    async function loadDownloadCount(){
      setDownloadCount(null);
      const parsed=parseGitHubReleaseUrl(latest?.download_url||'');
      if(!parsed) return;
      try{
        const res=await fetch(`https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/releases/tags/${encodeURIComponent(parsed.tag)}`,{
          headers:{Accept:'application/vnd.github+json'}
        });
        if(!res.ok) return;
        const data=await res.json();
        const asset=(data.assets||[]).find(a=>a.name===parsed.assetName) || (data.assets||[]).find(a=>a.browser_download_url===latest.download_url);
        if(asset && typeof asset.download_count==='number') setDownloadCount(asset.download_count);
      }catch{}
    }
    loadDownloadCount();
  },[latest]);

  const cumulativeDownloadCount=downloadCount===null?null:downloadBase+downloadCount;

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">ChurchStudio 공식 배포 페이지</div>
          <h1>교회 예배와 방송을 하나로</h1>
          <p className="muted">예배 자막, PPT, 카메라, 유튜브 송출을 한 곳에서 운영하는 교회 방송 통합 프로그램</p>
          <a className="btn" href="#download">{latest?.download_url?'다운로드':'다운로드 준비 중'}</a>
        </div>
      </section>

      <section className="section" id="notice">
        <div className="wrap">
          <h2>공지사항</h2>
          {notices.length===0 ? (
            <div className="card"><p className="muted" style={{margin:0}}>등록된 공지가 없습니다.</p></div>
          ) : notices.map(n=>(
            <div className="card" key={n.id} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'baseline',flexWrap:'wrap'}}>
                <b>{n.is_pinned?'[중요] ':''}{n.title}</b>
                <span className="muted" style={{fontSize:13}}>{noticeDate(n.published_at||n.created_at)}</span>
              </div>
              <p className="muted" style={{whiteSpace:'pre-wrap',marginBottom:0}}>{n.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>주요 기능</h2>
          <div className="grid">
            <div className="card"><b>PPT · 자막</b><p className="muted">예배 PPT와 자막 운영</p></div>
            <div className="card"><b>멀티 카메라</b><p className="muted">카메라 1~4 실시간 확인 및 선택</p></div>
            <div className="card"><b>YouTube 송출</b><p className="muted">유튜브 방송 송출 관리</p></div>
            <div className="card"><b>방송 상태 확인</b><p className="muted">방송 흐름을 한 화면에서 확인</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="download">
        <div className="wrap">
          <h2>다운로드</h2>
          <div className="card">
            <b>{latest?`${latest.version} · ${latest.title}`:'최신 버전 준비 중'}</b>
            <p className="muted">{latest?.summary||'배포 가능한 ChurchStudio가 확정되면 공식 다운로드가 활성화됩니다.'}</p>
            {latest?.file_name&&<p className="muted">{latest.file_name}{latest.file_size_text?` · ${latest.file_size_text}`:''}</p>}
            {latest?.download_url&&<>
              <a className="btn" href={latest.download_url}>ChurchStudio 다운로드</a>
              <p className="muted" style={{marginTop:12,fontSize:14}}>누적 다운로드 {cumulativeDownloadCount===null?'확인 중':`${cumulativeDownloadCount.toLocaleString()}회`}</p>
            </>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>사용자 의견</h2>
          <div className="card">
            <b>가입 사용자 전용 비밀 게시판</b>
            <p className="muted">사용 중 불편한 점, 개선 의견, 오류 상황을 남겨 주세요. 작성한 글은 본인과 관리자만 확인할 수 있습니다.</p>
            <a className="btn" href="/feedback">의견 남기기</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>후원 및 이용 안내</h2>
          <div className="card">
            <b>3~6개월 후원 방식으로 시범 운영합니다.</b>
            <p className="muted">운영 상황과 사용자 수, 개발 및 유지 비용에 따라 향후 유료 서비스로 전환될 수 있습니다.</p>
            <p className="muted">유료화가 이루어지더라도 이미 정상적으로 사용 중인 ChurchStudio는 계속 사용할 수 있도록 운영할 예정입니다.</p>
          </div>
          <div className="notice">
            <b>무단 복제·재배포 금지</b>
            <p className="muted">설치파일과 라이선스의 무단 복제, 재배포, 판매 및 제3자 제공은 허용하지 않습니다. 다른 교회에서 사용을 원하는 경우 파일을 직접 전달하지 말고 공식 ChurchStudio 배포 페이지를 안내해 주세요.</p>
          </div>
          <p style={{marginTop:32,fontSize:12,opacity:.45}}><a href="/admin">관리자</a></p>
        </div>
      </section>
    </main>
  );
}
