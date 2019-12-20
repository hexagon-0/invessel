/**
 * Simple provider. Serves as a wrapper for dependency-getter functions.
 *
 * @class
 * @implements {ProviderInterface}
 */
class DefaultProvider {
    /**
     * @param {ProviderInterface#get} getter - Function to be used as 'get' method.
     */
    constructor (getter) {
        this.get = getter.bind(this);
    }
}

export default DefaultProvider;
