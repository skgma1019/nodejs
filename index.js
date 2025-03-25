const express = require('express');
const app = express();
// cors 문제해결
const cors = require('cors');
app.use(cors());
// json으로 된 post의 바디를 읽기 위해 필요
app.use(express.json())
const PORT = 3000;

//db 연결
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
  
app.post("/articles", (req, res)=>{

    let {title, content} = req.body

    db.run(`INSERT INTO articles (title, content) VALUES (?, ?)`,
    [title, content],
    function(err) {
      if (err) {
        return res.status(500).json({error: err.message});
      }
      res.json({id: this.lastID, title, content});
    });
})

// 커밋 한번해주세요

// 전체 아티클 리스트 주는 api를 만들어주세요
// GET : /articles

app.get('/articles',(req, res)=>{

    db.all("SELECT * FROM articles", [], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);  // returns the list of articles
      });

})

// 개별 아티클을 주는 api를 만들어주세요 
// GET : /articles/:id
app.get('/articles/:id', (req, res)=>{
    let id = req.params.id

    db.get("SELECT * FROM articles WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json(row);  // returns the article with the given id
    });

})


app.delete("/articles/:id", (req, res)=>{
  const id = req.params.id


  const sql = 'DELETE FROM articles WHERE id = ?';
  db.run(sql, id, function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    // this.changes는 영향을 받은 행의 수
    res.json({ message: `총 ${this.changes}개의 아티클이 삭제되었습니다.` });
  });

})

app.put('/articles/:id', (req, res)=>{
  let id = req.params.id
  // let title = req.body.title
  // let content = req.body.content
  let {title, content} = req.body
 // SQL 업데이트 쿼리 (파라미터 바인딩 사용)
 const sql = 'UPDATE articles SET title = ?, content = ? WHERE id = ?';
 db.run(sql, [title, content, id], function(err) {
   if (err) {
     console.error('업데이트 에러:', err.message);
     return res.status(500).json({ error: err.message });
   }
   // this.changes: 영향을 받은 행의 수
   res.json({ message: '게시글이 업데이트되었습니다.', changes: this.changes });
 });

})





app.get('/gettest/:id', (req, res)=>{

  console.log(req.query)
  console.log(req.params.id)


  res.send("ok")
})


app.post('/posttest', (req, res)=>{
  console.log(req.body)
  res.send("ok")
})

app.use(express.json());

app.post("/articles/:id/comments", (req, res) => {
    const articleId = req.params.id;
    const content = req.body.content;
    const createdAt = new Date().toISOString();

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    const query = "INSERT INTO comments (content, created_at, article_id) VALUES (?, ?, ?)";
    db.run(query, [content, createdAt, articleId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, content, create_at: createdAt, article_id: articleId });
    });
});

app.get('/articles/:id/comments', (req, res) => {
    let articleId = req.params.id;

    db.all('SELECT * FROM comments WHERE article_id = ?', [articleId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

//회원가입 API
app.post('/users', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
  }

  const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
  
  db.run(sql, [email, password], function (err) {
      if (err) {
          return res.status(500).json({ message: '회원가입 실패', error: err.message });
      }
      res.status(201).json({ message: '회원가입이 완료되었습니다.', userId: this.lastID });
  });
});

//로그인 APT
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
  }
  
  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], (err, row) => {
      if (err) {
          return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
      }
      if (!row) {
          return res.json({ message: '이메일이 없습니다.' });
      }
      
      if (row.password !== password) {
          return res.json({ message: '패스워드가 틀립니다.' });
      }
      
      res.json({ message: '로그인 성공!' });
  });
});