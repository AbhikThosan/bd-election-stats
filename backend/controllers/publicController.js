const Election = require("../models/Election");
const ConstituencyResult = require("../models/ConstituencyResult");
const Center = require("../models/Center");
const CustomError = require("../utils/errors");

exports.getAllElections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, year_from, year_to } = req.query;

    const query = {};
    if (status) query.status = status;
    if (year_from || year_to) {
      query.election_year = {};
      if (year_from) query.election_year.$gte = parseInt(year_from);
      if (year_to) query.election_year.$lte = parseInt(year_to);
    }

    const elections = await Election.find(query)
      .select("election election_year total_constituencies status")
      .sort({ election_year: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Election.countDocuments(query);

    res.json({
      elections,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getConstituenciesByElectionYear = async (req, res, next) => {
  try {
    const { electionYear } = req.params;
    const {
      page = 1,
      limit = 10,
      search,
      sort = "constituency_number",
      order = "asc",
      min_turnout,
      max_turnout,
      party,
    } = req.query;

    // Validate election year exists
    const election = await Election.findOne({
      election_year: parseInt(electionYear),
    });
    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    const query = { election_year: parseInt(electionYear) };

    if (search) {
      query.$or = [
        { constituency_name: { $regex: search, $options: "i" } },
        { constituency_number: parseInt(search) || null },
      ].filter(Boolean);
    }

    if (min_turnout || max_turnout) {
      query.percent_turnout = {};
      if (min_turnout) query.percent_turnout.$gte = parseFloat(min_turnout);
      if (max_turnout) query.percent_turnout.$lte = parseFloat(max_turnout);
    }

    if (party) {
      query["participant_details.party"] = { $regex: party, $options: "i" };
    }

    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const constituencies = await ConstituencyResult.find(query)
      .select(
        `
        _id constituency_number constituency_name total_voters total_centers 
        reported_centers suspended_centers total_turnout percent_turnout 
        total_valid_votes cancelled_votes participant_details
      `
      )
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Process constituencies to add winner, runner-up, and statistics
    const processedConstituencies = constituencies.map((constituency) => {
      const sortedCandidates = [...constituency.participant_details].sort(
        (a, b) => b.vote - a.vote
      );

      const winner = sortedCandidates[0];
      const runnerUp = sortedCandidates[1];
      const marginOfVictory = winner.vote - runnerUp.vote;
      const marginPercentage = (
        (marginOfVictory / constituency.total_valid_votes) *
        100
      ).toFixed(2);

      return {
        _id: constituency._id,
        constituency_number: constituency.constituency_number,
        constituency_name: constituency.constituency_name,
        total_voters: constituency.total_voters,
        total_centers: constituency.total_centers,
        reported_centers: constituency.reported_centers,
        suspended_centers: constituency.suspended_centers,
        total_turnout: constituency.total_turnout,
        percent_turnout: constituency.percent_turnout,
        total_valid_votes: constituency.total_valid_votes,
        cancelled_votes: constituency.cancelled_votes,
        winner: {
          candidate: winner.candidate,
          party: winner.party,
          symbol: winner.symbol,
          vote: winner.vote,
          percent: winner.percent,
        },
        runner_up: {
          candidate: runnerUp.candidate,
          party: runnerUp.party,
          symbol: runnerUp.symbol,
          vote: runnerUp.vote,
          percent: runnerUp.percent,
        },
        total_candidates: constituency.participant_details.length,
        margin_of_victory: marginOfVictory,
        margin_percentage: parseFloat(marginPercentage),
      };
    });

    const total = await ConstituencyResult.countDocuments(query);

    res.json({
      constituencies: processedConstituencies,
      election_year: parseInt(electionYear),
      total_constituencies: election.total_constituencies,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getDetailedResult = async (req, res, next) => {
  try {
    const { electionYear, constituencyNumber } = req.params;

    const result = await ConstituencyResult.findOne({
      election_year: parseInt(electionYear),
      constituency_number: parseInt(constituencyNumber),
    });

    if (!result) {
      throw new CustomError("Constituency result not found", 404);
    }

    // Sort candidates by vote count
    const sortedCandidates = [...result.participant_details].sort(
      (a, b) => b.vote - a.vote
    );

    const detailedResult = {
      ...result.toObject(),
      participant_details: sortedCandidates,
    };

    res.json(detailedResult);
  } catch (error) {
    next(error);
  }
};

exports.getElectionDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    // Sort parties by vote count
    const sortedParties = [...election.participant_details].sort(
      (a, b) => b.vote_obtained - a.vote_obtained
    );

    const detailedElection = {
      ...election.toObject(),
      participant_details: sortedParties,
    };

    res.json(detailedElection);
  } catch (error) {
    next(error);
  }
};

exports.getCentersByElectionAndConstituency = async (req, res, next) => {
  try {
    const { electionYear, constituencyId } = req.params;
    const {
      page = 1,
      limit = 10,
      search,
      sort = "center_no",
      order = "asc",
      gender,
      min_turnout,
      max_turnout,
    } = req.query;

    // Validate election year exists
    const election = await Election.findOne({
      election_year: parseInt(electionYear),
    });
    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    // Validate constituency exists
    const constituency = await ConstituencyResult.findOne({
      election_year: parseInt(electionYear),
      constituency_number: parseInt(constituencyId),
    });
    if (!constituency) {
      throw new CustomError("Constituency not found", 404);
    }

    const query = {
      election_year: parseInt(electionYear),
      constituency_id: parseInt(constituencyId),
    };

    if (search) {
      query.$or = [
        { center: { $regex: search, $options: "i" } },
        { center_no: parseInt(search) || null },
      ].filter(Boolean);
    }

    if (gender) {
      query.gender = gender;
    }

    if (min_turnout || max_turnout) {
      query.turnout_percentage = {};
      if (min_turnout) query.turnout_percentage.$gte = parseFloat(min_turnout);
      if (max_turnout) query.turnout_percentage.$lte = parseFloat(max_turnout);
    }

    const sortOrder = order === "desc" ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const centers = await Center.find(query)
      .select(
        `
        center_no center gender total_voters total_valid_votes 
        total_invalid_votes total_votes_cast turnout_percentage 
        votes_candidate1 votes_candidate2 votes_candidate3 
        votes_candidate4 votes_candidate5 votes_candidate6 
        votes_candidate7 votes_candidate8 votes_candidate9
        co_ordinate map_link
      `
      )
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Center.countDocuments(query);

    res.json({
      centers,
      election_year: parseInt(electionYear),
      constituency_id: parseInt(constituencyId),
      constituency_name: constituency.constituency_name,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getCenterById = async (req, res, next) => {
  try {
    const { electionYear, constituencyId, centerId } = req.params;

    const center = await Center.findOne({
      election_year: parseInt(electionYear),
      constituency_id: parseInt(constituencyId),
      center_no: parseInt(centerId),
    });

    if (!center) {
      throw new CustomError("Center not found", 404);
    }

    res.json(center);
  } catch (error) {
    next(error);
  }
};
