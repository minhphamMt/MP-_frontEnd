var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component4.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component4(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop2() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty2.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement2(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement2(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement2(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop2, noop2) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement2(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement2(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component4.prototype.isReactComponent = {};
      Component4.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component4.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component4.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component4.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty2 = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement2(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component4;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty2.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty2.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty2.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement2;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop2, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState2, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState2,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create2, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create2, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create2, deps);
      };
      exports.useInsertionEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create2, deps);
      };
      exports.useLayoutEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create2, deps);
      };
      exports.useMemo = function(create2, deps) {
        return resolveDispatcher().useMemo(create2, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState2) {
        return resolveDispatcher().useState(initialState2);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.2.3";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/react-dom/cjs/react-dom.development.js
var require_react_dom_development = __commonJS({
  "node_modules/react-dom/cjs/react-dom.development.js"(exports) {
    "use strict";
    (function() {
      function noop2() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function createPortal$1(children, containerInfo, implementation) {
        var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        try {
          testStringCoercion(key);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        JSCompiler_inline_result && (console.error(
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          "function" === typeof Symbol && Symbol.toStringTag && key[Symbol.toStringTag] || key.constructor.name || "Object"
        ), testStringCoercion(key));
        return {
          $$typeof: REACT_PORTAL_TYPE,
          key: null == key ? null : "" + key,
          children,
          containerInfo,
          implementation
        };
      }
      function getCrossOriginStringAs(as, input) {
        if ("font" === as) return "";
        if ("string" === typeof input)
          return "use-credentials" === input ? input : "";
      }
      function getValueDescriptorExpectingObjectForWarning(thing) {
        return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : 'something with type "' + typeof thing + '"';
      }
      function getValueDescriptorExpectingEnumForWarning(thing) {
        return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : "string" === typeof thing ? JSON.stringify(thing) : "number" === typeof thing ? "`" + thing + "`" : 'something with type "' + typeof thing + '"';
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React16 = require_react(), Internals = {
        d: {
          f: noop2,
          r: function() {
            throw Error(
              "Invalid form element. requestFormReset must be passed a form that was rendered by React."
            );
          },
          D: noop2,
          C: noop2,
          L: noop2,
          m: noop2,
          X: noop2,
          S: noop2,
          M: noop2
        },
        p: 0,
        findDOMNode: null
      }, REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), ReactSharedInternals = React16.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      "function" === typeof Map && null != Map.prototype && "function" === typeof Map.prototype.forEach && "function" === typeof Set && null != Set.prototype && "function" === typeof Set.prototype.clear && "function" === typeof Set.prototype.forEach || console.error(
        "React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"
      );
      exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
      exports.createPortal = function(children, container) {
        var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType)
          throw Error("Target container is not a DOM element.");
        return createPortal$1(children, container, null, key);
      };
      exports.flushSync = function(fn) {
        var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
        try {
          if (ReactSharedInternals.T = null, Internals.p = 2, fn)
            return fn();
        } finally {
          ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f() && console.error(
            "flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task."
          );
        }
      };
      exports.preconnect = function(href, options) {
        "string" === typeof href && href ? null != options && "object" !== typeof options ? console.error(
          "ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.",
          getValueDescriptorExpectingEnumForWarning(options)
        ) : null != options && "string" !== typeof options.crossOrigin && console.error(
          "ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.",
          getValueDescriptorExpectingObjectForWarning(options.crossOrigin)
        ) : console.error(
          "ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
          getValueDescriptorExpectingObjectForWarning(href)
        );
        "string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
      };
      exports.prefetchDNS = function(href) {
        if ("string" !== typeof href || !href)
          console.error(
            "ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
            getValueDescriptorExpectingObjectForWarning(href)
          );
        else if (1 < arguments.length) {
          var options = arguments[1];
          "object" === typeof options && options.hasOwnProperty("crossOrigin") ? console.error(
            "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
            getValueDescriptorExpectingEnumForWarning(options)
          ) : console.error(
            "ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.",
            getValueDescriptorExpectingEnumForWarning(options)
          );
        }
        "string" === typeof href && Internals.d.D(href);
      };
      exports.preinit = function(href, options) {
        "string" === typeof href && href ? null == options || "object" !== typeof options ? console.error(
          "ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.",
          getValueDescriptorExpectingEnumForWarning(options)
        ) : "style" !== options.as && "script" !== options.as && console.error(
          'ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are "style" and "script".',
          getValueDescriptorExpectingEnumForWarning(options.as)
        ) : console.error(
          "ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.",
          getValueDescriptorExpectingObjectForWarning(href)
        );
        if ("string" === typeof href && options && "string" === typeof options.as) {
          var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
          "style" === as ? Internals.d.S(
            href,
            "string" === typeof options.precedence ? options.precedence : void 0,
            {
              crossOrigin,
              integrity,
              fetchPriority
            }
          ) : "script" === as && Internals.d.X(href, {
            crossOrigin,
            integrity,
            fetchPriority,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0
          });
        }
      };
      exports.preinitModule = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "script" !== options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingEnumForWarning(options.as) + ".");
        if (encountered)
          console.error(
            "ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s",
            encountered
          );
        else
          switch (encountered = options && "string" === typeof options.as ? options.as : "script", encountered) {
            case "script":
              break;
            default:
              encountered = getValueDescriptorExpectingEnumForWarning(encountered), console.error(
                'ReactDOM.preinitModule(): Currently the only supported "as" type for this function is "script" but received "%s" instead. This warning was generated for `href` "%s". In the future other module types will be supported, aligning with the import-attributes proposal. Learn more here: (https://github.com/tc39/proposal-import-attributes)',
                encountered,
                href
              );
          }
        if ("string" === typeof href)
          if ("object" === typeof options && null !== options) {
            if (null == options.as || "script" === options.as)
              encountered = getCrossOriginStringAs(
                options.as,
                options.crossOrigin
              ), Internals.d.M(href, {
                crossOrigin: encountered,
                integrity: "string" === typeof options.integrity ? options.integrity : void 0,
                nonce: "string" === typeof options.nonce ? options.nonce : void 0
              });
          } else null == options && Internals.d.M(href);
      };
      exports.preload = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        null == options || "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : "string" === typeof options.as && options.as || (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
        encountered && console.error(
          'ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel="preload" as="..." />` tag.%s',
          encountered
        );
        if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
          encountered = options.as;
          var crossOrigin = getCrossOriginStringAs(
            encountered,
            options.crossOrigin
          );
          Internals.d.L(href, encountered, {
            crossOrigin,
            integrity: "string" === typeof options.integrity ? options.integrity : void 0,
            nonce: "string" === typeof options.nonce ? options.nonce : void 0,
            type: "string" === typeof options.type ? options.type : void 0,
            fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
            referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
            imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
            imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
            media: "string" === typeof options.media ? options.media : void 0
          });
        }
      };
      exports.preloadModule = function(href, options) {
        var encountered = "";
        "string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
        void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "string" !== typeof options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
        encountered && console.error(
          'ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel="modulepreload" as="..." />` tag.%s',
          encountered
        );
        "string" === typeof href && (options ? (encountered = getCrossOriginStringAs(
          options.as,
          options.crossOrigin
        ), Internals.d.m(href, {
          as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
          crossOrigin: encountered,
          integrity: "string" === typeof options.integrity ? options.integrity : void 0
        })) : Internals.d.m(href));
      };
      exports.requestFormReset = function(form) {
        Internals.d.r(form);
      };
      exports.unstable_batchedUpdates = function(fn, a) {
        return fn(a);
      };
      exports.useFormState = function(action, initialState2, permalink) {
        return resolveDispatcher().useFormState(action, initialState2, permalink);
      };
      exports.useFormStatus = function() {
        return resolveDispatcher().useHostTransitionStatus();
      };
      exports.version = "19.2.3";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react-dom/index.js
var require_react_dom = __commonJS({
  "node_modules/react-dom/index.js"(exports, module) {
    "use strict";
    if (false) {
      checkDCE();
      module.exports = null;
    } else {
      module.exports = require_react_dom_development();
    }
  }
});

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl, createStore;
var init_vanilla = __esm({
  "node_modules/zustand/esm/vanilla.mjs"() {
    createStoreImpl = (createState) => {
      let state;
      const listeners = /* @__PURE__ */ new Set();
      const setState = (partial, replace2) => {
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
          const previousState = state;
          state = (replace2 != null ? replace2 : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
          listeners.forEach((listener) => listener(state, previousState));
        }
      };
      const getState = () => state;
      const getInitialState = () => initialState2;
      const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      };
      const api2 = { setState, getState, getInitialState, subscribe };
      const initialState2 = state = createState(setState, getState, api2);
      return api2;
    };
    createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);
  }
});

// node_modules/zustand/esm/react.mjs
function useStore(api2, selector = identity) {
  const slice = import_react4.default.useSyncExternalStore(
    api2.subscribe,
    import_react4.default.useCallback(() => selector(api2.getState()), [api2, selector]),
    import_react4.default.useCallback(() => selector(api2.getInitialState()), [api2, selector])
  );
  import_react4.default.useDebugValue(slice);
  return slice;
}
var import_react4, identity, createImpl, create;
var init_react = __esm({
  "node_modules/zustand/esm/react.mjs"() {
    import_react4 = __toESM(require_react(), 1);
    init_vanilla();
    identity = (arg) => arg;
    createImpl = (createState) => {
      const api2 = createStore(createState);
      const useBoundStore = (selector) => useStore(api2, selector);
      Object.assign(useBoundStore, api2);
      return useBoundStore;
    };
    create = ((createState) => createState ? createImpl(createState) : createImpl);
  }
});

// node_modules/zustand/esm/index.mjs
var init_esm = __esm({
  "node_modules/zustand/esm/index.mjs"() {
    init_vanilla();
    init_react();
  }
});

// node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
var init_bind = __esm({
  "node_modules/axios/lib/helpers/bind.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/utils.js
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
var toString, getPrototypeOf, iterator, toStringTag, kindOf, kindOfTest, typeOfTest, isArray, isUndefined, isArrayBuffer, isString, isFunction, isNumber, isObject, isBoolean, isPlainObject, isEmptyObject, isDate, isFile, isBlob, isFileList, isStream, isFormData, isURLSearchParams, isReadableStream, isRequest, isResponse, isHeaders, trim, _global, isContextDefined, extend, stripBOM, inherits, toFlatObject, endsWith, toArray, isTypedArray, forEachEntry, matchAll, isHTMLForm, toCamelCase, hasOwnProperty, isRegExp, reduceDescriptors, freezeMethods, toObjectSet, noop, toFiniteNumber, toJSONObject, isAsyncFn, isThenable, _setImmediate, asap, isIterable2, utils_default;
var init_utils = __esm({
  "node_modules/axios/lib/utils.js"() {
    "use strict";
    init_bind();
    ({ toString } = Object.prototype);
    ({ getPrototypeOf } = Object);
    ({ iterator, toStringTag } = Symbol);
    kindOf = /* @__PURE__ */ ((cache) => (thing) => {
      const str = toString.call(thing);
      return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(/* @__PURE__ */ Object.create(null));
    kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type;
    };
    typeOfTest = (type) => (thing) => typeof thing === type;
    ({ isArray } = Array);
    isUndefined = typeOfTest("undefined");
    isArrayBuffer = kindOfTest("ArrayBuffer");
    isString = typeOfTest("string");
    isFunction = typeOfTest("function");
    isNumber = typeOfTest("number");
    isObject = (thing) => thing !== null && typeof thing === "object";
    isBoolean = (thing) => thing === true || thing === false;
    isPlainObject = (val) => {
      if (kindOf(val) !== "object") {
        return false;
      }
      const prototype3 = getPrototypeOf(val);
      return (prototype3 === null || prototype3 === Object.prototype || Object.getPrototypeOf(prototype3) === null) && !(toStringTag in val) && !(iterator in val);
    };
    isEmptyObject = (val) => {
      if (!isObject(val) || isBuffer(val)) {
        return false;
      }
      try {
        return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
      } catch (e) {
        return false;
      }
    };
    isDate = kindOfTest("Date");
    isFile = kindOfTest("File");
    isBlob = kindOfTest("Blob");
    isFileList = kindOfTest("FileList");
    isStream = (val) => isObject(val) && isFunction(val.pipe);
    isFormData = (thing) => {
      let kind;
      return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
      kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
    };
    isURLSearchParams = kindOfTest("URLSearchParams");
    [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
    trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    _global = (() => {
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
    })();
    isContextDefined = (context) => !isUndefined(context) && context !== _global;
    extend = (a, b, thisArg, { allOwnKeys } = {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, { allOwnKeys });
      return a;
    };
    stripBOM = (content) => {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    };
    inherits = (constructor, superConstructor, props, descriptors2) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, "super", {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };
    toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};
      destObj = destObj || {};
      if (sourceObj == null) return destObj;
      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
      return destObj;
    };
    endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === void 0 || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
    toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };
    isTypedArray = /* @__PURE__ */ ((TypedArray) => {
      return (thing) => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
    forEachEntry = (obj, fn) => {
      const generator = obj && obj[iterator];
      const _iterator = generator.call(obj);
      let result;
      while ((result = _iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };
    matchAll = (regExp, str) => {
      let matches;
      const arr = [];
      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }
      return arr;
    };
    isHTMLForm = kindOfTest("HTMLFormElement");
    toCamelCase = (str) => {
      return str.toLowerCase().replace(
        /[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };
    hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
    isRegExp = kindOfTest("RegExp");
    reduceDescriptors = (obj, reducer) => {
      const descriptors2 = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};
      forEach(descriptors2, (descriptor, name) => {
        let ret;
        if ((ret = reducer(descriptor, name, obj)) !== false) {
          reducedDescriptors[name] = ret || descriptor;
        }
      });
      Object.defineProperties(obj, reducedDescriptors);
    };
    freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
          return false;
        }
        const value = obj[name];
        if (!isFunction(value)) return;
        descriptor.enumerable = false;
        if ("writable" in descriptor) {
          descriptor.writable = false;
          return;
        }
        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error("Can not rewrite read-only method '" + name + "'");
          };
        }
      });
    };
    toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};
      const define = (arr) => {
        arr.forEach((value) => {
          obj[value] = true;
        });
      };
      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
      return obj;
    };
    noop = () => {
    };
    toFiniteNumber = (value, defaultValue) => {
      return value != null && Number.isFinite(value = +value) ? value : defaultValue;
    };
    toJSONObject = (obj) => {
      const stack = new Array(10);
      const visit = (source, i) => {
        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }
          if (isBuffer(source)) {
            return source;
          }
          if (!("toJSON" in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};
            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });
            stack[i] = void 0;
            return target;
          }
        }
        return source;
      };
      return visit(obj, 0);
    };
    isAsyncFn = kindOfTest("AsyncFunction");
    isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
    _setImmediate = ((setImmediateSupported, postMessageSupported) => {
      if (setImmediateSupported) {
        return setImmediate;
      }
      return postMessageSupported ? ((token, callbacks) => {
        _global.addEventListener("message", ({ source, data: data2 }) => {
          if (source === _global && data2 === token) {
            callbacks.length && callbacks.shift()();
          }
        }, false);
        return (cb) => {
          callbacks.push(cb);
          _global.postMessage(token, "*");
        };
      })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
    })(
      typeof setImmediate === "function",
      isFunction(_global.postMessage)
    );
    asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
    isIterable2 = (thing) => thing != null && isFunction(thing[iterator]);
    utils_default = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isEmptyObject,
      isReadableStream,
      isRequest,
      isResponse,
      isHeaders,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty,
      // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable,
      setImmediate: _setImmediate,
      asap,
      isIterable: isIterable2
    };
  }
});

// node_modules/axios/lib/core/AxiosError.js
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
var prototype, descriptors, AxiosError_default;
var init_AxiosError = __esm({
  "node_modules/axios/lib/core/AxiosError.js"() {
    "use strict";
    init_utils();
    utils_default.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: utils_default.toJSONObject(this.config),
          code: this.code,
          status: this.status
        };
      }
    });
    prototype = AxiosError.prototype;
    descriptors = {};
    [
      "ERR_BAD_OPTION_VALUE",
      "ERR_BAD_OPTION",
      "ECONNABORTED",
      "ETIMEDOUT",
      "ERR_NETWORK",
      "ERR_FR_TOO_MANY_REDIRECTS",
      "ERR_DEPRECATED",
      "ERR_BAD_RESPONSE",
      "ERR_BAD_REQUEST",
      "ERR_CANCELED",
      "ERR_NOT_SUPPORT",
      "ERR_INVALID_URL"
      // eslint-disable-next-line func-names
    ].forEach((code) => {
      descriptors[code] = { value: code };
    });
    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype, "isAxiosError", { value: true });
    AxiosError.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype);
      utils_default.toFlatObject(error, axiosError, function filter2(obj) {
        return obj !== Error.prototype;
      }, (prop) => {
        return prop !== "isAxiosError";
      });
      const msg = error && error.message ? error.message : "Error";
      const errCode = code == null && error ? error.code : code;
      AxiosError.call(axiosError, msg, errCode, config, request, response);
      if (error && axiosError.cause == null) {
        Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
      }
      axiosError.name = error && error.name || "Error";
      customProps && Object.assign(axiosError, customProps);
      return axiosError;
    };
    AxiosError_default = AxiosError;
  }
});

// node_modules/axios/lib/helpers/null.js
var null_default;
var init_null = __esm({
  "node_modules/axios/lib/helpers/null.js"() {
    null_default = null;
  }
});

// node_modules/axios/lib/helpers/toFormData.js
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (null_default || FormData)();
  options = utils_default.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils_default.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (utils_default.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils_default.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils_default.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var predicates, toFormData_default;
var init_toFormData = __esm({
  "node_modules/axios/lib/helpers/toFormData.js"() {
    "use strict";
    init_utils();
    init_AxiosError();
    init_null();
    predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });
    toFormData_default = toFormData;
  }
});

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype2, AxiosURLSearchParams_default;
var init_AxiosURLSearchParams = __esm({
  "node_modules/axios/lib/helpers/AxiosURLSearchParams.js"() {
    "use strict";
    init_toFormData();
    prototype2 = AxiosURLSearchParams.prototype;
    prototype2.append = function append(name, value) {
      this._pairs.push([name, value]);
    };
    prototype2.toString = function toString2(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode);
      } : encode;
      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + "=" + _encode(pair[1]);
      }, "").join("&");
    };
    AxiosURLSearchParams_default = AxiosURLSearchParams;
  }
});

// node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode2;
  if (utils_default.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
var init_buildURL = __esm({
  "node_modules/axios/lib/helpers/buildURL.js"() {
    "use strict";
    init_utils();
    init_AxiosURLSearchParams();
  }
});

// node_modules/axios/lib/core/InterceptorManager.js
var InterceptorManager, InterceptorManager_default;
var init_InterceptorManager = __esm({
  "node_modules/axios/lib/core/InterceptorManager.js"() {
    "use strict";
    init_utils();
    InterceptorManager = class {
      constructor() {
        this.handlers = [];
      }
      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }
      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {void}
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }
      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }
      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils_default.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    };
    InterceptorManager_default = InterceptorManager;
  }
});

// node_modules/axios/lib/defaults/transitional.js
var transitional_default;
var init_transitional = __esm({
  "node_modules/axios/lib/defaults/transitional.js"() {
    "use strict";
    transitional_default = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };
  }
});

// node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
var URLSearchParams_default;
var init_URLSearchParams = __esm({
  "node_modules/axios/lib/platform/browser/classes/URLSearchParams.js"() {
    "use strict";
    init_AxiosURLSearchParams();
    URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;
  }
});

// node_modules/axios/lib/platform/browser/classes/FormData.js
var FormData_default;
var init_FormData = __esm({
  "node_modules/axios/lib/platform/browser/classes/FormData.js"() {
    "use strict";
    FormData_default = typeof FormData !== "undefined" ? FormData : null;
  }
});

// node_modules/axios/lib/platform/browser/classes/Blob.js
var Blob_default;
var init_Blob = __esm({
  "node_modules/axios/lib/platform/browser/classes/Blob.js"() {
    "use strict";
    Blob_default = typeof Blob !== "undefined" ? Blob : null;
  }
});

// node_modules/axios/lib/platform/browser/index.js
var browser_default;
var init_browser = __esm({
  "node_modules/axios/lib/platform/browser/index.js"() {
    init_URLSearchParams();
    init_FormData();
    init_Blob();
    browser_default = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams_default,
        FormData: FormData_default,
        Blob: Blob_default
      },
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  }
});

// node_modules/axios/lib/platform/common/utils.js
var utils_exports = {};
__export(utils_exports, {
  hasBrowserEnv: () => hasBrowserEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
  navigator: () => _navigator,
  origin: () => origin
});
var hasBrowserEnv, _navigator, hasStandardBrowserEnv, hasStandardBrowserWebWorkerEnv, origin;
var init_utils2 = __esm({
  "node_modules/axios/lib/platform/common/utils.js"() {
    hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
    _navigator = typeof navigator === "object" && navigator || void 0;
    hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
    hasStandardBrowserWebWorkerEnv = (() => {
      return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
      self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
    })();
    origin = hasBrowserEnv && window.location.href || "http://localhost";
  }
});

// node_modules/axios/lib/platform/index.js
var platform_default;
var init_platform = __esm({
  "node_modules/axios/lib/platform/index.js"() {
    init_browser();
    init_utils2();
    platform_default = {
      ...utils_exports,
      ...browser_default
    };
  }
});

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data2, options) {
  return toFormData_default(data2, new platform_default.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
var init_toURLEncodedForm = __esm({
  "node_modules/axios/lib/helpers/toURLEncodedForm.js"() {
    "use strict";
    init_utils();
    init_toFormData();
    init_platform();
  }
});

// node_modules/axios/lib/helpers/formDataToJSON.js
function parsePropPath(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default;
var init_formDataToJSON = __esm({
  "node_modules/axios/lib/helpers/formDataToJSON.js"() {
    "use strict";
    init_utils();
    formDataToJSON_default = formDataToJSON;
  }
});

// node_modules/axios/lib/defaults/index.js
function stringifySafely(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
var defaults, defaults_default;
var init_defaults = __esm({
  "node_modules/axios/lib/defaults/index.js"() {
    "use strict";
    init_utils();
    init_AxiosError();
    init_transitional();
    init_toFormData();
    init_toURLEncodedForm();
    init_platform();
    init_formDataToJSON();
    defaults = {
      transitional: transitional_default,
      adapter: ["xhr", "http", "fetch"],
      transformRequest: [function transformRequest(data2, headers) {
        const contentType = headers.getContentType() || "";
        const hasJSONContentType = contentType.indexOf("application/json") > -1;
        const isObjectPayload = utils_default.isObject(data2);
        if (isObjectPayload && utils_default.isHTMLForm(data2)) {
          data2 = new FormData(data2);
        }
        const isFormData2 = utils_default.isFormData(data2);
        if (isFormData2) {
          return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data2)) : data2;
        }
        if (utils_default.isArrayBuffer(data2) || utils_default.isBuffer(data2) || utils_default.isStream(data2) || utils_default.isFile(data2) || utils_default.isBlob(data2) || utils_default.isReadableStream(data2)) {
          return data2;
        }
        if (utils_default.isArrayBufferView(data2)) {
          return data2.buffer;
        }
        if (utils_default.isURLSearchParams(data2)) {
          headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
          return data2.toString();
        }
        let isFileList2;
        if (isObjectPayload) {
          if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return toURLEncodedForm(data2, this.formSerializer).toString();
          }
          if ((isFileList2 = utils_default.isFileList(data2)) || contentType.indexOf("multipart/form-data") > -1) {
            const _FormData = this.env && this.env.FormData;
            return toFormData_default(
              isFileList2 ? { "files[]": data2 } : data2,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }
        if (isObjectPayload || hasJSONContentType) {
          headers.setContentType("application/json", false);
          return stringifySafely(data2);
        }
        return data2;
      }],
      transformResponse: [function transformResponse(data2) {
        const transitional2 = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
        const JSONRequested = this.responseType === "json";
        if (utils_default.isResponse(data2) || utils_default.isReadableStream(data2)) {
          return data2;
        }
        if (data2 && utils_default.isString(data2) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
          const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;
          try {
            return JSON.parse(data2, this.parseReviver);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === "SyntaxError") {
                throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }
        return data2;
      }],
      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      maxContentLength: -1,
      maxBodyLength: -1,
      env: {
        FormData: platform_default.classes.FormData,
        Blob: platform_default.classes.Blob
      },
      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },
      headers: {
        common: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": void 0
        }
      }
    };
    utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
      defaults.headers[method] = {};
    });
    defaults_default = defaults;
  }
});

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf, parseHeaders_default;
var init_parseHeaders = __esm({
  "node_modules/axios/lib/helpers/parseHeaders.js"() {
    "use strict";
    init_utils();
    ignoreDuplicateOf = utils_default.toObjectSet([
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent"
    ]);
    parseHeaders_default = (rawHeaders) => {
      const parsed = {};
      let key;
      let val;
      let i;
      rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
        i = line.indexOf(":");
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();
        if (!key || parsed[key] && ignoreDuplicateOf[key]) {
          return;
        }
        if (key === "set-cookie") {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
        }
      });
      return parsed;
    };
  }
});

// node_modules/axios/lib/core/AxiosHeaders.js
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value)) return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
var $internals, isValidHeaderName, AxiosHeaders, AxiosHeaders_default;
var init_AxiosHeaders = __esm({
  "node_modules/axios/lib/core/AxiosHeaders.js"() {
    "use strict";
    init_utils();
    init_parseHeaders();
    $internals = /* @__PURE__ */ Symbol("internals");
    isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
    AxiosHeaders = class {
      constructor(headers) {
        headers && this.set(headers);
      }
      set(header, valueOrRewrite, rewrite) {
        const self2 = this;
        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);
          if (!lHeader) {
            throw new Error("header name must be a non-empty string");
          }
          const key = utils_default.findKey(self2, lHeader);
          if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
            self2[key || _header] = normalizeValue(_value);
          }
        }
        const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
        if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders_default(header), valueOrRewrite);
        } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
          let obj = {}, dest, key;
          for (const entry of header) {
            if (!utils_default.isArray(entry)) {
              throw TypeError("Object iterator must return a key-value pair");
            }
            obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
          }
          setHeaders(obj, valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }
        return this;
      }
      get(header, parser) {
        header = normalizeHeader(header);
        if (header) {
          const key = utils_default.findKey(this, header);
          if (key) {
            const value = this[key];
            if (!parser) {
              return value;
            }
            if (parser === true) {
              return parseTokens(value);
            }
            if (utils_default.isFunction(parser)) {
              return parser.call(this, value, key);
            }
            if (utils_default.isRegExp(parser)) {
              return parser.exec(value);
            }
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
      has(header, matcher) {
        header = normalizeHeader(header);
        if (header) {
          const key = utils_default.findKey(this, header);
          return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }
        return false;
      }
      delete(header, matcher) {
        const self2 = this;
        let deleted = false;
        function deleteHeader(_header) {
          _header = normalizeHeader(_header);
          if (_header) {
            const key = utils_default.findKey(self2, _header);
            if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
              delete self2[key];
              deleted = true;
            }
          }
        }
        if (utils_default.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }
        return deleted;
      }
      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;
        while (i--) {
          const key = keys[i];
          if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }
        return deleted;
      }
      normalize(format) {
        const self2 = this;
        const headers = {};
        utils_default.forEach(this, (value, header) => {
          const key = utils_default.findKey(headers, header);
          if (key) {
            self2[key] = normalizeValue(value);
            delete self2[header];
            return;
          }
          const normalized = format ? formatHeader(header) : String(header).trim();
          if (normalized !== header) {
            delete self2[header];
          }
          self2[normalized] = normalizeValue(value);
          headers[normalized] = true;
        });
        return this;
      }
      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }
      toJSON(asStrings) {
        const obj = /* @__PURE__ */ Object.create(null);
        utils_default.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
        });
        return obj;
      }
      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
      }
      getSetCookie() {
        return this.get("set-cookie") || [];
      }
      get [Symbol.toStringTag]() {
        return "AxiosHeaders";
      }
      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }
      static concat(first, ...targets) {
        const computed = new this(first);
        targets.forEach((target) => computed.set(target));
        return computed;
      }
      static accessor(header) {
        const internals = this[$internals] = this[$internals] = {
          accessors: {}
        };
        const accessors = internals.accessors;
        const prototype3 = this.prototype;
        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);
          if (!accessors[lHeader]) {
            buildAccessors(prototype3, _header);
            accessors[lHeader] = true;
          }
        }
        utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
        return this;
      }
    };
    AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
    utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
      let mapped = key[0].toUpperCase() + key.slice(1);
      return {
        get: () => value,
        set(headerValue) {
          this[mapped] = headerValue;
        }
      };
    });
    utils_default.freezeMethods(AxiosHeaders);
    AxiosHeaders_default = AxiosHeaders;
  }
});

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data2 = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data2 = fn.call(config, data2, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data2;
}
var init_transformData = __esm({
  "node_modules/axios/lib/core/transformData.js"() {
    "use strict";
    init_utils();
    init_defaults();
    init_AxiosHeaders();
  }
});

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}
var init_isCancel = __esm({
  "node_modules/axios/lib/cancel/isCancel.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/cancel/CanceledError.js
function CanceledError(message, config, request) {
  AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
var CanceledError_default;
var init_CanceledError = __esm({
  "node_modules/axios/lib/cancel/CanceledError.js"() {
    "use strict";
    init_AxiosError();
    init_utils();
    utils_default.inherits(CanceledError, AxiosError_default, {
      __CANCEL__: true
    });
    CanceledError_default = CanceledError;
  }
});

// node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError_default(
      "Request failed with status code " + response.status,
      [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
var init_settle = __esm({
  "node_modules/axios/lib/core/settle.js"() {
    "use strict";
    init_AxiosError();
  }
});

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
var init_parseProtocol = __esm({
  "node_modules/axios/lib/helpers/parseProtocol.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
var speedometer_default;
var init_speedometer = __esm({
  "node_modules/axios/lib/helpers/speedometer.js"() {
    "use strict";
    speedometer_default = speedometer;
  }
});

// node_modules/axios/lib/helpers/throttle.js
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
var throttle_default;
var init_throttle = __esm({
  "node_modules/axios/lib/helpers/throttle.js"() {
    throttle_default = throttle;
  }
});

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer, progressEventDecorator, asyncDecorator;
var init_progressEventReducer = __esm({
  "node_modules/axios/lib/helpers/progressEventReducer.js"() {
    init_speedometer();
    init_throttle();
    init_utils();
    progressEventReducer = (listener, isDownloadStream, freq = 3) => {
      let bytesNotified = 0;
      const _speedometer = speedometer_default(50, 250);
      return throttle_default((e) => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : void 0;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;
        bytesNotified = loaded;
        const data2 = {
          loaded,
          total,
          progress: total ? loaded / total : void 0,
          bytes: progressBytes,
          rate: rate ? rate : void 0,
          estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
          event: e,
          lengthComputable: total != null,
          [isDownloadStream ? "download" : "upload"]: true
        };
        listener(data2);
      }, freq);
    };
    progressEventDecorator = (total, throttled) => {
      const lengthComputable = total != null;
      return [(loaded) => throttled[0]({
        lengthComputable,
        total,
        loaded
      }), throttled[1]];
    };
    asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));
  }
});

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default;
var init_isURLSameOrigin = __esm({
  "node_modules/axios/lib/helpers/isURLSameOrigin.js"() {
    init_platform();
    isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
      url = new URL(url, platform_default.origin);
      return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
    })(
      new URL(platform_default.origin),
      platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
    ) : () => true;
  }
});

// node_modules/axios/lib/helpers/cookies.js
var cookies_default;
var init_cookies = __esm({
  "node_modules/axios/lib/helpers/cookies.js"() {
    init_utils();
    init_platform();
    cookies_default = platform_default.hasStandardBrowserEnv ? (
      // Standard browser envs support document.cookie
      {
        write(name, value, expires, path, domain, secure, sameSite) {
          if (typeof document === "undefined") return;
          const cookie = [`${name}=${encodeURIComponent(value)}`];
          if (utils_default.isNumber(expires)) {
            cookie.push(`expires=${new Date(expires).toUTCString()}`);
          }
          if (utils_default.isString(path)) {
            cookie.push(`path=${path}`);
          }
          if (utils_default.isString(domain)) {
            cookie.push(`domain=${domain}`);
          }
          if (secure === true) {
            cookie.push("secure");
          }
          if (utils_default.isString(sameSite)) {
            cookie.push(`SameSite=${sameSite}`);
          }
          document.cookie = cookie.join("; ");
        },
        read(name) {
          if (typeof document === "undefined") return null;
          const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
          return match ? decodeURIComponent(match[1]) : null;
        },
        remove(name) {
          this.write(name, "", Date.now() - 864e5, "/");
        }
      }
    ) : (
      // Non-standard browser env (web workers, react-native) lack needed support.
      {
        write() {
        },
        read() {
          return null;
        },
        remove() {
        }
      }
    );
  }
});

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
var init_isAbsoluteURL = __esm({
  "node_modules/axios/lib/helpers/isAbsoluteURL.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
var init_combineURLs = __esm({
  "node_modules/axios/lib/helpers/combineURLs.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
var init_buildFullPath = __esm({
  "node_modules/axios/lib/core/buildFullPath.js"() {
    "use strict";
    init_isAbsoluteURL();
    init_combineURLs();
  }
});

// node_modules/axios/lib/core/mergeConfig.js
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
var headersToObject;
var init_mergeConfig = __esm({
  "node_modules/axios/lib/core/mergeConfig.js"() {
    "use strict";
    init_utils();
    init_AxiosHeaders();
    headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
  }
});

// node_modules/axios/lib/helpers/resolveConfig.js
var resolveConfig_default;
var init_resolveConfig = __esm({
  "node_modules/axios/lib/helpers/resolveConfig.js"() {
    init_platform();
    init_utils();
    init_isURLSameOrigin();
    init_cookies();
    init_buildFullPath();
    init_mergeConfig();
    init_AxiosHeaders();
    init_buildURL();
    resolveConfig_default = (config) => {
      const newConfig = mergeConfig({}, config);
      let { data: data2, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
      newConfig.headers = headers = AxiosHeaders_default.from(headers);
      newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
      if (auth) {
        headers.set(
          "Authorization",
          "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
        );
      }
      if (utils_default.isFormData(data2)) {
        if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
          headers.setContentType(void 0);
        } else if (utils_default.isFunction(data2.getHeaders)) {
          const formHeaders = data2.getHeaders();
          const allowedHeaders = ["content-type", "content-length"];
          Object.entries(formHeaders).forEach(([key, val]) => {
            if (allowedHeaders.includes(key.toLowerCase())) {
              headers.set(key, val);
            }
          });
        }
      }
      if (platform_default.hasStandardBrowserEnv) {
        withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
        if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
          const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
          if (xsrfValue) {
            headers.set(xsrfHeaderName, xsrfValue);
          }
        }
      }
      return newConfig;
    };
  }
});

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported, xhr_default;
var init_xhr = __esm({
  "node_modules/axios/lib/adapters/xhr.js"() {
    init_utils();
    init_settle();
    init_transitional();
    init_AxiosError();
    init_CanceledError();
    init_parseProtocol();
    init_platform();
    init_AxiosHeaders();
    init_progressEventReducer();
    init_resolveConfig();
    isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
    xhr_default = isXHRAdapterSupported && function(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        const _config = resolveConfig_default(config);
        let requestData = _config.data;
        const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
        let { responseType, onUploadProgress, onDownloadProgress } = _config;
        let onCanceled;
        let uploadThrottled, downloadThrottled;
        let flushUpload, flushDownload;
        function done() {
          flushUpload && flushUpload();
          flushDownload && flushDownload();
          _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
          _config.signal && _config.signal.removeEventListener("abort", onCanceled);
        }
        let request = new XMLHttpRequest();
        request.open(_config.method.toUpperCase(), _config.url, true);
        request.timeout = _config.timeout;
        function onloadend() {
          if (!request) {
            return;
          }
          const responseHeaders = AxiosHeaders_default.from(
            "getAllResponseHeaders" in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };
          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);
          request = null;
        }
        if ("onloadend" in request) {
          request.onloadend = onloadend;
        } else {
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
              return;
            }
            setTimeout(onloadend);
          };
        }
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }
          reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
          request = null;
        };
        request.onerror = function handleError(event) {
          const msg = event && event.message ? event.message : "Network Error";
          const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
          err.event = event || null;
          reject(err);
          request = null;
        };
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
          const transitional2 = _config.transitional || transitional_default;
          if (_config.timeoutErrorMessage) {
            timeoutErrorMessage = _config.timeoutErrorMessage;
          }
          reject(new AxiosError_default(
            timeoutErrorMessage,
            transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
            config,
            request
          ));
          request = null;
        };
        requestData === void 0 && requestHeaders.setContentType(null);
        if ("setRequestHeader" in request) {
          utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }
        if (!utils_default.isUndefined(_config.withCredentials)) {
          request.withCredentials = !!_config.withCredentials;
        }
        if (responseType && responseType !== "json") {
          request.responseType = _config.responseType;
        }
        if (onDownloadProgress) {
          [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
          request.addEventListener("progress", downloadThrottled);
        }
        if (onUploadProgress && request.upload) {
          [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
          request.upload.addEventListener("progress", uploadThrottled);
          request.upload.addEventListener("loadend", flushUpload);
        }
        if (_config.cancelToken || _config.signal) {
          onCanceled = (cancel) => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
            request.abort();
            request = null;
          };
          _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
          if (_config.signal) {
            _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
          }
        }
        const protocol = parseProtocol(_config.url);
        if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
          return;
        }
        request.send(requestData || null);
      });
    };
  }
});

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals, composeSignals_default;
var init_composeSignals = __esm({
  "node_modules/axios/lib/helpers/composeSignals.js"() {
    init_CanceledError();
    init_AxiosError();
    init_utils();
    composeSignals = (signals, timeout) => {
      const { length } = signals = signals ? signals.filter(Boolean) : [];
      if (timeout || length) {
        let controller = new AbortController();
        let aborted;
        const onabort = function(reason) {
          if (!aborted) {
            aborted = true;
            unsubscribe();
            const err = reason instanceof Error ? reason : this.reason;
            controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
          }
        };
        let timer = timeout && setTimeout(() => {
          timer = null;
          onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
        }, timeout);
        const unsubscribe = () => {
          if (signals) {
            timer && clearTimeout(timer);
            timer = null;
            signals.forEach((signal2) => {
              signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
            });
            signals = null;
          }
        };
        signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
        const { signal } = controller;
        signal.unsubscribe = () => utils_default.asap(unsubscribe);
        return signal;
      }
    };
    composeSignals_default = composeSignals;
  }
});

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk, readBytes, readStream, trackStream;
var init_trackStream = __esm({
  "node_modules/axios/lib/helpers/trackStream.js"() {
    streamChunk = function* (chunk, chunkSize) {
      let len = chunk.byteLength;
      if (!chunkSize || len < chunkSize) {
        yield chunk;
        return;
      }
      let pos = 0;
      let end;
      while (pos < len) {
        end = pos + chunkSize;
        yield chunk.slice(pos, end);
        pos = end;
      }
    };
    readBytes = async function* (iterable, chunkSize) {
      for await (const chunk of readStream(iterable)) {
        yield* streamChunk(chunk, chunkSize);
      }
    };
    readStream = async function* (stream) {
      if (stream[Symbol.asyncIterator]) {
        yield* stream;
        return;
      }
      const reader = stream.getReader();
      try {
        for (; ; ) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          yield value;
        }
      } finally {
        await reader.cancel();
      }
    };
    trackStream = (stream, chunkSize, onProgress, onFinish) => {
      const iterator2 = readBytes(stream, chunkSize);
      let bytes = 0;
      let done;
      let _onFinish = (e) => {
        if (!done) {
          done = true;
          onFinish && onFinish(e);
        }
      };
      return new ReadableStream({
        async pull(controller) {
          try {
            const { done: done2, value } = await iterator2.next();
            if (done2) {
              _onFinish();
              controller.close();
              return;
            }
            let len = value.byteLength;
            if (onProgress) {
              let loadedBytes = bytes += len;
              onProgress(loadedBytes);
            }
            controller.enqueue(new Uint8Array(value));
          } catch (err) {
            _onFinish(err);
            throw err;
          }
        },
        cancel(reason) {
          _onFinish(reason);
          return iterator2.return();
        }
      }, {
        highWaterMark: 2
      });
    };
  }
});

