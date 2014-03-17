/**
 * @class Function
 * @abstract
 */

/**
 * The Function constructor creates a new Function object. In JavaScript every function is actually a Function object.
 * @method constructor
 * @param {...*} [arg] Names to be used by the function as formal argument names. Each must be a string that corresponds to a valid JavaScript identifier or a list of such strings separated with a comma; for example "x", "theValue", or "a,b".
 * @param {String} [functionBody] A string containing the JavaScript statements comprising the function definition.
 */

/**
 * Calls (executes) a method of another object in the context of a different object (the calling object); arguments can be passed as they are.
 * @static
 * @inheritable
 * @method call
 * @param {Object} thisArg The value of this provided for the call to fun. Note that this may not be the actual value seen by the method: if the method is a function in non-strict mode code, `null` and `undefined` will be replaced with the global object, and primitive values will be boxed.
 * @param {...*} [arg] Arguments for the object.
 */

/**
 * Applies the method of another object in the context of a different object (the calling object); arguments can be passed as an Array object.
 * @static
 * @inheritable
 * @method apply
 * @param {Object} thisArg The value of this provided for the call to fun. Note that this may not be the actual value seen by the method: if the method is a function in non-strict mode code, `null` and `undefined` will be replaced with the global object, and primitive values will be boxed.
 * @param {Array} [argsArray] An array-like object, specifying the arguments with which fun should be called, or `null` or `undefined` if no arguments should be provided to the function. Starting with ECMAScript 5 these arguments can be a generic array-like object instead of an array.
 */