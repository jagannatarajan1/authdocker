import mongoose from 'mongoose';
import Counter from './CounterModel.js';


const moduleSchema = new mongoose.Schema({
    moduleId: {
        type: Number
    },
    title: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});




moduleSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'course' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.courseId = counter.sequence_value;
    }
    next();
});

const Module = mongoose.model('Module', moduleSchema);

export default Module;