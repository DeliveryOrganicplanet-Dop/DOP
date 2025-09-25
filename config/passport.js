const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const usuarioModel = require('../app/models/usuarioModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Verificar se usuário já existe
        const existingUser = await usuarioModel.findByEmail(profile.emails[0].value);
        
        if (existingUser) {
            return done(null, existingUser);
        }
        
        // Criar novo usuário
        const newUser = {
            nome_usuario: profile.displayName,
            email_usuario: profile.emails[0].value,
            senha_usuario: null, // Usuário OAuth não precisa de senha
            google_id: profile.id,
            celular_usuario: '',
            cpf_usuario: ''
        };
        
        const userId = await usuarioModel.createGoogleUser(newUser);
        const user = await usuarioModel.findById(userId);
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usuarioModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;