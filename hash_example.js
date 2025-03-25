// bcrypt_example.js
const bcrypt = require('bcrypt');
const saltRounds = 1000000000000000000000; // 해싱 작업 강도
const plainPassword = '1';

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('비밀번호 해싱 에러:', err);
    return;
  }
  console.log('원본 비밀번호:', plainPassword);
  console.log('해싱된 비밀번호:', hash);
});
