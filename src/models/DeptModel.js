import mongoose from 'mongoose';
import Counter from './CounterModel.js';

const DepartmentSchema = new mongoose.Schema({
    departmentId: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        nullable: true,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

DepartmentSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'department' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.departmentId = counter.sequence_value;
    }
    next();
});

const Department = mongoose.model('Department', DepartmentSchema);

export default Department;