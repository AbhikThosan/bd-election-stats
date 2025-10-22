const mongoose = require("mongoose");

const partyDetailSchema = new mongoose.Schema({
  party: {
    type: String,
    required: true,
    trim: true,
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
  },
  vote_obtained: {
    type: Number,
    required: true,
    min: 0,
  },
  percent_vote_obtain: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  seat_obtain: {
    type: Number,
    required: true,
    min: 0,
  },
  percent_seat_obtain: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

const electionSchema = new mongoose.Schema({
  election: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
  },
  election_year: {
    type: Number,
    required: true,
    unique: true,
    min: 1970,
    max: 2030,
  },
  total_constituencies: {
    type: Number,
    required: true,
    min: 1,
    max: 500,
  },
  status: {
    type: String,
    enum: ["scheduled", "ongoing", "completed"],
    default: "completed",
  },
  total_valid_vote: {
    type: Number,
    required: true,
    min: 0,
  },
  cancelled_vote: {
    type: Number,
    required: true,
    min: 0,
  },
  total_vote_cast: {
    type: Number,
    required: true,
    min: 0,
  },
  percent_valid_vote: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  percent_cancelled_vote: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  percent_total_vote_cast: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  participant_details: [partyDetailSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt timestamp on save
electionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Election", electionSchema);
