/**
 * A lightweight CommonJS Promises/A and when() implementation.
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://github.com/cujojs/when/blob/master/docs/api.md#when">when.js</a>
 * and is available under <a href="ttp://www.opensource.org/licenses/mit-license.php">MIT license</a>.
 * </div>
 *
 * @class when
 * @singleton
 * @author Brian Cavalier
 */

/**
 * Get a trusted promise for `x`. If `x`. If `onFulfilled` is provided then get a trusted promise by transforming `x` with `onFulfilled`.
 *
 * `when()` accepts any promise that provides a thenable promise--any object that provides a `.then()` method,
 * even promises that aren't fully Promises/A+ compliant, such as jQuery's Deferred.
 * It will assimilate such promises and make them behave like Promises/A+.
 *
 * @method constructor
 * @param {*} x
 * @param {Function} [onFulfilled] callback to be called when x is
 * successfully fulfilled. If promiseOrValue is an immediate value, callback
 * will be invoked immediately.
 * @param {Function} [onRejected] callback to be called when x is
 * rejected.
 * @param {Function} [onProgress] callback to be called when progress updates
 * are issued for x.
 * @returns {Promise} a new promise that will fulfill with the return
 * value of callback or errback or the completion value of promiseOrValue if
 * callback and/or errback is not supplied.
 *
 * Returns a trusted promise for `x`. If `x` is:
 *
 *  - a value, returns a promise fulfilled with `x`
 *  - a promise, returns `x`
 *  - a foreign thenable, returns a promise that follows `x`
 *
 * Returns a trusted promise by transforming `x` with `onFulfilled`. If `x` is:
 *
 *  - a value, returns a promise fulfilled with `onFulfilled(x)`
 *  - a promise or thenable, returns a promise that
 *    - if `x` fulfills, will fulfill with the result of calling `onFulfilled` with `x`'s fulfillment value.
 *    - if `x` rejects, will reject with the same reason as `x`
 */

/**
 * Calls `f` with the supplied arguments, returning a promise for the result.
 * The arguments may be promises, in which case, `f` will be called after they have fulfilled.
 * The returned promise will fulfill with the successful result of calling `f`.
 * If any argument is a rejected promise, or if `f` fails by throwing or returning a rejected promise,
 * the returned promise will also be rejected.
 *
 * This can be a great way to kick off a promise chain when you want to return a promise,
 * rather than creating a one manually.
 *
 * 	// Try to parse the JSON, capture any failures in the returned promise
 * 	// (This will never throw)
 * 	return when.try(JSON.parse, jsonString);
 *
 * @since 3.0
 * @method try
 * @param {Function} f
 * @param {...*} [arg]
 * @return {Promise}
 */

/**
 * Creates a "promisified" version of `f`, which always returns promises (`result` will never throw) and accepts
 * promises or values as arguments. In other words, calling `result(x, y z)` is like calling `when.try(f, x, y, z) `
 * with the added convenience that once you've created `result` you can call it repeatedly or pass it around like
 * any other function. In addition, `result`'s thisArg will behave in a predictable way, like any other
 * function (you can {@link Function#bind} it, or use {@link Function#call} or {@link Function#apply}, etc.).
 *
 * Like {@link #try}, lifting functions provides a convenient way start promise chains without having to explicitly
 * create promises.
 *
 * 	// Call parse as often as you need now.
 * 	// It will always return a promise, and will never throw
 * 	// Errors will be captured in the returned promise.
 * 	var jsonParse = when.lift(JSON.parse);
 *
 * 	// Now use it wherever you need
 * 	return jsonParse(jsonString);
 *
 * {@link #lift} correctly handles `this`, so object methods can be lifted as well:
 *
 * 	var parser = {
 * 		reviver: ...
 * 		parse: when.lift(function(str) {
 * 			return JSON.parse(str, this.reviver);
 * 		});
 * 	};
 *
 * 	// Now use it wherever you need
 * 	return parser.parse(jsonString);
 *
 * @since 3.0
 * @method lift
 * @param {Function} f
 * @return {Function}
 */

/**
 * Return a promise that will resolve only once all the inputs have resolved. The resolution value
 * of the returned promise will be an array containing the resolution values of each of the inputs.
 * If any of the input promises is rejected, the returned promise will be rejected with the reason from the first one that is rejected.
 *
 * 	var joinedPromise = when.join(promiseOrValue1, promiseOrValue2, ...);
 *
 * 	// largerPromise will resolve to the greater of two eventual values
 * 	var largerPromise = when.join(promise1, promise2).then(function (values) {
 * 	    return values[0] > values[1] ? values[0] : values[1];
 * 	});
 *
 * @method join
 * @param {...Promise} promises One or more promises.
 * @return {Promise} a promise that will fulfill when *all* the input promises have fulfilled, or
 * will reject when *any one* of the input promises rejects.
 */

