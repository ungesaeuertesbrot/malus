{
	"name": "types",
	"version": "0a",
	"title": "Bonus type system",
	"description": "Flexible type system for Bonus",
	
	"extension_points": {
		"/bonus/types/primitive": {
			"extension_test": "bonus/types/extension_points::test_primitive"
		}
	},
	
	"extensions": [
		{
			"extends": "/bonus/type_system",
			"extension_class": "bonus/types/system::System"
		},
		{
			"extends": "/bonus/types/primitive",
			"extension_class": "bonus/types/primitives::Integer"
		},
		{
			"extends": "/bonus/types/primitive",
			"extension_class": "bonus/types/primitives::String"
		},
		{
			"extends": "/bonus/types/primitive",
			"extension_class": "bonus/types/primitives::Bool"
		},
		{
			"extends": "/bonus/types/primitive",
			"extension_class": "bonus/types/primitives::Date"
		}
	]
}
