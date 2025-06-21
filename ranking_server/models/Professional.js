const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  expertise: Number,
  clarity: Number,
  communication: Number,
  mentorship: Number,
}, { _id: false });

const ProfessionalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  ratings: {
    type: [RatingSchema],
    default: []
  },
  rating_breakdown: {
    expertise: {
      type: [Number],
      default: []
    },
    clarity: {
      type: [Number],
      default: []
    },
    communication: {
      type: [Number],
      default: []
    },
    mentorship: {
      type: [Number],
      default: []
    }
  },
  overall_score: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Professional', ProfessionalSchema);