// node_modules/axios/lib/adapters/fetch.js
var DEFAULT_CHUNK_SIZE, isFunction2, globalFetchAPI, ReadableStream2, TextEncoder2, test, factory, seedCache, getFetch, adapter;
var init_fetch = __esm({
  "node_modules/axios/lib/adapters/fetch.js"() {
    init_platform();
    init_utils();
    init_AxiosError();
    init_composeSignals();
    init_trackStream();
    init_AxiosHeaders();
    init_progressEventReducer();
    init_resolveConfig();
    init_settle();
    DEFAULT_CHUNK_SIZE = 64 * 1024;
    ({ isFunction: isFunction2 } = utils_default);
    globalFetchAPI = (({ Request: Request2, Response: Response2 }) => ({
      Request: Request2,
      Response: Response2
    }))(utils_default.global);
    ({
      ReadableStream: ReadableStream2,
      TextEncoder: TextEncoder2
    } = utils_default.global);
    test = (fn, ...args) => {
      try {
        return !!fn(...args);
      } catch (e) {
        return false;
      }
    };
    factory = (env) => {
      env = utils_default.merge.call({
        skipUndefined: true
      }, globalFetchAPI, env);
      const { fetch: envFetch, Request: Request2, Response: Response2 } = env;
      const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
      const isRequestSupported = isFunction2(Request2);
      const isResponseSupported = isFunction2(Response2);
      if (!isFetchSupported) {
        return false;
      }
      const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
      const encodeText = isFetchSupported && (typeof TextEncoder2 === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder2()) : async (str) => new Uint8Array(await new Request2(str).arrayBuffer()));
      const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
        let duplexAccessed = false;
        const hasContentType = new Request2(platform_default.origin, {
          body: new ReadableStream2(),
          method: "POST",
          get duplex() {
            duplexAccessed = true;
            return "half";
          }
        }).headers.has("Content-Type");
        return duplexAccessed && !hasContentType;
      });
      const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response2("").body));
      const resolvers = {
        stream: supportsResponseStream && ((res) => res.body)
      };
      isFetchSupported && (() => {
        ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
          !resolvers[type] && (resolvers[type] = (res, config) => {
            let method = res && res[type];
            if (method) {
              return method.call(res);
            }
            throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
          });
        });
      })();
      const getBodyLength = async (body) => {
        if (body == null) {
          return 0;
        }
        if (utils_default.isBlob(body)) {
          return body.size;
        }
        if (utils_default.isSpecCompliantForm(body)) {
          const _request = new Request2(platform_default.origin, {
            method: "POST",
            body
          });
          return (await _request.arrayBuffer()).byteLength;
        }
        if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
          return body.byteLength;
        }
        if (utils_default.isURLSearchParams(body)) {
          body = body + "";
        }
        if (utils_default.isString(body)) {
          return (await encodeText(body)).byteLength;
        }
      };
      const resolveBodyLength = async (headers, body) => {
        const length = utils_default.toFiniteNumber(headers.getContentLength());
        return length == null ? getBodyLength(body) : length;
      };
      return async (config) => {
        let {
          url,
          method,
          data: data2,
          signal,
          cancelToken,
          timeout,
          onDownloadProgress,
          onUploadProgress,
          responseType,
          headers,
          withCredentials = "same-origin",
          fetchOptions
        } = resolveConfig_default(config);
        let _fetch = envFetch || fetch;
        responseType = responseType ? (responseType + "").toLowerCase() : "text";
        let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
        let request = null;
        const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
          composedSignal.unsubscribe();
        });
        let requestContentLength;
        try {
          if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data2)) !== 0) {
            let _request = new Request2(url, {
              method: "POST",
              body: data2,
              duplex: "half"
            });
            let contentTypeHeader;
            if (utils_default.isFormData(data2) && (contentTypeHeader = _request.headers.get("content-type"))) {
              headers.setContentType(contentTypeHeader);
            }
            if (_request.body) {
              const [onProgress, flush] = progressEventDecorator(
                requestContentLength,
                progressEventReducer(asyncDecorator(onUploadProgress))
              );
              data2 = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
            }
          }
          if (!utils_default.isString(withCredentials)) {
            withCredentials = withCredentials ? "include" : "omit";
          }
          const isCredentialsSupported = isRequestSupported && "credentials" in Request2.prototype;
          const resolvedOptions = {
            ...fetchOptions,
            signal: composedSignal,
            method: method.toUpperCase(),
            headers: headers.normalize().toJSON(),
            body: data2,
            duplex: "half",
            credentials: isCredentialsSupported ? withCredentials : void 0
          };
          request = isRequestSupported && new Request2(url, resolvedOptions);
          let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
          const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
          if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
            const options = {};
            ["status", "statusText", "headers"].forEach((prop) => {
              options[prop] = response[prop];
            });
            const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
            const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
              responseContentLength,
              progressEventReducer(asyncDecorator(onDownloadProgress), true)
            ) || [];
            response = new Response2(
              trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
                flush && flush();
                unsubscribe && unsubscribe();
              }),
              options
            );
          }
          responseType = responseType || "text";
          let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
          !isStreamResponse && unsubscribe && unsubscribe();
          return await new Promise((resolve, reject) => {
            settle(resolve, reject, {
              data: responseData,
              headers: AxiosHeaders_default.from(response.headers),
              status: response.status,
              statusText: response.statusText,
              config,
              request
            });
          });
        } catch (err) {
          unsubscribe && unsubscribe();
          if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
            throw Object.assign(
              new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request),
              {
                cause: err.cause || err
              }
            );
          }
          throw AxiosError_default.from(err, err && err.code, config, request);
        }
      };
    };
    seedCache = /* @__PURE__ */ new Map();
    getFetch = (config) => {
      let env = config && config.env || {};
      const { fetch: fetch2, Request: Request2, Response: Response2 } = env;
      const seeds = [
        Request2,
        Response2,
        fetch2
      ];
      let len = seeds.length, i = len, seed, target, map = seedCache;
      while (i--) {
        seed = seeds[i];
        target = map.get(seed);
        target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
        map = target;
      }
      return target;
    };
    adapter = getFetch();
  }
});

// node_modules/axios/lib/adapters/adapters.js
function getAdapter(adapters, config) {
  adapters = utils_default.isArray(adapters) ? adapters : [adapters];
  const { length } = adapters;
  let nameOrAdapter;
  let adapter2;
  const rejectedReasons = {};
  for (let i = 0; i < length; i++) {
    nameOrAdapter = adapters[i];
    let id;
    adapter2 = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter2 === void 0) {
        throw new AxiosError_default(`Unknown adapter '${id}'`);
      }
    }
    if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
      break;
    }
    rejectedReasons[id || "#" + i] = adapter2;
  }
  if (!adapter2) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError_default(
      `There is no suitable adapter to dispatch the request ` + s,
      "ERR_NOT_SUPPORT"
    );
  }
  return adapter2;
}
var knownAdapters, renderReason, isResolvedHandle, adapters_default;
var init_adapters = __esm({
  "node_modules/axios/lib/adapters/adapters.js"() {
    init_utils();
    init_null();
    init_xhr();
    init_fetch();
    init_AxiosError();
    knownAdapters = {
      http: null_default,
      xhr: xhr_default,
      fetch: {
        get: getFetch
      }
    };
    utils_default.forEach(knownAdapters, (fn, value) => {
      if (fn) {
        try {
          Object.defineProperty(fn, "name", { value });
        } catch (e) {
        }
        Object.defineProperty(fn, "adapterName", { value });
      }
    });
    renderReason = (reason) => `- ${reason}`;
    isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false;
    adapters_default = {
      /**
       * Resolve an adapter from a list of adapter names or functions.
       * @type {Function}
       */
      getAdapter,
      /**
       * Exposes all known adapters
       * @type {Object<string, Function|Object>}
       */
      adapters: knownAdapters
    };
  }
});

// node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
  return adapter2(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders_default.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
var init_dispatchRequest = __esm({
  "node_modules/axios/lib/core/dispatchRequest.js"() {
    "use strict";
    init_transformData();
    init_isCancel();
    init_defaults();
    init_CanceledError();
    init_AxiosHeaders();
    init_adapters();
  }
});

// node_modules/axios/lib/env/data.js
var VERSION;
var init_data = __esm({
  "node_modules/axios/lib/env/data.js"() {
    VERSION = "1.13.2";
  }
});

// node_modules/axios/lib/helpers/validator.js
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === void 0 || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validators, deprecatedWarnings, validator_default;
var init_validator = __esm({
  "node_modules/axios/lib/helpers/validator.js"() {
    "use strict";
    init_data();
    init_AxiosError();
    validators = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
      validators[type] = function validator(thing) {
        return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
      };
    });
    deprecatedWarnings = {};
    validators.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
      }
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError_default(
            formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
            AxiosError_default.ERR_DEPRECATED
          );
        }
        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          console.warn(
            formatMessage(
              opt,
              " has been deprecated since v" + version + " and will be removed in the near future"
            )
          );
        }
        return validator ? validator(value, opt, opts) : true;
      };
    };
    validators.spelling = function spelling(correctSpelling) {
      return (value, opt) => {
        console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
        return true;
      };
    };
    validator_default = {
      assertOptions,
      validators
    };
  }
});

// node_modules/axios/lib/core/Axios.js
var validators2, Axios, Axios_default;
var init_Axios = __esm({
  "node_modules/axios/lib/core/Axios.js"() {
    "use strict";
    init_utils();
    init_buildURL();
    init_InterceptorManager();
    init_dispatchRequest();
    init_mergeConfig();
    init_buildFullPath();
    init_validator();
    init_AxiosHeaders();
    validators2 = validator_default.validators;
    Axios = class {
      constructor(instanceConfig) {
        this.defaults = instanceConfig || {};
        this.interceptors = {
          request: new InterceptorManager_default(),
          response: new InterceptorManager_default()
        };
      }
      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      async request(configOrUrl, config) {
        try {
          return await this._request(configOrUrl, config);
        } catch (err) {
          if (err instanceof Error) {
            let dummy = {};
            Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
            const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
            try {
              if (!err.stack) {
                err.stack = stack;
              } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
                err.stack += "\n" + stack;
              }
            } catch (e) {
            }
          }
          throw err;
        }
      }
      _request(configOrUrl, config) {
        if (typeof configOrUrl === "string") {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }
        config = mergeConfig(this.defaults, config);
        const { transitional: transitional2, paramsSerializer, headers } = config;
        if (transitional2 !== void 0) {
          validator_default.assertOptions(transitional2, {
            silentJSONParsing: validators2.transitional(validators2.boolean),
            forcedJSONParsing: validators2.transitional(validators2.boolean),
            clarifyTimeoutError: validators2.transitional(validators2.boolean)
          }, false);
        }
        if (paramsSerializer != null) {
          if (utils_default.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator_default.assertOptions(paramsSerializer, {
              encode: validators2.function,
              serialize: validators2.function
            }, true);
          }
        }
        if (config.allowAbsoluteUrls !== void 0) {
        } else if (this.defaults.allowAbsoluteUrls !== void 0) {
          config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
        } else {
          config.allowAbsoluteUrls = true;
        }
        validator_default.assertOptions(config, {
          baseUrl: validators2.spelling("baseURL"),
          withXsrfToken: validators2.spelling("withXSRFToken")
        }, true);
        config.method = (config.method || this.defaults.method || "get").toLowerCase();
        let contextHeaders = headers && utils_default.merge(
          headers.common,
          headers[config.method]
        );
        headers && utils_default.forEach(
          ["delete", "get", "head", "post", "put", "patch", "common"],
          (method) => {
            delete headers[method];
          }
        );
        config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
            return;
          }
          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });
        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });
        let promise;
        let i = 0;
        let len;
        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), void 0];
          chain.unshift(...requestInterceptorChain);
          chain.push(...responseInterceptorChain);
          len = chain.length;
          promise = Promise.resolve(config);
          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }
          return promise;
        }
        len = requestInterceptorChain.length;
        let newConfig = config;
        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }
        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }
        i = 0;
        len = responseInterceptorChain.length;
        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }
        return promise;
      }
      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    };
    utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });
    utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data2, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              "Content-Type": "multipart/form-data"
            } : {},
            url,
            data: data2
          }));
        };
      }
      Axios.prototype[method] = generateHTTPMethod();
      Axios.prototype[method + "Form"] = generateHTTPMethod(true);
    });
    Axios_default = Axios;
  }
});

// node_modules/axios/lib/cancel/CancelToken.js
var CancelToken, CancelToken_default;
var init_CancelToken = __esm({
  "node_modules/axios/lib/cancel/CancelToken.js"() {
    "use strict";
    init_CanceledError();
    CancelToken = class _CancelToken {
      constructor(executor) {
        if (typeof executor !== "function") {
          throw new TypeError("executor must be a function.");
        }
        let resolvePromise;
        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });
        const token = this;
        this.promise.then((cancel) => {
          if (!token._listeners) return;
          let i = token._listeners.length;
          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });
        this.promise.then = (onfulfilled) => {
          let _resolve;
          const promise = new Promise((resolve) => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);
          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };
          return promise;
        };
        executor(function cancel(message, config, request) {
          if (token.reason) {
            return;
          }
          token.reason = new CanceledError_default(message, config, request);
          resolvePromise(token.reason);
        });
      }
      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }
      /**
       * Subscribe to the cancel signal
       */
      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }
        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }
      /**
       * Unsubscribe from the cancel signal
       */
      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }
      toAbortSignal() {
        const controller = new AbortController();
        const abort = (err) => {
          controller.abort(err);
        };
        this.subscribe(abort);
        controller.signal.unsubscribe = () => this.unsubscribe(abort);
        return controller.signal;
      }
      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new _CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    };
    CancelToken_default = CancelToken;
  }
});

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
var init_spread = __esm({
  "node_modules/axios/lib/helpers/spread.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}
var init_isAxiosError = __esm({
  "node_modules/axios/lib/helpers/isAxiosError.js"() {
    "use strict";
    init_utils();
  }
});

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode, HttpStatusCode_default;
var init_HttpStatusCode = __esm({
  "node_modules/axios/lib/helpers/HttpStatusCode.js"() {
    HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
      WebServerIsDown: 521,
      ConnectionTimedOut: 522,
      OriginIsUnreachable: 523,
      TimeoutOccurred: 524,
      SslHandshakeFailed: 525,
      InvalidSslCertificate: 526
    };
    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });
    HttpStatusCode_default = HttpStatusCode;
  }
});

// node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create2(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios, axios_default;
var init_axios = __esm({
  "node_modules/axios/lib/axios.js"() {
    "use strict";
    init_utils();
    init_bind();
    init_Axios();
    init_mergeConfig();
    init_defaults();
    init_formDataToJSON();
    init_CanceledError();
    init_CancelToken();
    init_isCancel();
    init_data();
    init_toFormData();
    init_AxiosError();
    init_spread();
    init_isAxiosError();
    init_AxiosHeaders();
    init_adapters();
    init_HttpStatusCode();
    axios = createInstance(defaults_default);
    axios.Axios = Axios_default;
    axios.CanceledError = CanceledError_default;
    axios.CancelToken = CancelToken_default;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData_default;
    axios.AxiosError = AxiosError_default;
    axios.Cancel = axios.CanceledError;
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;
    axios.isAxiosError = isAxiosError;
    axios.mergeConfig = mergeConfig;
    axios.AxiosHeaders = AxiosHeaders_default;
    axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
    axios.getAdapter = adapters_default.getAdapter;
    axios.HttpStatusCode = HttpStatusCode_default;
    axios.default = axios;
    axios_default = axios;
  }
});

// node_modules/axios/index.js
var Axios2, AxiosError2, CanceledError2, isCancel2, CancelToken2, VERSION2, all2, Cancel, isAxiosError2, spread2, toFormData2, AxiosHeaders2, HttpStatusCode2, formToJSON, getAdapter2, mergeConfig2;
var init_axios2 = __esm({
  "node_modules/axios/index.js"() {
    init_axios();
    ({
      Axios: Axios2,
      AxiosError: AxiosError2,
      CanceledError: CanceledError2,
      isCancel: isCancel2,
      CancelToken: CancelToken2,
      VERSION: VERSION2,
      all: all2,
      Cancel,
      isAxiosError: isAxiosError2,
      spread: spread2,
      toFormData: toFormData2,
      AxiosHeaders: AxiosHeaders2,
      HttpStatusCode: HttpStatusCode2,
      formToJSON,
      getAdapter: getAdapter2,
      mergeConfig: mergeConfig2
    } = axios_default);
  }
});

// src/api/auth.api.js
var loginApi, registerApi, artistLoginApi, artistRegisterApi, verifyEmailApi, resendVerificationApi, firebaseLoginApi, forgotPasswordApi, resetPasswordApi, logoutApi, getMeApi;
var init_auth_api = __esm({
  "src/api/auth.api.js"() {
    init_axios3();
    loginApi = (payload) => axios_default2.post("/auth/login", payload);
    registerApi = (payload) => axios_default2.post("/auth/register", payload);
    artistLoginApi = (payload) => axios_default2.post("/auth/artist/login", payload);
    artistRegisterApi = (payload) => axios_default2.post("/auth/artist/register", payload);
    verifyEmailApi = (payload) => axios_default2.post("/auth/verify-email", payload);
    resendVerificationApi = (payload) => axios_default2.post("/auth/resend-verification", payload);
    firebaseLoginApi = (payload) => axios_default2.post("/auth/firebase", payload);
    forgotPasswordApi = (payload) => axios_default2.post("/auth/forgot-password", payload);
    resetPasswordApi = (payload) => axios_default2.post("/auth/reset-password", payload);
    logoutApi = (refreshToken) => axios_default2.post("/auth/logout", { refreshToken });
    getMeApi = () => axios_default2.get("/users/me");
  }
});

// src/utils/routeContext.js
function normalizePathname2(pathname = "/") {
  const value = String(pathname || "/").trim();
  if (!value || value === "/") return "/";
  const nextPathname = value.startsWith("/") ? value : `/${value}`;
  return nextPathname.replace(/\/+$/, "") || "/";
}
function isArtistWorkspacePath(pathname = "/") {
  const normalizedPathname = normalizePathname2(pathname);
  if (normalizedPathname === "/artist") return true;
  const segments = normalizedPathname.split("/").filter(Boolean);
  return segments[0] === "artist" && ARTIST_WORKSPACE_SEGMENTS.has(segments[1] || "");
}
function shouldUseArtistTheme({
  pathname = "/",
  search = "",
  role = null,
  authContext = "default"
} = {}) {
  const normalizedPathname = normalizePathname2(pathname);
  if (normalizedPathname === "/artist-auth" || normalizedPathname === "/artist-request" || isArtistWorkspacePath(normalizedPathname)) {
    return true;
  }
  if (normalizedPathname === "/verify-email" && new URLSearchParams(search || "").get("intent") === "artist") {
    return true;
  }
  if (normalizedPathname === "/me" && (role === "ARTIST" || authContext === "artist_request")) {
    return true;
  }
  return false;
}
function getPreferredAuthPath({
  pathname = "/",
  search = "",
  role = null,
  authContext = "default",
  fallback = "/login"
} = {}) {
  if (role === "ARTIST" || authContext === "artist_request" || shouldUseArtistTheme({ pathname, search, role, authContext })) {
    return "/artist-auth";
  }
  return fallback === "/artist-auth" ? "/artist-auth" : "/login";
}
var ARTIST_WORKSPACE_SEGMENTS;
var init_routeContext = __esm({
  "src/utils/routeContext.js"() {
    ARTIST_WORKSPACE_SEGMENTS = /* @__PURE__ */ new Set([
      "dashboard",
      "profile",
      "albums",
      "songs",
      "trash"
    ]);
  }
});

// src/api/like.api.js
var getLikedSongs, likeAlbum, unlikeAlbum, getLikedAlbums;
var init_like_api = __esm({
  "src/api/like.api.js"() {
    init_axios3();
    getLikedSongs = () => axios_default2.get("/songs/liked");
    likeAlbum = (albumId) => axios_default2.post(`/albums/${albumId}/like`);
    unlikeAlbum = (albumId) => axios_default2.delete(`/albums/${albumId}/like`);
    getLikedAlbums = () => axios_default2.get("/users/me/liked-albums");
  }
});

// src/utils/authPrompt.js
var AUTH_REQUIRED_EVENT, DEFAULT_MESSAGE, emitAuthRequired;
var init_authPrompt = __esm({
  "src/utils/authPrompt.js"() {
    AUTH_REQUIRED_EVENT = "app:auth-required";
    DEFAULT_MESSAGE = "Vui l\xF2ng \u0111\u0103ng nh\u1EADp \u0111\u1EC3 t\u1EADn h\u01B0\u1EDFng th\xEAm nhi\u1EC1u t\xEDnh n\u0103ng.";
    emitAuthRequired = (message = DEFAULT_MESSAGE) => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent(AUTH_REQUIRED_EVENT, {
          detail: { message }
        })
      );
    };
  }
});

// src/store/album-like.store.js
var album_like_store_exports = {};
__export(album_like_store_exports, {
  default: () => album_like_store_default,
  normalizeAlbumId: () => normalizeAlbumId
});
var normalizeAlbumId, extractAlbumsFromResponse, useAlbumLikeStore, album_like_store_default;
var init_album_like_store = __esm({
  "src/store/album-like.store.js"() {
    init_esm();
    init_like_api();
    init_auth_store();
    init_authPrompt();
    normalizeAlbumId = (album) => {
      const rawId = album?.id ?? album?._id ?? album?.album_id ?? album?.albumId ?? album?.album?._id ?? album?.album?.id ?? album;
      if (rawId === void 0 || rawId === null) return null;
      return String(rawId);
    };
    extractAlbumsFromResponse = (payload) => {
      const sources = [
        payload?.data,
        payload?.data?.data,
        payload?.data?.albums,
        payload?.data?.items,
        payload?.albums,
        payload?.items,
        payload
      ];
      return sources.find(Array.isArray) || [];
    };
    useAlbumLikeStore = create((set, get) => ({
      likedAlbumIds: [],
      likedAlbumsLoading: false,
      likedAlbumsLoaded: false,
      resetForAuthChange: () => set({
        likedAlbumIds: [],
        likedAlbumsLoading: false,
        likedAlbumsLoaded: false
      }),
      setLikedAlbumIds: (albumIds = []) => {
        const ids = [
          ...new Set(
            (albumIds || []).map((album) => normalizeAlbumId(album)).filter((id) => id !== null && id !== "")
          )
        ];
        set({
          likedAlbumIds: ids,
          likedAlbumsLoading: false,
          likedAlbumsLoaded: true
        });
      },
      ensureLikedAlbumsLoaded: async () => get().loadLikedAlbums(),
      loadLikedAlbums: async ({ force = false } = {}) => {
        const { isAuthenticated } = auth_store_default.getState();
        const { likedAlbumsLoading, likedAlbumsLoaded, likedAlbumIds } = get();
        if (!isAuthenticated) {
          set({
            likedAlbumIds: [],
            likedAlbumsLoading: false,
            likedAlbumsLoaded: false
          });
          return [];
        }
        if (likedAlbumsLoading) return likedAlbumIds;
        if (likedAlbumsLoaded && !force) return likedAlbumIds;
        set({ likedAlbumsLoading: true });
        try {
          const res = await getLikedAlbums();
          const albums = extractAlbumsFromResponse(res);
          const ids = [
            ...new Set(
              albums.map((album) => normalizeAlbumId(album)).filter((id) => id !== null && id !== "")
            )
          ];
          set({
            likedAlbumIds: ids,
            likedAlbumsLoading: false,
            likedAlbumsLoaded: true
          });
          return ids;
        } catch (err) {
          console.error("Load liked albums error", err);
          set({
            likedAlbumsLoading: false,
            likedAlbumsLoaded: likedAlbumIds.length > 0
          });
          return likedAlbumIds;
        }
      },
      toggleAlbumLike: async (albumId) => {
        const targetId = normalizeAlbumId(albumId);
        if (!targetId) return;
        const { isAuthenticated } = auth_store_default.getState();
        if (!isAuthenticated) {
          emitAuthRequired();
          return;
        }
        if (!get().likedAlbumsLoaded) {
          await get().ensureLikedAlbumsLoaded();
        }
        const { likedAlbumIds } = get();
        const isLiked = likedAlbumIds.includes(targetId);
        set({
          likedAlbumIds: isLiked ? likedAlbumIds.filter((id) => id !== targetId) : [...likedAlbumIds, targetId],
          likedAlbumsLoaded: true
        });
        try {
          if (isLiked) {
            await unlikeAlbum(targetId);
          } else {
            await likeAlbum(targetId);
          }
        } catch (err) {
          console.error("Toggle album like error", err);
          set({ likedAlbumIds, likedAlbumsLoaded: true });
        }
      }
    }));
    album_like_store_default = useAlbumLikeStore;
  }
});

// src/api/artist.api.js
var followArtist, unfollowArtist, getFollowedArtists;
var init_artist_api = __esm({
  "src/api/artist.api.js"() {
    init_axios3();
    followArtist = (artistId) => axios_default2.post(`/artists/${artistId}/follow`);
    unfollowArtist = (artistId) => axios_default2.delete(`/artists/${artistId}/follow`);
    getFollowedArtists = () => axios_default2.get("/users/me/followed-artists");
  }
});

// src/store/artist-follow.store.js
var artist_follow_store_exports = {};
__export(artist_follow_store_exports, {
  default: () => artist_follow_store_default
});
var normalizeArtistId, resolveSongCount, normalizeFollowedArtist, useArtistFollowStore, artist_follow_store_default;
var init_artist_follow_store = __esm({
  "src/store/artist-follow.store.js"() {
    init_esm();
    init_artist_api();
    normalizeArtistId = (artist) => {
      const rawId = artist?.id ?? artist?.artist_id ?? artist?.artistId ?? artist?.artist?.id ?? artist;
      if (rawId === void 0 || rawId === null) return null;
      return String(rawId);
    };
    resolveSongCount = (artist) => artist?.song_count ?? artist?.track_count ?? artist?.songs_count ?? artist?.songs?.length ?? artist?.artist?.song_count ?? artist?.artist?.track_count ?? artist?.artist?.songs_count ?? artist?.artist?.songs?.length ?? 0;
    normalizeFollowedArtist = (artist) => ({
      id: artist?.id ?? artist?.artist_id ?? artist?.artistId,
      name: artist?.name ?? artist?.artist_name ?? artist?.alias ?? "Ngh\u1EC7 s\u0129",
      alias: artist?.alias,
      short_bio: artist?.short_bio,
      avatar_url: artist?.avatar_url,
      cover_url: artist?.cover_url ?? artist?.avatar_url ?? artist?.cover,
      national: artist?.national,
      follow_count: artist?.follow_count,
      song_count: resolveSongCount(artist),
      followed_at: artist?.followed_at
    });
    useArtistFollowStore = create((set, get) => ({
      followedArtists: [],
      followedArtistIds: [],
      loading: false,
      hasLoaded: false,
      pendingIds: [],
      loadFollowedArtists: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
          const res = await getFollowedArtists();
          const raw = res?.data?.data ?? res?.data ?? [];
          const normalized = (raw || []).map(normalizeFollowedArtist);
          const ids = normalized.map((artist) => normalizeArtistId(artist)).filter(Boolean);
          set({
            followedArtists: normalized,
            followedArtistIds: ids,
            loading: false,
            hasLoaded: true
          });
        } catch (error) {
          console.error("Load followed artists failed", error);
          set({
            followedArtists: [],
            followedArtistIds: [],
            loading: false,
            hasLoaded: true
          });
        }
      },
      ensureLoaded: async () => {
        if (!get().hasLoaded && !get().loading) {
          await get().loadFollowedArtists();
        }
      },
      clearFollowedArtists: () => set({
        followedArtists: [],
        followedArtistIds: [],
        loading: false,
        hasLoaded: false,
        pendingIds: []
      }),
      isFollowing: (artistId) => {
        const id = normalizeArtistId(artistId);
        if (!id) return false;
        return get().followedArtistIds.includes(id);
      },
      followArtist: async (artist) => {
        const id = normalizeArtistId(artist);
        if (!id) return false;
        if (get().pendingIds.includes(id)) return get().isFollowing(id);
        const previous = {
          followedArtists: get().followedArtists,
          followedArtistIds: get().followedArtistIds
        };
        const normalized = normalizeFollowedArtist(artist);
        set((state) => ({
          followedArtists: state.followedArtists.some(
            (item) => normalizeArtistId(item) === id
          ) ? state.followedArtists : [normalized, ...state.followedArtists],
          followedArtistIds: state.followedArtistIds.includes(id) ? state.followedArtistIds : [id, ...state.followedArtistIds],
          pendingIds: [...state.pendingIds, id]
        }));
        try {
          await followArtist(id);
          return true;
        } catch (error) {
          console.error("Follow artist failed", error);
          set({
            followedArtists: previous.followedArtists,
            followedArtistIds: previous.followedArtistIds
          });
          return false;
        } finally {
          set((state) => ({
            pendingIds: state.pendingIds.filter((item) => item !== id)
          }));
        }
      },
      unfollowArtist: async (artistId) => {
        const id = normalizeArtistId(artistId);
        if (!id) return false;
        if (get().pendingIds.includes(id)) return get().isFollowing(id);
        const previous = {
          followedArtists: get().followedArtists,
          followedArtistIds: get().followedArtistIds
        };
        set((state) => ({
          followedArtists: state.followedArtists.filter(
            (item) => normalizeArtistId(item) !== id
          ),
          followedArtistIds: state.followedArtistIds.filter((item) => item !== id),
          pendingIds: [...state.pendingIds, id]
        }));
        try {
          await unfollowArtist(id);
          return false;
        } catch (error) {
          console.error("Unfollow artist failed", error);
          set({
            followedArtists: previous.followedArtists,
            followedArtistIds: previous.followedArtistIds
          });
          return true;
        } finally {
          set((state) => ({
            pendingIds: state.pendingIds.filter((item) => item !== id)
          }));
        }
      },
      toggleFollow: async (artist) => {
        const id = normalizeArtistId(artist);
        if (!id) return false;
        if (!get().hasLoaded && !get().loading) {
          await get().loadFollowedArtists();
        }
        if (get().loading) return get().isFollowing(id);
        if (get().isFollowing(id)) {
          return get().unfollowArtist(id);
        }
        return get().followArtist(artist);
      }
    }));
    artist_follow_store_default = useArtistFollowStore;
  }
});

// src/store/recommendation-session.store.js
var recommendation_session_store_exports = {};
__export(recommendation_session_store_exports, {
  default: () => recommendation_session_store_default
});
var normalizeUserKey, normalizeSongKey, useRecommendationSessionStore, recommendation_session_store_default;
var init_recommendation_session_store = __esm({
  "src/store/recommendation-session.store.js"() {
    init_esm();
    normalizeUserKey = (userId) => {
      if (userId === void 0 || userId === null) return null;
      return String(userId);
    };
    normalizeSongKey = (songId) => {
      if (songId === void 0 || songId === null) return null;
      return String(songId);
    };
    useRecommendationSessionStore = create((set, get) => ({
      usedSeedSongIdsByUser: {},
      getUsedSeedSongIds: (userId) => {
        const userKey = normalizeUserKey(userId);
        if (!userKey) return [];
        return get().usedSeedSongIdsByUser[userKey] || [];
      },
      markSeedSongId: (userId, songId) => {
        const userKey = normalizeUserKey(userId);
        const songKey = normalizeSongKey(songId);
        if (!userKey || !songKey) return;
        set((state) => {
          const currentIds = state.usedSeedSongIdsByUser[userKey] || [];
          if (currentIds.includes(songKey)) return state;
          return {
            usedSeedSongIdsByUser: {
              ...state.usedSeedSongIdsByUser,
              [userKey]: [...currentIds, songKey]
            }
          };
        });
      },
      clearUserSeedSongIds: (userId) => {
        const userKey = normalizeUserKey(userId);
        if (!userKey) return;
        set((state) => {
          if (!state.usedSeedSongIdsByUser[userKey]) return state;
          const nextMap = { ...state.usedSeedSongIdsByUser };
          delete nextMap[userKey];
          return {
            usedSeedSongIdsByUser: nextMap
          };
        });
      },
      resetForAuthChange: () => {
        set({ usedSeedSongIdsByUser: {} });
      }
    }));
    recommendation_session_store_default = useRecommendationSessionStore;
  }
});

