const express = require("express");
const {
  uploadMiddleware,
  uploadBulkData,
  getUploadStatus,
  getUploadErrors,
  downloadTemplate,
} = require("../controllers/bulkUploadController");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const validate = require("../middleware/validate");
const { param, body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/constituency-results/template/{format}:
 *   get:
 *     summary: Download template file for bulk upload
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [excel, csv]
 *     responses:
 *       '200':
 *         description: Template file downloaded
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *       '400':
 *         description: Invalid format
 */
router.get(
  "/template/:format",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [
    param("format")
      .isIn(["excel", "csv"])
      .withMessage("Format must be 'excel' or 'csv'"),
  ],
  validate,
  downloadTemplate
);

/**
 * @swagger
 * /api/constituency-results/bulk-upload:
 *   post:
 *     summary: Upload and process bulk constituency results
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel or CSV file
 *               election_year:
 *                 type: integer
 *                 description: Election year
 *                 example: 1996
 *               overwrite_existing:
 *                 type: boolean
 *                 description: Whether to overwrite existing records
 *                 default: false
 *               validate_only:
 *                 type: boolean
 *                 description: Whether to validate only without saving
 *                 default: false
 *             required: [file, election_year]
 *     responses:
 *       '202':
 *         description: File uploaded successfully, processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 upload_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 estimated_time:
 *                   type: string
 *       '400':
 *         description: Invalid file or missing parameters
 *       '413':
 *         description: File too large
 */
router.post(
  "/bulk-upload",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  uploadMiddleware,
  uploadBulkData
);

/**
 * @swagger
 * /api/constituency-results/bulk-upload/{id}:
 *   get:
 *     summary: Check bulk upload status
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Upload ID
 *     responses:
 *       '200':
 *         description: Upload status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upload_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [uploaded, processing, completed, failed, cancelled]
 *                 progress:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     percentage:
 *                       type: integer
 *                 summary:
 *                   type: object
 *                   properties:
 *                     successful_inserts:
 *                       type: integer
 *                     updated_records:
 *                       type: integer
 *                     skipped_duplicates:
 *                       type: integer
 *                     validation_errors:
 *                       type: integer
 *                 processing_time:
 *                   type: integer
 *                   description: Processing time in seconds (if completed)
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *                   description: Completion timestamp (if completed)
 *       '404':
 *         description: Upload not found
 */
router.get(
  "/bulk-upload/:id",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [param("id").notEmpty().withMessage("Upload ID is required")],
  validate,
  getUploadStatus
);

/**
 * @swagger
 * /api/constituency-results/bulk-upload/{id}/errors:
 *   get:
 *     summary: Get validation errors for bulk upload
 *     tags: [Bulk Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: Upload ID
 *     responses:
 *       '200':
 *         description: Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upload_id:
 *                   type: string
 *                 validation_errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row_number:
 *                         type: integer
 *                       constituency_number:
 *                         type: integer
 *                       constituency_name:
 *                         type: string
 *                       errors:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             field:
 *                               type: string
 *                             value:
 *                               type: string
 *                             message:
 *                               type: string
 *                 error_summary:
 *                   type: object
 *                   properties:
 *                     total_errors:
 *                       type: integer
 *                     duplicate_errors:
 *                       type: integer
 *                     validation_errors:
 *                       type: integer
 *       '404':
 *         description: Upload not found
 */
router.get(
  "/bulk-upload/:id/errors",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [param("id").notEmpty().withMessage("Upload ID is required")],
  validate,
  getUploadErrors
);

module.exports = router;
