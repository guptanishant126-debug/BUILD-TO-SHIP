import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

export const listContacts = async (req, res) => {
  try {
    const contactsResult = await db.query(
      `SELECT c.*, p.pitch_mean_hz, p.spectral_centroid_mean, p.jitter_baseline, p.sample_duration_seconds
       FROM trusted_contacts c
       LEFT JOIN voice_enclave_profiles p ON c.id = p.contact_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    // Fetch challenges for each contact
    const contacts = await Promise.all(
      contactsResult.rows.map(async (contact) => {
        const challengesResult = await db.query(
          `SELECT id, question_prompt, hint, created_at FROM verification_challenges WHERE contact_id = $1`,
          [contact.id]
        );
        return {
          ...contact,
          challenges: challengesResult.rows
        };
      })
    );

    return res.json({ success: true, contacts });
  } catch (err) {
    console.error('List contacts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve trusted contacts' });
  }
};

export const createContact = async (req, res) => {
  try {
    const { full_name, relationship, phone_number } = req.body;

    const result = await db.query(
      `INSERT INTO trusted_contacts (user_id, full_name, relationship, phone_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, full_name, relationship, phone_number || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Contact added to trusted enclave',
      contact: result.rows[0]
    });
  } catch (err) {
    console.error('Create contact error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create contact' });
  }
};

export const enrollVoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pitch_mean_hz,
      pitch_variance,
      spectral_centroid_mean,
      zero_crossing_rate_mean,
      jitter_baseline,
      shimmer_baseline,
      feature_hash,
      sample_duration_seconds = 15.0
    } = req.body;

    // Verify contact belongs to user
    const contactCheck = await db.query(
      'SELECT * FROM trusted_contacts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (contactCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found or unauthorized' });
    }

    const calculatedHash = feature_hash || crypto.createHash('sha256').update(`${id}-${pitch_mean_hz}-${Date.now()}`).digest('hex');

    const profileResult = await db.query(
      `INSERT INTO voice_enclave_profiles (contact_id, pitch_mean_hz, pitch_variance, spectral_centroid_mean, zero_crossing_rate_mean, jitter_baseline, shimmer_baseline, feature_hash, sample_duration_seconds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, pitch_mean_hz, pitch_variance, spectral_centroid_mean, zero_crossing_rate_mean, jitter_baseline, shimmer_baseline, calculatedHash, sample_duration_seconds]
    );

    // Update contact status
    await db.query(
      `UPDATE trusted_contacts SET is_voice_enrolled = TRUE, enrolled_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Acoustic biometric baseline enrolled securely in Zero-Knowledge Enclave',
      profile: profileResult.rows[0]
    });
  } catch (err) {
    console.error('Enroll voice error:', err);
    return res.status(500).json({ success: false, message: 'Failed to enroll voice baseline' });
  }
};

export const getChallenges = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, question_prompt, hint, created_at FROM verification_challenges WHERE contact_id = $1`,
      [id]
    );
    return res.json({ success: true, challenges: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve challenges' });
  }
};

export const createChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_prompt, secret_answer, hint } = req.body;

    // Verify contact ownership
    const contactCheck = await db.query(
      'SELECT * FROM trusted_contacts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (contactCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found or unauthorized' });
    }

    const secret_answer_hash = await bcrypt.hash(secret_answer.toLowerCase().trim(), 10);

    const result = await db.query(
      `INSERT INTO verification_challenges (contact_id, question_prompt, secret_answer_hash, hint)
       VALUES ($1, $2, $3, $4) RETURNING id, contact_id, question_prompt, hint, created_at`,
      [id, question_prompt, secret_answer_hash, hint || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Secret challenge registered in Private Enclave',
      challenge: result.rows[0]
    });
  } catch (err) {
    console.error('Create challenge error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create challenge' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `DELETE FROM trusted_contacts WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found or unauthorized' });
    }

    return res.json({ success: true, message: 'Contact and associated biometrics purged from enclave' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete contact' });
  }
};

