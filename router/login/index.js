var express = require('express')
var app = express()
var router = express.Router();
var path = require('path') // 상대경로
var mysql = require('mysql')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

// database setting
var connection = mysql.createConnection({
    host: 'localhost',
    port : 3306,
    user: 'root',
    password : '2016104101',
    database : 'userDB'
})
connection.connect();

router.get('/', function(req, res){
    var msg;
    var errMsg = req.flash('error')
    if(errMsg) msg = errMsg;
    res.render('login.ejs', {'message' : msg});
})

passport.serializeUser(function(user, done){
    console.log('passport session save: '+ user.ID)
    done(null, user.ID)
});
passport.deserializeUser(function(ID, done){
    console.log('passport session get ID: '+ ID)
    done(null, ID); // 세션에서 값을 뽑아서 페이지에 전달하는 역할
})

passport.use('local-login', new LocalStrategy({
        usernameField: 'ID',
        passwordField: 'password',
        passReqToCallback: true
     }, function(req, ID, password, done){
            var query = connection.query('select * from userDB where ID=?', [ID], function(err, rows){
            if(err) return done(err);
            
            if(rows.length){ // database에 입력한 ID값이 있는가?
                if(password == rows[0].password){ // 비밀번호와 확인이 같은가?
                    console.log("알림: "+ID+" 유저 로그인")
                    return done(null, {'ID' : ID});
                }
                else{
                    console.log("알림: 잘못된 비밀번호입니다.")
                    return done(null, false, {message : '잘못된 비밀번호입니다.'})
                }
            }
            else{
                console.log("알림: ID를 찾을 수 없습니다.")
                return done(null, false, {message : 'ID를 찾을 수 없습니다.'})
            }
        })
    }
));

router.post('/', passport.authenticate('local-login', {
    successRedirect: '/main',
    failureRedirect: '/login',
    failureFlash: true
}))

module.exports = router;