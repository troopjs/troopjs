/**
 * @class Promise
 * @extends External
 * @author Brian Cavalier
 * @abstract
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