# Sejong-Junggo-Web

사용법.
윈도우 10 
1. GraphicMagic을 설치. -> 커멘트창에서 gm입력이 작동하는지 확인.
2. MySQL 서버 설치, 8.0 기준으로 작성. 설치시 비밀번호는 5.x 이하의 legacy방식으로 설정.
3. sejong-junggo-db.sql파일을 mysql 서버에 원하는 이름으로 import한다.
4. 생성한 db 와 mysql 서버 ip와 port 그리고 비밀번호와 사용자에대한 정보를 secret/database.js파일에 다음과같은 형식으로 입력하여 파일을 생성한다.
  module.exports = {
   host:'호스트 이름',//localhost로 구성하는 것을 추천.
   user:'이름',
   database:'db이름',
   password:'패스워드',
   port:'서버포트'
  };
5. 카카오 인증을 위한 secret/auth.js파일 생성.
  module.exports={
    'federation':{
      'kakao':{
        'client_id':'클라이언트 id',
        'callback_url':'개발자 콘솔에서 입력한 콜백 URL'
      }
    }
  }
6.구글 클라우드 비젼 API Key json 파일을 구글 클라우드 콘솔에서 다운받아 secret/GoogleApiKey.json으로 이름변경하여 저장.
7.자신만의 세션 암호화 키를 secret/session.js에 다음과 같이 저장.
  modules.exports = '세션 암호화키';
8. 최상위 디렉토리에서 npm install로 관련 패키지들을 설치 -> node_modules 가생성됨을 확인.
9. python 3.xx 버전 설치
10. python selenium 라이브러리 설치.
11. mysql서버를 켜고, node server.js로 서버 시작.
