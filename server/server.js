const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
// 获取 Railway 自动分配的端口
const PORT = process.env.PORT || 3001;

app.use(cors());
// 允许接收最大 50MB 的 JSON 数据（发多张 Base64 图片必备）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 【只保留这一个 db 声明】
// 这里的变量名必须对应 Railway 面板里的 Variables
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 新增帖子接口
// server.js 约 26 行
app.post('/api/add-post', async (req, res) => {
    try {
        const { title, content, author, authorNickname, authorImg, role, category, images } = req.body;
        
        const [result] = await db.query(
            // 增加 images 字段
            'INSERT INTO posts (title, content, author, authorNickname, authorImg, role, category, comments, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, content, author, authorNickname, authorImg, role, category, JSON.stringify([]), JSON.stringify(images || [])]
        );
        
        res.json({ code: 0, msg: "发布成功" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 1, msg: "服务器错误" });
    }
});

// 登录接口
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE username=? AND password=?', [username, password]);
        if (rows.length === 0) return res.json({ code: 1, msg: '账号或密码错误' });
        res.json({ code: 0, data: rows[0] });
    } catch (err) {
        res.status(500).json({ code: 1, msg: '数据库连接失败' });
    }
});

// 注册接口
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [exist] = await db.query('SELECT * FROM users WHERE username=?', [username]);
        if (exist.length > 0) return res.json({ code: 1, msg: '用户名已存在' });
        await db.query('INSERT INTO users (username,password,name) VALUES (?,?,?)', [username, password, username]);
        res.json({ code: 0, msg: '注册成功' });
    } catch (err) {
        res.status(500).json({ code: 1, msg: '注册失败' });
    }
});

// 获取用户列表
app.get('/api/users', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM users');
    res.json({ code: 0, data: rows });
});

// 封禁用户
app.post('/api/ban-user', async (req, res) => {
    const { id, status } = req.body;
    await db.query('UPDATE users SET status=? WHERE id=?', [status, id]);
    res.json({ code: 0 });
});

// 更新个人资料
app.post('/api/update-profile', async (req, res) => {
    const { id, name, signature, gender, password, avatar } = req.body;
    await db.query(
        'UPDATE users SET name=?, signature=?, gender=?, password=?, avatar=? WHERE id=?',
        [name, signature, gender, password, avatar, id]
    );
    res.json({ code: 0 });
});

// 初始化帖子表 (如果不存在则创建)
// 初始化帖子表 (增加了前端需要的字段)
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                content TEXT,
                author VARCHAR(50),
                authorNickname VARCHAR(50),
                authorImg LONGTEXT,
                role VARCHAR(50),
                category VARCHAR(50),
                status ENUM('pending','approved','rejected') DEFAULT 'pending',
                likes INT DEFAULT 0,
                comments JSON,
                images LONGTEXT,                   -- 新增：存帖子图片数组
                is_top TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("帖子表已就绪");
    } catch (err) {
        console.error("创建表失败:", err);
    }
})();

// 获取所有帖子
app.get('/api/posts', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM posts');
    res.json({ code: 0, data: rows });
});

// 审核帖子
app.post('/api/audit-post', async (req, res) => {
    const { id, status } = req.body;
    await db.query('UPDATE posts SET status=? WHERE id=?', [status, id]);
    res.json({ code: 0 });
});

// 帖子点赞
app.post('/api/like-post', async (req, res) => {
    const { postId } = req.body;
    try {
        // 让 likes 字段自增 1
        await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
        res.json({ code: 0, msg: "点赞成功" });
    } catch (err) {
        res.status(500).json({ code: 1, msg: "点赞失败" });
    }
});

// 添加评论
app.post('/api/add-comment', async (req, res) => {
    const { postId, username, content, avatar } = req.body;
    try {
        // 1. 先查出旧的评论数组
        const [rows] = await db.query('SELECT comments FROM posts WHERE id = ?', [postId]);
        let comments = rows[0].comments || [];
        
        // 如果数据库存的是字符串，需要解析（Railway JSON字段通常自动解析）
        if (typeof comments === 'string') comments = JSON.parse(comments);

        // 2. 推进去一条新评论
        const newComment = {
            username,
            avatar: avatar || "https://picsum.photos/60/60",
            content,
            date: new Date().toLocaleString()
        };
        comments.push(newComment);

        // 3. 写回数据库
        await db.query('UPDATE posts SET comments = ? WHERE id = ?', [JSON.stringify(comments), postId]);
        
        res.json({ code: 0, data: newComment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 1, msg: "评论失败" });
    }
});

// 启动监听
app.listen(PORT, '0.0.0.0', () => {
    console.log(`后端已启动，端口：${PORT}`);
});