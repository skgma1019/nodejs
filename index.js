const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
//json으로 된 post의 바디를 읽기 위해 필요
app.use(express.json())
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
  

// app.post("/articles", (req, res)=>{
//     res.send("ok")
// })

app.post('/articles', (req, res)=>{
    const data = req.body
    // console.log(data)
    res.send(data)
})