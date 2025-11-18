'use strict';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PUBLIC_INTERFACE
 * validateRegister
 *  Validates register payload.
 */
function validateRegister(body) {
  /** This is a public function that validates register payload. */
  const errors = [];
  if (!body || typeof body !== 'object') errors.push('Invalid body');
  const { email, password, name } = body || {};
  if (!email || !EMAIL_REGEX.test(String(email).toLowerCase())) errors.push('Valid email is required');
  if (!password || typeof password !== 'string' || password.length < 8) errors.push('Password must be at least 8 characters');
  if (name && typeof name !== 'string') errors.push('Name must be a string');
  return errors;
}

/**
 * PUBLIC_INTERFACE
 * validateLogin
 *  Validates login payload.
 */
function validateLogin(body) {
  /** This is a public function that validates login payload. */
  const errors = [];
  const { email, password } = body || {};
  if (!email || !EMAIL_REGEX.test(String(email).toLowerCase())) errors.push('Valid email is required');
  if (!password || typeof password !== 'string') errors.push('Password is required');
  return errors;
}

/**
 * PUBLIC_INTERFACE
 * validateQuizAttempt
 *  Validates quiz attempt payload.
 */
function validateQuizAttempt(body) {
  /** This is a public function that validates quiz attempt payload. */
  const errors = [];
  const { videoId, moduleId, answers } = body || {};
  if (!videoId && !moduleId) {
    errors.push('Either videoId or moduleId must be provided');
  }
  if (videoId && typeof videoId !== 'string') errors.push('videoId must be a string');
  if (moduleId && typeof moduleId !== 'string') errors.push('moduleId must be a string');
  if (!Array.isArray(answers) || answers.length === 0) errors.push('answers must be a non-empty array');
  else {
    answers.forEach((a, idx) => {
      if (!a || typeof a !== 'object') errors.push(`answers[${idx}] must be an object`);
      else {
        if (typeof a.questionId !== 'string') errors.push(`answers[${idx}].questionId must be string`);
        if (!Array.isArray(a.selectedAnswerIds)) errors.push(`answers[${idx}].selectedAnswerIds must be array`);
      }
    });
  }
  return errors;
}

module.exports = {
  // PUBLIC_INTERFACE
  validateRegister,
  // PUBLIC_INTERFACE
  validateLogin,
  // PUBLIC_INTERFACE
  validateQuizAttempt,
};
