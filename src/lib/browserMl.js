const SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go",
  "Rust", "SQL", "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express",
  "Django", "Flask", "Spring", ".NET", "Laravel", "Next.js", "REST API", "GraphQL",
  "PostgreSQL", "MySQL", "MongoDB", "Firebase", "Supabase", "Redis", "AWS", "Azure",
  "Google Cloud", "Docker", "Kubernetes", "Linux", "Git", "GitHub", "CI/CD",
  "Cybersecurity", "Networking", "Network Administration", "Technical Support",
  "Data Analysis", "Data Science", "Machine Learning", "Artificial Intelligence",
  "TensorFlow", "scikit-learn", "Power BI", "Tableau", "Excel", "Project Management",
  "Agile", "UI/UX", "Figma", "Software Testing", "Quality Assurance", "DevOps",
  "Cloud Computing", "Information Security", "System Administration",
];
const COURSE_KEYWORDS = [
  "developer", "programmer", "software", "web", "app", "application", "system", "systems",
  "network", "networking", "information technology", "database", "data", "cyber", "security",
  "cloud", "qa", "quality assurance", "tester", "engineer", "engineering", "support",
  "helpdesk", "help desk", "administrator", "admin", "analyst", "ui", "ux", "designer",
  "devops", "technician", "coder", "programming", "infrastructure", "technical",
];
const DIRECT_IT_ROLE_KEYWORDS = [
  "developer", "programmer", "software", "web", "app", "application", "system", "systems",
  "network", "networking", "information technology", "database", "cyber", "security", "cloud",
  "qa", "quality assurance", "tester", "engineer", "engineering", "helpdesk", "help desk",
  "devops", "coder", "programming", "infrastructure", "computer", "it",
];
const IT_ADJACENT_ROLE_KEYWORDS = [
  "data", "analyst", "administrator", "admin", "ui", "ux", "designer", "technical",
  "technician", "support",
];
const TRANSFERABLE_ROLE_KEYWORDS = [
  "sales", "cashier", "retail", "clerk", "receptionist", "customer service", "store",
  "office assistant", "secretary",
];
const DIGITAL_SKILL_SIGNALS = [
  ...SKILLS,
  "Computer", "Basic Computer", "Computer Skills", "Computer Literacy",
  "Computer Applications", "Microsoft Office", "Point of Sale", "POS Systems", "Data Entry",
];
const TOKEN_PATTERN = /[a-z0-9]+(?:[+#./-][a-z0-9+#./-]*)*/g;
const MAX_FEATURES = 400;
const STOP_WORDS = new Set(
  "a an and are as at be by for from has have in into is it of on or that the their this to was were will with".split(" "),
);

function clean(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text) {
  return clean(text).match(TOKEN_PATTERN) || [];
}

function profileText(person) {
  return clean([person.program, ...(person.skills || [])].join(" "));
}

function uniqueNormalizedSkills(skills) {
  const unique = new Map();
  for (const value of skills || []) {
    const skill = String(value).trim();
    const key = skill.toLowerCase();
    if (key && !unique.has(key)) unique.set(key, skill);
  }
  return [...unique.values()];
}

function jobText(job) {
  return clean([job.title, job.description, ...(job.skills || [])].join(" "));
}

function courseText(course) {
  return clean([
    course.title,
    course.program,
    course.description,
    ...(course.competencies || []),
  ].join(" "));
}

function extractSkills(text, vocabulary) {
  const normalized = clean(text);
  return [...vocabulary]
    .filter((skill) => {
      const term = clean(skill)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
      return term && new RegExp(`(^|[^a-z0-9])${term}($|[^a-z0-9])`).test(normalized);
    })
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function extractJobSkills(jobs, alumni = [], courses = []) {
  const vocabulary = new Set(SKILLS);
  alumni.forEach((person) => (person.skills || []).forEach((skill) => vocabulary.add(String(skill).trim())));
  jobs.forEach((job) => (job.skills || []).forEach((skill) => vocabulary.add(String(skill).trim())));
  courses.forEach((course) => (course.competencies || []).forEach((skill) => vocabulary.add(String(skill).trim())));
  return jobs.map((job) => ({
    jobId: String(job.id || ""),
    skills: extractSkills(jobText(job), vocabulary),
  }));
}

export function getDigitalSkillAlignment(profile) {
  const skills = uniqueNormalizedSkills(profile?.skills);
  const skillVocabulary = new Set(DIGITAL_SKILL_SIGNALS);
  const matchedSkills = skills.filter(
    (skill) => extractSkills(skill, skillVocabulary).length > 0,
  );
  const isEmployed = profile?.employed === "Employed" || profile?.employed === "Self Employed";
  const title = String(profile?.jobTitle || profile?.businessName || "").trim();
  const roleCategory = getRoleCategory(title);
  const score = !isEmployed
    ? 0
    : roleCategory === "direct"
      ? (skills.length ? Math.round((matchedSkills.length / skills.length) * 100) : 0)
      : Math.min(matchedSkills.length * 25, 100);

  return {
    score,
    matchedSkills,
    totalSkills: skills.length,
    roleCategory: isEmployed ? roleCategory : "none",
    isEmployed,
  };
}

function getRoleCategory(title) {
  if (!title) return "unrelated";
  const normalizedTitle = clean(title);
  const hasKeyword = (keyword) => {
    const expression = keyword.split(/\s+/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("\\s+");
    return new RegExp(`(^|[^a-z0-9])${expression}($|[^a-z0-9])`).test(normalizedTitle);
  };
  const category = DIRECT_IT_ROLE_KEYWORDS.some(hasKeyword)
    ? "direct"
    : IT_ADJACENT_ROLE_KEYWORDS.some(hasKeyword)
      ? "adjacent"
      : TRANSFERABLE_ROLE_KEYWORDS.some(hasKeyword) ? "transferable" : "unrelated";
  return category;
}

export function getCareerAlignment(profile) {
  const isEmployed = profile?.employed === "Employed" || profile?.employed === "Self Employed";
  const title = String(profile?.jobTitle || profile?.businessName || "").trim();
  if (!isEmployed || !title) {
    return { score: 0, title, isEmployed, category: "none" };
  }

  const category = getRoleCategory(title);
  const baseScore = {
    direct: 100,
    adjacent: 50,
    transferable: 10,
    unrelated: 10,
  }[category];
  const { matchedSkills } = getDigitalSkillAlignment(profile);
  const skillScore = Math.min(matchedSkills.length, 4) * 5;

  return {
    score: Math.min(baseScore + skillScore, 100),
    title,
    isEmployed,
    category,
  };
}

export function getJobMatchMetrics(profile, jobs) {
  const hasCurrentEmployment = profile?.employed === "Employed" || profile?.employed === "Self Employed";
  const roleTitle = String(profile?.jobTitle || "").trim();
  const roleTokens = new Set(tokens(roleTitle).filter((token) => !STOP_WORDS.has(token)));
  const skillsByJob = extractJobSkills(jobs);
  const profileSkills = new Set(
    uniqueNormalizedSkills(profile?.skills).map((skill) => skill.toLowerCase()),
  );
  const requiredSkills = new Set();
  let bestTitleCoverage = 0;
  const roleJobs = [];

  for (const job of skillsByJob) {
    const posting = jobs.find((item) => String(item.id || "") === job.jobId);
    const postingTokens = new Set(tokens(posting?.title).filter((token) => !STOP_WORDS.has(token)));
    if (!roleTokens.size || !postingTokens.size) continue;
    const sharedTokenCount = [...roleTokens].filter((token) => postingTokens.has(token)).length;
    const titleCoverage = sharedTokenCount / roleTokens.size;
    if (titleCoverage > bestTitleCoverage) {
      bestTitleCoverage = titleCoverage;
      roleJobs.length = 0;
    }
    if (titleCoverage === bestTitleCoverage && titleCoverage > 0) roleJobs.push(job);
  }

  for (const job of roleJobs) {
    for (const skill of job.skills) requiredSkills.add(skill.toLowerCase());
  }
  const matchedSkillCount = [...requiredSkills].filter((skill) => profileSkills.has(skill)).length;
  const matchedJobCount = roleJobs.filter((job) =>
    job.skills.some((skill) => profileSkills.has(skill.toLowerCase())),
  ).length;
  const eligibleJobCount = roleJobs.length;
  return {
    matchedJobCount,
    eligibleJobCount,
    matchedSkillCount,
    requiredSkillCount: requiredSkills.size,
    jobCoverage: !hasCurrentEmployment ? 0 : eligibleJobCount ? matchedJobCount / eligibleJobCount : null,
    skillCoverage: !hasCurrentEmployment ? 0 : requiredSkills.size ? matchedSkillCount / requiredSkills.size : null,
    roleTitle,
    bestTitleCoverage,
    hasCurrentEmployment,
    skillsByJob,
  };
}

export function isCourseRelatedTitle(title) {
  const normalized = clean(title);
  return COURSE_KEYWORDS.some((keyword) => {
    const phrase = keyword.split(/\s+/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
    return new RegExp(`(^|[^a-z0-9])${phrase}($|[^a-z0-9])`).test(normalized);
  });
}

export function rankJobMatches(matches) {
  return matches
    .map((match) => {
      const skillsNeeded = match.matchedSkills.length + match.missingSkills.length;
      const skillCoverage = skillsNeeded ? match.matchedSkills.length / skillsNeeded : null;
      const score = skillCoverage === null
        ? match.similarity
        : 0.7 * match.similarity + 0.3 * skillCoverage;
      return { ...match, skillCoverage, score };
    })
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score);
}

export function latestSurveyResponses(surveyResponses = []) {
  const latest = new Map();
  for (const response of surveyResponses) {
    if (!response.userId) continue;
    const previous = latest.get(response.userId);
    const date = Date.parse(response.updatedAt || response.submittedAt || "") || 0;
    const previousDate = Date.parse(previous?.updatedAt || previous?.submittedAt || "") || 0;
    if (!previous || date > previousDate) latest.set(response.userId, response);
  }
  return latest;
}

export function mergeLatestSurveyResponses(alumni, surveyResponses = []) {
  const latest = latestSurveyResponses(surveyResponses);
  const seen = new Set();
  return alumni.flatMap((alumnus) => {
    const survey = latest.get(alumnus.userId || "");
    const row = { ...alumnus };
    if (survey) {
      for (const key of ["employed", "jobTitle", "years", "skills"]) {
        if (Object.prototype.hasOwnProperty.call(survey, key)) {
          row[key] = survey[key];
        }
      }
    }
    const identity = String(row.userId || row.id || "");
    if (identity && seen.has(identity)) return [];
    if (identity) seen.add(identity);
    return [row];
  });
}

function latestAlumni(alumni, surveyResponses) {
  return mergeLatestSurveyResponses(alumni, surveyResponses);
}

function vectorize(documents) {
  const documentTokens = documents.map(tokens);
  const documentFrequency = new Map();
  for (const words of documentTokens) {
    for (const word of new Set(words)) {
      if (word.length > 1 && !STOP_WORDS.has(word)) {
        documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
      }
    }
  }
  const vocabulary = [...documentFrequency.keys()]
    .sort((a, b) => documentFrequency.get(b) - documentFrequency.get(a) || a.localeCompare(b))
    .slice(0, MAX_FEATURES);
  const allowed = new Set(vocabulary);
  const idf = new Map(vocabulary.map((word) => [
    word,
    Math.log((1 + documents.length) / (1 + documentFrequency.get(word))) + 1,
  ]));
  const transform = (texts) => texts.map((text) => {
    const words = tokens(text);
    const counts = new Map();
    for (const word of words) {
      if (allowed.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
    }
    let norm = 0;
    const vector = new Map();
    for (const [word, count] of counts) {
      const weight = (1 + Math.log(count)) * idf.get(word);
      vector.set(word, weight);
      norm += weight * weight;
    }
    const magnitude = Math.sqrt(norm);
    if (magnitude) {
      for (const [word, weight] of vector) vector.set(word, weight / magnitude);
    }
    return vector;
  });
  const vectors = documentTokens.map((words) => transform([words.join(" ")])[0]);
  return { vectors, vocabulary, transform };
}

function cosine(left, right) {
  let dot = 0;
  const [smaller, larger] = left.size <= right.size ? [left, right] : [right, left];
  for (const [word, weight] of smaller) dot += weight * (larger.get(word) || 0);
  return dot;
}

function stableMajority(labels) {
  const counts = new Map();
  for (const label of labels) counts.set(label, (counts.get(label) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

function gini(labels) {
  const counts = new Map();
  for (const label of labels) counts.set(label, (counts.get(label) || 0) + 1);
  return 1 - [...counts.values()].reduce((sum, count) => sum + (count / labels.length) ** 2, 0);
}

function trainTree(vectors, labels, features, depth = 0) {
  const prediction = stableMajority(labels);
  if (depth >= 4 || labels.length < 4 || new Set(labels).size === 1) {
    return { prediction };
  }
  let bestFeature = null;
  let bestGain = 0;
  const parentGini = gini(labels);
  for (const feature of features) {
    const left = [];
    const right = [];
    for (let index = 0; index < vectors.length; index += 1) {
      (vectors[index].has(feature) ? right : left).push(index);
    }
    if (!left.length || !right.length) continue;
    const weighted = (left.length * gini(left.map((i) => labels[i]))
      + right.length * gini(right.map((i) => labels[i]))) / labels.length;
    if (parentGini - weighted > bestGain) {
      bestGain = parentGini - weighted;
      bestFeature = feature;
    }
  }
  if (bestFeature === null) return { prediction };
  const leftIndexes = [];
  const rightIndexes = [];
  vectors.forEach((vector, index) => (vector.has(bestFeature) ? rightIndexes : leftIndexes).push(index));
  return {
    prediction,
    feature: bestFeature,
    left: trainTree(leftIndexes.map((i) => vectors[i]), leftIndexes.map((i) => labels[i]), features, depth + 1),
    right: trainTree(rightIndexes.map((i) => vectors[i]), rightIndexes.map((i) => labels[i]), features, depth + 1),
  };
}

function predictTree(tree, vector) {
  if (tree.feature === undefined) return tree.prediction;
  return predictTree(vector.has(tree.feature) ? tree.right : tree.left, vector);
}

function trainLogistic(vectors, labels, features) {
  const classes = [...new Set(labels)].sort();
  const positive = classes[1];
  const weights = new Map(features.map((feature) => [feature, 0]));
  let bias = 0;
  const counts = new Map(classes.map((label) => [label, labels.filter((item) => item === label).length]));
  for (let iteration = 0; iteration < 300; iteration += 1) {
    const weightGradient = new Map(features.map((feature) => [feature, 0]));
    let biasGradient = 0;
    for (let row = 0; row < vectors.length; row += 1) {
      let logit = bias;
      for (const [word, value] of vectors[row]) logit += (weights.get(word) || 0) * value;
      const probability = 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, logit))));
      const target = labels[row] === positive ? 1 : 0;
      const classWeight = labels[row] === positive
        ? labels.length / (2 * counts.get(positive))
        : labels.length / (2 * counts.get(classes[0]));
      const error = (probability - target) * classWeight / labels.length;
      biasGradient += error;
      for (const [word, value] of vectors[row]) {
        weightGradient.set(word, weightGradient.get(word) + error * value);
      }
    }
    const rate = 0.25 / (1 + iteration * 0.02);
    bias -= rate * biasGradient;
    for (const feature of features) {
      const next = weights.get(feature) - rate * (weightGradient.get(feature) + 0.01 * weights.get(feature));
      weights.set(feature, next);
    }
  }
  return { weights, bias, positive, negative: classes[0] };
}

function predictLogistic(model, vector) {
  let logit = model.bias;
  for (const [word, value] of vector) logit += (model.weights.get(word) || 0) * value;
  return 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, logit)))) >= 0.5
    ? model.positive
    : model.negative;
}

