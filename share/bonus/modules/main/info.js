{
	"name": "main",
	"version": "0a",
	"title": "Bonus main module",
	"description": "The core of the bonus programm. It provides the code necessary for starting the application.",
	
	"extension_points": {
		"/bonus/type_system": {
			"is_singular": true,
			"extension_test": "bonus/main/extension_points::test_type_system"
		},
		
		"/bonus/storage": {
			"extension_test": "bonus/main/extension_points::test_storage"
		}
	},
	
	"extensions": [
		{
			"extends": "/",
			"extension_class": "bonus/root::Root"
		}
	]
}
