const db = require('../../config/database');
const { age, date } = require('../../lib/utils');

module.exports = {
  all(calback) {
    db.query(
      `
    SELECT *
    FROM students
    ORDER BY name ASC`,
      function (err, results) {
        if (err) throw `Database error! ${err}`;

        calback(results.rows);
      }
    );
  },
  create(data, callback) {
    const query = `
    INSERT INTO  students (
      avatar_url,
      name,
      email,
      birth_date,
      school_year,
      workload,
      teacher_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
    `;

    const values = [
      data.avatar_url,
      data.name,
      data.email,
      date(data.birth_date).iso,
      data.school_year,
      data.workload,
      data.teacher,
    ];

    db.query(query, values, function (err, results) {
      if (err) throw `Database Error! ${err}`;

      callback(results.rows[0]);
    });
  },
  find(id, callback) {
    db.query(
      `
    SELECT students.*, teachers.name AS teacher_name
    FROM students
    LEFT JOIN teachers ON (teachers.id = students.teacher_id)
    WHERE students.id = $1`,
      [id],
      function (err, results) {
        if (err) throw `Database error! ${err}`;

        callback(results.rows[0]);
      }
    );
  },
  update(data, callback) {
    const query = `
    UPDATE students SET
      avatar_url=($1),
      name=($2),
      email=($3),
      birth_date=($4),
      school_year=($5),
      workload=($6),
      teacher_id=($7)
    WHERE id = $8
    `;
    const values = [
      data.avatar_url,
      data.name,
      data.email,
      date(data.birth_date).iso,
      data.school_year,
      data.workload,
      data.teacher,
      data.id,
    ];

    db.query(query, values, function (err, results) {
      if (err) throw `Database Error! ${err}`;

      callback();
    });
  },
  delete(id, callback) {
    db.query(
      `DELETE FROM students WHERE id = $1`,
      [id],
      function (err, results) {
        if (err) throw `Database Error! ${err}`;

        return callback();
      }
    );
  },
  teacherSelectOptions(callback) {
    db.query(`SELECT name, id FROM teachers`, function (err, results) {
      if (err) throw `Database Error! ${err}`;

      callback(results.rows);
    });
  },
  paginate(params) {
    let { filter, limit, offset, callback } = params;

    let query = '',
      filterQuery = '',
      totalQuery = `( 
        SELECT count(*) FROM students
        ) AS total`;

    if (filter) {
      filterQuery = `
        WHERE students.name ILIKE '%${filter}%'
        OR students.email ILIKE '%${filter}%'
        `;

      totalQuery = `(
        SELECT count(*) 
        FROM students
        ${filterQuery} 
        ) AS total`;
    }

    query = `
        SELECT students.*, ${totalQuery}
        FROM students
        ${filterQuery}
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
        `;

    db.query(query, [limit, offset], function (err, results) {
      if (err) throw `Database error ${err}`;

      callback(results.rows);
    });
  },
};
