import mongoose from 'mongoose';

export class EnumArray extends mongoose.SchemaType {

    constructor(path, options, instance) {
        super(path, options, instance);

        // this.options = options || {};
        // this.path = path || '';
    }

    cast(values, options) {
        //  Ignore validations for query
        if (options.op === 'find') {
            return values;
        }

        if (!Array.isArray(values) || !values.length) {
            throw new Error(`Input must be array with atleast 1 element in it.`);
        }

        const enums = this.options.enum;

        // If list of allowed values is given in Schema definition
        if (!(enums && Array.isArray(enums) && enums.length)) {
            throw new Error(`EnumArray: enum must be declared with valid values.`);
        }

        // If given values are valid values based on enum
        if (values.every(val => enums.indexOf(val) !== -1)) {
            return values;
        } else {
            throw new Error(`Invalid value(s). Only values from [${enums.join(', ')}] can be set for ${this.path}.`);
        }
    }
}