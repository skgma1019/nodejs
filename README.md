# sql문 기본지식
CRUD는 Create(생성), Read(읽기), Update(갱신), Delete(삭제)의 약자로, 데이터베이스나 저장소에서 데이터를 처리하는 기본적인 작업을 의미

# http 메소드
 GET : 리소스 조회. GET 메서드는 데이터를 가져올때만 사용.
- POST : 서버로 데이터를 전송한다. 새로운 리소스를 생성(등록)할 때 주로 사용.
- PUT : 요청 데이터를 사용하여 새로운 리소스를 생성하거나, 대상 리소스를 나타내는 데이터를 대체.
- DELETE : 리소스 삭제.

# HTTP Headers에서 
headers에 authorization

value에 bearer token값

# token 값 생성
db에 있는 회원정보로 로그인(http://localhost:3000/login)
-> 로그인 성공과 함께 token값 생성
-> headers에 있는 value -> bearer 뒤에 ""제외하고 붙여넣기
->http://localhost:3000/articles에서 게시글 작성 가능(토큰값이 없으면 작성 불가)

# env파일 생성하기
.env파일을 만들고 SECRET_KEY = "아무거나"를 넣어야 실행이 가능하다.