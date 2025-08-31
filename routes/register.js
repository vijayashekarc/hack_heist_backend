const express = require("express");
const Team = require("../models/Team");
const Student = require("../models/Student"); // NEW
const router = express.Router();

// POST /api/register
router.post("/", async (req, res) => {
  try {
    const { teamName, members } = req.body;

    // Basic checks
    if (!teamName || typeof teamName !== "string") {
      return res.status(400).json({ success: false, message: "Team name required" });
    }
    if (!Array.isArray(members) || members.length < 3) {
      return res.status(400).json({ success: false, message: "At least 3 members required" });
    }
    if (members.length > 4) {
      return res.status(400).json({ success: false, message: "Maximum 4 members allowed" });
    }

    // Global team limit
    const totalTeams = await Team.countDocuments();
    if (totalTeams >= 40) {
      return res.status(400).json({ success: false, message: "Registration closed: 40 teams already registered." });
    }

    // Team name uniqueness
    const existingTeam = await Team.findOne({ teamName: teamName.trim() });
    if (existingTeam) {
      return res.status(400).json({ success: false, message: "Team name already taken" });
    }

    // Validate each member
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name || !m.regNo || !m.email || !m.phone || !m.year || !m.department || !m.status) {
        return res.status(400).json({ success: false, message: `Member ${i + 1} is missing required fields.` });
      }
      if (!/@klu\.ac\.in$/.test(m.email)) {
        return res.status(400).json({ success: false, message: `${m.email} is not a valid KLU email.` });
      }
      if (!/^\d{10}$/.test(m.phone)) {
        return res.status(400).json({ success: false, message: `Phone for member ${i + 1} must be 10 digits.` });
      }
      if (!["2nd Year", "3rd Year", "4th Year"].includes(m.year)) {
        return res.status(400).json({ success: false, message: `Invalid year for member ${i + 1}` });
      }
      if (!["Hosteler", "Dayscholar"].includes(m.status)) {
        return res.status(400).json({ success: false, message: `Invalid status for member ${i + 1}` });
      }
    }

    // Check regNo uniqueness across existing teams
    for (let i = 0; i < members.length; i++) {
      const regNo = members[i].regNo.trim();
      const found = await Team.findOne({ "members.regNo": regNo });
      if (found) {
        return res.status(400).json({ success: false, message: `Registration number ${regNo} already exists.` });
      }
    }

    // Save team
    const team = new Team({
      teamName: teamName.trim(),
      members: members.map(m => ({
        name: m.name.trim(),
        regNo: m.regNo.trim(),
        email: m.email.trim(),
        phone: m.phone.trim(),
        year: m.year,
        department: m.department.trim(),
        status: m.status,
      }))
    });

    await team.save();

    // --- NEW: Save each member to Student_List if not exists ---
    const studentsToInsert = [];
    for (const m of members) {
      const exists = await Student.findOne({ regNo: m.regNo.trim() });
      if (!exists) {
        studentsToInsert.push({
          name: m.name.trim(),
          regNo: m.regNo.trim(),
          email: m.email.trim(),
          phone: m.phone.trim(),
          year: m.year,
          department: m.department.trim(),
          status: m.status,
          teamName: teamName.trim(),
        });
      }
    }

    if (studentsToInsert.length > 0) {
      await Student.insertMany(studentsToInsert);
    }

    return res.status(201).json({ success: true, message: "Team registered successfully." });

  } catch (saveErr) {
    if (saveErr.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate value detected (teamName or regNo)" });
    }
    return res.status(500).json({ success: false, message: "Failed to save team.", error: saveErr.message });
  }
});

// ...rest of routes unchanged



// Check regNo availability
router.get("/check-reg/:regNo", async (req, res) => {
  try {
    const { regNo } = req.params;
    if (!regNo) return res.status(400).json({ exists: false, message: "regNo required" });
    const found = await Team.findOne({ "members.regNo": regNo.trim() });
    res.json({ exists: !!found });
  } catch (err) {
    res.status(500).json({ exists: false, message: "Server error" });
  }
});

// Check team name availability
router.get("/check-team/:teamName", async (req, res) => {
  try {
    const { teamName } = req.params;
    if (!teamName) return res.status(400).json({ exists: false, message: "teamName required" });
    const found = await Team.findOne({ teamName: teamName.trim() });
    res.json({ exists: !!found });
  } catch (err) {
    res.status(500).json({ exists: false, message: "Server error" });
  }
});

// Get team count
router.get("/count", async (req, res) => {
  try {
    const count = await Team.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
