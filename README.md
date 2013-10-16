# Troop JS

````
  ____ .     ____  ____  ____    ____.
  \   (/_\___\  (__\  (__\  (\___\  (/
  / ._/  ( . _   \  . /   . /  . _   \_
_/    ___/   /____ /  \_ /  \_    ____/
\   _/ \____/   \____________/   /
 \_t:_____r:_______o:____o:___p:/ <JS/>
````

# TroopJS Overview

## What TroopJS is

TroopJS is by it's core a lightweight, component-based, least obtrusive JavaScript framework with complete AMD compliance.
Unlike many of the other JavaScript libraries, it doesn't impose you on either a predefined set of features, or
a particular way of layering your application, but really aiming at provide a transparent yet solid foundation for the
convenience of composing your web app, that scales from a simple TODO list to an fairy complex page in reality that
possibly utilize a number of other libraries.

## What TroopJS isn't
- isn't a UI Framework or DOM library;
- isn't yet another JavaScript MVC;
- isn't a jQuery extension;
- isn't a fully competent web SDK


## Core Concepts
Here are some concepts and principles that we following when building TroopJS:

### Component
Considering component as the building block of TroopJS, also the smallest autonomy unit, a component is defined by any
number of constructors and mixins, to distinguish with any regular object, the component is to have a life-cycle
that will trigger certain signals on different phases.

### First-class Mixin
In TroopJS we use mixin for composing object, instead of relying on prototype-based inheritance, where the
multi-tiered inheritance hierarchies often lead to subtypes redundancies and unmanageable error prune code,
for audience that are unfamiliar with mixin:

> Mixin is a class that defines a set of functions relating to a type (e.g. Person, Circle, Observer).
> Mixins classes are usually considered abstract in that they will not themselves be instantiated – instead their
> functions are copied (or ‘borrowed’) by concrete classes as a means of ‘inheriting’ behaviour without entering
> into a formal relationship with the behaviour provider.

### Advice
Advice is AOP alike functional pattern that defines `before`, `after` and `around` methods.
It's used to modify existing functions by adding custom code, or implement method overriding (aka. super call), so
the decorator requires neither the knowledge of the original function, nor the reference to the original object.

### Declaratives
Declaratives are simply "special" functions that defined on an object, reserved for particular purpose, they have a
nµaming pattern that can be easily distinguished with other methods fields, indicating that they're not likely to be
invoked directly, specifically **signal** and **subscription** in TroopJS are declared in this form.

### Event
Event is the primary way how component communicates, not only does each component allowing to emit
their own events, a special category of events that are emitted on a public hub establishes a cheap yet flexible way
for connecting completely decoupled components, this ubiquitous channel in the air is called pub/sub, around
this concept TroopJS recommend having public provider register feature as services on hub, so on the other end consumer
will never engage others directly by reference, eventually make each module testable and removable.

In addition, the event emitting is completely open-ended and naturally asynchronous, any listener that return a Promise value is
considered as asynchronous, thus subsequent event handlers will be waiting for the resolution of the promise to proceed.

## Build

### The bundle

This repository is considered the bundle (main) repository of TroopJS, where other sub modules and dependencies are
managed as [Bower][bower] components, all is built as a whole from the bundle repo with [Grunt][grunt], the default
build will result in an AMD package with **three artifacts** in destination folder, that are gradually escalated in size.
The modules to be included are explicitly specified in the corresponding profile.

  * micro.(min).js - Including just the core and some fundamental browser modules.
  * mini.(min).js - Adding the data package and requirejs (plugins) package to "micro".
  * maxi.(min).js - Adding the rest of other modules to "mini".

### Versioning

We're following the [semantic version 2.0 spec][semver] for versioning, with the metadata denoted by git ref of
the release branch's head, the version within package.json looks like `2.0.2-4+1a1f731`.

There's a `troopjs/version` module bundled in the artifact as well, that helps to check the version in runtime,
this version string will not have the additional git metadata which looks like: `2.0.2-4`.

## Continuous Integration

We use [Travis][travis] for integration test, currently deployed on Github hook, that runs the default build upon each pull request.

[![Build Status](https://travis-ci.org/troopjs/troopjs-bundle.png)](https://travis-ci.org/troopjs/troopjs-bundle)


[bower]: http://bower.io
[grunt]: http://gruntjs.com
[travis]: https://travis-ci.org
[semver]: http://semver.org/