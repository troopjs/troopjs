/**
 * A lightweight CommonJS Promises/A and when() implementation.
 *
 * > **Note** : This documentation was copied from the [when.js API documentation](https://github.com/cujojs/when/blob/master/docs/api.md#when).
 * when is part of the cujo.js family of libraries (http://cujojs.com/)
 * @class When
 * @static
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
 * @member When
 * @method promise
 * @param {Function} resolver The resolver function to determinate this promise.
 * @param {Function} resolver.resolve(valueOrPromise) Primary function that seals the fate of the returned promise.
 * Accepts either a non-promise value, or another promise. When called with a non-promise value, fulfills
 * promise with that value, When called with another promise, promise's fate will be equivalent to
 * that that of otherPromise.
 * @param {Function} resolver.reject(reason) function that rejects promise
 * @param {Function} resolver.notify(update) function that issues progress events for promise with update.
 * @static
 * @return {Promise} promise whose fate is determine by resolver
 */

/**
 * Create a resolved promise for the supplied promiseOrValue. If promiseOrValue is a value, it will
 * be the resolution value of the returned promise. Returns promiseOrValue if it's a trusted promise.
 * If promiseOrValue is a foreign promise, returns a promise in the same state (resolved or rejected)
 * and with the same value as promiseOrValue.
 *
 * 	var resolved = when.resolve(promiseOrValue);
 * @member When
 * @method resolve
 * @param  {*} value
 * @static
 * @return {Promise}
 */

/**
 * Create a rejected promise with the supplied error as the rejection reason.
 *
 * 	var rejected = when.reject(error);
 *
 * **DEPRECATION WARNING**: In when.js 2.x, error is allowed to be a promise for an error.
 * In when.js 3.0, error will always be used verbatim as the rejection reason, even if it is a promise.
 *
 * If error is a value, it will be the rejection reason of the returned promise.
 * If error is a promise, its rejection reason will be the rejection reason of the returned promise.
 * @member When
 * @method reject
 * @param {*} promiseOrValue the rejected value of the returned promise.
 * @static
 * @return {Promise}
 */

/**
 * Create a {promise, resolver} pair, aka Deferred. In some scenarios it can be convenient to have
 * access to both the promise and it's associated resolving functions, for example, to give each out to a separate party. In such cases it can be convenient to use when.defer().
 *
 * 	var deferred = when.defer();
 * 	var promise = deferred.promise;
 * 	...
 * 	defered.resolver.resolve();
 * 	defered.resolver.reject();
 *
 * @member When
 * @method defer
 * @static
 * @return {Deferred}
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
 * @member When
 * @method join
 * @static
 * @param {...Promise} promises One or more promises.
 * @return {Promise} a promise that will fulfill when *all* the input promises have fulfilled, or
 * will reject when *any one* of the input promises rejects.
 */

/**
 * Return a promise that will resolve only once all the items in array have resolved. The resolution value of the returned promise will be an array containing the resolution values of each of the items in array.
 * If any of the promises is rejected, the returned promise will be rejected with the rejection reason of the first promise that was rejected.
 *
 * 	var promise = when.all(array)
 *
 * @member When
 * @method all
 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix of promises and values
 * @static
 * @return {Promise}
 */

/**
 * Traditional array map function, similar to Array.prototype.map(), but allows input to contain promises and/or values, and mapFunc may return either a value or a promise.
 * If any of the promises is rejected, the returned promise will be rejected with the rejection reason of the first promise that was rejected.
 *
 * 	var promise = when.map(array, mapFunc)
 *
 * @member When
 * @method map
 * @static
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
 * @member When
 * @method reduce
 * @static
 * @param {Array|Promise} promise array or promise for an array of anything, may contain a mix of promises and values.
 * @param {Function} reducer The reduce function.
 * @param {*} reducer.currentResult The the current accumulated reduce value.
 * @param {*} reducer.value the fully resolved value at index in array.
 * @param {Number} reducer.index the basis of value, practically speaking, this is the array index of the array corresponding to value.
 * @param {Number} reducer.total the total number of items in array.
 * @returns {Promise} that will resolve to the final reduced value
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
 * @member When
 * @method settle
 * @static
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
 * @member When
 * @method any
 * @static
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
 * @member When
 * @method some
 * @static
 * @param {Array} promisesOrValues array of anything, may contain a mix of promises and values
 * @param howMany {number} number of promisesOrValues to resolve
 * @returns {Promise} promise that will resolve to an array of `howMany` values that resolved first,
 * or will reject with an array of `(promisesOrValues.length - howMany) + 1` rejection reasons.
 */

/**
 * Return true if anything is an object or function with a then method. It does not distinguish
 * trusted when.js promises from other "thenables" (e.g. from some other promise implementation).
 *
 * 	var is = when.isPromiseLike(anything);
 *
 * @member When
 * @method isPromiseLike
 * @static
 * @param {*} x anything
 * @return {Boolean}
 */

