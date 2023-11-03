import { load, save } from 'settings';

export function init() {
	load('category-queue', $('.category-queue-settings'));

	$('#save').on('click', () => {
		save('category-queue', $('.category-queue-settings'));
	});
}
