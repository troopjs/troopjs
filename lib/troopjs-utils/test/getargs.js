buster.testCase("troopjs-utils/getargs", function (run) {
	require( [ "troopjs-utils/getargs" ] , function (getargs) {
		run({
			"1,true,3" : function () {
				assert.equals(getargs.call("1,true,3"), [ 1, true, 3 ]);
			},

			" 1  , '2' , 3  ,false,5 " : function () {
				assert.equals(getargs.call(" 1  , '2' , 3  ,false,5 "), [ 1, "2", 3, false, 5]);
			},

			"'1',two,\"3\"" : function () {
				assert.equals(getargs.call("'1',two,\"3\""), [ "1", "two", "3" ]);
			},

			"'1', 2, \"3\"" : function () {
				assert.equals(getargs.call("'1', 2, \"3\""), [ "1", 2, "3" ]);
			},

			"'1,true',3,\"4\"" : function () {
				assert.equals(getargs.call("'1,true',3,\"4\""), [ "1,true", 3, "4" ]);
			},

			" '1, 2 ',  3,\"4\", 5 " : function () {
				assert.equals(getargs.call(" '1, 2 ',  3,\"4\", 5 "), [ "1, 2 ", "3", "4", "5" ]);
			}
		});
	});
});