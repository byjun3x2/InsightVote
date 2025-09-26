import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/conn';

const router = express.Router();
const collectionName = 'users';

const JWT_SECRET = 'your-super-secret-key-that-should-be-in-env';

// POST: 사용자 회원가입
router.post('/register', async (req, res) => {
  try {
    const db = getDb();
    const { username, password, email, name } = req.body;

    if (!username || !password || !email || !name) {
      return res.status(400).send('All fields are required: username, password, email, name');
    }

    // 아이디 또는 이메일 중복 확인
    const existingUser = await db.collection(collectionName).findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).send('Username already exists');
      }
      if (existingUser.email === email) {
        return res.status(409).send('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection(collectionName).insertOne(newUser);
    res.status(201).json({ message: 'User created successfully', userId: result.insertedId });

  } catch (e) {
    console.error(e);
    res.status(500).send('Error registering user');
  }
});

// POST: 사용자 로그인
router.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const user = await db.collection(collectionName).findOne({ username });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // 토큰 유효 시간: 1시간
    );

    res.status(200).json({ 
      token, 
      userId: user._id, 
      username: user.username, 
      name: user.name, 
      email: user.email 
    });

  } catch (e) {
    console.error(e);
    res.status(500).send('Error logging in');
  }
});

export default router;

// POST: 아이디 중복 확인
router.post('/check-username', async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    const existingUser = await db.collection(collectionName).findOne({ username });
    if (existingUser) {
      return res.status(409).json({ available: false });
    }
    res.status(200).json({ available: true });
  } catch (e) {
    res.status(500).send('Error checking username');
  }
});

// POST: 이메일 중복 확인
router.post('/check-email', async (req, res) => {
  try {
    const db = getDb();
    const { email } = req.body;
    const existingUser = await db.collection(collectionName).findOne({ email });
    if (existingUser) {
      return res.status(409).json({ available: false });
    }
    res.status(200).json({ available: true });
  } catch (e) {
    res.status(500).send('Error checking email');
  }
});