// src/store/auth.store.js
var STORAGE_KEY, resetSessionStores, safeParseJson, loadStoredAuth, persistAuthState, clearStoredAuth, storedUser, storedToken, storedRefreshToken, storedRole, storedAuthContext, storedPreferredAuthPath, storedIsAuthenticated, hasStoredTokens, buildPreferredAuthPath, syncApiAuthRuntime, beginAuthRequest, isAuthRequestCurrent, useAuthStore, auth_store_default;
var init_auth_store = __esm({
  "src/store/auth.store.js"() {
    init_esm();
    init_auth_api();
    init_routeContext();
    STORAGE_KEY = "auth-state";
    resetSessionStores = async () => {
      try {
        const { default: usePlayerStore2 } = await Promise.resolve().then(() => (init_player_store(), player_store_exports));
        usePlayerStore2.getState().resetForAuthChange();
      } catch (error) {
        console.warn("Failed to reset player store", error);
      }
      try {
        const { default: useAlbumLikeStore2 } = await Promise.resolve().then(() => (init_album_like_store(), album_like_store_exports));
        useAlbumLikeStore2.getState().resetForAuthChange?.();
      } catch (error) {
        console.warn("Failed to reset album like store", error);
      }
      try {
        const { default: useArtistFollowStore2 } = await Promise.resolve().then(() => (init_artist_follow_store(), artist_follow_store_exports));
        useArtistFollowStore2.getState().clearFollowedArtists?.();
      } catch (error) {
        console.warn("Failed to reset artist follow store", error);
      }
      try {
        const { default: useRecommendationSessionStore2 } = await Promise.resolve().then(() => (init_recommendation_session_store(), recommendation_session_store_exports));
        useRecommendationSessionStore2.getState().resetForAuthChange?.();
      } catch (error) {
        console.warn("Failed to reset recommendation session store", error);
      }
    };
    safeParseJson = (value) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Failed to parse auth state", error);
        return null;
      }
    };
    loadStoredAuth = () => {
      if (typeof localStorage === "undefined") return {};
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = safeParseJson(raw);
      if (!parsed) return {};
      const user = parsed.user || null;
      const accessToken = parsed.accessToken || null;
      const refreshToken = parsed.refreshToken || null;
      const role = user?.role || parsed.role || null;
      const authContext = parsed.authContext || "default";
      const preferredAuthPath = parsed.preferredAuthPath || getPreferredAuthPath({ role, authContext });
      return {
        user,
        accessToken,
        refreshToken,
        role,
        authContext,
        preferredAuthPath,
        isAuthenticated: Boolean(user && (accessToken || refreshToken))
      };
    };
    persistAuthState = (state) => {
      if (typeof localStorage === "undefined") return;
      try {
        const payload = {
          user: state.user,
          accessToken: state.accessToken,
          role: state.role,
          authContext: state.authContext,
          refreshToken: state.refreshToken,
          preferredAuthPath: state.preferredAuthPath
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.error("Failed to persist auth state", error);
      }
    };
    clearStoredAuth = () => {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(STORAGE_KEY);
    };
    ({
      user: storedUser,
      accessToken: storedToken,
      refreshToken: storedRefreshToken,
      role: storedRole,
      authContext: storedAuthContext,
      preferredAuthPath: storedPreferredAuthPath,
      isAuthenticated: storedIsAuthenticated
    } = loadStoredAuth());
    hasStoredTokens = Boolean(storedToken || storedRefreshToken);
    buildPreferredAuthPath = ({ role = null, authContext = "default" } = {}) => getPreferredAuthPath({ role, authContext });
    syncApiAuthRuntime = ({ accessToken = null, resetPending = false } = {}) => {
      Promise.resolve().then(() => (init_axios3(), axios_exports)).then(({ syncApiAuthRuntime: syncRuntime }) => {
        syncRuntime({ accessToken, resetPending });
      }).catch((error) => {
        console.warn("Failed to sync api auth runtime", error);
      });
    };
    beginAuthRequest = (set, get) => {
      const nextVersion = (get().authRequestVersion || 0) + 1;
      set({
        loading: true,
        isAuthReady: false,
        authRequestVersion: nextVersion
      });
      return nextVersion;
    };
    isAuthRequestCurrent = (get, requestVersion) => (get().authRequestVersion || 0) === requestVersion;
    useAuthStore = create((set, get) => ({
      user: storedUser || null,
      accessToken: storedToken || null,
      refreshToken: storedRefreshToken || null,
      role: storedRole || null,
      authContext: storedAuthContext || "default",
      preferredAuthPath: storedPreferredAuthPath || buildPreferredAuthPath({
        role: storedRole || null,
        authContext: storedAuthContext || "default"
      }),
      isAuthenticated: storedIsAuthenticated || false,
      loading: false,
      isAuthReady: !hasStoredTokens,
      authRequestVersion: 0,
      setTokens: ({ accessToken, refreshToken }) => {
        const currentState = get();
        const nextState = {
          ...currentState,
          accessToken: accessToken ?? currentState.accessToken,
          refreshToken: refreshToken ?? currentState.refreshToken,
          isAuthenticated: Boolean(
            currentState.user && ((accessToken ?? currentState.accessToken) || (refreshToken ?? currentState.refreshToken))
          )
        };
        set({
          accessToken: nextState.accessToken,
          refreshToken: nextState.refreshToken,
          isAuthenticated: nextState.isAuthenticated
        });
        persistAuthState(nextState);
        syncApiAuthRuntime({ accessToken: nextState.accessToken });
      },
      setAuthContext: (authContext) => {
        const currentState = get();
        const nextState = {
          ...currentState,
          authContext,
          preferredAuthPath: buildPreferredAuthPath({
            role: currentState.role || null,
            authContext
          })
        };
        set({
          authContext,
          preferredAuthPath: nextState.preferredAuthPath
        });
        persistAuthState(nextState);
      },
      updateUser: (user) => {
        const currentState = get();
        const nextRole = user?.role || currentState.role || null;
        const nextState = {
          ...currentState,
          user,
          role: nextRole,
          preferredAuthPath: buildPreferredAuthPath({
            role: nextRole,
            authContext: currentState.authContext || "default"
          }),
          isAuthenticated: Boolean(
            user && (currentState.accessToken || currentState.refreshToken)
          )
        };
        set(nextState);
        persistAuthState(nextState);
      },
      bootstrapAuth: async () => {
        const { accessToken, refreshToken, isAuthReady } = get();
        if (isAuthReady) return get().user;
        if (!accessToken && !refreshToken) {
          set({ loading: false, isAuthReady: true, isAuthenticated: false });
          return null;
        }
        return get().loadUser();
      },
      login: async ({ email, password }) => {
        const requestVersion = beginAuthRequest(set, get);
        try {
          const res = await loginApi({ email, password });
          const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
          const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
          const user = res.data?.user || res.data?.data?.user;
          if (!accessToken || !refreshToken || !user) {
            throw new Error("Login response missing token(s) or user");
          }
          if (!isAuthRequestCurrent(get, requestVersion)) return null;
          const nextState = {
            user,
            accessToken,
            role: user.role,
            refreshToken,
            authContext: "default",
            preferredAuthPath: buildPreferredAuthPath({
              role: user.role,
              authContext: "default"
            }),
            isAuthenticated: true,
            loading: false,
            isAuthReady: true
          };
          set(nextState);
          persistAuthState(nextState);
          syncApiAuthRuntime({ accessToken });
          return user;
        } catch (error) {
          if (isAuthRequestCurrent(get, requestVersion)) {
            set({ loading: false, isAuthReady: true });
          }
          throw error;
        }
      },
      firebaseLogin: async ({ idToken }) => {
        const requestVersion = beginAuthRequest(set, get);
        try {
          const res = await firebaseLoginApi({ idToken });
          const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
          const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
          const user = res.data?.user || res.data?.data?.user;
          if (!accessToken || !refreshToken || !user) {
            throw new Error("Firebase login response missing token(s) or user");
          }
          if (!isAuthRequestCurrent(get, requestVersion)) return null;
          const nextState = {
            user,
            accessToken,
            role: user.role,
            refreshToken,
            authContext: "default",
            preferredAuthPath: buildPreferredAuthPath({
              role: user.role,
              authContext: "default"
            }),
            isAuthenticated: true,
            loading: false,
            isAuthReady: true
          };
          set(nextState);
          persistAuthState(nextState);
          syncApiAuthRuntime({ accessToken });
          return user;
        } catch (error) {
          if (isAuthRequestCurrent(get, requestVersion)) {
            set({ loading: false, isAuthReady: true });
          }
          throw error;
        }
      },
      register: async ({ email, password, display_name }) => {
        const requestVersion = beginAuthRequest(set, get);
        try {
          const res = await registerApi({
            email,
            password,
            display_name
          });
          const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
          const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
          const user = res.data?.user || res.data?.data?.user;
          const requiresEmailVerification = res.data?.requires_email_verification || res.data?.data?.requires_email_verification;
          if (requiresEmailVerification) {
            if (!isAuthRequestCurrent(get, requestVersion)) return null;
            set({ loading: false, isAuthReady: true });
            return {
              requires_email_verification: true,
              message: res.data?.message || res.data?.data?.message
            };
          }
          if (!accessToken || !refreshToken || !user) {
            throw new Error("Register response missing token(s) or user");
          }
          if (!isAuthRequestCurrent(get, requestVersion)) return null;
          const nextState = {
            user,
            accessToken,
            role: user.role,
            refreshToken,
            authContext: "default",
            preferredAuthPath: buildPreferredAuthPath({
              role: user.role,
              authContext: "default"
            }),
            isAuthenticated: true,
            loading: false,
            isAuthReady: true
          };
          set(nextState);
          persistAuthState(nextState);
          syncApiAuthRuntime({ accessToken });
          return user;
        } catch (error) {
          if (isAuthRequestCurrent(get, requestVersion)) {
            set({ loading: false, isAuthReady: true });
          }
          throw error;
        }
      },
      loadUser: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken && !refreshToken) {
          set({ loading: false, isAuthReady: true, isAuthenticated: false });
          return null;
        }
        const requestVersion = beginAuthRequest(set, get);
        try {
          const res = await getMeApi();
          const user = res.data?.data || res.data;
          if (!user?.role) {
            throw new Error("Invalid /users/me response");
          }
          if (!isAuthRequestCurrent(get, requestVersion)) return null;
          const authContext = get().authContext || "default";
          const nextState = {
            user,
            role: user.role,
            isAuthenticated: true,
            loading: false,
            isAuthReady: true,
            accessToken: get().accessToken,
            refreshToken: get().refreshToken,
            authContext,
            preferredAuthPath: buildPreferredAuthPath({
              role: user.role,
              authContext
            })
          };
          set(nextState);
          persistAuthState(nextState);
          syncApiAuthRuntime({ accessToken: nextState.accessToken });
          return user;
        } catch (error) {
          if (!isAuthRequestCurrent(get, requestVersion)) {
            return null;
          }
          console.error("Load user error", error);
          get().logout();
          return null;
        }
      },
      loginArtist: async ({ email, password }) => {
        const requestVersion = beginAuthRequest(set, get);
        try {
          const res = await artistLoginApi({ email, password });
          const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
          const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
          const user = res.data?.user || res.data?.data?.user;
          if (!accessToken || !refreshToken || !user) {
            throw new Error("Login response missing token(s) or user");
          }
          if (!isAuthRequestCurrent(get, requestVersion)) return null;
          const nextState = {
            user,
            accessToken,
            role: user.role,
            refreshToken,
            authContext: "artist_request",
            preferredAuthPath: buildPreferredAuthPath({
              role: user.role,
              authContext: "artist_request"
            }),
            isAuthenticated: true,
            loading: false,
            isAuthReady: true
          };
          set(nextState);
          persistAuthState(nextState);
          syncApiAuthRuntime({ accessToken });
          return user;
        } catch (error) {
          if (isAuthRequestCurrent(get, requestVersion)) {
            set({ loading: false, isAuthReady: true });
          }
          throw error;
        }
      },
      registerArtist: async ({ email, password, display_name }) => {
        const requestVersion = beginAuthRequest(set, get);
        try {
          const res = await artistRegisterApi({
            email,
            password,
            display_name
          });
          const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
          const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
          const user = res.data?.user || res.data?.data?.user;
          const requiresEmailVerification = res.data?.requires_email_verification || res.data?.data?.requires_email_verification;
          if (requiresEmailVerification) {
            if (!isAuthRequestCurrent(get, requestVersion)) return null;
            set({ loading: false, isAuthReady: true });
            return {
              requires_email_verification: true,
              message: res.data?.message || res.data?.data?.message
            };
          }
          if (!accessToken || !refreshToken || !user) {
            throw new Error("Register response missing token(s) or user");
          }
          if (!isAuthRequestCurrent(get, requestVersion)) return null;
          const nextState = {
            user,
            accessToken,
            role: user.role,
            refreshToken,
            authContext: "artist_request",
            preferredAuthPath: buildPreferredAuthPath({
              role: user.role,
              authContext: "artist_request"
            }),
            isAuthenticated: true,
            loading: false,
            isAuthReady: true
          };
          set(nextState);
          persistAuthState(nextState);
          syncApiAuthRuntime({ accessToken });
          return user;
        } catch (error) {
          if (isAuthRequestCurrent(get, requestVersion)) {
            set({ loading: false, isAuthReady: true });
          }
          throw error;
        }
      },
      verifyEmailRegistration: async ({
        email,
        verification_code,
        authContext = "default"
      }) => {
        const requestVersion = beginAuthRequest(set, get);
        try {
          const res = await verifyEmailApi({ email, verification_code });
          const accessToken = res.data?.accessToken || res.data?.data?.accessToken;
          const refreshToken = res.data?.refreshToken || res.data?.data?.refreshToken;
          const user = res.data?.user || res.data?.data?.user;
          if (!accessToken || !refreshToken || !user) {
            throw new Error("Verify email response missing token(s) or user");
          }
          if (!isAuthRequestCurrent(get, requestVersion)) return null;
          const nextState = {
            user,
            accessToken,
            refreshToken,
            role: user.role,
            authContext,
            preferredAuthPath: buildPreferredAuthPath({
              role: user.role,
              authContext
            }),
            isAuthenticated: true,
            loading: false,
            isAuthReady: true
          };
          set(nextState);
          persistAuthState(nextState);
          syncApiAuthRuntime({ accessToken });
          return user;
        } catch (error) {
          if (isAuthRequestCurrent(get, requestVersion)) {
            set({ loading: false, isAuthReady: true });
          }
          throw error;
        }
      },
      resendVerification: async ({ email }) => {
        const res = await resendVerificationApi({ email });
        return res.data?.message || res.data?.data?.message;
      },
      forgotPassword: async ({ email }) => {
        const res = await forgotPasswordApi({ email });
        return res.data?.message || res.data?.data?.message;
      },
      resetPassword: async ({ email, verification_code, new_password }) => {
        const res = await resetPasswordApi({
          email,
          verification_code,
          new_password
        });
        return res.data?.message || res.data?.data?.message;
      },
      logout: async ({ preferredAuthPath } = {}) => {
        const currentState = get();
        const refreshToken = currentState.refreshToken;
        const nextAuthRequestVersion = (currentState.authRequestVersion || 0) + 1;
        const nextPreferredAuthPath = preferredAuthPath || getPreferredAuthPath({
          pathname: typeof window !== "undefined" ? window.location.pathname : "/",
          search: typeof window !== "undefined" ? window.location.search : "",
          role: currentState.role,
          authContext: currentState.authContext,
          fallback: currentState.preferredAuthPath
        });
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          authContext: "default",
          preferredAuthPath: nextPreferredAuthPath,
          isAuthenticated: false,
          loading: false,
          isAuthReady: true,
          authRequestVersion: nextAuthRequestVersion
        });
        clearStoredAuth();
        syncApiAuthRuntime({
          accessToken: null,
          resetPending: true
        });
        await resetSessionStores();
        if (refreshToken) {
          try {
            await logoutApi(refreshToken);
          } catch (error) {
            console.warn("Logout API failed", error);
          }
        }
      }
    }));
    auth_store_default = useAuthStore;
  }
});

// src/api/axios.js
var axios_exports = {};
__export(axios_exports, {
  default: () => axios_default2,
  syncApiAuthRuntime: () => syncApiAuthRuntime2
});
var api, createAuthStateChangedError, setApiDefaultAuthorization, getAuthStateSignature, isRefreshing, failedQueue, processQueue, syncApiAuthRuntime2, axios_default2;
var init_axios3 = __esm({
  "src/api/axios.js"() {
    init_axios2();
    init_auth_store();
    api = axios_default.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    createAuthStateChangedError = () => new axios_default.CanceledError("Auth state changed");
    setApiDefaultAuthorization = (token) => {
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        return;
      }
      delete api.defaults.headers.common.Authorization;
    };
    getAuthStateSignature = () => {
      const { user, role, authContext, accessToken, refreshToken, isAuthenticated } = auth_store_default.getState();
      const identity2 = user?.id ?? user?._id ?? user?.email ?? "anonymous";
      return [
        identity2,
        role || "USER",
        authContext || "default",
        accessToken || "",
        refreshToken || "",
        isAuthenticated ? "1" : "0"
      ].join("|");
    };
    isRefreshing = false;
    failedQueue = [];
    processQueue = (error, token = null) => {
      failedQueue.forEach(
        (request) => error ? request.reject(error) : request.resolve(token)
      );
      failedQueue = [];
    };
    syncApiAuthRuntime2 = ({
      accessToken = null,
      resetPending = false
    } = {}) => {
      setApiDefaultAuthorization(accessToken);
      if (!resetPending) return;
      isRefreshing = false;
      processQueue(createAuthStateChangedError(), null);
    };
    api.interceptors.request.use(
      (config) => {
        config.headers = config.headers || {};
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }
        const token = auth_store_default.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (!error.response || !originalRequest) {
          return Promise.reject(error);
        }
        const status = error.response.status;
        if (status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }
        const authStateSignature = getAuthStateSignature();
        if (originalRequest.url?.includes("/auth/refresh")) {
          auth_store_default.getState().logout();
          return Promise.reject(error);
        }
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            if (!token) {
              throw createAuthStateChangedError();
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const refreshToken = auth_store_default.getState().refreshToken;
          if (!refreshToken) {
            auth_store_default.getState().logout();
            processQueue(new Error("Missing refresh token"), null);
            return Promise.reject(error);
          }
          const refreshResponse = await api.post("/auth/refresh", { refreshToken });
          if (authStateSignature !== getAuthStateSignature()) {
            const canceledError = createAuthStateChangedError();
            processQueue(canceledError, null);
            return Promise.reject(canceledError);
          }
          const newToken = refreshResponse.data?.accessToken || refreshResponse.data?.data?.accessToken || null;
          const newRefreshToken = refreshResponse.data?.refreshToken || refreshResponse.data?.data?.refreshToken || refreshToken;
          if (!newToken) {
            auth_store_default.getState().logout();
            processQueue(new Error("Refresh did not return accessToken"), null);
            return Promise.reject(error);
          }
          auth_store_default.getState().setTokens({
            accessToken: newToken,
            refreshToken: newRefreshToken
          });
          setApiDefaultAuthorization(newToken);
          processQueue(null, newToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          if (authStateSignature !== getAuthStateSignature()) {
            const canceledError = createAuthStateChangedError();
            processQueue(canceledError, null);
            return Promise.reject(canceledError);
          }
          processQueue(refreshError, null);
          auth_store_default.getState().logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    );
    axios_default2 = api;
  }
});

// src/api/history.api.js
var getMyHistory;
var init_history_api = __esm({
  "src/api/history.api.js"() {
    init_axios3();
    getMyHistory = (params = {}) => axios_default2.get("/history/me", { params });
  }
});

// src/api/recommendation.api.js
var getRecommendations;
var init_recommendation_api = __esm({
  "src/api/recommendation.api.js"() {
    init_axios3();
    getRecommendations = (songId) => axios_default2.get(`/recommend/${songId}`);
  }
});

// src/api/song.api.js
var getSongById, getSongLyrics, recordSongPlay;
var init_song_api = __esm({
  "src/api/song.api.js"() {
    init_axios3();
    getSongById = (id) => axios_default2.get(`/songs/${id}`);
    getSongLyrics = (id, params = {}) => axios_default2.get(`/songs/${id}/lyrics`, { params });
    recordSongPlay = (id, duration) => axios_default2.post(`/songs/${id}/play`, { duration });
  }
});

// src/utils/asset.js
var DEFAULT_BASE_URL, STORAGE_BUCKET, resolveAssetUrl;
var init_asset = __esm({
  "src/utils/asset.js"() {
    DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
    STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "";
    resolveAssetUrl = (url, baseUrl = DEFAULT_BASE_URL) => {
      if (!url) return "";
      const rawUrl = `${url}`.trim();
      if (/uploads%2F/i.test(rawUrl)) {
        try {
          const encodedPath = /^https?:\/\//i.test(rawUrl) ? new URL(rawUrl).pathname.replace(/^\/+/, "") : rawUrl;
          const decodedPath = decodeURIComponent(encodedPath).replace(/^\/+/, "");
          if (decodedPath.startsWith("uploads/") && STORAGE_BUCKET) {
            return `https://storage.googleapis.com/${STORAGE_BUCKET}/${decodedPath}`;
          }
        } catch {
        }
      }
      if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("data:")) {
        return rawUrl;
      }
      if (rawUrl.startsWith("blob:")) {
        return rawUrl;
      }
      if (rawUrl.startsWith("//")) {
        return rawUrl;
      }
      const cleanedBase = (baseUrl || "").replace(/\/$/, "");
      const normalizedPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
      return cleanedBase ? `${cleanedBase}${normalizedPath}` : normalizedPath;
    };
  }
});

// src/utils/artist.js
var toArtistObject, dedupeArtists, normalizeArtists, getArtistLabel, getPrimaryArtistId;
var init_artist = __esm({
  "src/utils/artist.js"() {
    toArtistObject = (artist, fallbackSortOrder = 0) => {
      if (!artist) return null;
      if (typeof artist === "string") {
        const name2 = artist.trim();
        if (!name2) return null;
        return {
          id: null,
          name: name2,
          role: "featured",
          sort_order: fallbackSortOrder
        };
      }
      const id = artist.id ?? artist.artist_id ?? artist.artistId ?? null;
      const name = artist.name ?? artist.artist_name ?? artist.alias ?? artist.display_name ?? artist.title ?? "";
      if (!name) return null;
      return {
        id: id === null || id === void 0 || id === "" ? null : Number(id) || id,
        name: String(name).trim(),
        role: artist.role ?? artist.artist_role ?? "featured",
        sort_order: artist.sort_order ?? artist.sortOrder ?? artist.order ?? fallbackSortOrder
      };
    };
    dedupeArtists = (list = []) => {
      const seen = /* @__PURE__ */ new Set();
      return list.filter((artist) => {
        const key = artist.id ? `id:${artist.id}` : `name:${artist.name.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    normalizeArtists = (input = {}) => {
      const source = input?.song ?? input ?? {};
      const rawArtists = source.artists ?? input?.artists ?? [];
      const normalizedFromArray = Array.isArray(rawArtists) ? rawArtists.map((artist, index) => toArtistObject(artist, index)).filter(Boolean).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) : [];
      if (normalizedFromArray.length) {
        return dedupeArtists(normalizedFromArray);
      }
      const fallbackSingleArtist = toArtistObject(
        source.artist ?? input?.artist,
        0
      );
      if (fallbackSingleArtist) {
        return [fallbackSingleArtist];
      }
      const fallbackArtistName = source.artist_name ?? source.artistName ?? input?.artist_name ?? input?.artistName ?? "";
      const fallbackArtistId = source.artist_id ?? source.artistId ?? input?.artist_id ?? input?.artistId;
      if (!fallbackArtistName) return [];
      const parts = String(fallbackArtistName).split(",").map((item) => item.trim()).filter(Boolean);
      if (parts.length <= 1) {
        return [
          {
            id: fallbackArtistId ?? null,
            name: parts[0] || String(fallbackArtistName).trim(),
            role: "main",
            sort_order: 0
          }
        ];
      }
      return dedupeArtists(
        parts.map((name, index) => ({
          id: index === 0 ? fallbackArtistId ?? null : null,
          name,
          role: index === 0 ? "main" : "featured",
          sort_order: index
        }))
      );
    };
    getArtistLabel = (input = {}, fallback = "") => {
      const artists = normalizeArtists(input);
      if (artists.length) {
        return artists.map((artist) => artist.name).filter(Boolean).join(", ");
      }
      return fallback || "";
    };
    getPrimaryArtistId = (input = {}) => {
      const artists = normalizeArtists(input);
      const firstArtist = artists.find((artist) => artist?.id);
      return firstArtist?.id ?? input?.artist_id ?? input?.artistId ?? input?.artist?.id ?? null;
    };
  }
});

// src/utils/song.js
var resolveAudioUrl, toPlayableSong, fetchPlayableSong;
var init_song = __esm({
  "src/utils/song.js"() {
    init_asset();
    init_artist();
    resolveAudioUrl = (path, baseUrl) => {
      if (!path) return void 0;
      const rawPath = `${path}`.trim();
      if (/uploads%2F/i.test(rawPath)) {
        try {
          const encodedPath = /^https?:\/\//i.test(rawPath) ? new URL(rawPath).pathname.replace(/^\/+/, "") : rawPath;
          const decodedPath = decodeURIComponent(encodedPath).replace(/^\/+/, "");
          const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
          if (decodedPath.startsWith("uploads/") && storageBucket) {
            return `https://storage.googleapis.com/${storageBucket}/${decodedPath}`;
          }
        } catch {
        }
      }
      if (/^https?:\/\//i.test(rawPath)) return rawPath;
      const cleanedBase = (baseUrl || "").replace(/\/$/, "");
      const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
      return cleanedBase ? `${cleanedBase}${normalizedPath}` : normalizedPath;
    };
    toPlayableSong = (rawInput = {}) => {
      const raw = rawInput && typeof rawInput === "object" ? rawInput : {};
      const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
      const source = raw.song ?? raw;
      const audioPath = resolveAudioUrl(
        source.audio_url || source.audioUrl || source.audio || source.streaming_url || source.stream_url || source.streamUrl || source.source_url || source.source || source.url || raw.audio_url || raw.audioUrl || raw.audio || raw.streaming_url || raw.stream_url || raw.streamUrl || raw.source_url || raw.source || raw.url,
        baseUrl
      ) || resolveAudioUrl(source.audio_path, baseUrl) || resolveAudioUrl(raw.audio_path, baseUrl);
      const cover = source.cover_url || source.thumbnail || source.image_url || source.thumbnail_m || source.image || source.cover || source.album?.cover_url || raw.cover_url || raw.thumbnail || raw.image_url || raw.thumbnail_m || raw.image || raw.cover || raw.album?.cover_url || "";
      const artists = normalizeArtists({ ...raw, ...source });
      const artistName = getArtistLabel({ ...raw, ...source }) || "";
      const artistId = getPrimaryArtistId({ ...raw, ...source });
      return {
        id: source.id ?? source.song_id ?? source.songId ?? raw.id ?? raw.song_id ?? raw.songId ?? raw._id,
        title: source.title ?? source.name ?? raw.title ?? raw.name ?? "Kh\xF4ng r\xF5",
        artist_name: artistName,
        artist_id: artistId,
        artists,
        duration: source.duration ?? source.length ?? raw.duration ?? raw.length ?? 0,
        cover_url: resolveAssetUrl(cover, baseUrl),
        album_id: source.album_id ?? source.albumId ?? source.album?.id,
        album_title: source.album_title ?? source.albumTitle ?? source.album?.title,
        audio_url: audioPath || "",
        rank: raw.rank ?? source.rank,
        period: raw.period ?? source.period,
        series: Array.isArray(raw.series) ? raw.series : Array.isArray(source.series) ? source.series : void 0,
        playCount: raw.playCount ?? source.playCount ?? raw.total_play_count ?? source.total_play_count ?? raw.play_count ?? source.play_count,
        periodPlayCount: raw.periodPlayCount ?? source.periodPlayCount ?? raw.period_play_count ?? source.period_play_count,
        play_count: raw.weekly_play_count ?? source.weekly_play_count ?? raw.period_play_count ?? source.period_play_count ?? raw.total_play_count ?? source.total_play_count ?? raw.playCount ?? raw.play_count ?? source.playCount ?? source.play_count,
        weekly_play_count: raw.weekly_play_count ?? source.weekly_play_count
      };
    };
    fetchPlayableSong = async (song, fetchById) => {
      if (!song) return null;
      if (song.audio_url) return song;
      const songId = song.id ?? song.song_id ?? song.songId ?? song?.song?.id ?? song?._id;
      if (!songId || typeof fetchById !== "function") return null;
      try {
        const res = await fetchById(songId);
        const payload = res?.data?.data || res?.data || {};
        const normalized = toPlayableSong({ ...song, ...payload });
        if (normalized?.audio_url) {
          return normalized;
        }
      } catch (err) {
        console.error("Fetch playable song failed", err);
      }
      return null;
    };
  }
});

// src/store/playback-session.store.js
var STORAGE_KEY2, normalizeSongId, normalizeTime, cloneSongForStorage, safeParseJson2, loadStoredState, persistState, clearPersistedState, initialState, usePlaybackSessionStore, playback_session_store_default;
var init_playback_session_store = __esm({
  "src/store/playback-session.store.js"() {
    init_esm();
    STORAGE_KEY2 = "playback-session-state";
    normalizeSongId = (song) => {
      const rawId = song?.id ?? song?._id ?? song?.song_id ?? song?.songId ?? song?.song?.id ?? song?.song?._id ?? song;
      if (rawId === void 0 || rawId === null) return null;
      return String(rawId);
    };
    normalizeTime = (value) => {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue < 0) return 0;
      return Math.floor(numericValue);
    };
    cloneSongForStorage = (song) => {
      const songId = normalizeSongId(song);
      if (!songId || !song) return null;
      try {
        return JSON.parse(JSON.stringify(song));
      } catch (error) {
        return {
          id: songId,
          title: song?.title || "",
          audio_url: song?.audio_url || "",
          cover_url: song?.cover_url || "",
          artist_name: song?.artist_name || "",
          artists: Array.isArray(song?.artists) ? song.artists : [],
          album_title: song?.album_title || "",
          duration: Number(song?.duration) || 0
        };
      }
    };
    safeParseJson2 = (value) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Failed to parse playback session state", error);
        return null;
      }
    };
    loadStoredState = () => {
      if (typeof sessionStorage === "undefined") {
        return {
          sessionOwnerKey: null,
          song: null,
          currentTime: 0,
          isPlaying: false,
          updatedAt: null
        };
      }
      const rawValue = sessionStorage.getItem(STORAGE_KEY2);
      if (!rawValue) {
        return {
          sessionOwnerKey: null,
          song: null,
          currentTime: 0,
          isPlaying: false,
          updatedAt: null
        };
      }
      const parsedValue = safeParseJson2(rawValue);
      if (!parsedValue) {
        return {
          sessionOwnerKey: null,
          song: null,
          currentTime: 0,
          isPlaying: false,
          updatedAt: null
        };
      }
      const song = cloneSongForStorage(parsedValue.song);
      return {
        sessionOwnerKey: parsedValue.sessionOwnerKey || null,
        song,
        currentTime: normalizeTime(parsedValue.currentTime),
        isPlaying: Boolean(parsedValue.isPlaying),
        updatedAt: parsedValue.updatedAt || null
      };
    };
    persistState = (state) => {
      if (typeof sessionStorage === "undefined") return;
      try {
        sessionStorage.setItem(
          STORAGE_KEY2,
          JSON.stringify({
            sessionOwnerKey: state.sessionOwnerKey,
            song: state.song,
            currentTime: normalizeTime(state.currentTime),
            isPlaying: Boolean(state.isPlaying),
            updatedAt: state.updatedAt
          })
        );
      } catch (error) {
        console.error("Failed to persist playback session state", error);
      }
    };
    clearPersistedState = () => {
      if (typeof sessionStorage === "undefined") return;
      sessionStorage.removeItem(STORAGE_KEY2);
    };
    initialState = loadStoredState();
    usePlaybackSessionStore = create((set, get) => ({
      sessionOwnerKey: initialState.sessionOwnerKey,
      song: initialState.song,
      currentTime: initialState.currentTime,
      isPlaying: initialState.isPlaying,
      updatedAt: initialState.updatedAt,
      setSnapshot: ({ ownerKey, song, currentTime = 0, isPlaying = false } = {}) => {
        const nextSong = cloneSongForStorage(song);
        if (!ownerKey || !nextSong) {
          get().clear();
          return null;
        }
        const nextState = {
          sessionOwnerKey: ownerKey,
          song: nextSong,
          currentTime: normalizeTime(currentTime),
          isPlaying: Boolean(isPlaying),
          updatedAt: Date.now()
        };
        set(nextState);
        persistState(nextState);
        return nextState;
      },
      getSnapshot: (ownerKey) => {
        const state = get();
        if (!ownerKey) {
          get().clear();
          return null;
        }
        if (state.sessionOwnerKey && state.sessionOwnerKey !== ownerKey) {
          get().clear();
          return null;
        }
        if (!state.song) return null;
        return {
          song: cloneSongForStorage(state.song),
          currentTime: normalizeTime(state.currentTime),
          isPlaying: Boolean(state.isPlaying),
          updatedAt: state.updatedAt || null
        };
      },
      clear: () => {
        set({
          sessionOwnerKey: null,
          song: null,
          currentTime: 0,
          isPlaying: false,
          updatedAt: null
        });
        clearPersistedState();
      }
    }));
    playback_session_store_default = usePlaybackSessionStore;
  }
});

