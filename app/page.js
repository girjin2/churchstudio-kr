'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [settings, setSettings] = useState({});
  const [notices, setNotices] = useState([]);
  const [releases, setReleases] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: s }, { data: n }, { data: r }] = await Promise.all([
        supabase.from('site_settings').select('key,value'),
        supabase.from('notices').select('*').eq('is_published', true).order('is_pinned', { ascending: false }).order('published_at', { ascending: false }),
        supabase.from('releases').select('*').eq('is_published', true).order('is_latest', { ascending: false }).order('released_at', { ascending: false })
      ]);
      const map = {};
      (s || []).forEach(row => { map[row.key] = row.value; });
      setSettings(map);
      setNotices(n || []);
      setReleases(r || []);
      setLoaded(true);
    }
    load();
  }, []);

  const features = useMemo(() => {
    const out = [];
    for (let i = 1; i <= 6; i += 1) {
      const title = settings[`feature_${i}_title`];
      const desc = settings[`feature_${i}_desc`];
      if (title) out.push([title, desc || '']);
    }
    return out;
  }, [settings]);

  const heroTitle = (settings.hero_title || '교회 예배와 방송을\\n하나로').split('\\n');
  const latest = releases.find(r => r.is_latest) || releases[0];

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">{settings.site_name || 'ChurchStudio'}</a>
        <nav>
          <a href="#notice">공지</a>
          <a href="#features">기능</a>
          <a href="#download">다운로드</a>
          <a href="#support">후원 안내</a>
          <a href="/admin">관리자</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-inner">
          <span className="badge">공개 베타</span>
          <h1>{heroTitle.map((line, i) => <span key={i}>{line}{i < heroTitle.length - 1 && <br />}</span>)}</h1>
          <p>{settings.hero_subtitle || '예배 자막, PPT, 카메라, 유튜브 송출을 한 곳에서 운영하는 교회 방송 통합 프로그램'}</p>
          <div className="actions">
            <a className="button primary" href="#download">다운로드</a>
            <a className="button secondary" href="#features">기능 보기</a>
          </div>
        </div>
      </section>

      <section className="section" id="notice">
        <div className="section-head"><span>NOTICE</span><h2>공지</h2></div>
        {!loaded && <div className="notice-card"><p>불러오는 중...</p></div>}
        {loaded && notices.length === 0 && <div className="notice-card"><p>등록된 공지가 없습니다.</p></div>}
        {notices.map(n => (
          <div className="notice-card" key={n.id} style={{marginBottom:16}}>
            <h3>{n.is_pinned ? '📌 ' : ''}{n.title}</h3>
            <p style={{whiteSpace:'pre-wrap'}}>{n.body}</p>
          </div>
        ))}
      </section>

      <section className="section soft" id="features">
        <div className="section-head"><span>FEATURES</span><h2>주요 기능</h2><p>실제 예배 현장에서 필요한 기능을 한 곳에서 운영합니다.</p></div>
        <div className="feature-grid">
          {features.map(([title, body]) => <article className="feature-card" key={title}><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="section" id="download">
        <div className="section-head"><span>DOWNLOAD</span><h2>다운로드</h2></div>
        <div className="download-card">
          <div>
            <span className="badge">Windows</span>
            <h3>{latest ? `${latest.version} · ${latest.title}` : 'ChurchStudio 배포 파일'}</h3>
            <p>{latest?.summary || '현재 배포 파일을 준비하고 있습니다.'}</p>
            {latest?.file_name && <p>{latest.file_name}{latest.file_size_text ? ` · ${latest.file_size_text}` : ''}</p>}
          </div>
          {latest?.download_url ? <a className="button primary" href={latest.download_url}>다운로드</a> : <button className="button disabled" disabled>배포 파일 준비 중</button>}
        </div>
      </section>

      <section className="section support" id="support">
        <div className="section-head light-text"><span>SUPPORT</span><h2>후원 안내</h2><p>{settings.support_period || '후원 방식으로 시범 운영합니다.'}</p></div>
        <div className="support-box">
          <p>{settings.support_notice}</p>
          <p>{settings.existing_user_notice}</p>
          <p>{settings.commercialization_notice}</p>
          <p>{settings.redistribution_notice}</p>
        </div>
      </section>

      <footer><strong>{settings.site_name || 'ChurchStudio'}</strong><span>교회 예배 방송을 더 단순하게</span></footer>
    </main>
  );
}
