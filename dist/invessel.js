(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.InVessel = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  /**
   * Simple provider. Serves as a wrapper for dependency-getter functions.
   *
   * @class
   * @implements {ProviderInterface}
   */
  var DefaultProvider =
  /**
   * @param {ProviderInterface#get} getter - Function to be used as 'get' method.
   */
  function DefaultProvider(getter) {
    _classCallCheck(this, DefaultProvider);

    this.get = getter.bind(this);
  };

  /**
   * @typedef {Object} InVesselConfig
   *
   * @property {Object<string, any>}                                          [services]
   * @property {Object<string, (ProviderInterface|ProviderInterface#get)>}    [providers]
   * @property {Object<string, string>}                                       [aliases]
   * @property {Object<string, boolean>}                                      [shared]
   * @property {boolean}                                                      [sharedByDefault]
   */

  /**
   * Interface for service providers.
   *
   * @interface ProviderInterface
   */

  /**
   * @function
   * @name ProviderInterface#get
   * @description A function that instantiates a service when called. It
   *      is responsible for retrieving and injecting dependencies into the
   *      service instance. It should be a pure function.
   *
   * @param {InVessel} container - Container instance, for retrieving
   *     dependencies only.
   * @returns {any}
   */

  /**
   * Main interface for registering and retrieving dependencies.
   */

  var InVessel =
  /*#__PURE__*/
  function () {
    /**
     * @param {InVesselConfig} config
     */
    function InVessel(config) {
      _classCallCheck(this, InVessel);

      /**
       * Services store. The container must not perform any operations on
       * values stored here.
       *
       * @name InVessel#services
       * @type {Map<string, any>}
       * @protected
       */
      this.services = new Map();
      /**
       * Aliases store. Pairs are stored here exactly as registered.
       *
       * @name InVessel#aliases
       * @type {Map<string, string>}
       * @protected
       */

      this.aliases = new Map();
      /**
       * Resolved aliases store. Maps aliases to keys that directly resolve
       * to services (final keys).
       *
       * @name InVessel#resolvedAliases
       * @type {Map<string, string>}
       * @protected
       */

      this.resolvedAliases = new Map();
      /**
       * Service providers store.
       *
       * @name InVessel#providers
       * @type {Map<string, ProviderInterface>}
       * @protected
       */

      this.providers = new Map();
      /**
       * Whether to assume entries are to be shared. Defaults to true.
       *
       * @name InVessel#sharedByDefault
       * @type {boolean}
       * @default true
       * @protected
       *
       * @see {@link InVessel#shared} for info on shared entries.
       */

      this.sharedByDefault = true;
      /**
       * Map of `key: flag` pairs. If flag is true, entry with given key will
       * be stored when first requested. Later requests will be served the
       * stored instance. Overrides {@link InVessel#sharedByDefault}.
       *
       * @name InVessel#shared
       * @type {Map<string, boolean>}
       * @protected
       */

      this.shared = new Map();
      /**
       * Whether the {@link InVessel#configure} method has been called.
       *
       * @name InVessel#configured
       * @type {boolean}
       * @protected
       */

      this.configured = false;
      this.configure(config);
    }
    /**
     * @param {InVesselConfig} [config]
     */


    _createClass(InVessel, [{
      key: "configure",
      value: function configure() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (config.services) {
          for (var _i = 0, _Object$entries = Object.entries(config.services); _i < _Object$entries.length; _i++) {
            var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
                key = _Object$entries$_i[0],
                service = _Object$entries$_i[1];

            this.assertNoInstanceExists(key);
            this.services.set(key, service);
          }
        }

        if (config.providers) {
          for (var _i2 = 0, _Object$entries2 = Object.entries(config.providers); _i2 < _Object$entries2.length; _i2++) {
            var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
                key = _Object$entries2$_i[0],
                getter = _Object$entries2$_i[1];

            this.assertNoInstanceExists(key);
            var provider = typeof getter === 'function' ? new DefaultProvider(getter) : getter;
            this.providers.set(key, provider);
          }
        }

        if (config.aliases) {
          this.configureAliases(config.aliases);
        } else if (!this.configured && this.aliases.size > 0) {
          this.resolveAliases(this.aliases);
        }

        if (config.shared) {
          for (var _i3 = 0, _Object$entries3 = Object.entries(config.shared); _i3 < _Object$entries3.length; _i3++) {
            var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
                key = _Object$entries3$_i[0],
                flag = _Object$entries3$_i[1];

            this.shared.set(key, flag);
          }
        }

        if (typeof config.sharedByDefault !== "undefined") {
          this.sharedByDefault = config.sharedByDefault;
        }

        this.configured = true;
      }
      /**
       * Retrieves an entry from the container.
       *
       * @param {string} key - Key of the entry to retrieve.
       *
       * @returns {any}
       */

    }, {
      key: "get",
      value: function get(key) {
        var requestedKey = key;

        if (this.services.has(requestedKey)) {
          return this.services.get(requestedKey);
        }

        key = this.resolvedAliases.has(key) ? this.resolvedAliases.get(key) : key;
        var isAlias = requestedKey !== key;
        var isKeyShared = this.shared.has(key) ? this.shared.get(key) : this.sharedByDefault;
        var isRequestedKeyShared = this.shared.has(requestedKey) ? this.shared.get(requestedKey) : this.sharedByDefault;

        if (isAlias && isRequestedKeyShared && this.services.has(key)) {
          var service = this.services.get(key);
          this.services.set(requestedKey, service);
          return service;
        }

        if (this.providers.has(key)) {
          var provider = this.providers.get(key);
          var instance = provider.get(this);

          if (isKeyShared) {
            this.services.set(key, instance);
          }

          if (isAlias && isRequestedKeyShared) {
            this.services.set(requestedKey, instance);
          }

          return instance;
        }

        throw Error("Entry '".concat(key, "' not found."));
      }
      /**
       * Check for the existence of an entry under the given key. Returns true
       * if found, false otherwise.
       *
       * @param {string} key - Key of the entry to query for.
       *
       * @returns {boolean}
       */

    }, {
      key: "has",
      value: function has(key) {
        key = this.resolvedAliases.has(key) ? this.resolvedAliases.get(key) : key;
        var found = this.services.has(key) || this.providers.has(key);
        return found;
      }
      /**
       * Creates a function whose call is equivalent to calling the container's
       * 'get' method with the provided key.
       *
       * @param {string} key - Key of the entry which the factory will produce.
       */

    }, {
      key: "factory",
      value: function factory(key) {
        return this.get.bind(this, key);
      }
      /**
       * Registers a service in the container. When retrieved, the exact same
       * instance will be returned. The service can be any value that needs to
       * be retrieved as-stored.
       *
       * @param {string} key - Key of the service for retrieval.
       * @param {any} instance - Value to be stored under this service.
       *
       * @returns {void}
       */

    }, {
      key: "service",
      value: function service(key, instance) {
        this.configure({
          services: _defineProperty({}, key, instance)
        });
      }
      /**
       * Registers a provider for the service in the container under given key.
       * When retrieved, the provider's 'get' method return value will be
       * served. A function can be passed in instead, in which case a
       * {@link DefaultProvider} wrapping the function will be registered.
       *
       * @param {string} key - Entry key.
       * @param {ProviderInterface|ProviderInterface#get} provider - Object or function
       *      that will produce the service.
       */

    }, {
      key: "provider",
      value: function provider(key, _provider) {
        this.configure({
          providers: _defineProperty({}, key, _provider)
        });
      }
      /**
       * Defines a key that will resolve to a service registered under the
       * target key.
       *
       * @param {string} alias
       * @param {string} target
       *
       * @todo Add alias resolution.
       */

    }, {
      key: "alias",
      value: function alias(_alias, target) {
        this.configure({
          aliases: _defineProperty({}, _alias, target)
        });
      }
      /**
       * Sets a flag indicating the caching behavior for the given entry. Using
       * an alias will not affect the key it resolves to. This configuration
       * has no effect on services.
       *
       * @param {string} key - Entry key.
       * @param {boolean} flag - Whether the entry should be shared.
       */

    }, {
      key: "setShared",
      value: function setShared(key, flag) {
        this.configure({
          shared: _defineProperty({}, key, flag)
        });
      }
      /**
       * Returns the default entry caching behavior.
       *
       * @returns {boolean}
       */

    }, {
      key: "getSharedByDefault",
      value: function getSharedByDefault() {
        return this.sharedByDefault;
      }
      /**
       * Sets a flag indicating the default entry caching behavior.
       *
       * @param {boolean} flag - Whether entries should be shared.
       */

    }, {
      key: "setSharedByDefault",
      value: function setSharedByDefault(flag) {
        this.sharedByDefault = flag;
      }
      /**
       * Asserts no instance of the entry with given key exists. This always
       * fails for entries registered through the service method. For those
       * registered with the 'provider' method, it fails if the entry is shared
       * and has been requested at least once (which means it was cached).
       *
       * @param {string} key - Key of the entry to check.
       *
       * @protected
       *
       * @throws {Error} if the service exists.
       */

    }, {
      key: "assertNoInstanceExists",
      value: function assertNoInstanceExists(key) {
        if (this.services.has(key)) {
          throw new Error("An instance for entry '".concat(key, "' already exists."));
        }
      }
      /**
       * @param {Object<string, string>} aliases
       *
       * @protected
       */

    }, {
      key: "configureAliases",
      value: function configureAliases(aliases) {
        var entries = Object.entries(aliases);

        if (!this.configured) {
          for (var _i4 = 0, _entries = entries; _i4 < _entries.length; _i4++) {
            var _entries$_i = _slicedToArray(_entries[_i4], 2),
                alias = _entries$_i[0],
                target = _entries$_i[1];

            this.assertNoInstanceExists(alias);
            this.aliases.set(alias, target);
          }

          this.resolveAliases(this.aliases);
          return;
        }

        var intersecting = false;

        for (var _ref in entries) {
          var _ref2 = _slicedToArray(_ref, 1);

          var k = _ref2[0];

          if (k in aliases) {
            intersecting = true;
            break;
          }
        }

        for (var _i5 = 0, _entries2 = entries; _i5 < _entries2.length; _i5++) {
          var _entries2$_i = _slicedToArray(_entries2[_i5], 2),
              alias = _entries2$_i[0],
              target = _entries2$_i[1];

          this.assertNoInstanceExists(alias);
          this.aliases.set(alias, target);
        }

        if (intersecting) {
          this.resolveAliases(this.aliases);
          return;
        }

        this.resolveAliases(aliases);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.resolvedAliases.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2),
                alias = _step$value[0],
                target = _step$value[1];

            if (target in aliases) {
              this.resolvedAliases.set(alias, this.resolvedAliases.get(target));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      /**
       * Populates {@link InVessel#resolvedAliases} with `alias: finalKey`
       * pairs. Aliases from the argument are mapped to final keys on
       * {@link InVessel#aliases}.
       *
       * @param {(Object<string, string>|Map<string, string>)} aliases
       *
       * @protected
       */

    }, {
      key: "resolveAliases",
      value: function resolveAliases(aliases) {
        var keys = aliases instanceof Map ? aliases.keys() : Object.keys(aliases);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var alias = _step2.value;
            var visited = new Map();
            var name = alias;

            while (this.aliases.has(name)) {
              if (visited.has(name)) {
                throw new Error("Cyclic alias '".concat(name, "'."));
              }

              visited.set(name, true);
              name = this.aliases.get(name);
            }

            this.resolvedAliases.set(alias, name);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }]);

    return InVessel;
  }();

  return InVessel;

}));