/**
 * @class Promise
 * @extends External
 * @author Brian Cavalier
 *
 * The promise represents the _eventual outcome_, which is either fulfillment (success) and an associated value,
 * or rejection (failure) and an associated reason. The promise provides mechanisms for arranging to call a
 * function on its value or reason, and produces a new promise for the result.
 *
 * 	// Create a pending promise whose fate is detemined by
 * 	// the provided resolver function
 * 	var promise = when.promise(resolver);
 *
 * 	// Or a resolved promise
 * 	var promise = when.resolve(promiseOrValue);
 *
 * 	// Or a rejected promise
 * 	var promise = when.reject(reason);
 *
 * > **Note** : This documentation was copied from the [when.js API documentation](https://github.com/cujojs/when/blob/master/docs/api.md#promise).
 */

/**
 * @method then
 *
 * The primary API for transforming a promise's value and producing a new promise for the transformed result,
 * or for handling and recovering from intermediate errors in a promise chain.
 *
 * 	// Main promise API
 * 	var newPromise = promise.then(onFulfilled, onRejected, onProgress);
 *
 * It arranges for:
 *
 * - `onFulfilled` to be called with the value after promise is fulfilled, or
 * - `onRejected` to be called with the rejection reason after promise is rejected.
 * - `onProgress` to be called with any progress updates issued by promise.
 *
 * Returns a trusted promise that will fulfill with the return value of either `onFulfilled` or `onRejected`,
 * whichever is called, or will reject with the thrown exception if either throws.
 *
 * A promise makes the following guarantees about handlers registered in the same call to `.then()`:
 *
 * - Only one of `onFulfilled` or `onRejected` will be called, never both.
 * - `onFulfilled` and `onRejected` will never be called more than once.
 * - `onProgress` may be called multiple times.
 *
 * @param {Function} onFulfilled
 * @param {Function} [onRejected]
 * @param {Function} [onProgress]
 * @returns {Promise}
 */

/**
 * @method done
 *
 * Consumes a promise as the final handler in a thenable chain.
 *
 * 	promise.done(handleValue, handleError);
 *
 * One golden rule of promise error handling is:
 *
 * Either `return` the promise, thereby _passing the error-handling buck_ to the caller, or call {@link #done} and _assuming
 * responsibility for errors_.
 *
 * While {@link #then} is the primary API for transforming a promise's value and producing a new promise for the transformed
 * value, {@link #done} is used to terminate a promise chain, and extract the final value or error. It signals that you
 * are taking responsibility for the final outcome. If the chain was ultimately successful, `handleValue` will be
 * called with the final value. If the chain was not successful and an error propagated to the end, `handleError` will be
 * called with that error.
 *
 * Any error, either a returned rejection or a thrown exception, that propagates out of `handleValue` or `handleError`
 * will be rethrown to the host environment, thereby generating a loud stack trace (and in some cases, such as Node,
 * halting the VM). This provides immediate feedback for development time errors and mistakes, and greatly reduces
 * the chance of an unhandled promise rejection going silent.
 *
 * Note that there are still cases that {@link #done} simply cannot catch, such as the case of _forgetting to call
 * {@link #done}!_ Thus, {@link #done} and the unhandled rejection monitor are complimentary in many ways. In fact,
 * when the monitor is enabled, any error that escapes `handleValue` or `handleError` will also trigger the monitor.
 *
 * Since {@link #done}'s purpose is consumption rather than transformation, {@link #done} always returns `undefined`.
 *
 * @param {Function} handleValue
 * @param {Function} [handlerError]
 */

/**
 * @method catch
 * @alias otherwise
 *
 * Arranges to call `onRejected` on the promise's rejection reason if it is rejected.
 *
 * 	promise.catch(onRejected);
 * 	// or
 * 	promise.otherwise(onRejected);
 *
 *  It's a shortcut for:
 *
 * 	promise.then(undefined, onRejected);
 *
 * @param {Function} onRejected
 */

/**
 * @method finally
 * @alias ensure
 *
 * Finally allows you to execute "cleanup" type tasks in a promise chain.
 *
 * 	promise.finally(onFulfilledOrRejected);
 * 	// or
 * 	promise.ensure(onFulfilledOrRejected);
 *
 * It arranges for `onFulfilledOrRejected` to be called, _with no arguments_, when promise is either fulfilled or rejected.
 * `onFulfilledOrRejected` cannot modify promise's fulfillment value, but may signal a new or additional error by
 * throwing an exception or returning a rejected promise.
 *
 * {@link #finally} should be used instead of `promise.always.` It is safer in that it _cannot_ transform a failure
 * into a success by accident (which `always` could do simply by returning successfully!).
 *
 * When combined with {@link #catch}, {@link #finally} allows you to write code that is similar to the familiar
 * synchronous `catch/finally` pair. Consider the following synchronous code:
 *
 * 	try {
 * 		return doSomething(x);
 * 	} catch(e) {
 * 		return handleError(e);
 * 	} finally {
 * 		cleanup();
 * 	}
 *
 * Using {@link #finally}, similar asynchronous code (with `doSomething()` that returns a promise) can be written:
 *
 * 	return doSomething()
 * 		.catch(handleError)
 * 		.finally(cleanup);
 *
 * @param {Function} onFulfilledOrRejected
 */

