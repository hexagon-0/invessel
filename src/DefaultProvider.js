/**
 * Simple factory-wrapping provider.
 * 
 * @class
 * @implements {ProviderInterface}
 */
class DefaultProvider {
    /**
     * @param {Factory} factory - Factory to assign the get method to.
     */
    constructor (factory) {
        this.get = factory.bind(this);
    }
}

export default DefaultProvider;
