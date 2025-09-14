import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * User registration controller
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('signup', {
        error: 'An account with this email already exists'
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.redirect("/auth/login");
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).render('signup', {
      error: 'An error occurred during registration'
    });
  }
};

/**
 * User authentication controller
 */
export const login = async (req, res) => {
  try {
    const attempts = req.session?.loginAttempts || 0;
    if (attempts >= 5) {
      return res.status(429).render('login', {
        error: 'Account temporarily locked. Please try again later.'
      });
    }

    const { email, password } = req.body;
    
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).render('login', {
        error: 'Please provide valid credentials'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.session.loginAttempts = attempts + 1;
      return res.status(401).render('login', {
        error: 'Invalid email or password'
      });
    }

    req.session.loginAttempts = 0;

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: 'HS256'
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
      path: '/',
      signed: true
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('login', {
      error: 'An error occurred during login'
    });
  }
};

/**
 * User logout controller
 */
export const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
};
