// Simple in-memory storage for development
class MemoryStorage {
  constructor() {
    this.users = new Map();
    this.humanizations = new Map();
    this.sessions = new Map();
    this.userCounter = 1;
    this.humanizationCounter = 1;
  }

  // User methods
  async createUser(userData) {
    const id = this.userCounter++;
    const user = {
      _id: id.toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        dailyCount: 0,
        monthlyCount: 0,
        totalCount: 0,
        lastReset: new Date()
      },
      subscription: {
        plan: 'free',
        isActive: true
      },
      preferences: {
        defaultStyle: 'casual',
        darkMode: false,
        language: 'en',
        notifications: {
          email: true,
          browser: true
        }
      }
    };

    this.users.set(id.toString(), user);
    return user;
  }

  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    const idStr = typeof id === 'string' ? id : id.toString();
    return this.users.get(idStr) || null;
  }

  async updateUser(id, updates) {
    const idStr = typeof id === 'string' ? id : id.toString();
    const user = this.users.get(idStr);
    if (!user) return null;

    Object.assign(user, updates, { updatedAt: new Date() });
    return user;
  }

  // Humanization methods
  async createHumanization(humanizationData) {
    const id = this.humanizationCounter++;
    const humanization = {
      _id: id.toString(),
      ...humanizationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.humanizations.set(id.toString(), humanization);
    return humanization;
  }

  async findHumanizationById(id) {
    return this.humanizations.get(id.toString()) || null;
  }

  async findHumanizationsByUser(userId, options = {}) {
    const userHumanizations = [];

    for (const humanization of this.humanizations.values()) {
      if (humanization.user.toString() === userId.toString()) {
        userHumanizations.push(humanization);
      }
    }

    // Apply sorting and pagination
    userHumanizations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const { skip = 0, limit = 10 } = options;
    return userHumanizations.slice(skip, skip + limit);
  }

  async countHumanizationsByUser(userId) {
    let count = 0;
    for (const humanization of this.humanizations.values()) {
      if (humanization.user.toString() === userId.toString()) {
        count++;
      }
    }
    return count;
  }

  async deleteHumanization(id, userId) {
    const humanization = this.humanizations.get(id.toString());
    if (!humanization || humanization.user.toString() !== userId.toString()) {
      return null;
    }

    this.humanizations.delete(id.toString());
    return humanization;
  }

  // Session methods
  createSession(token, userId) {
    this.sessions.set(token, {
      userId: userId.toString(),
      createdAt: new Date()
    });
  }

  getSession(token) {
    return this.sessions.get(token) || null;
  }

  deleteSession(token) {
    return this.sessions.delete(token);
  }

  // Utility methods
  clear() {
    this.users.clear();
    this.humanizations.clear();
    this.sessions.clear();
    this.userCounter = 1;
    this.humanizationCounter = 1;
  }

  getStats() {
    return {
      users: this.users.size,
      humanizations: this.humanizations.size,
      sessions: this.sessions.size
    };
  }
}

// Create singleton instance
const memoryStorage = new MemoryStorage();

module.exports = memoryStorage;
