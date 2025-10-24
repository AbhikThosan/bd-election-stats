const express = require("express");
const {
  createCenter,
  updateCenter,
  deleteCenter,
} = require("../controllers/centerController");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const validate = require("../middleware/validate");
const { body, param } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/centers:
 *   post:
 *     summary: Create a new center
 *     tags: [Centers]
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
 *                 description: Election number
 *                 example: 11
 *               election_year:
 *                 type: integer
 *                 description: Election year
 *                 example: 2018
 *               constituency_id:
 *                 type: integer
 *                 description: Constituency ID
 *                 example: 203
 *               constituency_name:
 *                 type: string
 *                 description: Constituency name
 *                 example: "নরসিংদী-৫"
 *               center_no:
 *                 type: integer
 *                 description: Center number within constituency
 *                 example: 1
 *               center:
 *                 type: string
 *                 description: Center name/address
 *                 example: "বিয়াম ল্যাবরেটরী স্কুল, সাং- শ্রীরামপুর দক্ষিণ পাড়া"
 *               gender:
 *                 type: string
 *                 enum: [male, female, both]
 *                 description: Gender classification
 *                 example: "both"
 *               co_ordinate:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 23.97638031087031
 *                   lon:
 *                     type: number
 *                     example: 90.65395661289762
 *               map_link:
 *                 type: string
 *                 description: Google Maps link
 *                 example: "http://google.com/maps/place/..."
 *               total_voters:
 *                 type: integer
 *                 description: Total registered voters
 *                 example: 1459
 *               votes_candidate1:
 *                 type: integer
 *                 description: Votes for candidate 1
 *                 example: 3
 *               votes_candidate2:
 *                 type: integer
 *                 description: Votes for candidate 2
 *                 example: 0
 *               votes_candidate3:
 *                 type: integer
 *                 description: Votes for candidate 3
 *                 example: 162
 *               votes_candidate4:
 *                 type: integer
 *                 description: Votes for candidate 4
 *                 example: 0
 *               votes_candidate5:
 *                 type: integer
 *                 description: Votes for candidate 5
 *                 example: 0
 *               votes_candidate6:
 *                 type: integer
 *                 description: Votes for candidate 6
 *                 example: 1
 *               votes_candidate7:
 *                 type: integer
 *                 description: Votes for candidate 7
 *                 example: 1
 *               votes_candidate8:
 *                 type: integer
 *                 description: Votes for candidate 8
 *                 example: 1
 *               votes_candidate9:
 *                 type: integer
 *                 description: Votes for candidate 9
 *                 example: 458
 *               total_valid_votes:
 *                 type: integer
 *                 description: Total valid votes
 *                 example: 626
 *               total_invalid_votes:
 *                 type: integer
 *                 description: Total invalid votes
 *                 example: 11
 *               total_votes_cast:
 *                 type: integer
 *                 description: Total votes cast
 *                 example: 637
 *               turnout_percentage:
 *                 type: number
 *                 description: Turnout percentage
 *                 example: 43.66
 *             required: [election, election_year, constituency_id, constituency_name, center_no, center, gender, co_ordinate, total_voters, total_valid_votes, total_invalid_votes, total_votes_cast, turnout_percentage]
 *     responses:
 *       '201':
 *         description: Center created successfully
 *       '409':
 *         description: Duplicate center
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
      .isInt({ min: 1 })
      .withMessage("Election must be a positive integer"),
    body("election_year")
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Election year must be between 1970 and 2030"),
    body("constituency_id")
      .isInt({ min: 1 })
      .withMessage("Constituency ID must be a positive integer"),
    body("constituency_name")
      .notEmpty()
      .trim()
      .withMessage("Constituency name is required"),
    body("center_no")
      .isInt({ min: 1 })
      .withMessage("Center number must be a positive integer"),
    body("center").notEmpty().trim().withMessage("Center name is required"),
    body("gender")
      .isIn(["male", "female", "both"])
      .withMessage("Gender must be male, female, or both"),
    body("co_ordinate.lat")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    body("co_ordinate.lon")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
    body("map_link")
      .optional()
      .isURL()
      .withMessage("Map link must be a valid URL"),
    body("total_voters")
      .isInt({ min: 1 })
      .withMessage("Total voters must be a positive integer"),
    body("participant_info")
      .optional()
      .isArray({ min: 1 })
      .withMessage(
        "Participant info must be an array with at least 1 participant"
      ),
    body("participant_info.*.name")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Participant name is required"),
    body("participant_info.*.symbol")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Participant symbol is required"),
    body("participant_info.*.vote")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Participant vote must be non-negative"),
    body("total_valid_votes")
      .isInt({ min: 0 })
      .withMessage("Total valid votes must be non-negative"),
    body("total_invalid_votes")
      .isInt({ min: 0 })
      .withMessage("Total invalid votes must be non-negative"),
    body("total_votes_cast")
      .isInt({ min: 0 })
      .withMessage("Total votes cast must be non-negative"),
    body("turnout_percentage")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Turnout percentage must be between 0 and 100"),
  ],
  validate,
  createCenter
);

