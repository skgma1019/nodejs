const express = require('express');
const app = express();
// cors 문제해결
const cors = require('cors');
app.use(cors());
// json으로 된 post의 바디를 읽기 위해 필요
app.use(express.json())
const PORT = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

//db 연결
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
    }
    req.user = decoded; // 토큰에 있는 사용자 정보 저장
    next(); // 다음 미들웨어 또는 라우트 핸들러 실행
  });
};

module.exports = authMiddleware;

  
//게시글 작성 API
app.post("/articles", authMiddleware, (req, res) => {
  let { title, content } = req.body;
  let userId = req.user.id; // 인증된 사용자 ID 가져오기

  if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용을 입력하세요.' });
  }

  db.run(
      `INSERT INTO articles (title, content, user_id) VALUES (?, ?, ?)`,
      [title, content, userId],
      function (err) {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.json({ id: this.lastID, title, content, user_id: userId });
      }
  );
});


// 커밋 한번해주세요

// 전체 아티클 리스트 주는 api를 만들어주세요
// GET : /articles
//게시글 리스트 확인 (로그인 불필요요)
app.get('/articles',(req, res)=>{

    db.all(`SELECT articles.id, articles.title, articles.content, users.email
           FROM articles
           JOIN users ON articles.user_id = users.id`,
           [],
           (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);  // returns the list of articles
      });

})

// 개별 아티클을 주는 api를 만들어주세요 
// GET : /articles/:id
// 로그인 불필요요
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

//게시글삭제제 
// 로그인 필요
// 게시글이 본인인지 확인도 필요(추후적용예정)
app.delete("/articles/:id", authMiddleware, (req, res) => {
  const userId = req.user.id; // 요청한 사용자의 id
  const articleId = req.params.id; // 삭제할 아티클의 id

  // 1. 삭제할 아티클의 user_id를 조회합니다.
  const sql = 'SELECT user_id FROM articles WHERE id = ?';
  db.get(sql, [articleId], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
    
    // 2. 아티클이 없으면 에러 메시지 반환
    if (!row) {
      return res.status(404).json({ error: '아티클을 찾을 수 없습니다.' });
    }

    // 3. 삭제 요청자의 user_id와 아티클의 user_id가 일치하는지 확인
    if (row.user_id !== userId) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 4. 일치하면 아티클 삭제
    const deleteSql = 'DELETE FROM articles WHERE id = ?';
    db.run(deleteSql, [articleId], function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: `${this.changes}개의 아티클이 삭제되었습니다.` });
    });
  });
});


// 로그인 필요
// 게시글이 본인인지 확인도 필요(추후적용예정)
app.put('/articles/:id', authMiddleware, (req, res) => {
  const userId = req.user.id; // 요청한 사용자의 id
  const articleId = req.params.id; // 수정할 아티클의 id
  console.log(userId)
  // 클라이언트로부터 받은 제목과 내용
  const { title, content } = req.body;

  // 1. 수정할 아티클의 user_id를 조회
  const sql = 'SELECT user_id FROM articles WHERE id = ?';
  db.get(sql, [articleId], (err, row) => {
    if (err) {
      console.error('업데이트 에러:', err.message);
      return res.status(500).json({ error: err.message });
    }

    // 2. 아티클이 없으면 에러 메시지 반환
    if (!row) {
      return res.status(404).json({ error: '아티클을 찾을 수 없습니다.' });
    }

    // 3. 수정 요청자의 user_id와 아티클의 user_id가 일치하는지 확인
    if (row.user_id !== userId) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 4. 일치하면 게시글 업데이트
    const updateSql = 'UPDATE articles SET title = ?, content = ? WHERE id = ?';
    db.run(updateSql, [title, content, articleId], function (err) {
      if (err) {
        console.error('업데이트 에러:', err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: '게시글이 업데이트되었습니다.', changes: this.changes });
    });
  });
});





app.get('/gettest/:id', (req, res)=>{

  console.log(req.query)
  console.log(req.params.id)


  res.send("ok")
})


app.post('/posttest', (req, res)=>{
  console.log(req.body)
  res.send("ok")
})

//댓글작성
//로그인 필요요
app.post("/articles/:id/comments", authMiddleware, (req, res) => {
  const articleId = req.params.id;
  const content = req.body.content;
  const userId = req.user.id; // 인증된 사용자 ID 가져오기
  const createdAt = new Date().toISOString();

  if (!content) {
      return res.status(400).json({ error: "Content is required" });
  }

  const query = "INSERT INTO comments (content, created_at, article_id, user_id) VALUES (?, ?, ?, ?)";
  db.run(query, [content, createdAt, articleId, userId], function (err) {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, content, created_at: createdAt, article_id: articleId, user_id: userId });
  });
});


//댓글 확인인
app.get('/articles/:id/comments', (req, res) => {
  const articleId = req.params.id;

  const query = `
      SELECT comments.id, comments.content, comments.created_at, users.email 
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.article_id = ?
  `;

  db.all(query, [articleId], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json(rows);
  });
});

//회원가입 API
//로그인 불필요
app.post('/users', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10); // 10은 솔트 라운드
      const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
      
      db.run(sql, [email, hashedPassword], function (err) {
          if (err) {
              return res.status(500).json({ message: '회원가입 실패', error: err.message });
          }
          res.status(201).json({ message: '회원가입이 완료되었습니다.', userId: this.lastID });
      });
  } catch (error) {
      res.status(500).json({ message: '서버 오류', error: error.message });
  }
});


//로그인 API
//로그인 불필요
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' });
    }
    
    const query = 'SELECT * FROM users WHERE email = ?';
    db.get(query, [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
        if (!row) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 틀립니다.' }); // 401 Unauthorized
        }
        
        const isMatch = await bcrypt.compare(password, row.password);
        if (!isMatch) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 틀립니다.' }); // 401 Unauthorized
        }
        
        const token = jwt.sign({ id: row.id, email: row.email }, secretKey, { expiresIn: '1h' });
        
        res.status(200).json({ message: '로그인 성공!', token }); // 명시적으로 200 OK 반환
    });
});


app.get('/logintest', (req, res)=>{
  let token = req.headers.authorization.split(' ')[1]

  jwt.verify(token, secretKey, (err, decoded)=>{
    if(err){
      return res.send('에러!')
    }
    return res.send('성공!')
  } )
})

// JWT 인증 미들웨어
function authenticateToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Bearer 토큰 추출

  if (!token) {
      return res.status(401).json({ message: '토큰이 없습니다. 로그인 후 다시 시도해주세요.' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = decoded; // decoded 토큰 정보 저장
    next(); // 인증이 완료되면 다음 미들웨어로 넘어감
});
}


// 게시글 작성 API - 인증 추가
app.post("/articles", authenticateToken, (req, res) => {
  let { title, content } = req.body;

  // 인증된 사용자만 게시글을 작성할 수 있음
  if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용을 입력하세요.' });
  }

  db.run(`INSERT INTO articles (title, content) VALUES (?, ?)`, [title, content], function(err) {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, title, content });
  });
});