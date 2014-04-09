/**
 * A deferred is a convenience {promise, resolver} pair. Its promise and resolver parts can be given
 * out to separate groups of consumers and producers, respectively, to allow safe, one-way communication.
 *
 * <div class="notice">
 * Documentation for this class comes from <a href="https://github.com/cujojs/when/blob/master/docs/api.md#deferred">when.js</a>
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
 * @inheritdoc when#resolve
 * @method resolve
 * @return {undefined}
 */

/**
 * @inheritdoc when#reject
 * @method reject
 * @return {undefined}
 */

/**
 * Notify about the promise progress.
 * @method notify
 */

/**
 * The resolver represents responsibility--the responsibility of fulfilling or rejecting the associated promise.
 * This responsibility may be given out separately from the promise itself.
 * @property {Object} resolver
 * @property {Function} resolver.resolve
 * @property {Function} resolver.reject
 * @property {Function} resolver.notify
 */