// src/store/player.store.js
var player_store_exports = {};
__export(player_store_exports, {
  default: () => player_store_default,
  normalizeSongId: () => normalizeSongId2
});
var normalizeSongId2, extractSongsFromResponse, extractLyricsFromResponse, audio, lyricRequests, queueHydrationRequests, sleepTimerId, rememberedDockTab, lastMediaMetadataKey, lastMediaPositionStateKey, shouldResumePlayback, pendingRestoreTime, lastPersistedPlaybackKey, UPCOMING_QUEUE_HYDRATION_LIMIT, PLAYBACK_RATE_DEFAULT, PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, GUEST_PREVIEW_LIMIT_SECONDS, GUEST_PREVIEW_LIMIT_MESSAGE, lastGuestPreviewNoticeSongId, clampPlaybackRate, PLAYER_DOCK_TABS, getConfiguredPlaybackRate, getRememberedDockTab, getAutoOpenDockTab, rememberDockTab, getPlaybackSessionOwner, clearPersistedPlayback, persistPlaybackSnapshot, tryApplyPendingRestoreTime, attachAudioToDom, syncPlaybackState, attemptPlayback, primeAudioSource, retryPendingPlayback, getPreviewDurationCap, shouldBlockGuestPreview, blockGuestPreviewPlayback, hydrateQueueSong, hydrateUpcomingQueueSongs, buildMediaMetadataKey, resolveMediaArtwork, setupMediaSession, syncMediaSession, usePlayerStore, player_store_default;
var init_player_store = __esm({
  "src/store/player.store.js"() {
    init_esm();
    init_axios3();
    init_history_api();
    init_like_api();
    init_recommendation_api();
    init_song_api();
    init_song();
    init_artist();
    init_auth_store();
    init_playback_session_store();
    init_authPrompt();
    normalizeSongId2 = (song) => {
      const rawId = song?.id ?? song?._id ?? song?.song_id ?? song?.songId ?? song?.song?._id ?? song?.song?.id ?? song;
      if (rawId === void 0 || rawId === null) return null;
      return String(rawId);
    };
    extractSongsFromResponse = (payload) => {
      const sources = [
        payload?.data,
        payload?.data?.data,
        payload?.data?.data?.likedSongs,
        payload?.data?.items,
        payload?.data?.songs,
        payload?.data?.likedSongs,
        payload?.songs,
        payload?.likedSongs,
        payload
      ];
      return sources.find(Array.isArray) || [];
    };
    extractLyricsFromResponse = (payload) => {
      const topLevel = payload?.data ?? payload;
      const data2 = topLevel?.data ?? topLevel;
      const items = data2?.items ?? data2 ?? [];
      return Array.isArray(items) ? items : [];
    };
    audio = new Audio();
    audio.preload = "auto";
    audio.playsInline = true;
    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");
    lyricRequests = /* @__PURE__ */ new Map();
    queueHydrationRequests = /* @__PURE__ */ new Map();
    sleepTimerId = null;
    rememberedDockTab = "queue";
    lastMediaMetadataKey = "";
    lastMediaPositionStateKey = "";
    shouldResumePlayback = false;
    pendingRestoreTime = null;
    lastPersistedPlaybackKey = "";
    UPCOMING_QUEUE_HYDRATION_LIMIT = 2;
    PLAYBACK_RATE_DEFAULT = 1;
    PLAYBACK_RATE_MIN = 0.75;
    PLAYBACK_RATE_MAX = 1.5;
    GUEST_PREVIEW_LIMIT_SECONDS = 30;
    GUEST_PREVIEW_LIMIT_MESSAGE = "Vui l\xF2ng \u0111\u0103ng nh\u1EADp \u0111\u1EC3 nghe tr\u1ECDn v\u1EB9n b\xE0i h\xE1t sau 30 gi\xE2y preview.";
    lastGuestPreviewNoticeSongId = "";
    clampPlaybackRate = (value) => Math.min(PLAYBACK_RATE_MAX, Math.max(PLAYBACK_RATE_MIN, Number(value) || PLAYBACK_RATE_DEFAULT));
    PLAYER_DOCK_TABS = /* @__PURE__ */ new Set(["queue", "lyrics"]);
    getConfiguredPlaybackRate = () => PLAYBACK_RATE_DEFAULT;
    getRememberedDockTab = () => rememberedDockTab;
    getAutoOpenDockTab = () => null;
    rememberDockTab = (tab) => {
      if (!PLAYER_DOCK_TABS.has(tab)) return;
      rememberedDockTab = tab;
    };
    getPlaybackSessionOwner = () => {
      const { isAuthenticated, user, role, authContext } = auth_store_default.getState();
      if (!isAuthenticated) return null;
      const identity2 = user?.id ?? user?._id ?? user?.email ?? null;
      if (!identity2) return null;
      return [identity2, role || "USER", authContext || "default"].join("|");
    };
    clearPersistedPlayback = () => {
      pendingRestoreTime = null;
      lastPersistedPlaybackKey = "";
      playback_session_store_default.getState().clear();
    };
    persistPlaybackSnapshot = ({
      song,
      currentTime = 0,
      force = false,
      isPlaying
    } = {}) => {
      const ownerKey = getPlaybackSessionOwner();
      const songId = normalizeSongId2(song);
      if (!ownerKey || !songId || !song) {
        clearPersistedPlayback();
        return;
      }
      const normalizedTime = Math.max(0, Math.floor(Number(currentTime) || 0));
      const nextIsPlaying = typeof isPlaying === "boolean" ? isPlaying : Boolean(usePlayerStore.getState()?.isPlaying);
      const nextKey = `${ownerKey}|${songId}|${normalizedTime}|${nextIsPlaying ? 1 : 0}`;
      if (!force && lastPersistedPlaybackKey === nextKey) return;
      lastPersistedPlaybackKey = nextKey;
      playback_session_store_default.getState().setSnapshot({
        ownerKey,
        song: toPlayableSong(song),
        currentTime: normalizedTime,
        isPlaying: nextIsPlaying
      });
    };
    tryApplyPendingRestoreTime = () => {
      if (!(Number.isFinite(pendingRestoreTime) && pendingRestoreTime > 0)) {
        return false;
      }
      const boundedTime = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.min(Math.max(pendingRestoreTime, 0), audio.duration) : Math.max(pendingRestoreTime, 0);
      try {
        if (Math.abs((audio.currentTime || 0) - boundedTime) > 0.25) {
          audio.currentTime = boundedTime;
        }
        pendingRestoreTime = null;
        return true;
      } catch {
        return false;
      }
    };
    attachAudioToDom = () => {
      if (typeof document === "undefined" || audio.isConnected) return;
      audio.id = "app-background-audio";
      audio.hidden = true;
      audio.setAttribute("aria-hidden", "true");
      audio.setAttribute("tabindex", "-1");
      (document.body || document.documentElement)?.appendChild(audio);
    };
    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attachAudioToDom, {
          once: true
        });
      } else {
        attachAudioToDom();
      }
    }
    syncPlaybackState = () => {
      const isPlaying = Boolean(audio.src) && !audio.paused && !audio.ended;
      if (usePlayerStore.getState().isPlaying !== isPlaying) {
        usePlayerStore.setState({ isPlaying });
      }
      return isPlaying;
    };
    attemptPlayback = async () => {
      if (!shouldResumePlayback || !audio.src) {
        syncPlaybackState();
        return false;
      }
      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          await playPromise;
        }
      } catch {
        syncPlaybackState();
        return false;
      }
      return syncPlaybackState();
    };
    primeAudioSource = (src, playbackRate, { autoplay = false, resetTime = true, startTime = null } = {}) => {
      shouldResumePlayback = autoplay;
      audio.playbackRate = playbackRate;
      pendingRestoreTime = Number.isFinite(startTime) && Number(startTime) > 0 ? Math.max(Number(startTime), 0) : null;
      const nextSource = src || "";
      const currentSource = audio.currentSrc || audio.src || "";
      const sourceChanged = currentSource !== nextSource;
      if (sourceChanged) {
        audio.pause();
        audio.src = nextSource;
      }
      if (pendingRestoreTime !== null) {
        tryApplyPendingRestoreTime();
      } else if (resetTime) {
        try {
          audio.currentTime = 0;
        } catch {
        }
      }
      if (!autoplay) {
        syncPlaybackState();
        return;
      }
      void attemptPlayback();
    };
    retryPendingPlayback = () => {
      tryApplyPendingRestoreTime();
      if (!shouldResumePlayback || !audio.src) {
        syncPlaybackState();
        return;
      }
      if (!audio.paused) {
        shouldResumePlayback = false;
        syncPlaybackState();
        return;
      }
      void attemptPlayback();
    };
    getPreviewDurationCap = (song) => {
      const rawDuration = Number(song?.duration || audio.duration || 0);
      if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
        return GUEST_PREVIEW_LIMIT_SECONDS;
      }
      return Math.min(rawDuration, GUEST_PREVIEW_LIMIT_SECONDS);
    };
    shouldBlockGuestPreview = (time = audio.currentTime || 0) => {
      const { isAuthenticated } = auth_store_default.getState();
      if (isAuthenticated) return false;
      const { currentSong } = usePlayerStore.getState();
      const songId = normalizeSongId2(currentSong);
      if (!songId) return false;
      const totalDuration = Number(currentSong?.duration || audio.duration || 0);
      if (Number.isFinite(totalDuration) && totalDuration > 0 && totalDuration <= GUEST_PREVIEW_LIMIT_SECONDS + 0.25) {
        return false;
      }
      return Number(time) >= GUEST_PREVIEW_LIMIT_SECONDS;
    };
    blockGuestPreviewPlayback = ({ time = audio.currentTime || 0, forceNotice = false } = {}) => {
      if (!shouldBlockGuestPreview(time)) return false;
      const { currentSong } = usePlayerStore.getState();
      const songId = normalizeSongId2(currentSong);
      if (!songId) return false;
      shouldResumePlayback = false;
      const previewCap = getPreviewDurationCap(currentSong);
      try {
        audio.currentTime = previewCap;
      } catch {
      }
      audio.pause();
      usePlayerStore.setState({
        isPlaying: false,
        currentTime: previewCap
      });
      if (forceNotice || lastGuestPreviewNoticeSongId !== songId) {
        lastGuestPreviewNoticeSongId = songId;
        emitAuthRequired(GUEST_PREVIEW_LIMIT_MESSAGE);
      }
      return true;
    };
    hydrateQueueSong = async (song) => {
      const songId = normalizeSongId2(song);
      if (!songId || song?.audio_url) return song;
      if (queueHydrationRequests.has(songId)) {
        return queueHydrationRequests.get(songId);
      }
      const request = fetchPlayableSong(song, getSongById).then((hydrated) => hydrated || song).finally(() => {
        queueHydrationRequests.delete(songId);
      });
      queueHydrationRequests.set(songId, request);
      return request;
    };
    hydrateUpcomingQueueSongs = async (startIndex, limit = UPCOMING_QUEUE_HYDRATION_LIMIT) => {
      const { queue } = usePlayerStore.getState();
      if (!Array.isArray(queue) || !queue.length) return;
      const candidates = [];
      for (let offset = 1; offset <= limit; offset += 1) {
        const item = queue[startIndex + offset];
        if (!item) break;
        if (item.audio_url) continue;
        candidates.push(item);
      }
      if (!candidates.length) return;
      const hydratedEntries = await Promise.all(
        candidates.map(async (item) => {
          const hydrated = await hydrateQueueSong(item);
          const songId = normalizeSongId2(hydrated);
          if (!songId || !hydrated?.audio_url) return null;
          return [songId, hydrated];
        })
      );
      const hydratedMap = new Map(hydratedEntries.filter(Boolean));
      if (!hydratedMap.size) return;
      usePlayerStore.setState((state) => ({
        queue: state.queue.map((item) => {
          const hydrated = hydratedMap.get(normalizeSongId2(item));
          return hydrated ? { ...item, ...hydrated } : item;
        })
      }));
    };
    buildMediaMetadataKey = (song) => {
      if (!song) return "";
      return [
        normalizeSongId2(song),
        song.title || "",
        getArtistLabel(song, "Unknown Artist"),
        song.album_title || "",
        song.cover_url || ""
      ].join("|");
    };
    resolveMediaArtwork = (song) => {
      const artwork = song?.cover_url;
      if (!artwork) return [];
      return [
        { src: artwork, sizes: "96x96" },
        { src: artwork, sizes: "128x128" },
        { src: artwork, sizes: "192x192" },
        { src: artwork, sizes: "256x256" },
        { src: artwork, sizes: "384x384" },
        { src: artwork, sizes: "512x512" }
      ];
    };
    setupMediaSession = () => {
      if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
        return;
      }
      const mediaSession = navigator.mediaSession;
      const safeSetActionHandler = (action, handler) => {
        try {
          mediaSession.setActionHandler(action, handler);
        } catch (error) {
        }
      };
      const play = () => usePlayerStore.getState().resume();
      const pause = () => usePlayerStore.getState().pause();
      const playNext = () => usePlayerStore.getState().playNext();
      const playPrev = () => usePlayerStore.getState().playPrev();
      const seekTo = (details) => {
        const rawTime = Number(details?.seekTime);
        if (!Number.isFinite(rawTime)) return;
        const boundedTime = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.min(Math.max(rawTime, 0), audio.duration) : Math.max(rawTime, 0);
        if (details?.fastSeek && typeof audio.fastSeek === "function") {
          audio.fastSeek(boundedTime);
        } else {
          audio.currentTime = boundedTime;
        }
        usePlayerStore.setState({ currentTime: boundedTime });
      };
      safeSetActionHandler("play", play);
      safeSetActionHandler("pause", pause);
      safeSetActionHandler("nexttrack", playNext);
      safeSetActionHandler("previoustrack", playPrev);
      safeSetActionHandler("seekto", seekTo);
      safeSetActionHandler("seekbackward", null);
      safeSetActionHandler("seekforward", null);
    };
    syncMediaSession = () => {
      if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
        return;
      }
      const mediaSession = navigator.mediaSession;
      const { currentSong } = usePlayerStore.getState();
      const playbackState = Boolean(audio.src) && !audio.paused && !audio.ended ? "playing" : "paused";
      mediaSession.playbackState = playbackState;
      if (currentSong) {
        const mediaMetadataKey = buildMediaMetadataKey(currentSong);
        if (mediaMetadataKey !== lastMediaMetadataKey) {
          if (typeof MediaMetadata === "function") {
            mediaSession.metadata = new MediaMetadata({
              title: currentSong.title || "Kh\xF4ng r\xF5",
              artist: getArtistLabel(currentSong, "Unknown Artist"),
              album: currentSong.album_title || "",
              artwork: resolveMediaArtwork(currentSong)
            });
          }
          lastMediaMetadataKey = mediaMetadataKey;
          lastMediaPositionStateKey = "";
        }
      } else if (lastMediaMetadataKey) {
        mediaSession.metadata = null;
        lastMediaMetadataKey = "";
        lastMediaPositionStateKey = "";
      }
      if (currentSong && typeof mediaSession.setPositionState === "function" && Number.isFinite(audio.duration) && audio.duration > 0) {
        const positionStateKey = [
          Math.round((audio.currentTime || 0) * 2) / 2,
          Math.round((audio.duration || 0) * 2) / 2,
          audio.playbackRate || 1
        ].join("|");
        if (positionStateKey !== lastMediaPositionStateKey) {
          mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(audio.currentTime || 0, audio.duration)
          });
          lastMediaPositionStateKey = positionStateKey;
        }
      } else {
        lastMediaPositionStateKey = "";
      }
    };
    usePlayerStore = create((set, get) => ({
      /* ===== STATE ===== */
      currentSong: null,
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      repeatMode: "off",
      // off | all | one
      shuffle: false,
      shuffleHistory: [],
      duration: 0,
      currentTime: 0,
      hasRecordedPlay: false,
      volume: 1,
      muted: false,
      playbackRate: getConfiguredPlaybackRate(),
      sleepTimerEndsAt: null,
      sleepTimerMinutes: 0,
      likedSongIds: [],
      likedSongsLoading: false,
      likedSongsLoaded: false,
      lastPlayedLoading: false,
      lastPlayedLoaded: false,
      recommendationLoading: false,
      dockPanelOpen: false,
      dockPanelTab: getRememberedDockTab(),
      lyricsBySongId: {},
      lyricsLoadingBySongId: {},
      lyricsErrorBySongId: {},
      /* ===== INTERNAL ===== */
      audio,
      /* =====================
         PLAYER CORE
      ===================== */
      playSong: async (song, queue = []) => {
        const hydratedList = (queue.length ? queue : [song]).map(
          (item) => toPlayableSong(item)
        );
        const targetIndex = hydratedList.findIndex(
          (s) => normalizeSongId2(s) === normalizeSongId2(song)
        );
        let playable = toPlayableSong(song);
        if (!playable.audio_url) {
          const fetched = await fetchPlayableSong(playable, getSongById);
          if (fetched) playable = fetched;
        }
        if (!playable?.audio_url) return;
        const targetId = normalizeSongId2(playable);
        const updatedQueue = hydratedList.map((item) => {
          const id = normalizeSongId2(item);
          if (id === targetId) return { ...item, ...playable };
          if (!item.audio_url) return toPlayableSong(item);
          return item;
        });
        const { playbackRate } = get();
        lastGuestPreviewNoticeSongId = "";
        primeAudioSource(playable.audio_url, playbackRate, {
          autoplay: true
        });
        set({
          currentSong: playable,
          queue: updatedQueue,
          currentIndex: targetIndex !== -1 ? targetIndex : 0,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          hasRecordedPlay: false,
          shuffleHistory: [],
          lastPlayedLoading: false,
          lastPlayedLoaded: true
        });
        persistPlaybackSnapshot({
          song: playable,
          currentTime: 0,
          force: true,
          isPlaying: true
        });
        const autoOpenDockTab = getAutoOpenDockTab();
        if (autoOpenDockTab && typeof window !== "undefined" && window.innerWidth >= 1024) {
          rememberDockTab(autoOpenDockTab);
          set({
            dockPanelOpen: true,
            dockPanelTab: autoOpenDockTab
          });
        }
        get().preloadLyricsForSong(playable);
        if (updatedQueue.length <= 1) {
          get().appendRecommendationsToQueue();
        }
        void hydrateUpcomingQueueSongs(targetIndex !== -1 ? targetIndex : 0);
      },
      pause: () => {
        shouldResumePlayback = false;
        audio.pause();
        set({ isPlaying: false });
        persistPlaybackSnapshot({
          song: get().currentSong,
          currentTime: audio.currentTime || get().currentTime || 0,
          force: true,
          isPlaying: false
        });
      },
      resume: () => {
        const { currentSong, playbackRate } = get();
        if (!currentSong?.audio_url) return;
        if (blockGuestPreviewPlayback({ forceNotice: true })) return;
        const currentSource = audio.currentSrc || audio.src || "";
        if (currentSource !== currentSong.audio_url) {
          primeAudioSource(currentSong.audio_url, playbackRate, {
            autoplay: true,
            resetTime: false
          });
          return;
        }
        shouldResumePlayback = true;
        void attemptPlayback();
      },
      togglePlay: () => {
        const { isPlaying } = get();
        isPlaying ? get().pause() : get().resume();
      },
      seek: (time) => {
        const boundedTime = Number.isFinite(audio.duration) && audio.duration > 0 ? Math.min(Math.max(Number(time) || 0, 0), audio.duration) : Math.max(Number(time) || 0, 0);
        if (blockGuestPreviewPlayback({ time: boundedTime, forceNotice: true })) {
          return;
        }
        audio.currentTime = boundedTime;
        set({ currentTime: boundedTime });
        persistPlaybackSnapshot({
          song: get().currentSong,
          currentTime: boundedTime,
          force: true,
          isPlaying: get().isPlaying
        });
      },
      /* =====================
         SHUFFLE / NEXT / PREV
      ===================== */
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle, shuffleHistory: [] })),
      playAt: (index) => {
        const { queue } = get();
        const song = queue[index];
        if (!song) return;
        get().playSong(song, queue);
      },
      playNext: async () => {
        const { queue, currentIndex, repeatMode, shuffle, shuffleHistory } = get();
        if (!queue.length) return;
        let nextIndex = currentIndex;
        if (shuffle) {
          if (queue.length === 1) return;
          do {
            nextIndex = Math.floor(Math.random() * queue.length);
          } while (nextIndex === currentIndex);
          set({ shuffleHistory: [...shuffleHistory, currentIndex] });
        } else {
          nextIndex = currentIndex + 1;
        }
        if (nextIndex >= queue.length) {
          if (repeatMode === "all") nextIndex = 0;
          else {
            const appended = await get().appendRecommendationsToQueue();
            if (!appended) return;
            const updatedState = get();
            if (updatedState.queue.length <= updatedState.currentIndex + 1) return;
            get().playSong(
              updatedState.queue[updatedState.currentIndex + 1],
              updatedState.queue
            );
            return;
          }
        }
        get().playSong(queue[nextIndex], queue);
      },
      playPrev: () => {
        const { shuffle, shuffleHistory, currentIndex, queue } = get();
        if (shuffle && shuffleHistory.length) {
          const prevIndex = shuffleHistory[shuffleHistory.length - 1];
          set({ shuffleHistory: shuffleHistory.slice(0, -1) });
          get().playSong(queue[prevIndex], queue);
          return;
        }
        if (currentIndex > 0) {
          get().playSong(queue[currentIndex - 1], queue);
        }
      },
      toggleRepeatMode: () => {
        const order = ["off", "all", "one"];
        const current = get().repeatMode;
        const next = order[(order.indexOf(current) + 1) % order.length];
        audio.loop = next === "one";
        set({ repeatMode: next });
      },
      /* =====================
         VOLUME
      ===================== */
      setVolume: (value) => {
        const volume = Math.min(1, Math.max(0, value));
        audio.volume = volume;
        set({ volume });
      },
      toggleMute: () => {
        audio.muted = !audio.muted;
        set({ muted: audio.muted });
      },
      setPlaybackRate: (value) => {
        const playbackRate = clampPlaybackRate(value);
        audio.playbackRate = playbackRate;
        set({ playbackRate });
        syncMediaSession();
      },
      cyclePlaybackRate: () => {
        const order = [0.75, 1, 1.25, 1.5];
        const current = clampPlaybackRate(get().playbackRate);
        const currentIndex = order.findIndex((item) => item === current);
        const nextRate = order[(currentIndex + 1) % order.length];
        get().setPlaybackRate(nextRate);
      },
      clearSleepTimer: () => {
        if (sleepTimerId) {
          clearTimeout(sleepTimerId);
          sleepTimerId = null;
        }
        set({
          sleepTimerEndsAt: null,
          sleepTimerMinutes: 0
        });
      },
      setSleepTimer: (minutes) => {
        const nextMinutes = Math.max(0, Number(minutes) || 0);
        get().clearSleepTimer();
        if (!nextMinutes) return;
        const sleepTimerEndsAt = Date.now() + nextMinutes * 60 * 1e3;
        sleepTimerId = setTimeout(() => {
          const { pause } = get();
          pause();
          get().clearSleepTimer();
        }, nextMinutes * 60 * 1e3);
        set({
          sleepTimerEndsAt,
          sleepTimerMinutes: nextMinutes
        });
      },
      openDockPanel: (tab = getRememberedDockTab()) => {
        const nextTab = PLAYER_DOCK_TABS.has(tab) ? tab : getRememberedDockTab();
        rememberDockTab(nextTab);
        set({
          dockPanelOpen: true,
          dockPanelTab: nextTab
        });
      },
      closeDockPanel: () => set({
        dockPanelOpen: false
      }),
      toggleDockPanel: (tab = getRememberedDockTab()) => {
        const nextTab = PLAYER_DOCK_TABS.has(tab) ? tab : getRememberedDockTab();
        rememberDockTab(nextTab);
        set((state) => ({
          dockPanelOpen: state.dockPanelTab === nextTab ? !state.dockPanelOpen : true,
          dockPanelTab: nextTab
        }));
      },
      setDockPanelTab: (tab = getRememberedDockTab()) => {
        const nextTab = PLAYER_DOCK_TABS.has(tab) ? tab : getRememberedDockTab();
        rememberDockTab(nextTab);
        set({
          dockPanelTab: nextTab,
          dockPanelOpen: true
        });
      },
      ensureLyricsLoaded: async (songOrId, { force = false } = {}) => {
        const songId = normalizeSongId2(songOrId);
        if (!songId) return [];
        const { lyricsBySongId, lyricsLoadingBySongId } = get();
        const hasCachedLyrics = Object.prototype.hasOwnProperty.call(
          lyricsBySongId,
          songId
        );
        if (hasCachedLyrics && !force) {
          return lyricsBySongId[songId] ?? [];
        }
        if (lyricRequests.has(songId)) {
          return lyricRequests.get(songId);
        }
        if (!lyricsLoadingBySongId[songId]) {
          set((state) => ({
            lyricsLoadingBySongId: {
              ...state.lyricsLoadingBySongId,
              [songId]: true
            },
            lyricsErrorBySongId: {
              ...state.lyricsErrorBySongId,
              [songId]: null
            }
          }));
        }
        const request = getSongLyrics(songId).then((response) => {
          const items = extractLyricsFromResponse(response);
          set((state) => ({
            lyricsBySongId: {
              ...state.lyricsBySongId,
              [songId]: items
            },
            lyricsLoadingBySongId: {
              ...state.lyricsLoadingBySongId,
              [songId]: false
            },
            lyricsErrorBySongId: {
              ...state.lyricsErrorBySongId,
              [songId]: null
            }
          }));
          return items;
        }).catch((error) => {
          console.error("Load song lyrics failed", error);
          set((state) => ({
            lyricsLoadingBySongId: {
              ...state.lyricsLoadingBySongId,
              [songId]: false
            },
            lyricsErrorBySongId: {
              ...state.lyricsErrorBySongId,
              [songId]: "Kh\xF4ng th\u1EC3 t\u1EA3i l\u1EDDi b\xE0i h\xE1t"
            }
          }));
          return [];
        }).finally(() => {
          lyricRequests.delete(songId);
        });
        lyricRequests.set(songId, request);
        return request;
      },
      preloadLyricsForSong: (songOrId) => {
        const songId = normalizeSongId2(songOrId);
        if (!songId) return;
        const { lyricsBySongId, lyricsLoadingBySongId } = get();
        const hasCachedLyrics = Object.prototype.hasOwnProperty.call(
          lyricsBySongId,
          songId
        );
        if (hasCachedLyrics || lyricsLoadingBySongId[songId]) return;
        void get().ensureLyricsLoaded(songId);
      },
      /* =====================
         QUEUE
      ===================== */
      addToQueue: (songs) => {
        const list = Array.isArray(songs) ? songs : [songs];
        set((state) => {
          const ids = new Set(
            state.queue.map((s) => normalizeSongId2(s)).filter(Boolean)
          );
          const newItems = list.filter(
            (s) => !ids.has(normalizeSongId2(s))
          );
          return { queue: [...state.queue, ...newItems] };
        });
      },
      moveQueueItem: (fromIndex, toIndex) => set((state) => {
        const queue = [...state.queue];
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= queue.length || toIndex >= queue.length) {
          return state;
        }
        const [movedItem] = queue.splice(fromIndex, 1);
        queue.splice(toIndex, 0, movedItem);
        let nextCurrentIndex = state.currentIndex;
        if (fromIndex === state.currentIndex) {
          nextCurrentIndex = toIndex;
        } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
          nextCurrentIndex = Math.max(0, state.currentIndex - 1);
        } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
          nextCurrentIndex = Math.min(queue.length - 1, state.currentIndex + 1);
        }
        return {
          queue,
          currentIndex: nextCurrentIndex
        };
      }),
      removeFromQueue: (index) => {
        const state = get();
        if (index < 0 || index >= state.queue.length) return;
        const nextQueue = state.queue.filter((_, itemIndex) => itemIndex !== index);
        if (!nextQueue.length) {
          audio.pause();
          audio.currentTime = 0;
          clearPersistedPlayback();
          set({
            queue: [],
            currentSong: null,
            currentIndex: -1,
            isPlaying: false,
            currentTime: 0
          });
          return;
        }
        if (index === state.currentIndex) {
          const nextIndex = Math.min(index, nextQueue.length - 1);
          const nextSong = nextQueue[nextIndex];
          get().playSong(nextSong, nextQueue);
          return;
        }
        set({
          queue: nextQueue,
          currentIndex: index < state.currentIndex ? state.currentIndex - 1 : state.currentIndex
        });
      },
      clearQueue: () => {
        get().clearSleepTimer();
        clearPersistedPlayback();
        set({
          queue: [],
          currentSong: null,
          currentIndex: -1,
          isPlaying: false,
          dockPanelOpen: false,
          dockPanelTab: getRememberedDockTab()
        });
      },
      appendRecommendationsToQueue: async () => {
        const { recommendationLoading, currentSong, queue, repeatMode } = get();
        if (recommendationLoading) return false;
        if (repeatMode !== "off") return false;
        const seedSongId = normalizeSongId2(currentSong);
        if (!seedSongId) return false;
        set({ recommendationLoading: true });
        try {
          const res = await getRecommendations(seedSongId);
          const items = res?.data?.data ?? res?.data ?? [];
          const ids = items.map((item) => item?.songId ?? item?.song_id ?? item?.id ?? item).filter(Boolean);
          if (!ids.length) return false;
          const existingIds = new Set(
            queue.map((song) => normalizeSongId2(song)).filter(Boolean)
          );
          const detailResults = await Promise.all(
            ids.map(async (songId) => {
              if (existingIds.has(String(songId))) return null;
              try {
                const songRes = await getSongById(songId);
                const payload = songRes?.data?.data ?? songRes?.data ?? songRes;
                return toPlayableSong(payload);
              } catch (error) {
                console.error("Load recommended song failed", error);
                return null;
              }
            })
          );
          const newSongs = detailResults.filter(Boolean);
          if (!newSongs.length) return false;
          set((state) => ({
            queue: [...state.queue, ...newSongs]
          }));
          void hydrateUpcomingQueueSongs(get().currentIndex);
          return true;
        } catch (error) {
          console.error("Load recommendations for queue failed", error);
          return false;
        } finally {
          set({ recommendationLoading: false });
        }
      },
      resetForAuthChange: () => {
        if (sleepTimerId) {
          clearTimeout(sleepTimerId);
          sleepTimerId = null;
        }
        shouldResumePlayback = false;
        lastGuestPreviewNoticeSongId = "";
        clearPersistedPlayback();
        audio.pause();
        audio.currentTime = 0;
        audio.src = "";
        audio.playbackRate = getConfiguredPlaybackRate();
        set({
          currentSong: null,
          queue: [],
          currentIndex: -1,
          isPlaying: false,
          duration: 0,
          currentTime: 0,
          hasRecordedPlay: false,
          playbackRate: getConfiguredPlaybackRate(),
          sleepTimerEndsAt: null,
          sleepTimerMinutes: 0,
          shuffleHistory: [],
          likedSongIds: [],
          likedSongsLoading: false,
          likedSongsLoaded: false,
          lastPlayedLoading: false,
          lastPlayedLoaded: false,
          recommendationLoading: false,
          dockPanelOpen: false,
          dockPanelTab: getRememberedDockTab(),
          lyricsBySongId: {},
          lyricsLoadingBySongId: {},
          lyricsErrorBySongId: {}
        });
      },
      restorePersistedPlayback: async () => {
        const ownerKey = getPlaybackSessionOwner();
        if (!ownerKey) {
          clearPersistedPlayback();
          return null;
        }
        const snapshot = playback_session_store_default.getState().getSnapshot(ownerKey);
        if (!snapshot?.song) return null;
        let playable = toPlayableSong(snapshot.song);
        if (!playable?.audio_url) {
          const fetched = await fetchPlayableSong(playable, getSongById);
          if (fetched) playable = fetched;
        }
        if (!playable?.audio_url) {
          clearPersistedPlayback();
          return null;
        }
        const restoredTime = Math.max(0, Number(snapshot.currentTime) || 0);
        const shouldAutoplay = Boolean(snapshot.isPlaying);
        const { playbackRate } = get();
        primeAudioSource(playable.audio_url, playbackRate, {
          autoplay: shouldAutoplay,
          startTime: restoredTime
        });
        set({
          currentSong: playable,
          queue: [playable],
          currentIndex: 0,
          isPlaying: false,
          currentTime: restoredTime,
          duration: 0,
          hasRecordedPlay: false,
          lastPlayedLoading: false,
          lastPlayedLoaded: true
        });
        persistPlaybackSnapshot({
          song: playable,
          currentTime: restoredTime,
          force: true,
          isPlaying: shouldAutoplay
        });
        get().preloadLyricsForSong(playable);
        void hydrateUpcomingQueueSongs(0);
        return playable;
      },
      /* =====================
         HISTORY
      ===================== */
      recordListeningProgress: (durationSeconds) => {
        const { currentSong, hasRecordedPlay } = get();
        if (hasRecordedPlay) return;
        const duration = Math.floor(durationSeconds ?? audio.currentTime ?? 0);
        const songId = normalizeSongId2(currentSong);
        if (!songId || duration < 30) return;
        set({ hasRecordedPlay: true });
        recordSongPlay(songId, duration).catch(
          () => set({ hasRecordedPlay: false })
        );
      },
      ensureLastPlayedLoaded: async () => get().loadLastPlayed(),
      loadLastPlayed: async ({ force = false } = {}) => {
        const { isAuthenticated } = auth_store_default.getState();
        const { currentSong, lastPlayedLoading, lastPlayedLoaded } = get();
        if (!isAuthenticated) {
          clearPersistedPlayback();
          set({
            lastPlayedLoading: false,
            lastPlayedLoaded: false
          });
          return null;
        }
        if (currentSong && !force) {
          set({
            lastPlayedLoading: false,
            lastPlayedLoaded: true
          });
          return currentSong;
        }
        if (lastPlayedLoading) return currentSong;
        if (lastPlayedLoaded && !force) return currentSong;
        if (!force) {
          const restoredSong = await get().restorePersistedPlayback();
          if (restoredSong) return restoredSong;
        }
        set({ lastPlayedLoading: true });
        try {
          const res = await getMyHistory({ limit: 1 });
          const payload = res?.data?.data ?? res?.data ?? {};
          const items = payload?.items ?? payload ?? [];
          if (!items.length) {
            set({
              lastPlayedLoading: false,
              lastPlayedLoaded: true
            });
            return null;
          }
          let playable = toPlayableSong(items[0]);
          if (!playable?.audio_url) {
            const fetched = await fetchPlayableSong(playable, getSongById);
            if (fetched) playable = fetched;
          }
          if (!playable?.audio_url) {
            set({
              lastPlayedLoading: false,
              lastPlayedLoaded: true
            });
            return null;
          }
          const { playbackRate } = get();
          primeAudioSource(playable.audio_url, playbackRate, {
            autoplay: false
          });
          set({
            currentSong: playable,
            queue: [playable],
            currentIndex: 0,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            hasRecordedPlay: false,
            lastPlayedLoading: false,
            lastPlayedLoaded: true
          });
          get().preloadLyricsForSong(playable);
          void hydrateUpcomingQueueSongs(0);
          return playable;
        } catch (err) {
          console.error("Load last played song failed", err);
          set({
            lastPlayedLoading: false,
            lastPlayedLoaded: true
          });
          return null;
        }
      },
      /* =====================
         LIKE
      ===================== */
      setLikedSongIds: (songIds = []) => {
        const ids = [...new Set((songIds || []).map(normalizeSongId2).filter(Boolean))];
        set({
          likedSongIds: ids,
          likedSongsLoading: false,
          likedSongsLoaded: true
        });
      },
      ensureLikedSongsLoaded: async () => get().loadLikedSongs(),
      loadLikedSongs: async ({ force = false } = {}) => {
        const { isAuthenticated } = auth_store_default.getState();
        const { likedSongsLoading, likedSongsLoaded, likedSongIds } = get();
        if (!isAuthenticated) {
          set({
            likedSongIds: [],
            likedSongsLoading: false,
            likedSongsLoaded: false
          });
          return [];
        }
        if (likedSongsLoading) return likedSongIds;
        if (likedSongsLoaded && !force) return likedSongIds;
        set({ likedSongsLoading: true });
        try {
          const res = await getLikedSongs();
          const songs = extractSongsFromResponse(res);
          const ids = [...new Set(songs.map(normalizeSongId2).filter(Boolean))];
          set({
            likedSongIds: ids,
            likedSongsLoading: false,
            likedSongsLoaded: true
          });
          return ids;
        } catch (err) {
          console.error("Load liked songs error", err);
          set({
            likedSongsLoading: false,
            likedSongsLoaded: likedSongIds.length > 0
          });
          return likedSongIds;
        }
      },
      toggleLike: async (songId) => {
        const targetId = normalizeSongId2(songId);
        if (!targetId) return;
        if (!auth_store_default.getState().isAuthenticated) {
          emitAuthRequired();
          return;
        }
        if (!get().likedSongsLoaded) {
          await get().ensureLikedSongsLoaded();
        }
        const { likedSongIds } = get();
        const isLiked = likedSongIds.includes(targetId);
        set({
          likedSongIds: isLiked ? likedSongIds.filter((id) => id !== targetId) : [...likedSongIds, targetId],
          likedSongsLoaded: true
        });
        try {
          isLiked ? await axios_default2.delete(`/songs/${targetId}/like`) : await axios_default2.post(`/songs/${targetId}/like`);
        } catch {
          set({ likedSongIds, likedSongsLoaded: true });
        }
      }
    }));
    audio.addEventListener("loadedmetadata", () => {
      tryApplyPendingRestoreTime();
      usePlayerStore.setState({ duration: audio.duration || 0 });
      retryPendingPlayback();
      syncMediaSession();
    });
    audio.addEventListener("loadeddata", () => {
      tryApplyPendingRestoreTime();
      retryPendingPlayback();
    });
    audio.addEventListener("canplay", () => {
      tryApplyPendingRestoreTime();
      retryPendingPlayback();
    });
    audio.addEventListener("canplaythrough", () => {
      tryApplyPendingRestoreTime();
      retryPendingPlayback();
    });
    audio.addEventListener("playing", () => {
      shouldResumePlayback = false;
      syncPlaybackState();
      const state = usePlayerStore.getState();
      persistPlaybackSnapshot({
        song: state.currentSong,
        currentTime: audio.currentTime || state.currentTime || 0,
        force: true,
        isPlaying: true
      });
      setupMediaSession();
      syncMediaSession();
    });
    audio.addEventListener("pause", () => {
      syncPlaybackState();
      const state = usePlayerStore.getState();
      persistPlaybackSnapshot({
        song: state.currentSong,
        currentTime: audio.currentTime || state.currentTime || 0,
        force: true,
        isPlaying: false
      });
      syncMediaSession();
    });
    audio.addEventListener("timeupdate", () => {
      const time = audio.currentTime || 0;
      const state = usePlayerStore.getState();
      if (blockGuestPreviewPlayback({ time })) {
        return;
      }
      if (!state.hasRecordedPlay && time >= 30) {
        state.recordListeningProgress(time);
      }
      usePlayerStore.setState({ currentTime: time });
      persistPlaybackSnapshot({
        song: state.currentSong,
        currentTime: time,
        isPlaying: state.isPlaying
      });
      syncMediaSession();
    });
    audio.addEventListener("ended", () => {
      const state = usePlayerStore.getState();
      if (blockGuestPreviewPlayback({ time: audio.currentTime || state.currentTime || 0, forceNotice: true })) {
        return;
      }
      usePlayerStore.setState({ currentTime: audio.duration || 0 });
      syncPlaybackState();
      if (state.repeatMode === "one") {
        shouldResumePlayback = true;
        audio.currentTime = 0;
        void attemptPlayback();
        return;
      }
      state.playNext();
    });
    audio.volume = usePlayerStore.getState().volume ?? 1;
    audio.playbackRate = usePlayerStore.getState().playbackRate ?? PLAYBACK_RATE_DEFAULT;
    setupMediaSession();
    usePlayerStore.subscribe((state, prevState) => {
      if (state.currentSong !== prevState.currentSong || state.isPlaying !== prevState.isPlaying) {
        syncMediaSession();
      }
    });
    player_store_default = usePlayerStore;
  }
});

// src/components/player/PlayerDetail.jsx
var import_react12 = __toESM(require_react(), 1);

