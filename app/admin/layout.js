export default function AdminLayout({children}){
  return <>
    <nav style={{background:'#111827',color:'#fff',padding:'12px 20px'}}>
      <div style={{maxWidth:980,margin:'0 auto',display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <strong style={{marginRight:8}}>ChurchStudio 관리</strong>
        <a href="/admin" style={{color:'#fff',textDecoration:'none',padding:'8px 12px',borderRadius:8,background:'#374151'}}>관리자 홈</a>
        <a href="/admin/feedback" style={{color:'#111827',textDecoration:'none',padding:'8px 12px',borderRadius:8,background:'#fbbf24',fontWeight:800}}>사용자 의견 관리</a>
      </div>
    </nav>
    {children}
  </>;
}
