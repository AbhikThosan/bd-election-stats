const express = require("express");
const {
  listUsers,
  getUser,
  approveUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const validate = require("../middleware/validate");
const { query, param, body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: List users with search/pagination
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [super_admin, admin, editor] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, active] }
 *     responses:
 *       '200': { description: List of users }
 *       '403': { description: Unauthorized }
 */
router.get(
  "/",
  auth,
  rbac(["super_admin"]),
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1 }).toInt(),
    query("email").optional().isString(),
    query("role").optional().isIn(["super_admin", "admin", "editor"]),
    query("status").optional().isIn(["pending", "active"]),
  ],
  validate,
  listUsers
);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: User details }
 *       '403': { description: Unauthorized }
 *       '404': { description: User not found }
 */
router.get(
  "/:id",
  auth,
  rbac(["super_admin", "admin"]),
  [param("id").isMongoId()],
  validate,
  getUser
);

/**
 * @swagger
 * /api/auth/users/{id}/approve:
 *   patch:
 *     summary: Approve/reject a pending registration
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approve: { type: boolean }
 *             required: [approve]
 *     responses:
 *       '200': { description: User approved/rejected }
 *       '403': { description: Unauthorized }
 */
router.patch(
  "/:id/approve",
  auth,
  rbac(["super_admin", "admin"]),
  [param("id").isMongoId(), body("approve").isBoolean()],
  validate,
  approveUser
);

/**
 * @swagger
 * /api/auth/users/{id}/role:
 *   patch:
 *     summary: Promote/demote user role
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [admin, editor] }
 *             required: [role]
 *     responses:
 *       '200': { description: Role updated }
 *       '403': { description: Unauthorized }
 */
router.patch(
  "/:id/role",
  auth,
  rbac(["super_admin", "admin"]),
  [param("id").isMongoId(), body("role").isIn(["admin", "editor"])],
  validate,
  updateUserRole
);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: User deleted }
 *       '403': { description: Unauthorized }
 */
router.delete(
  "/:id",
  auth,
  rbac(["super_admin", "admin"]),
  [param("id").isMongoId()],
  validate,
  deleteUser
);

module.exports = router;
