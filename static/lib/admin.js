'use strict';

/* globals $, app, socket, define, ajaxify */

define('admin/plugins/category-queue', ['settings', 'translator'], function (Settings, Translator) {
	var ACP = {};

	ACP.init = function () {
		ACP.render(ajaxify.data.categories, $('.category-queue-settings'));
	};

	ACP.render = function (categories, container) {
		renderList(categories, container, 0);
		$('#save').on('click', ACP.onSave);

		function renderList(categories, container, parentId) {
			if (!categories || !categories.length) {
				return;
			}

			// Translate category names if needed
			var count = 0;
			categories.forEach(function (category, idx, parent) {
				Translator.translate(category.name, function (translated) {
					if (category.name !== translated) {
						category.name = translated;
					}
					count += 1;

					if (count === parent.length) {
						renderTemplate();
					}
				});
			});

			if (!categories.length) {
				renderTemplate();
			}

			function renderTemplate() {
				app.parseAndTranslate('admin/plugins/category-queue-items', {
					cid: parentId,
					categories: categories,
				}, function (html) {
					container.append(html);

					// Handle and children categories in this level have
					for (var x = 0, numCategories = categories.length; x < numCategories; x += 1) {
						renderList(categories[x].children, $('li[data-cid="' + categories[x].cid + '"]'), categories[x].cid);
					}

					Settings.load('category-queue', $('.category-queue-settings'));
				});
			}
		}
	};

	ACP.onSave = function () {
		Settings.save('category-queue', $('.category-queue-settings'), function () {
			app.alert({
				type: 'success',
				alert_id: 'category-queue-saved',
				title: 'Settings Saved',
				message: 'Please reload your NodeBB to apply these settings',
				clickfn: function () {
					socket.emit('admin.reload');
				},
			});
		});
	};

	return ACP;
});
