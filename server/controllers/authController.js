import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'aegisvoice_fallback_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      phone_number,
      role = 'PROTECTED_USER',
      preferred_language = 'en',
      guardian_contact_phone,
      guardian_contact_email
    } = req.body;

    // Check existing
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role, preferred_language, guardian_contact_phone, guardian_contact_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [email, password_hash, full_name, phone_number || null, role, preferred_language, guardian_contact_phone || null, guardian_contact_email || null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    delete user.password_hash;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    delete user.password_hash;

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = result.rows[0];
    delete user.password_hash;
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      preferred_language,
      alert_sensitivity,
      auto_terminate_threshold,
      guardian_contact_phone,
      guardian_contact_email
    } = req.body;

    // Fetch existing user to preserve values
    const current = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const cur = current.rows[0];

    const lang = preferred_language || cur.preferred_language;
    const sens = alert_sensitivity || cur.alert_sensitivity;
    const thresh = auto_terminate_threshold ?? cur.auto_terminate_threshold;
    const gPhone = guardian_contact_phone !== undefined ? guardian_contact_phone : cur.guardian_contact_phone;
    const gEmail = guardian_contact_email !== undefined ? guardian_contact_email : cur.guardian_contact_email;

    const result = await db.query(
      `UPDATE users SET preferred_language = $1, alert_sensitivity = $2, auto_terminate_threshold = $3, guardian_contact_phone = $4, guardian_contact_email = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
      [lang, sens, thresh, gPhone, gEmail, req.user.id]
    );

    const updatedUser = result.rows[0];
    delete updatedUser.password_hash;

    return res.json({
      success: true,
      message: 'Protection settings updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

