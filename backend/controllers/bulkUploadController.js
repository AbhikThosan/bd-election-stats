const multer = require("multer");
const XLSX = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const ConstituencyResult = require("../models/ConstituencyResult");
const BulkUpload = require("../models/BulkUpload");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new CustomError(
          "Invalid file type. Only Excel and CSV files are allowed",
          400
        )
      );
    }
  },
});

exports.uploadMiddleware = upload.single("file");

exports.uploadBulkData = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    const {
      election_year,
      overwrite_existing = false,
      validate_only = false,
    } = req.body;

    // Manual validation
    if (!election_year) {
      throw new CustomError("Election year is required", 400);
    }

    const electionYearInt = parseInt(election_year);
    if (
      isNaN(electionYearInt) ||
      electionYearInt < 1970 ||
      electionYearInt > 2030
    ) {
      throw new CustomError("Election year must be between 1970 and 2030", 400);
    }

    const uploadId = `bulk_upload_${uuidv4()}`;

    // Create bulk upload record
    const bulkUpload = new BulkUpload({
      upload_id: uploadId,
      user_id: req.user.id,
      election_year: electionYearInt,
      file_name: req.file.originalname,
      file_size: req.file.size,
      total_rows: 0, // Will be updated after parsing
      options: {
        overwrite_existing: overwrite_existing === "true",
        validate_only: validate_only === "true",
      },
    });

    await bulkUpload.save();

    // Start processing in background
    processBulkUpload(bulkUpload, req.file.path).catch((error) => {
      logger.error("Bulk upload processing error:", error);
    });

    res.status(202).json({
      message: "File uploaded successfully",
      upload_id: uploadId,
      status: "processing",
      estimated_time: "2-5 minutes",
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

exports.getUploadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bulkUpload = await BulkUpload.findOne({ upload_id: id });
    if (!bulkUpload) {
      throw new CustomError("Upload not found", 404);
    }

    // Calculate progress percentage
    const progressPercentage =
      bulkUpload.total_rows > 0
        ? Math.round(
            (bulkUpload.progress.processed / bulkUpload.total_rows) * 100
          )
        : 0;

    const response = {
      upload_id: bulkUpload.upload_id,
      status: bulkUpload.status,
      progress: {
        processed: bulkUpload.progress.processed,
        total: bulkUpload.total_rows,
        percentage: progressPercentage,
      },
      summary: {
        successful_inserts: bulkUpload.progress.successful,
        updated_records: bulkUpload.progress.updated,
        skipped_duplicates: bulkUpload.progress.duplicates,
        validation_errors: bulkUpload.progress.failed,
      },
    };

    if (bulkUpload.status === "completed") {
      response.processing_time = bulkUpload.processing_time;
      response.completed_at = bulkUpload.completed_at;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.getUploadErrors = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bulkUpload = await BulkUpload.findOne({ upload_id: id });
    if (!bulkUpload) {
      throw new CustomError("Upload not found", 404);
    }

    const errorSummary = {
      total_errors: bulkUpload.validation_errors.length,
      duplicate_errors: bulkUpload.validation_errors.filter((e) =>
        e.errors.some((err) => err.message.includes("already exists"))
      ).length,
      validation_errors: bulkUpload.validation_errors.filter((e) =>
        e.errors.some((err) => !err.message.includes("already exists"))
      ).length,
    };

    res.json({
      upload_id: bulkUpload.upload_id,
      validation_errors: bulkUpload.validation_errors,
      error_summary: errorSummary,
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadTemplate = async (req, res, next) => {
  try {
    const { format } = req.params;

    if (!["excel", "csv"].includes(format)) {
      throw new CustomError("Invalid format. Use 'excel' or 'csv'", 400);
    }

    // Create template data
    const templateData = [
      {
        election: 7,
        election_year: 1996,
        constituency_number: 201,
        constituency_name: "example-constituency",
        total_voters: 100000,
        total_centers: 50,
        reported_centers: 50,
        suspended_centers: 0,
        total_valid_votes: 75000,
        cancelled_votes: 1000,
        total_turnout: 76000,
        percent_turnout: 76.0,
        candidate_1_name: "Example Candidate 1",
        candidate_1_party: "Example Party 1",
        candidate_1_symbol: "Example Symbol 1",
        candidate_1_vote: 45000,
        candidate_1_percent: 60.0,
        candidate_2_name: "Example Candidate 2",
        candidate_2_party: "Example Party 2",
        candidate_2_symbol: "Example Symbol 2",
        candidate_2_vote: 30000,
        candidate_2_percent: 40.0,
      },
    ];

    if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=constituency_results_template.xlsx"
      );
      res.send(buffer);
    } else {
      // CSV format
      const csvContent = convertToCSV(templateData);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=constituency_results_template.csv"
      );
      res.send(csvContent);
    }
  } catch (error) {
    next(error);
  }
};

// Helper function to process bulk upload
async function processBulkUpload(bulkUpload, filePath) {
  const startTime = Date.now();

  try {
    bulkUpload.status = "processing";
    await bulkUpload.save();

    // Parse file based on extension
    const fileExtension = path.extname(bulkUpload.file_name).toLowerCase();
    let rows = [];

    if (fileExtension === ".csv") {
      rows = await parseCSV(filePath);
    } else {
      rows = await parseExcel(filePath);
    }

    bulkUpload.total_rows = rows.length;
    await bulkUpload.save();

    // Process rows in batches
    const batchSize = 50;
    const errors = [];
    let successful = 0;
    let updated = 0;
    let duplicates = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j;
        const row = batch[j];

        try {
          // Validate row data
          const validationErrors = validateRowData(row, rowIndex + 1);
          if (validationErrors.length > 0) {
            errors.push({
              row_number: rowIndex + 1,
              constituency_number: row.constituency_number,
              constituency_name: row.constituency_name,
              errors: validationErrors,
            });
            bulkUpload.progress.failed++;
            continue;
          }

          // Check for duplicates
          const existing = await ConstituencyResult.findOne({
            election_year: bulkUpload.election_year,
            constituency_number: row.constituency_number,
          });

          if (existing) {
            if (bulkUpload.options.overwrite_existing) {
              // Update existing record
              await ConstituencyResult.findByIdAndUpdate(
                existing._id,
                transformRowData(row)
              );
              updated++;
              bulkUpload.progress.updated++;
            } else {
              // Skip duplicate
              duplicates++;
              bulkUpload.progress.duplicates++;
            }
          } else {
            // Create new record
            const newResult = new ConstituencyResult(transformRowData(row));
            await newResult.save();
            successful++;
            bulkUpload.progress.successful++;
          }
        } catch (error) {
          errors.push({
            row_number: rowIndex + 1,
            constituency_number: row.constituency_number,
            constituency_name: row.constituency_name,
            errors: [{ field: "general", message: error.message }],
          });
          bulkUpload.progress.failed++;
        }

        bulkUpload.progress.processed++;
      }

      // Update progress
      await bulkUpload.save();
    }

    // Update final status
    bulkUpload.status = "completed";
    bulkUpload.validation_errors = errors;
    bulkUpload.processing_time = Math.round((Date.now() - startTime) / 1000);
    bulkUpload.completed_at = new Date();
    await bulkUpload.save();

    logger.info(
      `Bulk upload completed: ${bulkUpload.upload_id}, ${successful} successful, ${updated} updated, ${duplicates} duplicates, ${errors.length} errors`
    );
  } catch (error) {
    bulkUpload.status = "failed";
    bulkUpload.validation_errors = [
      {
        row_number: 0,
        errors: [{ field: "general", message: error.message }],
      },
    ];
    await bulkUpload.save();
    logger.error("Bulk upload failed:", error);
  } finally {
    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// Helper functions
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

function validateRowData(row, rowNumber) {
  const errors = [];

  // Required fields
  const requiredFields = [
    "election",
    "election_year",
    "constituency_number",
    "constituency_name",
    "total_voters",
    "total_centers",
    "total_valid_votes",
    "cancelled_votes",
    "total_turnout",
    "percent_turnout",
  ];

  requiredFields.forEach((field) => {
    if (!row[field] || row[field] === "") {
      errors.push({ field, message: `${field} is required` });
    }
  });

  // Numeric validations
  if (row.total_voters && (isNaN(row.total_voters) || row.total_voters <= 0)) {
    errors.push({
      field: "total_voters",
      message: "Total voters must be a positive number",
    });
  }

  if (
    row.total_valid_votes &&
    (isNaN(row.total_valid_votes) || row.total_valid_votes < 0)
  ) {
    errors.push({
      field: "total_valid_votes",
      message: "Total valid votes must be a non-negative number",
    });
  }

  // Candidate validation
  let candidateCount = 0;
  for (let i = 1; i <= 10; i++) {
    if (row[`candidate_${i}`] && row[`candidate_${i}`].trim()) {
      candidateCount++;
      if (
        !row[`vote_${i}`] ||
        isNaN(row[`vote_${i}`]) ||
        row[`vote_${i}`] < 0
      ) {
        errors.push({
          field: `vote_${i}`,
          message: `Candidate ${i} vote must be a non-negative number`,
        });
      }
    }
  }

  if (candidateCount < 2) {
    errors.push({
      field: "participant_details",
      message: "At least 2 candidates are required",
    });
  }

  return errors;
}

function transformRowData(row) {
  const participantDetails = [];

  for (let i = 1; i <= 10; i++) {
    if (row[`candidate_${i}`] && row[`candidate_${i}`].trim()) {
      participantDetails.push({
        candidate: row[`candidate_${i}`].trim(),
        party: row[`party_${i}`]?.trim() || "",
        symbol: row[`symbol_${i}`]?.trim() || "",
        vote: parseInt(row[`vote_${i}`]) || 0,
        percent: parseFloat(row[`percent_${i}`]) || 0,
      });
    }
  }

  return {
    election: parseInt(row.election),
    election_year: parseInt(row.election_year),
    constituency_number: parseInt(row.constituency_number),
    constituency_name: row.constituency_name.trim(),
    total_voters: parseInt(row.total_voters),
    total_centers: parseInt(row.total_centers),
    reported_centers: row.reported_centers
      ? parseInt(row.reported_centers)
      : null,
    suspended_centers: parseInt(row.suspended_centers) || 0,
    total_valid_votes: parseInt(row.total_valid_votes),
    cancelled_votes: parseInt(row.cancelled_votes),
    total_turnout: parseInt(row.total_turnout),
    percent_turnout: parseFloat(row.percent_turnout),
    participant_details: participantDetails,
  };
}

function convertToCSV(data) {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
