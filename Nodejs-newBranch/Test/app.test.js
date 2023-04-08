const request = require('supertest');
const app = require('../app');
const UserTest = require('../models/user');

describe('Registration', () => {
  it('renders the registration page', async () => {
    const res = await request(app).get('/register');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Register');
  },51000);

  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'testuser', name: 'Test User', password: 'testpassword' });
    expect(res.statusCode).toBe(200);
    expect(res.header.location).toBe('/register');
    const user = await User.findOne({ username: 'testuser' });
    expect(user).toBeDefined();
    expect(user.name).toEqual('Test User');
    expect(user.admin).toEqual(false);
  },51000);

  it('fails to register a new user with an existing username', async () => {
    const user = new UserTest({ username: 'testuser', name: 'Test User', admin: false });
    await user.setPassword('testpassword');
    await user.save();
    const res = await request(app)
      .post('/register')
      .send({ username: 'testuser', name: 'Test User 2', password: 'testpassword2' });
    expect(res.statusCode).toEqual(302);
    expect(res.header.location).toEqual('/register');
    expect(res.text).toContain('go back and use different email as username.');
  },51000);
});