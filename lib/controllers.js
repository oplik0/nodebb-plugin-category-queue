'use strict';

var Controllers = {};

Controllers.renderAdminPage = function (req, res/* , next */) {
	/*
		Make sure the route matches your path to template exactly.

		If your route was:
			myforum.com/some/complex/route/
		your template should be:
			templates/some/complex/route.tpl
		and you would render it like so:
			res.render('some/complex/route');
	*/

	res.render('admin/plugins/category-queue', {});
};

module.exports = Controllers;

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

Controllers.getDefaults = function(req, res) {
	responses.getDefaultMapping(function(err, mapping) {
		res.status(err ? 500 : 200).json(mapping || {});
	});
};

module.exports = Controllers;