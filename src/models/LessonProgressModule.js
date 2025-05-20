import mongoose from 'mongoose';
import Counter from './CounterModel.js';


const progressLessonModuleSchema = new mongoose.Schema({
    lessonProgressId: {
        type: Number
    },
    enrollmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
    },
    completedTime: {
        type: String,
        default: 0
    },
    isLessonCompleted: {
        type: Boolean,
        default: false
    },
    completedTime: {
        type: String,
        default: 0
    },
    completedAt: {
        type: Date
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        default: ''
    },
    score: {
        type: Number,
        default: 0
    },
});

progressLessonModuleSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'LessonProgress' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        this.lessonProgressId = counter.sequence_value;
    }
    next();
});

const LessonProgress = mongoose.model('LessonProgress', progressLessonModuleSchema);

export default LessonProgress;