'use strict';

const winston = require.main.require('winston');

const meta = require.main.require('./src/meta');
const topics = require.main.require('./src/topics');
const categories = require.main.require('./src/categories');
const routeHelpers = require.main.require('./src/routes/helpers');
const user = require.main.require('./src/user');
const groups = require.main.require('./src/groups');

const plugin = {
	id: 'category-queue',
	maxCategoryDepth: 12,
};

plugin.init = async function ({ router }) {
	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/category-queue', [], async (req, res) => {
		res.render('admin/plugins/category-queue', {
			categories: getFlatTree(await categories.getAllCategories(0)),
		});
	});

	const settings = (await meta.settings.get(plugin.id)) ?? {};

	const cids = await categories.getAllCidsFromSet('categories:cid');
	const newSettings = Object.fromEntries(
		cids
			.filter(cid => !settings[`${cid}-enabled`])
			.flatMap(cid => [`${cid}-enabled`, `${cid}-privileged`, `${cid}-exempt`, `${cid}-no-replies`])
			.map(key => [key, 'off']),
	);

	if (Object.values(newSettings).length) {
		winston.debug(`[plugin/${plugin.id}] Adding new settings: ${Object.keys(newSettings).join(', ')}`);
		await meta.settings.set(plugin.id, { ...settings, ...newSettings });
	} else {
		// changing settings already runs the parsing code, so we only need to run it here if we're not doing that
		await plugin.parseSettings({ settings: { ...settings, ...newSettings }, plugin: plugin.id });
	}
	winston.debug(`[plugin/${plugin.id}] Initialized plugin`);
};

plugin.addAdminNavigation = async function (header) {
	header.plugins.push({
		route: '/plugins/category-queue',
		icon: 'fa-tint',
		name: 'Category Queue',
	});
	return header;
};

plugin.parseSettings = async function (data) {
	if (data.plugin.includes(plugin.id) && !data.quiet) {
		plugin.settings = {
			...plugin.settings,
			...Object.fromEntries(
				Object.entries(data.settings).map(([key, value]) => [key, value === 'on']),
			),
		};
	}
	return data;
};

async function getCid(data) {
	return data?.cid ?? await topics.getTopicField(data.tid, 'cid');
}

function flattenTree(root, level = 0) {
	return [
		{ ...root, level: Math.min(level, plugin.maxCategoryDepth) },
		...(root.children ?? []).flatMap(child => flattenTree(child, level + 1)),
	];
}

function getFlatTree(categoryList) {
	const tree = categories.getTree(categoryList);
	const flatTree = [];
	for (const category of tree) {
		flatTree.push(...flattenTree(category));
	}
	return flatTree;
}

plugin.postQueue = async function ({ shouldQueue, uid, data }) {
	const cid = await getCid(data);
	try {
		if (
			plugin.settings[`${cid}-enabled`] && // general category setting
			!( // allow privileged users to bypass queue if enabled
				plugin.settings[`${cid}-privileged`] &&
				await user.isPrivileged(uid)
			) &&
			!( // allow exempt groups to bypass queue if enabled
				plugin.settings[`${cid}-exempt`] &&
				await groups.isMemberOfAny(uid, meta.config.groupsExemptFromPostQueue)
			) &&
			!( // don't queue replies if enabled
				plugin.settings[`${cid}-no-replies`] &&
				data.hasOwnProperty('tid')
			)
		) {
			shouldQueue = true;
		}
	} catch (err) {
		winston.error(`[plugin/${plugin.id}] Error: ${err.message}`);
	}

	return { shouldQueue, uid, data };
};

plugin.createCategory = async function (category) {
	await meta.settings.set(
		plugin.id,
		{
			...plugin.settings,
			[`${category.cid}-enabled`]: 'off',
		},
	);
};

module.exports = plugin;