// node_modules/react-router/dist/development/chunk-JMJ3UQ3L.mjs
var React2 = __toESM(require_react(), 1);
var React22 = __toESM(require_react(), 1);
var React3 = __toESM(require_react(), 1);
var React4 = __toESM(require_react(), 1);
var React9 = __toESM(require_react(), 1);
var React8 = __toESM(require_react(), 1);
var React7 = __toESM(require_react(), 1);
var React6 = __toESM(require_react(), 1);
var React5 = __toESM(require_react(), 1);
var React10 = __toESM(require_react(), 1);
var React11 = __toESM(require_react(), 1);
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createPath({
  pathname = "/",
  search = "",
  hash = ""
}) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substring(hashIndex);
      path = path.substring(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substring(searchIndex);
      path = path.substring(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
var _map;
_map = /* @__PURE__ */ new WeakMap();
function matchRoutes(routes, locationArg, basename = "/") {
  return matchRoutesImpl(routes, locationArg, basename, false);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial) {
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    let decoded = decodePath(pathname);
    matches = matchRouteBranch(
      branches[i],
      decoded,
      allowPartial
    );
  }
  return matches;
}
function convertRouteMatchToUiMatch(match, loaderData) {
  let { route, pathname, params } = match;
  return {
    id: route.id,
    pathname,
    params,
    data: loaderData[route.id],
    loaderData: loaderData[route.id],
    handle: route.handle
  };
}
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "", _hasParentOptionalSegments = false) {
  let flattenRoute = (route, index, hasParentOptionalSegments = _hasParentOptionalSegments, relativePath) => {
    let meta = {
      relativePath: relativePath === void 0 ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      if (!meta.relativePath.startsWith(parentPath) && hasParentOptionalSegments) {
        return;
      }
      invariant(
        meta.relativePath.startsWith(parentPath),
        `Absolute route path "${meta.relativePath}" nested under path "${parentPath}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`
      );
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        `Index routes must not have child routes. Please remove all child routes from route path "${path}".`
      );
      flattenRoutes(
        route.children,
        branches,
        routesMeta,
        path,
        hasParentOptionalSegments
      );
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    if (route.path === "" || !route.path?.includes("?")) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, true, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0) return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(
    ...restExploded.map(
      (subpath) => subpath === "" ? required : [required, subpath].join("/")
    )
  );
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map(
    (exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded
  );
}
function rankRouteBranches(branches) {
  branches.sort(
    (a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(
      a.routesMeta.map((meta) => meta.childrenIndex),
      b.routesMeta.map((meta) => meta.childrenIndex)
    )
  );
}
var paramRe = /^:[\w-]+$/;
var dynamicSegmentValue = 3;
var indexRouteValue = 2;
var emptySegmentValue = 1;
var staticSegmentValue = 10;
var splatPenalty = -2;
var isSplat = (s) => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s) => !isSplat(s)).reduce(
    (score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue),
    initialScore
  );
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - b[b.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function matchRouteBranch(branch, pathname, allowPartial = false) {
  let { routesMeta } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath(
      { path: meta.relativePath, caseSensitive: meta.caseSensitive, end },
      remainingPathname
    );
    let route = meta.route;
    if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) {
      match = matchPath(
        {
          path: meta.relativePath,
          caseSensitive: meta.caseSensitive,
          end: false
        },
        remainingPathname
      );
    }
    if (!match) {
      return null;
    }
    Object.assign(matchedParams, match.params);
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(
        joinPaths([matchedPathname, match.pathnameBase])
      ),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = { path: pattern, caseSensitive: false, end: true };
  }
  let [matcher, compiledParams] = compilePath(
    pattern.path,
    pattern.caseSensitive,
    pattern.end
  );
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce(
    (memo22, { paramName, isOptional }, index) => {
      if (paramName === "*") {
        let splatValue = captureGroups[index] || "";
        pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
      }
      const value = captureGroups[index];
      if (isOptional && !value) {
        memo22[paramName] = void 0;
      } else {
        memo22[paramName] = (value || "").replace(/%2F/g, "/");
      }
      return memo22;
    },
    {}
  );
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive = false, end = true) {
  warning(
    path === "*" || !path.endsWith("*") || path.endsWith("/*"),
    `Route path "${path}" will be treated as if it were "${path.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${path.replace(/\*$/, "/*")}".`
  );
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(
    /\/:([\w-]+)(\?)?/g,
    (_, paramName, isOptional) => {
      params.push({ paramName, isOptional: isOptional != null });
      return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
    }
  ).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  if (path.endsWith("*")) {
    params.push({ paramName: "*" });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else {
  }
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, params];
}
function decodePath(value) {
  try {
    return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
  } catch (error) {
    warning(
      false,
      `The URL path "${value}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${error}).`
    );
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
var ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var isAbsoluteUrl = (url) => ABSOLUTE_URL_REGEX.test(url);
function resolvePath(to, fromPathname = "/") {
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname;
  if (toPathname) {
    if (isAbsoluteUrl(toPathname)) {
      pathname = toPathname;
    } else {
      if (toPathname.includes("//")) {
        let oldPathname = toPathname;
        toPathname = toPathname.replace(/\/\/+/g, "/");
        warning(
          false,
          `Pathnames cannot have embedded double slashes - normalizing ${oldPathname} -> ${toPathname}`
        );
      }
      if (toPathname.startsWith("/")) {
        pathname = resolvePathname(toPathname.substring(1), "/");
      } else {
        pathname = resolvePathname(toPathname, fromPathname);
      }
    }
  } else {
    pathname = fromPathname;
  }
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return `Cannot include a '${char}' character in a manually specified \`to.${field}\` field [${JSON.stringify(
    path
  )}].  Please separate it out to the \`to.${dest}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function getPathContributingMatches(matches) {
  return matches.filter(
    (match, index) => index === 0 || match.route.path && match.route.path.length > 0
  );
}
function getResolveToMatches(matches) {
  let pathMatches = getPathContributingMatches(matches);
  return pathMatches.map(
    (match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase
  );
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative = false) {
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = { ...toArg };
    invariant(
      !to.pathname || !to.pathname.includes("?"),
      getInvalidPathError("?", "pathname", "search", to)
    );
    invariant(
      !to.pathname || !to.pathname.includes("#"),
      getInvalidPathError("#", "pathname", "hash", to)
    );
    invariant(
      !to.search || !to.search.includes("#"),
      getInvalidPathError("#", "search", "hash", to)
    );
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
var joinPaths = (paths) => paths.join("/").replace(/\/\/+/g, "/");
var normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
var normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
var normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
var ErrorResponseImpl = class {
  constructor(status, statusText, data2, internal = false) {
    this.status = status;
    this.statusText = statusText || "";
    this.internal = internal;
    if (data2 instanceof Error) {
      this.data = data2.toString();
      this.error = data2;
    } else {
      this.data = data2;
    }
  }
};
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
function getRoutePattern(matches) {
  return matches.map((m) => m.route.path).filter(Boolean).join("/").replace(/\/\/*/g, "/") || "/";
}
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function parseToInfo(_to, basename) {
  let to = _to;
  if (typeof to !== "string" || !ABSOLUTE_URL_REGEX.test(to)) {
    return {
      absoluteURL: void 0,
      isExternal: false,
      to
    };
  }
  let absoluteURL = to;
  let isExternal = false;
  if (isBrowser) {
    try {
      let currentUrl = new URL(window.location.href);
      let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
      let path = stripBasename(targetUrl.pathname, basename);
      if (targetUrl.origin === currentUrl.origin && path != null) {
        to = path + targetUrl.search + targetUrl.hash;
      } else {
        isExternal = true;
      }
    } catch (e) {
      warning(
        false,
        `<Link to="${to}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`
      );
    }
  }
  return {
    absoluteURL,
    isExternal,
    to
  };
}
var objectProtoNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var validMutationMethodsArr = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
];
var validMutationMethods = new Set(
  validMutationMethodsArr
);
var validRequestMethodsArr = [
  "GET",
  ...validMutationMethodsArr
];
var validRequestMethods = new Set(validRequestMethodsArr);
var DataRouterContext = React2.createContext(null);
DataRouterContext.displayName = "DataRouter";
var DataRouterStateContext = React2.createContext(null);
DataRouterStateContext.displayName = "DataRouterState";
var RSCRouterContext = React2.createContext(false);
var ViewTransitionContext = React2.createContext({
  isTransitioning: false
});
ViewTransitionContext.displayName = "ViewTransition";
var FetchersContext = React2.createContext(
  /* @__PURE__ */ new Map()
);
FetchersContext.displayName = "Fetchers";
var AwaitContext = React2.createContext(null);
AwaitContext.displayName = "Await";
var NavigationContext = React2.createContext(
  null
);
NavigationContext.displayName = "Navigation";
var LocationContext = React2.createContext(
  null
);
LocationContext.displayName = "Location";
var RouteContext = React2.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
RouteContext.displayName = "Route";
var RouteErrorContext = React2.createContext(null);
RouteErrorContext.displayName = "RouteError";
var ENABLE_DEV_WARNINGS = true;
var ERROR_DIGEST_BASE = "REACT_ROUTER_ERROR";
var ERROR_DIGEST_REDIRECT = "REDIRECT";
var ERROR_DIGEST_ROUTE_ERROR_RESPONSE = "ROUTE_ERROR_RESPONSE";
function decodeRedirectErrorDigest(digest) {
  if (digest.startsWith(`${ERROR_DIGEST_BASE}:${ERROR_DIGEST_REDIRECT}:{`)) {
    try {
      let parsed = JSON.parse(digest.slice(28));
      if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string" && typeof parsed.location === "string" && typeof parsed.reloadDocument === "boolean" && typeof parsed.replace === "boolean") {
        return parsed;
      }
    } catch {
    }
  }
}
function decodeRouteErrorResponseDigest(digest) {
  if (digest.startsWith(
    `${ERROR_DIGEST_BASE}:${ERROR_DIGEST_ROUTE_ERROR_RESPONSE}:{`
  )) {
    try {
      let parsed = JSON.parse(digest.slice(40));
      if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string") {
        return new ErrorResponseImpl(
          parsed.status,
          parsed.statusText,
          parsed.data
        );
      }
    } catch {
    }
  }
}
function useHref(to, { relative } = {}) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useHref() may be used only in the context of a <Router> component.`
  );
  let { basename, navigator: navigator2 } = React22.useContext(NavigationContext);
  let { hash, pathname, search } = useResolvedPath(to, { relative });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator2.createHref({ pathname: joinedPathname, search, hash });
}
function useInRouterContext() {
  return React22.useContext(LocationContext) != null;
}
function useLocation() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useLocation() may be used only in the context of a <Router> component.`
  );
  return React22.useContext(LocationContext).location;
}
var navigateEffectWarning = `You should call navigate() in a React.useEffect(), not when your component is first rendered.`;
function useIsomorphicLayoutEffect(cb) {
  let isStatic = React22.useContext(NavigationContext).static;
  if (!isStatic) {
    React22.useLayoutEffect(cb);
  }
}
function useNavigate() {
  let { isDataRoute } = React22.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useNavigate() may be used only in the context of a <Router> component.`
  );
  let dataRouterContext = React22.useContext(DataRouterContext);
  let { basename, navigator: navigator2 } = React22.useContext(NavigationContext);
  let { matches } = React22.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  let activeRef = React22.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React22.useCallback(
    (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current) return;
      if (typeof to === "number") {
        navigator2.go(to);
        return;
      }
      let path = resolveTo(
        to,
        JSON.parse(routePathnamesJson),
        locationPathname,
        options.relative === "path"
      );
      if (dataRouterContext == null && basename !== "/") {
        path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
      }
      (!!options.replace ? navigator2.replace : navigator2.push)(
        path,
        options.state,
        options
      );
    },
    [
      basename,
      navigator2,
      routePathnamesJson,
      locationPathname,
      dataRouterContext
    ]
  );
  return navigate;
}
var OutletContext = React22.createContext(null);
function useResolvedPath(to, { relative } = {}) {
  let { matches } = React22.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  return React22.useMemo(
    () => resolveTo(
      to,
      JSON.parse(routePathnamesJson),
      locationPathname,
      relative === "path"
    ),
    [to, routePathnamesJson, locationPathname, relative]
  );
}
function useRoutesImpl(routes, locationArg, dataRouterState, onError, future) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`
  );
  let { navigator: navigator2 } = React22.useContext(NavigationContext);
  let { matches: parentMatches } = React22.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;
  if (ENABLE_DEV_WARNINGS) {
    let parentPath = parentRoute && parentRoute.path || "";
    warningOnce(
      parentPathname,
      !parentRoute || parentPath.endsWith("*") || parentPath.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${parentPathname}" (under <Route path="${parentPath}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${parentPath}"> to <Route path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`
    );
  }
  let locationFromContext = useLocation();
  let location;
  if (locationArg) {
    let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
    invariant(
      parentPathnameBase === "/" || parsedLocationArg.pathname?.startsWith(parentPathnameBase),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${parentPathnameBase}" but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`
    );
    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;
  if (parentPathnameBase !== "/") {
    let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
    let segments = pathname.replace(/^\//, "").split("/");
    remainingPathname = "/" + segments.slice(parentSegments.length).join("/");
  }
  let matches = matchRoutes(routes, { pathname: remainingPathname });
  if (ENABLE_DEV_WARNINGS) {
    warning(
      parentRoute || matches != null,
      `No routes matched location "${location.pathname}${location.search}${location.hash}" `
    );
    warning(
      matches == null || matches[matches.length - 1].route.element !== void 0 || matches[matches.length - 1].route.Component !== void 0 || matches[matches.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`
    );
  }
  let renderedMatches = _renderMatches(
    matches && matches.map(
      (match) => Object.assign({}, match, {
        params: Object.assign({}, parentParams, match.params),
        pathname: joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes.
          // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          navigator2.encodeLocation ? navigator2.encodeLocation(
            match.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : match.pathname
        ]),
        pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes
          // Pre-encode `?` and `#` ahead of `encodeLocation` because it uses
          // `new URL()` internally and we need to prevent it from treating
          // them as separators
          navigator2.encodeLocation ? navigator2.encodeLocation(
            match.pathnameBase.replace(/\?/g, "%3F").replace(/#/g, "%23")
          ).pathname : match.pathnameBase
        ])
      })
    ),
    parentMatches,
    dataRouterState,
    onError,
    future
  );
  if (locationArg && renderedMatches) {
    return /* @__PURE__ */ React22.createElement(
      LocationContext.Provider,
      {
        value: {
          location: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
            ...location
          },
          navigationType: "POP"
          /* Pop */
        }
      },
      renderedMatches
    );
  }
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
  let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };
  let devInfo = null;
  if (ENABLE_DEV_WARNINGS) {
    console.error(
      "Error handled by React Router default ErrorBoundary:",
      error
    );
    devInfo = /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement("p", null, "\u{1F4BF} Hey developer \u{1F44B}"), /* @__PURE__ */ React22.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ React22.createElement("code", { style: codeStyles }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ React22.createElement("code", { style: codeStyles }, "errorElement"), " prop on your route."));
  }
  return /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ React22.createElement("h3", { style: { fontStyle: "italic" } }, message), stack ? /* @__PURE__ */ React22.createElement("pre", { style: preStyles }, stack) : null, devInfo);
}
var defaultErrorElement = /* @__PURE__ */ React22.createElement(DefaultErrorComponent, null);
var RenderErrorBoundary = class extends React22.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }
    return {
      error: props.error !== void 0 ? props.error : state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error(
        "React Router caught the following error during render",
        error
      );
    }
  }
  render() {
    let error = this.state.error;
    if (this.context && typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
      const decoded = decodeRouteErrorResponseDigest(error.digest);
      if (decoded) error = decoded;
    }
    let result = error !== void 0 ? /* @__PURE__ */ React22.createElement(RouteContext.Provider, { value: this.props.routeContext }, /* @__PURE__ */ React22.createElement(
      RouteErrorContext.Provider,
      {
        value: error,
        children: this.props.component
      }
    )) : this.props.children;
    if (this.context) {
      return /* @__PURE__ */ React22.createElement(RSCErrorHandler, { error }, result);
    }
    return result;
  }
};
RenderErrorBoundary.contextType = RSCRouterContext;
var errorRedirectHandledMap = /* @__PURE__ */ new WeakMap();
function RSCErrorHandler({
  children,
  error
}) {
  let { basename } = React22.useContext(NavigationContext);
  if (typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
    let redirect2 = decodeRedirectErrorDigest(error.digest);
    if (redirect2) {
      let existingRedirect = errorRedirectHandledMap.get(error);
      if (existingRedirect) throw existingRedirect;
      let parsed = parseToInfo(redirect2.location, basename);
      if (isBrowser && !errorRedirectHandledMap.get(error)) {
        if (parsed.isExternal || redirect2.reloadDocument) {
          window.location.href = parsed.absoluteURL || parsed.to;
        } else {
          const redirectPromise = Promise.resolve().then(
            () => window.__reactRouterDataRouter.navigate(parsed.to, {
              replace: redirect2.replace
            })
          );
          errorRedirectHandledMap.set(error, redirectPromise);
          throw redirectPromise;
        }
      }
      return /* @__PURE__ */ React22.createElement(
        "meta",
        {
          httpEquiv: "refresh",
          content: `0;url=${parsed.absoluteURL || parsed.to}`
        }
      );
    }
  }
  return children;
}
function RenderedRoute({ routeContext, match, children }) {
  let dataRouterContext = React22.useContext(DataRouterContext);
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /* @__PURE__ */ React22.createElement(RouteContext.Provider, { value: routeContext }, children);
}
function _renderMatches(matches, parentMatches = [], dataRouterState = null, onErrorHandler = null, future = null) {
  if (matches == null) {
    if (!dataRouterState) {
      return null;
    }
    if (dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else if (parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;
  let errors = dataRouterState?.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(
      (m) => m.route.id && errors?.[m.route.id] !== void 0
    );
    invariant(
      errorIndex >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(
        errors
      ).join(",")}`
    );
    renderedMatches = renderedMatches.slice(
      0,
      Math.min(renderedMatches.length, errorIndex + 1)
    );
  }
  let renderFallback = false;
  let fallbackIndex = -1;
  if (dataRouterState) {
    for (let i = 0; i < renderedMatches.length; i++) {
      let match = renderedMatches[i];
      if (match.route.HydrateFallback || match.route.hydrateFallbackElement) {
        fallbackIndex = i;
      }
      if (match.route.id) {
        let { loaderData, errors: errors2 } = dataRouterState;
        let needsToRunLoader = match.route.loader && !loaderData.hasOwnProperty(match.route.id) && (!errors2 || errors2[match.route.id] === void 0);
        if (match.route.lazy || needsToRunLoader) {
          renderFallback = true;
          if (fallbackIndex >= 0) {
            renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
          } else {
            renderedMatches = [renderedMatches[0]];
          }
          break;
        }
      }
    }
  }
  let onError = dataRouterState && onErrorHandler ? (error, errorInfo) => {
    onErrorHandler(error, {
      location: dataRouterState.location,
      params: dataRouterState.matches?.[0]?.params ?? {},
      unstable_pattern: getRoutePattern(dataRouterState.matches),
      errorInfo
    });
  } : void 0;
  return renderedMatches.reduceRight(
    (outlet, match, index) => {
      let error;
      let shouldRenderHydrateFallback = false;
      let errorElement = null;
      let hydrateFallbackElement = null;
      if (dataRouterState) {
        error = errors && match.route.id ? errors[match.route.id] : void 0;
        errorElement = match.route.errorElement || defaultErrorElement;
        if (renderFallback) {
          if (fallbackIndex < 0 && index === 0) {
            warningOnce(
              "route-fallback",
              false,
              "No `HydrateFallback` element provided to render during initial hydration"
            );
            shouldRenderHydrateFallback = true;
            hydrateFallbackElement = null;
          } else if (fallbackIndex === index) {
            shouldRenderHydrateFallback = true;
            hydrateFallbackElement = match.route.hydrateFallbackElement || null;
          }
        }
      }
      let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
      let getChildren = () => {
        let children;
        if (error) {
          children = errorElement;
        } else if (shouldRenderHydrateFallback) {
          children = hydrateFallbackElement;
        } else if (match.route.Component) {
          children = /* @__PURE__ */ React22.createElement(match.route.Component, null);
        } else if (match.route.element) {
          children = match.route.element;
        } else {
          children = outlet;
        }
        return /* @__PURE__ */ React22.createElement(
          RenderedRoute,
          {
            match,
            routeContext: {
              outlet,
              matches: matches2,
              isDataRoute: dataRouterState != null
            },
            children
          }
        );
      };
      return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ React22.createElement(
        RenderErrorBoundary,
        {
          location: dataRouterState.location,
          revalidation: dataRouterState.revalidation,
          component: errorElement,
          error,
          children: getChildren(),
          routeContext: { outlet: null, matches: matches2, isDataRoute: true },
          onError
        }
      ) : getChildren();
    },
    null
  );
}
function getDataRouterConsoleError(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext(hookName) {
  let ctx = React22.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError(hookName));
  return ctx;
}
function useDataRouterState(hookName) {
  let state = React22.useContext(DataRouterStateContext);
  invariant(state, getDataRouterConsoleError(hookName));
  return state;
}
function useRouteContext(hookName) {
  let route = React22.useContext(RouteContext);
  invariant(route, getDataRouterConsoleError(hookName));
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  invariant(
    thisRoute.route.id,
    `${hookName} can only be used on routes that contain a unique "id"`
  );
  return thisRoute.route.id;
}
function useRouteId() {
  return useCurrentRouteId(
    "useRouteId"
    /* UseRouteId */
  );
}
function useNavigation() {
  let state = useDataRouterState(
    "useNavigation"
    /* UseNavigation */
  );
  return state.navigation;
}
function useMatches() {
  let { matches, loaderData } = useDataRouterState(
    "useMatches"
    /* UseMatches */
  );
  return React22.useMemo(
    () => matches.map((m) => convertRouteMatchToUiMatch(m, loaderData)),
    [matches, loaderData]
  );
}
function useRouteError() {
  let error = React22.useContext(RouteErrorContext);
  let state = useDataRouterState(
    "useRouteError"
    /* UseRouteError */
  );
  let routeId = useCurrentRouteId(
    "useRouteError"
    /* UseRouteError */
  );
  if (error !== void 0) {
    return error;
  }
  return state.errors?.[routeId];
}
function useNavigateStable() {
  let { router } = useDataRouterContext(
    "useNavigate"
    /* UseNavigateStable */
  );
  let id = useCurrentRouteId(
    "useNavigate"
    /* UseNavigateStable */
  );
  let activeRef = React22.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = React22.useCallback(
    async (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current) return;
      if (typeof to === "number") {
        await router.navigate(to);
      } else {
        await router.navigate(to, { fromRouteId: id, ...options });
      }
    },
    [router, id]
  );
  return navigate;
}
var alreadyWarned = {};
function warningOnce(key, cond, message) {
  if (!cond && !alreadyWarned[key]) {
    alreadyWarned[key] = true;
    warning(false, message);
  }
}
var USE_OPTIMISTIC = "useOptimistic";
var useOptimisticImpl = React3[USE_OPTIMISTIC];
var MemoizedDataRoutes = React3.memo(DataRoutes);
function DataRoutes({
  routes,
  future,
  state,
  onError
}) {
  return useRoutesImpl(routes, void 0, state, onError, future);
}
function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = "POP",
  navigator: navigator2,
  static: staticProp = false,
  unstable_useTransitions
}) {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`
  );
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React3.useMemo(
    () => ({
      basename,
      navigator: navigator2,
      static: staticProp,
      unstable_useTransitions,
      future: {}
    }),
    [basename, navigator2, staticProp, unstable_useTransitions]
  );
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = React3.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  warning(
    locationContext != null,
    `<Router basename="${basename}"> is not able to match the URL "${pathname}${search}${hash}" because it does not start with the basename, so the <Router> won't render anything.`
  );
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ React3.createElement(NavigationContext.Provider, { value: navigationContext }, /* @__PURE__ */ React3.createElement(LocationContext.Provider, { children, value: locationContext }));
}
var defaultMethod = "get";
var defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return typeof HTMLElement !== "undefined" && object instanceof HTMLElement;
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
var _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
var supportedFormEncTypes = /* @__PURE__ */ new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    warning(
      false,
      `"${encType}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${defaultEncType}"`
    );
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error(
        `Cannot submit a <button> or <input type="submit"> without a <form>`
      );
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let { name, type, value } = target;
      if (type === "image") {
        let prefix = name ? `${name}.` : "";
        formData.append(`${prefix}x`, "0");
        formData.append(`${prefix}y`, "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error(
      `Cannot submit element that is not <form>, <button>, or <input type="submit|image">`
    );
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return { action, method: method.toLowerCase(), encType, formData, body };
}
var objectProtoNames2 = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function invariant2(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function singleFetchUrl(reqUrl, basename, extension) {
  let url = typeof reqUrl === "string" ? new URL(
    reqUrl,
    // This can be called during the SSR flow via PrefetchPageLinksImpl so
    // don't assume window is available
    typeof window === "undefined" ? "server://singlefetch/" : window.location.origin
  ) : reqUrl;
  if (url.pathname === "/") {
    url.pathname = `_root.${extension}`;
  } else if (basename && stripBasename(url.pathname, basename) === "/") {
    url.pathname = `${basename.replace(/\/$/, "")}/_root.${extension}`;
  } else {
    url.pathname = `${url.pathname.replace(/\/$/, "")}.${extension}`;
  }
  return url;
}
async function loadRouteModule(route, routeModulesCache) {
  if (route.id in routeModulesCache) {
    return routeModulesCache[route.id];
  }
  try {
    let routeModule = await import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      route.module
    );
    routeModulesCache[route.id] = routeModule;
    return routeModule;
  } catch (error) {
    console.error(
      `Error loading route module \`${route.module}\`, reloading page...`
    );
    console.error(error);
    if (window.__reactRouterContext && window.__reactRouterContext.isSpaMode && // @ts-expect-error
    import.meta.hot) {
      throw error;
    }
    window.location.reload();
    return new Promise(() => {
    });
  }
}
function isPageLinkDescriptor(object) {
  return object != null && typeof object.page === "string";
}
function isHtmlLinkDescriptor(object) {
  if (object == null) {
    return false;
  }
  if (object.href == null) {
    return object.rel === "preload" && typeof object.imageSrcSet === "string" && typeof object.imageSizes === "string";
  }
  return typeof object.rel === "string" && typeof object.href === "string";
}
async function getKeyedPrefetchLinks(matches, manifest, routeModules) {
  let links = await Promise.all(
    matches.map(async (match) => {
      let route = manifest.routes[match.route.id];
      if (route) {
        let mod = await loadRouteModule(route, routeModules);
        return mod.links ? mod.links() : [];
      }
      return [];
    })
  );
  return dedupeLinkDescriptors(
    links.flat(1).filter(isHtmlLinkDescriptor).filter((link) => link.rel === "stylesheet" || link.rel === "preload").map(
      (link) => link.rel === "stylesheet" ? { ...link, rel: "prefetch", as: "style" } : { ...link, rel: "prefetch" }
    )
  );
}
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
  let isNew = (match, index) => {
    if (!currentMatches[index]) return true;
    return match.route.id !== currentMatches[index].route.id;
  };
  let matchPathChanged = (match, index) => {
    return (
      // param change, /users/123 -> /users/456
      currentMatches[index].pathname !== match.pathname || // splat param changed, which is not present in match.path
      // e.g. /files/images/avatar.jpg -> files/finances.xls
      currentMatches[index].route.path?.endsWith("*") && currentMatches[index].params["*"] !== match.params["*"]
    );
  };
  if (mode === "assets") {
    return nextMatches.filter(
      (match, index) => isNew(match, index) || matchPathChanged(match, index)
    );
  }
  if (mode === "data") {
    return nextMatches.filter((match, index) => {
      let manifestRoute = manifest.routes[match.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return false;
      }
      if (isNew(match, index) || matchPathChanged(match, index)) {
        return true;
      }
      if (match.route.shouldRevalidate) {
        let routeChoice = match.route.shouldRevalidate({
          currentUrl: new URL(
            location.pathname + location.search + location.hash,
            window.origin
          ),
          currentParams: currentMatches[0]?.params || {},
          nextUrl: new URL(page, window.origin),
          nextParams: match.params,
          defaultShouldRevalidate: true
        });
        if (typeof routeChoice === "boolean") {
          return routeChoice;
        }
      }
      return true;
    });
  }
  return [];
}
function getModuleLinkHrefs(matches, manifest, { includeHydrateFallback } = {}) {
  return dedupeHrefs(
    matches.map((match) => {
      let route = manifest.routes[match.route.id];
      if (!route) return [];
      let hrefs = [route.module];
      if (route.clientActionModule) {
        hrefs = hrefs.concat(route.clientActionModule);
      }
      if (route.clientLoaderModule) {
        hrefs = hrefs.concat(route.clientLoaderModule);
      }
      if (includeHydrateFallback && route.hydrateFallbackModule) {
        hrefs = hrefs.concat(route.hydrateFallbackModule);
      }
      if (route.imports) {
        hrefs = hrefs.concat(route.imports);
      }
      return hrefs;
    }).flat(1)
  );
}
function dedupeHrefs(hrefs) {
  return [...new Set(hrefs)];
}
function sortKeys(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}
function dedupeLinkDescriptors(descriptors2, preloads) {
  let set = /* @__PURE__ */ new Set();
  let preloadsSet = new Set(preloads);
  return descriptors2.reduce((deduped, descriptor) => {
    let alreadyModulePreload = preloads && !isPageLinkDescriptor(descriptor) && descriptor.as === "script" && descriptor.href && preloadsSet.has(descriptor.href);
    if (alreadyModulePreload) {
      return deduped;
    }
    let key = JSON.stringify(sortKeys(descriptor));
    if (!set.has(key)) {
      set.add(key);
      deduped.push({ key, link: descriptor });
    }
    return deduped;
  }, []);
}
function useDataRouterContext2() {
  let context = React8.useContext(DataRouterContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterContext.Provider> element"
  );
  return context;
}
function useDataRouterStateContext() {
  let context = React8.useContext(DataRouterStateContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  );
  return context;
}
var FrameworkContext = React8.createContext(void 0);
FrameworkContext.displayName = "FrameworkContext";
function useFrameworkContext() {
  let context = React8.useContext(FrameworkContext);
  invariant2(
    context,
    "You must render this element inside a <HydratedRouter> element"
  );
  return context;
}
function usePrefetchBehavior(prefetch, theirElementProps) {
  let frameworkContext = React8.useContext(FrameworkContext);
  let [maybePrefetch, setMaybePrefetch] = React8.useState(false);
  let [shouldPrefetch, setShouldPrefetch] = React8.useState(false);
  let { onFocus, onBlur, onMouseEnter, onMouseLeave, onTouchStart } = theirElementProps;
  let ref = React8.useRef(null);
  React8.useEffect(() => {
    if (prefetch === "render") {
      setShouldPrefetch(true);
    }
    if (prefetch === "viewport") {
      let callback = (entries) => {
        entries.forEach((entry) => {
          setShouldPrefetch(entry.isIntersecting);
        });
      };
      let observer = new IntersectionObserver(callback, { threshold: 0.5 });
      if (ref.current) observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [prefetch]);
  React8.useEffect(() => {
    if (maybePrefetch) {
      let id = setTimeout(() => {
        setShouldPrefetch(true);
      }, 100);
      return () => {
        clearTimeout(id);
      };
    }
  }, [maybePrefetch]);
  let setIntent = () => {
    setMaybePrefetch(true);
  };
  let cancelIntent = () => {
    setMaybePrefetch(false);
    setShouldPrefetch(false);
  };
  if (!frameworkContext) {
    return [false, ref, {}];
  }
  if (prefetch !== "intent") {
    return [shouldPrefetch, ref, {}];
  }
  return [
    shouldPrefetch,
    ref,
    {
      onFocus: composeEventHandlers(onFocus, setIntent),
      onBlur: composeEventHandlers(onBlur, cancelIntent),
      onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
      onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
      onTouchStart: composeEventHandlers(onTouchStart, setIntent)
    }
  ];
}
function composeEventHandlers(theirHandler, ourHandler) {
  return (event) => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}
function PrefetchPageLinks({ page, ...linkProps }) {
  let { router } = useDataRouterContext2();
  let matches = React8.useMemo(
    () => matchRoutes(router.routes, page, router.basename),
    [router.routes, page, router.basename]
  );
  if (!matches) {
    return null;
  }
  return /* @__PURE__ */ React8.createElement(PrefetchPageLinksImpl, { page, matches, ...linkProps });
}
function useKeyedPrefetchLinks(matches) {
  let { manifest, routeModules } = useFrameworkContext();
  let [keyedPrefetchLinks, setKeyedPrefetchLinks] = React8.useState([]);
  React8.useEffect(() => {
    let interrupted = false;
    void getKeyedPrefetchLinks(matches, manifest, routeModules).then(
      (links) => {
        if (!interrupted) {
          setKeyedPrefetchLinks(links);
        }
      }
    );
    return () => {
      interrupted = true;
    };
  }, [matches, manifest, routeModules]);
  return keyedPrefetchLinks;
}
function PrefetchPageLinksImpl({
  page,
  matches: nextMatches,
  ...linkProps
}) {
  let location = useLocation();
  let { manifest, routeModules } = useFrameworkContext();
  let { basename } = useDataRouterContext2();
  let { loaderData, matches } = useDataRouterStateContext();
  let newMatchesForData = React8.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "data"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let newMatchesForAssets = React8.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "assets"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let dataHrefs = React8.useMemo(() => {
    if (page === location.pathname + location.search + location.hash) {
      return [];
    }
    let routesParams = /* @__PURE__ */ new Set();
    let foundOptOutRoute = false;
    nextMatches.forEach((m) => {
      let manifestRoute = manifest.routes[m.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return;
      }
      if (!newMatchesForData.some((m2) => m2.route.id === m.route.id) && m.route.id in loaderData && routeModules[m.route.id]?.shouldRevalidate) {
        foundOptOutRoute = true;
      } else if (manifestRoute.hasClientLoader) {
        foundOptOutRoute = true;
      } else {
        routesParams.add(m.route.id);
      }
    });
    if (routesParams.size === 0) {
      return [];
    }
    let url = singleFetchUrl(page, basename, "data");
    if (foundOptOutRoute && routesParams.size > 0) {
      url.searchParams.set(
        "_routes",
        nextMatches.filter((m) => routesParams.has(m.route.id)).map((m) => m.route.id).join(",")
      );
    }
    return [url.pathname + url.search];
  }, [
    basename,
    loaderData,
    location,
    manifest,
    newMatchesForData,
    nextMatches,
    page,
    routeModules
  ]);
  let moduleHrefs = React8.useMemo(
    () => getModuleLinkHrefs(newMatchesForAssets, manifest),
    [newMatchesForAssets, manifest]
  );
  let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, dataHrefs.map((href) => /* @__PURE__ */ React8.createElement("link", { key: href, rel: "prefetch", as: "fetch", href, ...linkProps })), moduleHrefs.map((href) => /* @__PURE__ */ React8.createElement("link", { key: href, rel: "modulepreload", href, ...linkProps })), keyedPrefetchLinks.map(({ key, link }) => (
    // these don't spread `linkProps` because they are full link descriptors
    // already with their own props
    /* @__PURE__ */ React8.createElement("link", { key, nonce: linkProps.nonce, ...link })
  )));
}
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
var isBrowser2 = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
try {
  if (isBrowser2) {
    window.__reactRouterVersion = // @ts-expect-error
    "7.11.0";
  }
} catch (e) {
}
function HistoryRouter({
  basename,
  children,
  history,
  unstable_useTransitions
}) {
  let [state, setStateImpl] = React10.useState({
    action: history.action,
    location: history.location
  });
  let setState = React10.useCallback(
    (newState) => {
      if (unstable_useTransitions === false) {
        setStateImpl(newState);
      } else {
        React10.startTransition(() => setStateImpl(newState));
      }
    },
    [unstable_useTransitions]
  );
  React10.useLayoutEffect(() => history.listen(setState), [history, setState]);
  return /* @__PURE__ */ React10.createElement(
    Router,
    {
      basename,
      children,
      location: state.location,
      navigationType: state.action,
      navigator: history,
      unstable_useTransitions
    }
  );
}
HistoryRouter.displayName = "unstable_HistoryRouter";
var ABSOLUTE_URL_REGEX2 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var Link = React10.forwardRef(
  function LinkWithRef({
    onClick,
    discover = "render",
    prefetch = "none",
    relative,
    reloadDocument,
    replace: replace2,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition,
    unstable_defaultShouldRevalidate,
    ...rest
  }, forwardedRef) {
    let { basename, unstable_useTransitions } = React10.useContext(NavigationContext);
    let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX2.test(to);
    let parsed = parseToInfo(to, basename);
    to = parsed.to;
    let href = useHref(to, { relative });
    let [shouldPrefetch, prefetchRef, prefetchHandlers] = usePrefetchBehavior(
      prefetch,
      rest
    );
    let internalOnClick = useLinkClickHandler(to, {
      replace: replace2,
      state,
      target,
      preventScrollReset,
      relative,
      viewTransition,
      unstable_defaultShouldRevalidate,
      unstable_useTransitions
    });
    function handleClick(event) {
      if (onClick) onClick(event);
      if (!event.defaultPrevented) {
        internalOnClick(event);
      }
    }
    let link = (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      /* @__PURE__ */ React10.createElement(
        "a",
        {
          ...rest,
          ...prefetchHandlers,
          href: parsed.absoluteURL || href,
          onClick: parsed.isExternal || reloadDocument ? onClick : handleClick,
          ref: mergeRefs(forwardedRef, prefetchRef),
          target,
          "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
        }
      )
    );
    return shouldPrefetch && !isAbsolute ? /* @__PURE__ */ React10.createElement(React10.Fragment, null, link, /* @__PURE__ */ React10.createElement(PrefetchPageLinks, { page: href })) : link;
  }
);
Link.displayName = "Link";
var NavLink = React10.forwardRef(
  function NavLinkWithRef({
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children,
    ...rest
  }, ref) {
    let path = useResolvedPath(to, { relative: rest.relative });
    let location = useLocation();
    let routerState = React10.useContext(DataRouterStateContext);
    let { navigator: navigator2, basename } = React10.useContext(NavigationContext);
    let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useViewTransitionState(path) && viewTransition === true;
    let toPathname = navigator2.encodeLocation ? navigator2.encodeLocation(path).pathname : path.pathname;
    let locationPathname = location.pathname;
    let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
    if (!caseSensitive) {
      locationPathname = locationPathname.toLowerCase();
      nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
      toPathname = toPathname.toLowerCase();
    }
    if (nextLocationPathname && basename) {
      nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
    }
    const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
    let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
    let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
    let renderProps = {
      isActive,
      isPending,
      isTransitioning
    };
    let ariaCurrent = isActive ? ariaCurrentProp : void 0;
    let className;
    if (typeof classNameProp === "function") {
      className = classNameProp(renderProps);
    } else {
      className = [
        classNameProp,
        isActive ? "active" : null,
        isPending ? "pending" : null,
        isTransitioning ? "transitioning" : null
      ].filter(Boolean).join(" ");
    }
    let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
    return /* @__PURE__ */ React10.createElement(
      Link,
      {
        ...rest,
        "aria-current": ariaCurrent,
        className,
        ref,
        style,
        to,
        viewTransition
      },
      typeof children === "function" ? children(renderProps) : children
    );
  }
);
NavLink.displayName = "NavLink";
var Form = React10.forwardRef(
  ({
    discover = "render",
    fetcherKey,
    navigate,
    reloadDocument,
    replace: replace2,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    viewTransition,
    unstable_defaultShouldRevalidate,
    ...props
  }, forwardedRef) => {
    let { unstable_useTransitions } = React10.useContext(NavigationContext);
    let submit = useSubmit();
    let formAction = useFormAction(action, { relative });
    let formMethod = method.toLowerCase() === "get" ? "get" : "post";
    let isAbsolute = typeof action === "string" && ABSOLUTE_URL_REGEX2.test(action);
    let submitHandler = (event) => {
      onSubmit && onSubmit(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      let submitter = event.nativeEvent.submitter;
      let submitMethod = submitter?.getAttribute("formmethod") || method;
      let doSubmit = () => submit(submitter || event.currentTarget, {
        fetcherKey,
        method: submitMethod,
        navigate,
        replace: replace2,
        state,
        relative,
        preventScrollReset,
        viewTransition,
        unstable_defaultShouldRevalidate
      });
      if (unstable_useTransitions && navigate !== false) {
        React10.startTransition(() => doSubmit());
      } else {
        doSubmit();
      }
    };
    return /* @__PURE__ */ React10.createElement(
      "form",
      {
        ref: forwardedRef,
        method: formMethod,
        action: formAction,
        onSubmit: reloadDocument ? onSubmit : submitHandler,
        ...props,
        "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
      }
    );
  }
);
Form.displayName = "Form";
function ScrollRestoration({
  getKey,
  storageKey,
  ...props
}) {
  let remixContext = React10.useContext(FrameworkContext);
  let { basename } = React10.useContext(NavigationContext);
  let location = useLocation();
  let matches = useMatches();
  useScrollRestoration({ getKey, storageKey });
  let ssrKey = React10.useMemo(
    () => {
      if (!remixContext || !getKey) return null;
      let userKey = getScrollRestorationKey(
        location,
        matches,
        basename,
        getKey
      );
      return userKey !== location.key ? userKey : null;
    },
    // Nah, we only need this the first time for the SSR render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  if (!remixContext || remixContext.isSpaMode) {
    return null;
  }
  let restoreScroll = ((storageKey2, restoreKey) => {
    if (!window.history.state || !window.history.state.key) {
      let key = Math.random().toString(32).slice(2);
      window.history.replaceState({ key }, "");
    }
    try {
      let positions = JSON.parse(sessionStorage.getItem(storageKey2) || "{}");
      let storedY = positions[restoreKey || window.history.state.key];
      if (typeof storedY === "number") {
        window.scrollTo(0, storedY);
      }
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem(storageKey2);
    }
  }).toString();
  return /* @__PURE__ */ React10.createElement(
    "script",
    {
      ...props,
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: {
        __html: `(${restoreScroll})(${JSON.stringify(
          storageKey || SCROLL_RESTORATION_STORAGE_KEY
        )}, ${JSON.stringify(ssrKey)})`
      }
    }
  );
}
ScrollRestoration.displayName = "ScrollRestoration";
function getDataRouterConsoleError2(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext3(hookName) {
  let ctx = React10.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError2(hookName));
  return ctx;
}
function useDataRouterState2(hookName) {
  let state = React10.useContext(DataRouterStateContext);
  invariant(state, getDataRouterConsoleError2(hookName));
  return state;
}
function useLinkClickHandler(to, {
  target,
  replace: replaceProp,
  state,
  preventScrollReset,
  relative,
  viewTransition,
  unstable_defaultShouldRevalidate,
  unstable_useTransitions
} = {}) {
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, { relative });
  return React10.useCallback(
    (event) => {
      if (shouldProcessLinkClick(event, target)) {
        event.preventDefault();
        let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
        let doNavigate = () => navigate(to, {
          replace: replace2,
          state,
          preventScrollReset,
          relative,
          viewTransition,
          unstable_defaultShouldRevalidate
        });
        if (unstable_useTransitions) {
          React10.startTransition(() => doNavigate());
        } else {
          doNavigate();
        }
      }
    },
    [
      location,
      navigate,
      path,
      replaceProp,
      state,
      target,
      to,
      preventScrollReset,
      relative,
      viewTransition,
      unstable_defaultShouldRevalidate,
      unstable_useTransitions
    ]
  );
}
var fetcherId = 0;
var getUniqueFetcherId = () => `__${String(++fetcherId)}__`;
function useSubmit() {
  let { router } = useDataRouterContext3(
    "useSubmit"
    /* UseSubmit */
  );
  let { basename } = React10.useContext(NavigationContext);
  let currentRouteId = useRouteId();
  let routerFetch = router.fetch;
  let routerNavigate = router.navigate;
  return React10.useCallback(
    async (target, options = {}) => {
      let { action, method, encType, formData, body } = getFormSubmissionInfo(
        target,
        basename
      );
      if (options.navigate === false) {
        let key = options.fetcherKey || getUniqueFetcherId();
        await routerFetch(key, currentRouteId, options.action || action, {
          unstable_defaultShouldRevalidate: options.unstable_defaultShouldRevalidate,
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          flushSync: options.flushSync
        });
      } else {
        await routerNavigate(options.action || action, {
          unstable_defaultShouldRevalidate: options.unstable_defaultShouldRevalidate,
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          replace: options.replace,
          state: options.state,
          fromRouteId: currentRouteId,
          flushSync: options.flushSync,
          viewTransition: options.viewTransition
        });
      }
    },
    [routerFetch, routerNavigate, basename, currentRouteId]
  );
}
function useFormAction(action, { relative } = {}) {
  let { basename } = React10.useContext(NavigationContext);
  let routeContext = React10.useContext(RouteContext);
  invariant(routeContext, "useFormAction must be used inside a RouteContext");
  let [match] = routeContext.matches.slice(-1);
  let path = { ...useResolvedPath(action ? action : ".", { relative }) };
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    let indexValues = params.getAll("index");
    let hasNakedIndexParam = indexValues.some((v) => v === "");
    if (hasNakedIndexParam) {
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? `?${qs}` : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
var SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
var savedScrollPositions = {};
function getScrollRestorationKey(location, matches, basename, getKey) {
  let key = null;
  if (getKey) {
    if (basename !== "/") {
      key = getKey(
        {
          ...location,
          pathname: stripBasename(location.pathname, basename) || location.pathname
        },
        matches
      );
    } else {
      key = getKey(location, matches);
    }
  }
  if (key == null) {
    key = location.key;
  }
  return key;
}
function useScrollRestoration({
  getKey,
  storageKey
} = {}) {
  let { router } = useDataRouterContext3(
    "useScrollRestoration"
    /* UseScrollRestoration */
  );
  let { restoreScrollPosition, preventScrollReset } = useDataRouterState2(
    "useScrollRestoration"
    /* UseScrollRestoration */
  );
  let { basename } = React10.useContext(NavigationContext);
  let location = useLocation();
  let matches = useMatches();
  let navigation = useNavigation();
  React10.useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);
  usePageHide(
    React10.useCallback(() => {
      if (navigation.state === "idle") {
        let key = getScrollRestorationKey(location, matches, basename, getKey);
        savedScrollPositions[key] = window.scrollY;
      }
      try {
        sessionStorage.setItem(
          storageKey || SCROLL_RESTORATION_STORAGE_KEY,
          JSON.stringify(savedScrollPositions)
        );
      } catch (error) {
        warning(
          false,
          `Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (${error}).`
        );
      }
      window.history.scrollRestoration = "auto";
    }, [navigation.state, getKey, basename, location, matches, storageKey])
  );
  if (typeof document !== "undefined") {
    React10.useLayoutEffect(() => {
      try {
        let sessionPositions = sessionStorage.getItem(
          storageKey || SCROLL_RESTORATION_STORAGE_KEY
        );
        if (sessionPositions) {
          savedScrollPositions = JSON.parse(sessionPositions);
        }
      } catch (e) {
      }
    }, [storageKey]);
    React10.useLayoutEffect(() => {
      let disableScrollRestoration = router?.enableScrollRestoration(
        savedScrollPositions,
        () => window.scrollY,
        getKey ? (location2, matches2) => getScrollRestorationKey(location2, matches2, basename, getKey) : void 0
      );
      return () => disableScrollRestoration && disableScrollRestoration();
    }, [router, basename, getKey]);
    React10.useLayoutEffect(() => {
      if (restoreScrollPosition === false) {
        return;
      }
      if (typeof restoreScrollPosition === "number") {
        window.scrollTo(0, restoreScrollPosition);
        return;
      }
      try {
        if (location.hash) {
          let el = document.getElementById(
            decodeURIComponent(location.hash.slice(1))
          );
          if (el) {
            el.scrollIntoView();
            return;
          }
        }
      } catch {
        warning(
          false,
          `"${location.hash.slice(
            1
          )}" is not a decodable element ID. The view will not scroll to it.`
        );
      }
      if (preventScrollReset === true) {
        return;
      }
      window.scrollTo(0, 0);
    }, [location, restoreScrollPosition, preventScrollReset]);
  }
}
function usePageHide(callback, options) {
  let { capture } = options || {};
  React10.useEffect(() => {
    let opts = capture != null ? { capture } : void 0;
    window.addEventListener("pagehide", callback, opts);
    return () => {
      window.removeEventListener("pagehide", callback, opts);
    };
  }, [callback, capture]);
}
function useViewTransitionState(to, { relative } = {}) {
  let vtContext = React10.useContext(ViewTransitionContext);
  invariant(
    vtContext != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?"
  );
  let { basename } = useDataRouterContext3(
    "useViewTransitionState"
    /* useViewTransitionState */
  );
  let path = useResolvedPath(to, { relative });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}

// node_modules/zustand/esm/react/shallow.mjs
var import_react = __toESM(require_react(), 1);

// node_modules/zustand/esm/vanilla/shallow.mjs
var isIterable = (obj) => Symbol.iterator in obj;
var hasIterableEntries = (value) => (
  // HACK: avoid checking entries type
  "entries" in value
);
var compareEntries = (valueA, valueB) => {
  const mapA = valueA instanceof Map ? valueA : new Map(valueA.entries());
  const mapB = valueB instanceof Map ? valueB : new Map(valueB.entries());
  if (mapA.size !== mapB.size) {
    return false;
  }
  for (const [key, value] of mapA) {
    if (!mapB.has(key) || !Object.is(value, mapB.get(key))) {
      return false;
    }
  }
  return true;
};
var compareIterables = (valueA, valueB) => {
  const iteratorA = valueA[Symbol.iterator]();
  const iteratorB = valueB[Symbol.iterator]();
  let nextA = iteratorA.next();
  let nextB = iteratorB.next();
  while (!nextA.done && !nextB.done) {
    if (!Object.is(nextA.value, nextB.value)) {
      return false;
    }
    nextA = iteratorA.next();
    nextB = iteratorB.next();
  }
  return !!nextA.done && !!nextB.done;
};
function shallow(valueA, valueB) {
  if (Object.is(valueA, valueB)) {
    return true;
  }
  if (typeof valueA !== "object" || valueA === null || typeof valueB !== "object" || valueB === null) {
    return false;
  }
  if (Object.getPrototypeOf(valueA) !== Object.getPrototypeOf(valueB)) {
    return false;
  }
  if (isIterable(valueA) && isIterable(valueB)) {
    if (hasIterableEntries(valueA) && hasIterableEntries(valueB)) {
      return compareEntries(valueA, valueB);
    }
    return compareIterables(valueA, valueB);
  }
  return compareEntries(
    { entries: () => Object.entries(valueA) },
    { entries: () => Object.entries(valueB) }
  );
}

// node_modules/zustand/esm/react/shallow.mjs
function useShallow(selector) {
  const prev = import_react.default.useRef(void 0);
  return (state) => {
    const next = selector(state);
    return shallow(prev.current, next) ? prev.current : prev.current = next;
  };
}

// node_modules/react-icons/lib/iconBase.mjs
var import_react3 = __toESM(require_react(), 1);

// node_modules/react-icons/lib/iconContext.mjs
var import_react2 = __toESM(require_react(), 1);
var DefaultContext = {
  color: void 0,
  size: void 0,
  className: void 0,
  style: void 0,
  attr: void 0
};
var IconContext = import_react2.default.createContext && /* @__PURE__ */ import_react2.default.createContext(DefaultContext);

// node_modules/react-icons/lib/iconBase.mjs
var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function ownKeys(e, r2) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r2 && (o = o.filter(function(r3) {
      return Object.getOwnPropertyDescriptor(e, r3).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var t = null != arguments[r2] ? arguments[r2] : {};
    r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
      _defineProperty(e, r3, t[r3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
      Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
    });
  }
  return e;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r2) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r2 || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r2 ? String : Number)(t);
}
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /* @__PURE__ */ import_react3.default.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data2) {
  return (props) => /* @__PURE__ */ import_react3.default.createElement(IconBase, _extends({
    attr: _objectSpread({}, data2.attr)
  }, props), Tree2Element(data2.child));
}
function IconBase(props) {
  var elem = (conf) => {
    var {
      attr,
      size,
      title
    } = props, svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /* @__PURE__ */ import_react3.default.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /* @__PURE__ */ import_react3.default.createElement("title", null, title), props.children);
  };
  return IconContext !== void 0 ? /* @__PURE__ */ import_react3.default.createElement(IconContext.Consumer, null, (conf) => elem(conf)) : elem(DefaultContext);
}