/**
 * @swagger
 * /api/centers/{id}:
 *   put:
 *     summary: Update a center
 *     tags: [Centers]
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
 *               center:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, both]
 *               co_ordinate:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *               map_link:
 *                 type: string
 *               total_voters:
 *                 type: integer
 *               votes_candidate1:
 *                 type: integer
 *               votes_candidate2:
 *                 type: integer
 *               votes_candidate3:
 *                 type: integer
 *               votes_candidate4:
 *                 type: integer
 *               votes_candidate5:
 *                 type: integer
 *               votes_candidate6:
 *                 type: integer
 *               votes_candidate7:
 *                 type: integer
 *               votes_candidate8:
 *                 type: integer
 *               votes_candidate9:
 *                 type: integer
 *               total_valid_votes:
 *                 type: integer
 *               total_invalid_votes:
 *                 type: integer
 *               total_votes_cast:
 *                 type: integer
 *               turnout_percentage:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Center updated successfully
 *       '404':
 *         description: Center not found
 *       '409':
 *         description: Duplicate center
 */
router.put(
  "/:id",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [
    param("id").isMongoId().withMessage("Invalid center ID"),
    body("center")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Center name cannot be empty"),
    body("gender")
      .optional()
      .isIn(["male", "female", "both"])
      .withMessage("Gender must be male, female, or both"),
    body("co_ordinate.lat")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    body("co_ordinate.lon")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
    body("map_link")
      .optional()
      .isURL()
      .withMessage("Map link must be a valid URL"),
    body("total_voters")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Total voters must be a positive integer"),
    body("participant_info")
      .optional()
      .isArray({ min: 1 })
      .withMessage(
        "Participant info must be an array with at least 1 participant"
      ),
    body("participant_info.*.name")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Participant name is required"),
    body("participant_info.*.symbol")
      .optional()
      .notEmpty()
      .trim()
      .withMessage("Participant symbol is required"),
    body("participant_info.*.vote")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Participant vote must be non-negative"),
    body("total_valid_votes")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Total valid votes must be non-negative"),
    body("total_invalid_votes")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Total invalid votes must be non-negative"),
    body("total_votes_cast")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Total votes cast must be non-negative"),
    body("turnout_percentage")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Turnout percentage must be between 0 and 100"),
  ],
  validate,
  updateCenter
);

/**
 * @swagger
 * /api/centers/{id}:
 *   delete:
 *     summary: Delete a center
 *     tags: [Centers]
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
 *         description: Center deleted successfully
 *       '404':
 *         description: Center not found
 */
router.delete(
  "/:id",
  auth,
  rbac(["super_admin", "admin", "editor"]),
  [param("id").isMongoId().withMessage("Invalid center ID")],
  validate,
  deleteCenter
);

module.exports = router;
