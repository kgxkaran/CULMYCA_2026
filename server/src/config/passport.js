import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

console.log("Client ID checking:", process.env.GOOGLE_CLIENT_ID);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check karo — kya yeh Google ID pehle se registered hai?
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Pehle se registered hai — directly return karo
          return done(null, user);
        }

        // Naya user hai — pehle email se check karo
        // (ho sakta hai usne pehle email/password se register kiya ho)
        user = await User.findOne({ 
          email: profile.emails[0].value 
        });

        if (user) {
          // Email already exists — Google ID attach kar do
          user.googleId = profile.id;
          user.avatar = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Bilkul naya user — create karo
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0].value,
          isVerified: true, // Google ne verify kar diya
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;