const sqlite3 = require('better-sqlite3');
const path = require('path');
const app = require('electron').app;
const logger = require('../logger');
const fs = require('fs');
const { isArray } = require('util');

 
 
class Database {

  constructor(dbname) {
    this.db = null;
    this.dbname = dbname ? dbname + '.db' : 'test.db';
    this.query = null;
    this.dbPath = null;
  } 

  connect() {
    this.dbPath = process.env.NODE_ENV === 'development' ? path.join(app.getAppPath(), this.dbname)
      : path.join(process.resourcesPath, this.dbname);

    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, '');
      logger.info('Archivo de base de datos creado en:', this.dbPath);
    }

    this.db = new sqlite3(this.dbPath);
    logger.info('Database connected:', this.dbPath);

    return this.db;
  } 

  init() {
    const files = this.getSqlFiles();
    files.forEach(file => {
      const sql = fs.readFileSync(file, 'utf8');
      console.log(sql);
      this.db.exec(sql);
      /* logger.info('Executing SQL file:', file);
      logger.info(sql);
      
      logger.info('SQL file executed:', file); */
    });
  }
 
  getSqlFiles() {
    const storagePath = path.join(app.getAppPath(),'src','main', 'storage','tables');
    const files = fs.readdirSync(storagePath);
   
    const sqlite3files = files.filter(file => file.endsWith('.db'));
    
    return sqlite3files.map(file => path.join(storagePath, file));
  }


  addColumn(table, column, type) {
    try {
      const tableInfo = this.db.prepare(`PRAGMA table_info(${table})`).all();

      if (!tableInfo.some(col => col.name === column)) {
        this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      }
    } catch (error) {
      logger.error('Error al agregar columna:', error);
    }
  }

  createTable(table, columns) {
    this.db.exec(`CREATE TABLE IF NOT EXISTS ${table} (${columns.join(', ')})`);
  }
  
  insert(table, columns, values) {

    


    try {
         this.query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.map(value =>'?').join(',')})`;
          
          
          const parseValues = values.map((value)=>{

            if(value instanceof ArrayBuffer)  return Buffer.from(value)

              return value

          })
    
    
          console.log(parseValues)
    const result = this.db.prepare(this.query).run(parseValues);

    console.log('Datos insertados:', result);
      return result;
    
    } catch (error) {
      logger.error('Error al insertar datos:', error);
      return;
      
    }

 
  }

  joins(query){
    let joinStr = '';
    if(query.join) {
      if(Array.isArray(query.join)) {
        query.join.forEach(join => {
          joinStr += `INNER JOIN ${join.table} ON ${join.on} `;
        });
      }else{
        joinStr += `INNER JOIN ${query.join} ON ${query.on} `;  
      }
    }
    if(query.leftJoin) {
      if(Array.isArray(query.leftJoin)) {
        query.leftJoin.forEach(leftJoin => {
          joinStr += `LEFT JOIN ${leftJoin.table} ON ${leftJoin.on} `;
        }); 
      }else{
        joinStr += `LEFT JOIN ${query.leftJoin} ON ${query.on} `;
      
      }
    }
    if(query.rightJoin) {
      if(Array.isArray(query.rightJoin)) {
        query.rightJoin.forEach(rightJoin => {
          joinStr += `RIGHT JOIN ${rightJoin.table} ON ${rightJoin.on} `;
        }); 
      }else{
        joinStr += `RIGHT JOIN ${query.rightJoin} ON ${query.on} `; 
      }

    }
    return joinStr;
  }

  select(table,query,data=[],options={}) {

    options.one = options.one || false;


    const sql = `SELECT ${query.select || '*'} FROM ${table} 
    ${this.joins(query)}
    ${query.where ? `WHERE ${query.where}` : ''}
    ${query.groupBy ? `GROUP BY ${query.groupBy}` : ''}
     ${query.having ? `HAVING ${query.having}` : ''} 
    ${query.orderBy ? `ORDER BY ${query.orderBy}` : ''} 
     ${query.limit ? `LIMIT ${query.limit}` : ''}
      ${query.offset ? `OFFSET ${query.offset}` : ''}
     `;
    console.log(sql.trimEnd());
    console.log(data);
    console.log(options);

    let result 
     
     if(options.one) result= this.db.prepare(sql).get(...data) 
      
     else result= this.db.prepare(sql).all(...data)

    console.log(result);
    return result;
  }

  update(table, query, values) {

    const {columns,where} = query
    this.query = `UPDATE ${table} SET ${columns.map((column, index) => `${column} = ?`).join(', ')} WHERE ${where}`;



      const parseValues = values.map((value)=>{

            if(value instanceof ArrayBuffer)  return Buffer.from(value)

              return value

          })
    
    console.log(this.query);

      console.log(values)
    console.log(parseValues)
    const result = this.db.prepare(this.query).run(parseValues);

  console.log(result)

    return result
  }

  delete(table, query, values) {
    const sql = `DELETE FROM ${table} WHERE ${query.where}`;
    console.log(sql)
        console.log(values)

   const result =  this.db.prepare(sql).run(values);

    console.log(result)
  }

  close() {
    this.db.close();
  }

  deleteDatabase() {
    fs.unlinkSync(this.dbPath);
  }

  deleteTable(table) {
    this.db.exec(`DROP TABLE IF EXISTS ${table}`);
  }

  deleteColumn(table, column) {
    this.db.exec(`ALTER TABLE ${table} DROP COLUMN ${column}`);
  }

  

  createIndex(table, column) {
    this.db.exec(`CREATE INDEX IF NOT EXISTS ${table}_${column}_index ON ${table} (${column})`);
  }

  createTrigger(table, column, event, trigger) {
      this.query = `CREATE TRIGGER IF NOT EXISTS ${column}_trigger ${event} ON ${table} BEGIN ${trigger}; END`;
      console.log(this.query);
      this.db.exec(this.query);
  }

  createView(view, query) {
    this.db.exec(`CREATE VIEW IF NOT EXISTS ${view} AS ${query}`);
  }

  createProcedure(procedure, query) {
    this.db.exec(`CREATE PROCEDURE IF NOT EXISTS ${procedure} AS ${query}`);
  }

  createFunction(name, query) {
    this.db.exec(`CREATE FUNCTION IF NOT EXISTS ${name} AS ${query}`);
  }

    getDB() {
        return this.db;
    }

  getTabesInfo() {
    return this.db.prepare(`PRAGMA table_list`).all();
  }

  getTableInfo(table) {
    return this.db.prepare(`PRAGMA table_info(${table})`).all();
  }

  getTableColumns(table) {
    return this.db.prepare(`PRAGMA table_info(${table})`).all();
  }
}
  



module.exports = Database
