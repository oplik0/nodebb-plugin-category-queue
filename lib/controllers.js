'use strict';

var async = require('async');

var hostControllerHelpers = require.main.require('./src/controllers/helpers'),
	categories = require.main.require('./src/categories'),
	db = require.main.require('./src/database');

var Controllers = {};

Controllers.renderAdminPage = function (req, res, next) {
	async.parallel({
		categories: function(next) {
			async.waterfall([
				function (next) {
					db.getSortedSetRange('categories:cid', 0, -1, next);
				},
				function (cids, next) {
					categories.getCategoriesData(cids, next);
				}
			], next);
		},
	}, function(err, data) {
		res.render('admin/plugins/category-queue', {
			categories: data.categories
		});
	});
};

module.exports = Controllers;