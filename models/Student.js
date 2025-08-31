// backend/models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  regNo: { type: String, trim: true, required: true, unique: true },
  email: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: true },
  year: { type: String, required: true, enum: ["2nd Year", "3rd Year", "4th Year"] },
  department: { type: String, trim: true, required: true },
  status: { type: String, required: true, enum: ["Hosteler", "Dayscholar"] },
  teamName: { type: String, trim: true, required: true }, // optional link to team
}, { collection: "Student_List", timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
