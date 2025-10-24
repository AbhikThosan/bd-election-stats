const mongoose = require("mongoose");

const participantInfoSchema = new mongoose.Schema({
  name: {
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
});

const centerSchema = new mongoose.Schema({
  election: {
    type: Number,
    required: true,
    ref: "Election",
  },
  election_year: {
    type: Number,
    required: true,
  },
  constituency_id: {
    type: Number,
    required: true,
  },
  constituency_name: {
    type: String,
    required: true,
    trim: true,
  },
  center_no: {
    type: Number,
    required: true,
    min: 1,
  },
  center: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "both"],
  },
  co_ordinate: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lon: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  map_link: {
    type: String,
    trim: true,
  },
  total_voters: {
    type: Number,
    required: true,
    min: 1,
  },
  participant_info: [participantInfoSchema],
  total_valid_votes: {
    type: Number,
    required: true,
    min: 0,
  },
  total_invalid_votes: {
    type: Number,
    required: true,
    min: 0,
  },
  total_votes_cast: {
    type: Number,
    required: true,
    min: 0,
  },
  turnout_percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
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
centerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure unique combination of election_year, constituency_id, and center_no
centerSchema.index(
  { election_year: 1, constituency_id: 1, center_no: 1 },
  { unique: true }
);

// Indexes for performance
centerSchema.index({ election_year: 1 });
centerSchema.index({ constituency_id: 1 });
centerSchema.index({ election_year: 1, constituency_id: 1 });
centerSchema.index({ center: "text" });
centerSchema.index({ gender: 1 });
centerSchema.index({ turnout_percentage: 1 });

// Virtual for calculating total candidate votes
centerSchema.virtual("total_candidate_votes").get(function () {
  return this.participant_info.reduce(
    (total, participant) => total + participant.vote,
    0
  );
});

// Ensure virtual fields are serialized
centerSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Center", centerSchema);
