const express = require("express");
const {
  listNotifications,
  updateNotification,
} = require("../controllers/notificationController");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const validate = require("../middleware/validate");
const { query, param, body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/auth/notifications:
 *   get:
 *     summary: List pending notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       '200': { description: List of notifications }
 *       '403': { description: Unauthorized }
 */
router.get(
  "/",
  auth,
  rbac(["super_admin", "admin"]),
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1 }).toInt(),
  ],
  validate,
  listNotifications
);

/**
 * @swagger
 * /api/auth/notifications/{id}:
 *   patch:
 *     summary: Update notification status
 *     tags: [Notifications]
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
 *               status: { type: string, enum: [approved, rejected] }
 *             required: [status]
 *     responses:
 *       '200': { description: Notification updated }
 *       '403': { description: Unauthorized }
 */
router.patch(
  "/:id",
  auth,
  rbac(["super_admin", "admin"]),
  [param("id").isMongoId(), body("status").isIn(["approved", "rejected"])],
  validate,
  updateNotification
);

module.exports = router;
