import DefaultProvider from './DefaultProvider';
import DefaultDecorator from './DefaultDecorator';

/**
 * @typedef {Object} InVesselConfig
 *
 * @property {Object<string, any>}                                                      [services]
 * @property {Object<string, (ProviderInterface|ProviderInterface#get)>}                [providers]
 * @property {Object<string, Array.<(DecoratorInterface|DecoratorInterface#decorate)>>} [decorators]
 * @property {Object<string, string>}                                                   [aliases]
 * @property {Object<string, boolean>}                                                  [shared]
 * @property {boolean}                                                                  [sharedByDefault]
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
  * Interface for decorators.
  *
  * @interface DecoratorInterface
  */
 /**
  * @function
  * @name DecoratorInterface#decorate
  * @description A function that receives an instance of a service and
  *     performs arbitrary processing before returning the same or another
  *     instance.
  *
  * @param {InVessel} container - Container instance, for retrieving
  *     dependencies only.
  * @param {string} key - Requested key.
  * @param {function} create - Callback that returns the instance to be
  *     decorated.
  */

/**
 * Main interface for registering and retrieving dependencies.
 */
class InVessel {
    /**
     * @param {InVesselConfig} config
     */
    constructor (config) {
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
         * Decorators store.
         *
         * @name InVessel#decorators
         * @type {Map<string, DecoratorInterface>}
         * @protected
         */
        this.decorators = new Map();

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
    configure (config = {}) {
        if (config.services) {
            for (const [key, service] of Object.entries(config.services)) {
                this.assertNoInstanceExists(key);
                this.services.set(key, service);
            }
        }

        if (config.providers) {
            for (const [key, getter] of Object.entries(config.providers)) {
                this.assertNoInstanceExists(key);
                const provider = typeof getter === 'function'
                    ? new DefaultProvider(getter)
                    : getter;
                this.providers.set(key, provider);
            }
        }

        if (config.decorators) {
            for (const [key, decorators] of Object.entries(config.decorators)) {
                const storedDecorators = this.decorators.get(key) || [];
                const concatDecorators = [];

                for (const decorator of decorators.values()) {
                    const d = typeof decorator === 'function'
                        ? new DefaultDecorator(decorator)
                        : decorator;
                    concatDecorators.push(d);
                }

                this.decorators.set(key, storedDecorators.concat(concatDecorators));
            }
        }

        if (config.aliases) {
            this.configureAliases(config.aliases);
        } else if (!this.configured && this.aliases.size > 0) {
            this.resolveAliases(this.aliases);
        }

        if (config.shared) {
            for (const [key, flag] of Object.entries(config.shared)) {
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
    get (key) {
        const requestedKey = key;

        if (this.services.has(requestedKey)) {
            return this.services.get(requestedKey);
        }

        key = this.resolvedAliases.has(key) ? this.resolvedAliases.get(key) : key;
        const isAlias = requestedKey !== key;

        const isKeyShared = this.shared.has(key)
            ? this.shared.get(key)
            : this.sharedByDefault;

        const isRequestedKeyShared = this.shared.has(requestedKey)
            ? this.shared.get(requestedKey)
            : this.sharedByDefault;

        if (isAlias && isRequestedKeyShared && this.services.has(key)) {
            const service = this.services.get(key);
            this.services.set(requestedKey, service);
            return service;
        }

        let instance;
        if (this.providers.has(key)) {
            const provider = this.providers.get(key);
            let create = () => provider.get(this);

            if (this.decorators.has(key)) {
                const decorators = this.decorators.get(key);
                for (const decorator of decorators.values()) {
                    const prevCreate = create;
                    create = () => decorator.decorate(this, key, prevCreate);
                }
            }

            instance = create();
        } else {
            throw Error(`Entry '${key}' not found.`);
        }

        if (isKeyShared) {
            this.services.set(key, instance);
        }

        if (isAlias && isRequestedKeyShared) {
            this.services.set(requestedKey, instance);
        }

        return instance;
    }

    /**
     * Check for the existence of an entry under the given key. Returns true
     * if found, false otherwise.
     *
     * @param {string} key - Key of the entry to query for.
     *
     * @returns {boolean}
     */
    has (key) {
        key = this.resolvedAliases.has(key) ? this.resolvedAliases.get(key) : key;
        let found = this.services.has(key) || this.providers.has(key);

        return found;
    }

    /**
     * Creates a function whose call is equivalent to calling the container's
     * 'get' method with the provided key.
     *
     * @param {string} key - Key of the entry which the factory will produce.
     */
    factory (key) {
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
    service (key, instance) {
        this.configure({ services: { [key]: instance } });
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
    provider (key, provider) {
        this.configure({ providers: { [key]: provider } });
    }

    decorator (key, decorator) {
        this.configure({ decorators: { [key]: [decorator] } });
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
    alias (alias, target) {
        this.configure({ aliases: { [alias]: target } });
    }

    /**
     * Sets a flag indicating the caching behavior for the given entry. Using
     * an alias will not affect the key it resolves to. This configuration
     * has no effect on services.
     *
     * @param {string} key - Entry key.
     * @param {boolean} flag - Whether the entry should be shared.
     */
    setShared (key, flag) {
        this.configure({ shared: { [key]: flag } });
    }

    /**
     * Returns the default entry caching behavior.
     *
     * @returns {boolean}
     */
    getSharedByDefault () {
        return this.sharedByDefault;
    }

    /**
     * Sets a flag indicating the default entry caching behavior.
     *
     * @param {boolean} flag - Whether entries should be shared.
     */
    setSharedByDefault (flag) {
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
    assertNoInstanceExists (key) {
        if (this.services.has(key)) {
            throw new Error(`An instance for entry '${key}' already exists.`);
        }
    }

    /**
     * @param {Object<string, string>} aliases
     *
     * @protected
     */
    configureAliases (aliases) {
        const entries = Object.entries(aliases);

        if (!this.configured) {
            for (const [alias, target] of entries) {
                this.assertNoInstanceExists(alias);
                this.aliases.set(alias, target);
            }

            this.resolveAliases(this.aliases);
            return;
        }

        let intersecting = false;
        for (const [k] in entries) {
            if (k in aliases) {
                intersecting = true;
                break;
            }
        }

        for (const [alias, target] of entries) {
            this.assertNoInstanceExists(alias);
            this.aliases.set(alias, target);
        }

        if (intersecting) {
            this.resolveAliases(this.aliases);
            return;
        }

        this.resolveAliases(aliases);

        for (const [alias, target] of this.resolvedAliases.entries()) {
            if (target in aliases) {
                this.resolvedAliases.set(alias, this.resolvedAliases.get(target));
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
    resolveAliases (aliases) {
        const keys = aliases instanceof Map
            ? aliases.keys()
            : Object.keys(aliases);

        for (const alias of keys) {
            const visited = new Map();
            let name = alias;

            while (this.aliases.has(name)) {
                if (visited.has(name)) {
                    throw new Error(`Cyclic alias '${name}'.`);
                }

                visited.set(name, true);
                name = this.aliases.get(name);
            }

            this.resolvedAliases.set(alias, name);
        }
    }
}

export default InVessel;