// node_modules/react-icons/fa6/index.mjs
function FaBackwardStep(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 320 512" }, "child": [{ "tag": "path", "attr": { "d": "M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241 64 96c0-17.7-14.3-32-32-32S0 78.3 0 96L0 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-145 11.5 9.6 192 160z" }, "child": [] }] })(props);
}
function FaForwardStep(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 320 512" }, "child": [{ "tag": "path", "attr": { "d": "M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241l0-145c0-17.7 14.3-32 32-32s32 14.3 32 32l0 320c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-145-11.5 9.6-192 160z" }, "child": [] }] })(props);
}
function FaPause(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 320 512" }, "child": [{ "tag": "path", "attr": { "d": "M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" }, "child": [] }] })(props);
}
function FaPlay(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 384 512" }, "child": [{ "tag": "path", "attr": { "d": "M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" }, "child": [] }] })(props);
}
function FaRepeat(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96l160 0 0 32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32l0 32L160 64C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96l-160 0 0-32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-32 160 0c88.4 0 160-71.6 160-160z" }, "child": [] }] })(props);
}
function FaShuffle(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 512 512" }, "child": [{ "tag": "path", "attr": { "d": "M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-32-32 0c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96l32 0 0-32c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-32-32 0c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8l32 0 0-32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z" }, "child": [] }] })(props);
}
function FaVolumeHigh(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 640 512" }, "child": [{ "tag": "path", "attr": { "d": "M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" }, "child": [] }] })(props);
}
function FaVolumeXmark(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 576 512" }, "child": [{ "tag": "path", "attr": { "d": "M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z" }, "child": [] }] })(props);
}

// node_modules/react-icons/fi/index.mjs
function FiCheck(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "20 6 9 17 4 12" }, "child": [] }] })(props);
}
function FiChevronDown(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "6 9 12 15 18 9" }, "child": [] }] })(props);
}
function FiChevronRight(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "9 18 15 12 9 6" }, "child": [] }] })(props);
}
function FiClock(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "12", "cy": "12", "r": "10" }, "child": [] }, { "tag": "polyline", "attr": { "points": "12 6 12 12 16 14" }, "child": [] }] })(props);
}
function FiHeart(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }, "child": [] }] })(props);
}
function FiLink2(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" }, "child": [] }, { "tag": "line", "attr": { "x1": "8", "y1": "12", "x2": "16", "y2": "12" }, "child": [] }] })(props);
}
function FiLoader(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "12", "y1": "2", "x2": "12", "y2": "6" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "18", "x2": "12", "y2": "22" }, "child": [] }, { "tag": "line", "attr": { "x1": "4.93", "y1": "4.93", "x2": "7.76", "y2": "7.76" }, "child": [] }, { "tag": "line", "attr": { "x1": "16.24", "y1": "16.24", "x2": "19.07", "y2": "19.07" }, "child": [] }, { "tag": "line", "attr": { "x1": "2", "y1": "12", "x2": "6", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "18", "y1": "12", "x2": "22", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "4.93", "y1": "19.07", "x2": "7.76", "y2": "16.24" }, "child": [] }, { "tag": "line", "attr": { "x1": "16.24", "y1": "7.76", "x2": "19.07", "y2": "4.93" }, "child": [] }] })(props);
}
function FiMaximize(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" }, "child": [] }] })(props);
}
function FiMinimize(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" }, "child": [] }] })(props);
}
function FiMusic(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M9 18V5l12-2v13" }, "child": [] }, { "tag": "circle", "attr": { "cx": "6", "cy": "18", "r": "3" }, "child": [] }, { "tag": "circle", "attr": { "cx": "18", "cy": "16", "r": "3" }, "child": [] }] })(props);
}
function FiPlus(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "12", "y1": "5", "x2": "12", "y2": "19" }, "child": [] }, { "tag": "line", "attr": { "x1": "5", "y1": "12", "x2": "19", "y2": "12" }, "child": [] }] })(props);
}
function FiShare2(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "circle", "attr": { "cx": "18", "cy": "5", "r": "3" }, "child": [] }, { "tag": "circle", "attr": { "cx": "6", "cy": "12", "r": "3" }, "child": [] }, { "tag": "circle", "attr": { "cx": "18", "cy": "19", "r": "3" }, "child": [] }, { "tag": "line", "attr": { "x1": "8.59", "y1": "13.51", "x2": "15.42", "y2": "17.49" }, "child": [] }, { "tag": "line", "attr": { "x1": "15.41", "y1": "6.51", "x2": "8.59", "y2": "10.49" }, "child": [] }] })(props);
}
function FiSliders(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "4", "y1": "21", "x2": "4", "y2": "14" }, "child": [] }, { "tag": "line", "attr": { "x1": "4", "y1": "10", "x2": "4", "y2": "3" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "21", "x2": "12", "y2": "12" }, "child": [] }, { "tag": "line", "attr": { "x1": "12", "y1": "8", "x2": "12", "y2": "3" }, "child": [] }, { "tag": "line", "attr": { "x1": "20", "y1": "21", "x2": "20", "y2": "16" }, "child": [] }, { "tag": "line", "attr": { "x1": "20", "y1": "12", "x2": "20", "y2": "3" }, "child": [] }, { "tag": "line", "attr": { "x1": "1", "y1": "14", "x2": "7", "y2": "14" }, "child": [] }, { "tag": "line", "attr": { "x1": "9", "y1": "8", "x2": "15", "y2": "8" }, "child": [] }, { "tag": "line", "attr": { "x1": "17", "y1": "16", "x2": "23", "y2": "16" }, "child": [] }] })(props);
}
function FiTrash2(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "polyline", "attr": { "points": "3 6 5 6 21 6" }, "child": [] }, { "tag": "path", "attr": { "d": "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }, "child": [] }, { "tag": "line", "attr": { "x1": "10", "y1": "11", "x2": "10", "y2": "17" }, "child": [] }, { "tag": "line", "attr": { "x1": "14", "y1": "11", "x2": "14", "y2": "17" }, "child": [] }] })(props);
}
function FiX(props) {
  return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "line", "attr": { "x1": "18", "y1": "6", "x2": "6", "y2": "18" }, "child": [] }, { "tag": "line", "attr": { "x1": "6", "y1": "6", "x2": "18", "y2": "18" }, "child": [] }] })(props);
}

// src/components/player/PlayerDetail.jsx
init_player_store();
init_asset();

// src/components/player/PlayerDetailLyrics.jsx
var import_react5 = __toESM(require_react(), 1);
init_player_store();
var EMPTY_LYRICS = [];
var resolveLyricIndex = (lyricItems, displayedTimeMs) => {
  if (!lyricItems.length) return -1;
  let active = -1;
  for (let index = 0; index < lyricItems.length; index += 1) {
    const item = lyricItems[index];
    const start = Number(item?.start_time ?? item?.startTime ?? 0);
    if (displayedTimeMs >= start) active = index;
    else break;
  }
  return active;
};
function PlayerDetailLyrics({
  currentSong,
  isActive,
  onSeek,
  allowManualScroll = true,
  lockHorizontalSwipe = false,
  onTouchLockStart,
  onTouchLockEnd
}) {
  const lyricsContainerRef = (0, import_react5.useRef)(null);
  const lastLyricIndexRef = (0, import_react5.useRef)(-1);
  const gestureRef = (0, import_react5.useRef)({
    startX: 0,
    startY: 0,
    direction: null,
    verticalLockActive: false
  });
  const [lyricIndex, setLyricIndex] = (0, import_react5.useState)(-1);
  const songId = normalizeSongId2(currentSong);
  const ensureLyricsLoaded = player_store_default((state) => state.ensureLyricsLoaded);
  const lyricItems = player_store_default(
    (state) => songId ? state.lyricsBySongId[songId] ?? EMPTY_LYRICS : EMPTY_LYRICS
  );
  const lyricsLoading = player_store_default(
    (state) => songId ? Boolean(state.lyricsLoadingBySongId[songId]) : false
  );
  const lyricsError = player_store_default(
    (state) => songId ? state.lyricsErrorBySongId[songId] ?? null : null
  );
  (0, import_react5.useEffect)(() => {
    lastLyricIndexRef.current = -1;
    setLyricIndex(-1);
  }, [songId]);
  (0, import_react5.useEffect)(() => {
    if (!songId) return;
    ensureLyricsLoaded(songId);
  }, [ensureLyricsLoaded, songId]);
  (0, import_react5.useEffect)(() => {
    const audio2 = player_store_default.getState().audio;
    if (!audio2) return void 0;
    const syncLyricIndex = () => {
      const nextIndex = resolveLyricIndex(
        lyricItems,
        Math.floor((audio2.currentTime || 0) * 1e3)
      );
      setLyricIndex((previous) => previous === nextIndex ? previous : nextIndex);
    };
    syncLyricIndex();
    audio2.addEventListener("timeupdate", syncLyricIndex);
    audio2.addEventListener("seeked", syncLyricIndex);
    audio2.addEventListener("loadedmetadata", syncLyricIndex);
    return () => {
      audio2.removeEventListener("timeupdate", syncLyricIndex);
      audio2.removeEventListener("seeked", syncLyricIndex);
      audio2.removeEventListener("loadedmetadata", syncLyricIndex);
    };
  }, [lyricItems, songId]);
  (0, import_react5.useEffect)(() => {
    if (!isActive) return;
    if (lyricIndex < 0 || lastLyricIndexRef.current === lyricIndex) return;
    const container = lyricsContainerRef.current;
    const line = container?.querySelector(`[data-lyric-index="${lyricIndex}"]`);
    if (!line) return;
    line.scrollIntoView({
      behavior: lastLyricIndexRef.current < 0 ? "auto" : "smooth",
      block: "center",
      inline: "nearest"
    });
    lastLyricIndexRef.current = lyricIndex;
  }, [isActive, lyricIndex]);
  const handleLyricClick = (item) => {
    const startMs = Number(item?.start_time ?? item?.startTime ?? 0);
    if (!Number.isFinite(startMs)) return;
    onSeek?.(Math.max(0, startMs / 1e3));
  };
  const resetGesture = () => {
    gestureRef.current = {
      startX: 0,
      startY: 0,
      direction: null,
      verticalLockActive: false
    };
  };
  const handleGestureStart = (event) => {
    if (!lockHorizontalSwipe) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    gestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      direction: null,
      verticalLockActive: false
    };
  };
  const handleGestureMove = (event) => {
    if (!lockHorizontalSwipe) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    const gesture = gestureRef.current;
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    if (!gesture.direction) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      gesture.direction = Math.abs(deltaX) > Math.abs(deltaY) * 1.12 ? "x" : "y";
    }
    if (gesture.direction === "y" && !gesture.verticalLockActive) {
      gesture.verticalLockActive = true;
      onTouchLockStart?.(event);
    }
  };
  const handleGestureEnd = (event) => {
    const gesture = gestureRef.current;
    if (gesture.verticalLockActive) {
      onTouchLockEnd?.(event);
    }
    resetGesture();
  };
  (0, import_react5.useEffect)(
    () => () => {
      if (gestureRef.current.verticalLockActive) {
        onTouchLockEnd?.();
      }
    },
    [onTouchLockEnd]
  );
  return /* @__PURE__ */ React.createElement("div", { className: "flex min-h-0 flex-1 flex-col overflow-hidden" }, lyricsLoading ? /* @__PURE__ */ React.createElement("div", { className: "text-sm text-white/56" }, "\u0110ang t\u1EA3i l\u1EDDi b\xE0i h\xE1t...") : null, lyricsError ? /* @__PURE__ */ React.createElement("div", { className: "text-sm text-red-100/90" }, lyricsError) : null, !lyricsLoading && !lyricsError && lyricItems.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-sm text-white/48" }, "B\xE0i h\xE1t ch\u01B0a c\xF3 l\u1EDDi.") : null, !lyricsLoading && !lyricsError && lyricItems.length > 0 ? /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: lyricsContainerRef,
      "data-mobile-sheet-scroll": allowManualScroll ? "true" : void 0,
      onTouchStartCapture: lockHorizontalSwipe ? handleGestureStart : void 0,
      onTouchMoveCapture: lockHorizontalSwipe ? handleGestureMove : void 0,
      onTouchEndCapture: lockHorizontalSwipe ? handleGestureEnd : void 0,
      onTouchCancelCapture: lockHorizontalSwipe ? handleGestureEnd : void 0,
      className: `mt-1 flex-1 space-y-2 overflow-x-hidden scrollbar-hidden ${allowManualScroll ? `overflow-y-auto pr-1 ${lockHorizontalSwipe ? "overscroll-y-contain" : ""}` : "overflow-y-hidden pr-0 overscroll-y-none [touch-action:none]"}`
    },
    lyricItems.map((item, index) => {
      const isLineActive = index === lyricIndex;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: item.id || `${index}-${item.text}`,
          type: "button",
          "data-lyric-index": index,
          onClick: () => handleLyricClick(item),
          className: `relative block w-full max-w-full overflow-hidden px-1 py-1.5 text-left transition ${isLineActive ? "translate-x-2 text-white" : "text-white/40 md:hover:text-white/60"}`
        },
        isLineActive ? /* @__PURE__ */ React.createElement("span", { className: "absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-white/85" }) : null,
        /* @__PURE__ */ React.createElement(
          "span",
          {
            className: `block break-words leading-[1.75] transition ${isLineActive ? "text-[1.04rem] font-semibold sm:text-[1.1rem]" : "text-[0.95rem] sm:text-[1rem]"}`,
            style: isLineActive ? {
              color: "rgba(255,255,255,0.98)",
              textShadow: "0 0 28px rgba(255,255,255,0.14)"
            } : void 0
          },
          item.text
        )
      );
    })
  ) : null);
}
var PlayerDetailLyrics_default = (0, import_react5.memo)(PlayerDetailLyrics);

// src/components/player/PlayerDetailQueue.jsx
var import_react7 = __toESM(require_react(), 1);
init_asset();
init_player_store();

// src/components/common/OptimizedImage.jsx
var DEFAULT_LOADING = "lazy";
var DEFAULT_DECODING = "async";
function OptimizedImage({
  loading = DEFAULT_LOADING,
  decoding = DEFAULT_DECODING,
  fetchPriority,
  ...props
}) {
  return /* @__PURE__ */ React.createElement(
    "img",
    {
      loading,
      decoding,
      fetchPriority,
      ...props
    }
  );
}

// src/components/artist/ArtistNames.jsx
init_artist();

// src/utils/entityPath.js
init_album_like_store();
init_player_store();
init_artist();
var slugify = (value = "") => {
  const normalized = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "";
};
var normalizeId = (value) => {
  if (value === null || value === void 0 || value === "") return null;
  return String(value);
};
var buildEntityPath = (segment, id, slugSource = "") => {
  const normalizedId = normalizeId(id);
  if (!normalizedId) return null;
  const slug = slugify(slugSource);
  return slug ? `/${segment}/${normalizedId}/${slug}` : `/${segment}/${normalizedId}`;
};
var getSongPath = (song) => buildEntityPath("song", normalizeSongId2(song), song?.title || song?.name || "");
var getAlbumPath = (album) => buildEntityPath(
  "album",
  normalizeAlbumId(album) ?? album?.id ?? album?.album_id ?? album?.albumId,
  album?.title || album?.name || ""
);
var getArtistPath = (artist) => buildEntityPath(
  "artist",
  getPrimaryArtistId(artist) ?? artist?.artist_id ?? artist?.id ?? artist?.artistId,
  getArtistLabel(
    artist,
    artist?.artist_name || artist?.name || artist?.alias || artist?.title || ""
  )
);

// src/utils/linkClass.js
var stripUnderlineClasses = (value = "") => String(value).split(/\s+/).filter(Boolean).filter((token) => token !== "underline" && !token.endsWith(":underline")).join(" ");

// src/components/artist/ArtistNames.jsx
function ArtistNames({
  item,
  artists,
  fallback = "Ngh\u1EC7 s\u0129",
  className = "",
  linkClassName = "",
  stopPropagation = false,
  onNavigate
}) {
  const resolvedArtists = normalizeArtists(artists ?? item);
  const cleanedLinkClassName = stripUnderlineClasses(linkClassName);
  if (!resolvedArtists.length) {
    const label = getArtistLabel(item, fallback);
    return /* @__PURE__ */ React.createElement("span", { className }, label || fallback);
  }
  return /* @__PURE__ */ React.createElement("span", { className }, resolvedArtists.map((artist, index) => {
    const name = artist?.name || fallback;
    const key = artist?.id ? `artist-${artist.id}` : `artist-${index}-${name}`;
    const handleClick = (event) => {
      if (stopPropagation) {
        event.stopPropagation();
      }
      onNavigate?.(event);
    };
    return /* @__PURE__ */ React.createElement("span", { key }, artist?.id ? /* @__PURE__ */ React.createElement(
      Link,
      {
        to: getArtistPath(artist),
        onClick: handleClick,
        className: [
          "no-underline hover:no-underline focus:no-underline",
          cleanedLinkClassName
        ].join(" ")
      },
      name
    ) : /* @__PURE__ */ React.createElement("span", null, name), index < resolvedArtists.length - 1 ? ", " : "");
  }));
}

// src/components/song/SongDetailLink.jsx
function SongDetailLink({
  song,
  className = "",
  children,
  title,
  stopPropagation = true,
  onNavigate
}) {
  const path = getSongPath(song);
  const cleanedClassName = stripUnderlineClasses(className);
  if (!path) {
    return /* @__PURE__ */ React.createElement("span", { className: cleanedClassName }, children);
  }
  return /* @__PURE__ */ React.createElement(
    Link,
    {
      to: path,
      title: title || "Xem th\xF4ng tin b\xE0i h\xE1t",
      onClick: (event) => {
        if (stopPropagation) event.stopPropagation();
        onNavigate?.(event);
      },
      className: [
        "block min-w-0 no-underline hover:no-underline focus:no-underline",
        cleanedClassName
      ].join(" ")
    },
    children
  );
}

// src/hooks/usePointerReorder.js
var import_react6 = __toESM(require_react(), 1);
var RESET_DELAY_MS = 180;
var resolveDropIndex = (fromIndex, hoverIndex, position, length) => {
  if (fromIndex < 0 || hoverIndex < 0 || fromIndex >= length || hoverIndex >= length) {
    return null;
  }
  if (fromIndex === hoverIndex) return fromIndex;
  if (position === "before") {
    return fromIndex < hoverIndex ? hoverIndex - 1 : hoverIndex;
  }
  return fromIndex < hoverIndex ? hoverIndex : Math.min(length - 1, hoverIndex + 1);
};
function usePointerReorder({ itemCount = 0, onReorder }) {
  const [draggingIndex, setDraggingIndex] = (0, import_react6.useState)(null);
  const [dropTarget, setDropTarget] = (0, import_react6.useState)(null);
  const activePointerIdRef = (0, import_react6.useRef)(null);
  const dragSuppressClickRef = (0, import_react6.useRef)(false);
  const dragResetTimerRef = (0, import_react6.useRef)(null);
  const dropTargetRef = (0, import_react6.useRef)(null);
  const reorderHandlerRef = (0, import_react6.useRef)(onReorder);
  const itemCountRef = (0, import_react6.useRef)(itemCount);
  (0, import_react6.useEffect)(() => {
    dropTargetRef.current = dropTarget;
  }, [dropTarget]);
  (0, import_react6.useEffect)(() => {
    reorderHandlerRef.current = onReorder;
  }, [onReorder]);
  (0, import_react6.useEffect)(() => {
    itemCountRef.current = itemCount;
  }, [itemCount]);
  (0, import_react6.useEffect)(() => {
    return () => {
      if (dragResetTimerRef.current) {
        clearTimeout(dragResetTimerRef.current);
      }
    };
  }, []);
  (0, import_react6.useEffect)(() => {
    if (draggingIndex === null || typeof document === "undefined") return void 0;
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [draggingIndex]);
  const markDragComplete = () => {
    dragSuppressClickRef.current = true;
    if (dragResetTimerRef.current) {
      clearTimeout(dragResetTimerRef.current);
    }
    dragResetTimerRef.current = setTimeout(() => {
      dragSuppressClickRef.current = false;
    }, RESET_DELAY_MS);
  };
  const resetDragState = () => {
    activePointerIdRef.current = null;
    dropTargetRef.current = null;
    setDraggingIndex(null);
    setDropTarget(null);
  };
  const commitDrop = () => {
    if (draggingIndex === null || !dropTargetRef.current || typeof reorderHandlerRef.current !== "function") {
      resetDragState();
      return;
    }
    const nextIndex = resolveDropIndex(
      draggingIndex,
      dropTargetRef.current.index,
      dropTargetRef.current.position,
      itemCountRef.current
    );
    if (nextIndex !== null && nextIndex !== draggingIndex) {
      reorderHandlerRef.current(draggingIndex, nextIndex);
      markDragComplete();
    }
    resetDragState();
  };
  (0, import_react6.useEffect)(() => {
    if (draggingIndex === null || typeof window === "undefined") return void 0;
    const handlePointerMove = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      const row = document.elementFromPoint(event.clientX, event.clientY)?.closest?.("[data-reorder-item='true']");
      if (!row) return;
      const hoverIndex = Number(row.getAttribute("data-reorder-index"));
      if (!Number.isFinite(hoverIndex)) return;
      const bounds = row.getBoundingClientRect();
      const position = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
      setDropTarget(
        (prev) => prev?.index === hoverIndex && prev?.position === position ? prev : { index: hoverIndex, position }
      );
    };
    const handlePointerUp = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      commitDrop();
    };
    const handlePointerCancel = (event) => {
      if (activePointerIdRef.current !== event.pointerId) return;
      resetDragState();
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [draggingIndex]);
  const startDrag = (event, index) => {
    if (itemCount < 2) return;
    event.preventDefault();
    event.stopPropagation();
    activePointerIdRef.current = event.pointerId;
    setDraggingIndex(index);
    setDropTarget({ index, position: "after" });
  };
  return {
    draggingIndex,
    dropTarget,
    startDrag,
    shouldSuppressClick: () => dragSuppressClickRef.current || draggingIndex !== null
  };
}

// src/components/player/PlayerDetailQueue.jsx
function GripDots() {
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      "aria-hidden": true,
      className: "grid h-8 w-4 shrink-0 grid-cols-2 gap-1 text-white/22 transition group-hover:text-white/40"
    },
    /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-current" }),
    /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-current" }),
    /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-current" }),
    /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-current" })
  );
}
function PlayerDetailQueue({ queue = [], currentIndex = 0, playAt, onNavigate }) {
  const moveQueueItem = player_store_default((state) => state.moveQueueItem);
  const removeFromQueue = player_store_default((state) => state.removeFromQueue);
  const clearQueue = player_store_default((state) => state.clearQueue);
  const handleReorder = (0, import_react7.useCallback)(
    (fromIndex, toIndex) => moveQueueItem(fromIndex, toIndex),
    [moveQueueItem]
  );
  const { draggingIndex, dropTarget, startDrag, shouldSuppressClick } = usePointerReorder({
    itemCount: queue.length,
    onReorder: handleReorder
  });
  const activeIndex = (0, import_react7.useMemo)(() => {
    if (!Array.isArray(queue) || !queue.length) return 0;
    return Math.min(Math.max(currentIndex, 0), queue.length - 1);
  }, [queue, currentIndex]);
  const currentItem = (0, import_react7.useMemo)(() => {
    if (!Array.isArray(queue) || !queue.length) return null;
    return queue[activeIndex] ?? queue[0] ?? null;
  }, [queue, activeIndex]);
  const played = (0, import_react7.useMemo)(() => {
    if (!Array.isArray(queue) || activeIndex <= 0) return [];
    return queue.slice(Math.max(0, activeIndex - 3), activeIndex).map((song, index) => ({
      song,
      index: Math.max(0, activeIndex - 3) + index
    }));
  }, [queue, activeIndex]);
  const upcoming = (0, import_react7.useMemo)(() => {
    if (!Array.isArray(queue) || !queue.length) return [];
    const next = queue.slice(activeIndex + 1, activeIndex + 10).map((song, index) => ({
      song,
      index: activeIndex + 1 + index
    }));
    if (next.length) return next;
    return queue.map((song, index) => ({ song, index })).filter((item) => item.index !== activeIndex).slice(0, 3);
  }, [queue, activeIndex]);
  const Item = ({ song, index, label, isCurrent = false, isPlayed = false }) => {
    const cover = resolveAssetUrl(song?.cover || song?.cover_url || song?.image);
    const isDragging = draggingIndex === index;
    const dropPosition = dropTarget?.index === index && draggingIndex !== null ? dropTarget.position : null;
    const handleSelect = () => {
      if (shouldSuppressClick()) return;
      playAt?.(index);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "relative" }, dropPosition === "before" ? /* @__PURE__ */ React.createElement("div", { className: "absolute inset-x-4 top-0 z-10 h-[2px] rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.42)]" }) : null, dropPosition === "after" ? /* @__PURE__ */ React.createElement("div", { className: "absolute inset-x-4 bottom-0 z-10 h-[2px] rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.42)]" }) : null, /* @__PURE__ */ React.createElement(
      "div",
      {
        role: "button",
        tabIndex: 0,
        "data-reorder-item": "true",
        "data-reorder-index": index,
        "data-current": isCurrent ? "true" : "false",
        onClick: handleSelect,
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect();
          }
        },
        className: `player-detail-queue-item group flex w-full cursor-grab items-center gap-3 rounded-[18px] px-3 py-3 text-left transition-[background-color,opacity,transform,box-shadow] duration-200 active:cursor-grabbing ${isCurrent ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] text-white" : "bg-white/[0.045] text-white/90 md:hover:bg-white/[0.08]"} ${isPlayed ? "opacity-55" : ""} ${isDragging ? "scale-[0.975] -rotate-[1deg] opacity-65 ring-1 ring-emerald-300/28 shadow-[0_22px_36px_rgba(16,185,129,0.14)]" : ""}`
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onPointerDown: (event) => startDrag(event, index),
          onClick: (event) => event.stopPropagation(),
          className: `flex h-9 w-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-full text-white/40 transition active:cursor-grabbing md:hover:bg-white/[0.05] md:hover:text-white/68 ${isDragging ? "bg-emerald-400/10 text-emerald-100" : ""}`,
          "aria-label": "K\xE9o \u0111\u1EC3 \u0111\u1ED5i v\u1ECB tr\xED ph\xE1t"
        },
        /* @__PURE__ */ React.createElement(GripDots, null)
      ),
      /* @__PURE__ */ React.createElement("div", { className: "h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-black/28 [transform:translateZ(0)] [backface-visibility:hidden]" }, cover ? /* @__PURE__ */ React.createElement(
        OptimizedImage,
        {
          src: cover,
          alt: song?.title,
          loading: "eager",
          decoding: "sync",
          className: "h-full w-full object-cover [transform:translateZ(0)] [backface-visibility:hidden]"
        }
      ) : /* @__PURE__ */ React.createElement("div", { className: "flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2b2b2b,#111)] text-[10px] uppercase tracking-[0.2em] text-white/35" }, "No")),
      /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2" }, /* @__PURE__ */ React.createElement(
        SongDetailLink,
        {
          song,
          className: "min-w-0 flex-1 text-sm font-semibold leading-tight line-clamp-2 transition md:hover:text-emerald-300 md:hover:underline",
          onNavigate
        },
        song?.title
      ), label ? /* @__PURE__ */ React.createElement(
        "span",
        {
          className: `shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isCurrent ? "bg-white/[0.12] text-white" : "bg-white/[0.06] text-white/58"}`
        },
        label
      ) : null), /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-[11px] text-white/56 line-clamp-2 sm:text-xs" }, /* @__PURE__ */ React.createElement(
        ArtistNames,
        {
          item: song,
          stopPropagation: true,
          fallback: "Ngh\u1EC7 s\u0129",
          linkClassName: "inline-block transition md:hover:text-emerald-200",
          onNavigate
        }
      ))),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: (event) => {
            event.stopPropagation();
            removeFromQueue(index);
          },
          className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-white/58 ring-1 ring-inset ring-white/10 transition md:opacity-0 md:group-hover:opacity-100 md:hover:bg-rose-500/10 md:hover:text-rose-200 md:hover:ring-rose-400/30",
          "aria-label": "G\u1EE1 b\xE0i kh\u1ECFi h\xE0ng \u0111\u1EE3i"
        },
        /* @__PURE__ */ React.createElement(FiTrash2, { size: 14 })
      )
    ));
  };
  return /* @__PURE__ */ React.createElement("div", { className: "flex h-full min-h-0 flex-1 flex-col overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-semibold uppercase tracking-[0.32em] text-white/38" }, queue.length ? `${queue.length} b\xE0i trong h\xE0ng \u0111\u1EE3i` : "H\xE0ng \u0111\u1EE3i"), queue.length > 1 ? /* @__PURE__ */ React.createElement("div", { className: "mt-1 text-[11px] text-white/42" }, "K\xE9o th\u1EA3 \u0111\u1EC3 \u0111\u1ED5i th\u1EE9 t\u1EF1 ph\xE1t ti\u1EBFp theo.") : null), queue.length ? /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: clearQueue,
      className: "rounded-full bg-[#111314] px-3 py-1.5 text-[11px] font-semibold text-white/72 ring-1 ring-inset ring-[#242829] transition md:hover:bg-[#171a1c] md:hover:text-white md:hover:ring-[#2d3233]"
    },
    "X\xF3a h\xE0ng \u0111\u1EE3i"
  ) : null), currentItem ? /* @__PURE__ */ React.createElement("div", { className: "shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/38" }, "\u0110ang ph\xE1t"), /* @__PURE__ */ React.createElement(Item, { song: currentItem, index: activeIndex, label: "Now", isCurrent: true })) : null, /* @__PURE__ */ React.createElement(
    "div",
    {
      "data-mobile-sheet-scroll": "true",
      className: "player-detail-queue-scroll mt-5 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1 scrollbar-hidden"
    },
    played.length ? /* @__PURE__ */ React.createElement("div", { className: "space-y-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-semibold uppercase tracking-[0.32em] text-white/34" }, "V\u1EEBa ph\xE1t"), played.map((item) => /* @__PURE__ */ React.createElement(
      Item,
      {
        key: `${item.index}-${item.song?.id || item.song?.title || "played"}`,
        song: item.song,
        index: item.index,
        isPlayed: true
      }
    ))) : null,
    /* @__PURE__ */ React.createElement("div", { className: "space-y-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-semibold uppercase tracking-[0.32em] text-white/38" }, "Ti\u1EBFp theo"), upcoming.length ? upcoming.map((item) => /* @__PURE__ */ React.createElement(
      Item,
      {
        key: `${item.index}-${item.song?.id || item.song?.title || "next"}`,
        song: item.song,
        index: item.index
      }
    )) : /* @__PURE__ */ React.createElement("div", { className: "px-1 text-sm text-white/48" }, "Ch\u01B0a c\xF3 b\xE0i ti\u1EBFp theo."))
  ));
}
var PlayerDetailQueue_default = (0, import_react7.memo)(PlayerDetailQueue);

