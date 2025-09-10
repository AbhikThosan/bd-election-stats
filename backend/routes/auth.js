const express = require("express");
const {
  register,
  login,
  refreshToken,
  adminResetPassword,
} = require("../controllers/authController");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const { body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (admin/editor)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string, minLength: 3 }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [admin, editor] }
 *             required: [email, username, password, role]
 *     responses:
 *       '201': { description: Registration successful, awaiting approval }
 *       '400': { description: Invalid input }
 */
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("username")
      .isLength({ min: 3 })
      .matches(/^[a-zA-Z0-9]+$/),
    body("password").isLength({ min: 8 }),
    body("role").isIn(["admin", "editor"]),
  ],
  validate,
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *             required: [email, password]
 *     responses:
 *       '200': { description: Login successful }
 *       '401': { description: Invalid credentials }
 */
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  login
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *             required: [refreshToken]
 *     responses:
 *       '200': { description: Token refreshed }
 *       '401': { description: Invalid refresh token }
 */
router.post(
  "/refresh-token",
  [body("refreshToken").notEmpty()],
  validate,
  refreshToken
);

/**
 * @swagger
 * /api/auth/admin/reset-password:
 *   post:
 *     summary: Admin-initiated password reset
 *     tags: [Password Reset]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *             required: [userId, newPassword]
 *     responses:
 *       '200': { description: Password reset successful }
 *       '403': { description: Unauthorized }
 */
router.post(
  "/admin/reset-password",
  auth,
  rbac(["super_admin", "admin"]),
  [body("userId").isMongoId(), body("newPassword").isLength({ min: 8 })],
  validate,
  adminResetPassword
);

module.exports = router;
