import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback', // Relative or absolute handled by proxy/env
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, emails, displayName, photos } = profile;
                const email = emails[0].value.toLowerCase();
                const profileImage = photos && photos[0] ? photos[0].value : '';

                // Check if user exists
                let user = await User.findOne({
                    $or: [{ googleId: id }, { email: email }]
                });

                if (user) {
                    // If user exists but no googleId (e.g. registered with email/password), update it
                    if (!user.googleId) {
                        user.googleId = id;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user
                user = new User({
                    googleId: id,
                    email: email,
                    name: displayName,
                    userType: 'candidate', // Default role
                    profileImage: profileImage,
                    isVerified: true // Google emails are verified
                });

                await user.save();
                return done(null, user);
            } catch (error) {
                console.error('Passport Google Strategy Error:', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
