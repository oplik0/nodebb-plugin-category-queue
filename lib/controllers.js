'use strict';

var categories = require.main.require('./src/categories');
var	db = require.main.require('./src/database');
var async = require.main.require('async');

var Controllers = {};

Controllers.renderAdminPage = function (req, res) {
	async.parallel({
		categories: function (next) {
			async.waterfall([
				function (next) {
					db.getSortedSetRange('categories:cid', 0, -1, next);
				},
				function (cids, next) {
					categories.getCategoriesData(cids, next);
				},
			], next);
		},
	}, function (err, data) {
		res.render('admin/plugins/category-queue', {
			categories: err ? [] : categories.getTree(data.categories),
		});
	});
};

module.exports = Controllers;
