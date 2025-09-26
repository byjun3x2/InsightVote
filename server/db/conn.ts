import { Db, MongoClient } from 'mongodb';

const connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(connectionString);

let db: Db;

export const connectToServer = async () => {
  try {
    await client.connect();
    db = client.db('InsightVote'); // 데이터베이스 이름
    console.log('Successfully connected to MongoDB.');
  } catch (e) {
    console.error('Could not connect to MongoDB', e);
    process.exit(1);
  }
};

export const getDb = () => db;