// src/components/common/ShareLinkButton.jsx
var import_react8 = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);

// src/utils/appToast.js
var APP_TOAST_EVENT = "app:toast";
var emitAppToast = ({
  title = "Th\xF4ng b\xE1o",
  message = "",
  duration = 2600
} = {}) => {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(
    new CustomEvent(APP_TOAST_EVENT, {
      detail: {
        title,
        message,
        duration
      }
    })
  );
};

// src/components/common/ShareLinkButton.jsx
var PREVIEW_MAX_WIDTH = 320;
var PREVIEW_VIEWPORT_PADDING = 16;
var PREVIEW_GAP = 14;
var PREVIEW_MIN_DESKTOP_WIDTH = 768;
var buildAbsoluteUrl = (path = "") => {
  if (typeof window === "undefined") return path || "";
  if (!path) return window.location.href;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, window.location.origin).toString();
};
var copyText = async (value) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
};
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
function ShareLinkButton({
  path = "",
  title = "Chia s\u1EBB",
  shareTitle,
  shareText,
  className = "",
  compact = false,
  variant = "default",
  preview = null,
  previewPlacement = "top"
}) {
  const [status, setStatus] = (0, import_react8.useState)("idle");
  const [previewVisible, setPreviewVisible] = (0, import_react8.useState)(false);
  const [previewLayout, setPreviewLayout] = (0, import_react8.useState)(null);
  const wrapperRef = (0, import_react8.useRef)(null);
  const previewRef = (0, import_react8.useRef)(null);
  const resolvedUrl = (0, import_react8.useMemo)(() => buildAbsoluteUrl(path), [path]);
  const previewDomain = (0, import_react8.useMemo)(
    () => resolvedUrl.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
    [resolvedUrl]
  );
  (0, import_react8.useEffect)(() => {
    if (status !== "success") return void 0;
    const timer = setTimeout(() => setStatus("idle"), 1800);
    return () => clearTimeout(timer);
  }, [status]);
  const updatePreviewLayout = () => {
    if (typeof window === "undefined" || !wrapperRef.current || window.innerWidth < PREVIEW_MIN_DESKTOP_WIDTH) {
      setPreviewLayout(null);
      return;
    }
    const triggerRect = wrapperRef.current.getBoundingClientRect();
    const width = Math.min(
      PREVIEW_MAX_WIDTH,
      Math.max(220, window.innerWidth - PREVIEW_VIEWPORT_PADDING * 2)
    );
    const measuredHeight = previewRef.current?.offsetHeight || 288;
    const preferredPlacement = previewPlacement === "bottom" ? "bottom" : "top";
    const spaceAbove = triggerRect.top - PREVIEW_VIEWPORT_PADDING;
    const spaceBelow = window.innerHeight - triggerRect.bottom - PREVIEW_VIEWPORT_PADDING;
    let placement = preferredPlacement;
    if (preferredPlacement === "top" && spaceAbove < measuredHeight && spaceBelow > spaceAbove) {
      placement = "bottom";
    } else if (preferredPlacement === "bottom" && spaceBelow < measuredHeight && spaceAbove > spaceBelow) {
      placement = "top";
    }
    const left = clamp(
      triggerRect.right - width,
      PREVIEW_VIEWPORT_PADDING,
      window.innerWidth - width - PREVIEW_VIEWPORT_PADDING
    );
    const top = placement === "bottom" ? clamp(
      triggerRect.bottom + PREVIEW_GAP,
      PREVIEW_VIEWPORT_PADDING,
      window.innerHeight - measuredHeight - PREVIEW_VIEWPORT_PADDING
    ) : clamp(
      triggerRect.top - measuredHeight - PREVIEW_GAP,
      PREVIEW_VIEWPORT_PADDING,
      window.innerHeight - measuredHeight - PREVIEW_VIEWPORT_PADDING
    );
    setPreviewLayout({ left, top, width, placement });
  };
  (0, import_react8.useEffect)(() => {
    if (!previewVisible) return void 0;
    updatePreviewLayout();
    const handleViewportChange = () => {
      if (window.innerWidth < PREVIEW_MIN_DESKTOP_WIDTH) {
        setPreviewVisible(false);
        setPreviewLayout(null);
        return;
      }
      updatePreviewLayout();
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [previewPlacement, previewVisible]);
  (0, import_react8.useEffect)(() => {
    if (!previewVisible) return void 0;
    const raf = window.requestAnimationFrame(() => {
      updatePreviewLayout();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [preview, previewVisible]);
  const openPreview = () => {
    if (!preview || compact || typeof window === "undefined") return;
    if (window.innerWidth < PREVIEW_MIN_DESKTOP_WIDTH) return;
    setPreviewVisible(true);
  };
  const closePreview = () => {
    setPreviewVisible(false);
  };
  const handleShare = async () => {
    const payload = {
      title: shareTitle || title,
      text: shareText || preview?.description || (shareTitle ? `${shareTitle} tr\xEAn Khoaluan Music` : title),
      url: resolvedUrl
    };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(payload);
        setStatus("success");
        emitAppToast({
          title: "Chia s\u1EBB",
          message: "\u0110\xE3 m\u1EDF b\u1EA3ng chia s\u1EBB c\u1EE7a thi\u1EBFt b\u1ECB."
        });
        return;
      }
      if (await copyText(resolvedUrl)) {
        setStatus("success");
        emitAppToast({
          title: "\u0110\xE3 sao ch\xE9p",
          message: "Li\xEAn k\u1EBFt \u0111\xE3 \u0111\u01B0\u1EE3c sao ch\xE9p v\xE0o b\u1ED9 nh\u1EDB t\u1EA1m."
        });
        return;
      }
      setStatus("idle");
      emitAppToast({
        title: "Kh\xF4ng th\u1EC3 chia s\u1EBB",
        message: "Li\xEAn k\u1EBFt ch\u01B0a th\u1EC3 \u0111\u01B0\u1EE3c sao ch\xE9p l\xFAc n\xE0y."
      });
    } catch (error) {
      if (error?.name === "AbortError") return;
      setStatus("idle");
      emitAppToast({
        title: "Kh\xF4ng th\u1EC3 chia s\u1EBB",
        message: "Li\xEAn k\u1EBFt ch\u01B0a th\u1EC3 \u0111\u01B0\u1EE3c chia s\u1EBB l\xFAc n\xE0y. H\xE3y th\u1EED l\u1EA1i sau."
      });
    }
  };
  const isSuccess = status === "success";
  const Icon = isSuccess ? FiCheck : compact ? FiLink2 : FiShare2;
  const isToolbarVariant = variant === "toolbar";
  const showPreview = Boolean(preview && !compact && previewVisible && previewLayout);
  const baseClass = compact ? isToolbarVariant ? "ui-pressable inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#111314] text-white/78 ring-1 ring-inset ring-[#202425] shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition md:hover:bg-[#171a1c] md:hover:text-white md:hover:ring-[#2a2f30]" : "ui-pressable inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/80 transition md:hover:border-white/30 md:hover:bg-white/[0.1] md:hover:text-white" : isToolbarVariant ? "ui-pressable inline-flex items-center gap-2 rounded-full bg-[#111314] px-4 py-2.5 text-sm font-semibold text-white/82 ring-1 ring-inset ring-[#202425] shadow-[0_12px_28px_rgba(0,0,0,0.24)] transition md:hover:bg-[#171a1c] md:hover:text-white md:hover:ring-[#2a2f30]" : "ui-pressable inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/85 transition md:hover:border-white/30 md:hover:bg-white/[0.1] md:hover:text-white";
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: wrapperRef,
      className: "relative inline-flex max-w-full",
      onMouseEnter: openPreview,
      onMouseLeave: closePreview,
      onFocusCapture: openPreview,
      onBlurCapture: (event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget)) {
          closePreview();
        }
      }
    },
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: handleShare,
        className: [
          baseClass,
          isSuccess ? "border-emerald-400/40 bg-emerald-400/12 text-emerald-100" : "",
          className
        ].join(" "),
        "aria-label": isSuccess ? "\u0110\xE3 sao ch\xE9p li\xEAn k\u1EBFt" : title,
        title: isSuccess ? "\u0110\xE3 sao ch\xE9p li\xEAn k\u1EBFt" : title
      },
      /* @__PURE__ */ React.createElement(Icon, { className: compact ? "text-base" : "text-[15px]" }),
      !compact ? /* @__PURE__ */ React.createElement("span", null, isSuccess ? "\u0110\xE3 ch\xE9p link" : title) : null
    )
  ), showPreview && typeof document !== "undefined" ? (0, import_react_dom.createPortal)(
    /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: previewRef,
        className: "pointer-events-none fixed z-[120] ui-pop-in",
        style: {
          left: previewLayout.left,
          top: previewLayout.top,
          width: previewLayout.width
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0f10]/96 shadow-[0_30px_80px_rgba(0,0,0,0.58)] ring-1 ring-inset ring-[#233144] backdrop-blur-2xl" }, /* @__PURE__ */ React.createElement("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(29,185,84,0.18),_transparent_72%)]" }), /* @__PURE__ */ React.createElement("div", { className: "relative p-3" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-hidden rounded-[22px] border border-white/10 bg-[#151718]" }, preview?.image ? /* @__PURE__ */ React.createElement(
        "img",
        {
          src: preview.image,
          alt: preview.title || title,
          className: "aspect-[16/9] w-full object-cover"
        }
      ) : /* @__PURE__ */ React.createElement("div", { className: "flex aspect-[16/9] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(29,185,84,0.16),rgba(255,255,255,0.06))] text-white/55" }, /* @__PURE__ */ React.createElement(FiShare2, { className: "text-2xl" }))), /* @__PURE__ */ React.createElement("div", { className: "mt-3 space-y-2 px-1" }, preview?.eyebrow ? /* @__PURE__ */ React.createElement("p", { className: "text-[11px] uppercase tracking-[0.24em] text-white/42" }, preview.eyebrow) : null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "line-clamp-2 text-base font-bold text-white" }, preview?.title || shareTitle || title), preview?.subtitle ? /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-emerald-200/82" }, preview.subtitle) : null), preview?.description ? /* @__PURE__ */ React.createElement("p", { className: "line-clamp-3 text-sm leading-relaxed text-white/62" }, preview.description) : null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] text-white/46" }, /* @__PURE__ */ React.createElement("span", { className: "truncate" }, previewDomain), /* @__PURE__ */ React.createElement("span", { className: "shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/55" }, "Chia s\u1EBB")))))
    ),
    document.body
  ) : null);
}

// src/components/playlists/AddToPlaylistButton.jsx
var import_react_dom3 = __toESM(require_react_dom(), 1);
var import_react10 = __toESM(require_react(), 1);

// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
var clsx_default = clsx;

// src/components/common/Toast.jsx
var import_react9 = __toESM(require_react(), 1);
var import_react_dom2 = __toESM(require_react_dom(), 1);
function Toast({
  title = "Th\xF4ng b\xE1o",
  message,
  onClose,
  duration = 3500
}) {
  (0, import_react9.useEffect)(() => {
    if (!message) return void 0;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);
  if (!message) return null;
  return (0, import_react_dom2.createPortal)(
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "\n        fixed left-1/2 top-6 z-[70] max-w-sm -translate-x-1/2\n        rounded-xl border border-white/10\n        bg-[#1a1a1a] px-4 py-3 text-sm text-white\n        shadow-2xl shadow-emerald-500/20\n        animate-[toast-in_0.35s_cubic-bezier(0.22,1,0.36,1)]\n      ",
        onClick: (event) => {
          event.stopPropagation();
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs uppercase tracking-[0.2em] text-emerald-300/80" }, title), /* @__PURE__ */ React.createElement("p", { className: "font-semibold leading-relaxed" }, message)), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (event) => {
            event.stopPropagation();
            event.preventDefault();
            onClose();
          },
          className: "mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition md:hover:bg-white/20",
          "aria-label": "\u0110\xF3ng th\xF4ng b\xE1o"
        },
        /* @__PURE__ */ React.createElement(FiX, null)
      )),
      /* @__PURE__ */ React.createElement("style", null, `
          @keyframes toast-in {
            from {
              opacity: 0;
              transform: translate(-50%, -14px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `)
    ),
    document.body
  );
}

// src/api/playlist.api.js
init_axios3();
var getPlaylists = (params = {}) => axios_default2.get("/playlists", { params });
var getPlaylistById = (id) => axios_default2.get(`/playlists/${id}`);
var createPlaylist = (payload) => axios_default2.post("/playlists", payload);
var addSongToPlaylist = (id, payload) => axios_default2.post(`/playlists/${id}/songs`, payload);

// src/components/playlists/AddToPlaylistButton.jsx
init_player_store();
init_auth_store();
init_authPrompt();
var extractData = (payload) => payload?.data?.data ?? payload?.data ?? payload;
function AddToPlaylistButton({
  song,
  triggerClassName = "",
  triggerLabel,
  variant = "icon",
  disabled = false
}) {
  const [open, setOpen] = (0, import_react10.useState)(false);
  const [playlists, setPlaylists] = (0, import_react10.useState)([]);
  const [loading, setLoading] = (0, import_react10.useState)(false);
  const [saving, setSaving] = (0, import_react10.useState)(false);
  const [toastMessage, setToastMessage] = (0, import_react10.useState)("");
  const [toastTitle, setToastTitle] = (0, import_react10.useState)("");
  const [newPlaylistName, setNewPlaylistName] = (0, import_react10.useState)("");
  const isAuthenticated = auth_store_default((state) => state.isAuthenticated);
  const songId = (0, import_react10.useMemo)(() => normalizeSongId2(song) || song?.id, [song]);
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await getPlaylists({ limit: 100 });
      setPlaylists(extractData(res) || []);
    } catch (err) {
      console.error("Load playlists failed", err);
    } finally {
      setLoading(false);
    }
  };
  const hasSongInPlaylist = (songs = []) => songs.some((item) => String(item?.id) === String(songId));
  const showDuplicateToast = (playlist) => {
    setOpen(false);
    setToastTitle("Th\xF4ng b\xE1o");
    setToastMessage(
      `B\xE0i h\xE1t "${song?.title || "B\xE0i h\xE1t"}" \u0111\xE3 c\xF3 trong playlist "${playlist?.name || playlist?.title || "Playlist"}"`
    );
  };
  (0, import_react10.useEffect)(() => {
    if (open) {
      fetchPlaylists();
    }
  }, [open]);
  const handleAdd = async (playlist) => {
    if (!playlist?.id || !songId) return;
    const playlistSongs = Array.isArray(playlist?.songs) ? playlist.songs : null;
    try {
      if (!playlistSongs) {
        const detailRes = await getPlaylistById(playlist.id);
        const detail = extractData(detailRes);
        const detailSongs = Array.isArray(detail?.songs) ? detail.songs : [];
        if (hasSongInPlaylist(detailSongs)) {
          showDuplicateToast(playlist);
          return;
        }
      } else if (hasSongInPlaylist(playlistSongs)) {
        showDuplicateToast(playlist);
        return;
      }
      setSaving(true);
      await addSongToPlaylist(playlist.id, { songId });
      setOpen(false);
      setToastTitle("Th\xE0nh c\xF4ng");
      setToastMessage(
        `\u0110\xE3 th\xEAm b\xE0i h\xE1t "${song?.title || "B\xE0i h\xE1t"}" v\xE0o playlist "${playlist?.name || playlist?.title || "Playlist"}"`
      );
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || "";
      if (status === 409 || message.toLowerCase().includes("exist")) {
        showDuplicateToast(playlist);
        return;
      }
      console.error("Add to playlist failed", err);
    } finally {
      setSaving(false);
    }
  };
  const handleCreatePlaylist = async () => {
    const trimmedName = newPlaylistName.trim();
    if (!trimmedName) return;
    const normalizedName = trimmedName.toLowerCase();
    const duplicate = playlists.some(
      (playlist) => (playlist?.name || playlist?.title || "").trim().toLowerCase() === normalizedName
    );
    if (duplicate) {
      setToastTitle("Th\xF4ng b\xE1o");
      setToastMessage(`Playlist "${trimmedName}" \u0111\xE3 t\u1ED3n t\u1EA1i.`);
      return;
    }
    try {
      setSaving(true);
      const res = await createPlaylist({ name: trimmedName });
      const created = extractData(res);
      if (created) {
        setPlaylists((prev) => [created, ...prev]);
        setNewPlaylistName("");
        setToastTitle("Th\xE0nh c\xF4ng");
        setToastMessage(
          `\u0110\xE3 t\u1EA1o playlist "${created?.name || created?.title || trimmedName}"`
        );
      }
    } catch (err) {
      console.error("Create playlist failed", err);
    } finally {
      setSaving(false);
    }
  };
  const closeToast = () => {
    setToastMessage("");
    setToastTitle("");
  };
  const renderTriggerContent = () => {
    if (variant === "text") {
      return /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2 font-semibold" }, /* @__PURE__ */ React.createElement(FiPlus, null), /* @__PURE__ */ React.createElement("span", null, "Th\xEAm v\xE0o playlist"));
    }
    return /* @__PURE__ */ React.createElement(FiPlus, null);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: (e) => {
        e.stopPropagation();
        if (disabled) return;
        if (!isAuthenticated) {
          emitAuthRequired();
          return;
        }
        setOpen(true);
      },
      disabled,
      className: clsx_default(
        "flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition md:hover:border-white/30 md:hover:bg-white/15",
        variant === "icon" ? "h-9 w-9 p-0" : "gap-2 px-3 py-2 text-xs",
        disabled && "cursor-not-allowed opacity-60 md:hover:border-white/15 md:hover:bg-white/5",
        triggerClassName
      ),
      title: disabled ? "Ngh\u1EC7 s\u0129 ch\u1EC9 c\xF3 th\u1EC3 xem t\u1EA1i trang n\xE0y" : "Th\xEAm v\xE0o playlist"
    },
    triggerLabel || renderTriggerContent()
  ), open && (0, import_react_dom3.createPortal)(
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 px-4 py-10",
        onClick: () => setOpen(false)
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          className: "w-full max-w-xl rounded-3xl border border-white/10 bg-[#151515] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur sm:max-w-2xl sm:p-8"
        },
        /* @__PURE__ */ React.createElement("div", { className: "mb-5 flex items-start justify-between gap-3 sm:mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("p", { className: "text-[11px] uppercase tracking-[0.25em] text-white/50" }, "Playlist c\u1EE7a b\u1EA1n"), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-white sm:text-2xl" }, "Ch\u1ECDn playlist \u0111\u1EC3 th\xEAm"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-white/60" }, song?.title ? `Th\xEAm "${song.title}"` : "Ch\u1ECDn playlist")), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => setOpen(false),
            className: "flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition md:hover:bg-white/10",
            "aria-label": "\u0110\xF3ng"
          },
          /* @__PURE__ */ React.createElement(FiX, null)
        )),
        /* @__PURE__ */ React.createElement("div", { className: "max-h-[55vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#151515]" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-3 px-4 py-8 text-sm text-white/70" }, /* @__PURE__ */ React.createElement(FiLoader, { className: "animate-spin" }), "\u0110ang t\u1EA3i playlist...") : playlists.length ? playlists.map((pl) => /* @__PURE__ */ React.createElement(
          "button",
          {
            key: pl.id,
            onClick: () => handleAdd(pl),
            disabled: saving,
            className: "flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition md:hover:bg-white/10 disabled:opacity-60"
          },
          /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300" }, /* @__PURE__ */ React.createElement(FiMusic, null)), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "truncate text-sm font-semibold sm:text-base" }, pl.name || pl.title || "Playlist"), /* @__PURE__ */ React.createElement("p", { className: "truncate text-xs text-white/50" }, pl.songs?.length ? `${pl.songs.length} b\xE0i h\xE1t` : "Playlist c\xE1 nh\xE2n"))),
          /* @__PURE__ */ React.createElement(FiChevronRight, { className: "text-white/50" })
        )) : /* @__PURE__ */ React.createElement("div", { className: "px-5 py-8 text-sm text-white/60" }, "B\u1EA1n ch\u01B0a c\xF3 playlist n\xE0o. H\xE3y t\u1EA1o m\u1EDBi \u0111\u1EC3 l\u01B0u b\xE0i h\xE1t y\xEAu th\xEDch.")),
        /* @__PURE__ */ React.createElement("div", { className: "mt-5 flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-[#151515] p-5 sm:mt-6 sm:flex-row sm:items-center sm:justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-semibold text-white" }, "Playlist m\u1EDBi"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-white/60" }, "Th\xEAm nhanh t\xEAn playlist r\u1ED3i b\u1EA5m t\u1EA1o")), /* @__PURE__ */ React.createElement("div", { className: "flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center" }, /* @__PURE__ */ React.createElement(
          "input",
          {
            value: newPlaylistName,
            onChange: (e) => setNewPlaylistName(e.target.value),
            placeholder: "T\xEAn playlist",
            className: "w-full min-w-[220px] rounded-lg border border-white/10 bg-[#1c1c1c] px-3 py-2 text-sm text-white outline-none ring-0 focus:border-emerald-400/60 focus:bg-[#202020]"
          }
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: handleCreatePlaylist,
            disabled: !newPlaylistName.trim() || saving,
            className: "rounded-lg border border-emerald-300/50 bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition md:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          },
          "T\u1EA1o playlist"
        )))
      )
    ),
    document.body
  ), /* @__PURE__ */ React.createElement(Toast, { title: toastTitle, message: toastMessage, onClose: closeToast }));
}

// src/components/player/PlayerEnhancementToolbar.jsx
var import_react11 = __toESM(require_react(), 1);
var import_react_dom4 = __toESM(require_react_dom(), 1);
init_player_store();
var TIMER_OPTIONS = [
  { value: 0, label: "T\u1EAFt h\u1EB9n gi\u1EDD" },
  { value: 15, label: "15 ph\xFAt" },
  { value: 30, label: "30 ph\xFAt" },
  { value: 60, label: "60 ph\xFAt" }
];
var SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];
var formatRemaining = (endsAt) => {
  if (!endsAt) return "H\u1EB9n gi\u1EDD";
  const diffMs = endsAt - Date.now();
  if (diffMs <= 0) return "H\u1EB9n gi\u1EDD";
  const totalMinutes = Math.max(1, Math.ceil(diffMs / 6e4));
  if (totalMinutes < 60) return `${totalMinutes}p`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}g ${minutes}p` : `${hours}g`;
};
function ToolbarMenu({
  open,
  children,
  align = "right",
  placement = "bottom",
  floating = false,
  anchorRef,
  menuRef
}) {
  const [floatingStyle, setFloatingStyle] = (0, import_react11.useState)(null);
  (0, import_react11.useLayoutEffect)(() => {
    if (!open || !floating || typeof window === "undefined") {
      setFloatingStyle(null);
      return void 0;
    }
    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportPadding = 16;
      const gap = 12;
      const estimatedHeight = 232;
      const menuWidth = Math.min(
        220,
        Math.max(190, window.innerWidth - viewportPadding * 2)
      );
      let left = rect.right - menuWidth;
      if (align === "left") left = rect.left;
      if (align === "center") {
        left = rect.left + rect.width / 2 - menuWidth / 2;
      }
      left = Math.min(
        window.innerWidth - viewportPadding - menuWidth,
        Math.max(viewportPadding, left)
      );
      const canPlaceAbove = rect.top >= estimatedHeight + gap + viewportPadding;
      const canPlaceBelow = window.innerHeight - rect.bottom >= estimatedHeight + gap + viewportPadding;
      let useTopPlacement = placement === "top";
      if (useTopPlacement && !canPlaceAbove && canPlaceBelow) {
        useTopPlacement = false;
      } else if (!useTopPlacement && !canPlaceBelow && canPlaceAbove) {
        useTopPlacement = true;
      }
      setFloatingStyle({
        left: `${left}px`,
        top: useTopPlacement ? `${rect.top - gap}px` : `${rect.bottom + gap}px`,
        transform: useTopPlacement ? "translateY(-100%)" : "none",
        width: `${menuWidth}px`
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, anchorRef, floating, open, placement]);
  if (!open) return null;
  const placementClass = placement === "top" ? "bottom-[calc(100%+0.75rem)] origin-bottom" : "top-[calc(100%+0.75rem)] origin-top";
  const alignClass = align === "left" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";
  const menu = /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: menuRef,
      className: `${floating ? "fixed z-[1200] max-w-[220px]" : `absolute z-[90] min-w-[190px] ${placementClass} ${alignClass}`} overflow-hidden rounded-[22px] border border-[#25292b] bg-[#111315] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.4)]`,
      style: floating ? floatingStyle || void 0 : void 0
    },
    /* @__PURE__ */ React.createElement("div", { className: "relative" }, children)
  );
  if (floating && typeof document !== "undefined") {
    return (0, import_react_dom4.createPortal)(menu, document.body);
  }
  return menu;
}
function PlayerEnhancementToolbar({
  compact = false,
  className = "",
  align = "right",
  menuPlacement,
  wrap = true,
  compactLabelClass = "",
  showShare = true
}) {
  const currentSong = player_store_default((state) => state.currentSong);
  const playbackRate = player_store_default((state) => state.playbackRate);
  const sleepTimerEndsAt = player_store_default((state) => state.sleepTimerEndsAt);
  const sleepTimerMinutes = player_store_default((state) => state.sleepTimerMinutes);
  const setPlaybackRate = player_store_default((state) => state.setPlaybackRate);
  const setSleepTimer = player_store_default((state) => state.setSleepTimer);
  const [activeMenu, setActiveMenu] = (0, import_react11.useState)(null);
  const [tick, setTick] = (0, import_react11.useState)(Date.now());
  const containerRef = (0, import_react11.useRef)(null);
  const speedAnchorRef = (0, import_react11.useRef)(null);
  const speedMenuRef = (0, import_react11.useRef)(null);
  const timerAnchorRef = (0, import_react11.useRef)(null);
  const timerMenuRef = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!activeMenu) return void 0;
    const handleClickOutside = (event) => {
      const target = event.target;
      if (containerRef.current?.contains(target)) return;
      if (speedMenuRef.current?.contains(target)) return;
      if (timerMenuRef.current?.contains(target)) return;
      setActiveMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [activeMenu]);
  (0, import_react11.useEffect)(() => {
    if (!sleepTimerEndsAt) return void 0;
    const timer = setInterval(() => setTick(Date.now()), 15e3);
    return () => clearInterval(timer);
  }, [sleepTimerEndsAt]);
  const timerLabel = (0, import_react11.useMemo)(
    () => formatRemaining(sleepTimerEndsAt),
    [sleepTimerEndsAt, tick]
  );
  const currentSongId = normalizeSongId2(currentSong);
  const currentSongPath = getSongPath(currentSong);
  const currentArtistLabel = (0, import_react11.useMemo)(() => {
    if (currentSong?.artist_name) return currentSong.artist_name;
    if (Array.isArray(currentSong?.artists) && currentSong.artists.length) {
      return currentSong.artists.map((artist) => artist?.name || artist?.alias || "").filter(Boolean).join(", ");
    }
    return "Ngh\u1EC7 s\u0129";
  }, [currentSong]);
  const resolvedPlacement = menuPlacement || (compact ? "top" : "bottom");
  const resolvedCompactLabelClass = compact ? compactLabelClass || "max-[390px]:hidden" : "";
  const buttonClass = compact ? "inline-flex h-10 items-center gap-2 rounded-full border border-[#2a2d30] bg-[#141618] px-3 text-xs font-semibold text-white/78 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition md:hover:bg-[#1a1d1f] md:hover:text-white md:hover:border-[#373b3f] max-[390px]:h-9 max-[390px]:w-9 max-[390px]:justify-center max-[390px]:gap-0 max-[390px]:px-0" : "inline-flex h-11 items-center gap-2 rounded-full border border-[#2a2d30] bg-[#141618] px-4 text-sm font-semibold text-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.22)] transition md:hover:bg-[#1a1d1f] md:hover:text-white md:hover:border-[#373b3f]";
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: containerRef,
      className: [
        wrap ? "flex flex-wrap items-center gap-2" : "flex flex-nowrap items-center gap-2",
        className
      ].join(" ")
    },
    /* @__PURE__ */ React.createElement("div", { ref: speedAnchorRef, className: "relative" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setActiveMenu((prev) => prev === "speed" ? null : "speed"),
        className: `${buttonClass} ${activeMenu === "speed" ? "border-[#3d4246] bg-[#1d2022] text-white" : ""}`,
        "aria-label": "T\u1ED1c \u0111\u1ED9 ph\xE1t"
      },
      /* @__PURE__ */ React.createElement(FiSliders, { className: "text-[15px] text-white/60" }),
      /* @__PURE__ */ React.createElement("span", { className: resolvedCompactLabelClass }, playbackRate, "x")
    ), /* @__PURE__ */ React.createElement(
      ToolbarMenu,
      {
        open: activeMenu === "speed",
        align: compact ? "left" : align,
        placement: resolvedPlacement,
        floating: compact,
        anchorRef: speedAnchorRef,
        menuRef: speedMenuRef
      },
      /* @__PURE__ */ React.createElement("div", { className: "px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38" }, "T\u1ED1c \u0111\u1ED9 ph\xE1t"),
      /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, SPEED_OPTIONS.map((option) => {
        const isActive = playbackRate === option;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: option,
            type: "button",
            onClick: () => {
              setPlaybackRate(option);
              setActiveMenu(null);
            },
            className: `flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-sm transition ${isActive ? "border border-[#3a3f43] bg-[#1b1f21] text-white" : "border border-transparent text-white/68 md:hover:border-[#2f3437] md:hover:bg-[#181b1d] md:hover:text-white"}`
          },
          /* @__PURE__ */ React.createElement("span", null, option, "x"),
          isActive ? /* @__PURE__ */ React.createElement(FiCheck, { className: "text-[13px]" }) : null
        );
      }))
    )),
    /* @__PURE__ */ React.createElement("div", { ref: timerAnchorRef, className: "relative" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setActiveMenu((prev) => prev === "timer" ? null : "timer"),
        className: `${buttonClass} ${sleepTimerEndsAt ? "border-[#3d4246] bg-[#1d2022] text-white" : ""}`,
        "aria-label": "H\u1EB9n gi\u1EDD d\u1EEBng ph\xE1t"
      },
      /* @__PURE__ */ React.createElement(
        FiClock,
        {
          className: `text-[15px] ${sleepTimerEndsAt ? "text-white/72" : "text-white/56"}`
        }
      ),
      /* @__PURE__ */ React.createElement("span", { className: resolvedCompactLabelClass }, timerLabel)
    ), /* @__PURE__ */ React.createElement(
      ToolbarMenu,
      {
        open: activeMenu === "timer",
        align: compact ? "right" : align,
        placement: resolvedPlacement,
        floating: compact,
        anchorRef: timerAnchorRef,
        menuRef: timerMenuRef
      },
      /* @__PURE__ */ React.createElement("div", { className: "px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38" }, "H\u1EB9n gi\u1EDD d\u1EEBng"),
      /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, TIMER_OPTIONS.map((option) => {
        const isActive = option.value === 0 && !sleepTimerEndsAt || option.value > 0 && option.value === sleepTimerMinutes;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: option.value,
            type: "button",
            onClick: () => {
              setSleepTimer(option.value);
              setActiveMenu(null);
            },
            className: `flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-sm transition ${isActive ? "border border-[#3a3f43] bg-[#1b1f21] text-white" : "border border-transparent text-white/68 md:hover:border-[#2f3437] md:hover:bg-[#181b1d] md:hover:text-white"}`
          },
          /* @__PURE__ */ React.createElement("span", null, option.label),
          isActive ? /* @__PURE__ */ React.createElement(FiCheck, { className: "text-[13px]" }) : null
        );
      }))
    )),
    showShare && currentSongId ? /* @__PURE__ */ React.createElement(
      ShareLinkButton,
      {
        path: currentSongPath || `/song/${currentSongId}`,
        title: compact ? "Chia s\u1EBB" : "Chia s\u1EBB b\xE0i h\xE1t",
        shareTitle: currentSong?.title || "B\xE0i h\xE1t",
        shareText: `Nghe ${currentSong?.title || "b\xE0i h\xE1t n\xE0y"} c\u1EE7a ${currentArtistLabel} tr\xEAn Khoaluan Music.`,
        preview: {
          eyebrow: "\u0110ang ph\xE1t",
          title: currentSong?.title || "B\xE0i h\xE1t",
          subtitle: currentArtistLabel,
          description: compact ? "" : "M\u1EDF nhanh trang b\xE0i h\xE1t \u0111ang ph\xE1t \u0111\u1EC3 nghe v\xE0 chia s\u1EBB.",
          image: currentSong?.cover_url || currentSong?.thumbnail_m || currentSong?.thumbnail || currentSong?.image_url || ""
        },
        compact,
        variant: "toolbar"
      }
    ) : null
  );
}