function foldsFor(labels) {
  const indexesByClass = new Map();
  labels.forEach((label, index) => {
    if (!indexesByClass.has(label)) indexesByClass.set(label, []);
    indexesByClass.get(label).push(index);
  });
  const foldCount = Math.min(5, ...[...indexesByClass.values()].map((indexes) => indexes.length));
  if (foldCount < 2) return [];
  const folds = Array.from({ length: foldCount }, () => []);
  let seed = 42;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (const indexes of indexesByClass.values()) {
    const shuffled = [...indexes];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    shuffled.forEach((item, index) => folds[index % foldCount].push(item));
  }
  return folds;
}

function classifierReport(records, labels, texts, kind, labelRule) {
  const counts = Object.fromEntries([...new Set(labels)].sort().map(
    (label) => [label, labels.filter((item) => item === label).length],
  ));
  const base = {
    model: kind === "cart" ? "DecisionTreeClassifier (CART)" : "LogisticRegression",
    sampleCount: records.length,
    classCounts: counts,
    targetDefinition: labelRule,
  };
  if (records.length < 4 || Object.keys(counts).length < 2 || Math.min(...Object.values(counts)) < 2) {
    return {
      ...base,
      status: "insufficient_data",
      message: "Need at least 4 labeled alumni and at least 2 examples in each class before training and cross-validating.",
      predictions: [],
      metrics: null,
    };
  }
  const folds = foldsFor(labels);
  const predictions = Array(records.length);
  for (const validation of folds) {
    const validationSet = new Set(validation);
    const training = labels.map((_, index) => index).filter((index) => !validationSet.has(index));
    const fitted = vectorize(training.map((index) => texts[index]));
    const { vectors, vocabulary } = fitted;
    const testVectors = fitted.transform(validation.map((index) => texts[index]));
    const trainLabels = training.map((index) => labels[index]);
    const model = kind === "cart"
      ? trainTree(vectors, trainLabels, vocabulary)
      : trainLogistic(vectors, trainLabels, vocabulary);
    validation.forEach((index, position) => {
      predictions[index] = kind === "cart"
        ? predictTree(model, testVectors[position])
        : predictLogistic(model, testVectors[position]);
    });
  }
  const classNames = Object.keys(counts);
  const confusion = classNames.map(() => classNames.map(() => 0));
  let correct = 0;
  let macroPrecision = 0;
  let macroRecall = 0;
  let macroF1 = 0;
  for (let index = 0; index < labels.length; index += 1) {
    const actualIndex = classNames.indexOf(labels[index]);
    const predictedIndex = classNames.indexOf(predictions[index]);
    confusion[actualIndex][predictedIndex] += 1;
    if (labels[index] === predictions[index]) correct += 1;
  }
  for (let index = 0; index < classNames.length; index += 1) {
    const tp = confusion[index][index];
    const fp = confusion.reduce((sum, row, rowIndex) => sum + (rowIndex === index ? 0 : row[index]), 0);
    const fn = confusion[index].reduce((sum, count, column) => sum + (column === index ? 0 : count), 0);
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    macroPrecision += precision / classNames.length;
    macroRecall += recall / classNames.length;
    macroF1 += (precision + recall ? 2 * precision * recall / (precision + recall) : 0) / classNames.length;
  }
  return {
    ...base,
    status: "trained",
    crossValidationFolds: folds.length,
    metrics: {
      accuracy: correct / labels.length,
      precisionMacro: macroPrecision,
      recallMacro: macroRecall,
      f1Macro: macroF1,
      confusionMatrix: { labels: classNames, values: confusion },
    },
    predictions: records.map((record, index) => ({
      alumniId: String(record.id || ""),
      userId: record.userId || "",
      actual: labels[index],
      predicted: predictions[index],
      correct: labels[index] === predictions[index],
    })),
  };
}

