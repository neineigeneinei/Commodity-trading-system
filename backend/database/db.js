const pool = require('../config/database');

class Database {
    // 执行SQL查询
    static async query(sql, params) {
        try {
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('SQL查询错误:', error);
            throw error;
        }
    }

    // 插入数据
    static async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(',');
        const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
        
        try {
            const [result] = await pool.execute(sql, values);
            return result;
        } catch (error) {
            console.error('插入数据错误:', error);
            throw error;
        }
    }

    // 更新数据
    static async update(table, data, where) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(',');
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = [...Object.values(data), ...Object.values(where)];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

        try {
            const [result] = await pool.execute(sql, values);
            return result;
        } catch (error) {
            console.error('更新数据错误:', error);
            throw error;
        }
    }

    // 删除数据
    static async delete(table, where) {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

        try {
            const [result] = await pool.execute(sql, values);
            return result;
        } catch (error) {
            console.error('删除数据错误:', error);
            throw error;
        }
    }

    // 查找单条记录
    static async findOne(table, where) {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;

        try {
            const [rows] = await pool.execute(sql, values);
            return rows[0] || null;
        } catch (error) {
            console.error('查询数据错误:', error);
            throw error;
        }
    }

    // 查找多条记录
    static async findMany(table, where = {}, options = {}) {
        let sql = `SELECT * FROM ${table}`;
        let values = [];

        // 处理WHERE条件
        if (Object.keys(where).length > 0) {
            const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            values = Object.values(where);
        }

        // 处理排序
        if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
        }

        // 处理分页
        if (options.limit) {
            sql += ` LIMIT ?`;
            values.push(options.limit);
            
            if (options.offset) {
                sql += ` OFFSET ?`;
                values.push(options.offset);
            }
        }

        try {
            const [rows] = await pool.execute(sql, values);
            return rows;
        } catch (error) {
            console.error('查询数据错误:', error);
            throw error;
        }
    }

    // 批量删除数据
    static async deleteMany(table, where) {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

        try {
            const [result] = await pool.execute(sql, values);
            return result;
        } catch (error) {
            console.error('批量删除数据错误:', error);
            throw error;
        }
    }
}

module.exports = Database;