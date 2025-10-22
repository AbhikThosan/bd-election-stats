const mongoose = require("mongoose");

const participantDetailSchema = new mongoose.Schema({
  candidate: {
    type: String,
    required: true,
    trim: true,
  },
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
  vote: {
    type: Number,
    required: true,
    min: 0,
  },
  percent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

const constituencyResultSchema = new mongoose.Schema({
  election: {
    type: Number,
    required: true,
    ref: "Election",
  },
  election_year: {
    type: Number,
    required: true,
  },
  constituency_number: {
    type: Number,
    required: true,
    min: 1,
  },
  constituency_name: {
    type: String,
    required: true,
    trim: true,
  },
  total_voters: {
    type: Number,
    required: true,
    min: 1,
  },
  total_centers: {
    type: Number,
    required: true,
    min: 1,
  },
  reported_centers: {
    type: Number,
    min: 0,
    default: null,
  },
  suspended_centers: {
    type: Number,
    min: 0,
    default: 0,
  },
  total_valid_votes: {
    type: Number,
    required: true,
    min: 0,
  },
  cancelled_votes: {
    type: Number,
    required: true,
    min: 0,
  },
  total_turnout: {
    type: Number,
    required: true,
    min: 0,
  },
  percent_turnout: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  participant_details: [participantDetailSchema],
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
constituencyResultSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure unique combination of election_year and constituency_number
constituencyResultSchema.index(
  { election_year: 1, constituency_number: 1 },
  { unique: true }
);

// Indexes for performance
constituencyResultSchema.index({ election_year: 1 });
constituencyResultSchema.index({ constituency_name: "text" });
constituencyResultSchema.index({ "participant_details.party": 1 });

module.exports = mongoose.model("ConstituencyResult", constituencyResultSchema);
