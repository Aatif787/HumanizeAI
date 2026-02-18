const memoryStorage = require('../utils/memoryStorage');
const bcrypt = require('bcryptjs');

class MockUser {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    if (this.isNew) {
      const user = await memoryStorage.createUser(this);
      Object.assign(this, user);
      this.isNew = false;
    } else {
      await memoryStorage.updateUser(this._id, this);
    }
    return this;
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  resetDailyCountIfNeeded() {
    const now = new Date();
    const lastReset = new Date(this.usage.lastReset);
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));

    if (daysSinceReset >= 1) {
      this.usage.dailyCount = 0;
      this.usage.lastReset = now;

      if (daysSinceReset >= 30) {
        this.usage.monthlyCount = 0;
      }
    }
  }

  canMakeRequest() {
    this.resetDailyCountIfNeeded();

    const limits = {
      free: { daily: 10, monthly: 100 },
      basic: { daily: 50, monthly: 500 },
      premium: { daily: 200, monthly: 2000 },
      enterprise: { daily: 1000, monthly: 10000 }
    };

    const userLimit = limits[this.subscription.plan] || limits.free;

    return {
      canProceed: this.usage.dailyCount < userLimit.daily && this.usage.monthlyCount < userLimit.monthly,
      dailyRemaining: Math.max(0, userLimit.daily - this.usage.dailyCount),
      monthlyRemaining: Math.max(0, userLimit.monthly - this.usage.monthlyCount),
      limits: userLimit
    };
  }

  generateApiKey() {
    const crypto = require('crypto');
    this.apiKey = crypto.randomBytes(32).toString('hex');
    return this.apiKey;
  }

  static async findById(id) {
    const userData = await memoryStorage.findUserById(id);
    return userData ? new MockUser(userData) : null;
  }

  static async findOne(query) {
    let userData;
    if (query.email) {
      userData = await memoryStorage.findUserByEmail(query.email);
    } else if (query.username) {
      userData = await memoryStorage.findUserByUsername(query.username);
    } else if (query._id) {
      userData = await memoryStorage.findUserById(query._id);
    }
    return userData ? new MockUser(userData) : null;
  }

  static async updateUser(id, updates) {
    const userData = await memoryStorage.updateUser(id, updates);
    return userData ? new MockUser(userData) : null;
  }
}

module.exports = MockUser;
