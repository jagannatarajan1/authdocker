const mongoose = require('mongoose');
const { default: Counter } = require('./CounterModel');

const courseCriteriaSchema = new mongoose.Schema({
    courseCriteriaId: {
        type: Number,
        unique: true
    },
    courseId: {
        type: Number,
        ref: 'Course',
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    location: {
        type: Array,
        required: true
    },
    department: {
        type: Array,
        required: true
    },
    group: {
        type: Array,
        required: true
    },
    center: {
        type: Array,
        required: true
    },
    designation: {
        type: Array,
        required: true
    },
    branch: {
        type: Array,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});

courseCriteriaSchema.pre('save', async function(next) {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { model: 'CourseCriterias' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );
        this.courseCriteriaId = counter.sequence_value;
    }
    next();
});

const CourseCriteria = mongoose.model('courseCriteria', courseCriteriaSchema);

module.exports = CourseCriteria;