/**
 * Create a Promise, whose fate is determined by the supplied resolver function. The resolver function will be called synchronously.
 *
 * 	var promise = when.promise(function(resolve, reject, notify) {
 * 	    // Do some work, possibly asynchronously, and then
 * 	    // resolve or reject.  You can notify of progress events
 * 	    // along the way if you want/need.
 *
 * 	    resolve(awesomeResult);
 * 	    // or resolve(anotherPromise);
 * 	    // or reject(nastyError);
 * 	});
 *
 * @method promise
 * @param {Function} resolver The resolver function to determinate this promise.
 * @param {Function} resolver.resolve(valueOrPromise) Primary function that seals the fate of the returned promise.
 * Accepts either a non-promise value, or another promise. When called with a non-promise value, fulfills
 * promise with that value, When called with another promise, promise's fate will be equivalent to
 * that that of otherPromise.
 * @param {Function} resolver.reject(reason) function that rejects promise
 * @param {Function} resolver.notify(update) function that issues progress events for promise with update.
 * @return {Promise} promise whose fate is determine by resolver
 */

/**
 * Create a resolved promise for the supplied promiseOrValue. If promiseOrValue is a value, it will
 * be the resolution value of the returned promise. Returns promiseOrValue if it's a trusted promise.
 * If promiseOrValue is a foreign promise, returns a promise in the same state (resolved or rejected)
 * and with the same value as promiseOrValue.
 *
 * 	var resolved = when.resolve(promiseOrValue);
 *
 * @method resolve
 * @param  {*} value
 * @return {Promise}
 */

/**
 * Create a rejected promise with the supplied error as the rejection reason.
 *
 * 	var rejected = when.reject(error);
 *
 * > **DEPRECATION WARNING**: In when.js 2.x, error is allowed to be a promise for an error.
 * > In when.js 3.0, error will always be used verbatim as the rejection reason, even if it is a promise.
 *
 * If error is a value, it will be the rejection reason of the returned promise.
 * If error is a promise, its rejection reason will be the rejection reason of the returned promise.
 *
 * @method reject
 * @param {*} promiseOrValue the rejected value of the returned promise.
 * @return {Promise}
 */

/**
 * > **Note**: The use of {@link #defer} is discouraged. In most cases, using {@link #promise}, {@link #try}, or {@link #lift}
 * > provides better separation of concerns.
 *
 * Create a `{{@link Deferred#promise promise}, {@link Deferred#resolve resolve}, {@link Deferred#reject reject}, {@link Deferred#notify notify}}` tuple.
 * In certain (rare) scenarios it can be convenient to have access to both the promise and it's associated resolving
 * functions.
 *
 *     var promise = deferred.promise;
 *     // Resolve the promise, x may be a promise or non-promise
 *     deferred.resolve(x)
 *
 *     // Reject the promise with error as the reason
 *     deferred.reject(error)
 *
 *     // Notify promise consumers of a progress update
 *     deferred.notify(x)
 *
 * Note that {@link Deferred#resolve resolve}, {@link Deferred#reject reject}, and {@link Deferred#notify notify} all become [no-ops](https://en.wikipedia.org/wiki/NOP)
 * after either resolve or reject has been called the first time.
 *
 * @method defer
 * @return {Deferred}
 */

/**
 * Return true if anything is an object or function with a then method. It does not distinguish
 * trusted when.js promises from other "thenables" (e.g. from some other promise implementation).
 *
 * 	var is = when.isPromiseLike(anything);
 *
 * @method isPromiseLike
 * @param {*} x anything
 * @return {Boolean}
 */

/**
 * Return a promise that will resolve only once all the items in array have resolved. The resolution value of the returned promise will be an array containing the resolution values of each of the items in array.
 * If any of the promises is rejected, the returned promise will be rejected with the rejection reason of the first promise that was rejected.
 *
 * 	var promise = when.all(array)
 *
 * @method all
 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix of promises and values
 * @return {Promise}
 */

/**
 * Traditional array map function, similar to Array.prototype.map(), but allows input to contain promises and/or values, and mapFunc may return either a value or a promise.
 * If any of the promises is rejected, the returned promise will be rejected with the rejection reason of the first promise that was rejected.
 *
 * 	var promise = when.map(array, mapFunc)
 *
 * @method map
 * @param {Array|Promise} array array of anything, may contain promises and values
 * @param {Function} mapFunc map function which may return a promise or value
 * @param {*} mapFunc.item item A fully resolved value
 * @returns {Promise} promise that will fulfill with an array of mapped values or reject if any input promise rejects.
 */

