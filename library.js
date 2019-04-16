'use strict';

const controllers = require('./lib/controllers');

const plugin = {};
$.get(config.relative_path + '/category-queue/settings', function(data) {
	settings = data;
});
var cids = ['23'];
plugin.init = function (params, callback) {
	const router = params.router;
	const hostMiddleware = params.middleware;
	// const hostControllers = params.controllers;

	// We create two routes for every view. One API call, and the actual route itself.
	// Just add the buildHeader middleware to your route and NodeBB will take care of everything for you.

	router.get('/admin/plugins/category-queue', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/category-queue', controllers.renderAdminPage);

	callback();
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/category-queue',
		icon: 'fa-tint',
		name: 'category-queue',
	});

	callback(null, header);
};

plugin.postQueue = function (postData, callback) {
	if (postData.data.cid in cids) {
		postData.shouldQueue = 1;
	}
	callback(null, postData);
};

module.exports = plugin;