function clusterReport(records) {
  const usable = records.filter((record) => profileText(record));
  if (usable.length < 3) {
    return {
      status: "insufficient_data",
      sampleCount: usable.length,
      message: "At least 3 alumni with profile or career data are needed to cluster.",
      silhouetteScore: null,
      assignments: [],
    };
  }
  const { vectors } = vectorize(usable.map(profileText));
  if (new Set(vectors.map((vector) => [...vector].map(([word, value]) => `${word}:${value.toFixed(5)}`).join("|"))).size < 2) {
    return {
      status: "insufficient_data",
      sampleCount: usable.length,
      message: "Profiles do not contain enough variation to form meaningful clusters.",
      silhouetteScore: null,
      assignments: [],
    };
  }
  const maxClusters = Math.min(5, usable.length - 1);
  let best = null;
  for (let k = 2; k <= maxClusters; k += 1) {
    const averageDistance = vectors.map((vector, index) => ({
      index,
      distance: vectors.reduce((sum, other, otherIndex) => (
        sum + (otherIndex === index ? 0 : 1 - cosine(vector, other))
      ), 0),
    }));
    let centers = [new Map(vectors[averageDistance.sort((left, right) => right.distance - left.distance)[0].index])];
    while (centers.length < k) {
      let farthestIndex = 0;
      let farthestDistance = -1;
      vectors.forEach((vector, index) => {
        const distance = Math.min(...centers.map((center) => 1 - cosine(vector, center)));
        if (distance > farthestDistance) {
          farthestDistance = distance;
          farthestIndex = index;
        }
      });
      centers.push(new Map(vectors[farthestIndex]));
    }
    let assignments = Array(usable.length).fill(-1);
    for (let iteration = 0; iteration < 30; iteration += 1) {
      const next = vectors.map((vector) => {
        let winner = 0;
        let bestDistance = Infinity;
        centers.forEach((center, index) => {
          const distance = 1 - cosine(vector, center);
          if (distance < bestDistance) {
            winner = index;
            bestDistance = distance;
          }
        });
        return winner;
      });
      if (next.every((label, index) => label === assignments[index])) break;
      assignments = next;
      centers = centers.map((_, cluster) => {
        const members = vectors.filter((__, index) => assignments[index] === cluster);
        if (!members.length) return centers[cluster];
        const average = new Map();
        for (const member of members) {
          for (const [word, value] of member) average.set(word, (average.get(word) || 0) + value / members.length);
        }
        const magnitude = Math.sqrt([...average.values()].reduce((sum, value) => sum + value * value, 0));
        if (magnitude) for (const [word, value] of average) average.set(word, value / magnitude);
        return average;
      });
    }
    const clusterLabels = [...new Set(assignments)];
    if (clusterLabels.length < 2 || clusterLabels.length >= usable.length) continue;
    const score = vectors.reduce((total, vector, index) => {
      const own = vectors
        .filter((_, other) => other !== index && assignments[other] === assignments[index])
        .map((other) => 1 - cosine(vector, other));
      if (!own.length) return total;
      const a = own.reduce((sum, value) => sum + value, 0) / own.length;
      let b = Infinity;
      for (const otherCluster of clusterLabels) {
        if (otherCluster === assignments[index]) continue;
        const distances = vectors
          .filter((_, other) => assignments[other] === otherCluster)
          .map((other) => 1 - cosine(vector, other));
        const average = distances.reduce((sum, value) => sum + value, 0) / distances.length;
        b = Math.min(b, average);
      }
      return total + (b === Infinity ? 0 : (b - a) / Math.max(a, b, Number.EPSILON));
    }, 0) / vectors.length;
    if (best === null || score > best.score) best = { assignments, score, clusterCount: clusterLabels.length };
  }
  if (!best) {
    return {
      status: "insufficient_data",
      sampleCount: usable.length,
      message: "Profiles do not contain enough distinct patterns for clustering.",
      silhouetteScore: null,
      assignments: [],
    };
  }
  return {
    status: "trained",
    sampleCount: usable.length,
    clusterCount: best.clusterCount,
    silhouetteScore: best.score,
    assignments: usable.map((record, index) => ({
      alumniId: String(record.id || ""),
      userId: record.userId || "",
      cluster: best.assignments[index],
      program: record.program || "",
      employment: record.employed || "Unknown",
      jobTitle: record.jobTitle || "",
      skills: record.skills || [],
    })),
  };
}