/**
 * Traditional array reduce function, similar to Array.prototype.reduce(), but input may contain promises
 * and/or values, and reduceFunc may return either a value or a promise, and initialValue may be a promise for the starting value.
 *
 * 	var promise = when.reduce(array, reduceFunc [, initialValue])
 *
 * @method reduce
 * @param {Array|Promise} promise array or promise for an array of anything, may contain a mix of promises and values.
 * @param {Function} reducer The reduce function.
 * @param {*} reducer.currentResult The the current accumulated reduce value.
 * @param {*} reducer.value the fully resolved value at index in array.
 * @param {Number} reducer.index the basis of value, practically speaking, this is the array index of the array corresponding to value.
 * @param {Number} reducer.total the total number of items in array.
 * @returns {Promise} that will resolve to the final reduced value
 */

/**
 * @method reduceRight
 * @inheritdoc #reduce
 * @localdoc This performs the exact same operation as {@link #reduce} except we iterate `array` from
 * right-to-left instead of left-to-right
 */

/**
 * Returns a promise for an array containing the same number of elements as the input array.
 * Each element is a descriptor object describing of the outcome of the corresponding element in the input.
 * The returned promise will only reject if array itself is a rejected promise. Otherwise, it will always
 * fulfill with an array of descriptors. This is in contrast to when.all, which will reject if any element of array rejects.
 *
 * 	// Process all successful results, and also log all errors
 *
 * 	// Input array
 * 	var array = [when.reject(1), 2, when.resolve(3), when.reject(4)];
 *
 * 	// Settle all inputs
 * 	var settled = when.settle(array);
 *
 * 	// Logs 1 & 4 and processes 2 & 3
 * 	settled.then(function(descriptors) {
 * 	    descriptors.forEach(function(d) {
 * 	        if(d.state === 'rejected') {
 * 	            logError(d.reason);
 * 	        } else {
 * 	            processSuccessfulResult(d.value);
 * 	        }
 * 	    });
 * 	});
 *
 * Depending how the promise state is, the descriptor will be correspondingly:
 *
 *  - fulfilled: `{ state: 'fulfilled', value: <fulfillmentValue> }`
 *  - rejected: `{ state: 'rejected', reason: <rejectionReason> }`
 *
 * @method settle
 * @param {Array|Promise} array array or promise for array of promises to settle
 * @returns {Promise} promise that always fulfills with an array of descriptors for each input promise.
 */

/**
 * Initiates a competitive race that allows one winner, returning a promise that will resolve when
 * any one of the items in array resolves. The returned promise will only reject if all items in array
 * are rejected. The resolution value of the returned promise will be the fulfillment value of the
 * winning promise. The rejection value will be an array of all rejection reasons.
 *
 * 	var promise = when.any(array)
 *
 * @method any
 * @param {Array} array
 * @return {Promise}
 */

/**
 * Initiates a competitive race that allows howMany winners, returning a promise that will resolve
 * when howMany of the items in array resolve. The returned promise will reject if it becomes impossible
 * for howMany items to resolve--that is, when (array.length - howMany) + 1 items reject. The resolution
 * value of the returned promise will be an array of howMany winning promise fulfillment values.
 * The rejection value will be an array of (array.length - howMany) + 1 rejection reasons.
 *
 * 	var promise = when.some(array, howMany)
 *
 * 	// try all of the p2p servers and fail if at least one doesn't respond
 * 	var remotes = [connect('p2p.cdn.com'), connect('p2p2.cdn.com'), connect('p2p3.cdn.com')];
 * 	when.some(remotes, 1).then(initP2PServer, failGracefully);
 *
 * @method some
 * @param {Array} promisesOrValues array of anything, may contain a mix of promises and values
 * @param howMany {number} number of promisesOrValues to resolve
 * @returns {Promise} promise that will resolve to an array of `howMany` values that resolved first,
 * or will reject with an array of `(promisesOrValues.length - howMany) + 1` rejection reasons.
 */

/**
 * Initiates a competitive race that allows one winner. The returned promise will settle to the same
 * state as the first input promise to settle.
 *
 * > **WARNING**: The ES6 Promise spec requires that race()ing an empty array must return a promise
 * > that is pending forever. This implementation returns a singleton forever-pending promise, the same
 * > singleton that is returned by {@link Promise#never}, thus can be checked with `===`
 *
 * @method race
 * @param {Array} promises array of promises to race
 * @returns {Promise} if input is non-empty, a promise that will settle to the same outcome as the
 * earliest input promise to settle. if empty is empty, returns a promise that will never settle.
 */