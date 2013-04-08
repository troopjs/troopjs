buster.testCase("troopjs-core/event/emitter", function (run) {
	var assert = buster.assert;

	require( [ "troopjs-core/event/emitter", "when" ] , function (Emitter, when) {

		run({
			"on/emit" : function () {
				var arg = "TEST";
				var context = this;

				Emitter()
					.on("test", context, function onTest(test) {
						assert.same(arg, test);
					})
					.emit("test", arg);
			},

			"on/emit again": function() {
				var arg = "TEST";
				var context = this;

				var emitter = Emitter();
				var count = 0;
				

				emitter.on("test", context, function(test){
					count++;
				});

				var dfd = when.defer();

				dfd.promise.then(function(){
					assert.equals(count, 2);
				});

				emitter.emit("test", arg);
				emitter.emit("test", arg);
				dfd.resolve();
			},

			"on/emit again with different arg": function() {
				var emitter = Emitter();
				var context = this;
				var count = 0;
				var last;
				var dfd = when.defer();

				emitter.on("test", context, function(test) {
					last = test;
				});

				dfd.promise.then(function(){
					assert.same(last, "test2")
				});

				emitter.emit("test", "test");
				emitter.emit("test", "test2");
				dfd.resolve();
			},

			"on/emit 2 emitters": function() {
				var emitter1 = Emitter();
				var emitter2 = Emitter();

				var context = this;

				emitter1.on("one", context, function(arg) {
					assert.same(arg, "one");
				});
				emitter2.on("two", context, function(arg){
					assert.same(arg, 2);
				});

				emitter1.emit("one", "one");
				emitter2.emit("two", 2);
			},

			"off/emit": function() {
				var emitter = Emitter();
				var context = this;
				var last;
				var dfd = when.defer();
				var callback = function(arg) {
					last = arg;
				};

				emitter.on("test", context, callback);
			
				dfd.promise.then(function(){
					assert.equals(last, "test");
				});

				emitter.emit("test", "test");
				emitter.off("test", context, callback);
				emitter.emit("test", "test2");
				dfd.resolve();
			},

			"on/reemit": function() {
				var emitter = Emitter();
				var context = this;
				var count = 0;
				
				emitter.on("test", context, function(message){
					assert.equals(message, "test");
					last = message;
					count++;
				});

				emitter.emit("test", "test");

				emitter.reemit("test", context, function(message) {
					assert.equals(message, "test");
				});
			}
		});
	});
});