// src/components/player/PlayerDetail.jsx
var formatTime = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r2 = String(s % 60).padStart(2, "0");
  return `${m}:${r2}`;
};
var ANIM_MS = 450;
var ANIM_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
var MOBILE_TABS = [
  { id: "queue", label: "Danh s\xE1ch ph\xE1t" },
  { id: "now", label: "\u0110ang ph\xE1t" },
  { id: "lyrics", label: "L\u1EDDi b\xE0i h\xE1t" }
];
function PlayerProgressSection({
  duration = 0,
  fallbackDuration = 0,
  onSeek,
  onInteractionStart,
  onInteractionMove,
  onInteractionEnd,
  outerClassName = "space-y-2",
  rangeWrapperClassName = "-my-2 px-1 py-2",
  timeClassName = "flex items-center justify-between px-1 text-[11px] text-white/64 sm:text-xs"
}) {
  const currentTime = player_store_default((state) => state.currentTime);
  const [isSeeking, setIsSeeking] = (0, import_react12.useState)(false);
  const [seekValue, setSeekValue] = (0, import_react12.useState)(0);
  const total = Number(duration || fallbackDuration || 0) || 0;
  const displayedTime = isSeeking ? seekValue : Number(currentTime || 0);
  (0, import_react12.useEffect)(() => {
    if (!isSeeking) {
      setSeekValue(Number(currentTime || 0));
    }
  }, [currentTime, isSeeking]);
  const handleSeekStart = (0, import_react12.useCallback)((event) => {
    onInteractionStart?.(event);
    setIsSeeking(true);
    const nextValue = Number(event?.target?.value);
    if (Number.isFinite(nextValue)) {
      setSeekValue(nextValue);
    }
  }, [onInteractionStart]);
  const handleSeekMove = (0, import_react12.useCallback)((event) => {
    onInteractionMove?.(event);
  }, [onInteractionMove]);
  const commitSeek = (0, import_react12.useCallback)((event) => {
    onInteractionEnd?.(event);
    const rawValue = Number(event?.target?.value);
    const nextValue = Number.isFinite(rawValue) ? rawValue : Number(seekValue) || 0;
    const boundedValue = Math.max(0, Math.min(total, nextValue));
    setIsSeeking(false);
    setSeekValue(boundedValue);
    onSeek?.(boundedValue);
  }, [onInteractionEnd, onSeek, seekValue, total]);
  return /* @__PURE__ */ React.createElement("div", { className: outerClassName }, /* @__PURE__ */ React.createElement("div", { className: rangeWrapperClassName }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: 0,
      max: total || 0,
      step: 0.1,
      value: Math.min(displayedTime, total || 0),
      onPointerDownCapture: handleSeekStart,
      onPointerMoveCapture: handleSeekMove,
      onPointerUpCapture: commitSeek,
      onPointerCancelCapture: commitSeek,
      onTouchStartCapture: handleSeekStart,
      onTouchMoveCapture: handleSeekMove,
      onTouchEndCapture: commitSeek,
      onTouchCancelCapture: commitSeek,
      onMouseDownCapture: handleSeekStart,
      onMouseUpCapture: commitSeek,
      onChange: (event) => setSeekValue(Number(event.target.value)),
      onKeyDown: () => setIsSeeking(true),
      onKeyUp: commitSeek,
      onBlur: commitSeek,
      className: "player-detail-range h-2.5 w-full cursor-pointer",
      style: {
        "--range-progress": `${total > 0 ? Math.min(displayedTime, total) / total * 100 : 0}%`
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: timeClassName }, /* @__PURE__ */ React.createElement("span", null, formatTime(displayedTime)), /* @__PURE__ */ React.createElement("span", null, formatTime(total))));
}
function PlayerDetail({ isOpen, onClose }) {
  const {
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    pause,
    resume,
    playNext,
    playPrev,
    playAt,
    shuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
    duration,
    seek,
    volume,
    muted,
    setVolume,
    toggleMute,
    likedSongIds,
    toggleLike,
    appendRecommendationsToQueue,
    recommendationLoading
  } = player_store_default(
    useShallow((state) => ({
      currentSong: state.currentSong,
      queue: state.queue,
      currentIndex: state.currentIndex,
      isPlaying: state.isPlaying,
      pause: state.pause,
      resume: state.resume,
      playNext: state.playNext,
      playPrev: state.playPrev,
      playAt: state.playAt,
      shuffle: state.shuffle,
      toggleShuffle: state.toggleShuffle,
      repeatMode: state.repeatMode,
      toggleRepeatMode: state.toggleRepeatMode,
      duration: state.duration,
      seek: state.seek,
      volume: state.volume,
      muted: state.muted,
      setVolume: state.setVolume,
      toggleMute: state.toggleMute,
      likedSongIds: state.likedSongIds,
      toggleLike: state.toggleLike,
      appendRecommendationsToQueue: state.appendRecommendationsToQueue,
      recommendationLoading: state.recommendationLoading
    }))
  );
  const [activeTab, setActiveTab] = (0, import_react12.useState)("queue");
  const [mobileTab, setMobileTab] = (0, import_react12.useState)("now");
  const [isCarouselSwipeLocked, setIsCarouselSwipeLocked] = (0, import_react12.useState)(false);
  const [mounted, setMounted] = (0, import_react12.useState)(false);
  const [phase, setPhase] = (0, import_react12.useState)("closed");
  const [backdropReady, setBackdropReady] = (0, import_react12.useState)(false);
  const [songSlideClass, setSongSlideClass] = (0, import_react12.useState)("");
  const [fallbackDuration, setFallbackDuration] = (0, import_react12.useState)(0);
  const [mobileDragOffset, setMobileDragOffset] = (0, import_react12.useState)(0);
  const [isFullscreen, setIsFullscreen] = (0, import_react12.useState)(false);
  const phaseRef = (0, import_react12.useRef)("closed");
  const audioRef = (0, import_react12.useRef)(null);
  const carouselRef = (0, import_react12.useRef)(null);
  const scrollRafRef = (0, import_react12.useRef)(null);
  const unlockSwipeTimerRef = (0, import_react12.useRef)(null);
  const prevIndexRef = (0, import_react12.useRef)(currentIndex);
  const lastRecommendationSeedRef = (0, import_react12.useRef)(null);
  const fullscreenByPlayerRef = (0, import_react12.useRef)(false);
  const mobileGestureRef = (0, import_react12.useRef)({
    startX: 0,
    startY: 0,
    tracking: false,
    shouldDrag: false
  });
  (0, import_react12.useEffect)(() => {
    phaseRef.current = phase;
  }, [phase]);
  (0, import_react12.useEffect)(() => {
    if (typeof document === "undefined") return void 0;
    const handleFullscreenChange = () => {
      const nextFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(nextFullscreen);
      if (!nextFullscreen) fullscreenByPlayerRef.current = false;
    };
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  (0, import_react12.useEffect)(() => {
    if (isOpen) {
      setMounted(true);
      setPhase("enter");
      setBackdropReady(false);
      setMobileDragOffset(0);
      const t = setTimeout(() => setBackdropReady(true), 80);
      return () => clearTimeout(t);
    }
    setBackdropReady(false);
    setMobileDragOffset(0);
    setPhase((prev) => prev === "closed" ? "closed" : "exit");
    return void 0;
  }, [isOpen]);
  (0, import_react12.useEffect)(() => {
    if (!mounted) return void 0;
    if (typeof document === "undefined") return void 0;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    if (isOpen) {
      const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [mounted, isOpen]);
  (0, import_react12.useEffect)(() => {
    if (!mounted || !isOpen) return void 0;
    if (typeof window === "undefined") return void 0;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return void 0;
    const el = carouselRef.current;
    if (!el) return void 0;
    const width = el.clientWidth || 1;
    el.scrollTo({ left: width, behavior: "auto" });
    setMobileTab("now");
    return void 0;
  }, [mounted, isOpen]);
  (0, import_react12.useEffect)(() => {
    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      if (unlockSwipeTimerRef.current) {
        clearTimeout(unlockSwipeTimerRef.current);
      }
    };
  }, []);
  (0, import_react12.useEffect)(() => {
    const seedId = normalizeSongId2(currentSong);
    if (!seedId) return void 0;
    if (repeatMode !== "off") return void 0;
    if (recommendationLoading) return void 0;
    if (queue.length > currentIndex + 1) return void 0;
    if (lastRecommendationSeedRef.current === seedId) return void 0;
    lastRecommendationSeedRef.current = seedId;
    let active = true;
    appendRecommendationsToQueue().then((appended) => {
      if (!appended && active) {
        lastRecommendationSeedRef.current = null;
      }
    });
    return () => {
      active = false;
    };
  }, [
    appendRecommendationsToQueue,
    currentIndex,
    currentSong,
    queue.length,
    recommendationLoading,
    repeatMode
  ]);
  const handleAnimEnd = () => {
    const currentPhase = phaseRef.current;
    if (currentPhase === "enter") setPhase("open");
    if (currentPhase === "exit") {
      setMounted(false);
      setPhase("closed");
    }
  };
  (0, import_react12.useEffect)(() => {
    if (prevIndexRef.current === currentIndex) return;
    setSongSlideClass(
      currentIndex > prevIndexRef.current ? "song-slide-next" : "song-slide-prev"
    );
    prevIndexRef.current = currentIndex;
    const t = setTimeout(() => setSongSlideClass(""), 380);
    return () => clearTimeout(t);
  }, [currentIndex]);
  (0, import_react12.useEffect)(() => {
    if (!mounted) return void 0;
    const audioEl = document.querySelector("audio");
    audioRef.current = audioEl;
    const syncDuration = () => {
      setFallbackDuration(audioEl?.duration || 0);
    };
    syncDuration();
    audioEl?.addEventListener("loadedmetadata", syncDuration);
    return () => {
      audioEl?.removeEventListener("loadedmetadata", syncDuration);
    };
  }, [mounted, currentSong]);
  const total = Number(duration || fallbackDuration || 0) || 0;
  const doSeek = (0, import_react12.useCallback)((nextTime) => {
    const time = Math.max(0, Math.min(total, Number(nextTime) || 0));
    seek?.(time);
  }, [seek, total]);
  const lockCarouselSwipe = (0, import_react12.useCallback)(() => {
    if (unlockSwipeTimerRef.current) {
      clearTimeout(unlockSwipeTimerRef.current);
      unlockSwipeTimerRef.current = null;
    }
    setIsCarouselSwipeLocked(true);
  }, []);
  const unlockCarouselSwipe = (0, import_react12.useCallback)(() => {
    if (unlockSwipeTimerRef.current) {
      clearTimeout(unlockSwipeTimerRef.current);
    }
    unlockSwipeTimerRef.current = setTimeout(() => {
      setIsCarouselSwipeLocked(false);
      unlockSwipeTimerRef.current = null;
    }, 80);
  }, []);
  const focusRangeInteraction = (e) => {
    e.stopPropagation();
  };
  const handleSliderInteractionStart = (e) => {
    focusRangeInteraction(e);
    lockCarouselSwipe();
  };
  const handleSliderInteractionMove = (e) => {
    focusRangeInteraction(e);
    lockCarouselSwipe();
  };
  const handleSliderInteractionEnd = (e) => {
    focusRangeInteraction(e);
    unlockCarouselSwipe();
  };
  const exitPlayerFullscreen = (0, import_react12.useCallback)(async () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement || !fullscreenByPlayerRef.current) return;
    try {
      await document.exitFullscreen?.();
    } catch (error) {
      console.error("Exit fullscreen failed", error);
    } finally {
      fullscreenByPlayerRef.current = false;
    }
  }, []);
  const handleClose = (0, import_react12.useCallback)(async () => {
    await exitPlayerFullscreen();
    onClose?.();
  }, [exitPlayerFullscreen, onClose]);
  const handleDetailNavigation = (0, import_react12.useCallback)(() => {
    void handleClose();
  }, [handleClose]);
  const toggleFullscreen = (0, import_react12.useCallback)(async () => {
    if (typeof document === "undefined") return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
        fullscreenByPlayerRef.current = false;
        return;
      }
      await document.documentElement.requestFullscreen?.();
      fullscreenByPlayerRef.current = true;
    } catch (error) {
      console.error("Toggle fullscreen failed", error);
    }
  }, []);
  const togglePlay = (0, import_react12.useCallback)(() => {
    isPlaying ? pause() : resume();
  }, [isPlaying, pause, resume]);
  const handleVolumeChange = (0, import_react12.useCallback)((value) => {
    const next = Number(value);
    if (muted && next > 0) toggleMute();
    setVolume(next);
  }, [muted, setVolume, toggleMute]);
  const resetMobileGesture = () => {
    mobileGestureRef.current = {
      startX: 0,
      startY: 0,
      tracking: false,
      shouldDrag: false
    };
    setMobileDragOffset(0);
  };
  const handleMobileTouchStart = (e) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) return;
    const touch = e.touches?.[0];
    if (!touch) return;
    const target = e.target;
    const isInteractive = target?.closest?.(
      "button, input, textarea, select, a, [role='button']"
    );
    const scrollRoot = target?.closest?.("[data-mobile-sheet-scroll='true']");
    const isScrollableAwayFromTop = scrollRoot && Number(scrollRoot.scrollTop) > 0;
    mobileGestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      tracking: true,
      shouldDrag: !isInteractive && !isScrollableAwayFromTop && !isCarouselSwipeLocked
    };
  };
  const handleMobileTouchMove = (e) => {
    const touch = e.touches?.[0];
    const gesture = mobileGestureRef.current;
    if (!touch || !gesture.tracking || !gesture.shouldDrag) return;
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    if (deltaY <= 0) {
      setMobileDragOffset(0);
      return;
    }
    if (Math.abs(deltaY) <= Math.abs(deltaX) * 1.15) {
      setMobileDragOffset(0);
      return;
    }
    setMobileDragOffset(Math.min(deltaY * 0.58, 120));
  };
  const handleMobileTouchEnd = (e) => {
    const touch = e.changedTouches?.[0];
    const gesture = mobileGestureRef.current;
    if (!touch || !gesture.tracking) {
      resetMobileGesture();
      return;
    }
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    const shouldClose = gesture.shouldDrag && deltaY > 110 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2;
    resetMobileGesture();
    if (shouldClose) handleClose();
  };
  if (!mounted || !currentSong) return null;
  const cover = resolveAssetUrl(
    currentSong.cover || currentSong.cover_url || currentSong.image
  );
  const currentSongId = normalizeSongId2(currentSong);
  const albumId = currentSong?.album_id || currentSong?.album?.id || null;
  const albumTitle = currentSong?.album_title || currentSong?.album?.title || "Single";
  const albumPath = getAlbumPath({
    id: albumId,
    title: albumTitle
  });
  const currentSongPath = getSongPath(currentSong);
  const currentArtistLabel = currentSong?.artist_name || (Array.isArray(currentSong?.artists) ? currentSong.artists.map((artist) => artist?.name || artist?.alias || "").filter(Boolean).join(", ") : "") || "Ngh\u1EC7 s\u0129";
  const normalizedIndex = Number.isFinite(currentIndex) ? currentIndex : 0;
  const queueCount = Array.isArray(queue) ? queue.length : 0;
  const safeQueueSize = Math.max(queueCount, normalizedIndex + 1, 1);
  const queuePosition = Math.min(
    safeQueueSize,
    Math.max(normalizedIndex + 1, 1)
  );
  const modeLabel = shuffle ? "Tr\u1ED9n" : repeatMode === "one" ? "L\u1EB7p 1" : repeatMode === "all" ? "L\u1EB7p h\xE0ng \u0111\u1EE3i" : "B\xECnh th\u01B0\u1EDDng";
  const metaCards = [
    { label: "V\u1ECB tr\xED", value: `${queuePosition}/${safeQueueSize}` },
    { label: "Th\u1EDDi l\u01B0\u1EE3ng", value: total > 0 ? formatTime(total) : "--:--" },
    { label: "Ch\u1EBF \u0111\u1ED9", value: modeLabel }
  ];
  const tabs = [
    { id: "queue", label: "Danh s\xE1ch ph\xE1t" },
    { id: "lyrics", label: "L\u1EDDi b\xE0i h\xE1t" }
  ];
  const mobileTabs = MOBILE_TABS;
  const activeTabTitle = activeTab === "queue" ? "Danh s\xE1ch ph\xE1t" : "L\u1EDDi b\xE0i h\xE1t";
  const activeTabDescription = activeTab === "queue" ? queueCount ? `${queueCount} b\xE0i trong h\xE0ng \u0111\u1EE3i` : "H\xE0ng \u0111\u1EE3i hi\u1EC7n ch\u01B0a c\xF3 b\xE0i h\xE1t n\xE0o" : "L\u1EDDi b\xE0i h\xE1t ch\u1EA1y theo th\u1EDDi gian ph\xE1t";
  const animateClass = phase === "enter" ? "player-detail-anim-in" : phase === "exit" ? "player-detail-anim-out" : "";
  const stableClass = phase === "exit" ? "opacity-0" : "opacity-100";
  const glassPanelClass = "player-detail-glass";
  const softButtonClass = "flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white/82 transition active:scale-95 md:hover:bg-white/[0.12] md:hover:text-white";
  const mobileUtilityButtonClass = "flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07] text-white/82 transition active:scale-95 max-[390px]:h-10 max-[390px]:w-10";
  const closeButtonClass = "inline-flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(82,119,170,0.42),rgba(22,38,62,0.94))] text-white/86 shadow-[0_16px_34px_rgba(6,14,28,0.4)] transition active:scale-95 md:hover:-translate-y-0.5 md:hover:brightness-110 md:hover:text-white";
  const fullscreenButtonClass = `inline-flex h-11 w-11 items-center justify-center rounded-full text-white/84 shadow-[0_16px_34px_rgba(6,14,28,0.34)] transition active:scale-95 md:hover:-translate-y-0.5 md:hover:text-white ${isFullscreen ? "bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.34),rgba(14,77,112,0.94))]" : "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),rgba(28,31,39,0.94))] md:hover:brightness-110"}`;
  const pillClass = "rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/66 sm:text-[11px]";
  const isLiked = likedSongIds.includes(currentSongId);
  const likeButton = /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        if (currentSongId) toggleLike(currentSongId);
      },
      className: `flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95 ${isLiked ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.24)]" : "bg-white/[0.07] text-white/80 md:hover:bg-white/[0.12]"}`,
      "aria-label": "Y\xEAu th\xEDch"
    },
    /* @__PURE__ */ React.createElement(FiHeart, null)
  );
  const shareButton = currentSongId ? /* @__PURE__ */ React.createElement(
    ShareLinkButton,
    {
      path: currentSongPath || `/song/${currentSongId}`,
      title: "Chia s\u1EBB",
      shareTitle: currentSong?.title || "B\xE0i h\xE1t",
      shareText: `Nghe ${currentSong?.title || "b\xE0i h\xE1t n\xE0y"} c\u1EE7a ${currentArtistLabel} tr\xEAn Khoaluan Music.`,
      preview: {
        eyebrow: "\u0110ang ph\xE1t",
        title: currentSong?.title || "B\xE0i h\xE1t",
        subtitle: currentArtistLabel,
        description: "M\u1EDF nhanh trang b\xE0i h\xE1t \u0111ang ph\xE1t \u0111\u1EC3 nghe v\xE0 chia s\u1EBB.",
        image: currentSong?.cover_url || currentSong?.thumbnail_m || currentSong?.thumbnail || currentSong?.image_url || cover || ""
      },
      compact: true,
      className: "h-11 w-11 border-white/10 bg-white/[0.07] text-white/82 md:hover:bg-white/[0.12]"
    }
  ) : null;
  const detailPanel = /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-4 sm:p-5 lg:p-5 xl:p-6`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: pillClass }, isPlaying ? "\u0110ang ph\xE1t" : "T\u1EA1m d\u1EEBng"), /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-white/56" }, safeQueueSize, " b\xE0i trong h\xE0ng \u0111\u1EE3i")), /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-white/56" }, modeLabel)),
    /* @__PURE__ */ React.createElement("div", { className: "mt-4 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-5 xl:gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex min-h-0 items-center" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `mx-auto grid w-full max-w-[1120px] min-h-0 gap-5 md:grid-cols-[minmax(180px,230px)_minmax(0,1fr)] md:items-center lg:grid-cols-[minmax(196px,248px)_minmax(0,1fr)] lg:gap-5 xl:max-w-[1180px] xl:grid-cols-[minmax(220px,286px)_minmax(0,1fr)] xl:gap-6 2xl:max-w-[1240px] 2xl:grid-cols-[minmax(250px,340px)_minmax(0,1fr)] 2xl:gap-8 ${songSlideClass}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "relative mx-auto w-full max-w-[210px] sm:max-w-[240px] md:mx-0 md:max-w-none" }, /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "pointer-events-none absolute -inset-4 rounded-[34px] opacity-60 blur-3xl",
          style: {
            background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.14), transparent 34%), radial-gradient(circle at 65% 72%, rgba(242,178,90,0.16), transparent 42%)"
          }
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "relative aspect-square overflow-hidden rounded-[28px] bg-black/28 shadow-[0_26px_80px_rgba(0,0,0,0.42)]" }, cover ? /* @__PURE__ */ React.createElement(
        OptimizedImage,
        {
          src: cover,
          alt: currentSong.title,
          className: "h-full w-full object-cover"
        }
      ) : /* @__PURE__ */ React.createElement("div", { className: "flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2f2f2f,#111)] text-sm uppercase tracking-[0.32em] text-white/50" }, "No cover"))),
      /* @__PURE__ */ React.createElement("div", { className: "min-w-0 self-center text-center md:text-left" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-visible pb-2" }, /* @__PURE__ */ React.createElement(
        SongDetailLink,
        {
          song: currentSong,
          className: "overflow-hidden pt-[0.04em] pb-[0.12em] text-[clamp(2.15rem,4.6vw,4.4rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-white transition md:hover:text-emerald-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] 2xl:text-[clamp(2.7rem,4.9vw,5.15rem)]",
          onNavigate: handleDetailNavigation
        },
        currentSong.title
      )), /* @__PURE__ */ React.createElement("div", { className: "mt-2 overflow-hidden text-sm font-medium text-white/78 sm:text-base lg:text-lg xl:text-xl [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]" }, /* @__PURE__ */ React.createElement(
        ArtistNames,
        {
          item: currentSong,
          fallback: "Unknown",
          linkClassName: "transition md:hover:text-white",
          onNavigate: handleDetailNavigation
        }
      )), albumPath ? /* @__PURE__ */ React.createElement("div", { className: "mt-3" }, /* @__PURE__ */ React.createElement(
        Link,
        {
          to: albumPath,
          onClick: handleDetailNavigation,
          className: "inline-flex max-w-full items-center rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-sm font-medium text-white/72 transition md:hover:border-emerald-300/40 md:hover:text-emerald-200"
        },
        /* @__PURE__ */ React.createElement("span", { className: "truncate" }, albumTitle)
      )) : null, /* @__PURE__ */ React.createElement("div", { className: "mt-5 grid grid-cols-3 gap-2 sm:gap-2.5 xl:max-w-[42rem]" }, metaCards.map((card) => /* @__PURE__ */ React.createElement(
        "div",
        {
          key: card.label,
          className: "rounded-[18px] bg-white/[0.045] px-3 py-3 text-left backdrop-blur-xl"
        },
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase tracking-[0.26em] text-white/42" }, card.label),
        /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-sm font-semibold text-white sm:text-[15px] xl:text-base" }, card.value)
      ))))
    )), /* @__PURE__ */ React.createElement("div", { className: "mx-auto w-full max-w-[1120px] rounded-[24px] bg-black/18 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-5 xl:max-w-[1180px] 2xl:max-w-[1240px]" }, /* @__PURE__ */ React.createElement(
      PlayerProgressSection,
      {
        duration,
        fallbackDuration,
        onSeek: doSeek,
        onInteractionStart: handleSliderInteractionStart,
        onInteractionMove: handleSliderInteractionMove,
        onInteractionEnd: handleSliderInteractionEnd
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "mt-5 grid gap-4 xl:grid-cols-[auto_1fr] xl:items-center 2xl:grid-cols-[auto_1fr_minmax(0,220px)]" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2 xl:justify-start" }, likeButton, /* @__PURE__ */ React.createElement(
      AddToPlaylistButton,
      {
        song: currentSong,
        triggerClassName: "h-11 w-11 bg-white/[0.07] text-white/82 md:hover:bg-white/[0.12]"
      }
    ), shareButton), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2.5 text-lg sm:gap-3 sm:text-xl" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: toggleShuffle,
        className: `${softButtonClass} ${shuffle ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]" : ""}`,
        "aria-label": "Tr\u1ED9n"
      },
      /* @__PURE__ */ React.createElement(FaShuffle, null)
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: playPrev,
        className: softButtonClass,
        "aria-label": "B\xE0i tr\u01B0\u1EDBc"
      },
      /* @__PURE__ */ React.createElement(FaBackwardStep, null)
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: togglePlay,
        className: "relative flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#9dfabd,#4ad67f_55%,#249956)] text-2xl text-[#062512] shadow-[0_0_42px_rgba(75,220,126,0.52)] transition active:scale-95 sm:h-[4.5rem] sm:w-[4.5rem]",
        "aria-label": "Ph\xE1t ho\u1EB7c t\u1EA1m d\u1EEBng"
      },
      isPlaying ? /* @__PURE__ */ React.createElement(FaPause, null) : /* @__PURE__ */ React.createElement(FaPlay, { className: "ml-0.5" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: playNext,
        className: softButtonClass,
        "aria-label": "B\xE0i ti\u1EBFp"
      },
      /* @__PURE__ */ React.createElement(FaForwardStep, null)
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: toggleRepeatMode,
        className: `${softButtonClass} ${repeatMode !== "off" ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]" : ""}`,
        "aria-label": "L\u1EB7p l\u1EA1i"
      },
      /* @__PURE__ */ React.createElement("span", { className: "relative inline-flex" }, /* @__PURE__ */ React.createElement(FaRepeat, null), repeatMode === "one" && /* @__PURE__ */ React.createElement("span", { className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black" }, "1"))
    )), /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 items-center gap-3 xl:col-span-2 xl:max-w-[320px] xl:justify-self-end 2xl:col-span-1 2xl:max-w-none" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: toggleMute,
        className: softButtonClass,
        "aria-label": "T\u1EAFt ho\u1EB7c m\u1EDF ti\u1EBFng"
      },
      muted || volume === 0 ? /* @__PURE__ */ React.createElement(FaVolumeXmark, null) : /* @__PURE__ */ React.createElement(FaVolumeHigh, null)
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "range",
        min: 0,
        max: 1,
        step: 0.01,
        value: volume,
        onPointerDownCapture: handleSliderInteractionStart,
        onPointerMoveCapture: handleSliderInteractionMove,
        onPointerUpCapture: handleSliderInteractionEnd,
        onPointerCancelCapture: handleSliderInteractionEnd,
        onTouchStartCapture: handleSliderInteractionStart,
        onTouchMoveCapture: handleSliderInteractionMove,
        onTouchEndCapture: handleSliderInteractionEnd,
        onTouchCancelCapture: handleSliderInteractionEnd,
        onMouseDownCapture: handleSliderInteractionStart,
        onMouseUpCapture: handleSliderInteractionEnd,
        onInput: (e) => handleVolumeChange(e.target.value),
        onChange: (e) => handleVolumeChange(e.target.value),
        className: "player-detail-range h-2.5 min-w-0 flex-1 cursor-pointer",
        style: {
          "--range-progress": `${volume * 100}%`
        }
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "w-10 text-right text-[11px] text-white/48 sm:text-xs" }, Math.round(volume * 100), "%"))), /* @__PURE__ */ React.createElement("div", { className: "relative z-20 mt-4 flex items-center justify-center xl:justify-end" }, /* @__PURE__ */ React.createElement(PlayerEnhancementToolbar, { menuPlacement: "top", wrap: false, showShare: false }))))
  );
  const sidePanel = /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-3 sm:p-4`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-semibold uppercase tracking-[0.34em] text-white/42 sm:text-[11px]" }, "Kh\xE1m ph\xE1"), /* @__PURE__ */ React.createElement("h3", { className: "mt-2 text-lg font-semibold text-white sm:text-xl" }, activeTabTitle), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-xs text-white/54 sm:text-sm" }, activeTabDescription)), /* @__PURE__ */ React.createElement("div", { className: "flex shrink-0 items-center gap-2 self-start" }, /* @__PURE__ */ React.createElement("span", { className: "rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-white/54" }, activeTab === "queue" ? `${queueCount} b\xE0i` : "Sync"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: toggleFullscreen,
        className: fullscreenButtonClass,
        "aria-label": isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
      },
      isFullscreen ? /* @__PURE__ */ React.createElement(FiMinimize, { size: 17 }) : /* @__PURE__ */ React.createElement(FiMaximize, { size: 17 })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: handleClose,
        className: closeButtonClass,
        "aria-label": "Close player detail"
      },
      /* @__PURE__ */ React.createElement(FiChevronDown, { size: 18 })
    ))),
    /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex items-center gap-1.5 rounded-full bg-black/24 p-1" }, tabs.map((tab) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab.id,
        type: "button",
        onClick: () => setActiveTab(tab.id),
        className: `flex-1 rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${activeTab === tab.id ? "bg-white/[0.09] text-white shadow-[0_8px_18px_rgba(255,255,255,0.06)]" : "text-white/70 md:hover:bg-white/[0.06] md:hover:text-white"}`
      },
      tab.label
    ))),
    /* @__PURE__ */ React.createElement("div", { className: "mt-4 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-black/16 backdrop-blur-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-full min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-4" }, activeTab === "queue" ? /* @__PURE__ */ React.createElement(
      PlayerDetailQueue_default,
      {
        queue,
        currentIndex: normalizedIndex,
        playAt,
        onNavigate: handleDetailNavigation
      }
    ) : /* @__PURE__ */ React.createElement(
      PlayerDetailLyrics_default,
      {
        currentSong,
        isActive: activeTab === "lyrics",
        onSeek: doSeek,
        allowManualScroll: true
      }
    )))
  );
  const mobileQueuePanel = /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-4`
    },
    /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold text-white" }, "Danh s\xE1ch ph\xE1t"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-white/52" }, queueCount ? `${queueCount} b\xE0i trong h\xE0ng \u0111\u1EE3i` : "H\xE0ng \u0111\u1EE3i hi\u1EC7n \u0111ang tr\u1ED1ng")),
    /* @__PURE__ */ React.createElement("div", { className: "mt-4 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-black/16 backdrop-blur-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-full min-h-0 flex-col overflow-hidden px-3 py-3" }, /* @__PURE__ */ React.createElement(
      PlayerDetailQueue_default,
      {
        queue,
        currentIndex: normalizedIndex,
        playAt,
        onNavigate: handleDetailNavigation
      }
    )))
  );
  const mobileNowPanel = /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-y-auto rounded-[26px] p-3.5 scrollbar-hidden min-[390px]:p-4`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex min-h-0 flex-1 flex-col items-center justify-center gap-4 pb-3 pt-1 min-[390px]:gap-5 min-[390px]:pb-4 min-[390px]:pt-2" }, /* @__PURE__ */ React.createElement("div", { className: "relative mx-auto w-full max-w-[min(54vw,228px)] min-[390px]:max-w-[min(58vw,248px)]" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "pointer-events-none absolute -inset-4 rounded-[34px] opacity-60 blur-3xl",
        style: {
          background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.14), transparent 34%), radial-gradient(circle at 65% 72%, rgba(242,178,90,0.16), transparent 42%)"
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "relative aspect-square overflow-hidden rounded-[28px] bg-black/28 shadow-[0_26px_80px_rgba(0,0,0,0.42)]" }, cover ? /* @__PURE__ */ React.createElement(
      OptimizedImage,
      {
        src: cover,
        alt: currentSong.title,
        className: "h-full w-full object-cover"
      }
    ) : /* @__PURE__ */ React.createElement("div", { className: "flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2f2f2f,#111)] text-sm uppercase tracking-[0.32em] text-white/50" }, "No cover"))), /* @__PURE__ */ React.createElement("div", { className: "w-full min-w-0 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "overflow-visible pb-2" }, /* @__PURE__ */ React.createElement(
      SongDetailLink,
      {
        song: currentSong,
        className: "overflow-hidden px-2 pt-[0.04em] pb-[0.14em] text-[clamp(1.8rem,8vw,3rem)] font-semibold leading-[1.03] tracking-tight text-white transition md:hover:text-emerald-300 md:hover:underline [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
        onNavigate: handleDetailNavigation
      },
      currentSong.title
    )), /* @__PURE__ */ React.createElement("div", { className: "mt-1 overflow-hidden px-3 text-sm font-medium text-white/72 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]" }, /* @__PURE__ */ React.createElement(
      ArtistNames,
      {
        item: currentSong,
        fallback: "Unknown",
        linkClassName: "transition",
        onNavigate: handleDetailNavigation
      }
    )), albumPath ? /* @__PURE__ */ React.createElement("div", { className: "mt-2 flex justify-center px-3" }, /* @__PURE__ */ React.createElement(
      Link,
      {
        to: albumPath,
        onClick: handleDetailNavigation,
        className: "inline-flex max-w-full items-center rounded-full border border-white/14 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/72 transition"
      },
      /* @__PURE__ */ React.createElement("span", { className: "truncate" }, albumTitle)
    )) : null, /* @__PURE__ */ React.createElement("p", { className: "mt-2 text-[11px] uppercase tracking-[0.24em] text-white/42 min-[390px]:mt-3" }, isPlaying ? "\u0110ang ph\xE1t" : "T\u1EA1m d\u1EEBng", " \xB7 ", modeLabel))),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `mt-auto shrink-0 rounded-[22px] bg-black/18 p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl min-[390px]:rounded-[24px] min-[390px]:p-4 ${songSlideClass}`
      },
      /* @__PURE__ */ React.createElement(
        PlayerProgressSection,
        {
          duration,
          fallbackDuration,
          onSeek: doSeek,
          onInteractionStart: handleSliderInteractionStart,
          onInteractionMove: handleSliderInteractionMove,
          onInteractionEnd: handleSliderInteractionEnd,
          outerClassName: "space-y-1.5 min-[390px]:space-y-2",
          rangeWrapperClassName: "-my-1 px-1 py-1",
          timeClassName: "flex items-center justify-between px-1 text-[11px] text-white/64"
        }
      ),
      /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex items-center justify-center gap-2.5 max-[390px]:mt-3 min-[390px]:gap-3" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: toggleShuffle,
          className: `${mobileUtilityButtonClass} ${shuffle ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]" : ""}`,
          "aria-label": "Tr\u1ED9n"
        },
        /* @__PURE__ */ React.createElement(FaShuffle, null)
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: playPrev,
          className: mobileUtilityButtonClass,
          "aria-label": "B\xE0i tr\u01B0\u1EDBc"
        },
        /* @__PURE__ */ React.createElement(FaBackwardStep, null)
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: togglePlay,
          className: "relative flex h-[4rem] w-[4rem] items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#9dfabd,#4ad67f_55%,#249956)] text-[1.45rem] text-[#062512] shadow-[0_0_42px_rgba(75,220,126,0.52)] transition active:scale-95 min-[390px]:h-[4.5rem] min-[390px]:w-[4.5rem] min-[390px]:text-[1.65rem]",
          "aria-label": "Ph\xE1t ho\u1EB7c t\u1EA1m d\u1EEBng"
        },
        isPlaying ? /* @__PURE__ */ React.createElement(FaPause, null) : /* @__PURE__ */ React.createElement(FaPlay, { className: "ml-0.5" })
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: playNext,
          className: mobileUtilityButtonClass,
          "aria-label": "B\xE0i ti\u1EBFp"
        },
        /* @__PURE__ */ React.createElement(FaForwardStep, null)
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: toggleRepeatMode,
          className: `${mobileUtilityButtonClass} ${repeatMode !== "off" ? "bg-emerald-400/18 text-emerald-100 shadow-[0_0_22px_rgba(29,185,84,0.18)]" : ""}`,
          "aria-label": "L\u1EB7p l\u1EA1i"
        },
        /* @__PURE__ */ React.createElement("span", { className: "relative inline-flex" }, /* @__PURE__ */ React.createElement(FaRepeat, null), repeatMode === "one" && /* @__PURE__ */ React.createElement("span", { className: "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1db954] text-[10px] font-semibold text-black" }, "1"))
      )),
      /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex items-center justify-center gap-2.5 min-[390px]:mt-4 min-[390px]:gap-3" }, likeButton, /* @__PURE__ */ React.createElement(
        AddToPlaylistButton,
        {
          song: currentSong,
          triggerClassName: "h-10 w-10 bg-white/[0.07] text-white/82 min-[390px]:h-11 min-[390px]:w-11"
        }
      )),
      /* @__PURE__ */ React.createElement("div", { className: "mt-3 flex flex-wrap items-center justify-center gap-1.5 min-[390px]:mt-4 min-[390px]:gap-2" }, /* @__PURE__ */ React.createElement(PlayerEnhancementToolbar, { compact: true, menuPlacement: "top" }))
    )
  );
  const mobileLyricsPanel = /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `${glassPanelClass} flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] p-4`
    },
    /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold text-white" }, "L\u1EDDi b\xE0i h\xE1t"), /* @__PURE__ */ React.createElement("p", { className: "mt-1 text-sm text-white/52" }, "Vu\u1ED1t \u0111\u1EC3 chuy\u1EC3n trang, ch\u1EA1m \u0111\u1EC3 tua")),
    /* @__PURE__ */ React.createElement("div", { className: "mt-4 min-h-0 flex-1 overflow-hidden rounded-[22px] bg-black/16 backdrop-blur-xl" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-full min-h-0 flex-col overflow-hidden px-3 py-3" }, /* @__PURE__ */ React.createElement(
      PlayerDetailLyrics_default,
      {
        currentSong,
        isActive: mobileTab === "lyrics",
        onSeek: doSeek,
        allowManualScroll: true,
        lockHorizontalSwipe: true,
        onTouchLockStart: lockCarouselSwipe,
        onTouchLockEnd: unlockCarouselSwipe
      }
    )))
  );
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `player-detail-shell fixed inset-0 z-[999] h-[100svh] max-h-[100svh] overflow-hidden text-white ${stableClass} ${animateClass}`,
      style: {
        animationDuration: `${ANIM_MS}ms`,
        animationTimingFunction: ANIM_EASE,
        paddingBottom: "env(safe-area-inset-bottom)"
      },
      onAnimationEnd: handleAnimEnd
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-0 bg-black/48 backdrop-blur-[2px]",
        onMouseDown: (e) => {
          if (e.target !== e.currentTarget) return;
          if (backdropReady) handleClose();
        }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 -z-10 overflow-hidden" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "absolute inset-[-12%] scale-110 opacity-[0.7] blur-[120px]",
        style: cover ? {
          backgroundImage: `url(${cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.02) brightness(0.48) contrast(1.01)"
        } : {
          background: "radial-gradient(circle at 30% 20%, rgba(229,162,84,0.14), transparent 35%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.12), transparent 28%), linear-gradient(160deg, rgba(8,10,10,0.96), rgba(4,4,5,0.92))"
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(228,164,90,0.08),transparent_30%),linear-gradient(135deg,rgba(6,8,7,0.68),rgba(2,2,4,0.92))]" }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.48))]" })),
    /* @__PURE__ */ React.createElement("div", { className: "relative z-10 h-full w-full overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex h-full min-h-0 flex-col px-3 pb-3 pt-[calc(env(safe-area-inset-top)+8px)] sm:px-5 sm:pb-5 sm:pt-5 lg:px-7 lg:pt-6" }, /* @__PURE__ */ React.createElement("div", { className: "hidden flex-1 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(290px,330px)] lg:gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(312px,360px)] xl:gap-5 2xl:grid-cols-[minmax(0,1.14fr)_400px]" }, /* @__PURE__ */ React.createElement("div", { className: "min-h-0" }, detailPanel), /* @__PURE__ */ React.createElement("div", { className: "min-h-0" }, sidePanel)), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "flex min-h-0 flex-1 flex-col overflow-hidden pt-1 lg:hidden",
        onTouchStart: handleMobileTouchStart,
        onTouchMove: handleMobileTouchMove,
        onTouchEnd: handleMobileTouchEnd,
        onTouchCancel: resetMobileGesture,
        style: {
          transform: mobileDragOffset ? `translateY(${mobileDragOffset}px)` : void 0,
          opacity: mobileDragOffset > 0 ? Math.max(0.78, 1 - mobileDragOffset / 420) : void 0,
          transition: mobileDragOffset ? "none" : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms cubic-bezier(0.22, 1, 0.36, 1)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "mb-3 flex items-center justify-center pt-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-xl" }, mobileTabs.map((tab) => /* @__PURE__ */ React.createElement(
        "span",
        {
          key: tab.id,
          className: `h-1.5 w-1.5 rounded-full transition-all duration-200 ${mobileTab === tab.id ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.78)]" : "bg-zinc-400/75"}`
        }
      )))),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: carouselRef,
          onScroll: () => {
            if (scrollRafRef.current) return;
            scrollRafRef.current = requestAnimationFrame(() => {
              const el = carouselRef.current;
              if (!el) return;
              const width = el.clientWidth || 1;
              const index = Math.round(el.scrollLeft / width);
              const next = mobileTabs[index]?.id || "now";
              setMobileTab(next);
              scrollRafRef.current = null;
            });
          },
          className: "flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hidden",
          style: {
            overflowX: isCarouselSwipeLocked ? "hidden" : "auto",
            scrollSnapType: isCarouselSwipeLocked ? "none" : void 0
          }
        },
        /* @__PURE__ */ React.createElement("div", { className: "flex min-h-0 w-full min-w-full snap-center overflow-hidden" }, mobileQueuePanel),
        /* @__PURE__ */ React.createElement("div", { className: "flex min-h-0 w-full min-w-full snap-center overflow-hidden" }, mobileNowPanel),
        /* @__PURE__ */ React.createElement("div", { className: "flex min-h-0 w-full min-w-full snap-center overflow-hidden" }, mobileLyricsPanel)
      )
    )))
  );
}
export {
  PlayerDetail as default
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.development.js:
  (**
   * @license React
   * react-dom.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-router/dist/development/chunk-JMJ3UQ3L.mjs:
react-router/dist/development/index.mjs:
  (**
   * react-router v7.11.0
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
