/**
 * Project: NIMORA MD - Paid User Checker
 * Creator: Nimsara
 */

const mongoose = require('mongoose');

// Paid user schema
const paidUserSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    plan: {
        type: String,
        default: 'free',
        enum: ['free', 'basic', 'pro', 'premium']
    },
    expiresAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
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

paidUserSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const PaidUser = mongoose.models.PaidUser || mongoose.model('PaidUser', paidUserSchema);

/**
 * Check if a user is a paid user
 * @param {string} number - Phone number (with or without country code)
 * @returns {Promise<boolean>} - true if paid & active, false otherwise
 */
async function checkPaidUser(number) {
    if (!number) return false;

    const clean = number.replace(/[^0-9]/g, '');

    try {
        const user = await PaidUser.findOne({ number: clean });

        // Default: free plan → treat all as "paid" (no restriction)
        // Change this to `return false` if you want strict paid-only access
        if (!user) return true;

        if (!user.isActive) return false;

        // If has expiry date and expired
        if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
            return false;
        }

        return true;
    } catch (e) {
        console.error('[PAID CHECK] Error:', e.message);
        return true; // fail-open: allow on error
    }
}

/**
 * Add/update a paid user
 */
async function addPaidUser(number, plan = 'basic', days = 30) {
    const clean = number.replace(/[^0-9]/g, '');
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await PaidUser.findOneAndUpdate(
        { number: clean },
        { number: clean, plan, expiresAt, isActive: true, updatedAt: new Date() },
        { upsert: true, new: true }
    );

    return true;
}

/**
 * Remove a paid user
 */
async function removePaidUser(number) {
    const clean = number.replace(/[^0-9]/g, '');
    await PaidUser.deleteOne({ number: clean });
    return true;
}

module.exports = {
    checkPaidUser,
    addPaidUser,
    removePaidUser,
    PaidUser
};
