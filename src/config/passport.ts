import passport, { Profile } from "passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import config from ".";
import { User } from "../modules/user/user.model";

passport.use(
  new Strategy(
    {
      clientID: config.google.clientId as string,
      clientSecret: config.google.clientSecret as string,
      callbackURL: config.google.callbackURL as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(null, false, { message: "Email not found" });
        }

        const user = await User.findOne({ email });
        if (user) {
          return done(null, user, { message: "User already exists" });
        }

        const newUser = await User.create({
          email,
          firstName: profile.displayName,
          lastName: profile.displayName,
          image: profile.photos?.[0].value,
          role: "user",
          isVerified: true,
          auths: [{ provider: "google", providerId: profile.id }],
        });
        return done(null, newUser, { message: "User created successfully" });
      } catch (error) {
        console.log("google strategy error", error);
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log("deserializeUser error", error);
    done(error);
  }
});
