const PorterStemmer = require('natural/lib/natural/stemmers/porter_stemmer');
const { WordTokenizer } = require('natural/lib/natural/tokenizers/regexp_tokenizer');
const stopwords = require('natural/lib/natural/util/stopwords');
const Vulnerability = require('../models/Vulnerability');
const Setting = require('../models/Setting');
const { VULN_STATUSES } = require('../config/constants');
const logger = require('../utils/logger');

const tokenizer = new WordTokenizer();
const stopwordSet = new Set(stopwords?.words || stopwords || []);

class DuplicateService {
  /**
   * Tokenize, clean, strip stopwords, and stem input text
   */
  static preprocessText(text) {
    if (!text || typeof text !== 'string') return [];

    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    return tokens
      .filter((token) => token.length > 2 && !stopwordSet.has(token) && !/^\d+$/.test(token))
      .map((token) => PorterStemmer.stem(token));
  }

  /**
   * Build weighted consolidated document for a vulnerability
   * Title is repeated 2x for increased keyword weight
   */
  static buildDocument(data) {
    const title = data.title || '';
    const description = data.description || '';
    const steps = data.stepsToReproduce || '';
    const category = data.category || '';

    // Title weighted twice
    const combined = `${title} ${title} ${category} ${description} ${steps}`;
    return DuplicateService.preprocessText(combined);
  }

  /**
   * Calculate Cosine Similarity between two term-frequency vectors
   */
  static calculateCosineSimilarity(tf1, tf2) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const allKeys = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);

    for (const key of allKeys) {
      const val1 = tf1[key] || 0;
      const val2 = tf2[key] || 0;

      dotProduct += val1 * val2;
      normA += val1 * val1;
      normB += val2 * val2;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Compute Term Frequencies for an array of stemmed tokens
   */
  static getTermFrequencies(tokens) {
    const tf = {};
    for (const token of tokens) {
      tf[token] = (tf[token] || 0) + 1;
    }
    return tf;
  }

  /**
   * Calculate similarity score between a target document and candidate
   * Includes bonuses for identical CVE or CWE identifiers
   */
  static computeScore(target, candidate) {
    const targetTokens = DuplicateService.buildDocument(target);
    const candidateTokens = DuplicateService.buildDocument(candidate);

    const tfTarget = DuplicateService.getTermFrequencies(targetTokens);
    const tfCandidate = DuplicateService.getTermFrequencies(candidateTokens);

    let similarity = DuplicateService.calculateCosineSimilarity(tfTarget, tfCandidate);

    // Exact identifier bonus
    if (target.cveId && candidate.cveId && target.cveId.toUpperCase() === candidate.cveId.toUpperCase()) {
      similarity += 0.15; // Strong signal: same CVE
    }

    if (target.cweId && candidate.cweId && target.cweId.toUpperCase() === candidate.cweId.toUpperCase()) {
      similarity += 0.05; // Moderate signal: same CWE
    }

    // Exact category bonus
    if (target.category && candidate.category && target.category === candidate.category) {
      similarity += 0.03;
    }

    return Math.min(1.0, Math.round(similarity * 100) / 100);
  }

  /**
   * Scan existing active reports for potential duplicates
   */
  static async findDuplicates(targetReport, excludeId = null) {
    try {
      const settings = await Setting.getSettings();
      const threshold = settings.duplicateThreshold || 0.75;

      const query = {
        status: { $nin: [VULN_STATUSES.REJECTED, VULN_STATUSES.DUPLICATE] },
      };

      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const candidates = await Vulnerability.find(query).select(
        '_id title description stepsToReproduce category cveId cweId status createdAt'
      );

      const matches = [];

      for (const candidate of candidates) {
        const similarity = DuplicateService.computeScore(targetReport, candidate);
        if (similarity >= threshold) {
          matches.push({
            vulnerabilityId: candidate._id,
            similarity,
            title: candidate.title,
          });
        }
      }

      // Sort descending by similarity, keep top 5
      matches.sort((a, b) => b.similarity - a.similarity);
      const topMatches = matches.slice(0, 5);

      return {
        isPotentialDuplicate: topMatches.length > 0,
        matches: topMatches,
        thresholdUsed: threshold,
      };
    } catch (err) {
      logger.error(`Error in findDuplicates: ${err.message}`);
      return { isPotentialDuplicate: false, matches: [] };
    }
  }

  /**
   * Recheck and persist duplicate status for an existing vulnerability
   */
  static async recheckVulnerability(vulnerabilityId) {
    const vuln = await Vulnerability.findById(vulnerabilityId);
    if (!vuln) throw new Error('Vulnerability not found');

    const result = await DuplicateService.findDuplicates(vuln, vuln._id);
    vuln.duplicate.isPotentialDuplicate = result.isPotentialDuplicate;
    vuln.duplicate.matches = result.matches;
    await vuln.save();

    return result;
  }
}

module.exports = DuplicateService;