/**
 * @method yield
 *
 * Returns a yielded promise
 *
 * 	originalPromise.yield(promiseOrValue);
 *
 * - If `originalPromise` is rejected, the returned promise will be rejected with the same reason
 * - If `originalPromise` is fulfilled, then it "yields" the resolution of the returned promise to `promiseOrValue`, namely:
 *   - If `promiseOrValue` is a value, the returned promise will be fulfilled with `promiseOrValue`
 *   - If `promiseOrValue` is a {@link Promise promise}, the returned promise will be:
 *     - fulfilled with the fulfillment value of `promiseOrValue`, or
 *     - rejected with the rejection reason of `promiseOrValue`
 *
 * In other words, it's much like:
 *
 * 	originalPromise.then(function() {
 * 		return promiseOrValue;
 * 	});
 *
 * @param {Promise|*} promiseOrValue
 */

/**
 * @method tap
 *
 * Executes a function as a side effect when `promise` fulfills.
 *
 * 	promise.tap(onFulfilledSideEffect);
 *
 * Returns a new promise:
 *
 *  - If `promise` fulfills, `onFulfilledSideEffect` is executed:
 *    - If `onFulfilledSideEffect` returns successfully, the promise returned by {@link #tap} fulfills with `promise`'s
 *    original fulfillment value. That is, `onfulfilledSideEffect`'s result is discarded.
 *    - If `onFulfilledSideEffect` throws or returns a rejected promise, the promise returned by {@link #tap} rejects with
 *    the same reason.
 *  - If `promise` rejects, `onFulfilledSideEffect` is _not_ executed, and the promise returned by {@link #tap} rejects
 *  with `promise`'s rejection reason.
 *
 * These are equivalent:
 *
 * 	// Using only .then()
 * 	promise.then(function(x) {
 * 		doSideEffectsHere(x);
 * 		return x;
 * 	});
 *
 * 	// Using .tap()
 * 	promise.tap(doSideEffectsHere);
 *
 * @param {Function} onFulfilledSideEffect
 */

/**
 * @method spread
 *
 * Arranges to call `variadicOnFulfilled` with promise's values, which is assumed to be an array, as its argument list,
 * e.g. `variadicOnFulfilled.spread(undefined, array)`.
 *
 * 	promise.spread(variadicOnFulfilled);
 *
 * It's a shortcut for either of the following:
 *
 * 	// Wrapping variadicOnFulfilled
 * 	promise.then(function(array) {
 * 		return variadicOnFulfilled.apply(undefined, array);
 * 	});
 *
 * 	// Or using when/apply
 * 	promise.then(apply(variadicOnFulfilled));
 *
 * @param {(Promise|*)[]} variadicOnFulfilled
 */

/**
 * @method inspect
 *
 * Returns a snapshot descriptor of the current state of `promise`.
 *
 * 	var status = promise.inspect();
 *
 * This descriptor is _not live_ and will not update when `promise`'s state changes.
 * The descriptor is an object with the following properties. When promise is:
 *
 * - pending: `{ state: 'pending' }`
 * - fulfilled: `{ state: 'fulfilled', value: <promise's fulfillment value> }`
 * - rejected: `{ state: 'rejected', reason: <promise's rejection reason> }`
 *
 * While there are use cases where synchronously inspecting a promise's state can be helpful, the use of {@link #inspect}
 * is discouraged. It is almost always preferable to simply use `when()` or {@link #then} to be notified when the
 * promise fulfills or rejects.
 */

/**
 * A deferred is a convenience {promise, resolver} pair. Its promise and resolver parts can be given
 * out to separate groups of consumers and producers, respectively, to allow safe, one-way communication.
 *
 * > **Note** : This documentation was copied from the [when.js API documentation](https://github.com/cujojs/when/blob/master/docs/api.md#deferred).
 * @class Deferred
 */

/**
 * The promise under this Deferred.
 * @member Deferred
 * @property {Promise} promise
 */

/**
 * @inheritdoc When#resolve
 * @member Deferred
 * @method resolve
 */

/**
 * @inheritdoc When#reject
 * @member Deferred
 * @method reject
 */

/**
 * Notify about the promise progress.
 * @member Deferred
 * @method notify
 */

/**
 * The resolver represents responsibility--the responsibility of fulfilling or rejecting the associated promise.
 * This responsibility may be given out separately from the promise itself.
 * @member Deferred
 * @property {Object} resolver
 * @property {Function} resolver.resolve
 * @property {Function} resolver.reject
 * @property {Function} resolver.notify
 */
