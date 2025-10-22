const mongoose = require("mongoose");

const errorDetailSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
  },
  value: mongoose.Schema.Types.Mixed,
  message: {
    type: String,
    required: true,
  },
});

const rowErrorSchema = new mongoose.Schema({
  row_number: {
    type: Number,
    required: true,
  },
  constituency_number: {
    type: Number,
  },
  constituency_name: {
    type: String,
  },
  errors: [errorDetailSchema],
});

const bulkUploadSchema = new mongoose.Schema({
  upload_id: {
    type: String,
    unique: true,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  election_year: {
    type: Number,
    required: true,
  },
  file_name: {
    type: String,
    required: true,
  },
  file_size: {
    type: Number,
    required: true,
  },
  total_rows: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["uploaded", "processing", "completed", "failed", "cancelled"],
    default: "uploaded",
  },
  progress: {
    processed: {
      type: Number,
      default: 0,
    },
    successful: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    duplicates: {
      type: Number,
      default: 0,
    },
    updated: {
      type: Number,
      default: 0,
    },
  },
  validation_errors: [rowErrorSchema],
  processing_time: {
    type: Number, // in seconds
  },
  options: {
    overwrite_existing: {
      type: Boolean,
      default: false,
    },
    validate_only: {
      type: Boolean,
      default: false,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  completed_at: {
    type: Date,
  },
});

// Index for fast lookups
bulkUploadSchema.index({ user_id: 1 });
bulkUploadSchema.index({ status: 1 });

module.exports = mongoose.model("BulkUpload", bulkUploadSchema);
