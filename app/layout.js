import './globals.css';

export const metadata = {
  title: 'ChurchStudio | 교회 예배와 방송을 하나로',
  description: '예배 자막, PPT, 카메라, 유튜브 송출을 한 곳에서 운영하는 교회 방송 통합 프로그램'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
