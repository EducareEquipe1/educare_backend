function extractUsersFromText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

module.exports = extractUsersFromText ;
