const ConstituencyResult = require("../models/ConstituencyResult");
const Election = require("../models/Election");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");

exports.createConstituencyResult = async (req, res, next) => {
  try {
    const constituencyData = req.body;

    // Validate election exists
    const election = await Election.findOne({
      election: constituencyData.election,
      election_year: constituencyData.election_year,
    });
    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    // Check for duplicate constituency in same election year
    const existingConstituency = await ConstituencyResult.findOne({
      election_year: constituencyData.election_year,
      constituency_number: constituencyData.constituency_number,
    });

    if (existingConstituency) {
      return res.status(409).json({
        message: `Constituency ${constituencyData.constituency_number} already exists for election year ${constituencyData.election_year}`,
        error: "DUPLICATE_CONSTITUENCY",
        field: "constituency_number",
        election_year: constituencyData.election_year,
        constituency_number: constituencyData.constituency_number,
        existingConstituency: existingConstituency.constituency_name,
      });
    }

    const newResult = new ConstituencyResult(constituencyData);
    await newResult.save();

    logger.info(
      `Constituency result created: ${constituencyData.constituency_name} (${constituencyData.election_year}) by user ${req.user.id}`
    );

    res.status(201).json({
      message: "Constituency result added successfully",
      result: newResult,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateConstituencyResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await ConstituencyResult.findById(id);
    if (!result) {
      throw new CustomError("Constituency result not found", 404);
    }

    // Check for duplicate constituency if updating constituency number or election year
    if (
      (updateData.constituency_number &&
        updateData.constituency_number !== result.constituency_number) ||
      (updateData.election_year &&
        updateData.election_year !== result.election_year)
    ) {
      const newElectionYear = updateData.election_year || result.election_year;
      const newConstituencyNumber =
        updateData.constituency_number || result.constituency_number;

      const existingConstituency = await ConstituencyResult.findOne({
        election_year: newElectionYear,
        constituency_number: newConstituencyNumber,
        _id: { $ne: id },
      });

      if (existingConstituency) {
        return res.status(409).json({
          message: `Cannot update constituency number to ${newConstituencyNumber}. Constituency ${newConstituencyNumber} already exists for election year ${newElectionYear}`,
          error: "DUPLICATE_CONSTITUENCY",
          field: "constituency_number",
          attemptedValue: newConstituencyNumber,
          election_year: newElectionYear,
          existingConstituencyId: existingConstituency._id,
        });
      }
    }

    const updatedResult = await ConstituencyResult.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(
      `Constituency result updated: ${updatedResult.constituency_name} (${updatedResult.election_year}) by user ${req.user.id}`
    );

    res.json({
      message: "Constituency result updated successfully",
      result: updatedResult,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteConstituencyResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await ConstituencyResult.findById(id);
    if (!result) {
      throw new CustomError("Constituency result not found", 404);
    }

    await ConstituencyResult.findByIdAndDelete(id);

    logger.info(
      `Constituency result deleted: ${result.constituency_name} (${result.election_year}) by user ${req.user.id}`
    );

    res.json({
      message: "Constituency result deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
