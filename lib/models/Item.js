const pool = require('../utils/pool');

module.exports = class Item {
  id;
  description;
  qty;
  metric;
  userId;
  prioritize;

  constructor(row) {
    this.id = row.id;
    this.description = row.description;
    this.qty = row.qty;
    this.metric = row.metric;
    this.userId = row.user_id;
    this.prioritize = row.prioritize;
  }

  static async insert({ description, qty, metric, userId }) {
    const { rows } = await pool.query(
      `
      INSERT INTO items (description, qty, metric, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [description, qty, metric, userId]
    );

    return new Item(rows[0]);
  }

  static async updateById(id, attrs) {
    const item = await Item.getById(id);
    if (!item) return null;
    const { description, qty, metric, prioritize } = { ...item, ...attrs };
    const { rows } = await pool.query(
      `
      UPDATE items 
      SET description=$2, qty=$3, metric=$4, prioritize=$5
      WHERE id=$1 RETURNING *`,
      [id, description, qty, metric, prioritize]
    );
    return new Item(rows[0]);
  }

  static async getById(id) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM items
      WHERE id=$1
      `,
      [id]
    );
    if (!rows[0]) {
      return null;
    }
    return new Item(rows[0]);
  }

  static async getAll(user_id) {
    const { rows } = await pool.query(
      'SELECT * from items where user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    return rows.map((item) => new Item(item));
  }

  static async delete(id) {
    const { rows } = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return new Item(rows[0]);
  }
};
