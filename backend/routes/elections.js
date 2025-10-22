const express = require("express");
const {
  createElection,
  updateElection,
  deleteElection,
} = require("../controllers/electionController");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const validate = require("../middleware/validate");
const { body, param, query } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/elections:
 *   post:
 *     summary: Create a new election
 *     tags: [Elections]
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
 *                 description: Sequential election number
 *                 example: 7
 *               election_year:
 *                 type: integer
 *                 description: Year of election
 *                 example: 1996
 *               total_constituencies:
 *                 type: integer
 *                 description: Total number of constituencies
 *                 example: 300
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed]
 *                 default: completed
 *               total_valid_vote:
 *                 type: integer
 *                 description: Total valid votes cast
 *                 example: 42418274
 *               cancelled_vote:
 *                 type: integer
 *                 description: Total cancelled votes
 *                 example: 462302
 *               total_vote_cast:
 *                 type: integer
 *                 description: Total votes cast (valid + cancelled)
 *                 example: 42880576
 *               percent_valid_vote:
 *                 type: number
 *                 description: Percentage of valid votes
 *                 example: 74.15
 *               percent_cancelled_vote:
 *                 type: number
 *                 description: Percentage of cancelled votes
 *                 example: 0.81
 *               percent_total_vote_cast:
 *                 type: number
 *                 description: Percentage of total votes cast
 *                 example: 74.96
 *               participant_details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     party:
 *                       type: string
 *                     symbol:
 *                       type: string
 *                     vote_obtained:
 *                       type: integer
 *                     percent_vote_obtain:
 *                       type: number
 *                     seat_obtain:
 *                       type: integer
 *                     percent_seat_obtain:
 *                       type: number
 *             required: [election, election_year, total_constituencies, total_valid_vote, cancelled_vote, total_vote_cast, percent_valid_vote, percent_cancelled_vote, percent_total_vote_cast, participant_details]
 *     responses:
 *       '201':
 *         description: Election created successfully
 *       '409':
 *         description: Duplicate election number or year
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Unauthorized
 */
router.post(
  "/",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [
    body("election")
      .toInt()
      .isInt({ min: 1 })
      .withMessage("Election number must be a positive integer"),
    body("election_year")
      .toInt()
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Election year must be between 1970 and 2030"),
    body("total_constituencies")
      .toInt()
      .isInt({ min: 1, max: 500 })
      .withMessage("Total constituencies must be between 1 and 500"),
    body("status")
      .optional()
      .isIn(["scheduled", "ongoing", "completed"])
      .withMessage("Invalid status"),
    body("total_valid_vote")
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Total valid vote must be a non-negative integer"),
    body("cancelled_vote")
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Cancelled vote must be a non-negative integer"),
    body("total_vote_cast")
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Total vote cast must be a non-negative integer"),
    body("percent_valid_vote")
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent valid vote must be between 0 and 100"),
    body("percent_cancelled_vote")
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent cancelled vote must be between 0 and 100"),
    body("percent_total_vote_cast")
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent total vote cast must be between 0 and 100"),
    body("participant_details")
      .isArray({ min: 2 })
      .withMessage("At least 2 parties are required"),
    body("participant_details.*.party")
      .notEmpty()
      .withMessage("Party name is required"),
    body("participant_details.*.symbol")
      .notEmpty()
      .withMessage("Party symbol is required"),
    body("participant_details.*.vote_obtained")
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Vote obtained must be a non-negative integer"),
    body("participant_details.*.percent_vote_obtain")
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent vote obtain must be between 0 and 100"),
    body("participant_details.*.seat_obtain")
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Seat obtain must be a non-negative integer"),
    body("participant_details.*.percent_seat_obtain")
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent seat obtain must be between 0 and 100"),
  ],
  validate,
  createElection
);

/**
 * @swagger
 * /api/elections/{id}:
 *   put:
 *     summary: Update an election
 *     tags: [Elections]
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
 *               election:
 *                 type: integer
 *               election_year:
 *                 type: integer
 *               total_constituencies:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [scheduled, ongoing, completed]
 *     responses:
 *       '200':
 *         description: Election updated successfully
 *       '404':
 *         description: Election not found
 *       '409':
 *         description: Duplicate election number or year
 */
router.put(
  "/:id",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [
    param("id").isMongoId().withMessage("Invalid election ID"),
    body("election")
      .optional()
      .toInt()
      .isInt({ min: 1 })
      .withMessage("Election number must be a positive integer"),
    body("election_year")
      .optional()
      .toInt()
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Election year must be between 1970 and 2030"),
    body("total_constituencies")
      .optional()
      .toInt()
      .isInt({ min: 1, max: 500 })
      .withMessage("Total constituencies must be between 1 and 500"),
    body("status")
      .optional()
      .isIn(["scheduled", "ongoing", "completed"])
      .withMessage("Invalid status"),
    body("total_valid_vote")
      .optional()
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Total valid vote must be a non-negative integer"),
    body("cancelled_vote")
      .optional()
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Cancelled vote must be a non-negative integer"),
    body("total_vote_cast")
      .optional()
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Total vote cast must be a non-negative integer"),
    body("percent_valid_vote")
      .optional()
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent valid vote must be between 0 and 100"),
    body("percent_cancelled_vote")
      .optional()
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent cancelled vote must be between 0 and 100"),
    body("percent_total_vote_cast")
      .optional()
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent total vote cast must be between 0 and 100"),
    body("participant_details")
      .optional()
      .isArray({ min: 2 })
      .withMessage("At least 2 parties are required"),
    body("participant_details.*.party")
      .optional()
      .notEmpty()
      .withMessage("Party name is required"),
    body("participant_details.*.symbol")
      .optional()
      .notEmpty()
      .withMessage("Party symbol is required"),
    body("participant_details.*.vote_obtained")
      .optional()
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Vote obtained must be a non-negative integer"),
    body("participant_details.*.percent_vote_obtain")
      .optional()
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent vote obtain must be between 0 and 100"),
    body("participant_details.*.seat_obtain")
      .optional()
      .toInt()
      .isInt({ min: 0 })
      .withMessage("Seat obtain must be a non-negative integer"),
    body("participant_details.*.percent_seat_obtain")
      .optional()
      .toFloat()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percent seat obtain must be between 0 and 100"),
  ],
  validate,
  updateElection
);

/**
 * @swagger
 * /api/elections/{id}:
 *   delete:
 *     summary: Delete an election
 *     tags: [Elections]
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
 *         description: Election deleted successfully
 *       '404':
 *         description: Election not found
 *       '400':
 *         description: Cannot delete election with existing results
 */
router.delete(
  "/:id",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [param("id").isMongoId().withMessage("Invalid election ID")],
  validate,
  deleteElection
);

module.exports = router;
