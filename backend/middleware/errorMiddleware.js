/**
 * @desc  API Route not found error handler (404)
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * @desc  Common Error Handler Middleware
 * @param {Error} err - Error object passed by next(error)
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    // যদি স্ট্যাটাস কোড 200 থাকে, তাহলে তাকে 500 (Internal Server Error) করে দেওয়া হয়।
    // অথবা যা সেট করা হয়েছে তা ব্যবহার করা হয়।
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.message,
        // যদি পরিবেশ Production না হয়, তবে স্ট্যাক ট্রেস পাঠানো হয়
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };