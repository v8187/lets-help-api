import { model, Schema } from 'mongoose';

const IncrementSchema = new Schema({
    incrId: { type: String, required: true },
    srNo: { type: Number, default: 2 }
},
    { collection: 'Increment' }
);

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
IncrementSchema.statics.tempAll = function () {
    return this.find().select().exec();
};

IncrementSchema.statics.getSrNo = function (incrId) {
    return this.findOneAndUpdate(
        { incrId },
        { $inc: { srNo: 2 } },
        { upsert: true, new: true }
    ).exec();
};

export const IncrementModel = model('Increment', IncrementSchema);