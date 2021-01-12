'use strict';

const controllers = require('./lib/controllers');
const winston = require.main.require('winston');
const meta = require.main.require('./src/meta');

const plugin = {};

plugin.init = function (params, callback) {
	const router = params.router;
	const hostMiddleware = params.middleware;

	// We create two routes for every view. One API call, and the actual route itself.
	// Just add the buildHeader middleware to your route and NodeBB will take care of everything for you.
	router.get('/admin/plugins/category-queue', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/category-queue', controllers.renderAdminPage);

	meta.settings.get('category-queue', function (err, settings) {
		if (err) {
			winston.error('[plugin/category-queue] Could not retrieve plugin settings!');
			plugin.settings = {};
			return;
		}

		plugin.settings = settings;
	});

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
	try {
		if (Object.values(plugin.settings).includes(String(postData.data.cid))) {
			postData.shouldQueue = true;
		}
		callback(null, postData);
	} catch (error) {
		callback(error);
	}
};

module.exports = plugin;
