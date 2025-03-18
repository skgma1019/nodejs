const express = require('express');
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

app.get('/ping', (req, res) => {
    res.send('pong');
  });

app.get('/tick', (req, res) => {
    res.send('tack');
  });
  
app.get('/asdf', (req, res) => {
    res.send('qwer');
  });
  