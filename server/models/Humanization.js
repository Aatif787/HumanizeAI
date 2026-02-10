const memoryStorage = require('../utils/memoryStorage');

class MockHumanization {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    if (this.isNew) {
      const humanization = await memoryStorage.createHumanization(this);
      Object.assign(this, humanization);
      this.isNew = false;
    }
    return this;
  }

  // Virtual methods
  get textDifference() {
    const originalLength = this.originalText.length;
    const humanizedLength = this.humanizedText.length;
    const difference = Math.abs(humanizedLength - originalLength);
    const percentage = (difference / originalLength) * 100;

    return {
      absolute: difference,
      percentage: Math.round(percentage * 100) / 100,
      direction: humanizedLength > originalLength ? 'increased' : 'decreased'
    };
  }

  getSimilarityScore() {
    const originalWords = this.originalText.toLowerCase().split(/\s+/);
    const humanizedWords = this.humanizedText.toLowerCase().split(/\s+/);

    const intersection = originalWords.filter(word => humanizedWords.includes(word));
    const union = [...new Set([...originalWords, ...humanizedWords])];

    return Math.round((intersection.length / union.length) * 100);
  }

  static async findOne(query) {
    if (query._id && query.user) {
      const humanization = await memoryStorage.findHumanizationById(query._id);
      if (humanization && humanization.user.toString() === query.user.toString()) {
        return new MockHumanization(humanization);
      }
    }
    return null;
  }

  static async find(query, options = {}) {
    if (query.user) {
      const humanizations = await memoryStorage.findHumanizationsByUser(query.user, options);
      return humanizations.map(h => new MockHumanization(h));
    }
    return [];
  }

  static async findOneAndDelete(query) {
    if (query._id && query.user) {
      const humanization = await memoryStorage.deleteHumanization(query._id, query.user);
      return humanization ? new MockHumanization(humanization) : null;
    }
    return null;
  }

  static async countDocuments(query) {
    if (query.user) {
      return await memoryStorage.countHumanizationsByUser(query.user);
    }
    return 0;
  }

  static async getUserStats(userId) {
    const humanizations = await memoryStorage.findHumanizationsByUser(userId);
    const total = humanizations.length;
    const avgScore = total > 0 ?
      humanizations.reduce((sum, h) => sum + (h.results?.confidenceScore || 0), 0) / total : 0;

    return [{
      totalHumanizations: total,
      avgConfidenceScore: Math.round(avgScore * 100) / 100,
      totalCharacters: humanizations.reduce((sum, h) => sum + (h.results?.characterCount?.original || 0), 0),
      favoriteCount: humanizations.filter(h => h.isFavorite).length,
      styleDistribution: {}
    }];
  }
}

module.exports = MockHumanization;
