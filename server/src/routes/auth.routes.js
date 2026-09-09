const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { createUser, getUserByEmail, getUserById, countUsers } = require('../db');
const { sign, requireAuth } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(72)
});

router.post('/register', (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    if (getUserByEmail(parsed.email)) throw httpError(409, 'An account with that email already exists');
    const passwordHash = bcrypt.hashSync(parsed.password, 10);
    const user = createUser({ name: parsed.name, email: parsed.email, passwordHash });
    const isFirst = countUsers() === 1;
    const role = isFirst ? 'admin' : user.role;
    const finalUser = role !== user.role ? { ...user, role } : user;
    res.json({ token: sign({ id: finalUser.id, role: finalUser.role }), user: publicUser(finalUser) });
  } catch (err) {
    if (err.name === 'ZodError') err = httpError(400, err.issues[0].message);
    next(err);
  }
});

router.post('/login', (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const { email, password } = schema.parse(req.body);
    const user = getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw httpError(401, 'Invalid email or password');
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    if (err.name === 'ZodError') err = httpError(400, err.issues[0].message);
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

module.exports = router;