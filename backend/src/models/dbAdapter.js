import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { getDBMode } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

class QueryChain {
  constructor(dataPromise) {
    this.dataPromise = dataPromise;
    this._sortField = null;
    this._sortAsc = 1;
    this._skipCount = 0;
    this._limitCount = null;
    this._populates = [];
  }

  sort(sortObj) {
    if (typeof sortObj === 'object') {
      const field = Object.keys(sortObj)[0];
      this._sortField = field;
      this._sortAsc = sortObj[field] >= 0 ? 1 : -1;
    } else if (typeof sortObj === 'string') {
      this._sortAsc = sortObj.startsWith('-') ? -1 : 1;
      this._sortField = sortObj.replace(/^[+-]/, '');
    }
    return this;
  }

  skip(n) {
    this._skipCount = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limitCount = Number(n) || null;
    return this;
  }

  populate(field) {
    this._populates.push(field);
    return this;
  }

  async exec() {
    let list = await this.dataPromise;
    if (!Array.isArray(list)) return list;

    if (this._sortField) {
      list.sort((a, b) => {
        const valA = a[this._sortField];
        const valB = b[this._sortField];
        if (valA < valB) return -1 * this._sortAsc;
        if (valA > valB) return 1 * this._sortAsc;
        return 0;
      });
    }

    if (this._skipCount > 0) {
      list = list.slice(this._skipCount);
    }

    if (this._limitCount !== null && this._limitCount >= 0) {
      list = list.slice(0, this._limitCount);
    }

    return list;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  if (path in obj) return obj[path];
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr == null) return undefined;
    curr = curr[part];
  }
  return curr;
}

function matchFilter(doc, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const anyMatch = val.some(subFilter => matchFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }
    if (key === '_id') {
      const docId = String(doc._id || doc.id);
      const targetId = String(val && val._id ? val._id : val);
      if (docId !== targetId) return false;
      continue;
    }
    const docVal = getNestedValue(doc, key);
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('$regex' in val) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(String(docVal || ''))) return false;
        continue;
      }
      if ('$in' in val && Array.isArray(val.$in)) {
        if (!val.$in.map(String).includes(String(docVal))) return false;
        continue;
      }
      if ('$ne' in val) {
        if (String(docVal) === String(val.$ne)) return false;
        continue;
      }
      if ('$gte' in val) {
        if (Number(docVal) < Number(val.$gte)) return false;
        continue;
      }
      if ('$lte' in val) {
        if (Number(docVal) > Number(val.$lte)) return false;
        continue;
      }
    } else {
      if (typeof val === 'string' && typeof docVal === 'string') {
        if (docVal.toLowerCase() !== val.toLowerCase()) {
          return false;
        }
      } else if (docVal !== val && String(docVal) !== String(val)) {
        return false;
      }
    }
  }
  return true;
}

class LocalModel {
  constructor(collectionName, schema) {
    this.collectionName = collectionName;
    this.filePath = path.join(dataDir, `${collectionName}.json`);
    this.schema = schema;
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf8');
    }
  }

  _read() {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error(`Error reading ${this.filePath}:`, err.message);
      return [];
    }
  }

  _write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error writing ${this.filePath}:`, err.message);
    }
  }

  find(filter = {}) {
    const fn = async () => {
      const list = this._read();
      return list.filter(item => matchFilter(item, filter));
    };
    return new QueryChain(fn());
  }

  findOne(filter = {}) {
    const fn = async () => {
      const list = this._read();
      const found = list.find(item => matchFilter(item, filter));
      return found ? { ...found } : null;
    };
    return new QueryChain(fn());
  }

  findById(id) {
    return this.findOne({ _id: String(id) });
  }

  async create(doc) {
    const list = this._read();
    const now = new Date().toISOString();
    const newDoc = {
      _id: doc._id || generateObjectId(),
      ...doc,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now
    };
    list.push(newDoc);
    this._write(list);
    return { ...newDoc };
  }

  async insertMany(docs) {
    const results = [];
    for (const d of docs) {
      results.push(await this.create(d));
    }
    return results;
  }

  async findByIdAndUpdate(id, update = {}, options = {}) {
    const list = this._read();
    const idx = list.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return null;

    const current = list[idx];
    const updatePayload = update.$set ? { ...update.$set } : { ...update };
    delete updatePayload._id;

    const updated = {
      ...current,
      ...updatePayload,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    this._write(list);
    return options.new === false ? current : updated;
  }

  async updateOne(filter = {}, update = {}) {
    const list = this._read();
    const idx = list.findIndex(item => matchFilter(item, filter));
    if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

    const current = list[idx];
    const updatePayload = update.$set ? { ...update.$set } : { ...update };
    delete updatePayload._id;

    list[idx] = {
      ...current,
      ...updatePayload,
      updatedAt: new Date().toISOString()
    };
    this._write(list);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async findByIdAndDelete(id) {
    const list = this._read();
    const idx = list.findIndex(item => String(item._id) === String(id));
    if (idx === -1) return null;
    const removed = list.splice(idx, 1)[0];
    this._write(list);
    return removed;
  }

  async deleteOne(filter = {}) {
    const list = this._read();
    const idx = list.findIndex(item => matchFilter(item, filter));
    if (idx === -1) return { deletedCount: 0 };
    list.splice(idx, 1);
    this._write(list);
    return { deletedCount: 1 };
  }

  async deleteMany(filter = {}) {
    const list = this._read();
    const filtered = list.filter(item => !matchFilter(item, filter));
    const deletedCount = list.length - filtered.length;
    this._write(filtered);
    return { deletedCount };
  }

  async countDocuments(filter = {}) {
    const list = this._read();
    if (!filter || Object.keys(filter).length === 0) return list.length;
    return list.filter(item => matchFilter(item, filter)).length;
  }
}

function createUnifiedModel(name, schemaDefinition) {
  const collectionName = name.toLowerCase() + 's';
  const mongooseSchema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  let mongooseModel;
  try {
    mongooseModel = mongoose.model(name, mongooseSchema);
  } catch (e) {
    mongooseModel = mongoose.models[name];
  }

  const localModel = new LocalModel(collectionName, schemaDefinition);

  // Return dynamic proxy that delegates to Mongoose if connected, or LocalModel otherwise
  return new Proxy({}, {
    get(target, prop) {
      if (getDBMode() === 'mongodb') {
        return mongooseModel[prop].bind(mongooseModel);
      }
      if (typeof localModel[prop] === 'function') {
        return localModel[prop].bind(localModel);
      }
      return localModel[prop];
    }
  });
}

export { createUnifiedModel, generateObjectId };
export default { createUnifiedModel, generateObjectId };

