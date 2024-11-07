const {express,secret,ceklogin,HarusLogin,path,app,fs} = require('./setting/modul');
const {error404,error403,error500}  = require('./function/page/error');
const db = require('./setting/db');
const {awal,tes,logout,lobby,pdaftar,plogin,daftar} = require('./function/page/pengguna ');
const {flipc,tebakangka,ptebakangka} = require('./function/page/game');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(secret)
app.get('/tes',tes);

//Get
app.get('/', HarusLogin,awal);
app.get('/lobby', HarusLogin,lobby)
app.get('/daftar', daftar );
app.get('/flip-coin',ceklogin, flipc)
app.get('/tebakangka',ceklogin,tebakangka);
//post
app.post('/daftar', pdaftar);
app.post('/login', plogin);
app.post('/tebakangka/play', ceklogin,ptebakangka);





app.get('/logout',logout);



app.use(error403);
app.use(error404);
app.use(error500);
// Start server
const PORT = process.env.PORT || 7070;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});