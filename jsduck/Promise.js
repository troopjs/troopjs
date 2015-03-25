/**
 * The `Promise` interface represents a proxy for a value not necessarily known when the promise is created.
 * It allows you to associate handlers to an asynchronous action's eventual success or failure.
 * This lets asynchronous methods return values like synchronous methods: instead of the final value,
 * the asynchronous method returns a *promise* of having a value at some point in the future.
 *
 * A pending promise can become either *fulfilled* with a value, or *rejected* with a reason.
 * When either of these happens, the associated handlers queued up by a promise's `then` method are called.
 * (If the promise has already been fulfilled or rejected when a corresponding handler is attached, the handler
 * will be called, so there is no race condition between an asynchronous operation completing and its handlers being attached.)
 *
 * As the {@link Promise#then} and {@link Promise#catch} methods return promises, they can be chained—an operation called *composition*.
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Promise">MDN</a> and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
 * </div>
 *
 * @class Promise
 */

/**
 * The `Promise` object is used for deferred and asynchronous computations. A `Promise` is in one of the three states:
 *
 *  - `pending`: initial state, not `fulfilled` or `rejected`.
 *  - `fulfilled`: successful operation
 *  - `rejected`: failed operation.
 *
 * Another term describing the state is *settled*: the Promise is either fulfilled or rejected, but not pending.
 *
 *     new Promise(executor);
 *     new Promise(function(resolve, reject) { ... });
 *
 * @method constructor
 * @param {Function} executor Function object with two arguments `resolve` and `reject`. The first argument fulfills the promise, the second argument rejects it. We can call these functions, once our operation is completed.
 * @param {Function} executor.resolve Function that resolves promise
 * @param {Function} executor.reject Function that rejects promise
 */

/**
 * The `Promise.all(iterable)` method returns a promise that resolves when all of the promises in the iterable argument have resolved.
 *
 * The result is passed as an array of values from all the promises. If something passed in the iterable array is not a promise,
 * it's converted to one by {@link Promise#resolve}. If any of the passed in promises rejects, the `all` Promise immediately rejects with the value of the promise that rejected, discarding all the other promises whether or not they have resolved.
 *
 *     var p = new Promise(function(resolve, reject) { resolve(3); });
 *     Promise.all([true, p]).then(function(values) {
 *       console.log(values); // [true, 3]
 *     });
 *
 * @method all
 * @param {*} iterable An iterable object, such as an {@link Array}
 * @return {Promise}
 * @static
 */

/**
 * The `Promise.race(iterable)` method returns a promise that resolves or rejects as soon as one of the promises in the iterable resolves or rejects, with the value or reason from that promise.
 *
 * The `race` function returns a {@link Promise} that is settled the same way as the first passed promise to settle. It resolves or rejects, whichever happens first.
 *
 *     var p1 = new Promise(function(resolve, reject) {
 *       setTimeout(resolve, 500, "one");
 *     });
 *     var p2 = new Promise(function(resolve, reject) {
 *       setTimeout(resolve, 100, "two");
 *     });
 *
 *     Promise.race([p1, p2]).then(function(value) {
 *       console.log(value); // "two"
 *       // Both resolve, but p2 is faster
 *     });
 *
 *     var p3 = new Promise(function(resolve, reject) {
 *       setTimeout(resolve, 100, "three");
 *     });
 *     var p4 = new Promise(function(resolve, reject) {
 *       setTimeout(reject, 500, "four");
 *     });
 *
 *     Promise.race([p3, p4]).then(function(value) {
 *       console.log(value); // "three"
 *       // p3 is faster, so it resolves
 *     }, function(reason) {
 *       // Not called
 *     });
 *
 *     var p5 = new Promise(function(resolve, reject) {
 *       setTimeout(resolve, 500, "five");
 *     });
 *     var p6 = new Promise(function(resolve, reject) {
 *       setTimeout(reject, 100, "six");
 *     });
 *
 *     Promise.race([p5, p6]).then(function(value) {
 *       // Not called
 *     }, function(reason) {
 *       console.log(reason); // "six"
 *       // p6 is faster, so it rejects
 *     });
 *
 * @method race
 * @param {*} iterable An iterable object, such as an {@link Array}
 * @return {Promise}
 * @static
 */

/**
 * The `Promise.reject(reason)` method returns a Promise object that is rejected with the given reason.
 *
 * The static `Promise.reject` function returns a {@link Promise} that is rejected. For debugging purposes, it is useful to make `reason` an instanceof `Error`.
 *
 *     Promise.reject("Testing static reject").then(function(reason) {
 *       // not called
 *     }, function(reason) {
 *       console.log(reason); // "Testing static reject"
 *     });
 *
 *     Promise.reject(new Error("fail")).then(function(error) {
 *       // not called
 *     }, function(error) {
 *       console.log(error); // Stacktrace
 *     });
 *
 * @method reject
 * @param {Error|*} reason Reason why this `Promise` rejected.
 * @return {Promise}
 * @static
 */

/**
 * The `Promise.resolve(value)` method returns a {@link Promise} object that is resolved with the given value. If the value is a thenable (i.e. has a `then` method), the returned promise will "follow" that thenable, adopting its eventual state; otherwise the returned promise will be fulfilled with the value.
 *
 *     Promise.resolve("Success").then(function(value) {
 *       console.log(value); // "Success"
 *     }, function(value) {
 *       // not called
 *     });
 *
 * @method resolve
 * @param {*} value Argument to be resolved by this `Promise`. Can also be a {@link Promise} or a `thenable` to resolve.
 * @return {Promise}
 * @static
 */

/**
 * The `catch` method returns a {@link Promise} and deals with rejected cases only. It behaves the same as calling {@link Promise#then}`(undefined, onRejected)`.
 *
 *     var p1 = new Promise(function(resolve, reject) {
 *       resolve("Success");
 *     });
 *
 *     p1.then(function(value) {
 *       console.log(value); // "Success!"
 *       throw "oh, no!";
 *     }).catch(function(e) {
 *       console.log(e); // "oh, no!"
 *     });
 *
 * @method catch
 * @param {Function} onRejected A `Function` called when the `Promise` is rejected. This function has one argument, the rejection `reason`.
 * @param {Error|*} onRejected.reason Reason why this `Promise` rejected.
 * @return {Promise}
 */

/**
 * The `then` method returns a {@link Promise}. It takes two arguments, both are callback functions for the success and failure cases of the Promise.
 *
 *     var p1 = new Promise(function(resolve, reject) {
 *       resolve("Success!");
 *       // or
 *       // reject ("Error!");
 *     });
 *
 *     p1.then(function(value) {
 *       console.log(value); // Success!
 *     }, function(reason) {
 *       console.log(reason); // Error!
 *     });
 *
 * @method then
 * @param {Function} onFulfilled A `Function` called when the `Promise` is fulfilled. This function has one argument, the fulfillment `value`.
 * @param {*} onFulfilled.value Argument to be resolved by this `Promise`. Can also be a {@link Promise} or a `thenable` to resolve.
 * @param {Function} onRejected A `Function` called when the `Promise` is rejected. This function has one argument, the rejection `reason`.
 * @param {Error|*} onRejected.reason Reason why this `Promise` rejected.
 * @return {Promise}
 */