export function analyzeInBrowser({ alumni: sourceAlumni = [], jobs = [], courses = [], surveyResponses = [] }) {
  const alumni = latestAlumni(sourceAlumni, surveyResponses)
    .filter((person) => !["pending", "rejected"].includes(person.verificationStatus));
  const vocabulary = new Set(SKILLS);
  alumni.forEach((person) => (person.skills || []).forEach((skill) => vocabulary.add(String(skill).trim())));
  jobs.forEach((job) => (job.skills || []).forEach((skill) => vocabulary.add(String(skill).trim())));
  courses.forEach((course) => (course.competencies || []).forEach((skill) => vocabulary.add(String(skill).trim())));

  const analyzedJobs = extractJobSkills(jobs, alumni, courses)
    .map((entry, index) => ({ ...entry, title: jobs[index].title || "" }));
  const analyzedCourses = courses.map((course) => ({
    courseId: String(course.id || ""),
    title: course.title || "",
    skills: extractSkills(courseText(course), vocabulary),
  }));
  const documents = [
    ...alumni.map(profileText),
    ...jobs.map(jobText),
    ...courses.map(courseText),
  ];
  const { vectors } = vectorize(documents);
  const jobMatches = [];
  const demand = new Map();
  jobs.forEach((job, jobIndex) => {
    const jobSkills = analyzedJobs[jobIndex].skills;
    for (const skill of jobSkills) demand.set(skill.toLowerCase(), (demand.get(skill.toLowerCase()) || 0) + 1);
    alumni.forEach((person, personIndex) => {
      if (!person.id && !person.userId) return;
      const skills = new Set(uniqueNormalizedSkills(person.skills).map((skill) => skill.toLowerCase()));
      jobMatches.push({
        alumniId: String(person.id || ""),
        userId: person.userId || "",
        jobId: String(job.id || ""),
        title: job.title || "",
        similarity: cosine(vectors[personIndex], vectors[alumni.length + jobIndex]),
        matchedSkills: jobSkills.filter((skill) => skills.has(skill.toLowerCase())),
        missingSkills: jobSkills.filter((skill) => !skills.has(skill.toLowerCase())),
      });
    });
  });
  jobMatches.sort((left, right) => right.similarity - left.similarity);

  const courseMatches = [];
  courses.forEach((course, courseIndex) => alumni.forEach((person, personIndex) => {
    if ((!person.id && !person.userId)
      || (course.program && person.program && course.program.toLowerCase() !== person.program.toLowerCase())) return;
    courseMatches.push({
      alumniId: String(person.id || ""),
      userId: person.userId || "",
      courseId: String(course.id || ""),
      courseTitle: course.title || "",
      program: course.program || "",
      similarity: cosine(vectors[personIndex], vectors[alumni.length + jobs.length + courseIndex]),
    });
  }));
  courseMatches.sort((left, right) => right.similarity - left.similarity);

  const recommendations = [];
  for (const person of alumni) {
    const profileSkills = new Set((person.skills || []).map((skill) => String(skill).toLowerCase()));
    for (const [key, count] of [...demand].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))) {
      if (profileSkills.has(key)) continue;
      const skill = [...vocabulary].find((item) => item.toLowerCase() === key) || key;
      recommendations.push({
        alumniId: String(person.id || ""),
        userId: person.userId || "",
        skill,
        demand: count,
        courses: courses.filter((course, index) => analyzedCourses[index].skills.some((item) => item.toLowerCase() === key)
          && (!course.program || !person.program || course.program.toLowerCase() === person.program.toLowerCase()))
          .slice(0, 3)
          .map((course) => ({ courseId: String(course.id || ""), title: course.title || "" })),
      });
    }
  }

  const alignmentRecords = alumni.filter((person) => person.jobTitle?.trim()
    && ["Employed", "Self Employed"].includes(person.employed));
  const alignmentLabels = alignmentRecords.map((person) => isCourseRelatedTitle(person.jobTitle)
    ? "Aligned"
    : "Not aligned");
  const cart = classifierReport(
    alignmentRecords,
    alignmentLabels,
    alignmentRecords.map((person) => clean([person.program, ...(person.skills || [])].join(" "))),
    "cart",
    "Course-related job-title keyword label; see the existing COURSE_KEYWORDS rule.",
  );
  const employmentRecords = alumni.filter((person) => ["Employed", "Self Employed", "Unemployed"].includes(person.employed));
  const employmentLabels = employmentRecords.map((person) => person.employed === "Unemployed" ? "Unemployed" : "Employed");
  const logisticRegression = classifierReport(
    employmentRecords,
    employmentLabels,
    employmentRecords.map((person) => clean([person.program, person.gradYear, ...(person.skills || [])].join(" "))),
    "logistic",
    "Current survey employment status; job title and duration are excluded from predictors.",
  );

  return {
    sampleCount: alumni.length,
    analysisMode: "browser",
    techniques: {
      nlp: {
        status: "ready",
        jobsProcessed: jobs.length,
        skillsExtracted: analyzedJobs.reduce((sum, job) => sum + job.skills.length, 0),
        jobs: analyzedJobs,
        coursesProcessed: courses.length,
        courseSkillsExtracted: analyzedCourses.reduce((sum, course) => sum + course.skills.length, 0),
        courses: analyzedCourses,
      },
      tfidfCosine: {
        status: "ready",
        jobMatches,
        courseMatches,
        recommendations,
        courseCatalogCount: courses.length,
      },
      cart,
      kmeans: clusterReport(alumni),
      logisticRegression,
    },
  };
}
