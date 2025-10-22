const express = require("express");
const {
  createConstituencyResult,
  updateConstituencyResult,
  deleteConstituencyResult,
} = require("../controllers/constituencyResultController");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const validate = require("../middleware/validate");
const { body, param, query } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/constituency-results:
 *   post:
 *     summary: Add constituency result
 *     tags: [Constituency Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               election:
 *                 type: integer
 *                 example: 7
 *               election_year:
 *                 type: integer
 *                 example: 1996
 *               constituency_number:
 *                 type: integer
 *                 example: 201
 *               constituency_name:
 *                 type: string
 *                 example: "narshingdi-5"
 *               total_voters:
 *                 type: integer
 *                 example: 219827
 *               total_centers:
 *                 type: integer
 *                 example: 123
 *               reported_centers:
 *                 type: integer
 *                 example: 123
 *               suspended_centers:
 *                 type: integer
 *                 example: 0
 *               total_valid_votes:
 *                 type: integer
 *                 example: 168198
 *               cancelled_votes:
 *                 type: integer
 *                 example: 2085
 *               total_turnout:
 *                 type: integer
 *                 example: 170283
 *               percent_turnout:
 *                 type: number
 *                 example: 77.46
 *               participant_details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     candidate:
 *                       type: string
 *                     party:
 *                       type: string
 *                     symbol:
 *                       type: string
 *                     vote:
 *                       type: integer
 *                     percent:
 *                       type: number
 *             required: [election, election_year, constituency_number, constituency_name, total_voters, total_centers, total_valid_votes, cancelled_votes, total_turnout, percent_turnout, participant_details]
 *     responses:
 *       '201':
 *         description: Constituency result added successfully
 *       '409':
 *         description: Duplicate constituency
 *       '400':
 *         description: Validation error
 */
router.post(
  "/",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [
    body("election")
      .isInt({ min: 1 })
      .withMessage("Election must be a positive integer"),
    body("election_year")
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Election year must be between 1970 and 2030"),
    body("constituency_number")
      .isInt({ min: 1 })
      .withMessage("Constituency number must be a positive integer"),
    body("constituency_name")
      .notEmpty()
      .trim()
      .withMessage("Constituency name is required"),
    body("total_voters")
      .isInt({ min: 1 })
      .withMessage("Total voters must be a positive integer"),
    body("total_centers")
      .isInt({ min: 1 })
      .withMessage("Total centers must be a positive integer"),
    body("reported_centers")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Reported centers must be a non-negative integer"),
    body("suspended_centers")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Suspended centers must be a non-negative integer"),
    body("total_valid_votes")
      .isInt({ min: 0 })
      .withMessage("Total valid votes must be a non-negative integer"),
    body("cancelled_votes")
      .isInt({ min: 0 })
      .withMessage("Cancelled votes must be a non-negative integer"),
    body("total_turnout")
      .isInt({ min: 0 })
      .withMessage("Total turnout must be a non-negative integer"),
    body("percent_turnout")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent turnout must be between 0 and 100"),
    body("participant_details")
      .isArray({ min: 2 })
      .withMessage("At least 2 participants are required"),
    body("participant_details.*.candidate")
      .notEmpty()
      .trim()
      .withMessage("Candidate name is required"),
    body("participant_details.*.party")
      .notEmpty()
      .trim()
      .withMessage("Party name is required"),
    body("participant_details.*.symbol")
      .notEmpty()
      .trim()
      .withMessage("Symbol is required"),
    body("participant_details.*.vote")
      .isInt({ min: 0 })
      .withMessage("Vote count must be a non-negative integer"),
    body("participant_details.*.percent")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Vote percent must be between 0 and 100"),
  ],
  validate,
  createConstituencyResult
);

/**
 * @swagger
 * /api/constituency-results/{id}:
 *   put:
 *     summary: Update constituency result
 *     tags: [Constituency Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               constituency_name:
 *                 type: string
 *               total_voters:
 *                 type: integer
 *               total_centers:
 *                 type: integer
 *               reported_centers:
 *                 type: integer
 *               suspended_centers:
 *                 type: integer
 *               total_valid_votes:
 *                 type: integer
 *               cancelled_votes:
 *                 type: integer
 *               total_turnout:
 *                 type: integer
 *               percent_turnout:
 *                 type: number
 *               participant_details:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       '200':
 *         description: Constituency result updated successfully
 *       '404':
 *         description: Constituency result not found
 *       '409':
 *         description: Duplicate constituency
 */
router.put(
  "/:id",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [
    param("id").isMongoId().withMessage("Invalid constituency result ID"),
    body("constituency_name")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Constituency name cannot be empty"),
    body("total_voters")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Total voters must be a positive integer"),
    body("total_centers")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Total centers must be a positive integer"),
    body("reported_centers")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Reported centers must be a non-negative integer"),
    body("suspended_centers")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Suspended centers must be a non-negative integer"),
    body("total_valid_votes")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Total valid votes must be a non-negative integer"),
    body("cancelled_votes")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Cancelled votes must be a non-negative integer"),
    body("total_turnout")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Total turnout must be a non-negative integer"),
    body("percent_turnout")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent turnout must be between 0 and 100"),
    body("participant_details")
      .optional()
      .isArray({ min: 2 })
      .withMessage("At least 2 participants are required"),
  ],
  validate,
  updateConstituencyResult
);

/**
 * @swagger
 * /api/constituency-results/{id}:
 *   delete:
 *     summary: Delete constituency result
 *     tags: [Constituency Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Constituency result deleted successfully
 *       '404':
 *         description: Constituency result not found
 */
router.delete(
  "/:id",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [param("id").isMongoId().withMessage("Invalid constituency result ID")],
  validate,
  deleteConstituencyResult
);

module.exports = router;
