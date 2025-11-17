const express = require("express");
const {
  getAllElections,
  getConstituenciesByElectionYear,
  getDetailedResult,
  getElectionDetails,
  getCentersByElectionAndConstituency,
  getCenterById,
} = require("../controllers/publicController");
const validate = require("../middleware/validate");
const { param, query } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * /api/public/elections:
 *   get:
 *     summary: Get all election years (Public)
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, ongoing, completed]
 *       - in: query
 *         name: year_from
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year_to
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: List of elections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 elections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       election:
 *                         type: integer
 *                       election_year:
 *                         type: integer
 *                       total_constituencies:
 *                         type: integer
 *                       status:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get(
  "/elections",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("status").optional().isIn(["scheduled", "ongoing", "completed"]),
    query("year_from").optional().isInt({ min: 1970 }),
    query("year_to").optional().isInt({ max: 2030 }),
  ],
  validate,
  getAllElections
);

/**
 * @swagger
 * /api/public/constituencies/{electionYear}:
 *   get:
 *     summary: Get constituencies by election year (Public)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: electionYear
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [constituency_number, constituency_name, percent_turnout, total_voters, margin_of_victory]
 *           default: constituency_number
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: min_turnout
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_turnout
 *         schema:
 *           type: number
 *       - in: query
 *         name: party
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: List of constituencies with summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 constituencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       constituency_number:
 *                         type: integer
 *                       constituency_name:
 *                         type: string
 *                       total_voters:
 *                         type: integer
 *                       total_centers:
 *                         type: integer
 *                       reported_centers:
 *                         type: integer
 *                       suspended_centers:
 *                         type: integer
 *                       total_turnout:
 *                         type: integer
 *                       percent_turnout:
 *                         type: number
 *                       total_valid_votes:
 *                         type: integer
 *                       cancelled_votes:
 *                         type: integer
 *                       winner:
 *                         type: object
 *                         properties:
 *                           candidate:
 *                             type: string
 *                           party:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           vote:
 *                             type: integer
 *                           percent:
 *                             type: number
 *                       runner_up:
 *                         type: object
 *                         properties:
 *                           candidate:
 *                             type: string
 *                           party:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           vote:
 *                             type: integer
 *                           percent:
 *                             type: number
 *                       total_candidates:
 *                         type: integer
 *                       margin_of_victory:
 *                         type: integer
 *                       margin_percentage:
 *                         type: number
 *                 election_year:
 *                   type: integer
 *                 total_constituencies:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       '404':
 *         description: Election not found
 */
router.get(
  "/constituencies/:electionYear",
  [
    param("electionYear")
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Invalid election year"),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("search").optional().isString().trim(),
    query("sort")
      .optional()
      .isIn([
        "constituency_number",
        "constituency_name",
        "percent_turnout",
        "total_voters",
        "margin_of_victory",
      ]),
    query("order").optional().isIn(["asc", "desc"]),
    query("min_turnout").optional().isFloat({ min: 0, max: 100 }).toFloat(),
    query("max_turnout").optional().isFloat({ min: 0, max: 100 }).toFloat(),
    query("party").optional().isString().trim(),
  ],
  validate,
  getConstituenciesByElectionYear
);

/**
 * @swagger
 * /api/public/results/{electionYear}/{constituencyNumber}:
 *   get:
 *     summary: Get detailed result for a constituency (Public)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: electionYear
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: constituencyNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detailed constituency result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 election:
 *                   type: integer
 *                 election_year:
 *                   type: integer
 *                 constituency_number:
 *                   type: integer
 *                 constituency_name:
 *                   type: string
 *                 total_voters:
 *                   type: integer
 *                 total_centers:
 *                   type: integer
 *                 reported_centers:
 *                   type: integer
 *                 suspended_centers:
 *                   type: integer
 *                 total_valid_votes:
 *                   type: integer
 *                 cancelled_votes:
 *                   type: integer
 *                 total_turnout:
 *                   type: integer
 *                 percent_turnout:
 *                   type: number
 *                 participant_details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       candidate:
 *                         type: string
 *                       party:
 *                         type: string
 *                       symbol:
 *                         type: string
 *                       vote:
 *                         type: integer
 *                       percent:
 *                         type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Constituency result not found
 */
router.get(
  "/results/:electionYear/:constituencyNumber",
  [
    param("electionYear")
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Invalid election year"),
    param("constituencyNumber")
      .isInt({ min: 1 })
      .withMessage("Invalid constituency number"),
  ],
  validate,
  getDetailedResult
);

