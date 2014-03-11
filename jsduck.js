/**
 * @class Promise
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
 */

/**
 * @method then
 * The primary API for transforming a promise's value and producing a new promise for the transformed result,
 * or for handling and recovering from intermediate errors in a promise chain. It arranges for:
 *
 *	- `onFulfilled` to be called with the value after promise is fulfilled, or
 *	- `onRejected` to be called with the rejection reason after promise is rejected.
 *	- `onProgress` to be called with any progress updates issued by promise.
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
 * 	// Main promise API
 * 	var newPromise = promise.then(onFulfilled, onRejected, onProgress);
 *
 * @param {Function} onFulfilled
 * @param {Function} [onRejected]
 * @param {Function} [onProgress]
 */
