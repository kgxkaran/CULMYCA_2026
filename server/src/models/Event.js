import mongoose, {Schema} from 'mongoose';

const eventSchema = new Schema(
    {
        title : {
            type : String,
            required: [true, 'Event title is required'],
            trim : true,
        },
        description : {
            type: String,
            required: [true, 'Description is required'],
        },
        category : {
            type : String,
            required : true,
            enum : ['cultural', 'technical', 'gaming', 'art'],
        },
        date : {
            type : Date,
            required : [true, 'Event date is required'],
        },
        time : {
            type: String,
            required: [true, 'Event time is required'],
        },
        venue : {
            type: String,
            required: [true, 'Venue is required'],
        },
        teamSizeMin : {
            type: Number,
            default: 1,
        },
        teamSizeMax : {
            type: Number,
            default: 1,
        },
        totalSlots : {
            type: Number,
            required: [true, 'Total slots required'],
        },
        registeredCount : {
            type: Number,
            default: 0,
        },
        prizes : {
            first : {type : String},
            second : {type : String},
            third : {type : String}
        },
        rules : [String],
        poster : {
            type : String,
        },
        createdBy : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isActive: {
            type : Boolean,
            default : true,
        },
        },
        {timestamp : true},
);

const Event =  mongoose.model('Event' , eventSchema);
export default Event;