/**
 * @swagger
 * /api/public/elections/{id}:
 *   get:
 *     summary: Get detailed election information
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Election ID
 *     responses:
 *       '200':
 *         description: Detailed election information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 election:
 *                   type: integer
 *                 election_year:
 *                   type: integer
 *                 total_constituencies:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 total_valid_vote:
 *                   type: integer
 *                 cancelled_vote:
 *                   type: integer
 *                 total_vote_cast:
 *                   type: integer
 *                 percent_valid_vote:
 *                   type: number
 *                 percent_cancelled_vote:
 *                   type: number
 *                 percent_total_vote_cast:
 *                   type: number
 *                 participant_details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       party:
 *                         type: string
 *                       symbol:
 *                         type: string
 *                       vote_obtained:
 *                         type: integer
 *                       percent_vote_obtain:
 *                         type: number
 *                       seat_obtain:
 *                         type: integer
 *                       percent_seat_obtain:
 *                         type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Election not found
 */
router.get(
  "/elections/:id",
  [param("id").isMongoId().withMessage("Invalid election ID")],
  validate,
  getElectionDetails
);

/**
 * @swagger
 * /api/public/centers/{electionYear}/{constituencyId}:
 *   get:
 *     summary: Get centers by election year and constituency (Public)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: electionYear
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: constituencyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [center_no, center, turnout_percentage, total_voters]
 *           default: center_no
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, both]
 *       - in: query
 *         name: min_turnout
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_turnout
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: List of centers with summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 centers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       center_no:
 *                         type: integer
 *                       center:
 *                         type: string
 *                       gender:
 *                         type: string
 *                       total_voters:
 *                         type: integer
 *                       total_valid_votes:
 *                         type: integer
 *                       total_invalid_votes:
 *                         type: integer
 *                       total_votes_cast:
 *                         type: integer
 *                       turnout_percentage:
 *                         type: number
 *                       votes_candidate1:
 *                         type: integer
 *                       votes_candidate2:
 *                         type: integer
 *                       votes_candidate3:
 *                         type: integer
 *                       votes_candidate4:
 *                         type: integer
 *                       votes_candidate5:
 *                         type: integer
 *                       votes_candidate6:
 *                         type: integer
 *                       votes_candidate7:
 *                         type: integer
 *                       votes_candidate8:
 *                         type: integer
 *                       votes_candidate9:
 *                         type: integer
 *                       co_ordinate:
 *                         type: object
 *                         properties:
 *                           lat:
 *                             type: number
 *                           lon:
 *                             type: number
 *                       map_link:
 *                         type: string
 *                 election_year:
 *                   type: integer
 *                 constituency_id:
 *                   type: integer
 *                 constituency_name:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       '404':
 *         description: Election or constituency not found
 */
router.get(
  "/centers/:electionYear/:constituencyId",
  [
    param("electionYear")
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Invalid election year"),
    param("constituencyId")
      .isInt({ min: 1 })
      .withMessage("Invalid constituency ID"),
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
    query("search").optional().isString().trim(),
    query("sort")
      .optional()
      .isIn(["center_no", "center", "turnout_percentage", "total_voters"]),
    query("order").optional().isIn(["asc", "desc"]),
    query("gender").optional().isIn(["male", "female", "both"]),
    query("min_turnout").optional().isFloat({ min: 0, max: 100 }).toFloat(),
    query("max_turnout").optional().isFloat({ min: 0, max: 100 }).toFloat(),
  ],
  validate,
  getCentersByElectionAndConstituency
);

/**
 * @swagger
 * /api/public/centers/{electionYear}/{constituencyId}/{centerId}:
 *   get:
 *     summary: Get detailed center information (Public)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: electionYear
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: constituencyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: centerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Detailed center information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 election:
 *                   type: integer
 *                 election_year:
 *                   type: integer
 *                 constituency_id:
 *                   type: integer
 *                 constituency_name:
 *                   type: string
 *                 center_no:
 *                   type: integer
 *                 center:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 co_ordinate:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lon:
 *                       type: number
 *                 map_link:
 *                   type: string
 *                 total_voters:
 *                   type: integer
 *                 votes_candidate1:
 *                   type: integer
 *                 votes_candidate2:
 *                   type: integer
 *                 votes_candidate3:
 *                   type: integer
 *                 votes_candidate4:
 *                   type: integer
 *                 votes_candidate5:
 *                   type: integer
 *                 votes_candidate6:
 *                   type: integer
 *                 votes_candidate7:
 *                   type: integer
 *                 votes_candidate8:
 *                   type: integer
 *                 votes_candidate9:
 *                   type: integer
 *                 total_valid_votes:
 *                   type: integer
 *                 total_invalid_votes:
 *                   type: integer
 *                 total_votes_cast:
 *                   type: integer
 *                 turnout_percentage:
 *                   type: number
 *                 total_candidate_votes:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Center not found
 */
router.get(
  "/centers/:electionYear/:constituencyId/:centerId",
  [
    param("electionYear")
      .isInt({ min: 1970, max: 2030 })
      .withMessage("Invalid election year"),
    param("constituencyId")
      .isInt({ min: 1 })
      .withMessage("Invalid constituency ID"),
    param("centerId").isInt({ min: 1 }).withMessage("Invalid center ID"),
  ],
  validate,
  getCenterById
);

module.exports = router;
