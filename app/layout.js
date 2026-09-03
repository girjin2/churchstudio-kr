import './globals.css';

export const metadata = {
  title: 'ChurchStudio | 교회 방송과 자막을 한 곳에서',
  description: '교회 예배 방송, 자막, 카메라 전환과 유튜브 송출을 위한 ChurchStudio 공식 홈페이지입니다.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
