import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51JgER4Ag07qd1vHXqC1Xd8O2fB2KIb2p4it7k3wd5rkPCez3QV6xNW8IE0ZoV1vbdSFoOhJneiGURueisNgF2S7100YjryXQei'

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asfaffs';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
  //build a JWT payload { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  //create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //build the session object
  const session = { jwt: token };

  //turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  //take JSON and encode as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};
