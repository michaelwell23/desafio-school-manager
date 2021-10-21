const Student = require('../models/Students');
const { age, date } = require('../../lib/utils');

module.exports = {
  index(req, res) {
    let { filter, page, limit } = req.query;
    page = page || 1;
    limit = limit || 3;
    let offset = limit * (page - 1);

    const params = {
      filter,
      page,
      limit,
      offset,
      callback(students) {
        const pagination = {
          total: Math.ceil(students[0].total / limit),
          page,
        };

        return res.render('students/index', { students, filter, pagination });
      },
    };

    Student.paginate(params);
  },

  create(req, res) {
    Student.teacherSelectOptions(function (options) {
      return res.render('students/create', { teachersOptions: options });
    });
  },

  post(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == '') {
        return res.send(`Please fill all fields!`);
      }
    }

    Student.create(req.body, function (student) {
      return res.redirect(`/students/${student.id}`);
    });
  },

  show(req, res) {
    Student.find(req.params.id, function (student) {
      if (!student) return res.send('student not found');

      student.birth_date = date(student.birth_date).birthDay;
      student.age = age(student.birth_date);

      return res.render('students/show', { student });
    });
  },

  edit(req, res) {
    Student.find(req.params.id, function (student) {
      if (!student) return res.send('student not found');

      student.birth = date(student.birth).iso;

      Student.teacherSelectOptions(function (options) {
        return res.render('students/edit', {
          student,
          teachersOptions: options,
        });
      });
    });
  },

  put(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == '') {
        return res.send('Please fill all fields!');
      }
    }

    Student.update(req.body, function () {
      return res.redirect(`/students/${req.body.id}`);
    });
  },

  delete(req, res) {
    Student.delete(req.body.id, function () {
      return res.redirect(`/students`);
    });
  },
};
