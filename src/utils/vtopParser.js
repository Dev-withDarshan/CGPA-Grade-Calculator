const COURSE_TYPES = [
  "Theory Only",
  "Lab Only",
  "Online Course",
  "Embedded Theory and Lab",
  "Soft Skill"
];

export function parseVtopText(text) {
  const lines = text.split("\n");
  const VALID_GRADES = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'N'];

  const subjects = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!/^\d+/.test(trimmed)) return; // only rows starting with number

    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 9) return; // ignore incomplete rows

    // 👉 Extract from RIGHT
    const grade = tokens[tokens.length - 1].toUpperCase();

    // Validate grade
    if (!VALID_GRADES.includes(grade)) {
      return; // Skip non-graded or invalid grade rows (like P)
    }

    const c = parseFloat(tokens[tokens.length - 4]); // Credits (C)
    if (isNaN(c)) return;

    const courseCode = tokens[1];

    // 👉 MIDDLE PART (title + type)
    const middle = tokens.slice(2, tokens.length - 7).join(" ");

    let courseType = "";
    let courseTitle = middle;

    for (let type of COURSE_TYPES) {
      if (middle.includes(type)) {
        courseType = type;
        courseTitle = middle.replace(type, "").trim();
        break;
      }
    }

    const isLab = courseType === "Lab Only" || courseCode.endsWith("P") || courseTitle.toLowerCase().includes("lab");
    const type = isLab ? "lab" : "theory";

    subjects.push({
      id: crypto.randomUUID(),
      name: courseTitle,
      credits: c,
      grade: grade,
      type: type
    });
  });

  return subjects;
}

export function parseVtopTimetable(text) {
  const lines = text.split("\n");
  const subjects = [];

  const TIMETABLE_COURSE_TYPES = [
    "Embedded Theory and Lab",
    "Embedded Theory and Project",
    "Embedded Lab and Project",
    "Theory Only",
    "Lab Only",
    "Project Only",
    "Online Course",
    "Soft Skill"
  ];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Try parsing with tabs first
    if (trimmed.includes("\t")) {
      const tokens = trimmed.split("\t");
      if (tokens.length >= 10) {
        const courseCode = tokens[2]?.trim();
        const courseTitle = tokens[3]?.trim();
        const courseType = tokens[4]?.trim();
        const credits = parseFloat(tokens[9]?.trim());

        if (courseCode && courseTitle && !isNaN(credits)) {
          const isLab = courseType === "Lab Only" || courseCode.endsWith("P") || courseTitle.toLowerCase().includes("lab");
          const type = isLab ? "lab" : "theory";

          subjects.push({
            id: crypto.randomUUID(),
            name: courseTitle,
            credits: credits,
            grade: 'S',
            type: type
          });
          return;
        }
      }
    }

    // Fallback: If no tabs, split by regex / spaces
    const codeMatch = trimmed.match(/\b([A-Z]{3,4}\d{3,4}[A-Z]?)\b/i);
    if (!codeMatch) return;

    const courseCode = codeMatch[1].toUpperCase();
    const codeIndex = trimmed.indexOf(codeMatch[1]);

    let foundType = "";
    let foundTypeIdx = -1;

    for (let type of TIMETABLE_COURSE_TYPES) {
      const idx = trimmed.toLowerCase().indexOf(type.toLowerCase());
      if (idx !== -1 && idx > codeIndex) {
        foundType = type;
        foundTypeIdx = idx;
        break;
      }
    }

    let courseTitle = "";
    let credits = 3.0;

    if (foundTypeIdx !== -1) {
      courseTitle = trimmed.substring(codeIndex + courseCode.length, foundTypeIdx).trim();
      const afterType = trimmed.substring(foundTypeIdx + foundType.length).trim();
      const tokensAfter = afterType.split(/\s+/);
      if (tokensAfter.length >= 5) {
        const potentialCredits = parseFloat(tokensAfter[4]);
        if (!isNaN(potentialCredits)) {
          credits = potentialCredits;
        }
      }
    } else {
      const afterCode = trimmed.substring(codeIndex + courseCode.length).trim();
      const tokens = afterCode.split(/\s+/);
      if (tokens.length > 0) {
        let titleParts = [];
        for (let token of tokens) {
          if (/^\d/.test(token) || token.includes("+")) {
            break;
          }
          titleParts.push(token);
        }
        courseTitle = titleParts.join(" ").trim();
      }
    }

    if (!courseTitle) {
      courseTitle = courseCode;
    }

    const isLab = foundType === "Lab Only" || courseCode.endsWith("P") || courseTitle.toLowerCase().includes("lab");
    const type = isLab ? "lab" : "theory";

    subjects.push({
      id: crypto.randomUUID(),
      name: courseTitle,
      credits: credits,
      grade: 'S',
      type: type
    });
  });

  return subjects;
}

export function parseVTOPData(text) {
  // Step 1: Split into blocks using course code pattern
  const blocks = text.split(/\n(?=\d+\s*\n)/); // split at Sl.No

  const subjects = [];

  blocks.forEach(block => {
    // Extract CODE + NAME
    const courseMatch = block.match(/([A-Z]{4}\d{3}[A-Z])\s*-\s*(.+)/);

    if (!courseMatch) return;

    const code = courseMatch[1];
    let name = courseMatch[2].trim();

    // Extract TYPE
    let type = "theory";
    if (/\(.*Lab.*\)/i.test(block)) {
      type = "lab";
    }

    // Extract CREDITS (first decimal number in block after course code to avoid matching digits inside the code)
    const afterCode = block.substring(block.indexOf(code) + code.length);
    const creditMatch = afterCode.match(/\b\d+(\.\d+)?\b/);
    const credits = creditMatch ? parseFloat(creditMatch[0]) : 0;

    subjects.push({
      id: crypto.randomUUID(),
      name,
      credits,
      grade: 'S',
      type,
      code
    });
  });

  return subjects;
}
