const Election = require("../models/Election");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");

exports.createElection = async (req, res, next) => {
  try {
    const {
      election,
      election_year,
      total_constituencies,
      status,
      total_valid_vote,
      cancelled_vote,
      total_vote_cast,
      percent_valid_vote,
      percent_cancelled_vote,
      percent_total_vote_cast,
      participant_details,
    } = req.body;

    // Check for duplicate election number
    const existingByNumber = await Election.findOne({ election });
    if (existingByNumber) {
      return res.status(409).json({
        message: `Election with number ${election} already exists`,
        error: "DUPLICATE_ELECTION_NUMBER",
        field: "election",
        existingValue: election,
      });
    }

    // Check for duplicate election year
    const existingByYear = await Election.findOne({ election_year });
    if (existingByYear) {
      return res.status(409).json({
        message: `Election for year ${election_year} already exists`,
        error: "DUPLICATE_ELECTION_YEAR",
        field: "election_year",
        existingValue: election_year,
      });
    }

    const newElection = new Election({
      election,
      election_year,
      total_constituencies,
      status: status || "completed",
      total_valid_vote,
      cancelled_vote,
      total_vote_cast,
      percent_valid_vote,
      percent_cancelled_vote,
      percent_total_vote_cast,
      participant_details,
    });

    await newElection.save();

    logger.info(`Election created: ${election_year} by user ${req.user.id}`);

    res.status(201).json({
      message: "Election created successfully",
      election: newElection,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const election = await Election.findById(id);
    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    // Check for duplicate election number if being updated
    if (updateData.election && updateData.election !== election.election) {
      const existingByNumber = await Election.findOne({
        election: updateData.election,
        _id: { $ne: id },
      });
      if (existingByNumber) {
        return res.status(409).json({
          message: `Cannot update election number to ${updateData.election}. Election ${updateData.election} already exists`,
          error: "DUPLICATE_ELECTION_NUMBER",
          field: "election",
          attemptedValue: updateData.election,
          existingElectionId: existingByNumber._id,
        });
      }
    }

    // Check for duplicate election year if being updated
    if (
      updateData.election_year &&
      updateData.election_year !== election.election_year
    ) {
      const existingByYear = await Election.findOne({
        election_year: updateData.election_year,
        _id: { $ne: id },
      });
      if (existingByYear) {
        return res.status(409).json({
          message: `Cannot update election year to ${updateData.election_year}. Election for year ${updateData.election_year} already exists`,
          error: "DUPLICATE_ELECTION_YEAR",
          field: "election_year",
          attemptedValue: updateData.election_year,
          existingElectionId: existingByYear._id,
        });
      }
    }

    const updatedElection = await Election.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    logger.info(
      `Election updated: ${updatedElection.election_year} by user ${req.user.id}`
    );

    res.json({
      message: "Election updated successfully",
      election: updatedElection,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteElection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    // Check if election has associated constituency results
    const ConstituencyResult = require("../models/ConstituencyResult");
    const hasResults = await ConstituencyResult.findOne({
      election: election.election,
    });

    if (hasResults) {
      return res.status(400).json({
        message: "Cannot delete election with existing constituency results",
        error: "ELECTION_HAS_RESULTS",
        constituencyResultsCount: await ConstituencyResult.countDocuments({
          election: election.election,
        }),
      });
    }

    await Election.findByIdAndDelete(id);

    logger.info(
      `Election deleted: ${election.election_year} by user ${req.user.id}`
    );

    res.json({
      message: "Election deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
