const features = [
  ['예배 자막', '성경 말씀과 안내 문구를 빠르게 띄우고 예배 흐름에 맞게 전환합니다.'],
  ['유튜브 송출', '교회 영상과 음성을 유튜브로 송출할 수 있도록 방송 흐름을 한 화면에 모았습니다.'],
  ['카메라 전환', '정식 버전에서는 2대 카메라 전환을 중심으로 실제 예배 현장에 필요한 기능을 제공합니다.'],
  ['성경 · 찬송', '나라별 성경과 찬송 자료를 연결해 필요한 자료를 내려받아 사용할 수 있도록 준비하고 있습니다.']
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">ChurchStudio</a>
        <nav>
          <a href="#notice">공지</a>
          <a href="#features">기능</a>
          <a href="#download">다운로드</a>
          <a href="#support">후원</a>
          <a href="/admin">관리자</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-inner">
          <span className="badge">공개 베타</span>
          <h1>교회 방송과 자막을<br/>한 곳에서</h1>
          <p>ChurchStudio는 예배 자막, 교회 영상 송출, 유튜브 방송과 카메라 전환을 한 화면에서 운영하기 위한 교회 방송 프로그램입니다.</p>
          <div className="actions">
            <a className="button primary" href="#download">베타 다운로드</a>
            <a className="button secondary" href="#features">기능 보기</a>
          </div>
        </div>
      </section>

      <section className="section" id="notice">
        <div className="section-head">
          <span>NOTICE</span>
          <h2>공지</h2>
        </div>
        <div className="notice-card">
          <h3>ChurchStudio 공개 베타 안내</h3>
          <p>현재 버전은 공개 베타입니다. 실제 예배 환경에서 충분히 검증한 뒤 정식 버전으로 전환할 예정입니다.</p>
          <p>프로그램의 무단 복제·재배포는 금지하며, 사용 중 발견한 문제는 정식 버전 개선에 반영합니다.</p>
        </div>
      </section>

      <section className="section soft" id="features">
        <div className="section-head">
          <span>FEATURES</span>
          <h2>주요 기능</h2>
          <p>복잡한 방송 장비를 늘리는 대신, 실제 예배에서 자주 쓰는 기능에 집중합니다.</p>
        </div>
        <div className="feature-grid">
          {features.map(([title, body]) => (
            <article className="feature-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="download">
        <div className="section-head">
          <span>DOWNLOAD</span>
          <h2>다운로드</h2>
        </div>
        <div className="download-card">
          <div>
            <span className="badge">Windows 공개 베타</span>
            <h3>ChurchStudio 베타 버전</h3>
            <p>현재 배포 파일은 단일 카메라 안정 버전입니다. 정식 버전에서는 2대 카메라와 성경·찬송 연결을 추가할 예정입니다.</p>
          </div>
          <button className="button disabled" disabled>배포 파일 연결 준비 중</button>
        </div>
      </section>

      <section className="section support" id="support">
        <div className="section-head light-text">
          <span>SUPPORT</span>
          <h2>후원</h2>
          <p>ChurchStudio는 교회가 큰 비용 부담 없이 사용할 수 있는 방송 도구를 목표로 개발하고 있습니다.</p>
        </div>
        <div className="support-box">
          <p>공개 베타 기간 동안 후원은 선택입니다. 후원 여부와 관계없이 베타 기능을 사용할 수 있습니다.</p>
          <p>정식 서비스와 라이선스 정책은 기능 안정화 이후 별도로 안내합니다.</p>
        </div>
      </section>

      <footer>
        <strong>ChurchStudio</strong>
        <span>교회 예배 방송을 더 단순하게</span>
      </footer>
    </main>
  );
}
