const pdfParse = require("pdf-parse");
const extractUsersFromText = require("../utils/pdfParser");


router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(fileBuffer);

    const users = extractUsersFromText(data.text);

    const results = [];

    for (const user of users) {
      try {
        // Replace with your registration logic
        await registerUser(user);
        results.push({ user: user.email, status: 'success' });
      } catch (err) {
        results.push({ user: user.email, status: 'failed', error: err.message });
      }
    }

    res.json({ message: 'Processing complete', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
