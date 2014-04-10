/**
 * A Deferred represents a computation or unit of work that may not have completed yet. Typically (but not always),
 * that computation will be something that executes asynchronously and completes at some point in the future.
 * For example, XHR operations (asynchronous ones, anyway, which is typical) in a browser never complete in
 * the current turn of the Javascript event loop. Thus, an asynchronous XHR is one type of deferred computation.
 *
 * A Deferred typically has a single producer (although having many producers can be useful, too) and many consumers.
 * A producer is responsible for providing the result of the computation, and typically, but not always, will be the
 * same component that created the Deferred. As the name implies, a consumer observes the result of the computation.
 *
 * ## Producers
 *
 * Producers provide a result via the {@link Resolver} API: {@link #resolve} or {@link #resolver}`.resolve()`.
 * The two are functionally equivalent, but {@link #resolver} can safely be given out to an untrusted component
 * without giving away full access to the Deferred. The resolver is also *frozen* and thus cannot be corrupted.
 * That provides a clear *separation of concerns* by allowing a component to produce a result but not to know
 * any details about consumers.
 *
 *     var deferred = when.defer();
 *     // The deferred's resolver, which can safely be given to other components
 *     var resolver = deferred.resolver;
 *
 * ## Consumers
 *
 * Consumers can observe the result via {@link #promise}. The promise can be given to any number of components,
 * who can observe the result using {@link when#constructor}.
 * Like {@link #resolver}, even though when.js's Deferred implements the {@link Promise} API, it is better to
 * give only the {@link #promise} to consumers so that they can't modify the Deferred (such as calling
 * {@link #resolve} or {@link #reject} on it!).
 *
 *     var deferred = when.defer();
 *     // The deferred's promise, which can safely be given to other components
 *     var promise = deferred.promise;
 *
 * ## Resolving and rejecting
 *
 * When a producer provides the result by calling {@link #resolver}`.resolve()` (or {@link #resolve}), all consumers
 * are notified by having their callbacks (which they registered via {@link when#constructor}) called with the result.
 *
 * A producer may also *reject* the Deferred, signalling that the Deferred's computation failed, or could not complete
 * given some set of constraints. In this case, all consumers will be notified by having their `errorback` called
 * (the 3rd parameter passed to {@link when#constructor}, or the 2nd parameter passed to `{@link Promise#then}).
 *
 * ## Progress
 *
 * when.js's Deferreds also support progress notifications, to indicate to consumers that the computation is making
 * progress toward its result. A producer may call {@link #resolver}`.notify()` (or {@link #notify}) and pass
 * a single parameter (whatever it wants) to indicate progress. All consumers will be notified by having their
 * progress handler called (the 4th parameter to {@link when#constructor}, or the 3rd parameter to {@link Promise#then}).
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://github.com/cujojs/when/blob/master/docs/api.md">when.js</a>
 * and is available under <a href="ttp://www.opensource.org/licenses/mit-license.php">MIT license</a>.
 * </div>
 *
 * @class when.Deferred
 * @alternateClassName Deferred
 * @author Brian Cavalier
 */

/**
 * The promise under this Deferred.
 * @property {Promise} promise
 */

/**
 * @inheritdoc Resolver#resolve
 * @method resolve
 * @return {undefined}
 */

/**
 * @inheritdoc Resolver#reject
 * @method reject
 * @return {undefined}
 */

/**
 * @inheritdoc Resolver#notify
 * @method notify
 */

/**
 * The resolver represents responsibility--the responsibility of fulfilling or rejecting the associated promise.
 * This responsibility may be given out separately from the promise itself.
 * @property {Resolver} resolver
 */
