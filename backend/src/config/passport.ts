// Author: Denys(Ezpectus)
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ENV } from './env';
import { authService } from '../services/auth.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email from Google'), undefined);
        }

        const result = await authService.googleAuth(
          profile.id,
          email,
          profile.displayName,
          profile.photos?.[0]?.value
        );

        return done(null, result);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;