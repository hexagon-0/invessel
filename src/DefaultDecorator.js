/**
 * Simple decorator. Serves as a wrapper for decorator functions.
 * 
 * @class
 * @implements {DecoratorInterface}
 */
class DefaultDecorator {
    /**
     * @param {DecoratorInterface#decorate} decorate - Function to be used as
     *      'decorate' method.
     */
    constructor (decorate) {
        this.decorate = decorate.bind(this);
    }
}

export default DefaultDecorator;
