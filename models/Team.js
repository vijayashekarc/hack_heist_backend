const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  regNo: { type: String, trim: true, required: true },
  email: {
    type: String,
    trim: true,
    required: true,
    validate: {
      validator: function (v) {
        return /@klu\.ac\.in$/.test(v);
      },
      message: (props) => `${props.value} is not a valid KLU email.`,
    },
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  year: {
    type: String,
    required: true,
    enum: ["2nd Year", "3rd Year", "4th Year"],
  },
  department: { type: String, trim: true, required: true },
  status: { type: String, required: true, enum: ["Hosteler", "Dayscholar"] },
});

// Unique index across documents for members.regNo
const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, trim: true, unique: true },
  members: {
    type: [memberSchema],
    validate: {
      validator: function (arr) {
        return arr && arr.length >= 3 && arr.length <= 4;
      },
      message: "Members must be between 3 and 4 (3 required, 1 optional).",
    },
  },
}, { timestamps: true });

teamSchema.index({ "members.regNo": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Team", teamSchema);
