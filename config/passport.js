const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const usuarioModel = require('../app/models/usuarioModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google OAuth - Perfil:', profile.displayName, profile.emails[0].value);
        
        const existingUser = await usuarioModel.findByEmail(profile.emails[0].value);
        
        if (existingUser) {
            console.log('Usuário existente:', existingUser.EMAIL_USUARIO);
            return done(null, existingUser);
        }
        
        console.log('Criando novo usuário...');
        const newUser = {
            nome_usuario: profile.displayName,
            email_usuario: profile.emails[0].value,
            google_id: profile.id
        };
        
        const userId = await usuarioModel.createGoogleUser(newUser);
        const user = await usuarioModel.findById(userId);
        
        console.log('Usuário criado:', user.EMAIL_USUARIO);
        return done(null, user);
    } catch (error) {
        console.error('Erro OAuth:', error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.ID_USUARIO);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usuarioModel.findById(id);
        done(null, user);
    } catch (error) {
        console.error('Erro deserialize:', error);
        done(error, null);
    }
});

module.exports = passport;