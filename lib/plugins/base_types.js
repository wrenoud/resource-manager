module.exports = function(interface){
	interface.registerType('Number', '[-+]?[0-9]*[.,]?[0-9]+', '{{value}}');
	interface.registerType('Text', '.*', '{{value}}');
	interface.registerType('URL', 'https?://([a-zA-Z\d]+\.)+[a-zA-Z\d]{2,6}(/[/\w \.-]*)*', '<a target="_blank" href="{{value}}">{{value}}</a>');
}