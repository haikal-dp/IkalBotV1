
// Handle 404
const error404 = (req, res) => {
    res.status(404).render('error/404');
};

// Error handler
const error500 = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error/500');
};
const error403 = (err, req, res, next) => {
    console.error(err.stack);
    res.status(403).render('error/403');
};

module.exports = {
    error404,
    error500,
    error403,
};