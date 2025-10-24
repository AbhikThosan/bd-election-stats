const Center = require("../models/Center");
const Election = require("../models/Election");
const ConstituencyResult = require("../models/ConstituencyResult");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");

exports.createCenter = async (req, res, next) => {
  try {
    const centerData = req.body;

    // Validate election exists
    const election = await Election.findOne({
      election: centerData.election,
      election_year: centerData.election_year,
    });
    if (!election) {
      throw new CustomError("Election not found", 404);
    }

    // Validate constituency exists
    const constituency = await ConstituencyResult.findOne({
      election_year: centerData.election_year,
      constituency_number: centerData.constituency_id,
    });
    if (!constituency) {
      throw new CustomError("Constituency not found", 404);
    }

    // Check for duplicate center in same election year and constituency
    const existingCenter = await Center.findOne({
      election_year: centerData.election_year,
      constituency_id: centerData.constituency_id,
      center_no: centerData.center_no,
    });

    if (existingCenter) {
      return res.status(409).json({
        message: `Center ${centerData.center_no} already exists for constituency ${centerData.constituency_id} in election year ${centerData.election_year}`,
        error: "DUPLICATE_CENTER",
        field: "center_no",
        election_year: centerData.election_year,
        constituency_id: centerData.constituency_id,
        center_no: centerData.center_no,
        existingCenter: existingCenter.center,
      });
    }

    const newCenter = new Center(centerData);
    await newCenter.save();

    logger.info(
      `Center created: ${centerData.center} (${centerData.election_year}) by user ${req.user.id}`
    );

    res.status(201).json({
      message: "Center added successfully",
      center: newCenter,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCenter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const center = await Center.findById(id);
    if (!center) {
      throw new CustomError("Center not found", 404);
    }

    // Check for duplicate center if updating center_no, constituency_id, or election_year
    if (
      (updateData.center_no && updateData.center_no !== center.center_no) ||
      (updateData.constituency_id &&
        updateData.constituency_id !== center.constituency_id) ||
      (updateData.election_year &&
        updateData.election_year !== center.election_year)
    ) {
      const newElectionYear = updateData.election_year || center.election_year;
      const newConstituencyId =
        updateData.constituency_id || center.constituency_id;
      const newCenterNo = updateData.center_no || center.center_no;

      const existingCenter = await Center.findOne({
        election_year: newElectionYear,
        constituency_id: newConstituencyId,
        center_no: newCenterNo,
        _id: { $ne: id },
      });

      if (existingCenter) {
        return res.status(409).json({
          message: `Cannot update center number to ${newCenterNo}. Center ${newCenterNo} already exists for constituency ${newConstituencyId} in election year ${newElectionYear}`,
          error: "DUPLICATE_CENTER",
          field: "center_no",
          attemptedValue: newCenterNo,
          election_year: newElectionYear,
          constituency_id: newConstituencyId,
          existingCenterId: existingCenter._id,
        });
      }
    }

    const updatedCenter = await Center.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    logger.info(
      `Center updated: ${updatedCenter.center} (${updatedCenter.election_year}) by user ${req.user.id}`
    );

    res.json({
      message: "Center updated successfully",
      center: updatedCenter,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCenter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const center = await Center.findById(id);
    if (!center) {
      throw new CustomError("Center not found", 404);
    }

    await Center.findByIdAndDelete(id);

    logger.info(
      `Center deleted: ${center.center} (${center.election_year}) by user ${req.user.id}`
    );

    res.json({
      message: "Center deleted successfully",
    });
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
        participant_info co_ordinate map_link
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
